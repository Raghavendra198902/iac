"""
MLflow Model Training Pipeline

Unified pipeline for training, tracking, and versioning all AIOps ML models.
Integrates with MLflow for experiment tracking and model registry.
"""

import mlflow
import mlflow.keras
import mlflow.sklearn
import mlflow.xgboost
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from pathlib import Path

from models.lstm_failure_predictor import LSTMFailurePredictor
from models.rf_threat_detector import RFThreatDetector
from models.xgb_capacity_forecaster import XGBoostCapacityForecaster

logger = logging.getLogger(__name__)


class MLflowTrainingPipeline:
    """
    Unified ML training pipeline with MLflow experiment tracking.
    
    Features:
    - Experiment tracking
    - Parameter logging
    - Metric logging
    - Model versioning
    - Model registry integration
    - Artifact storage
    """
    
    def __init__(
        self,
        mlflow_tracking_uri: str = "http://localhost:5000",
        experiment_name: str = "aiops-models"
    ):
        """
        Initialize MLflow training pipeline.
        
        Args:
            mlflow_tracking_uri: MLflow tracking server URI
            experiment_name: Name of the experiment
        """
        self.mlflow_tracking_uri = mlflow_tracking_uri
        self.experiment_name = experiment_name
        
        # Set MLflow tracking URI
        mlflow.set_tracking_uri(mlflow_tracking_uri)
        
        # Create or get experiment
        try:
            self.experiment_id = mlflow.create_experiment(experiment_name)
        except:
            experiment = mlflow.get_experiment_by_name(experiment_name)
            self.experiment_id = experiment.experiment_id
        
        mlflow.set_experiment(experiment_name)
        
        logger.info(f"✅ MLflow pipeline initialized (experiment: {experiment_name})")
    
    async def train_failure_predictor(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        hyperparameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Train LSTM Failure Predictor model with MLflow tracking.
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_val: Validation features
            y_val: Validation labels
            hyperparameters: Optional hyperparameter overrides
            
        Returns:
            Training results and metrics
        """
        with mlflow.start_run(run_name="lstm_failure_predictor"):
            try:
                logger.info("🚀 Training LSTM Failure Predictor...")
                
                # Initialize model
                model = LSTMFailurePredictor()
                
                # Log hyperparameters
                params = {
                    "model_type": "LSTM",
                    "sequence_length": model.sequence_length,
                    "n_features": model.n_features,
                    "lstm_units_1": model.lstm_units_1,
                    "lstm_units_2": model.lstm_units_2,
                    "dense_units": model.dense_units,
                    "dropout_rate": model.dropout_rate,
                    "learning_rate": model.learning_rate,
                }
                
                if hyperparameters:
                    params.update(hyperparameters)
                
                mlflow.log_params(params)
                
                # Train model
                results = model.train(
                    X_train, y_train,
                    X_val, y_val,
                    epochs=hyperparameters.get('epochs', 50) if hyperparameters else 50,
                    batch_size=hyperparameters.get('batch_size', 32) if hyperparameters else 32
                )
                
                # Log metrics
                mlflow.log_metrics({
                    "final_train_loss": results['final_train_loss'],
                    "final_val_loss": results['final_val_loss'],
                    "val_accuracy": results['validation_metrics'].get('accuracy', 0),
                    "val_precision": results['validation_metrics'].get('precision', 0),
                    "val_recall": results['validation_metrics'].get('recall', 0),
                    "val_auc": results['validation_metrics'].get('auc', 0)
                })
                
                # Log model
                mlflow.keras.log_model(model.model, "model")
                
                # Tag the run
                mlflow.set_tags({
                    "model_type": "failure_predictor",
                    "framework": "keras",
                    "version": model.model_version
                })
                
                logger.info("✅ LSTM Failure Predictor training completed")
                
                return {
                    "status": "success",
                    "model_type": "lstm_failure_predictor",
                    "run_id": mlflow.active_run().info.run_id,
                    "metrics": results
                }
                
            except Exception as e:
                logger.error(f"❌ Training failed: {str(e)}")
                mlflow.log_param("error", str(e))
                raise
    
    async def train_threat_detector(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        hyperparameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Train Random Forest Threat Detector with MLflow tracking.
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_val: Validation features
            y_val: Validation labels
            hyperparameters: Optional hyperparameter overrides
            
        Returns:
            Training results and metrics
        """
        with mlflow.start_run(run_name="rf_threat_detector"):
            try:
                logger.info("🚀 Training Random Forest Threat Detector...")
                
                # Initialize model
                model = RFThreatDetector()
                
                # Override hyperparameters if provided
                if hyperparameters:
                    for key, value in hyperparameters.items():
                        if hasattr(model, key):
                            setattr(model, key, value)
                
                # Log hyperparameters
                params = {
                    "model_type": "RandomForest",
                    "n_estimators": model.n_estimators,
                    "max_depth": model.max_depth,
                    "min_samples_split": model.min_samples_split,
                    "min_samples_leaf": model.min_samples_leaf,
                    "max_features": model.max_features,
                }
                mlflow.log_params(params)
                
                # Train model
                results = model.train(X_train, y_train, X_val, y_val)
                
                # Log metrics
                mlflow.log_metric("validation_accuracy", results['validation_accuracy'])
                
                # Log classification report metrics
                report = results['classification_report']
                for class_name, metrics in report.items():
                    if isinstance(metrics, dict):
                        for metric_name, value in metrics.items():
                            mlflow.log_metric(
                                f"{class_name}_{metric_name}",
                                value
                            )
                
                # Log feature importance as artifact
                import json
                with open("feature_importance.json", "w") as f:
                    json.dump(results['feature_importance'], f, indent=2)
                mlflow.log_artifact("feature_importance.json")
                
                # Log model
                mlflow.sklearn.log_model(model.model, "model")
                
                # Tag the run
                mlflow.set_tags({
                    "model_type": "threat_detector",
                    "framework": "sklearn",
                    "version": model.model_version
                })
                
                logger.info("✅ Random Forest Threat Detector training completed")
                
                return {
                    "status": "success",
                    "model_type": "rf_threat_detector",
                    "run_id": mlflow.active_run().info.run_id,
                    "metrics": results
                }
                
            except Exception as e:
                logger.error(f"❌ Training failed: {str(e)}")
                mlflow.log_param("error", str(e))
                raise
    
    async def train_capacity_forecaster(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        hyperparameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Train XGBoost Capacity Forecaster with MLflow tracking.
        
        Args:
            X_train: Training features
            y_train: Training targets
            X_val: Validation features
            y_val: Validation targets
            hyperparameters: Optional hyperparameter overrides
            
        Returns:
            Training results and metrics
        """
        with mlflow.start_run(run_name="xgb_capacity_forecaster"):
            try:
                logger.info("🚀 Training XGBoost Capacity Forecaster...")
                
                # Initialize model
                model = XGBoostCapacityForecaster()
                
                # Override hyperparameters if provided
                if hyperparameters:
                    for key, value in hyperparameters.items():
                        if hasattr(model, key):
                            setattr(model, key, value)
                
                # Log hyperparameters
                params = {
                    "model_type": "XGBoost",
                    "n_estimators": model.n_estimators,
                    "max_depth": model.max_depth,
                    "learning_rate": model.learning_rate,
                    "subsample": model.subsample,
                    "colsample_bytree": model.colsample_bytree,
                    "min_child_weight": model.min_child_weight,
                }
                mlflow.log_params(params)
                
                # Train model
                results = model.train(X_train, y_train, X_val, y_val)
                
                # Log metrics
                mlflow.log_metrics({
                    "train_r2_score": results['train_r2_score'],
                    "validation_r2_score": results['validation_r2_score'],
                    "train_rmse": results['train_rmse'],
                    "validation_rmse": results['validation_rmse'],
                    "train_mae": results['train_mae'],
                    "validation_mae": results['validation_mae']
                })
                
                # Log feature importance as artifact
                import json
                with open("feature_importance.json", "w") as f:
                    json.dump(results['feature_importance'], f, indent=2)
                mlflow.log_artifact("feature_importance.json")
                
                # Log model
                mlflow.xgboost.log_model(model.model, "model")
                
                # Tag the run
                mlflow.set_tags({
                    "model_type": "capacity_forecaster",
                    "framework": "xgboost",
                    "version": model.model_version
                })
                
                logger.info("✅ XGBoost Capacity Forecaster training completed")
                
                return {
                    "status": "success",
                    "model_type": "xgb_capacity_forecaster",
                    "run_id": mlflow.active_run().info.run_id,
                    "metrics": results
                }
                
            except Exception as e:
                logger.error(f"❌ Training failed: {str(e)}")
                mlflow.log_param("error", str(e))
                raise
    
    async def train_all_models(
        self,
        training_data: Dict[str, Dict[str, np.ndarray]]
    ) -> Dict[str, Any]:
        """
        Train all AIOps models in sequence.
        
        Args:
            training_data: Dictionary with training data for each model:
                {
                    "failure_predictor": {
                        "X_train": ..., "y_train": ...,
                        "X_val": ..., "y_val": ...
                    },
                    "threat_detector": {...},
                    "capacity_forecaster": {...}
                }
                
        Returns:
            Summary of all training results
        """
        results = {}
        
        # Train Failure Predictor
        if "failure_predictor" in training_data:
            data = training_data["failure_predictor"]
            results["failure_predictor"] = await self.train_failure_predictor(
                data["X_train"], data["y_train"],
                data["X_val"], data["y_val"]
            )
        
        # Train Threat Detector
        if "threat_detector" in training_data:
            data = training_data["threat_detector"]
            results["threat_detector"] = await self.train_threat_detector(
                data["X_train"], data["y_train"],
                data["X_val"], data["y_val"]
            )
        
        # Train Capacity Forecaster
        if "capacity_forecaster" in training_data:
            data = training_data["capacity_forecaster"]
            results["capacity_forecaster"] = await self.train_capacity_forecaster(
                data["X_train"], data["y_train"],
                data["X_val"], data["y_val"]
            )
        
        return {
            "status": "completed",
            "models_trained": len(results),
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_best_model(self, model_type: str, metric: str = "validation_accuracy") -> Optional[str]:
        """
        Get the best model run ID based on a metric.
        
        Args:
            model_type: Type of model (failure_predictor, threat_detector, capacity_forecaster)
            metric: Metric to optimize (e.g., "validation_accuracy", "val_auc", "validation_rmse")
            
        Returns:
            Run ID of the best model
        """
        try:
            # Search for runs with the model type tag
            runs = mlflow.search_runs(
                experiment_ids=[self.experiment_id],
                filter_string=f"tags.model_type = '{model_type}'",
                order_by=[f"metrics.{metric} DESC"],
                max_results=1
            )
            
            if len(runs) > 0:
                return runs.iloc[0]['run_id']
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get best model: {str(e)}")
            return None
    
    def load_model_from_registry(
        self,
        model_name: str,
        version: Optional[int] = None,
        stage: Optional[str] = None
    ) -> Any:
        """
        Load model from MLflow Model Registry.
        
        Args:
            model_name: Name of the model in registry
            version: Specific version to load
            stage: Stage to load from (e.g., "Production", "Staging")
            
        Returns:
            Loaded model
        """
        try:
            if version:
                model_uri = f"models:/{model_name}/{version}"
            elif stage:
                model_uri = f"models:/{model_name}/{stage}"
            else:
                model_uri = f"models:/{model_name}/latest"
            
            model = mlflow.pyfunc.load_model(model_uri)
            logger.info(f"✅ Model loaded from registry: {model_uri}")
            
            return model
            
        except Exception as e:
            logger.error(f"❌ Failed to load model from registry: {str(e)}")
            raise
    
    def register_model(
        self,
        run_id: str,
        model_name: str,
        tags: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Register model in MLflow Model Registry.
        
        Args:
            run_id: Run ID of the trained model
            model_name: Name for the registered model
            tags: Optional tags for the model
            
        Returns:
            Model version
        """
        try:
            model_uri = f"runs:/{run_id}/model"
            model_version = mlflow.register_model(model_uri, model_name)
            
            if tags:
                client = mlflow.tracking.MlflowClient()
                for key, value in tags.items():
                    client.set_model_version_tag(
                        model_name,
                        model_version.version,
                        key,
                        value
                    )
            
            logger.info(f"✅ Model registered: {model_name} version {model_version.version}")
            
            return model_version.version
            
        except Exception as e:
            logger.error(f"❌ Failed to register model: {str(e)}")
            raise
    
    def transition_model_stage(
        self,
        model_name: str,
        version: int,
        stage: str
    ):
        """
        Transition model to a different stage in the registry.
        
        Args:
            model_name: Name of the model
            version: Model version
            stage: Target stage ("Staging", "Production", "Archived")
        """
        try:
            client = mlflow.tracking.MlflowClient()
            client.transition_model_version_stage(
                name=model_name,
                version=version,
                stage=stage
            )
            
            logger.info(f"✅ Model {model_name} v{version} transitioned to {stage}")
            
        except Exception as e:
            logger.error(f"❌ Failed to transition model stage: {str(e)}")
            raise


# Convenience function for generating synthetic training data
def generate_synthetic_training_data(
    n_samples: int = 10000,
    model_type: str = "all"
) -> Dict[str, Dict[str, np.ndarray]]:
    """
    Generate synthetic training data for testing the pipeline.
    
    Args:
        n_samples: Number of samples to generate
        model_type: "all", "failure_predictor", "threat_detector", or "capacity_forecaster"
        
    Returns:
        Dictionary with training data
    """
    data = {}
    
    if model_type in ["all", "failure_predictor"]:
        # LSTM Failure Predictor data: (samples, sequence_length, features)
        X = np.random.rand(n_samples, 24, 7)  # 24 time steps, 7 features
        y = np.random.randint(0, 2, n_samples)  # Binary classification
        
        split = int(n_samples * 0.8)
        data["failure_predictor"] = {
            "X_train": X[:split],
            "y_train": y[:split],
            "X_val": X[split:],
            "y_val": y[split:]
        }
    
    if model_type in ["all", "threat_detector"]:
        # Random Forest Threat Detector data: (samples, features)
        X = np.random.rand(n_samples, 12)  # 12 features
        y = np.random.randint(0, 9, n_samples)  # 9 threat classes
        
        split = int(n_samples * 0.8)
        data["threat_detector"] = {
            "X_train": X[:split],
            "y_train": y[:split],
            "X_val": X[split:],
            "y_val": y[split:]
        }
    
    if model_type in ["all", "capacity_forecaster"]:
        # XGBoost Capacity Forecaster data: (samples, features)
        X = np.random.rand(n_samples, 15)  # 15 features
        y = np.random.rand(n_samples) * 100  # Capacity percentage (0-100)
        
        split = int(n_samples * 0.8)
        data["capacity_forecaster"] = {
            "X_train": X[:split],
            "y_train": y[:split],
            "X_val": X[split:],
            "y_val": y[split:]
        }
    
    return data
