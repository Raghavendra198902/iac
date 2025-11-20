from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import torch

from app.models import (
    NLPBlueprintRequest,
    BlueprintFromNLP,
    RiskAssessmentRequest,
    RiskAssessment,
    RecommendationRequest,
    RecommendationsResponse,
    PatternRequest,
    PatternsResponse,
    IntentAnalysisRequest,
    IntentAnalysisResponse,
    TrainingRequest,
    TrainingStatus,
    HealthResponse
)
from app.services.nlp_service import NLPService
from app.services.risk_service import RiskAssessmentService
from app.services.recommendation_service import RecommendationService
from app.services.pattern_service import PatternRecognitionService
from app.services.intent_service import IntentAnalysisService
from app.services.training_service import ModelTrainingService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global service instances
nlp_service: NLPService = None
risk_service: RiskAssessmentService = None
recommendation_service: RecommendationService = None
pattern_service: PatternRecognitionService = None
intent_service: IntentAnalysisService = None
training_service: ModelTrainingService = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global nlp_service, risk_service, recommendation_service
    global pattern_service, intent_service, training_service
    
    logger.info("Starting AI Engine service...")
    logger.info(f"GPU Available: {torch.cuda.is_available()}")
    
    # Initialize services
    nlp_service = NLPService()
    risk_service = RiskAssessmentService()
    recommendation_service = RecommendationService()
    pattern_service = PatternRecognitionService()
    intent_service = IntentAnalysisService()
    training_service = ModelTrainingService()
    
    logger.info("AI Engine service started successfully")
    
    yield
    
    # Cleanup
    logger.info("Shutting down AI Engine service...")


# Create FastAPI app
app = FastAPI(
    title="IAC DHARMA AI Engine",
    description="AI/ML service for NLP blueprint generation, risk assessment, and intelligent recommendations",
    version="1.0.0",
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


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="ai-engine",
        timestamp=datetime.utcnow(),
        models_loaded={
            "nlp": nlp_service is not None,
            "risk": risk_service is not None,
            "recommendation": recommendation_service is not None,
            "pattern": pattern_service is not None,
            "intent": intent_service is not None
        },
        gpu_available=torch.cuda.is_available()
    )


@app.post("/api/nlp/blueprint", response_model=BlueprintFromNLP)
async def generate_blueprint_from_nlp(request: NLPBlueprintRequest):
    """
    Generate infrastructure blueprint from natural language description
    
    Example: "I need a scalable web app with a database on Azure"
    """
    try:
        logger.info(f"Generating blueprint from NLP: {request.user_input[:100]}...")
        blueprint = await nlp_service.generate_blueprint(request)
        return blueprint
    except Exception as e:
        logger.error(f"Error generating blueprint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/risk/assess", response_model=RiskAssessment)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Assess risk for blueprint or deployment using ML models and historical data
    """
    try:
        if not request.blueprint_id and not request.deployment_id and not request.resources:
            raise HTTPException(
                status_code=400,
                detail="Either blueprint_id, deployment_id, or resources must be provided"
            )
        
        logger.info(f"Assessing risk for blueprint={request.blueprint_id}, deployment={request.deployment_id}")
        assessment = await risk_service.assess_risk(request)
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assessing risk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get ML-powered recommendations for optimization, security, cost, etc.
    """
    try:
        if not request.blueprint_id and not request.deployment_id:
            raise HTTPException(
                status_code=400,
                detail="Either blueprint_id or deployment_id must be provided"
            )
        
        logger.info(f"Generating recommendations for blueprint={request.blueprint_id}, type={request.recommendation_type}")
        recommendations = await recommendation_service.generate_recommendations(request)
        return recommendations
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/patterns/detect", response_model=PatternsResponse)
async def detect_patterns(request: PatternRequest):
    """
    Detect patterns across blueprints and deployments using ML
    """
    try:
        logger.info(f"Detecting patterns for {len(request.blueprint_ids or [])} blueprints")
        patterns = await pattern_service.detect_patterns(request)
        return patterns
    except Exception as e:
        logger.error(f"Error detecting patterns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/intent/analyze", response_model=IntentAnalysisResponse)
async def analyze_intent(request: IntentAnalysisRequest):
    """
    Analyze user intent and extract structured requirements from natural language
    """
    try:
        logger.info(f"Analyzing intent: {request.text[:100]}...")
        analysis = await intent_service.analyze_intent(request)
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing intent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/train", response_model=TrainingStatus)
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """
    Start model training job (runs in background)
    """
    try:
        logger.info(f"Starting training job for model: {request.model_name}")
        status = await training_service.start_training(request, background_tasks)
        return status
    except Exception as e:
        logger.error(f"Error starting training: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/train/{job_id}", response_model=TrainingStatus)
async def get_training_status(job_id: str):
    """
    Get status of training job
    """
    try:
        status = await training_service.get_training_status(job_id)
        if not status:
            raise HTTPException(status_code=404, detail="Training job not found")
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting training status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/similarity/blueprints")
async def find_similar_blueprints(blueprint_id: str, limit: int = 5):
    """
    Find similar blueprints using embeddings and semantic similarity
    """
    try:
        logger.info(f"Finding similar blueprints for {blueprint_id}")
        similar = await nlp_service.find_similar_blueprints(blueprint_id, limit)
        return {"blueprint_id": blueprint_id, "similar_blueprints": similar}
    except Exception as e:
        logger.error(f"Error finding similar blueprints: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/embeddings")
async def generate_embeddings(text: str):
    """
    Generate embeddings for text (useful for semantic search)
    """
    try:
        embeddings = await nlp_service.generate_embeddings(text)
        return {"text": text, "embeddings": embeddings.tolist()}
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
