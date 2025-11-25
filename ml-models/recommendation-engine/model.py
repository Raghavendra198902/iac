"""
AI Recommendation Engine
Generates intelligent recommendations for cost optimization, security, and performance
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from datetime import datetime
import json


class RecommendationEngine:
    """
    Rule-based and ML-powered recommendation engine for infrastructure optimization
    """
    
    def __init__(self):
        self.recommendation_rules = self._load_rules()
        self.recommendation_history = []
        
    def _load_rules(self) -> Dict:
        """Load recommendation rules"""
        return {
            'cost_optimization': [
                {
                    'id': 'rightsizing',
                    'name': 'VM Rightsizing',
                    'condition': lambda metrics: metrics.get('cpu_avg', 100) < 30 and metrics.get('memory_avg', 100) < 40,
                    'recommendation': 'Downsize VM - Underutilized resources detected',
                    'potential_savings': lambda current_cost: current_cost * 0.30,
                    'impact': 'medium',
                    'effort': 'low'
                },
                {
                    'id': 'reserved_instances',
                    'name': 'Reserved Instances',
                    'condition': lambda metrics: metrics.get('uptime_percent', 0) > 80,
                    'recommendation': 'Purchase Reserved Instances for consistent workloads',
                    'potential_savings': lambda current_cost: current_cost * 0.40,
                    'impact': 'high',
                    'effort': 'low'
                },
                {
                    'id': 'spot_instances',
                    'name': 'Spot Instances',
                    'condition': lambda metrics: metrics.get('fault_tolerant', False) and metrics.get('priority', 'high') == 'low',
                    'recommendation': 'Use Spot Instances for fault-tolerant workloads',
                    'potential_savings': lambda current_cost: current_cost * 0.70,
                    'impact': 'high',
                    'effort': 'medium'
                },
                {
                    'id': 'storage_tiering',
                    'name': 'Storage Tiering',
                    'condition': lambda metrics: metrics.get('storage_access_freq', 'high') == 'low',
                    'recommendation': 'Move infrequently accessed data to cheaper storage tier',
                    'potential_savings': lambda current_cost: current_cost * 0.50,
                    'impact': 'medium',
                    'effort': 'low'
                },
                {
                    'id': 'idle_resources',
                    'name': 'Idle Resource Cleanup',
                    'condition': lambda metrics: metrics.get('utilization', 100) < 5,
                    'recommendation': 'Terminate idle resources to reduce waste',
                    'potential_savings': lambda current_cost: current_cost * 1.0,
                    'impact': 'high',
                    'effort': 'low'
                }
            ],
            'security': [
                {
                    'id': 'encryption_at_rest',
                    'name': 'Enable Encryption at Rest',
                    'condition': lambda security: not security.get('encryption_enabled', False),
                    'recommendation': 'Enable encryption for sensitive data at rest',
                    'severity': 'high',
                    'compliance': ['PCI-DSS', 'HIPAA', 'GDPR']
                },
                {
                    'id': 'public_access',
                    'name': 'Restrict Public Access',
                    'condition': lambda security: security.get('public_access', False) and security.get('sensitive_data', False),
                    'recommendation': 'Remove public access from resources with sensitive data',
                    'severity': 'critical',
                    'compliance': ['SOC2', 'ISO27001']
                },
                {
                    'id': 'mfa_enabled',
                    'name': 'Enable Multi-Factor Authentication',
                    'condition': lambda security: not security.get('mfa_enabled', False),
                    'recommendation': 'Enable MFA for all administrative accounts',
                    'severity': 'high',
                    'compliance': ['PCI-DSS', 'SOC2']
                },
                {
                    'id': 'security_groups',
                    'name': 'Tighten Security Groups',
                    'condition': lambda security: '0.0.0.0/0' in security.get('allowed_ips', []),
                    'recommendation': 'Restrict security group rules to specific IP ranges',
                    'severity': 'medium',
                    'compliance': ['CIS']
                },
                {
                    'id': 'patch_management',
                    'name': 'Update Security Patches',
                    'condition': lambda security: security.get('days_since_patch', 999) > 30,
                    'recommendation': 'Apply latest security patches and updates',
                    'severity': 'high',
                    'compliance': ['PCI-DSS', 'NIST']
                }
            ],
            'performance': [
                {
                    'id': 'auto_scaling',
                    'name': 'Enable Auto-Scaling',
                    'condition': lambda perf: perf.get('load_variance', 0) > 30 and not perf.get('auto_scaling_enabled', False),
                    'recommendation': 'Enable auto-scaling to handle variable load',
                    'impact': 'high',
                    'benefit': 'Improved availability and cost efficiency'
                },
                {
                    'id': 'caching',
                    'name': 'Implement Caching',
                    'condition': lambda perf: perf.get('cache_hit_rate', 100) < 80,
                    'recommendation': 'Implement or optimize caching layer (Redis/Memcached)',
                    'impact': 'high',
                    'benefit': 'Reduced latency and database load'
                },
                {
                    'id': 'cdn',
                    'name': 'Use Content Delivery Network',
                    'condition': lambda perf: perf.get('static_content_percent', 0) > 50 and not perf.get('cdn_enabled', False),
                    'recommendation': 'Use CDN for static content delivery',
                    'impact': 'medium',
                    'benefit': 'Faster content delivery globally'
                },
                {
                    'id': 'database_optimization',
                    'name': 'Optimize Database Queries',
                    'condition': lambda perf: perf.get('slow_query_count', 0) > 10,
                    'recommendation': 'Optimize slow database queries and add indexes',
                    'impact': 'high',
                    'benefit': 'Improved response times'
                },
                {
                    'id': 'connection_pooling',
                    'name': 'Enable Connection Pooling',
                    'condition': lambda perf: not perf.get('connection_pooling', False) and perf.get('connection_count', 0) > 100,
                    'recommendation': 'Enable connection pooling to reduce overhead',
                    'impact': 'medium',
                    'benefit': 'Better resource utilization'
                }
            ]
        }
    
    def generate_cost_recommendations(self, resource_metrics: List[Dict]) -> List[Dict]:
        """
        Generate cost optimization recommendations
        
        Args:
            resource_metrics: List of resource metrics dictionaries
            
        Returns:
            List of cost recommendations
        """
        recommendations = []
        
        for resource in resource_metrics:
            resource_id = resource.get('resource_id', 'unknown')
            resource_type = resource.get('resource_type', 'unknown')
            current_cost = resource.get('monthly_cost', 0)
            
            for rule in self.recommendation_rules['cost_optimization']:
                try:
                    if rule['condition'](resource):
                        savings = rule['potential_savings'](current_cost)
                        
                        recommendations.append({
                            'id': f"{rule['id']}_{resource_id}",
                            'resource_id': resource_id,
                            'resource_type': resource_type,
                            'category': 'cost_optimization',
                            'title': rule['name'],
                            'description': rule['recommendation'],
                            'current_cost': float(current_cost),
                            'potential_savings': float(savings),
                            'savings_percent': float((savings / current_cost * 100) if current_cost > 0 else 0),
                            'impact': rule['impact'],
                            'effort': rule['effort'],
                            'priority': self._calculate_priority(savings, rule['impact'], rule['effort']),
                            'timestamp': datetime.now().isoformat()
                        })
                except Exception as e:
                    print(f"Error evaluating rule {rule['id']}: {e}")
        
        # Sort by priority and potential savings
        recommendations.sort(key=lambda x: (self._priority_score(x['priority']), x['potential_savings']), reverse=True)
        
        return recommendations
    
    def generate_security_recommendations(self, security_audits: List[Dict]) -> List[Dict]:
        """
        Generate security recommendations
        
        Args:
            security_audits: List of security audit results
            
        Returns:
            List of security recommendations
        """
        recommendations = []
        
        for audit in security_audits:
            resource_id = audit.get('resource_id', 'unknown')
            resource_type = audit.get('resource_type', 'unknown')
            
            for rule in self.recommendation_rules['security']:
                try:
                    if rule['condition'](audit):
                        recommendations.append({
                            'id': f"{rule['id']}_{resource_id}",
                            'resource_id': resource_id,
                            'resource_type': resource_type,
                            'category': 'security',
                            'title': rule['name'],
                            'description': rule['recommendation'],
                            'severity': rule['severity'],
                            'compliance_frameworks': rule['compliance'],
                            'priority': rule['severity'],
                            'timestamp': datetime.now().isoformat()
                        })
                except Exception as e:
                    print(f"Error evaluating security rule {rule['id']}: {e}")
        
        # Sort by severity
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        recommendations.sort(key=lambda x: severity_order.get(x['severity'], 4))
        
        return recommendations
    
    def generate_performance_recommendations(self, performance_metrics: List[Dict]) -> List[Dict]:
        """
        Generate performance optimization recommendations
        
        Args:
            performance_metrics: List of performance metric dictionaries
            
        Returns:
            List of performance recommendations
        """
        recommendations = []
        
        for metrics in performance_metrics:
            resource_id = metrics.get('resource_id', 'unknown')
            resource_type = metrics.get('resource_type', 'unknown')
            
            for rule in self.recommendation_rules['performance']:
                try:
                    if rule['condition'](metrics):
                        recommendations.append({
                            'id': f"{rule['id']}_{resource_id}",
                            'resource_id': resource_id,
                            'resource_type': resource_type,
                            'category': 'performance',
                            'title': rule['name'],
                            'description': rule['recommendation'],
                            'impact': rule['impact'],
                            'benefit': rule['benefit'],
                            'priority': rule['impact'],
                            'timestamp': datetime.now().isoformat()
                        })
                except Exception as e:
                    print(f"Error evaluating performance rule {rule['id']}: {e}")
        
        # Sort by impact
        impact_order = {'high': 0, 'medium': 1, 'low': 2}
        recommendations.sort(key=lambda x: impact_order.get(x['impact'], 3))
        
        return recommendations
    
    def get_all_recommendations(self, resource_data: Dict) -> Dict:
        """
        Generate all recommendations for a resource or infrastructure
        
        Args:
            resource_data: Dictionary containing metrics, security audits, and performance data
            
        Returns:
            Dictionary with all recommendations categorized
        """
        cost_recs = self.generate_cost_recommendations(
            resource_data.get('resource_metrics', [])
        )
        
        security_recs = self.generate_security_recommendations(
            resource_data.get('security_audits', [])
        )
        
        performance_recs = self.generate_performance_recommendations(
            resource_data.get('performance_metrics', [])
        )
        
        total_savings = sum(rec['potential_savings'] for rec in cost_recs)
        
        return {
            'summary': {
                'total_recommendations': len(cost_recs) + len(security_recs) + len(performance_recs),
                'cost_recommendations': len(cost_recs),
                'security_recommendations': len(security_recs),
                'performance_recommendations': len(performance_recs),
                'total_potential_savings': float(total_savings),
                'generated_at': datetime.now().isoformat()
            },
            'cost_optimization': cost_recs,
            'security': security_recs,
            'performance': performance_recs
        }
    
    def _calculate_priority(self, savings: float, impact: str, effort: str) -> str:
        """Calculate recommendation priority based on savings, impact, and effort"""
        impact_scores = {'high': 3, 'medium': 2, 'low': 1}
        effort_scores = {'low': 3, 'medium': 2, 'high': 1}
        
        score = (savings / 100) + impact_scores.get(impact, 1) + effort_scores.get(effort, 1)
        
        if score >= 8:
            return 'critical'
        elif score >= 6:
            return 'high'
        elif score >= 4:
            return 'medium'
        else:
            return 'low'
    
    def _priority_score(self, priority: str) -> int:
        """Convert priority string to numeric score for sorting"""
        priority_scores = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        return priority_scores.get(priority, 0)


# Helper function for generating sample data
def generate_sample_data() -> Dict:
    """Generate sample data for testing"""
    return {
        'resource_metrics': [
            {
                'resource_id': 'vm-001',
                'resource_type': 'virtual_machine',
                'monthly_cost': 500,
                'cpu_avg': 25,
                'memory_avg': 35,
                'uptime_percent': 95,
                'utilization': 30
            },
            {
                'resource_id': 'vm-002',
                'resource_type': 'virtual_machine',
                'monthly_cost': 800,
                'cpu_avg': 15,
                'memory_avg': 20,
                'uptime_percent': 85,
                'utilization': 3
            },
            {
                'resource_id': 'storage-001',
                'resource_type': 'storage',
                'monthly_cost': 200,
                'storage_access_freq': 'low'
            }
        ],
        'security_audits': [
            {
                'resource_id': 'db-001',
                'resource_type': 'database',
                'encryption_enabled': False,
                'public_access': True,
                'sensitive_data': True,
                'mfa_enabled': False
            },
            {
                'resource_id': 'sg-001',
                'resource_type': 'security_group',
                'allowed_ips': ['0.0.0.0/0', '10.0.0.0/8'],
                'days_since_patch': 45
            }
        ],
        'performance_metrics': [
            {
                'resource_id': 'app-001',
                'resource_type': 'application',
                'load_variance': 45,
                'auto_scaling_enabled': False,
                'cache_hit_rate': 65,
                'static_content_percent': 60,
                'cdn_enabled': False,
                'slow_query_count': 25
            }
        ]
    }


if __name__ == '__main__':
    # Example usage
    print("AI Recommendation Engine - Example Usage\n")
    
    # Initialize engine
    engine = RecommendationEngine()
    
    # Generate sample data
    print("Generating recommendations for sample infrastructure...\n")
    data = generate_sample_data()
    
    # Get all recommendations
    recommendations = engine.get_all_recommendations(data)
    
    # Print summary
    print("=" * 60)
    print("RECOMMENDATION SUMMARY")
    print("=" * 60)
    print(f"Total Recommendations: {recommendations['summary']['total_recommendations']}")
    print(f"  Cost Optimization: {recommendations['summary']['cost_recommendations']}")
    print(f"  Security: {recommendations['summary']['security_recommendations']}")
    print(f"  Performance: {recommendations['summary']['performance_recommendations']}")
    print(f"\nTotal Potential Savings: ${recommendations['summary']['total_potential_savings']:.2f}/month")
    print("=" * 60)
    
    # Print cost recommendations
    if recommendations['cost_optimization']:
        print("\n💰 COST OPTIMIZATION RECOMMENDATIONS")
        print("-" * 60)
        for i, rec in enumerate(recommendations['cost_optimization'][:5], 1):
            print(f"\n{i}. {rec['title']} [{rec['priority'].upper()}]")
            print(f"   Resource: {rec['resource_id']}")
            print(f"   {rec['description']}")
            print(f"   💵 Potential Savings: ${rec['potential_savings']:.2f}/month ({rec['savings_percent']:.1f}%)")
            print(f"   Impact: {rec['impact']} | Effort: {rec['effort']}")
    
    # Print security recommendations
    if recommendations['security']:
        print("\n🔒 SECURITY RECOMMENDATIONS")
        print("-" * 60)
        for i, rec in enumerate(recommendations['security'][:5], 1):
            print(f"\n{i}. {rec['title']} [{rec['severity'].upper()}]")
            print(f"   Resource: {rec['resource_id']}")
            print(f"   {rec['description']}")
            print(f"   Compliance: {', '.join(rec['compliance_frameworks'])}")
    
    # Print performance recommendations
    if recommendations['performance']:
        print("\n⚡ PERFORMANCE RECOMMENDATIONS")
        print("-" * 60)
        for i, rec in enumerate(recommendations['performance'][:5], 1):
            print(f"\n{i}. {rec['title']} [{rec['impact'].upper()} IMPACT]")
            print(f"   Resource: {rec['resource_id']}")
            print(f"   {rec['description']}")
            print(f"   Benefit: {rec['benefit']}")
    
    print("\n" + "=" * 60)
    print(f"Generated at: {recommendations['summary']['generated_at']}")
    print("=" * 60)
