import logging
import re
from typing import Dict, Any, List
from uuid import uuid4

from app.models import (
    IntentAnalysisRequest,
    IntentAnalysisResponse,
    Intent
)

logger = logging.getLogger(__name__)


class IntentAnalysisService:
    """Service for intent and sentiment analysis"""
    
    def __init__(self):
        logger.info("Initializing Intent Analysis Service...")
        
        # Intent patterns
        self.intent_patterns = {
            'create_infrastructure': [
                r'create|build|setup|deploy|provision',
                r'infrastructure|resources|environment'
            ],
            'modify_infrastructure': [
                r'change|modify|update|edit|alter',
                r'resource|configuration|setting'
            ],
            'scale_infrastructure': [
                r'scale|increase|decrease|expand|reduce',
                r'capacity|size|instances'
            ],
            'optimize_cost': [
                r'reduce|optimize|save|cheaper|cost',
                r'money|budget|expensive'
            ],
            'improve_security': [
                r'secure|protect|encrypt|harden',
                r'security|vulnerability|compliance'
            ],
            'troubleshoot': [
                r'fix|debug|resolve|troubleshoot',
                r'error|problem|issue|fail'
            ]
        }
        
        # Positive/negative keywords for sentiment
        self.positive_keywords = ['good', 'great', 'excellent', 'perfect', 'love', 'awesome']
        self.negative_keywords = ['bad', 'terrible', 'awful', 'hate', 'poor', 'slow', 'broken']
        
        logger.info("Intent Analysis Service initialized")
    
    async def analyze_intent(
        self, 
        request: IntentAnalysisRequest
    ) -> IntentAnalysisResponse:
        """Analyze user intent and extract requirements"""
        
        text = request.text.lower()
        
        # Detect intents
        intents = self._detect_intents(text)
        
        # Analyze sentiment
        sentiment, sentiment_score = self._analyze_sentiment(text)
        
        # Extract entities
        entities = self._extract_entities(text)
        
        # Extract structured requirements
        requirements = self._extract_requirements(text, entities)
        
        return IntentAnalysisResponse(
            primary_intent=intents[0] if intents else Intent(
                intent_type='unknown',
                confidence=0.0,
                entities={}
            ),
            secondary_intents=intents[1:] if len(intents) > 1 else [],
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            extracted_requirements=requirements
        )
    
    def _detect_intents(self, text: str) -> List[Intent]:
        """Detect user intents from text"""
        intents = []
        
        for intent_type, patterns in self.intent_patterns.items():
            score = 0.0
            matched_entities = {}
            
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    score += 1.0
            
            if score > 0:
                confidence = min(score / len(patterns), 1.0)
                
                # Extract entities for this intent
                if intent_type == 'create_infrastructure':
                    matched_entities = self._extract_resource_entities(text)
                elif intent_type == 'scale_infrastructure':
                    matched_entities = self._extract_scaling_entities(text)
                elif intent_type == 'optimize_cost':
                    matched_entities = self._extract_cost_entities(text)
                
                intents.append(Intent(
                    intent_type=intent_type,
                    confidence=confidence,
                    entities=matched_entities
                ))
        
        # Sort by confidence
        intents.sort(key=lambda i: i.confidence, reverse=True)
        
        return intents
    
    def _analyze_sentiment(self, text: str) -> tuple[str, float]:
        """Analyze sentiment of text"""
        positive_count = sum(1 for word in self.positive_keywords if word in text)
        negative_count = sum(1 for word in self.negative_keywords if word in text)
        
        if positive_count > negative_count:
            sentiment = 'positive'
            score = min(positive_count / 5.0, 1.0)
        elif negative_count > positive_count:
            sentiment = 'negative'
            score = -min(negative_count / 5.0, 1.0)
        else:
            sentiment = 'neutral'
            score = 0.0
        
        return sentiment, score
    
    def _extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract named entities from text"""
        entities = {}
        
        # Cloud providers
        if 'azure' in text or 'microsoft' in text:
            entities['cloud_provider'] = 'azure'
        elif 'aws' in text or 'amazon' in text:
            entities['cloud_provider'] = 'aws'
        elif 'gcp' in text or 'google' in text:
            entities['cloud_provider'] = 'gcp'
        
        # Environment
        if 'production' in text or 'prod' in text:
            entities['environment'] = 'production'
        elif 'staging' in text or 'stage' in text:
            entities['environment'] = 'staging'
        elif 'dev' in text or 'development' in text:
            entities['environment'] = 'development'
        
        # Numbers (for scaling, counts, etc.)
        numbers = re.findall(r'\b\d+\b', text)
        if numbers:
            entities['numbers'] = [int(n) for n in numbers]
        
        return entities
    
    def _extract_resource_entities(self, text: str) -> Dict[str, Any]:
        """Extract resource-specific entities"""
        entities = {}
        
        if 'vm' in text or 'virtual machine' in text:
            entities['resource_type'] = 'compute'
        if 'database' in text or 'sql' in text:
            entities['resource_type'] = 'database'
        if 'storage' in text or 'blob' in text or 's3' in text:
            entities['resource_type'] = 'storage'
        
        return entities
    
    def _extract_scaling_entities(self, text: str) -> Dict[str, Any]:
        """Extract scaling-specific entities"""
        entities = {}
        
        # Scale direction
        if 'increase' in text or 'scale up' in text or 'expand' in text:
            entities['direction'] = 'up'
        elif 'decrease' in text or 'scale down' in text or 'reduce' in text:
            entities['direction'] = 'down'
        
        # Extract numbers for target scale
        numbers = re.findall(r'\b\d+\b', text)
        if numbers:
            entities['target_count'] = int(numbers[0])
        
        return entities
    
    def _extract_cost_entities(self, text: str) -> Dict[str, Any]:
        """Extract cost-specific entities"""
        entities = {}
        
        # Budget amounts
        budget_match = re.search(r'\$?(\d+(?:,\d{3})*(?:\.\d{2})?)', text)
        if budget_match:
            entities['budget'] = float(budget_match.group(1).replace(',', ''))
        
        # Time periods
        if 'month' in text:
            entities['period'] = 'monthly'
        elif 'year' in text:
            entities['period'] = 'yearly'
        
        return entities
    
    def _extract_requirements(
        self, 
        text: str, 
        entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Extract structured requirements from text"""
        requirements = {}
        
        # Copy entities
        requirements.update(entities)
        
        # Extract technical requirements
        if 'high availability' in text or 'ha' in text:
            requirements['high_availability'] = True
        
        if 'scalable' in text or 'auto-scale' in text:
            requirements['auto_scaling'] = True
        
        if 'secure' in text or 'encrypted' in text:
            requirements['encryption'] = True
        
        if 'backup' in text:
            requirements['backup'] = True
        
        if 'load balance' in text:
            requirements['load_balancing'] = True
        
        # Performance requirements
        if 'fast' in text or 'performance' in text:
            requirements['performance_focus'] = True
        
        # Compliance requirements
        if 'compliance' in text or 'gdpr' in text or 'hipaa' in text:
            requirements['compliance'] = True
        
        return requirements
