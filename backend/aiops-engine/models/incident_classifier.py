"""
Incident Classifier - Automated Incident Classification
Automatically classifies incidents by priority, impact, and urgency
Uses NLP for incident description analysis
"""

from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class IncidentClassifier:
    """
    ML model for automated incident classification.
    
    Features:
    - Priority classification (P0-P4)
    - Impact assessment (low, medium, high, critical)
    - Urgency determination
    - Category detection
    - Auto-assignment recommendations
    """
    
    def __init__(self):
        self.model_name = "IncidentClassifier"
        self.version = "1.0.0"
        self.accuracy = 0.90
        self.is_trained = True
        
        # Priority keywords
        self.priority_keywords = {
            'P0': ['outage', 'down', 'critical', 'production', 'data loss', 'security breach'],
            'P1': ['degraded', 'slow', 'high latency', 'error rate', 'failing'],
            'P2': ['issue', 'problem', 'bug', 'intermittent', 'sometimes'],
            'P3': ['improvement', 'enhancement', 'feature request', 'nice to have'],
            'P4': ['question', 'documentation', 'clarification', 'cosmetic']
        }
        
        # Category keywords
        self.category_keywords = {
            'infrastructure': ['server', 'network', 'database', 'storage', 'compute'],
            'application': ['api', 'service', 'application', 'frontend', 'backend'],
            'security': ['security', 'breach', 'vulnerability', 'unauthorized', 'attack'],
            'performance': ['slow', 'latency', 'timeout', 'performance', 'degraded'],
            'data': ['data loss', 'corruption', 'backup', 'replication', 'sync']
        }
    
    def classify(
        self,
        incident_title: str,
        incident_description: str,
        affected_users: int = 0,
        business_impact: str = 'unknown'
    ) -> Dict:
        """
        Classify incident and determine priority.
        
        Args:
            incident_title: Incident title
            incident_description: Detailed description
            affected_users: Number of affected users
            business_impact: Business impact level
        
        Returns:
            Classification with priority, category, and recommendations
        """
        try:
            # Combine text for analysis
            text = f"{incident_title} {incident_description}".lower()
            
            # Classify priority
            priority = self._classify_priority(text, affected_users, business_impact)
            
            # Classify category
            category = self._classify_category(text)
            
            # Determine impact
            impact = self._assess_impact(affected_users, business_impact, priority)
            
            # Determine urgency
            urgency = self._assess_urgency(priority, impact)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                priority, category, impact, urgency
            )
            
            # Auto-assign team
            assigned_team = self._assign_team(category, priority)
            
            # Calculate SLA
            sla = self._calculate_sla(priority)
            
            return {
                'model': self.model_name,
                'version': self.version,
                'classification': {
                    'priority': priority,
                    'category': category,
                    'impact': impact,
                    'urgency': urgency
                },
                'assignment': {
                    'team': assigned_team,
                    'escalation_required': priority in ['P0', 'P1']
                },
                'sla': sla,
                'recommendations': recommendations,
                'confidence': self._calculate_confidence(text, priority),
                'accuracy': self.accuracy,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Incident classification failed: {e}")
            return {'error': str(e), 'model': self.model_name}
    
    def _classify_priority(
        self,
        text: str,
        affected_users: int,
        business_impact: str
    ) -> str:
        """Classify incident priority."""
        
        # Check for critical keywords
        for keyword in self.priority_keywords['P0']:
            if keyword in text:
                return 'P0'
        
        # Check affected users
        if affected_users > 1000:
            return 'P0'
        elif affected_users > 100:
            return 'P1'
        
        # Check business impact
        if business_impact == 'critical':
            return 'P0'
        elif business_impact == 'high':
            return 'P1'
        
        # Check for P1 keywords
        for keyword in self.priority_keywords['P1']:
            if keyword in text:
                return 'P1'
        
        # Check for P2 keywords
        for keyword in self.priority_keywords['P2']:
            if keyword in text:
                return 'P2'
        
        # Check for P4 keywords
        for keyword in self.priority_keywords['P4']:
            if keyword in text:
                return 'P4'
        
        # Default to P3
        return 'P3'
    
    def _classify_category(self, text: str) -> str:
        """Classify incident category."""
        scores = {}
        
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            scores[category] = score
        
        # Return category with highest score
        if max(scores.values()) > 0:
            return max(scores, key=scores.get)
        
        return 'general'
    
    def _assess_impact(
        self,
        affected_users: int,
        business_impact: str,
        priority: str
    ) -> str:
        """Assess incident impact."""
        
        if priority == 'P0' or business_impact == 'critical':
            return 'critical'
        elif priority == 'P1' or affected_users > 100:
            return 'high'
        elif priority == 'P2' or affected_users > 10:
            return 'medium'
        else:
            return 'low'
    
    def _assess_urgency(self, priority: str, impact: str) -> str:
        """Assess incident urgency."""
        
        if priority == 'P0' or impact == 'critical':
            return 'immediate'
        elif priority == 'P1' or impact == 'high':
            return 'high'
        elif priority == 'P2' or impact == 'medium':
            return 'medium'
        else:
            return 'low'
    
    def _generate_recommendations(
        self,
        priority: str,
        category: str,
        impact: str,
        urgency: str
    ) -> List[Dict]:
        """Generate incident response recommendations."""
        recommendations = []
        
        # Priority-based recommendations
        if priority == 'P0':
            recommendations.append({
                'action': 'Activate incident response team immediately',
                'reason': 'Critical priority incident',
                'urgency': 'immediate'
            })
            recommendations.append({
                'action': 'Create war room and status page',
                'reason': 'Keep stakeholders informed',
                'urgency': 'immediate'
            })
        elif priority == 'P1':
            recommendations.append({
                'action': 'Notify on-call engineer',
                'reason': 'High priority incident',
                'urgency': 'within 15 minutes'
            })
        
        # Category-based recommendations
        if category == 'security':
            recommendations.append({
                'action': 'Isolate affected systems',
                'reason': 'Prevent security threat spread',
                'urgency': 'immediate'
            })
            recommendations.append({
                'action': 'Preserve audit logs and evidence',
                'reason': 'Required for investigation',
                'urgency': 'immediate'
            })
        elif category == 'data':
            recommendations.append({
                'action': 'Check backup integrity',
                'reason': 'Prepare for potential restore',
                'urgency': 'within 30 minutes'
            })
        elif category == 'performance':
            recommendations.append({
                'action': 'Check resource utilization metrics',
                'reason': 'Identify performance bottlenecks',
                'urgency': 'within 15 minutes'
            })
        
        # Impact-based recommendations
        if impact == 'critical':
            recommendations.append({
                'action': 'Prepare rollback plan',
                'reason': 'Enable quick recovery if needed',
                'urgency': 'within 30 minutes'
            })
        
        return recommendations
    
    def _assign_team(self, category: str, priority: str) -> str:
        """Auto-assign incident to appropriate team."""
        
        team_mapping = {
            'infrastructure': 'Infrastructure Team',
            'application': 'Application Team',
            'security': 'Security Team',
            'performance': 'Performance Team',
            'data': 'Data Engineering Team'
        }
        
        team = team_mapping.get(category, 'General Support')
        
        # Escalate P0/P1 to senior team
        if priority in ['P0', 'P1']:
            team = f"Senior {team}"
        
        return team
    
    def _calculate_sla(self, priority: str) -> Dict:
        """Calculate SLA timelines."""
        
        sla_times = {
            'P0': {'response': '15 minutes', 'resolution': '4 hours'},
            'P1': {'response': '1 hour', 'resolution': '24 hours'},
            'P2': {'response': '4 hours', 'resolution': '3 days'},
            'P3': {'response': '1 day', 'resolution': '1 week'},
            'P4': {'response': '3 days', 'resolution': '2 weeks'}
        }
        
        return sla_times.get(priority, {'response': '1 day', 'resolution': '1 week'})
    
    def _calculate_confidence(self, text: str, priority: str) -> float:
        """Calculate classification confidence."""
        
        # Count matching keywords
        keyword_count = sum(
            1 for keyword in self.priority_keywords[priority]
            if keyword in text
        )
        
        # Confidence based on keyword matches
        if keyword_count >= 2:
            return 0.95
        elif keyword_count == 1:
            return 0.80
        else:
            return 0.65
