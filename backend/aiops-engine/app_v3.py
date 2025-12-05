"""
IAC Dharma v3.0 - AIOps Engine
Enhanced with Real ML Models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from datetime import datetime
import logging
import uuid

# Import ML models
from models.failure_predictor import FailurePredictor
from models.threat_detector import ThreatDetector
from models.capacity_forecaster import CapacityForecaster
from models.anomaly_detector import AnomalyDetector

# Initialize FastAPI app
app = FastAPI(
    title="IAC Dharma AIOps Engine v3.0",
    description="AI-Powered Operations with Predictive Analytics",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize ML Models
failure_predictor = FailurePredictor()
threat_detector = ThreatDetector()
capacity_forecaster = CapacityForecaster()
anomaly_detector = AnomalyDetector()

# Service statistics
service_stats = {
    "start_time": datetime.now(),
    "predictions_count": 0,
    "anomalies_detected": 0,
    "remediations_executed": 0
}

logger.info("✅ AIOps Engine initialized with 4 ML models")

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "IAC Dharma AIOps Engine",
        "version": "3.0.0",
        "status": "running",
        "models": ["FailurePredictor", "ThreatDetector", "CapacityForecaster", "AnomalyDetector"],
        "docs": "/docs"
    }


@app.get("/api/v3/aiops/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    uptime = (datetime.now() - service_stats["start_time"]).total_seconds()
    
    return {
        "status": "healthy",
        "version": "3.0.0",
        "uptime_seconds": uptime,
        "models": {
            "failure_predictor": {
                "loaded": True,
                "version": failure_predictor.model_version,
                "trained": failure_predictor.is_trained
            },
            "threat_detector": {
                "loaded": True,
                "version": threat_detector.model_version,
                "trained": threat_detector.is_trained
            },
            "capacity_forecaster": {
                "loaded": True,
                "version": capacity_forecaster.model_version,
                "trained": capacity_forecaster.is_trained
            },
            "anomaly_detector": {
                "loaded": True,
                "version": anomaly_detector.model_version,
                "trained": anomaly_detector.is_trained
            }
        },
        "statistics": {
            "predictions_count": service_stats["predictions_count"],
            "anomalies_detected": service_stats["anomalies_detected"],
            "remediations_executed": service_stats["remediations_executed"]
        },
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/v3/aiops/predict/failure", tags=["Predictions"])
async def predict_failure(request: Dict[str, Any]):
    """
    Predict infrastructure failures 24-48 hours in advance.
    
    Request body:
    {
        "service_name": "api-gateway",
        "metrics": {
            "cpu_usage": 85.5,
            "memory_usage": 92.0,
            "disk_io": 450,
            "error_rate": 2.5
        }
    }
    """
    try:
        logger.info(f"Failure prediction for {request.get('service_name')}")
        
        result = await failure_predictor.predict(request)
        service_stats["predictions_count"] += 1
        
        return result
        
    except Exception as e:
        logger.error(f"Failure prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v3/aiops/predict/capacity", tags=["Predictions"])
async def forecast_capacity(request: Dict[str, Any]):
    """
    Forecast capacity needs for resource planning.
    
    Request body:
    {
        "service_name": "database",
        "forecast_days": 30,
        "historical_data": {
            "cpu_usage_avg": 65,
            "memory_usage_avg": 70,
            "storage_used_gb": 500,
            "growth_rate_percent": 5
        }
    }
    """
    try:
        logger.info(f"Capacity forecast for {request.get('service_name')}")
        
        result = await capacity_forecaster.forecast(request)
        service_stats["predictions_count"] += 1
        
        return result
        
    except Exception as e:
        logger.error(f"Capacity forecasting error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v3/aiops/predict/threat", tags=["Security"])
async def detect_threat(request: Dict[str, Any]):
    """
    Detect security threats in real-time.
    
    Request body:
    {
        "service_name": "web-server",
        "events": [],
        "network": {
            "requests_per_second": 1500,
            "bytes": 1048576
        },
        "access_logs": [
            {
                "request": "GET /api/users?id=1' OR 1=1--",
                "status": 200,
                "path": "/api/users"
            }
        ]
    }
    """
    try:
        logger.info(f"Threat detection for {request.get('service_name')}")
        
        result = await threat_detector.detect(request)
        service_stats["predictions_count"] += 1
        
        return result
        
    except Exception as e:
        logger.error(f"Threat detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v3/aiops/analyze/anomaly", tags=["Anomalies"])
async def detect_anomaly(request: Dict[str, Any]):
    """
    Detect anomalies in system metrics.
    
    Request body:
    {
        "service_name": "microservice-a",
        "metrics": {
            "cpu_usage": 95.5,
            "memory_usage": 88.0,
            "error_rate": 3.5,
            "response_time_ms": 850
        }
    }
    """
    try:
        logger.info(f"Anomaly detection for {request.get('service_name')}")
        
        result = await anomaly_detector.detect(request)
        
        if result.get("is_anomaly"):
            service_stats["anomalies_detected"] += 1
        
        return result
        
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v3/aiops/metrics", tags=["Metrics"])
async def get_metrics():
    """Get Prometheus-compatible metrics"""
    uptime = (datetime.now() - service_stats["start_time"]).total_seconds()
    
    metrics = f"""
# HELP aiops_predictions_total Total number of predictions made
# TYPE aiops_predictions_total counter
aiops_predictions_total {service_stats["predictions_count"]}

# HELP aiops_anomalies_detected_total Total number of anomalies detected
# TYPE aiops_anomalies_detected_total counter
aiops_anomalies_detected_total {service_stats["anomalies_detected"]}

# HELP aiops_remediations_executed_total Total number of remediations executed
# TYPE aiops_remediations_executed_total counter
aiops_remediations_executed_total {service_stats["remediations_executed"]}

# HELP aiops_uptime_seconds Service uptime in seconds
# TYPE aiops_uptime_seconds gauge
aiops_uptime_seconds {uptime}
"""
    
    return metrics


# ============================================================================
# Startup Event
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    logger.info("=" * 60)
    logger.info("IAC Dharma AIOps Engine v3.0 - Starting...")
    logger.info("=" * 60)
    logger.info(f"✓ Failure Predictor loaded (v{failure_predictor.model_version})")
    logger.info(f"✓ Threat Detector loaded (v{threat_detector.model_version})")
    logger.info(f"✓ Capacity Forecaster loaded (v{capacity_forecaster.model_version})")
    logger.info(f"✓ Anomaly Detector loaded (v{anomaly_detector.model_version})")
    logger.info("=" * 60)
    logger.info("🚀 AIOps Engine ready on port 8100")
    logger.info("📚 API docs: http://localhost:8100/docs")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8100)
