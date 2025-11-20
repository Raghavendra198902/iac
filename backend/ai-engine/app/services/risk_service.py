import logging
from typing import List, Dict, Any
from datetime import datetime
from uuid import uuid4

from app.models import (
    RiskAssessmentRequest,
    RiskAssessment,
    RiskFactor,
    RiskLevel
)

logger = logging.getLogger(__name__)


class RiskAssessmentService:
    """Service for ML-based risk assessment"""
    
    def __init__(self):
        logger.info("Initializing Risk Assessment Service...")
        
        # Risk factor categories
        self.risk_categories = {
            'security': ['encryption', 'authentication', 'network', 'compliance'],
            'availability': ['redundancy', 'backup', 'disaster_recovery', 'monitoring'],
            'cost': ['budget', 'resource_sizing', 'optimization'],
            'performance': ['scalability', 'latency', 'throughput'],
            'operational': ['complexity', 'maintenance', 'dependencies']
        }
        
        logger.info("Risk Assessment Service initialized")
    
    async def assess_risk(self, request: RiskAssessmentRequest) -> RiskAssessment:
        """Perform comprehensive risk assessment"""
        
        # Fetch resources to analyze
        resources = request.resources or await self._fetch_resources(
            request.blueprint_id, 
            request.deployment_id
        )
        
        # Analyze different risk dimensions
        risk_factors = []
        
        # Security risks
        risk_factors.extend(await self._assess_security_risks(resources))
        
        # Availability risks
        risk_factors.extend(await self._assess_availability_risks(resources))
        
        # Cost risks
        risk_factors.extend(await self._assess_cost_risks(resources))
        
        # Performance risks
        risk_factors.extend(await self._assess_performance_risks(resources))
        
        # Operational risks
        risk_factors.extend(await self._assess_operational_risks(resources))
        
        # Historical analysis (if context provided)
        if request.historical_context:
            risk_factors.extend(await self._analyze_historical_risks(request.historical_context))
        
        # Calculate overall risk
        overall_risk, risk_score = self._calculate_overall_risk(risk_factors)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(risk_factors)
        
        assessment = RiskAssessment(
            assessment_id=str(uuid4()),
            blueprint_id=request.blueprint_id,
            deployment_id=request.deployment_id,
            overall_risk=overall_risk,
            risk_score=risk_score,
            risk_factors=risk_factors,
            recommendations=recommendations,
            assessed_at=datetime.utcnow(),
            metadata={
                'total_resources': len(resources),
                'high_risk_count': sum(1 for r in risk_factors if r.severity in [RiskLevel.HIGH, RiskLevel.CRITICAL]),
                'categories_analyzed': list(self.risk_categories.keys())
            }
        )
        
        logger.info(f"Risk assessment complete: {overall_risk}, score: {risk_score:.2f}, factors: {len(risk_factors)}")
        
        return assessment
    
    async def _fetch_resources(self, blueprint_id: str, deployment_id: str) -> List[Dict[str, Any]]:
        """Fetch resources from blueprint or deployment"""
        # Mock implementation
        return [
            {'type': 'azurerm_virtual_machine', 'name': 'web-vm', 'properties': {}},
            {'type': 'azurerm_storage_account', 'name': 'storage', 'properties': {}},
            {'type': 'azurerm_sql_database', 'name': 'db', 'properties': {}}
        ]
    
    async def _assess_security_risks(self, resources: List[Dict[str, Any]]) -> List[RiskFactor]:
        """Assess security-related risks"""
        risks = []
        
        # Check for unencrypted storage
        storage_resources = [r for r in resources if 'storage' in r['type'].lower() or 'disk' in r['type'].lower()]
        if storage_resources:
            for resource in storage_resources:
                if not resource.get('properties', {}).get('encryption_enabled'):
                    risks.append(RiskFactor(
                        factor_id=str(uuid4()),
                        category='security',
                        severity=RiskLevel.HIGH,
                        title='Unencrypted Storage',
                        description=f"Storage resource '{resource['name']}' does not have encryption enabled",
                        impact='Data breach risk, compliance violations',
                        probability=0.4,
                        mitigation='Enable encryption at rest for all storage resources',
                        resources_affected=[resource['name']]
                    ))
        
        # Check for public network exposure
        network_resources = [r for r in resources if 'network' in r['type'].lower() or 'security' in r['type'].lower()]
        if not network_resources:
            risks.append(RiskFactor(
                factor_id=str(uuid4()),
                category='security',
                severity=RiskLevel.MEDIUM,
                title='Missing Network Security',
                description='No network security groups or firewalls detected',
                impact='Potential unauthorized access to resources',
                probability=0.6,
                mitigation='Implement network security groups with restrictive rules',
                resources_affected=['network']
            ))
        
        return risks
    
    async def _assess_availability_risks(self, resources: List[Dict[str, Any]]) -> List[RiskFactor]:
        """Assess availability-related risks"""
        risks = []
        
        # Check for single points of failure
        compute_count = sum(1 for r in resources if 'vm' in r['type'].lower() or 'instance' in r['type'].lower())
        if compute_count == 1:
            risks.append(RiskFactor(
                factor_id=str(uuid4()),
                category='availability',
                severity=RiskLevel.HIGH,
                title='Single Point of Failure',
                description='Only one compute instance - no redundancy',
                impact='Service downtime if instance fails',
                probability=0.7,
                mitigation='Deploy multiple instances with load balancing',
                resources_affected=['compute']
            ))
        
        # Check for backup configuration
        db_resources = [r for r in resources if 'database' in r['type'].lower() or 'sql' in r['type'].lower()]
        if db_resources:
            for db in db_resources:
                if not db.get('properties', {}).get('backup_retention_days'):
                    risks.append(RiskFactor(
                        factor_id=str(uuid4()),
                        category='availability',
                        severity=RiskLevel.MEDIUM,
                        title='No Database Backup',
                        description=f"Database '{db['name']}' has no backup configured",
                        impact='Data loss risk in case of failure',
                        probability=0.3,
                        mitigation='Configure automated backups with appropriate retention',
                        resources_affected=[db['name']]
                    ))
        
        return risks
    
    async def _assess_cost_risks(self, resources: List[Dict[str, Any]]) -> List[RiskFactor]:
        """Assess cost-related risks"""
        risks = []
        
        # Check for oversized resources
        for resource in resources:
            if 'sku' in resource.get('properties', {}):
                sku = resource['properties']['sku']
                if any(size in sku for size in ['large', 'xlarge', '16', '32']):
                    risks.append(RiskFactor(
                        factor_id=str(uuid4()),
                        category='cost',
                        severity=RiskLevel.MEDIUM,
                        title='Potentially Oversized Resource',
                        description=f"Resource '{resource['name']}' may be larger than necessary",
                        impact='Higher than necessary operational costs',
                        probability=0.5,
                        mitigation='Right-size resources based on actual usage metrics',
                        resources_affected=[resource['name']]
                    ))
        
        return risks
    
    async def _assess_performance_risks(self, resources: List[Dict[str, Any]]) -> List[RiskFactor]:
        """Assess performance-related risks"""
        risks = []
        
        # Check for load balancing
        compute_count = sum(1 for r in resources if 'vm' in r['type'].lower() or 'instance' in r['type'].lower())
        lb_count = sum(1 for r in resources if 'load' in r['type'].lower() and 'balancer' in r['type'].lower())
        
        if compute_count > 1 and lb_count == 0:
            risks.append(RiskFactor(
                factor_id=str(uuid4()),
                category='performance',
                severity=RiskLevel.MEDIUM,
                title='Missing Load Balancer',
                description='Multiple compute instances without load balancing',
                impact='Uneven load distribution, potential performance bottlenecks',
                probability=0.6,
                mitigation='Implement load balancer for traffic distribution',
                resources_affected=['compute']
            ))
        
        return risks
    
    async def _assess_operational_risks(self, resources: List[Dict[str, Any]]) -> List[RiskFactor]:
        """Assess operational complexity risks"""
        risks = []
        
        # Check complexity
        if len(resources) > 20:
            risks.append(RiskFactor(
                factor_id=str(uuid4()),
                category='operational',
                severity=RiskLevel.LOW,
                title='High Infrastructure Complexity',
                description=f'{len(resources)} resources may increase operational overhead',
                impact='Higher maintenance burden, increased chance of configuration errors',
                probability=0.4,
                mitigation='Consider infrastructure simplification or automation tools',
                resources_affected=['infrastructure']
            ))
        
        return risks
    
    async def _analyze_historical_risks(self, historical_context: Dict[str, Any]) -> List[RiskFactor]:
        """Analyze risks based on historical data"""
        risks = []
        
        # Check deployment failure history
        if historical_context.get('deployment_failures', 0) > 2:
            risks.append(RiskFactor(
                factor_id=str(uuid4()),
                category='operational',
                severity=RiskLevel.HIGH,
                title='High Deployment Failure Rate',
                description='Historical data shows multiple deployment failures',
                impact='Likely deployment issues, requires careful review',
                probability=0.8,
                mitigation='Review previous failure logs, implement staged rollout',
                resources_affected=['deployment']
            ))
        
        return risks
    
    def _calculate_overall_risk(self, risk_factors: List[RiskFactor]) -> tuple[RiskLevel, float]:
        """Calculate overall risk level and score"""
        if not risk_factors:
            return RiskLevel.LOW, 10.0
        
        # Weight by severity
        severity_weights = {
            RiskLevel.LOW: 1.0,
            RiskLevel.MEDIUM: 2.5,
            RiskLevel.HIGH: 5.0,
            RiskLevel.CRITICAL: 10.0
        }
        
        # Calculate weighted score
        total_score = 0.0
        for risk in risk_factors:
            weight = severity_weights[risk.severity]
            total_score += weight * risk.probability
        
        # Normalize to 0-100
        risk_score = min(total_score * 10, 100.0)
        
        # Determine overall level
        if risk_score < 25:
            overall_risk = RiskLevel.LOW
        elif risk_score < 50:
            overall_risk = RiskLevel.MEDIUM
        elif risk_score < 75:
            overall_risk = RiskLevel.HIGH
        else:
            overall_risk = RiskLevel.CRITICAL
        
        return overall_risk, risk_score
    
    def _generate_recommendations(self, risk_factors: List[RiskFactor]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Group by severity
        critical_risks = [r for r in risk_factors if r.severity == RiskLevel.CRITICAL]
        high_risks = [r for r in risk_factors if r.severity == RiskLevel.HIGH]
        
        if critical_risks:
            recommendations.append(
                f"URGENT: Address {len(critical_risks)} critical risk(s) before deployment"
            )
        
        if high_risks:
            recommendations.append(
                f"Address {len(high_risks)} high-severity risk(s) to improve reliability"
            )
        
        # Add specific recommendations
        for risk in risk_factors:
            if risk.severity in [RiskLevel.CRITICAL, RiskLevel.HIGH]:
                recommendations.append(f"{risk.title}: {risk.mitigation}")
        
        return recommendations[:10]  # limit to top 10
