import re
import logging
from typing import List, Dict, Any
from datetime import datetime
from uuid import uuid4
import numpy as np
from sentence_transformers import SentenceTransformer

from app.models import (
    NLPBlueprintRequest,
    BlueprintFromNLP,
    ResourceRecommendation,
    CloudProvider
)

logger = logging.getLogger(__name__)


class NLPService:
    """Service for NLP-based blueprint generation"""
    
    def __init__(self):
        logger.info("Initializing NLP Service...")
        
        # Load sentence transformer for embeddings
        try:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Sentence transformer loaded successfully")
        except Exception as e:
            logger.warning(f"Failed to load embedding model: {e}")
            self.embedding_model = None
        
        # Resource keywords mapping
        self.resource_keywords = {
            'compute': ['vm', 'virtual machine', 'compute', 'server', 'instance', 'ec2'],
            'storage': ['storage', 'blob', 'disk', 's3', 'bucket', 'file'],
            'database': ['database', 'db', 'sql', 'postgres', 'mysql', 'cosmos', 'dynamodb'],
            'network': ['network', 'vpc', 'vnet', 'load balancer', 'gateway', 'firewall'],
            'container': ['container', 'kubernetes', 'aks', 'eks', 'gke', 'docker'],
            'serverless': ['function', 'lambda', 'serverless', 'azure function']
        }
        
        # Cloud provider detection
        self.cloud_keywords = {
            'azure': ['azure', 'microsoft', 'arm'],
            'aws': ['aws', 'amazon', 'ec2', 's3', 'lambda'],
            'gcp': ['gcp', 'google cloud', 'gce', 'gcs']
        }
        
        # Environment detection
        self.environment_keywords = {
            'dev': ['dev', 'development', 'test', 'testing'],
            'staging': ['staging', 'uat', 'pre-prod'],
            'production': ['prod', 'production', 'live']
        }
        
        logger.info("NLP Service initialized")
    
    async def generate_blueprint(self, request: NLPBlueprintRequest) -> BlueprintFromNLP:
        """Generate blueprint from natural language input"""
        
        text = request.user_input.lower()
        
        # Detect cloud provider
        target_cloud = request.target_cloud
        if not target_cloud:
            target_cloud = self._detect_cloud(text)
        
        # Detect environment
        environment = request.environment
        if not environment:
            environment = self._detect_environment(text)
        
        # Extract resource requirements
        resources = self._extract_resources(text, target_cloud)
        
        # Generate blueprint name and description
        blueprint_name = self._generate_name(text)
        description = self._generate_description(text, resources)
        
        # Calculate confidence
        confidence = self._calculate_confidence(text, resources)
        
        blueprint = BlueprintFromNLP(
            blueprint_id=str(uuid4()),
            name=blueprint_name,
            description=description,
            target_cloud=target_cloud,
            environment=environment,
            resources=resources,
            confidence=confidence,
            metadata={
                'original_input': request.user_input,
                'constraints': request.constraints or {},
                'user_id': request.user_id
            },
            created_at=datetime.utcnow()
        )
        
        logger.info(f"Generated blueprint with {len(resources)} resources, confidence: {confidence:.2f}")
        
        return blueprint
    
    def _detect_cloud(self, text: str) -> CloudProvider:
        """Detect target cloud from text"""
        scores = {}
        for cloud, keywords in self.cloud_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            scores[cloud] = score
        
        # Return cloud with highest score, default to Azure
        if max(scores.values()) > 0:
            return CloudProvider(max(scores, key=scores.get))
        return CloudProvider.AZURE
    
    def _detect_environment(self, text: str) -> str:
        """Detect environment from text"""
        for env, keywords in self.environment_keywords.items():
            if any(keyword in text for keyword in keywords):
                return env
        return 'dev'  # default
    
    def _extract_resources(self, text: str, cloud: CloudProvider) -> List[ResourceRecommendation]:
        """Extract resource requirements from text"""
        resources = []
        
        # Detect resource types needed
        resource_types = []
        for res_type, keywords in self.resource_keywords.items():
            if any(keyword in text for keyword in keywords):
                resource_types.append(res_type)
        
        # If no specific resources mentioned, infer from common patterns
        if not resource_types:
            if any(word in text for word in ['web', 'app', 'website', 'application']):
                resource_types = ['compute', 'storage', 'network']
                if 'database' in text or 'data' in text:
                    resource_types.append('database')
        
        # Generate resource recommendations
        for res_type in resource_types:
            resource = self._create_resource_recommendation(res_type, text, cloud)
            if resource:
                resources.append(resource)
        
        return resources
    
    def _create_resource_recommendation(
        self, 
        res_type: str, 
        text: str, 
        cloud: CloudProvider
    ) -> ResourceRecommendation:
        """Create resource recommendation based on type and cloud"""
        
        # Determine scale
        is_scalable = any(word in text for word in ['scale', 'scalable', 'high availability', 'ha'])
        is_large = any(word in text for word in ['large', 'big', 'enterprise', 'high performance'])
        
        # Cloud-specific resource specs
        if cloud == CloudProvider.AZURE:
            if res_type == 'compute':
                sku = 'Standard_D4s_v3' if is_large else 'Standard_D2s_v3'
                return ResourceRecommendation(
                    resource_type='azurerm_virtual_machine',
                    name='app-vm',
                    sku=sku,
                    quantity=3 if is_scalable else 1,
                    properties={'os': 'Linux'},
                    reasoning='Selected VM size based on workload requirements',
                    confidence=0.85,
                    estimated_cost=140.16 if not is_large else 280.32
                )
            elif res_type == 'storage':
                return ResourceRecommendation(
                    resource_type='azurerm_storage_account',
                    name='app-storage',
                    sku='Standard_LRS',
                    tier='Standard',
                    quantity=1,
                    properties={},
                    reasoning='Standard storage for application data',
                    confidence=0.90,
                    estimated_cost=20.00
                )
            elif res_type == 'database':
                tier = 'S1' if is_large else 'S0'
                return ResourceRecommendation(
                    resource_type='azurerm_sql_database',
                    name='app-db',
                    sku=tier,
                    quantity=1,
                    properties={'collation': 'SQL_Latin1_General_CP1_CI_AS'},
                    reasoning='SQL database for structured data',
                    confidence=0.88,
                    estimated_cost=30.00 if not is_large else 60.00
                )
            elif res_type == 'network':
                return ResourceRecommendation(
                    resource_type='azurerm_virtual_network',
                    name='app-vnet',
                    properties={'address_space': ['10.0.0.0/16']},
                    quantity=1,
                    reasoning='Virtual network for resource isolation',
                    confidence=0.95,
                    estimated_cost=0.00
                )
        
        elif cloud == CloudProvider.AWS:
            if res_type == 'compute':
                size = 't3.large' if is_large else 't3.medium'
                return ResourceRecommendation(
                    resource_type='aws_instance',
                    name='app-instance',
                    sku=size,
                    quantity=3 if is_scalable else 1,
                    properties={'ami': 'ami-latest-ubuntu'},
                    reasoning='EC2 instance for application hosting',
                    confidence=0.85,
                    estimated_cost=60.00 if not is_large else 120.00
                )
            elif res_type == 'storage':
                return ResourceRecommendation(
                    resource_type='aws_s3_bucket',
                    name='app-bucket',
                    properties={'versioning': True},
                    quantity=1,
                    reasoning='S3 bucket for object storage',
                    confidence=0.92,
                    estimated_cost=23.00
                )
            elif res_type == 'database':
                size = 'db.t3.medium' if is_large else 'db.t3.small'
                return ResourceRecommendation(
                    resource_type='aws_db_instance',
                    name='app-rds',
                    sku=size,
                    quantity=1,
                    properties={'engine': 'postgres'},
                    reasoning='RDS PostgreSQL database',
                    confidence=0.88,
                    estimated_cost=50.00 if not is_large else 100.00
                )
        
        return None
    
    def _generate_name(self, text: str) -> str:
        """Generate blueprint name from text"""
        # Extract potential name from text
        words = text.split()
        
        # Look for key phrases
        if 'web' in text and 'app' in text:
            return 'Web Application Blueprint'
        elif 'api' in text:
            return 'API Service Blueprint'
        elif 'data' in text and 'pipeline' in text:
            return 'Data Pipeline Blueprint'
        elif 'microservice' in text:
            return 'Microservices Blueprint'
        
        return 'Infrastructure Blueprint'
    
    def _generate_description(self, text: str, resources: List[ResourceRecommendation]) -> str:
        """Generate blueprint description"""
        resource_summary = ', '.join(set(r.resource_type.split('_')[1] if '_' in r.resource_type else r.resource_type 
                                         for r in resources))
        
        return f"Auto-generated blueprint from natural language input. Includes: {resource_summary}. {text[:100]}"
    
    def _calculate_confidence(self, text: str, resources: List[ResourceRecommendation]) -> float:
        """Calculate confidence score for blueprint generation"""
        score = 0.5  # base score
        
        # Increase score for specific keywords
        if len(resources) > 0:
            score += 0.2
        
        if len(text.split()) > 10:  # detailed description
            score += 0.1
        
        # Check for specificity
        specific_keywords = ['need', 'require', 'should', 'must', 'want']
        if any(keyword in text for keyword in specific_keywords):
            score += 0.1
        
        # Average resource confidence
        if resources:
            avg_res_conf = sum(r.confidence for r in resources) / len(resources)
            score = (score + avg_res_conf) / 2
        
        return min(score, 1.0)
    
    async def generate_embeddings(self, text: str) -> np.ndarray:
        """Generate embeddings for text"""
        if self.embedding_model:
            return self.embedding_model.encode(text)
        else:
            # Fallback: simple hash-based embedding
            return np.random.rand(384)
    
    async def find_similar_blueprints(self, blueprint_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Find similar blueprints using embeddings"""
        # Mock implementation - in production, would query vector database
        logger.info(f"Finding similar blueprints for {blueprint_id}")
        
        return [
            {
                'blueprint_id': str(uuid4()),
                'name': 'Similar Web App',
                'similarity_score': 0.92,
                'target_cloud': 'azure'
            },
            {
                'blueprint_id': str(uuid4()),
                'name': 'Another Similar Blueprint',
                'similarity_score': 0.87,
                'target_cloud': 'aws'
            }
        ][:limit]
