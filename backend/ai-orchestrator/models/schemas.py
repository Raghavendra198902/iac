"""
AI Orchestrator - Data Models and Schemas
Defines request/response models for NLP command processing
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class IntentType(str, Enum):
    """Supported command intents"""
    # Infrastructure Management
    CREATE_INFRASTRUCTURE = "create_infrastructure"
    UPDATE_INFRASTRUCTURE = "update_infrastructure"
    DELETE_INFRASTRUCTURE = "delete_infrastructure"
    LIST_INFRASTRUCTURE = "list_infrastructure"
    DESCRIBE_INFRASTRUCTURE = "describe_infrastructure"
    
    # Deployment Operations
    DEPLOY = "deploy"
    SCALE = "scale"
    ROLLBACK = "rollback"
    DELETE_DEPLOYMENT = "delete_deployment"
    LIST_DEPLOYMENTS = "list_deployments"
    
    # Discovery Operations
    DISCOVER_RESOURCES = "discover_resources"
    LIST_RESOURCES = "list_resources"
    DESCRIBE_RESOURCE = "describe_resource"
    QUERY_GRAPH = "query_graph"
    
    # AI/ML Operations
    PREDICT_FAILURE = "predict_failure"
    FORECAST_CAPACITY = "forecast_capacity"
    DETECT_THREAT = "detect_threat"
    DETECT_ANOMALY = "detect_anomaly"
    
    # Query Operations
    GET_STATISTICS = "get_statistics"
    GET_METRICS = "get_metrics"
    GET_HEALTH = "get_health"
    
    # Conversation
    GREETING = "greeting"
    HELP = "help"
    UNKNOWN = "unknown"


class EntityType(str, Enum):
    """Entity types extracted from commands"""
    PROVIDER = "provider"
    REGION = "region"
    RESOURCE_TYPE = "resource_type"
    RESOURCE_ID = "resource_id"
    INFRASTRUCTURE_NAME = "infrastructure_name"
    DEPLOYMENT_ID = "deployment_id"
    STATUS = "status"
    METRIC = "metric"
    TIME_RANGE = "time_range"
    COUNT = "count"
    FILTER = "filter"


class Entity(BaseModel):
    """Extracted entity from command"""
    type: EntityType
    value: str
    confidence: float = Field(ge=0.0, le=1.0)
    start_pos: Optional[int] = None
    end_pos: Optional[int] = None


class Intent(BaseModel):
    """Detected intent from command"""
    type: IntentType
    confidence: float = Field(ge=0.0, le=1.0)
    entities: List[Entity] = []


class CommandRequest(BaseModel):
    """Natural language command request"""
    command: str = Field(..., description="Natural language command", min_length=1, max_length=1000)
    user_id: Optional[str] = Field(None, description="User identifier for context")
    session_id: Optional[str] = Field(None, description="Session identifier for conversation context")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")


class CommandResponse(BaseModel):
    """Command execution response"""
    success: bool
    intent: Intent
    message: str
    data: Optional[Dict[str, Any]] = None
    execution_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    suggestions: Optional[List[str]] = None


class ConversationMessage(BaseModel):
    """Conversation message in chat history"""
    role: str = Field(..., description="user or assistant")
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    intent: Optional[Intent] = None
    metadata: Optional[Dict[str, Any]] = None


class ConversationContext(BaseModel):
    """Conversation context for session management"""
    session_id: str
    user_id: Optional[str] = None
    messages: List[ConversationMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ServiceRequest(BaseModel):
    """Request to backend service"""
    service: str = Field(..., description="Service name: graphql, aiops, cmdb")
    operation: str = Field(..., description="Operation to perform")
    parameters: Dict[str, Any] = Field(default_factory=dict)
    timeout: int = Field(30, description="Timeout in seconds")


class ServiceResponse(BaseModel):
    """Response from backend service"""
    success: bool
    service: str
    operation: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time_ms: float


class HealthStatus(BaseModel):
    """Health check status"""
    status: str = Field(..., description="healthy, degraded, unhealthy")
    version: str = "3.0.0"
    uptime_seconds: float
    services: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class NLPAnalysis(BaseModel):
    """NLP analysis result"""
    original_command: str
    detected_intents: List[Intent]
    primary_intent: Intent
    entities: List[Entity]
    confidence: float = Field(ge=0.0, le=1.0)
    processing_time_ms: float
    suggestions: Optional[List[str]] = None


class GraphQLQueryRequest(BaseModel):
    """GraphQL query request"""
    query: str
    variables: Optional[Dict[str, Any]] = None
    operation_name: Optional[str] = None


class AIOpsRequest(BaseModel):
    """AIOps operation request"""
    operation: str = Field(..., description="predict_failure, forecast_capacity, detect_threat, detect_anomaly")
    data: Dict[str, Any]


class CMDBRequest(BaseModel):
    """CMDB operation request"""
    operation: str = Field(..., description="discover, list_resources, query_graph, get_statistics")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class WebSocketMessage(BaseModel):
    """WebSocket message format"""
    type: str = Field(..., description="command, response, notification, error")
    payload: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Suggestion(BaseModel):
    """Command suggestion"""
    command: str
    description: str
    category: str
    example: Optional[str] = None
