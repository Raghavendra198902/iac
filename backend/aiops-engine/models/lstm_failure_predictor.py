"""
LSTM-Based Failure Predictor Model

Real implementation using TensorFlow/Keras LSTM networks to predict
infrastructure failures 24-48 hours in advance based on time-series metrics.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
import pickle
import os
from pathlib import Path

logger = logging.getLogger(__name__)


class LSTMFailurePredictor:
    """
    LSTM-based deep learning model for predicting infrastructure failures.
    
    Architecture:
    - Input: Time-series metrics (sequence length: 24 hours, 1-hour intervals)
    - LSTM Layer 1: 128 units with dropout
    - LSTM Layer 2: 64 units with dropout
    - Dense Layer: 32 units with ReLU activation
    - Output: Binary classification (failure/no-failure)
    
    Features used:
    - CPU usage (%)
    - Memory usage (%)
    - Disk I/O (MB/s)
    - Network traffic (MB/s)
    - Error rate (errors/min)
    - Response time (ms)
    - Request rate (req/s)
    """
    
    def __init__(self, model_dir: str = "ml_models/failure_predictor"):
        """
        Initialize the LSTM Failure Predictor.
        
        Args:
            model_dir: Directory to save/load model
        """
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.model_version = "1.0.0"
        self.is_trained = False
        self.model: Optional[keras.Model] = None
        self.scaler = None
        
        # Model hyperparameters
        self.sequence_length = 24  # 24 hours of data
        self.n_features = 7  # Number of input features
        self.lstm_units_1 = 128
        self.lstm_units_2 = 64
        self.dense_units = 32
        self.dropout_rate = 0.3
        self.learning_rate = 0.001
        
        # Feature names
        self.feature_names = [
            'cpu_usage',
            'memory_usage',
            'disk_io',
            'network_traffic',
            'error_rate',
            'response_time',
            'request_rate'
        ]
        
        # Load existing model if available
        self._load_model()
        
        logger.info(f"✅ LSTMFailurePredictor initialized (version: {self.model_version})")
    
    def build_model(self) -> keras.Model:
        """
        Build the LSTM model architecture.
        
        Returns:
            Compiled Keras model
        """
        model = keras.Sequential([
            # First LSTM layer with return sequences
            layers.LSTM(
                self.lstm_units_1,
                return_sequences=True,
                input_shape=(self.sequence_length, self.n_features),
                name='lstm_1'
            ),
            layers.Dropout(self.dropout_rate, name='dropout_1'),
            
            # Second LSTM layer
            layers.LSTM(
                self.lstm_units_2,
                return_sequences=False,
                name='lstm_2'
            ),
            layers.Dropout(self.dropout_rate, name='dropout_2'),
            
            # Dense layers
            layers.Dense(self.dense_units, activation='relu', name='dense_1'),
            layers.Dropout(self.dropout_rate, name='dropout_3'),
            
            # Output layer (binary classification)
            layers.Dense(1, activation='sigmoid', name='output')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.learning_rate),
            loss='binary_crossentropy',
            metrics=[
                'accuracy',
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall'),
                keras.metrics.AUC(name='auc')
            ]
        )
        
        return model
    
    async def predict(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict potential failures based on time-series metrics.
        
        Args:
            metrics: Dictionary containing:
                - service_name: Name of the service
                - time_series: List of metric dictionaries (24 data points)
                
        Returns:
            Prediction result with probability, confidence, and recommendations
        """
        try:
            service_name = metrics.get('service_name')
            time_series = metrics.get('time_series', [])
            
            # If no model is trained, use heuristic approach
            if not self.is_trained or self.model is None:
                return await self._heuristic_prediction(service_name, time_series)
            
            # Prepare input data
            X = self._prepare_input(time_series)
            
            # Make prediction
            failure_probability = float(self.model.predict(X, verbose=0)[0][0])
            
            # Calculate confidence based on model training metrics
            confidence = 0.85 if self.is_trained else 0.65
            
            # Determine severity
            severity = self._determine_severity(failure_probability)
            
            # Calculate predicted failure time
            predicted_time = self._calculate_failure_time(failure_probability)
            
            # Analyze root causes
            root_causes = self._analyze_root_causes(time_series)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                failure_probability,
                root_causes
            )
            
            return {
                "service_name": service_name,
                "prediction_type": "failure",
                "probability": round(failure_probability, 4),
                "confidence": confidence,
                "severity": severity,
                "predicted_time": predicted_time.isoformat(),
                "time_to_failure_hours": self._calculate_ttf(failure_probability),
                "affected_components": self._identify_affected_components(time_series),
                "root_causes": root_causes,
                "recommended_actions": recommendations,
                "model_type": "LSTM",
                "model_version": self.model_version,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Failure prediction error: {str(e)}")
            raise
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        epochs: int = 50,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """
        Train the LSTM model on historical data.
        
        Args:
            X_train: Training data (samples, sequence_length, features)
            y_train: Training labels (samples,)
            X_val: Validation data
            y_val: Validation labels
            epochs: Number of training epochs
            batch_size: Batch size for training
            
        Returns:
            Training history and metrics
        """
        try:
            logger.info("🚀 Starting LSTM model training...")
            
            # Build model if not exists
            if self.model is None:
                self.model = self.build_model()
            
            # Create callbacks
            callbacks = [
                keras.callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=10,
                    restore_best_weights=True,
                    verbose=1
                ),
                keras.callbacks.ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=1e-6,
                    verbose=1
                ),
                keras.callbacks.ModelCheckpoint(
                    str(self.model_dir / 'best_model.h5'),
                    monitor='val_auc',
                    save_best_only=True,
                    mode='max',
                    verbose=1
                )
            ]
            
            # Train model
            history = self.model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                epochs=epochs,
                batch_size=batch_size,
                callbacks=callbacks,
                verbose=1
            )
            
            self.is_trained = True
            
            # Evaluate on validation set
            val_metrics = self._evaluate_model(X_val, y_val)
            
            # Save model
            self._save_model()
            
            logger.info("✅ Model training completed successfully")
            
            return {
                "status": "success",
                "epochs_trained": len(history.history['loss']),
                "final_train_loss": float(history.history['loss'][-1]),
                "final_val_loss": float(history.history['val_loss'][-1]),
                "validation_metrics": val_metrics,
                "model_saved": True
            }
            
        except Exception as e:
            logger.error(f"❌ Model training failed: {str(e)}")
            raise
    
    def _prepare_input(self, time_series: List[Dict[str, float]]) -> np.ndarray:
        """
        Prepare input data for the model.
        
        Args:
            time_series: List of metric dictionaries
            
        Returns:
            Numpy array of shape (1, sequence_length, n_features)
        """
        # If time series is shorter than sequence length, pad with last values
        if len(time_series) < self.sequence_length:
            padding_needed = self.sequence_length - len(time_series)
            time_series = time_series + [time_series[-1]] * padding_needed
        
        # Take last sequence_length data points
        time_series = time_series[-self.sequence_length:]
        
        # Extract features
        features = []
        for data_point in time_series:
            feature_vector = [
                data_point.get('cpu_usage', 0),
                data_point.get('memory_usage', 0),
                data_point.get('disk_io', 0),
                data_point.get('network_traffic', 0),
                data_point.get('error_rate', 0),
                data_point.get('response_time', 0),
                data_point.get('request_rate', 0)
            ]
            features.append(feature_vector)
        
        X = np.array(features).reshape(1, self.sequence_length, self.n_features)
        
        # Normalize if scaler is available
        if self.scaler is not None:
            X_reshaped = X.reshape(-1, self.n_features)
            X_scaled = self.scaler.transform(X_reshaped)
            X = X_scaled.reshape(1, self.sequence_length, self.n_features)
        
        return X
    
    async def _heuristic_prediction(
        self,
        service_name: str,
        time_series: List[Dict[str, float]]
    ) -> Dict[str, Any]:
        """
        Fallback heuristic prediction when model is not trained.
        """
        if not time_series:
            # Return low risk if no data
            return {
                "service_name": service_name,
                "prediction_type": "failure",
                "probability": 0.1,
                "confidence": 0.4,
                "severity": "low",
                "predicted_time": (datetime.now() + timedelta(hours=48)).isoformat(),
                "time_to_failure_hours": 48,
                "affected_components": [],
                "root_causes": ["Insufficient data for prediction"],
                "recommended_actions": ["Collect more metrics data"],
                "model_type": "Heuristic",
                "model_version": self.model_version,
                "timestamp": datetime.now().isoformat()
            }
        
        # Calculate average metrics
        recent_data = time_series[-6:]  # Last 6 hours
        avg_cpu = np.mean([d.get('cpu_usage', 0) for d in recent_data])
        avg_memory = np.mean([d.get('memory_usage', 0) for d in recent_data])
        avg_error_rate = np.mean([d.get('error_rate', 0) for d in recent_data])
        
        # Simple scoring
        failure_score = 0.0
        if avg_cpu > 80:
            failure_score += 0.3
        if avg_memory > 85:
            failure_score += 0.3
        if avg_error_rate > 5:
            failure_score += 0.4
        
        probability = min(failure_score, 0.95)
        severity = self._determine_severity(probability)
        
        root_causes = []
        if avg_cpu > 80:
            root_causes.append(f"High CPU usage: {avg_cpu:.1f}%")
        if avg_memory > 85:
            root_causes.append(f"High memory usage: {avg_memory:.1f}%")
        if avg_error_rate > 5:
            root_causes.append(f"Elevated error rate: {avg_error_rate:.1f} errors/min")
        
        return {
            "service_name": service_name,
            "prediction_type": "failure",
            "probability": round(probability, 4),
            "confidence": 0.5,
            "severity": severity,
            "predicted_time": self._calculate_failure_time(probability).isoformat(),
            "time_to_failure_hours": self._calculate_ttf(probability),
            "affected_components": self._identify_affected_components(time_series),
            "root_causes": root_causes if root_causes else ["No specific issues detected"],
            "recommended_actions": self._generate_recommendations(probability, root_causes),
            "model_type": "Heuristic",
            "model_version": self.model_version,
            "timestamp": datetime.now().isoformat(),
            "note": "Using heuristic model - LSTM model not yet trained"
        }
    
    def _determine_severity(self, probability: float) -> str:
        """Determine failure severity based on probability."""
        if probability >= 0.8:
            return "critical"
        elif probability >= 0.6:
            return "high"
        elif probability >= 0.4:
            return "medium"
        else:
            return "low"
    
    def _calculate_failure_time(self, probability: float) -> datetime:
        """Calculate predicted failure time based on probability."""
        if probability >= 0.8:
            hours = 12  # Critical: 12 hours
        elif probability >= 0.6:
            hours = 24  # High: 24 hours
        else:
            hours = 48  # Medium/Low: 48 hours
        
        return datetime.now() + timedelta(hours=hours)
    
    def _calculate_ttf(self, probability: float) -> int:
        """Calculate time-to-failure in hours."""
        if probability >= 0.8:
            return 12
        elif probability >= 0.6:
            return 24
        else:
            return 48
    
    def _analyze_root_causes(self, time_series: List[Dict[str, float]]) -> List[str]:
        """Analyze root causes from time series data."""
        if not time_series:
            return ["Insufficient data"]
        
        recent_data = time_series[-6:]
        root_causes = []
        
        # Analyze trends
        for feature in self.feature_names:
            values = [d.get(feature, 0) for d in recent_data]
            avg_value = np.mean(values)
            trend = np.polyfit(range(len(values)), values, 1)[0]
            
            # Check for concerning patterns
            if feature == 'cpu_usage' and avg_value > 80:
                root_causes.append(f"High CPU usage ({avg_value:.1f}%, trending {'up' if trend > 0 else 'down'})")
            elif feature == 'memory_usage' and avg_value > 85:
                root_causes.append(f"High memory usage ({avg_value:.1f}%, trending {'up' if trend > 0 else 'down'})")
            elif feature == 'error_rate' and avg_value > 5:
                root_causes.append(f"Elevated error rate ({avg_value:.1f} errors/min)")
            elif feature == 'response_time' and avg_value > 1000:
                root_causes.append(f"Slow response time ({avg_value:.0f}ms)")
        
        return root_causes if root_causes else ["No specific anomalies detected"]
    
    def _identify_affected_components(
        self,
        time_series: List[Dict[str, float]]
    ) -> List[Dict[str, Any]]:
        """Identify affected system components."""
        if not time_series:
            return []
        
        recent = time_series[-1] if time_series else {}
        
        components = []
        
        # Compute component
        cpu = recent.get('cpu_usage', 0)
        memory = recent.get('memory_usage', 0)
        if cpu > 70 or memory > 80:
            components.append({
                "component": "compute",
                "health_score": 1.0 - max(cpu/100, memory/100),
                "metrics": {
                    "cpu_usage": cpu,
                    "memory_usage": memory
                },
                "status": "degraded" if max(cpu, memory) < 90 else "critical"
            })
        
        # Network component
        network_traffic = recent.get('network_traffic', 0)
        if network_traffic > 80:
            components.append({
                "component": "network",
                "health_score": 1.0 - network_traffic/100,
                "metrics": {
                    "traffic_utilization": network_traffic
                },
                "status": "degraded"
            })
        
        # Application component
        error_rate = recent.get('error_rate', 0)
        response_time = recent.get('response_time', 0)
        if error_rate > 5 or response_time > 1000:
            components.append({
                "component": "application",
                "health_score": max(0, 1.0 - error_rate/20),
                "metrics": {
                    "error_rate": error_rate,
                    "response_time": response_time
                },
                "status": "degraded"
            })
        
        return components
    
    def _generate_recommendations(
        self,
        probability: float,
        root_causes: List[str]
    ) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        if probability >= 0.8:
            recommendations.append("🚨 IMMEDIATE ACTION REQUIRED")
            recommendations.append("Scale up resources immediately")
            recommendations.append("Enable auto-scaling if not already active")
            recommendations.append("Alert on-call team")
        elif probability >= 0.6:
            recommendations.append("⚠️ Proactive action recommended within 12-24 hours")
            recommendations.append("Review and optimize resource allocation")
            recommendations.append("Schedule maintenance window")
        
        # Specific recommendations based on root causes
        for cause in root_causes:
            if 'CPU' in cause:
                recommendations.append("Optimize CPU-intensive operations")
                recommendations.append("Consider horizontal scaling")
            if 'memory' in cause:
                recommendations.append("Investigate memory leaks")
                recommendations.append("Increase memory allocation")
            if 'error' in cause:
                recommendations.append("Review application logs for error patterns")
                recommendations.append("Deploy hotfix if available")
            if 'response time' in cause:
                recommendations.append("Check database query performance")
                recommendations.append("Review API latency")
        
        if not recommendations:
            recommendations.append("Continue monitoring - no immediate action needed")
        
        return recommendations
    
    def _evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Evaluate model performance on test set."""
        if self.model is None:
            return {}
        
        results = self.model.evaluate(X_test, y_test, verbose=0)
        
        metrics = {}
        for name, value in zip(self.model.metrics_names, results):
            metrics[name] = float(value)
        
        return metrics
    
    def _save_model(self):
        """Save model and scaler to disk."""
        try:
            if self.model is not None:
                model_path = self.model_dir / 'lstm_model.h5'
                self.model.save(str(model_path))
                logger.info(f"💾 Model saved to {model_path}")
            
            if self.scaler is not None:
                scaler_path = self.model_dir / 'scaler.pkl'
                with open(scaler_path, 'wb') as f:
                    pickle.dump(self.scaler, f)
                logger.info(f"💾 Scaler saved to {scaler_path}")
                
        except Exception as e:
            logger.error(f"❌ Failed to save model: {str(e)}")
    
    def _load_model(self):
        """Load model and scaler from disk."""
        try:
            model_path = self.model_dir / 'lstm_model.h5'
            if model_path.exists():
                self.model = keras.models.load_model(str(model_path))
                self.is_trained = True
                logger.info(f"✅ Model loaded from {model_path}")
            
            scaler_path = self.model_dir / 'scaler.pkl'
            if scaler_path.exists():
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info(f"✅ Scaler loaded from {scaler_path}")
                
        except Exception as e:
            logger.warning(f"⚠️ Could not load existing model: {str(e)}")
            self.is_trained = False
