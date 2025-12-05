"""
AI Orchestrator Service v3.0
FastAPI application with REST and WebSocket endpoints for NLP command processing
"""

import logging
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.schemas import (
    CommandRequest, CommandResponse, HealthStatus, NLPAnalysis,
    ConversationContext, WebSocketMessage, Suggestion
)
from nlp.interpreter import NLPInterpreter
from routers.command_router import CommandRouter
from services.context_manager import ContextManager
from services.response_generator import ResponseGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
nlp_interpreter: Optional[NLPInterpreter] = None
command_router: Optional[CommandRouter] = None
context_manager: Optional[ContextManager] = None
response_generator: Optional[ResponseGenerator] = None
websocket_connections: Dict[str, WebSocket] = {}
app_start_time = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global nlp_interpreter, command_router, context_manager, response_generator, app_start_time
    
    # Startup
    logger.info("=== AI Orchestrator v3.0 Starting ===")
    app_start_time = datetime.utcnow()
    
    try:
        # Initialize NLP interpreter
        nlp_interpreter = NLPInterpreter()
        logger.info("✓ NLP Interpreter initialized")
        
        # Initialize command router
        command_router = CommandRouter(
            graphql_url="http://localhost:4000/graphql",
            aiops_url="http://localhost:8100/api/v3/aiops",
            cmdb_url="http://localhost:8200/api/v3/cmdb"
        )
        logger.info("✓ Command Router initialized")
        
        # Initialize context manager
        context_manager = ContextManager(
            max_history=50,
            session_timeout_minutes=30
        )
        logger.info("✓ Context Manager initialized")
        
        # Initialize response generator
        response_generator = ResponseGenerator()
        logger.info("✓ Response Generator initialized")
        
        logger.info("=== AI Orchestrator v3.0 Ready ===")
        
        yield
        
    finally:
        # Shutdown
        logger.info("=== AI Orchestrator v3.0 Shutting Down ===")
        
        if command_router:
            await command_router.close()
            logger.info("✓ Command Router closed")
        
        # Close all WebSocket connections
        for connection_id, ws in list(websocket_connections.items()):
            try:
                await ws.close()
            except:
                pass
        websocket_connections.clear()
        logger.info("✓ WebSocket connections closed")
        
        logger.info("=== AI Orchestrator v3.0 Stopped ===")


# Create FastAPI app
app = FastAPI(
    title="AI Orchestrator v3.0",
    description="Natural Language Processing for Infrastructure Management",
    version="3.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== REST API Endpoints ====================

@app.get("/")
async def root():
    """Service information and endpoints"""
    return {
        "service": "AI Orchestrator v3.0",
        "description": "Natural Language Processing for Infrastructure Management",
        "version": "3.0.0",
        "endpoints": {
            "rest": {
                "health": "GET /api/v3/orchestrator/health",
                "command": "POST /api/v3/orchestrator/command",
                "analyze": "POST /api/v3/orchestrator/analyze",
                "help": "GET /api/v3/orchestrator/help",
                "suggestions": "GET /api/v3/orchestrator/suggestions",
                "sessions": "GET /api/v3/orchestrator/sessions",
                "session_history": "GET /api/v3/orchestrator/sessions/{session_id}/history",
                "export_session": "GET /api/v3/orchestrator/sessions/{session_id}/export"
            },
            "websocket": {
                "chat": "WS /api/v3/orchestrator/ws/chat"
            }
        },
        "features": [
            "Natural Language Command Processing",
            "Intent Classification & Entity Extraction",
            "Service Routing (GraphQL, AIOps, CMDB)",
            "Conversation Context Management",
            "Real-time WebSocket Chat",
            "Multi-session Support"
        ]
    }


@app.get("/api/v3/orchestrator/health")
async def health_check():
    """Health check with backend service status"""
    uptime = (datetime.utcnow() - app_start_time).total_seconds() if app_start_time else 0
    
    # Check backend services
    services = {}
    
    # Check GraphQL API
    try:
        response = await command_router.client.get(
            "http://localhost:4000/health",
            timeout=2.0
        )
        services["graphql"] = {
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "url": "http://localhost:4000"
        }
    except Exception as e:
        services["graphql"] = {
            "status": "unreachable",
            "error": str(e)
        }
    
    # Check AIOps Engine
    try:
        response = await command_router.client.get(
            "http://localhost:8100/api/v3/aiops/health",
            timeout=2.0
        )
        services["aiops"] = {
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "url": "http://localhost:8100"
        }
    except Exception as e:
        services["aiops"] = {
            "status": "unreachable",
            "error": str(e)
        }
    
    # Check CMDB Agent
    try:
        response = await command_router.client.get(
            "http://localhost:8200/api/v3/cmdb/health",
            timeout=2.0
        )
        services["cmdb"] = {
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "url": "http://localhost:8200"
        }
    except Exception as e:
        services["cmdb"] = {
            "status": "unreachable",
            "error": str(e)
        }
    
    # Overall status
    healthy_count = sum(1 for s in services.values() if s.get("status") == "healthy")
    total_count = len(services)
    
    if healthy_count == total_count:
        status = "healthy"
    elif healthy_count > 0:
        status = "degraded"
    else:
        status = "unhealthy"
    
    return HealthStatus(
        status=status,
        uptime_seconds=uptime,
        services=services
    )


@app.post("/api/v3/orchestrator/command", response_model=CommandResponse)
async def process_command(request: CommandRequest):
    """Process natural language command"""
    start_time = time.time()
    
    try:
        # Get or create session
        session_id = request.session_id or str(uuid.uuid4())
        context_manager.get_or_create_session(session_id, request.user_id)
        
        # Add user message to history
        context_manager.add_message(
            session_id=session_id,
            role="user",
            content=request.command
        )
        
        # Analyze command with NLP
        analysis = await nlp_interpreter.analyze(request)
        logger.info(f"Command analyzed: {analysis.primary_intent.type}")
        
        # Route command to appropriate service
        service_response = await command_router.route_command(analysis.primary_intent)
        
        # Generate user-friendly response
        execution_time = (time.time() - start_time) * 1000
        response = response_generator.generate_response(
            intent=analysis.primary_intent,
            service_response=service_response,
            execution_time_ms=execution_time
        )
        
        # Add assistant message to history
        context_manager.add_message(
            session_id=session_id,
            role="assistant",
            content=response.message,
            intent=analysis.primary_intent
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing command: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v3/orchestrator/analyze", response_model=NLPAnalysis)
async def analyze_command(request: CommandRequest):
    """Analyze command without executing (for testing/debugging)"""
    try:
        analysis = await nlp_interpreter.analyze(request)
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing command: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v3/orchestrator/help")
async def get_help():
    """Get help text with example commands"""
    help_text = nlp_interpreter.get_help_text()
    return {
        "help": help_text,
        "categories": list(help_text.keys()),
        "total_examples": sum(len(examples) for examples in help_text.values())
    }


@app.get("/api/v3/orchestrator/suggestions")
async def get_suggestions(category: Optional[str] = None):
    """Get command suggestions"""
    help_text = nlp_interpreter.get_help_text()
    
    if category and category in help_text:
        return {
            "category": category,
            "suggestions": [
                Suggestion(
                    command=cmd,
                    description=f"Example {category} command",
                    category=category,
                    example=cmd
                )
                for cmd in help_text[category]
            ]
        }
    
    # Return all suggestions
    all_suggestions = []
    for cat, commands in help_text.items():
        for cmd in commands:
            all_suggestions.append(
                Suggestion(
                    command=cmd,
                    description=f"Example {cat} command",
                    category=cat,
                    example=cmd
                )
            )
    
    return {
        "suggestions": all_suggestions,
        "total": len(all_suggestions)
    }


@app.get("/api/v3/orchestrator/sessions")
async def list_sessions():
    """List active sessions"""
    sessions = context_manager.get_active_sessions()
    return {
        "active_sessions": sessions,
        "count": len(sessions)
    }


@app.get("/api/v3/orchestrator/sessions/{session_id}/history")
async def get_session_history(
    session_id: str,
    limit: Optional[int] = Query(None, ge=1, le=100)
):
    """Get conversation history for session"""
    history = context_manager.get_history(session_id, limit)
    
    if not history:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "message_count": len(history),
        "messages": history
    }


@app.get("/api/v3/orchestrator/sessions/{session_id}/export")
async def export_session(session_id: str):
    """Export session to JSON"""
    export_data = context_manager.export_session(session_id)
    
    if not export_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return JSONResponse(
        content=export_data,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=session-{session_id}.json"
        }
    )


@app.delete("/api/v3/orchestrator/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    success = context_manager.delete_session(session_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}


# ==================== WebSocket Endpoint ====================

@app.websocket("/api/v3/orchestrator/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    
    connection_id = str(uuid.uuid4())
    session_id = str(uuid.uuid4())
    websocket_connections[connection_id] = websocket
    
    logger.info(f"WebSocket connected: {connection_id}, session: {session_id}")
    
    # Create session
    context_manager.create_session(session_id)
    
    # Send welcome message
    await websocket.send_json({
        "type": "welcome",
        "payload": {
            "message": "👋 Welcome! I'm your AI Infrastructure Assistant.",
            "session_id": session_id,
            "connection_id": connection_id,
            "help": "Type 'help' for available commands"
        },
        "timestamp": datetime.utcnow().isoformat()
    })
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            message_type = data.get("type", "command")
            payload = data.get("payload", {})
            
            if message_type == "command":
                # Process command
                command = payload.get("command", "")
                
                if not command:
                    await websocket.send_json({
                        "type": "error",
                        "payload": {"error": "Empty command"},
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    continue
                
                # Echo user message
                await websocket.send_json({
                    "type": "user_message",
                    "payload": {"content": command},
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Process command
                try:
                    request = CommandRequest(
                        command=command,
                        session_id=session_id
                    )
                    
                    # Analyze and execute
                    start_time = time.time()
                    analysis = await nlp_interpreter.analyze(request)
                    
                    # Add to history
                    context_manager.add_message(
                        session_id=session_id,
                        role="user",
                        content=command,
                        intent=analysis.primary_intent
                    )
                    
                    # Route command
                    service_response = await command_router.route_command(analysis.primary_intent)
                    
                    # Generate response
                    execution_time = (time.time() - start_time) * 1000
                    response = response_generator.generate_response(
                        intent=analysis.primary_intent,
                        service_response=service_response,
                        execution_time_ms=execution_time
                    )
                    
                    # Add assistant message to history
                    context_manager.add_message(
                        session_id=session_id,
                        role="assistant",
                        content=response.message,
                        intent=analysis.primary_intent
                    )
                    
                    # Send response
                    await websocket.send_json({
                        "type": "assistant_message",
                        "payload": {
                            "content": response.message,
                            "success": response.success,
                            "intent": analysis.primary_intent.type,
                            "execution_time_ms": execution_time,
                            "data": response.data,
                            "suggestions": response.suggestions
                        },
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                except Exception as e:
                    logger.error(f"Error processing WebSocket command: {str(e)}")
                    await websocket.send_json({
                        "type": "error",
                        "payload": {"error": str(e)},
                        "timestamp": datetime.utcnow().isoformat()
                    })
            
            elif message_type == "ping":
                # Respond to ping
                await websocket.send_json({
                    "type": "pong",
                    "payload": {},
                    "timestamp": datetime.utcnow().isoformat()
                })
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Clean up
        if connection_id in websocket_connections:
            del websocket_connections[connection_id]
        logger.info(f"WebSocket connection cleaned up: {connection_id}")


# ==================== Background Tasks ====================

@app.on_event("startup")
async def cleanup_task():
    """Periodic cleanup of expired sessions"""
    import asyncio
    
    async def cleanup_loop():
        while True:
            await asyncio.sleep(300)  # Every 5 minutes
            try:
                cleaned = context_manager.cleanup_expired_sessions()
                if cleaned > 0:
                    logger.info(f"Cleaned up {cleaned} expired sessions")
            except Exception as e:
                logger.error(f"Error in cleanup task: {str(e)}")
    
    asyncio.create_task(cleanup_loop())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app_v3:app",
        host="0.0.0.0",
        port=8300,
        reload=True,
        log_level="info"
    )
