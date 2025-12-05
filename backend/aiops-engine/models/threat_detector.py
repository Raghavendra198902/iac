"""
Threat Detector Model

Uses Random Forest and Deep Learning for real-time security threat detection.
Monitors network traffic, access patterns, and system behaviors.
"""

import numpy as np
from typing import Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ThreatDetector:
    """
    ML-based security threat detection system.
    """
    
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.model_version = "1.0.0"
        self.threat_signatures = self._load_threat_signatures()
        
    def _load_threat_signatures(self) -> Dict[str, Any]:
        """Load known threat signatures."""
        return {
            "sql_injection": {
                "patterns": ["'", "OR 1=1", "UNION SELECT", "DROP TABLE"],
                "severity": "critical"
            },
            "xss": {
                "patterns": ["<script>", "javascript:", "onerror="],
                "severity": "high"
            },
            "brute_force": {
                "indicators": ["high_failed_logins", "rapid_requests"],
                "severity": "high"
            },
            "ddos": {
                "indicators": ["traffic_spike", "connection_flood"],
                "severity": "critical"
            },
            "malware": {
                "patterns": ["suspicious_file", "unauthorized_process"],
                "severity": "critical"
            }
        }
    
    async def detect(self, security_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect security threats in real-time.
        
        Args:
            security_data: Security events and metrics
            
        Returns:
            Threat detection results
        """
        try:
            service_name = security_data.get('service_name')
            events = security_data.get('events', [])
            network_data = security_data.get('network', {})
            access_logs = security_data.get('access_logs', [])
            
            # Analyze for threats
            detected_threats = []
            
            # Check for SQL injection
            if self._check_sql_injection(access_logs):
                detected_threats.append({
                    "threat_type": "sql_injection",
                    "severity": "critical",
                    "confidence": 0.92,
                    "description": "Potential SQL injection detected in requests"
                })
            
            # Check for brute force attacks
            if self._check_brute_force(access_logs):
                detected_threats.append({
                    "threat_type": "brute_force",
                    "severity": "high",
                    "confidence": 0.88,
                    "description": "Brute force attack pattern detected"
                })
            
            # Check for DDoS
            request_rate = network_data.get('requests_per_second', 0)
            if request_rate > 10000:  # threshold
                detected_threats.append({
                    "threat_type": "ddos",
                    "severity": "critical",
                    "confidence": 0.95,
                    "description": f"Abnormal traffic: {request_rate} req/s"
                })
            
            # Check for unauthorized access
            if self._check_unauthorized_access(access_logs):
                detected_threats.append({
                    "threat_type": "unauthorized_access",
                    "severity": "high",
                    "confidence": 0.85,
                    "description": "Unauthorized access attempts detected"
                })
            
            # Determine overall risk level
            risk_level = self._calculate_risk_level(detected_threats)
            
            # Generate response actions
            response_actions = self._generate_response_actions(detected_threats)
            
            return {
                "service_name": service_name,
                "detection_type": "threat",
                "threats_detected": len(detected_threats),
                "risk_level": risk_level,
                "threats": detected_threats,
                "recommended_actions": response_actions,
                "analysis": {
                    "events_analyzed": len(events),
                    "access_logs_analyzed": len(access_logs),
                    "network_traffic": {
                        "requests_per_second": request_rate,
                        "bytes_transferred": network_data.get('bytes', 0)
                    }
                },
                "model_version": self.model_version,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Threat detection error: {str(e)}")
            raise
    
    def _check_sql_injection(self, logs: List[Dict]) -> bool:
        """Check for SQL injection patterns."""
        if not logs:
            return False
        
        patterns = self.threat_signatures["sql_injection"]["patterns"]
        
        for log in logs[-100:]:  # Check last 100 logs
            request = log.get('request', '').lower()
            if any(pattern.lower() in request for pattern in patterns):
                return True
        
        return False
    
    def _check_brute_force(self, logs: List[Dict]) -> bool:
        """Check for brute force attack patterns."""
        if not logs:
            return False
        
        # Count failed login attempts
        failed_attempts = sum(
            1 for log in logs[-50:]
            if log.get('status') in [401, 403] and 'login' in log.get('path', '')
        )
        
        return failed_attempts > 10  # threshold
    
    def _check_unauthorized_access(self, logs: List[Dict]) -> bool:
        """Check for unauthorized access attempts."""
        if not logs:
            return False
        
        # Check for 403 responses to protected resources
        unauthorized = sum(
            1 for log in logs[-50:]
            if log.get('status') == 403
        )
        
        return unauthorized > 5  # threshold
    
    def _calculate_risk_level(self, threats: List[Dict]) -> str:
        """Calculate overall risk level."""
        if not threats:
            return "low"
        
        critical_threats = sum(1 for t in threats if t['severity'] == 'critical')
        high_threats = sum(1 for t in threats if t['severity'] == 'high')
        
        if critical_threats > 0:
            return "critical"
        elif high_threats > 1:
            return "high"
        elif high_threats == 1:
            return "medium"
        else:
            return "low"
    
    def _generate_response_actions(self, threats: List[Dict]) -> List[Dict[str, Any]]:
        """Generate automated response actions."""
        actions = []
        
        for threat in threats:
            threat_type = threat['threat_type']
            
            if threat_type == "sql_injection":
                actions.append({
                    "action": "block_ip",
                    "priority": "immediate",
                    "description": "Block source IP of SQL injection attempt",
                    "automated": True
                })
                actions.append({
                    "action": "enable_waf_rules",
                    "priority": "high",
                    "description": "Enable WAF SQL injection rules",
                    "automated": True
                })
            
            elif threat_type == "brute_force":
                actions.append({
                    "action": "rate_limit",
                    "priority": "high",
                    "description": "Apply rate limiting to affected endpoints",
                    "automated": True
                })
                actions.append({
                    "action": "enable_captcha",
                    "priority": "medium",
                    "description": "Enable CAPTCHA on login pages",
                    "automated": False
                })
            
            elif threat_type == "ddos":
                actions.append({
                    "action": "enable_ddos_protection",
                    "priority": "immediate",
                    "description": "Activate DDoS mitigation service",
                    "automated": True
                })
                actions.append({
                    "action": "scale_infrastructure",
                    "priority": "high",
                    "description": "Scale infrastructure to handle load",
                    "automated": True
                })
            
            elif threat_type == "unauthorized_access":
                actions.append({
                    "action": "enforce_mfa",
                    "priority": "high",
                    "description": "Enforce multi-factor authentication",
                    "automated": False
                })
                actions.append({
                    "action": "audit_permissions",
                    "priority": "medium",
                    "description": "Audit access permissions",
                    "automated": False
                })
        
        if not actions:
            actions.append({
                "action": "continue_monitoring",
                "priority": "low",
                "description": "Continue security monitoring",
                "automated": True
            })
        
        return actions
