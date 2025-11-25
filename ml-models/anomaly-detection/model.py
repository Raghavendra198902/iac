"""
Anomaly Detection Model for Infrastructure Monitoring
Detects unusual patterns in metrics using Isolation Forest and Statistical Methods
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from scipy import stats
from typing import Dict, List, Tuple
import json
import pickle
from datetime import datetime


class AnomalyDetectionModel:
    """
    Multi-method anomaly detection for infrastructure metrics
    Uses Isolation Forest, Z-Score, and IQR methods
    """
    
    def __init__(self, contamination: float = 0.1):
        """
        Initialize anomaly detection model
        
        Args:
            contamination: Expected proportion of anomalies (0.1 = 10%)
        """
        self.contamination = contamination
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.trained = False
        self.feature_names = []
        self.baseline_stats = {}
        
    def prepare_features(self, metrics_data: List[Dict]) -> Tuple[pd.DataFrame, List[str]]:
        """
        Prepare feature matrix from metrics data
        
        Args:
            metrics_data: List of metric dictionaries
            
        Returns:
            Tuple of (DataFrame, feature_names)
        """
        df = pd.DataFrame(metrics_data)
        
        # Extract timestamp if present
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
        
        # Select numerical features
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Remove any ID or index columns
        numeric_cols = [col for col in numeric_cols if col not in ['id', 'index']]
        
        feature_df = df[numeric_cols].copy()
        
        # Handle missing values
        feature_df = feature_df.fillna(feature_df.mean())
        
        return feature_df, numeric_cols
    
    def train(self, training_data: List[Dict]) -> Dict:
        """
        Train anomaly detection model
        
        Args:
            training_data: Normal/baseline metrics data
            
        Returns:
            Training summary dictionary
        """
        # Prepare features
        X, self.feature_names = self.prepare_features(training_data)
        
        # Calculate baseline statistics
        for col in X.columns:
            self.baseline_stats[col] = {
                'mean': float(X[col].mean()),
                'std': float(X[col].std()),
                'median': float(X[col].median()),
                'q1': float(X[col].quantile(0.25)),
                'q3': float(X[col].quantile(0.75)),
                'iqr': float(X[col].quantile(0.75) - X[col].quantile(0.25)),
                'min': float(X[col].min()),
                'max': float(X[col].max())
            }
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Isolation Forest
        self.isolation_forest.fit(X_scaled)
        
        self.trained = True
        
        # Calculate training summary
        predictions = self.isolation_forest.predict(X_scaled)
        anomaly_count = np.sum(predictions == -1)
        
        return {
            'training_samples': len(X),
            'features': self.feature_names,
            'detected_anomalies': int(anomaly_count),
            'contamination_rate': float(anomaly_count / len(X)),
            'baseline_stats': self.baseline_stats
        }
    
    def detect_anomalies(self, metrics_data: List[Dict], 
                        methods: List[str] = ['isolation_forest', 'z_score', 'iqr']) -> List[Dict]:
        """
        Detect anomalies using multiple methods
        
        Args:
            metrics_data: Metrics data to check for anomalies
            methods: List of detection methods to use
            
        Returns:
            List of detected anomalies with details
        """
        if not self.trained:
            raise ValueError("Model must be trained before detection")
        
        # Prepare features
        X, _ = self.prepare_features(metrics_data)
        
        # Ensure same feature order as training
        X = X[self.feature_names]
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        anomalies = []
        
        for idx, row in enumerate(X.values):
            anomaly_info = {
                'index': idx,
                'timestamp': metrics_data[idx].get('timestamp', None),
                'is_anomaly': False,
                'methods_detected': [],
                'scores': {},
                'affected_metrics': {}
            }
            
            # Method 1: Isolation Forest
            if 'isolation_forest' in methods:
                if_prediction = self.isolation_forest.predict([X_scaled[idx]])[0]
                if_score = self.isolation_forest.score_samples([X_scaled[idx]])[0]
                
                anomaly_info['scores']['isolation_forest'] = float(if_score)
                
                if if_prediction == -1:
                    anomaly_info['methods_detected'].append('isolation_forest')
            
            # Method 2: Z-Score
            if 'z_score' in methods:
                z_scores = {}
                for i, feature in enumerate(self.feature_names):
                    if self.baseline_stats[feature]['std'] > 0:
                        z_score = abs((row[i] - self.baseline_stats[feature]['mean']) / 
                                    self.baseline_stats[feature]['std'])
                        z_scores[feature] = float(z_score)
                        
                        if z_score > 3.0:  # 3 sigma rule
                            anomaly_info['affected_metrics'][feature] = {
                                'value': float(row[i]),
                                'expected': self.baseline_stats[feature]['mean'],
                                'z_score': z_score
                            }
                
                anomaly_info['scores']['z_score'] = z_scores
                
                if anomaly_info['affected_metrics']:
                    anomaly_info['methods_detected'].append('z_score')
            
            # Method 3: IQR (Interquartile Range)
            if 'iqr' in methods:
                iqr_anomalies = {}
                for i, feature in enumerate(self.feature_names):
                    q1 = self.baseline_stats[feature]['q1']
                    q3 = self.baseline_stats[feature]['q3']
                    iqr = self.baseline_stats[feature]['iqr']
                    
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    
                    if row[i] < lower_bound or row[i] > upper_bound:
                        iqr_anomalies[feature] = {
                            'value': float(row[i]),
                            'lower_bound': float(lower_bound),
                            'upper_bound': float(upper_bound)
                        }
                        
                        if feature not in anomaly_info['affected_metrics']:
                            anomaly_info['affected_metrics'][feature] = {
                                'value': float(row[i]),
                                'expected_range': f"{lower_bound:.2f} - {upper_bound:.2f}"
                            }
                
                if iqr_anomalies:
                    anomaly_info['methods_detected'].append('iqr')
            
            # Mark as anomaly if detected by any method
            if anomaly_info['methods_detected']:
                anomaly_info['is_anomaly'] = True
                anomaly_info['severity'] = self._calculate_severity(anomaly_info)
                anomalies.append(anomaly_info)
        
        return anomalies
    
    def _calculate_severity(self, anomaly_info: Dict) -> str:
        """Calculate anomaly severity based on detection methods and scores"""
        method_count = len(anomaly_info['methods_detected'])
        metric_count = len(anomaly_info['affected_metrics'])
        
        # Check z-scores if available
        max_z_score = 0
        if 'z_score' in anomaly_info['scores']:
            max_z_score = max(anomaly_info['scores']['z_score'].values())
        
        if method_count >= 3 or max_z_score > 4:
            return 'critical'
        elif method_count >= 2 or max_z_score > 3:
            return 'high'
        elif metric_count >= 2:
            return 'medium'
        else:
            return 'low'
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance for anomaly detection
        
        Returns:
            Dictionary of feature importances
        """
        if not self.trained:
            raise ValueError("Model must be trained")
        
        # For Isolation Forest, we use feature variance contribution
        importance = {}
        for feature in self.feature_names:
            # Higher std deviation = more important for anomaly detection
            importance[feature] = float(self.baseline_stats[feature]['std'])
        
        # Normalize to sum to 1
        total = sum(importance.values())
        if total > 0:
            importance = {k: v/total for k, v in importance.items()}
        
        return importance
    
    def save_model(self, filepath: str):
        """Save trained model to disk"""
        if not self.trained:
            raise ValueError("Cannot save untrained model")
        
        with open(filepath, 'wb') as f:
            pickle.dump({
                'isolation_forest': self.isolation_forest,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'baseline_stats': self.baseline_stats,
                'contamination': self.contamination,
                'trained': self.trained
            }, f)
    
    def load_model(self, filepath: str):
        """Load trained model from disk"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.isolation_forest = data['isolation_forest']
            self.scaler = data['scaler']
            self.feature_names = data['feature_names']
            self.baseline_stats = data['baseline_stats']
            self.contamination = data['contamination']
            self.trained = data['trained']


# Helper function for generating sample data
def generate_sample_metrics(samples: int = 1000) -> List[Dict]:
    """Generate sample infrastructure metrics for testing"""
    np.random.seed(42)
    
    data = []
    for i in range(samples):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Normal metrics
        cpu_usage = np.random.normal(50, 10)
        memory_usage = np.random.normal(60, 15)
        disk_io = np.random.normal(100, 20)
        network_throughput = np.random.normal(500, 100)
        response_time = np.random.normal(200, 50)
        
        # Inject some anomalies (10% of samples)
        if np.random.random() < 0.1:
            cpu_usage = np.random.uniform(85, 100)
            memory_usage = np.random.uniform(85, 100)
            response_time = np.random.uniform(800, 1500)
        
        data.append({
            'timestamp': timestamp,
            'cpu_usage': max(0, min(100, cpu_usage)),
            'memory_usage': max(0, min(100, memory_usage)),
            'disk_io': max(0, disk_io),
            'network_throughput': max(0, network_throughput),
            'response_time': max(0, response_time)
        })
    
    return data


if __name__ == '__main__':
    # Example usage
    print("Anomaly Detection Model - Example Usage\n")
    
    # Generate sample data
    print("Generating sample data...")
    data = generate_sample_metrics(samples=1000)
    
    # Split into training and test
    train_data = data[:800]
    test_data = data[800:]
    
    # Initialize and train model
    print("Training model...")
    model = AnomalyDetectionModel(contamination=0.1)
    training_summary = model.train(train_data)
    
    print(f"\nTraining Summary:")
    print(f"  Samples: {training_summary['training_samples']}")
    print(f"  Features: {', '.join(training_summary['features'])}")
    print(f"  Detected anomalies in training: {training_summary['detected_anomalies']}")
    
    # Detect anomalies in test data
    print("\nDetecting anomalies in test data...")
    anomalies = model.detect_anomalies(test_data)
    
    print(f"  Found {len(anomalies)} anomalies out of {len(test_data)} samples ({len(anomalies)/len(test_data)*100:.1f}%)")
    
    # Show severity breakdown
    severity_counts = {}
    for anomaly in anomalies:
        severity = anomaly['severity']
        severity_counts[severity] = severity_counts.get(severity, 0) + 1
    
    print(f"\nSeverity Breakdown:")
    for severity, count in sorted(severity_counts.items()):
        print(f"  {severity.capitalize()}: {count}")
    
    # Show sample anomaly
    if anomalies:
        print(f"\nSample Anomaly (First Detection):")
        first_anomaly = anomalies[0]
        print(f"  Index: {first_anomaly['index']}")
        print(f"  Severity: {first_anomaly['severity']}")
        print(f"  Methods: {', '.join(first_anomaly['methods_detected'])}")
        print(f"  Affected Metrics:")
        for metric, details in first_anomaly['affected_metrics'].items():
            print(f"    {metric}: {details['value']:.2f} (expected: {details.get('expected', 'N/A')})")
    
    # Get feature importance
    print(f"\nFeature Importance:")
    importance = model.get_feature_importance()
    for feature, score in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feature}: {score:.3f}")
    
    # Save model
    print("\nSaving model...")
    model.save_model('anomaly_detection_model.pkl')
    print("  Model saved successfully")
