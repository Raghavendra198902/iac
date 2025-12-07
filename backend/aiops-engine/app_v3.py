"""
IAC Dharma v3.0 - AIOps Engine
Enhanced with Real ML Models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from typing import Dict, Any
from datetime import datetime
import logging
import uuid
import os

# Import ML models
from models.failure_predictor import FailurePredictor
from models.threat_detector import ThreatDetector
from models.capacity_forecaster import CapacityForecaster
from models.anomaly_detector import AnomalyDetector

# Import new enhanced models
from models.lstm_failure_predictor import LSTMFailurePredictor
from models.rf_threat_detector import RFThreatDetector
from models.xgb_capacity_forecaster import XGBoostCapacityForecaster

# Import training pipeline
from services.mlflow_training_pipeline import (
    MLflowTrainingPipeline,
    generate_synthetic_training_data
)

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

# Initialize enhanced ML models
lstm_failure_predictor = LSTMFailurePredictor()
rf_threat_detector = RFThreatDetector()
xgb_capacity_forecaster = XGBoostCapacityForecaster()

# Initialize MLflow training pipeline with correct URI from environment
mlflow_tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow-v3:5000")
mlflow_pipeline = MLflowTrainingPipeline(mlflow_tracking_uri=mlflow_tracking_uri)

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


@app.get("/health", tags=["Health"])
async def health_check_simple():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "service": "IAC Dharma AIOps Engine",
        "version": "3.0.0",
        "timestamp": datetime.now().isoformat()
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
    from fastapi.responses import Response
    
    uptime = (datetime.now() - service_stats["start_time"]).total_seconds()
    
    metrics = f"""# HELP aiops_predictions_total Total number of predictions made
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
    
    return Response(content=metrics, media_type="text/plain; version=0.0.4")


# ============================================================================
# Model Training Endpoints
# ============================================================================

@app.post("/api/v3/aiops/models/train", tags=["Training"])
async def train_models(request: Dict[str, Any]):
    """
    Train AI/ML models with provided or synthetic data.
    
    Request body:
    {
        "models": ["failure_predictor", "threat_detector", "capacity_forecaster"],
        "use_synthetic_data": true,
        "n_samples": 10000,
        "hyperparameters": {
            "failure_predictor": {"epochs": 50, "batch_size": 32},
            "threat_detector": {"n_estimators": 200},
            "capacity_forecaster": {"n_estimators": 500}
        }
    }
    """
    try:
        models_to_train = request.get('models', ['failure_predictor', 'threat_detector', 'capacity_forecaster'])
        use_synthetic = request.get('use_synthetic_data', True)
        n_samples = request.get('n_samples', 10000)
        
        logger.info(f"🚀 Starting training for models: {models_to_train}")
        
        # Generate or use provided training data
        if use_synthetic:
            logger.info(f"📊 Generating {n_samples} synthetic training samples")
            training_data = generate_synthetic_training_data(n_samples, "all")
        else:
            training_data = request.get('training_data', {})
        
        # Filter training data based on models to train
        filtered_data = {
            model: data for model, data in training_data.items()
            if model in models_to_train
        }
        
        # Train models
        results = await mlflow_pipeline.train_all_models(filtered_data)
        
        logger.info(f"✅ Training completed for {results['models_trained']} models")
        
        return {
            "status": "success",
            "message": f"Successfully trained {results['models_trained']} models",
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Model training error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v3/aiops/models/status", tags=["Training"])
async def get_models_status():
    """Get status of all ML models"""
    return {
        "models": {
            "lstm_failure_predictor": {
                "version": lstm_failure_predictor.model_version,
                "trained": lstm_failure_predictor.is_trained,
                "type": "LSTM",
                "framework": "Keras/TensorFlow"
            },
            "rf_threat_detector": {
                "version": rf_threat_detector.model_version,
                "trained": rf_threat_detector.is_trained,
                "type": "RandomForest",
                "framework": "scikit-learn"
            },
            "xgb_capacity_forecaster": {
                "version": xgb_capacity_forecaster.model_version,
                "trained": xgb_capacity_forecaster.is_trained,
                "type": "XGBoost",
                "framework": "XGBoost"
            },
            "legacy_failure_predictor": {
                "version": failure_predictor.model_version,
                "trained": failure_predictor.is_trained,
                "type": "Mock",
                "framework": "Python"
            },
            "anomaly_detector": {
                "version": anomaly_detector.model_version,
                "trained": anomaly_detector.is_trained,
                "type": "Mock",
                "framework": "Python"
            }
        },
        "mlflow": {
            "tracking_uri": mlflow_pipeline.mlflow_tracking_uri,
            "experiment_name": mlflow_pipeline.experiment_name
        },
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/v3/aiops/models/register", tags=["Training"])
async def register_model(request: Dict[str, Any]):
    """
    Register a trained model in MLflow Model Registry.
    
    Request body:
    {
        "run_id": "abc123...",
        "model_name": "lstm_failure_predictor_v1",
        "tags": {
            "environment": "production",
            "version": "1.0.0"
        }
    }
    """
    try:
        run_id = request.get('run_id')
        model_name = request.get('model_name')
        tags = request.get('tags', {})
        
        if not run_id or not model_name:
            raise HTTPException(
                status_code=400,
                detail="run_id and model_name are required"
            )
        
        version = mlflow_pipeline.register_model(run_id, model_name, tags)
        
        return {
            "status": "success",
            "model_name": model_name,
            "version": version,
            "message": f"Model registered successfully as {model_name} v{version}"
        }
        
    except Exception as e:
        logger.error(f"❌ Model registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Enhanced Prediction Endpoints (using new models when trained)
# ============================================================================

@app.post("/api/v3/aiops/predict/failure/enhanced", tags=["Predictions"])
async def predict_failure_enhanced(request: Dict[str, Any]):
    """
    Enhanced failure prediction using LSTM model.
    Falls back to legacy predictor if LSTM model not trained.
    
    Request body:
    {
        "service_name": "api-gateway",
        "time_series": [
            {"cpu_usage": 75, "memory_usage": 80, "disk_io": 300, ...},
            ...  // 24 data points (hourly for 24 hours)
        ]
    }
    """
    try:
        logger.info(f"Enhanced failure prediction for {request.get('service_name')}")
        
        # Use LSTM model if trained, otherwise fall back
        if lstm_failure_predictor.is_trained:
            result = await lstm_failure_predictor.predict(request)
        else:
            result = await failure_predictor.predict(request)
            result['note'] = "Using legacy predictor - LSTM model not yet trained"
        
        service_stats["predictions_count"] += 1
        return result
        
    except Exception as e:
        logger.error(f"Enhanced failure prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v3/aiops/predict/threat/enhanced", tags=["Security"])
async def detect_threat_enhanced(request: Dict[str, Any]):
    """
    Enhanced threat detection using Random Forest model.
    Falls back to legacy detector if RF model not trained.
    
    Request body:
    {
        "service_name": "web-server",
        "metrics": {
            "request_rate": 1500,
            "failed_auth_count": 25,
            "unique_ips": 150,
            ...
        }
    }
    """
    try:
        logger.info(f"Enhanced threat detection for {request.get('service_name')}")
        
        # Use RF model if trained, otherwise fall back
        if rf_threat_detector.is_trained:
            result = await rf_threat_detector.detect(request)
        else:
            result = await threat_detector.detect(request)
            result['note'] = "Using legacy detector - RF model not yet trained"
        
        service_stats["predictions_count"] += 1
        return result
        
    except Exception as e:
        logger.error(f"Enhanced threat detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v3/aiops/predict/capacity/enhanced", tags=["Predictions"])
async def forecast_capacity_enhanced(request: Dict[str, Any]):
    """
    Enhanced capacity forecasting using XGBoost model.
    Falls back to legacy forecaster if XGBoost model not trained.
    
    Request body:
    {
        "service_name": "database",
        "current_metrics": {
            "cpu_usage": 65,
            "memory_usage": 70,
            "storage_usage": 75,
            "request_rate": 500,
            "user_count": 1000,
            "transaction_count": 50000,
            "growth_rate_7d": 0.05,
            "growth_rate_30d": 0.10
        },
        "forecast_days": 30
    }
    """
    try:
        logger.info(f"Enhanced capacity forecast for {request.get('service_name')}")
        
        # Use XGBoost model if trained, otherwise fall back
        if xgb_capacity_forecaster.is_trained:
            result = await xgb_capacity_forecaster.forecast(request)
        else:
            result = await capacity_forecaster.forecast(request)
            result['note'] = "Using legacy forecaster - XGBoost model not yet trained"
        
        service_stats["predictions_count"] += 1
        return result
        
    except Exception as e:
        logger.error(f"Enhanced capacity forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Startup Event
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    logger.info("=" * 60)
    logger.info("IAC Dharma AIOps Engine v3.0 - Starting...")
    logger.info("=" * 60)
    logger.info("🤖 ML Models:")
    logger.info(f"  ✓ LSTM Failure Predictor (v{lstm_failure_predictor.model_version}) - {'Trained' if lstm_failure_predictor.is_trained else 'Not Trained'}")
    logger.info(f"  ✓ RF Threat Detector (v{rf_threat_detector.model_version}) - {'Trained' if rf_threat_detector.is_trained else 'Not Trained'}")
    logger.info(f"  ✓ XGBoost Capacity Forecaster (v{xgb_capacity_forecaster.model_version}) - {'Trained' if xgb_capacity_forecaster.is_trained else 'Not Trained'}")
    logger.info(f"  ✓ Anomaly Detector (v{anomaly_detector.model_version})")
    logger.info("=" * 60)
    logger.info(f"📊 MLflow: {mlflow_pipeline.mlflow_tracking_uri}")
    logger.info("=" * 60)
    logger.info("🚀 AIOps Engine ready on port 8100")
    logger.info("📚 API docs: http://localhost:8100/docs")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8100)
