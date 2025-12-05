"""
NLP Command Interpreter
Analyzes natural language commands and extracts intents and entities
"""

import re
from typing import List, Dict, Tuple, Optional
import logging
from datetime import datetime

from models.schemas import (
    Intent, Entity, IntentType, EntityType, NLPAnalysis, CommandRequest
)

logger = logging.getLogger(__name__)


class NLPInterpreter:
    """Natural Language Processing for infrastructure commands"""
    
    def __init__(self):
        self.intent_patterns = self._build_intent_patterns()
        self.entity_patterns = self._build_entity_patterns()
        self.provider_keywords = {
            'aws', 'amazon', 'ec2', 'rds', 's3', 'lambda',
            'azure', 'microsoft', 'gcp', 'google', 'cloud',
            'kubernetes', 'k8s', 'docker', 'openstack',
            'vmware', 'vcenter', 'onpremise', 'on-premise'
        }
        self.resource_keywords = {
            'vm', 'virtual machine', 'instance', 'server', 'compute',
            'database', 'db', 'storage', 'volume', 'disk',
            'network', 'vpc', 'subnet', 'load balancer', 'lb', 'alb', 'nlb',
            'container', 'pod', 'service', 'deployment', 'cluster'
        }
        
    def _build_intent_patterns(self) -> Dict[IntentType, List[str]]:
        """Build regex patterns for intent detection"""
        return {
            # Infrastructure Management
            IntentType.CREATE_INFRASTRUCTURE: [
                r'\b(create|provision|setup|deploy)\s+(new\s+)?(infrastructure|infra|environment)',
                r'\b(spin up|bring up)\s+(an?\s+)?(infrastructure|environment)',
            ],
            IntentType.UPDATE_INFRASTRUCTURE: [
                r'\b(update|modify|change|edit)\s+(the\s+)?(infrastructure|infra)',
                r'\b(scale|resize|adjust)\s+(the\s+)?(infrastructure|infra)',
            ],
            IntentType.DELETE_INFRASTRUCTURE: [
                r'\b(delete|remove|destroy|terminate|tear down)\s+(the\s+)?(infrastructure|infra)',
            ],
            IntentType.LIST_INFRASTRUCTURE: [
                r'\b(list|show|display|get)\s+(all\s+)?(infrastructures?|infras?)',
                r'\bwhat\s+(infrastructures?|infras?)',
            ],
            IntentType.DESCRIBE_INFRASTRUCTURE: [
                r'\b(describe|explain|details?|info|information)\s+(about\s+)?(infrastructure|infra)',
                r'\b(what is|tell me about)\s+(the\s+)?(infrastructure|infra)',
            ],
            
            # Deployment Operations
            IntentType.DEPLOY: [
                r'\b(deploy|release|push|rollout)\s+',
                r'\b(start|launch|run)\s+(a\s+)?(deployment|release)',
            ],
            IntentType.SCALE: [
                r'\b(scale|resize)\s+(up|down|to|\d+)',
                r'\b(increase|decrease|adjust)\s+(replicas?|instances?|pods?)',
            ],
            IntentType.ROLLBACK: [
                r'\b(rollback|revert|undo)\s+(deployment|release)',
                r'\b(restore|go back to)\s+(previous|last)\s+(version|deployment)',
            ],
            IntentType.DELETE_DEPLOYMENT: [
                r'\b(delete|remove|stop|terminate)\s+(the\s+)?(deployment|release)',
            ],
            IntentType.LIST_DEPLOYMENTS: [
                r'\b(list|show|get)\s+(all\s+)?(deployments?|releases?)',
                r'\bwhat\s+(deployments?|releases?)',
            ],
            
            # Discovery Operations
            IntentType.DISCOVER_RESOURCES: [
                r'\b(discover|scan|find|detect)\s+(resources?|infrastructure|assets?)',
                r'\b(run|start|execute)\s+(a\s+)?(discovery|scan)',
            ],
            IntentType.LIST_RESOURCES: [
                r'\b(list|show|get|display)\s+(all\s+)?(resources?|assets?)',
                r'\bwhat\s+(resources?|assets?)\s+(do (i|we) have|are (available|running))',
            ],
            IntentType.DESCRIBE_RESOURCE: [
                r'\b(describe|explain|details?|info)\s+(about\s+)?(resource|asset)',
                r'\b(what is|tell me about)\s+(the\s+)?(resource|asset)',
            ],
            IntentType.QUERY_GRAPH: [
                r'\b(query|search|find in)\s+(the\s+)?(graph|topology|map)',
                r'\b(show|get)\s+(the\s+)?(infrastructure\s+)?(graph|topology|relationships?)',
            ],
            
            # AI/ML Operations
            IntentType.PREDICT_FAILURE: [
                r'\b(predict|forecast|anticipate)\s+(failure|outage|downtime)',
                r'\b(will|might|could)\s+.+\s+(fail|crash|go down)',
            ],
            IntentType.FORECAST_CAPACITY: [
                r'\b(forecast|predict|estimate)\s+(capacity|usage|utilization)',
                r'\b(how much|what)\s+(capacity|resources?)\s+(will\s+(i|we)\s+need)',
            ],
            IntentType.DETECT_THREAT: [
                r'\b(detect|find|identify)\s+(threats?|security\s+issues?|vulnerabilities)',
                r'\b(are there|check for)\s+(any\s+)?(threats?|security\s+(issues?|risks?))',
            ],
            IntentType.DETECT_ANOMALY: [
                r'\b(detect|find|identify)\s+(anomalies|anomaly|abnormal)',
                r'\b(anything|something)\s+(unusual|abnormal|wrong)',
            ],
            
            # Query Operations
            IntentType.GET_STATISTICS: [
                r'\b(get|show|display)\s+(statistics|stats|metrics|numbers)',
                r'\bhow many\s+',
            ],
            IntentType.GET_METRICS: [
                r'\b(get|show|display)\s+(metrics|measurements?|performance)',
                r'\b(what (is|are)|show me)\s+.+\s+(cpu|memory|disk|network|performance)',
            ],
            IntentType.GET_HEALTH: [
                r'\b(health|status|check|ping)',
                r'\b(is|are)\s+.+\s+(healthy|running|up|operational|working)',
            ],
            
            # Conversation
            IntentType.GREETING: [
                r'^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))',
            ],
            IntentType.HELP: [
                r'\b(help|assist|support|guide|how to|what can)',
            ],
        }
    
    def _build_entity_patterns(self) -> Dict[EntityType, List[str]]:
        """Build regex patterns for entity extraction"""
        return {
            EntityType.PROVIDER: [
                r'\b(aws|amazon|ec2|rds|s3|lambda)\b',
                r'\b(azure|microsoft)\b',
                r'\b(gcp|google\s+cloud)\b',
                r'\b(kubernetes|k8s|docker|openstack)\b',
                r'\b(vmware|vcenter)\b',
                r'\b(on-?premise)\b',
            ],
            EntityType.REGION: [
                r'\b(us-east-\d+|us-west-\d+|eu-west-\d+|eu-central-\d+|ap-south-\d+|ap-southeast-\d+)\b',
                r'\b(eastus|westus|centralus)\b',
                r'\bin\s+(region\s+)?([a-z]+-[a-z]+-\d+)\b',
            ],
            EntityType.RESOURCE_TYPE: [
                r'\b(vm|virtual\s+machine|instance|server|compute)\b',
                r'\b(database|db|rds)\b',
                r'\b(storage|volume|disk|ebs)\b',
                r'\b(network|vpc|subnet)\b',
                r'\b(load\s+balancer|lb|alb|nlb)\b',
                r'\b(container|pod|deployment|cluster|ecs|eks)\b',
            ],
            EntityType.RESOURCE_ID: [
                r'\b(i-[a-f0-9]{8,})\b',  # EC2 instance ID
                r'\b(vol-[a-f0-9]{8,})\b',  # EBS volume ID
                r'\b(vpc-[a-f0-9]{8,})\b',  # VPC ID
                r'\b(sg-[a-f0-9]{8,})\b',  # Security group ID
                r'\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b',  # UUID
            ],
            EntityType.STATUS: [
                r'\b(running|stopped|terminated|pending|active|inactive)\b',
            ],
            EntityType.COUNT: [
                r'\b(\d+)\s+(instances?|servers?|replicas?|pods?)\b',
                r'\b(scale\s+to\s+)?(\d+)\b',
            ],
        }
    
    async def analyze(self, request: CommandRequest) -> NLPAnalysis:
        """Analyze natural language command and extract intents/entities"""
        start_time = datetime.utcnow()
        command = request.command.lower()
        
        # Detect intents
        detected_intents = self._detect_intents(command)
        
        # If no intent detected, mark as unknown
        if not detected_intents:
            detected_intents = [Intent(
                type=IntentType.UNKNOWN,
                confidence=1.0,
                entities=[]
            )]
        
        # Extract entities
        entities = self._extract_entities(command)
        
        # Assign entities to primary intent
        primary_intent = detected_intents[0]
        primary_intent.entities = entities
        
        # Calculate overall confidence
        confidence = self._calculate_confidence(primary_intent, entities)
        
        # Generate suggestions if confidence is low
        suggestions = None
        if confidence < 0.6:
            suggestions = self._generate_suggestions(command, primary_intent)
        
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return NLPAnalysis(
            original_command=request.command,
            detected_intents=detected_intents,
            primary_intent=primary_intent,
            entities=entities,
            confidence=confidence,
            processing_time_ms=processing_time,
            suggestions=suggestions
        )
    
    def _detect_intents(self, command: str) -> List[Intent]:
        """Detect intents from command using pattern matching"""
        intents = []
        
        for intent_type, patterns in self.intent_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, command, re.IGNORECASE)
                if match:
                    # Calculate confidence based on match quality
                    confidence = self._calculate_intent_confidence(match, command)
                    intents.append(Intent(
                        type=intent_type,
                        confidence=confidence,
                        entities=[]
                    ))
                    break  # Only match once per intent type
        
        # Sort by confidence
        intents.sort(key=lambda x: x.confidence, reverse=True)
        return intents
    
    def _extract_entities(self, command: str) -> List[Entity]:
        """Extract entities from command using pattern matching"""
        entities = []
        
        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, command, re.IGNORECASE)
                for match in matches:
                    value = match.group(0).strip()
                    # Normalize provider names
                    if entity_type == EntityType.PROVIDER:
                        value = self._normalize_provider(value)
                    
                    entities.append(Entity(
                        type=entity_type,
                        value=value,
                        confidence=0.9,  # Pattern-based extraction has high confidence
                        start_pos=match.start(),
                        end_pos=match.end()
                    ))
        
        # Remove duplicates
        entities = self._deduplicate_entities(entities)
        return entities
    
    def _normalize_provider(self, provider: str) -> str:
        """Normalize provider names to standard format"""
        provider = provider.lower()
        if provider in ['aws', 'amazon', 'ec2', 'rds', 's3', 'lambda']:
            return 'aws'
        elif provider in ['azure', 'microsoft']:
            return 'azure'
        elif provider in ['gcp', 'google cloud', 'google']:
            return 'gcp'
        elif provider in ['kubernetes', 'k8s']:
            return 'kubernetes'
        elif provider in ['vmware', 'vcenter']:
            return 'vmware'
        elif 'premise' in provider:
            return 'onpremise'
        return provider
    
    def _deduplicate_entities(self, entities: List[Entity]) -> List[Entity]:
        """Remove duplicate entities based on type and value"""
        seen = set()
        unique = []
        for entity in entities:
            key = (entity.type, entity.value)
            if key not in seen:
                seen.add(key)
                unique.append(entity)
        return unique
    
    def _calculate_intent_confidence(self, match: re.Match, command: str) -> float:
        """Calculate confidence score for intent match"""
        # Base confidence
        confidence = 0.7
        
        # Increase if match is at start of command
        if match.start() < 10:
            confidence += 0.1
        
        # Increase if match covers significant portion of command
        match_coverage = len(match.group(0)) / len(command)
        confidence += min(match_coverage * 0.2, 0.2)
        
        return min(confidence, 1.0)
    
    def _calculate_confidence(self, intent: Intent, entities: List[Entity]) -> float:
        """Calculate overall confidence score"""
        # Start with intent confidence
        confidence = intent.confidence
        
        # Adjust based on number of entities
        if entities:
            entity_bonus = min(len(entities) * 0.05, 0.2)
            confidence = min(confidence + entity_bonus, 1.0)
        
        return confidence
    
    def _generate_suggestions(self, command: str, intent: Intent) -> List[str]:
        """Generate suggestions for low-confidence commands"""
        suggestions = []
        
        if intent.type == IntentType.UNKNOWN:
            suggestions = [
                "Try: 'list all infrastructures'",
                "Try: 'discover AWS resources in us-east-1'",
                "Try: 'predict failure for infrastructure X'",
                "Try: 'show me all running instances'",
                "Type 'help' for more commands"
            ]
        elif intent.type == IntentType.LIST_INFRASTRUCTURE:
            suggestions = [
                "You can filter by: provider, region, status",
                "Example: 'list AWS infrastructures in us-east-1'",
            ]
        elif intent.type == IntentType.DISCOVER_RESOURCES:
            suggestions = [
                "Specify provider: AWS, Azure, GCP, or on-premise",
                "Example: 'discover AWS resources in us-west-2'",
            ]
        
        return suggestions[:3]  # Return top 3 suggestions
    
    def get_help_text(self) -> Dict[str, List[str]]:
        """Get help text with example commands"""
        return {
            "Infrastructure Management": [
                "create infrastructure in AWS us-east-1",
                "list all infrastructures",
                "describe infrastructure prod-app",
                "update infrastructure dev-env",
                "delete infrastructure test-env"
            ],
            "Deployment Operations": [
                "deploy application to prod",
                "scale deployment to 5 replicas",
                "rollback deployment prod-app",
                "list all deployments",
                "delete deployment test-app"
            ],
            "Discovery & CMDB": [
                "discover AWS resources in us-east-1",
                "list all running instances",
                "describe resource i-1234567890abcdef0",
                "show infrastructure graph for vpc-abc123",
                "get statistics"
            ],
            "AI/ML Operations": [
                "predict failure for infrastructure prod-app",
                "forecast capacity for next 7 days",
                "detect threats in production",
                "detect anomalies in metrics"
            ],
            "Monitoring": [
                "get health status",
                "show metrics for infrastructure prod-app",
                "how many instances are running?",
                "get statistics"
            ]
        }
