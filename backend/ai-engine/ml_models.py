import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

class CostPredictor:
    """
    Advanced ML model for infrastructure cost prediction
    """
    
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_features(self, data: pd.DataFrame) -> np.ndarray:
        """
        Prepare features from historical cost data
        """
        features = []
        
        for _, row in data.iterrows():
            feature_vector = [
                row.get('cpu_hours', 0),
                row.get('memory_gb_hours', 0),
                row.get('storage_gb', 0),
                row.get('network_gb', 0),
                row.get('num_instances', 0),
                row.get('avg_cpu_utilization', 0),
                row.get('avg_memory_utilization', 0),
                row.get('peak_requests_per_hour', 0),
                int(row.get('is_weekend', False)),
                int(row.get('is_business_hours', False)),
            ]
            features.append(feature_vector)
            
        return np.array(features)
    
    def train(self, historical_data: pd.DataFrame):
        """
        Train the cost prediction model
        """
        X = self.prepare_features(historical_data)
        y = historical_data['total_cost'].values
        
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        print(f"✅ Cost prediction model trained with {len(X)} samples")
        
    def predict(self, features: Dict) -> float:
        """
        Predict cost for given features
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")
            
        feature_vector = np.array([[
            features.get('cpu_hours', 0),
            features.get('memory_gb_hours', 0),
            features.get('storage_gb', 0),
            features.get('network_gb', 0),
            features.get('num_instances', 0),
            features.get('avg_cpu_utilization', 0),
            features.get('avg_memory_utilization', 0),
            features.get('peak_requests_per_hour', 0),
            int(features.get('is_weekend', False)),
            int(features.get('is_business_hours', False)),
        ]])
        
        X_scaled = self.scaler.transform(feature_vector)
        prediction = self.model.predict(X_scaled)[0]
        
        return max(0, prediction)  # Ensure non-negative
    
    def save_model(self, path: str):
        """Save trained model to disk"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'is_trained': self.is_trained
        }, path)
        print(f"✅ Model saved to {path}")
        
    def load_model(self, path: str):
        """Load trained model from disk"""
        data = joblib.load(path)
        self.model = data['model']
        self.scaler = data['scaler']
        self.is_trained = data['is_trained']
        print(f"✅ Model loaded from {path}")


class DriftPredictor:
    """
    Predict infrastructure drift using anomaly detection
    """
    
    def __init__(self):
        from sklearn.ensemble import IsolationForest
        self.model = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.is_trained = False
        
    def train(self, normal_configs: List[Dict]):
        """
        Train on normal infrastructure configurations
        """
        features = self._extract_features(normal_configs)
        self.model.fit(features)
        self.is_trained = True
        print(f"✅ Drift detection model trained with {len(features)} samples")
        
    def _extract_features(self, configs: List[Dict]) -> np.ndarray:
        """Extract numerical features from configurations"""
        features = []
        
        for config in configs:
            feature_vector = [
                config.get('num_resources', 0),
                config.get('num_vpc', 0),
                config.get('num_subnets', 0),
                config.get('num_security_groups', 0),
                config.get('num_instances', 0),
                config.get('total_cpu', 0),
                config.get('total_memory_gb', 0),
                config.get('total_storage_gb', 0),
                int(config.get('has_load_balancer', False)),
                int(config.get('has_auto_scaling', False)),
            ]
            features.append(feature_vector)
            
        return np.array(features)
    
    def predict_drift(self, current_config: Dict) -> Tuple[bool, float]:
        """
        Predict if configuration has drifted
        Returns: (is_drift, anomaly_score)
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")
            
        features = self._extract_features([current_config])
        prediction = self.model.predict(features)[0]
        score = self.model.score_samples(features)[0]
        
        is_drift = prediction == -1  # -1 indicates anomaly
        return is_drift, abs(score)


class ResourceOptimizer:
    """
    ML-based resource optimization recommendations
    """
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )
        self.is_trained = False
        
    def train(self, historical_usage: pd.DataFrame):
        """
        Train on historical resource usage patterns
        """
        features = historical_usage[['requested_cpu', 'requested_memory', 'hour_of_day', 'day_of_week']].values
        targets = historical_usage[['actual_cpu_usage', 'actual_memory_usage']].values
        
        self.model.fit(features, targets)
        self.is_trained = True
        print(f"✅ Resource optimizer trained with {len(features)} samples")
        
    def recommend_sizing(self, current_config: Dict) -> Dict:
        """
        Recommend optimal resource sizing
        """
        if not self.is_trained:
            return {
                'recommended_cpu': current_config.get('cpu', 2),
                'recommended_memory': current_config.get('memory', 4),
                'confidence': 0.0
            }
            
        # Get predictions for different times of day
        predictions = []
        for hour in range(24):
            for day in range(7):
                features = np.array([[
                    current_config.get('cpu', 2),
                    current_config.get('memory', 4),
                    hour,
                    day
                ]])
                pred = self.model.predict(features)[0]
                predictions.append(pred)
        
        predictions = np.array(predictions)
        
        # Use 95th percentile for recommendations
        recommended_cpu = np.percentile(predictions[:, 0], 95)
        recommended_memory = np.percentile(predictions[:, 1], 95)
        
        # Add 20% buffer for safety
        recommended_cpu *= 1.2
        recommended_memory *= 1.2
        
        return {
            'recommended_cpu': round(recommended_cpu, 2),
            'recommended_memory': round(recommended_memory, 2),
            'current_cpu': current_config.get('cpu', 2),
            'current_memory': current_config.get('memory', 4),
            'potential_savings_pct': self._calculate_savings(
                current_config.get('cpu', 2),
                current_config.get('memory', 4),
                recommended_cpu,
                recommended_memory
            )
        }
    
    def _calculate_savings(self, current_cpu, current_memory, recommended_cpu, recommended_memory) -> float:
        """Calculate potential cost savings percentage"""
        current_cost = current_cpu * 0.05 + current_memory * 0.01  # Simplified pricing
        recommended_cost = recommended_cpu * 0.05 + recommended_memory * 0.01
        
        if current_cost == 0:
            return 0
            
        savings = ((current_cost - recommended_cost) / current_cost) * 100
        return round(max(0, savings), 2)


class AnomalyDetector:
    """
    Detect anomalies in infrastructure metrics
    """
    
    def __init__(self):
        from sklearn.ensemble import IsolationForest
        self.model = IsolationForest(
            contamination=0.05,
            random_state=42
        )
        self.is_trained = False
        
    def train(self, normal_metrics: pd.DataFrame):
        """
        Train on normal operational metrics
        """
        features = normal_metrics[['cpu_usage', 'memory_usage', 'network_io', 'disk_io', 'error_rate']].values
        self.model.fit(features)
        self.is_trained = True
        print(f"✅ Anomaly detector trained with {len(features)} samples")
        
    def detect(self, current_metrics: Dict) -> Tuple[bool, str, float]:
        """
        Detect anomalies in current metrics
        Returns: (is_anomaly, severity, confidence)
        """
        if not self.is_trained:
            return False, 'normal', 0.0
            
        features = np.array([[
            current_metrics.get('cpu_usage', 0),
            current_metrics.get('memory_usage', 0),
            current_metrics.get('network_io', 0),
            current_metrics.get('disk_io', 0),
            current_metrics.get('error_rate', 0)
        ]])
        
        prediction = self.model.predict(features)[0]
        score = self.model.score_samples(features)[0]
        
        is_anomaly = prediction == -1
        
        if not is_anomaly:
            return False, 'normal', 0.0
            
        # Determine severity based on anomaly score
        abs_score = abs(score)
        if abs_score > 0.5:
            severity = 'critical'
        elif abs_score > 0.3:
            severity = 'high'
        elif abs_score > 0.1:
            severity = 'medium'
        else:
            severity = 'low'
            
        return True, severity, round(abs_score, 3)


# Global model instances
cost_predictor = CostPredictor()
drift_predictor = DriftPredictor()
resource_optimizer = ResourceOptimizer()
anomaly_detector = AnomalyDetector()

def initialize_models(data_path: str = './ml-models'):
    """Initialize all ML models"""
    try:
        cost_predictor.load_model(f'{data_path}/cost_predictor.pkl')
        print("✅ All ML models initialized")
    except Exception as e:
        print(f"⚠️  No pre-trained models found. Models will need training: {e}")
