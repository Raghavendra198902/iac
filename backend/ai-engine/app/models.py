from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class CloudProvider(str, Enum):
    AZURE = "azure"
    AWS = "aws"
    GCP = "gcp"


class ResourceType(str, Enum):
    COMPUTE = "compute"
    STORAGE = "storage"
    NETWORK = "network"
    DATABASE = "database"
    CONTAINER = "container"
    SERVERLESS = "serverless"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# NLP to Blueprint Request/Response
class NLPBlueprintRequest(BaseModel):
    user_input: str = Field(..., description="Natural language description of infrastructure")
    target_cloud: Optional[CloudProvider] = None
    environment: Optional[str] = Field(None, description="dev, staging, production")
    constraints: Optional[Dict[str, Any]] = Field(default_factory=dict)
    user_id: Optional[str] = None


class ResourceRecommendation(BaseModel):
    resource_type: str
    name: str
    sku: Optional[str] = None
    size: Optional[str] = None
    tier: Optional[str] = None
    quantity: int = 1
    properties: Dict[str, Any] = Field(default_factory=dict)
    reasoning: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    estimated_cost: Optional[float] = None


class BlueprintFromNLP(BaseModel):
    blueprint_id: str
    name: str
    description: str
    target_cloud: CloudProvider
    environment: str
    resources: List[ResourceRecommendation]
    architecture_diagram: Optional[str] = None
    confidence: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


# Risk Assessment
class RiskAssessmentRequest(BaseModel):
    blueprint_id: Optional[str] = None
    deployment_id: Optional[str] = None
    resources: Optional[List[Dict[str, Any]]] = None
    historical_context: Optional[Dict[str, Any]] = None


class RiskFactor(BaseModel):
    factor_id: str
    category: str
    severity: RiskLevel
    title: str
    description: str
    impact: str
    probability: float = Field(..., ge=0.0, le=1.0)
    mitigation: str
    resources_affected: List[str] = Field(default_factory=list)


class RiskAssessment(BaseModel):
    assessment_id: str
    blueprint_id: Optional[str] = None
    deployment_id: Optional[str] = None
    overall_risk: RiskLevel
    risk_score: float = Field(..., ge=0.0, le=100.0)
    risk_factors: List[RiskFactor]
    recommendations: List[str]
    assessed_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ML Recommendations
class RecommendationRequest(BaseModel):
    blueprint_id: Optional[str] = None
    deployment_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    recommendation_type: Optional[str] = None  # 'performance', 'cost', 'security', 'reliability'


class MLRecommendation(BaseModel):
    recommendation_id: str
    type: str
    category: str
    title: str
    description: str
    impact: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    priority: RiskLevel
    implementation_steps: List[str]
    estimated_savings: Optional[float] = None
    estimated_improvement: Optional[str] = None
    resources_affected: List[str] = Field(default_factory=list)


class RecommendationsResponse(BaseModel):
    recommendations: List[MLRecommendation]
    total_count: int
    generated_at: datetime


# Pattern Recognition
class PatternRequest(BaseModel):
    blueprint_ids: Optional[List[str]] = None
    deployment_ids: Optional[List[str]] = None
    time_range: Optional[Dict[str, str]] = None
    pattern_type: Optional[str] = None


class Pattern(BaseModel):
    pattern_id: str
    pattern_type: str
    name: str
    description: str
    frequency: int
    confidence: float
    examples: List[Dict[str, Any]]
    insights: List[str]


class PatternsResponse(BaseModel):
    patterns: List[Pattern]
    total_count: int
    analyzed_at: datetime


# Sentiment & Intent Analysis
class IntentAnalysisRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = None


class Intent(BaseModel):
    intent_type: str
    confidence: float
    entities: Dict[str, Any]


class IntentAnalysisResponse(BaseModel):
    primary_intent: Intent
    secondary_intents: List[Intent]
    sentiment: str
    sentiment_score: float
    extracted_requirements: Dict[str, Any]


# Model Training
class TrainingRequest(BaseModel):
    model_name: str
    training_data: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = None


class TrainingStatus(BaseModel):
    job_id: str
    model_name: str
    status: str
    progress: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    metrics: Optional[Dict[str, float]] = None


# Health Check
class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime
    models_loaded: Dict[str, bool]
    gpu_available: bool
