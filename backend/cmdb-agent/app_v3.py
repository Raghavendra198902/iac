"""
CMDB Agent v3.0 - FastAPI Service
Multi-cloud infrastructure discovery and graph database management
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
import logging
import asyncio
from contextlib import asynccontextmanager

from models.infrastructure import (
    Provider, ResourceType, ResourceStatus,
    InfrastructureResource, DiscoveryResult
)
from discovery.aws_discovery import AWSDiscovery
from graph.neo4j_client import Neo4jClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global state
neo4j_client: Optional[Neo4jClient] = None
discovery_tasks: Dict[str, Dict[str, Any]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global neo4j_client
    
    # Startup
    logger.info("Starting CMDB Agent v3.0...")
    
    # Initialize Neo4j
    try:
        neo4j_client = Neo4jClient(
            uri="bolt://localhost:7687",
            username="neo4j",
            password="neo4j123"
        )
        
        if neo4j_client.verify_connectivity():
            logger.info("✓ Neo4j connected successfully")
            neo4j_client.create_indexes()
        else:
            logger.warning("⚠ Neo4j connection failed - graph features disabled")
    except Exception as e:
        logger.error(f"✗ Neo4j initialization failed: {e}")
        neo4j_client = None
    
    logger.info("🚀 CMDB Agent v3.0 started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CMDB Agent...")
    if neo4j_client:
        neo4j_client.close()
    logger.info("✓ CMDB Agent shutdown complete")


app = FastAPI(
    title="IAC Dharma CMDB Agent",
    version="3.0.0",
    description="Multi-cloud infrastructure discovery and configuration management database",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Request/Response Models
# ============================================================================

class AWSCredentials(BaseModel):
    """AWS credentials"""
    access_key: str = Field(..., description="AWS Access Key ID")
    secret_key: str = Field(..., description="AWS Secret Access Key")
    session_token: Optional[str] = Field(None, description="Session token (optional)")
    regions: List[str] = Field(default=["us-east-1"], description="AWS regions to discover")


class DiscoveryRequest(BaseModel):
    """Discovery request"""
    provider: Provider
    credentials: Optional[Dict[str, Any]] = None
    regions: Optional[List[str]] = None
    store_in_graph: bool = Field(default=True, description="Store results in Neo4j")


class DiscoveryStatus(BaseModel):
    """Discovery task status"""
    task_id: str
    provider: Provider
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    resources_discovered: int = 0
    errors: List[str] = Field(default_factory=list)


# ============================================================================
# Root & Health
# ============================================================================

@app.get("/")
async def root():
    """Service information"""
    return {
        "service": "IAC Dharma CMDB Agent",
        "version": "3.0.0",
        "description": "Multi-cloud infrastructure discovery and CMDB",
        "endpoints": {
            "health": "/api/v3/cmdb/health",
            "discover": "/api/v3/cmdb/discover",
            "resources": "/api/v3/cmdb/resources",
            "graph": "/api/v3/cmdb/graph",
            "statistics": "/api/v3/cmdb/statistics"
        },
        "supported_providers": [p.value for p in Provider],
        "neo4j_enabled": neo4j_client is not None
    }


@app.get("/api/v3/cmdb/health")
async def health_check():
    """Health check endpoint"""
    neo4j_status = "connected" if neo4j_client and neo4j_client.verify_connectivity() else "disconnected"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "3.0.0",
        "components": {
            "api": "healthy",
            "neo4j": neo4j_status
        },
        "active_discovery_tasks": len(discovery_tasks)
    }


# ============================================================================
# Discovery Endpoints
# ============================================================================

@app.post("/api/v3/cmdb/discover/aws")
async def discover_aws(
    credentials: AWSCredentials,
    background_tasks: BackgroundTasks
):
    """
    Discover AWS infrastructure
    
    Discovers EC2, RDS, EBS, ELB, ECS resources across specified regions
    """
    task_id = f"aws-{datetime.utcnow().timestamp()}"
    
    # Initialize task status
    discovery_tasks[task_id] = {
        "task_id": task_id,
        "provider": Provider.AWS,
        "status": "running",
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "resources_discovered": 0,
        "errors": []
    }
    
    # Run discovery in background
    background_tasks.add_task(
        _run_aws_discovery,
        task_id,
        credentials
    )
    
    return {
        "task_id": task_id,
        "status": "started",
        "message": f"AWS discovery started for regions: {credentials.regions}",
        "check_status": f"/api/v3/cmdb/discovery/{task_id}"
    }


async def _run_aws_discovery(task_id: str, credentials: AWSCredentials):
    """Background task for AWS discovery"""
    all_results = []
    all_errors = []
    
    try:
        for region in credentials.regions:
            logger.info(f"Discovering AWS resources in {region}")
            
            discovery = AWSDiscovery(
                access_key=credentials.access_key,
                secret_key=credentials.secret_key,
                region=region,
                session_token=credentials.session_token
            )
            
            result = await discovery.discover_all()
            all_results.append(result)
            all_errors.extend(result.errors)
            
            # Store in Neo4j if available
            if neo4j_client:
                logger.info(f"Storing {len(result.resources)} resources in Neo4j")
                neo4j_client.store_resources_batch(result.resources)
                neo4j_client.create_relationships_batch(result.relationships)
        
        # Update task status
        total_resources = sum(r.resources_discovered for r in all_results)
        discovery_tasks[task_id].update({
            "status": "completed",
            "completed_at": datetime.utcnow(),
            "resources_discovered": total_resources,
            "errors": all_errors
        })
        
        logger.info(f"AWS discovery completed: {total_resources} resources discovered")
        
    except Exception as e:
        logger.error(f"AWS discovery failed: {e}")
        discovery_tasks[task_id].update({
            "status": "failed",
            "completed_at": datetime.utcnow(),
            "errors": [str(e)]
        })


@app.get("/api/v3/cmdb/discovery/{task_id}")
async def get_discovery_status(task_id: str):
    """Get discovery task status"""
    if task_id not in discovery_tasks:
        raise HTTPException(status_code=404, detail="Discovery task not found")
    
    return discovery_tasks[task_id]


@app.get("/api/v3/cmdb/discovery")
async def list_discovery_tasks():
    """List all discovery tasks"""
    return {
        "tasks": list(discovery_tasks.values()),
        "total": len(discovery_tasks)
    }


# ============================================================================
# Resource Endpoints
# ============================================================================

@app.get("/api/v3/cmdb/resources")
async def list_resources(
    provider: Optional[Provider] = Query(None),
    resource_type: Optional[ResourceType] = Query(None),
    status: Optional[ResourceStatus] = Query(None),
    region: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    List resources with filters
    
    Query parameters:
    - provider: Filter by cloud provider
    - resource_type: Filter by resource type
    - status: Filter by status
    - region: Filter by region
    - limit: Maximum results (1-1000)
    """
    if not neo4j_client:
        raise HTTPException(status_code=503, detail="Neo4j not available")
    
    filters = {}
    if provider:
        filters['provider'] = provider.value
    if resource_type:
        filters['resource_type'] = resource_type.value
    if status:
        filters['status'] = status.value
    if region:
        filters['region'] = region
    
    resources = neo4j_client.query_resources(filters, limit)
    
    return {
        "resources": resources,
        "count": len(resources),
        "filters": filters
    }


@app.get("/api/v3/cmdb/resources/{resource_id}")
async def get_resource(resource_id: str):
    """Get specific resource by ID"""
    if not neo4j_client:
        raise HTTPException(status_code=503, detail="Neo4j not available")
    
    resource = neo4j_client.get_resource(resource_id)
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return resource


@app.get("/api/v3/cmdb/resources/{resource_id}/relationships")
async def get_resource_relationships(
    resource_id: str,
    direction: str = Query("both", regex="^(both|incoming|outgoing)$")
):
    """
    Get relationships for a resource
    
    Parameters:
    - direction: 'both', 'incoming', or 'outgoing'
    """
    if not neo4j_client:
        raise HTTPException(status_code=503, detail="Neo4j not available")
    
    relationships = neo4j_client.get_resource_relationships(resource_id, direction)
    
    return {
        "resource_id": resource_id,
        "direction": direction,
        "relationships": relationships,
        "count": len(relationships)
    }


# ============================================================================
# Graph Endpoints
# ============================================================================

@app.get("/api/v3/cmdb/graph/{root_id}")
async def get_infrastructure_graph(
    root_id: str,
    depth: int = Query(3, ge=1, le=10)
):
    """
    Get infrastructure graph starting from a root resource
    
    Parameters:
    - depth: Maximum depth to traverse (1-10)
    """
    if not neo4j_client:
        raise HTTPException(status_code=503, detail="Neo4j not available")
    
    graph = neo4j_client.get_infrastructure_graph(root_id, depth)
    
    return {
        "root_id": root_id,
        "depth": depth,
        "nodes": graph['nodes'],
        "relationships": graph['relationships'],
        "node_count": len(graph['nodes']),
        "relationship_count": len(graph['relationships'])
    }


class CypherQuery(BaseModel):
    """Cypher query request"""
    query: str = Field(..., description="Cypher query string")
    parameters: Dict[str, Any] = Field(default_factory=dict)


@app.post("/api/v3/cmdb/graph/query")
async def execute_cypher_query(query_request: CypherQuery):
    """
    Execute custom Cypher query against Neo4j
    
    Use with caution - only SELECT-like queries recommended
    """
    if not neo4j_client:
        raise HTTPException(status_code=503, detail="Neo4j not available")
    
    try:
        results = neo4j_client.execute_cypher(
            query_request.query,
            query_request.parameters
        )
        
        return {
            "query": query_request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")


# ============================================================================
# Statistics Endpoints
# ============================================================================

@app.get("/api/v3/cmdb/statistics")
async def get_statistics():
    """Get CMDB statistics"""
    if not neo4j_client:
        raise HTTPException(status_code=503, detail="Neo4j not available")
    
    stats = neo4j_client.get_statistics()
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "statistics": stats
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app_v3:app",
        host="0.0.0.0",
        port=8200,
        reload=True,
        log_level="info"
    )
