"""
Anomaly Detector Model

Multi-variate anomaly detection using statistical methods and ML.
Detects unusual patterns in system metrics and behaviors.
"""

import numpy as np
from typing import Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """
    Multi-variate anomaly detection for infrastructure monitoring.
    """
    
    def __init__(self):
        self.model = None
        self.baseline_stats = {}
        self.is_trained = False
        self.model_version = "1.0.0"
        self.anomaly_threshold = 3.0  # Standard deviations
        
    async def detect(self, metrics_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect anomalies in system metrics.
        
        Args:
            metrics_data: Current system metrics
            
        Returns:
            Anomaly detection results
        """
        try:
            service_name = metrics_data.get('service_name')
            metrics = metrics_data.get('metrics', {})
            
            # Analyze each metric for anomalies
            anomalies_found = []
            anomaly_scores = {}
            
            for metric_name, metric_value in metrics.items():
                # Calculate z-score
                z_score = self._calculate_z_score(metric_name, metric_value)
                anomaly_scores[metric_name] = abs(z_score)
                
                # Check if anomalous
                if abs(z_score) > self.anomaly_threshold:
                    anomalies_found.append({
                        "metric": metric_name,
                        "value": metric_value,
                        "z_score": round(z_score, 2),
                        "severity": self._determine_severity(abs(z_score)),
                        "deviation_percent": round(abs(z_score) * 100 / 3, 1)
                    })
            
            # Calculate overall anomaly score
            overall_score = sum(anomaly_scores.values()) / len(anomaly_scores) if anomaly_scores else 0
            is_anomalous = overall_score > self.anomaly_threshold
            
            # Determine severity
            severity = self._determine_severity(overall_score)
            
            # Identify root cause if anomalous
            root_cause = None
            if is_anomalous:
                root_cause = self._identify_root_cause(anomalies_found)
            
            # Generate remediation suggestions
            remediation = self._generate_remediation(anomalies_found) if is_anomalous else None
            
            return {
                "service_name": service_name,
                "detection_type": "anomaly",
                "is_anomaly": is_anomalous,
                "anomaly_score": round(overall_score, 3),
                "severity": severity,
                "anomalies_detected": len(anomalies_found),
                "affected_metrics": anomalies_found,
                "root_cause": root_cause,
                "remediation_suggested": remediation is not None,
                "recommended_actions": remediation or [],
                "analysis": {
                    "metrics_analyzed": len(metrics),
                    "threshold": self.anomaly_threshold,
                    "method": "z_score"
                },
                "model_version": self.model_version,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Anomaly detection error: {str(e)}")
            raise
    
    def _calculate_z_score(self, metric_name: str, value: float) -> float:
        """
        Calculate z-score for a metric value.
        
        In production, use historical baseline statistics.
        For demo, using mock baselines.
        """
        # Mock baseline statistics
        baselines = {
            "cpu_usage": {"mean": 50, "std": 15},
            "memory_usage": {"mean": 60, "std": 12},
            "disk_io": {"mean": 100, "std": 30},
            "network_traffic": {"mean": 500, "std": 150},
            "error_rate": {"mean": 0.5, "std": 0.3},
            "response_time_ms": {"mean": 200, "std": 50},
            "request_rate": {"mean": 1000, "std": 300},
            "active_connections": {"mean": 500, "std": 100}
        }
        
        baseline = baselines.get(metric_name, {"mean": 50, "std": 10})
        mean = baseline["mean"]
        std = baseline["std"]
        
        # Calculate z-score
        z_score = (value - mean) / std if std > 0 else 0
        
        return z_score
    
    def _determine_severity(self, z_score: float) -> str:
        """Determine anomaly severity based on z-score."""
        if z_score >= 5.0:
            return "critical"
        elif z_score >= 4.0:
            return "high"
        elif z_score >= 3.0:
            return "medium"
        else:
            return "low"
    
    def _identify_root_cause(self, anomalies: List[Dict]) -> Dict[str, Any]:
        """Identify potential root cause of anomalies."""
        if not anomalies:
            return None
        
        # Sort anomalies by severity
        sorted_anomalies = sorted(
            anomalies, 
            key=lambda x: x['z_score'], 
            reverse=True
        )
        
        primary_anomaly = sorted_anomalies[0]
        metric = primary_anomaly['metric']
        
        # Root cause analysis logic
        root_causes = {
            "cpu_usage": {
                "cause": "High CPU utilization",
                "possible_reasons": [
                    "Infinite loop or inefficient algorithm",
                    "Resource-intensive process running",
                    "Insufficient CPU capacity",
                    "CPU-bound workload spike"
                ]
            },
            "memory_usage": {
                "cause": "High memory consumption",
                "possible_reasons": [
                    "Memory leak in application",
                    "Large dataset loaded in memory",
                    "Insufficient memory allocation",
                    "Memory-intensive operation"
                ]
            },
            "error_rate": {
                "cause": "Elevated error rate",
                "possible_reasons": [
                    "Application bug or exception",
                    "Database connection issues",
                    "External service failure",
                    "Configuration error"
                ]
            },
            "response_time_ms": {
                "cause": "Increased response time",
                "possible_reasons": [
                    "Slow database queries",
                    "Network latency",
                    "Resource contention",
                    "Inefficient code path"
                ]
            }
        }
        
        root_cause = root_causes.get(metric, {
            "cause": f"Unusual {metric} pattern",
            "possible_reasons": ["System behavior deviation detected"]
        })
        
        return {
            "primary_metric": metric,
            "anomaly_score": primary_anomaly['z_score'],
            **root_cause,
            "correlated_anomalies": [
                a['metric'] for a in sorted_anomalies[1:3]
            ] if len(sorted_anomalies) > 1 else []
        }
    
    def _generate_remediation(self, anomalies: List[Dict]) -> List[Dict[str, Any]]:
        """Generate remediation suggestions."""
        if not anomalies:
            return []
        
        remediation_actions = []
        
        for anomaly in anomalies:
            metric = anomaly['metric']
            severity = anomaly['severity']
            
            if metric == "cpu_usage":
                remediation_actions.append({
                    "action": "investigate_cpu",
                    "priority": severity,
                    "description": "Investigate high CPU usage",
                    "steps": [
                        "Check top processes consuming CPU",
                        "Review recent code deployments",
                        "Consider horizontal scaling",
                        "Optimize CPU-intensive operations"
                    ]
                })
            
            elif metric == "memory_usage":
                remediation_actions.append({
                    "action": "investigate_memory",
                    "priority": severity,
                    "description": "Investigate high memory usage",
                    "steps": [
                        "Check for memory leaks",
                        "Analyze heap dumps",
                        "Review caching strategies",
                        "Consider adding more memory"
                    ]
                })
            
            elif metric == "error_rate":
                remediation_actions.append({
                    "action": "investigate_errors",
                    "priority": "high",
                    "description": "Investigate elevated error rate",
                    "steps": [
                        "Review application logs",
                        "Check database connectivity",
                        "Verify external service status",
                        "Rollback recent changes if needed"
                    ]
                })
            
            elif metric == "response_time_ms":
                remediation_actions.append({
                    "action": "optimize_performance",
                    "priority": severity,
                    "description": "Optimize response time",
                    "steps": [
                        "Analyze slow queries",
                        "Check network latency",
                        "Review caching effectiveness",
                        "Optimize database indexes"
                    ]
                })
            
            else:
                remediation_actions.append({
                    "action": "investigate_metric",
                    "priority": severity,
                    "description": f"Investigate {metric} anomaly",
                    "steps": [
                        f"Review {metric} trends",
                        "Check for system changes",
                        "Analyze related metrics",
                        "Consult documentation"
                    ]
                })
        
        return remediation_actions
    
    async def train(self, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Train anomaly detector with historical data.
        
        Args:
            training_data: Historical metrics data
            
        Returns:
            Training results
        """
        logger.info(f"Training anomaly detector with {len(training_data)} samples")
        
        # In production, calculate actual baseline statistics
        # For now, return mock training results
        
        self.is_trained = True
        
        return {
            "status": "success",
            "samples_trained": len(training_data),
            "metrics_analyzed": 8,
            "baseline_established": True,
            "threshold": self.anomaly_threshold,
            "model_version": self.model_version,
            "trained_at": datetime.now().isoformat()
        }
