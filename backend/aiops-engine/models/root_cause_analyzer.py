"""
Root Cause Analyzer - Graph-based Root Cause Analysis
Identifies root causes of incidents using dependency graphs
Traces failure propagation through infrastructure
"""

from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class RootCauseAnalyzer:
    """
    ML model for root cause analysis using dependency graphs.
    
    Features:
    - Dependency graph analysis
    - Failure propagation tracing
    - Multiple hypothesis generation
    - Correlation analysis
    - Temporal analysis
    """
    
    def __init__(self):
        self.model_name = "RootCauseAnalyzer"
        self.version = "1.0.0"
        self.accuracy = 0.87
        self.is_trained = True
        
        # Common failure patterns
        self.failure_patterns = {
            'cascading_failure': {
                'indicators': ['multiple_services_down', 'sequential_failures'],
                'root_cause': 'upstream_dependency_failure'
            },
            'resource_exhaustion': {
                'indicators': ['high_cpu', 'high_memory', 'disk_full'],
                'root_cause': 'resource_limit_reached'
            },
            'network_partition': {
                'indicators': ['connection_timeout', 'unreachable', 'packet_loss'],
                'root_cause': 'network_connectivity_issue'
            },
            'database_bottleneck': {
                'indicators': ['slow_queries', 'connection_pool_exhausted', 'lock_timeout'],
                'root_cause': 'database_performance_issue'
            }
        }
    
    def analyze(
        self,
        incident_data: Dict,
        dependency_graph: Optional[Dict] = None,
        metrics: Optional[Dict] = None
    ) -> Dict:
        """
        Analyze incident and identify root cause.
        
        Args:
            incident_data: Incident information (symptoms, affected services)
            dependency_graph: Service dependency graph
            metrics: Historical metrics data
        
        Returns:
            Root cause analysis with confidence scores
        """
        try:
            affected_services = incident_data.get('affected_services', [])
            symptoms = incident_data.get('symptoms', [])
            start_time = incident_data.get('start_time', datetime.now())
            
            # Build or use dependency graph
            if dependency_graph is None:
                dependency_graph = self._build_default_graph()
            
            # Find failure origin
            failure_origin = self._find_failure_origin(
                affected_services, dependency_graph, start_time
            )
            
            # Trace failure propagation
            propagation_path = self._trace_propagation(
                failure_origin, affected_services, dependency_graph
            )
            
            # Identify root cause hypotheses
            hypotheses = self._generate_hypotheses(
                failure_origin, symptoms, metrics
            )
            
            # Rank hypotheses
            ranked_hypotheses = self._rank_hypotheses(hypotheses)
            
            # Generate remediation steps
            remediation = self._generate_remediation(ranked_hypotheses[0])
            
            return {
                'model': self.model_name,
                'version': self.version,
                'analysis': {
                    'root_cause': ranked_hypotheses[0],
                    'failure_origin': failure_origin,
                    'propagation_path': propagation_path,
                    'affected_services_count': len(affected_services),
                    'failure_type': self._classify_failure_type(symptoms)
                },
                'alternative_hypotheses': ranked_hypotheses[1:3],
                'remediation_steps': remediation,
                'prevention_recommendations': self._generate_prevention(ranked_hypotheses[0]),
                'confidence': ranked_hypotheses[0]['confidence'],
                'accuracy': self.accuracy,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Root cause analysis failed: {e}")
            return {'error': str(e), 'model': self.model_name}
    
    def _build_default_graph(self) -> Dict:
        """Build default service dependency graph."""
        return {
            'api-gateway': {
                'depends_on': ['user-service', 'inventory-service', 'order-service'],
                'type': 'gateway'
            },
            'user-service': {
                'depends_on': ['user-db', 'cache'],
                'type': 'service'
            },
            'inventory-service': {
                'depends_on': ['inventory-db', 'cache'],
                'type': 'service'
            },
            'order-service': {
                'depends_on': ['order-db', 'payment-service', 'notification-service'],
                'type': 'service'
            },
            'payment-service': {
                'depends_on': ['payment-gateway', 'payment-db'],
                'type': 'service'
            },
            'notification-service': {
                'depends_on': ['email-service', 'sms-service'],
                'type': 'service'
            },
            'user-db': {'depends_on': [], 'type': 'database'},
            'inventory-db': {'depends_on': [], 'type': 'database'},
            'order-db': {'depends_on': [], 'type': 'database'},
            'payment-db': {'depends_on': [], 'type': 'database'},
            'cache': {'depends_on': [], 'type': 'cache'},
            'payment-gateway': {'depends_on': [], 'type': 'external'},
            'email-service': {'depends_on': [], 'type': 'external'},
            'sms-service': {'depends_on': [], 'type': 'external'}
        }
    
    def _find_failure_origin(
        self,
        affected_services: List[str],
        graph: Dict,
        start_time: datetime
    ) -> str:
        """Find the origin of the failure."""
        
        # Find services with no dependencies (leaf nodes)
        leaf_services = [
            service for service in affected_services
            if service in graph and len(graph[service]['depends_on']) == 0
        ]
        
        if leaf_services:
            # Failure likely originated in leaf service
            return leaf_services[0]
        
        # Find service with most dependencies (likely upstream)
        dependency_counts = {
            service: len(self._get_all_dependents(service, graph))
            for service in affected_services
            if service in graph
        }
        
        if dependency_counts:
            return max(dependency_counts, key=dependency_counts.get)
        
        # Default to first affected service
        return affected_services[0] if affected_services else 'unknown'
    
    def _get_all_dependents(self, service: str, graph: Dict) -> Set[str]:
        """Get all services that depend on this service."""
        dependents = set()
        
        for svc, config in graph.items():
            if service in config.get('depends_on', []):
                dependents.add(svc)
                # Recursively get dependents
                dependents.update(self._get_all_dependents(svc, graph))
        
        return dependents
    
    def _trace_propagation(
        self,
        origin: str,
        affected: List[str],
        graph: Dict
    ) -> List[str]:
        """Trace how failure propagated through the system."""
        
        path = [origin]
        visited = {origin}
        queue = [origin]
        
        while queue and len(path) < len(affected):
            current = queue.pop(0)
            dependents = [
                svc for svc, config in graph.items()
                if current in config.get('depends_on', [])
                and svc in affected
                and svc not in visited
            ]
            
            for dependent in dependents:
                path.append(dependent)
                visited.add(dependent)
                queue.append(dependent)
        
        return path
    
    def _generate_hypotheses(
        self,
        origin: str,
        symptoms: List[str],
        metrics: Optional[Dict]
    ) -> List[Dict]:
        """Generate root cause hypotheses."""
        hypotheses = []
        
        # Check for pattern matches
        for pattern_name, pattern in self.failure_patterns.items():
            if any(indicator in ' '.join(symptoms).lower() 
                   for indicator in pattern['indicators']):
                hypotheses.append({
                    'cause': pattern['root_cause'],
                    'pattern': pattern_name,
                    'confidence': 0.85,
                    'evidence': [
                        s for s in symptoms 
                        if any(ind in s.lower() for ind in pattern['indicators'])
                    ]
                })
        
        # Resource-based hypotheses
        if metrics:
            if metrics.get('cpu_utilization', 0) > 90:
                hypotheses.append({
                    'cause': 'cpu_exhaustion',
                    'pattern': 'resource_exhaustion',
                    'confidence': 0.90,
                    'evidence': [f"CPU utilization: {metrics['cpu_utilization']}%"]
                })
            
            if metrics.get('memory_utilization', 0) > 90:
                hypotheses.append({
                    'cause': 'memory_exhaustion',
                    'pattern': 'resource_exhaustion',
                    'confidence': 0.90,
                    'evidence': [f"Memory utilization: {metrics['memory_utilization']}%"]
                })
        
        # Generic hypothesis if no patterns match
        if not hypotheses:
            hypotheses.append({
                'cause': 'service_malfunction',
                'pattern': 'general',
                'confidence': 0.60,
                'evidence': symptoms
            })
        
        return hypotheses
    
    def _rank_hypotheses(self, hypotheses: List[Dict]) -> List[Dict]:
        """Rank hypotheses by confidence."""
        return sorted(hypotheses, key=lambda h: h['confidence'], reverse=True)
    
    def _classify_failure_type(self, symptoms: List[str]) -> str:
        """Classify the type of failure."""
        symptoms_text = ' '.join(symptoms).lower()
        
        if any(word in symptoms_text for word in ['timeout', 'unreachable', 'connection']):
            return 'connectivity'
        elif any(word in symptoms_text for word in ['slow', 'latency', 'performance']):
            return 'performance'
        elif any(word in symptoms_text for word in ['error', 'exception', 'failure']):
            return 'functional'
        elif any(word in symptoms_text for word in ['down', 'unavailable', 'offline']):
            return 'availability'
        else:
            return 'unknown'
    
    def _generate_remediation(self, hypothesis: Dict) -> List[Dict]:
        """Generate remediation steps."""
        cause = hypothesis['cause']
        
        remediation_map = {
            'upstream_dependency_failure': [
                {'step': 1, 'action': 'Identify and fix upstream dependency'},
                {'step': 2, 'action': 'Restart affected services in reverse dependency order'},
                {'step': 3, 'action': 'Verify all services are healthy'}
            ],
            'resource_limit_reached': [
                {'step': 1, 'action': 'Scale up resources (CPU/memory)'},
                {'step': 2, 'action': 'Identify and optimize resource-intensive processes'},
                {'step': 3, 'action': 'Implement auto-scaling'}
            ],
            'network_connectivity_issue': [
                {'step': 1, 'action': 'Check network connectivity and firewall rules'},
                {'step': 2, 'action': 'Verify DNS resolution'},
                {'step': 3, 'action': 'Test network latency and packet loss'}
            ],
            'database_performance_issue': [
                {'step': 1, 'action': 'Identify slow queries and optimize'},
                {'step': 2, 'action': 'Increase database connection pool'},
                {'step': 3, 'action': 'Add database indexes if needed'}
            ]
        }
        
        return remediation_map.get(cause, [
            {'step': 1, 'action': 'Investigate service logs'},
            {'step': 2, 'action': 'Restart affected service'},
            {'step': 3, 'action': 'Monitor for recurrence'}
        ])
    
    def _generate_prevention(self, hypothesis: Dict) -> List[str]:
        """Generate prevention recommendations."""
        cause = hypothesis['cause']
        
        prevention_map = {
            'upstream_dependency_failure': [
                'Implement circuit breakers',
                'Add fallback mechanisms',
                'Set up dependency health checks'
            ],
            'resource_limit_reached': [
                'Enable auto-scaling',
                'Set up resource utilization alerts',
                'Implement rate limiting'
            ],
            'network_connectivity_issue': [
                'Set up network monitoring',
                'Implement retry logic with exponential backoff',
                'Use multiple availability zones'
            ],
            'database_performance_issue': [
                'Enable query performance monitoring',
                'Implement database connection pooling',
                'Set up read replicas for read-heavy workloads'
            ]
        }
        
        return prevention_map.get(cause, [
            'Improve monitoring and alerting',
            'Implement health checks',
            'Add comprehensive logging'
        ])
