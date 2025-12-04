from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    """Manage WebSocket connections for real-time updates."""
    
    def __init__(self):
        # Map of project_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, project_id: str):
        """Connect a client to a project room."""
        await websocket.accept()
        
        if project_id not in self.active_connections:
            self.active_connections[project_id] = set()
        
        self.active_connections[project_id].add(websocket)
        print(f"✅ Client connected to project {project_id}")
    
    def disconnect(self, websocket: WebSocket, project_id: str):
        """Disconnect a client from a project room."""
        if project_id in self.active_connections:
            self.active_connections[project_id].discard(websocket)
            
            # Clean up empty rooms
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        
        print(f"👋 Client disconnected from project {project_id}")
    
    async def broadcast_to_project(self, project_id: str, message: dict):
        """Broadcast a message to all clients in a project room."""
        if project_id not in self.active_connections:
            return
        
        # Remove disconnected clients
        disconnected = set()
        
        for connection in self.active_connections[project_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"❌ Error sending message: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.active_connections[project_id].discard(connection)
    
    async def send_agent_update(self, project_id: str, agent_data: dict):
        """Send agent status update to all clients."""
        message = {
            "type": "agent_status",
            "data": agent_data
        }
        await self.broadcast_to_project(project_id, message)
    
    async def send_progress_update(self, project_id: str, agent_id: str, progress: float):
        """Send progress update for a specific agent."""
        message = {
            "type": "progress_update",
            "data": {
                "agentId": agent_id,
                "progress": progress
            }
        }
        await self.broadcast_to_project(project_id, message)
    
    async def send_generation_complete(self, project_id: str):
        """Notify clients that generation is complete."""
        message = {
            "type": "generation_complete",
            "data": {"project_id": project_id}
        }
        await self.broadcast_to_project(project_id, message)
    
    async def send_error(self, project_id: str, error_message: str):
        """Send error notification to clients."""
        message = {
            "type": "error",
            "data": {"message": error_message}
        }
        await self.broadcast_to_project(project_id, message)

# Global connection manager instance
manager = ConnectionManager()

@router.websocket("/ws/projects/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    """WebSocket endpoint for real-time project updates."""
    await manager.connect(websocket, project_id)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            
            # Parse incoming message
            try:
                message = json.loads(data)
                message_type = message.get("type")
                
                if message_type == "ping":
                    # Respond to ping with pong
                    await websocket.send_json({"type": "pong"})
                
                elif message_type == "subscribe":
                    # Client explicitly subscribing (already connected)
                    await websocket.send_json({
                        "type": "subscribed",
                        "project_id": project_id
                    })
                
            except json.JSONDecodeError:
                print(f"⚠️ Invalid JSON received: {data}")
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        manager.disconnect(websocket, project_id)

# Export manager for use in other modules
__all__ = ["router", "manager"]
