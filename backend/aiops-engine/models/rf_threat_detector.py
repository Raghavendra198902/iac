"""
Random Forest Threat Detector

Real implementation using scikit-learn Random Forest classifier for
detecting security threats and anomalous behavior in infrastructure.
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import pickle
import joblib
from pathlib import Path

logger = logging.getLogger(__name__)


class RFThreatDetector:
    """
    Random Forest-based model for detecting security threats and anomalies.
    
    Threat Types Detected:
    - Unauthorized access attempts
    - DDoS attacks
    - Data exfiltration
    - Privilege escalation
    - Malware activity
    - Brute force attacks
    - SQL injection attempts
    - XSS attacks
    
    Features used:
    - Request rate anomalies
    - Failed authentication attempts
    - Unusual network traffic patterns
    - Geographic anomalies
    - Time-based anomalies
    - Port scanning activity
    - File access patterns
    """
    
    def __init__(self, model_dir: str = "ml_models/threat_detector"):
        """
        Initialize the Random Forest Threat Detector.
        
        Args:
            model_dir: Directory to save/load model
        """
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.model_version = "1.0.0"
        self.is_trained = False
        self.model: Optional[RandomForestClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        
        # Model hyperparameters
        self.n_estimators = 200
        self.max_depth = 20
        self.min_samples_split = 10
        self.min_samples_leaf = 4
        self.max_features = 'sqrt'
        
        # Feature names
        self.feature_names = [
            'request_rate',
            'failed_auth_count',
            'unique_ips',
            'avg_payload_size',
            'port_scan_score',
            'sql_injection_score',
            'xss_score',
            'geographic_entropy',
            'time_anomaly_score',
            'file_access_rate',
            'privilege_escalation_score',
            'data_transfer_rate'
        ]
        
        # Threat type mapping
        self.threat_types = {
            0: "normal",
            1: "unauthorized_access",
            2: "ddos_attack",
            3: "data_exfiltration",
            4: "privilege_escalation",
            5: "malware_activity",
            6: "brute_force",
            7: "sql_injection",
            8: "xss_attack"
        }
        
        # Load existing model if available
        self._load_model()
        
        logger.info(f"✅ RFThreatDetector initialized (version: {self.model_version})")
    
    def build_model(self) -> RandomForestClassifier:
        """
        Build the Random Forest classifier.
        
        Returns:
            Configured RandomForestClassifier
        """
        model = RandomForestClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            min_samples_split=self.min_samples_split,
            min_samples_leaf=self.min_samples_leaf,
            max_features=self.max_features,
            random_state=42,
            n_jobs=-1,
            verbose=0,
            class_weight='balanced'  # Handle imbalanced data
        )
        
        return model
    
    async def detect(self, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect security threats based on activity data.
        
        Args:
            activity_data: Dictionary containing:
                - service_name: Name of the service
                - metrics: Activity metrics
                - time_window: Time window for analysis (e.g., "1h", "5m")
                
        Returns:
            Threat detection result with severity and recommendations
        """
        try:
            service_name = activity_data.get('service_name')
            metrics = activity_data.get('metrics', {})
            
            # If no model is trained, use rule-based detection
            if not self.is_trained or self.model is None:
                return await self._rule_based_detection(service_name, metrics)
            
            # Prepare features
            X = self._prepare_features(metrics)
            
            # Scale features
            if self.scaler is not None:
                X_scaled = self.scaler.transform(X.reshape(1, -1))
            else:
                X_scaled = X.reshape(1, -1)
            
            # Predict threat
            prediction = self.model.predict(X_scaled)[0]
            probabilities = self.model.predict_proba(X_scaled)[0]
            
            # Get threat type and confidence
            threat_type = self.threat_types.get(prediction, "unknown")
            confidence = float(max(probabilities))
            
            # Determine severity
            severity = self._determine_severity(confidence, threat_type)
            
            # Get feature importance for this prediction
            important_indicators = self._get_important_indicators(X)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(threat_type, important_indicators)
            
            return {
                "service_name": service_name,
                "detection_type": "threat",
                "threat_detected": threat_type != "normal",
                "threat_type": threat_type,
                "confidence": round(confidence, 4),
                "severity": severity,
                "probability_scores": {
                    self.threat_types[i]: round(float(prob), 4)
                    for i, prob in enumerate(probabilities)
                },
                "indicators": important_indicators,
                "affected_services": [service_name],
                "recommended_actions": recommendations,
                "requires_immediate_action": severity in ["critical", "high"],
                "model_type": "RandomForest",
                "model_version": self.model_version,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Threat detection error: {str(e)}")
            raise
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray
    ) -> Dict[str, Any]:
        """
        Train the Random Forest model on labeled security data.
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_val: Validation features
            y_val: Validation labels
            
        Returns:
            Training metrics and results
        """
        try:
            logger.info("🚀 Starting Random Forest model training...")
            
            # Build model if not exists
            if self.model is None:
                self.model = self.build_model()
            
            # Create and fit scaler
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            self.is_trained = True
            
            # Evaluate on validation set
            val_score = self.model.score(X_val_scaled, y_val)
            val_predictions = self.model.predict(X_val_scaled)
            
            # Calculate metrics
            from sklearn.metrics import classification_report, confusion_matrix
            
            report = classification_report(
                y_val,
                val_predictions,
                target_names=list(self.threat_types.values())[:len(np.unique(y_val))],
                output_dict=True,
                zero_division=0
            )
            
            # Feature importance
            feature_importance = dict(zip(
                self.feature_names,
                self.model.feature_importances_
            ))
            
            # Save model
            self._save_model()
            
            logger.info("✅ Model training completed successfully")
            
            return {
                "status": "success",
                "validation_accuracy": float(val_score),
                "classification_report": report,
                "feature_importance": {
                    k: float(v) for k, v in sorted(
                        feature_importance.items(),
                        key=lambda x: x[1],
                        reverse=True
                    )
                },
                "model_saved": True
            }
            
        except Exception as e:
            logger.error(f"❌ Model training failed: {str(e)}")
            raise
    
    def _prepare_features(self, metrics: Dict[str, Any]) -> np.ndarray:
        """
        Prepare feature vector from metrics.
        
        Args:
            metrics: Raw metrics dictionary
            
        Returns:
            Feature vector as numpy array
        """
        features = [
            metrics.get('request_rate', 0),
            metrics.get('failed_auth_count', 0),
            metrics.get('unique_ips', 0),
            metrics.get('avg_payload_size', 0),
            metrics.get('port_scan_score', 0),
            metrics.get('sql_injection_score', 0),
            metrics.get('xss_score', 0),
            metrics.get('geographic_entropy', 0),
            metrics.get('time_anomaly_score', 0),
            metrics.get('file_access_rate', 0),
            metrics.get('privilege_escalation_score', 0),
            metrics.get('data_transfer_rate', 0)
        ]
        
        return np.array(features)
    
    async def _rule_based_detection(
        self,
        service_name: str,
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Rule-based threat detection when ML model is not trained.
        """
        threats_detected = []
        indicators = []
        severity = "low"
        
        # Check for brute force attacks
        failed_auth = metrics.get('failed_auth_count', 0)
        if failed_auth > 10:
            threats_detected.append("brute_force")
            indicators.append(f"High failed authentication attempts: {failed_auth}")
            severity = "high" if failed_auth > 50 else "medium"
        
        # Check for DDoS
        request_rate = metrics.get('request_rate', 0)
        if request_rate > 1000:
            threats_detected.append("ddos_attack")
            indicators.append(f"Abnormal request rate: {request_rate} req/s")
            severity = "critical"
        
        # Check for SQL injection
        sql_score = metrics.get('sql_injection_score', 0)
        if sql_score > 0.7:
            threats_detected.append("sql_injection")
            indicators.append(f"SQL injection patterns detected (score: {sql_score:.2f})")
            severity = "high"
        
        # Check for XSS
        xss_score = metrics.get('xss_score', 0)
        if xss_score > 0.7:
            threats_detected.append("xss_attack")
            indicators.append(f"XSS patterns detected (score: {xss_score:.2f})")
            severity = "high"
        
        # Check for data exfiltration
        data_transfer = metrics.get('data_transfer_rate', 0)
        if data_transfer > 100:  # MB/s
            threats_detected.append("data_exfiltration")
            indicators.append(f"Unusual data transfer rate: {data_transfer} MB/s")
            severity = "critical"
        
        # Check for port scanning
        port_scan_score = metrics.get('port_scan_score', 0)
        if port_scan_score > 0.8:
            threats_detected.append("port_scanning")
            indicators.append(f"Port scanning activity detected (score: {port_scan_score:.2f})")
            severity = "medium"
        
        # Check for privilege escalation
        priv_esc_score = metrics.get('privilege_escalation_score', 0)
        if priv_esc_score > 0.7:
            threats_detected.append("privilege_escalation")
            indicators.append(f"Privilege escalation attempts (score: {priv_esc_score:.2f})")
            severity = "critical"
        
        threat_detected = len(threats_detected) > 0
        threat_type = threats_detected[0] if threats_detected else "normal"
        
        if not indicators:
            indicators.append("No threats detected")
        
        return {
            "service_name": service_name,
            "detection_type": "threat",
            "threat_detected": threat_detected,
            "threat_type": threat_type,
            "all_threats": threats_detected,
            "confidence": 0.7 if threat_detected else 0.9,
            "severity": severity if threat_detected else "low",
            "indicators": indicators,
            "affected_services": [service_name] if threat_detected else [],
            "recommended_actions": self._generate_recommendations(threat_type, indicators),
            "requires_immediate_action": severity in ["critical", "high"],
            "model_type": "RuleBased",
            "model_version": self.model_version,
            "timestamp": datetime.now().isoformat(),
            "note": "Using rule-based detection - RF model not yet trained"
        }
    
    def _determine_severity(self, confidence: float, threat_type: str) -> str:
        """Determine threat severity."""
        if threat_type == "normal":
            return "low"
        
        critical_threats = ["ddos_attack", "data_exfiltration", "privilege_escalation"]
        high_threats = ["sql_injection", "malware_activity", "brute_force"]
        
        if threat_type in critical_threats or confidence > 0.9:
            return "critical"
        elif threat_type in high_threats or confidence > 0.75:
            return "high"
        elif confidence > 0.6:
            return "medium"
        else:
            return "low"
    
    def _get_important_indicators(self, features: np.ndarray) -> List[str]:
        """
        Get important indicators from feature values.
        """
        indicators = []
        
        for i, (name, value) in enumerate(zip(self.feature_names, features)):
            # Check if feature value is abnormal
            if name == 'failed_auth_count' and value > 10:
                indicators.append(f"High failed authentication: {value:.0f} attempts")
            elif name == 'request_rate' and value > 500:
                indicators.append(f"Elevated request rate: {value:.0f} req/s")
            elif name == 'sql_injection_score' and value > 0.7:
                indicators.append(f"SQL injection patterns detected (score: {value:.2f})")
            elif name == 'xss_score' and value > 0.7:
                indicators.append(f"XSS patterns detected (score: {value:.2f})")
            elif name == 'port_scan_score' and value > 0.7:
                indicators.append(f"Port scanning activity (score: {value:.2f})")
            elif name == 'data_transfer_rate' and value > 50:
                indicators.append(f"High data transfer: {value:.1f} MB/s")
        
        if not indicators:
            indicators.append("Normal activity patterns")
        
        return indicators
    
    def _generate_recommendations(
        self,
        threat_type: str,
        indicators: List[str]
    ) -> List[str]:
        """Generate actionable recommendations based on threat type."""
        recommendations = []
        
        if threat_type == "normal":
            return ["Continue monitoring - no action needed"]
        
        # General recommendations
        recommendations.append("🚨 SECURITY ALERT - Immediate attention required")
        
        # Threat-specific recommendations
        threat_actions = {
            "brute_force": [
                "Enable rate limiting on authentication endpoints",
                "Implement CAPTCHA after failed attempts",
                "Block suspicious IP addresses",
                "Review and strengthen password policies"
            ],
            "ddos_attack": [
                "Enable DDoS protection (CloudFlare, AWS Shield)",
                "Implement rate limiting",
                "Scale infrastructure to handle load",
                "Contact ISP for upstream filtering"
            ],
            "sql_injection": [
                "Block malicious requests immediately",
                "Review and fix SQL injection vulnerabilities",
                "Implement prepared statements",
                "Enable WAF rules for SQL injection"
            ],
            "xss_attack": [
                "Sanitize user inputs",
                "Implement Content Security Policy (CSP)",
                "Enable XSS protection headers",
                "Review and fix XSS vulnerabilities"
            ],
            "data_exfiltration": [
                "Block suspicious data transfers immediately",
                "Review access logs",
                "Implement DLP (Data Loss Prevention)",
                "Conduct security audit"
            ],
            "privilege_escalation": [
                "Revoke elevated privileges",
                "Review access control policies",
                "Audit recent privilege changes",
                "Implement principle of least privilege"
            ],
            "unauthorized_access": [
                "Block unauthorized IPs",
                "Force password reset for affected accounts",
                "Enable MFA if not already active",
                "Review authentication logs"
            ],
            "malware_activity": [
                "Isolate affected systems",
                "Run malware scan",
                "Review file integrity",
                "Restore from clean backup if needed"
            ]
        }
        
        specific_actions = threat_actions.get(threat_type, [])
        recommendations.extend(specific_actions)
        
        # Add monitoring recommendation
        recommendations.append("Increase monitoring frequency")
        recommendations.append("Alert security team immediately")
        
        return recommendations
    
    def _save_model(self):
        """Save model and scaler to disk."""
        try:
            if self.model is not None:
                model_path = self.model_dir / 'rf_model.pkl'
                joblib.dump(self.model, str(model_path))
                logger.info(f"💾 Model saved to {model_path}")
            
            if self.scaler is not None:
                scaler_path = self.model_dir / 'scaler.pkl'
                joblib.dump(self.scaler, str(scaler_path))
                logger.info(f"💾 Scaler saved to {scaler_path}")
                
        except Exception as e:
            logger.error(f"❌ Failed to save model: {str(e)}")
    
    def _load_model(self):
        """Load model and scaler from disk."""
        try:
            model_path = self.model_dir / 'rf_model.pkl'
            if model_path.exists():
                self.model = joblib.load(str(model_path))
                self.is_trained = True
                logger.info(f"✅ Model loaded from {model_path}")
            
            scaler_path = self.model_dir / 'scaler.pkl'
            if scaler_path.exists():
                self.scaler = joblib.load(str(scaler_path))
                logger.info(f"✅ Scaler loaded from {scaler_path}")
                
        except Exception as e:
            logger.warning(f"⚠️ Could not load existing model: {str(e)}")
            self.is_trained = False
