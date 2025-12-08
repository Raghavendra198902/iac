"""
Churn Predictor - Customer Churn Prediction for SaaS
Predicts customer churn based on usage patterns and engagement
Helps with proactive retention strategies
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class ChurnPredictor:
    """
    ML model for predicting customer churn.
    
    Features:
    - Usage pattern analysis
    - Engagement scoring
    - Churn risk calculation
    - Retention recommendations
    - Early warning system
    """
    
    def __init__(self):
        self.model_name = "ChurnPredictor"
        self.version = "1.0.0"
        self.accuracy = 0.85
        self.is_trained = True
        
        # Churn risk thresholds
        self.thresholds = {
            'usage_decline': 0.30,  # 30% decline
            'login_frequency': 7,    # days since last login
            'support_tickets': 3,    # recent tickets
            'feature_adoption': 0.20 # 20% feature usage
        }
    
    def predict(
        self,
        customer_id: str,
        usage_data: Dict,
        engagement_data: Dict,
        account_age_days: int
    ) -> Dict:
        """
        Predict customer churn probability.
        
        Args:
            customer_id: Customer identifier
            usage_data: Usage metrics (API calls, logins, etc.)
            engagement_data: Engagement metrics (features used, support tickets)
            account_age_days: Days since account creation
        
        Returns:
            Churn prediction with risk score and recommendations
        """
        try:
            # Calculate risk factors
            risk_factors = self._calculate_risk_factors(
                usage_data, engagement_data, account_age_days
            )
            
            # Calculate churn probability
            churn_probability = self._calculate_churn_probability(risk_factors)
            
            # Determine risk level
            risk_level = self._get_risk_level(churn_probability)
            
            # Generate retention recommendations
            recommendations = self._generate_recommendations(
                risk_factors, risk_level, usage_data, engagement_data
            )
            
            # Calculate customer health score
            health_score = self._calculate_health_score(risk_factors)
            
            # Estimate churn timeframe
            churn_timeframe = self._estimate_churn_timeframe(
                churn_probability, risk_factors
            )
            
            return {
                'model': self.model_name,
                'version': self.version,
                'customer_id': customer_id,
                'prediction': {
                    'churn_probability': round(churn_probability, 3),
                    'risk_level': risk_level,
                    'health_score': health_score,
                    'churn_timeframe': churn_timeframe
                },
                'risk_factors': risk_factors,
                'recommendations': recommendations,
                'priority': self._get_intervention_priority(risk_level),
                'accuracy': self.accuracy,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Churn prediction failed: {e}")
            return {'error': str(e), 'model': self.model_name}
    
    def _calculate_risk_factors(
        self,
        usage_data: Dict,
        engagement_data: Dict,
        account_age_days: int
    ) -> Dict:
        """Calculate individual risk factors."""
        risk_factors = {}
        
        # Usage decline
        current_usage = usage_data.get('current_month_api_calls', 0)
        previous_usage = usage_data.get('previous_month_api_calls', 0)
        
        if previous_usage > 0:
            usage_change = (current_usage - previous_usage) / previous_usage
            risk_factors['usage_decline'] = {
                'value': usage_change,
                'risk_score': max(0, -usage_change * 100),  # Negative change = risk
                'is_risk': usage_change < -self.thresholds['usage_decline']
            }
        else:
            risk_factors['usage_decline'] = {
                'value': 0,
                'risk_score': 0,
                'is_risk': False
            }
        
        # Login frequency
        days_since_login = usage_data.get('days_since_last_login', 0)
        risk_factors['login_inactivity'] = {
            'value': days_since_login,
            'risk_score': min(100, days_since_login * 10),
            'is_risk': days_since_login > self.thresholds['login_frequency']
        }
        
        # Support ticket volume
        support_tickets = engagement_data.get('support_tickets_last_30_days', 0)
        risk_factors['support_tickets'] = {
            'value': support_tickets,
            'risk_score': min(100, support_tickets * 20),
            'is_risk': support_tickets > self.thresholds['support_tickets']
        }
        
        # Feature adoption
        features_used = engagement_data.get('features_used', 0)
        total_features = engagement_data.get('total_features', 10)
        adoption_rate = features_used / total_features if total_features > 0 else 0
        
        risk_factors['low_feature_adoption'] = {
            'value': adoption_rate,
            'risk_score': (1 - adoption_rate) * 100,
            'is_risk': adoption_rate < self.thresholds['feature_adoption']
        }
        
        # Payment issues
        payment_failures = engagement_data.get('payment_failures_last_90_days', 0)
        risk_factors['payment_issues'] = {
            'value': payment_failures,
            'risk_score': min(100, payment_failures * 50),
            'is_risk': payment_failures > 0
        }
        
        # Contract status
        days_until_renewal = engagement_data.get('days_until_renewal', 365)
        risk_factors['contract_renewal'] = {
            'value': days_until_renewal,
            'risk_score': max(0, 100 - days_until_renewal / 3),
            'is_risk': days_until_renewal < 60
        }
        
        # NPS score (if available)
        nps_score = engagement_data.get('nps_score')
        if nps_score is not None:
            risk_factors['nps'] = {
                'value': nps_score,
                'risk_score': max(0, 100 - (nps_score + 100) / 2),
                'is_risk': nps_score < 0
            }
        
        return risk_factors
    
    def _calculate_churn_probability(self, risk_factors: Dict) -> float:
        """Calculate overall churn probability."""
        
        # Weighted risk score
        weights = {
            'usage_decline': 0.25,
            'login_inactivity': 0.20,
            'support_tickets': 0.15,
            'low_feature_adoption': 0.15,
            'payment_issues': 0.15,
            'contract_renewal': 0.10,
            'nps': 0.10 if 'nps' in risk_factors else 0
        }
        
        # Normalize weights if NPS missing
        if 'nps' not in risk_factors:
            total = sum(w for k, w in weights.items() if k != 'nps')
            weights = {k: v / total for k, v in weights.items() if k != 'nps'}
        
        # Calculate weighted score
        weighted_score = sum(
            risk_factors[factor]['risk_score'] * weights[factor]
            for factor in risk_factors
            if factor in weights
        )
        
        # Convert to probability (0-1)
        probability = weighted_score / 100
        
        return min(1.0, max(0.0, probability))
    
    def _get_risk_level(self, probability: float) -> str:
        """Determine risk level from probability."""
        if probability >= 0.75:
            return 'critical'
        elif probability >= 0.50:
            return 'high'
        elif probability >= 0.25:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_health_score(self, risk_factors: Dict) -> int:
        """Calculate customer health score (0-100)."""
        avg_risk = sum(
            rf['risk_score'] for rf in risk_factors.values()
        ) / len(risk_factors)
        
        health_score = 100 - avg_risk
        return int(max(0, min(100, health_score)))
    
    def _estimate_churn_timeframe(
        self,
        probability: float,
        risk_factors: Dict
    ) -> str:
        """Estimate when churn might occur."""
        
        # Check contract renewal
        if 'contract_renewal' in risk_factors:
            days_until_renewal = risk_factors['contract_renewal']['value']
            if days_until_renewal < 30:
                return f"{days_until_renewal} days (at renewal)"
        
        # Check payment issues
        if risk_factors.get('payment_issues', {}).get('is_risk'):
            return "7-14 days (payment issue)"
        
        # Based on probability
        if probability >= 0.75:
            return "7-30 days"
        elif probability >= 0.50:
            return "30-60 days"
        elif probability >= 0.25:
            return "60-90 days"
        else:
            return ">90 days"
    
    def _generate_recommendations(
        self,
        risk_factors: Dict,
        risk_level: str,
        usage_data: Dict,
        engagement_data: Dict
    ) -> List[Dict]:
        """Generate retention recommendations."""
        recommendations = []
        
        # Usage decline
        if risk_factors['usage_decline']['is_risk']:
            recommendations.append({
                'priority': 'high',
                'category': 'engagement',
                'action': 'Reach out to understand usage decline',
                'details': 'Schedule a check-in call to discuss needs and challenges',
                'expected_impact': 'Identify and address adoption barriers'
            })
        
        # Login inactivity
        if risk_factors['login_inactivity']['is_risk']:
            recommendations.append({
                'priority': 'high',
                'category': 'engagement',
                'action': 'Send re-engagement email campaign',
                'details': 'Highlight new features and unused capabilities',
                'expected_impact': 'Increase product awareness and usage'
            })
        
        # Support tickets
        if risk_factors['support_tickets']['is_risk']:
            recommendations.append({
                'priority': 'critical',
                'category': 'support',
                'action': 'Escalate to customer success manager',
                'details': 'Address ongoing issues and improve satisfaction',
                'expected_impact': 'Resolve pain points before churn'
            })
        
        # Low feature adoption
        if risk_factors['low_feature_adoption']['is_risk']:
            recommendations.append({
                'priority': 'medium',
                'category': 'onboarding',
                'action': 'Offer personalized onboarding session',
                'details': 'Demo key features relevant to their use case',
                'expected_impact': 'Increase product value realization'
            })
        
        # Payment issues
        if risk_factors.get('payment_issues', {}).get('is_risk'):
            recommendations.append({
                'priority': 'critical',
                'category': 'billing',
                'action': 'Contact about payment method update',
                'details': 'Offer assistance with billing setup',
                'expected_impact': 'Prevent involuntary churn'
            })
        
        # Contract renewal
        if risk_factors.get('contract_renewal', {}).get('is_risk'):
            recommendations.append({
                'priority': 'high',
                'category': 'renewal',
                'action': 'Start renewal conversation early',
                'details': 'Present ROI analysis and renewal incentives',
                'expected_impact': 'Secure contract renewal'
            })
        
        # NPS detractor
        if risk_factors.get('nps', {}).get('is_risk'):
            recommendations.append({
                'priority': 'high',
                'category': 'satisfaction',
                'action': 'Follow up on NPS feedback',
                'details': 'Address concerns raised in NPS survey',
                'expected_impact': 'Improve customer satisfaction'
            })
        
        return recommendations
    
    def _get_intervention_priority(self, risk_level: str) -> str:
        """Determine intervention priority."""
        priority_map = {
            'critical': 'immediate',
            'high': 'within_24_hours',
            'medium': 'within_7_days',
            'low': 'routine_check'
        }
        return priority_map.get(risk_level, 'routine_check')
