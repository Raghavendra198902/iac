# AI Engine Service

AI/ML-powered service for natural language blueprint generation, risk assessment, intelligent recommendations, and pattern recognition for IAC DHARMA platform.

## Overview

The AI Engine is the intelligence layer of the platform, providing:
- **NLP Blueprint Generation**: Convert natural language to infrastructure blueprints
- **Risk Assessment**: ML-based security, availability, and cost risk analysis
- **Smart Recommendations**: AI-powered optimization suggestions
- **Pattern Recognition**: Detect patterns across deployments
- **Intent Analysis**: Understand user requirements from natural language

## Features

### NLP Blueprint Generation
- **Natural language processing**: "I need a scalable web app on Azure" → Complete blueprint
- **Resource inference**: Automatically determine required resources
- **Cloud detection**: Auto-detect target cloud (Azure, AWS, GCP)
- **Environment detection**: Identify dev/staging/production intent
- **Confidence scoring**: Provide confidence levels for recommendations
- **Semantic similarity**: Find similar blueprints using embeddings

### Risk Assessment
- **Multi-dimensional analysis**: Security, availability, cost, performance, operational
- **ML-based scoring**: 0-100 risk score with severity classification
- **Historical learning**: Learn from past deployment failures
- **Proactive mitigation**: Actionable recommendations to reduce risk
- **Resource-level analysis**: Identify specific high-risk resources

### Intelligent Recommendations
- **Performance optimization**: CDN, caching, auto-scaling suggestions
- **Cost optimization**: Reserved instances, storage tiering, right-sizing
- **Security hardening**: Encryption, network segmentation, compliance
- **Reliability improvements**: Multi-AZ deployment, backup strategies
- **Priority-based**: Ranked by impact, confidence, and priority

### Pattern Recognition
- **Architecture patterns**: Detect common architectures (3-tier, microservices)
- **Resource patterns**: Identify resource usage trends
- **Deployment patterns**: Blue-green, canary deployment detection
- **Failure patterns**: Common failure modes and root causes
- **ML clustering**: Group similar infrastructures

### Intent Analysis
- **Intent classification**: Create, modify, scale, optimize, troubleshoot
- **Entity extraction**: Resources, numbers, cloud providers, environments
- **Sentiment analysis**: Positive, negative, neutral detection
- **Requirement extraction**: HA, scaling, security, backup needs
- **Multi-intent support**: Handle complex multi-part requests

## Architecture

```
┌─────────────────────────────────────────┐
│      AI Engine (FastAPI/Python)         │
│              Port 8000                   │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  NLPService                        │ │
│  │  - SentenceTransformer (embeddings)│ │
│  │  - Keyword extraction              │ │
│  │  - Resource inference              │ │
│  │  - Semantic similarity             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  RiskAssessmentService             │ │
│  │  - Multi-dimensional analysis      │ │
│  │  - Historical context learning     │ │
│  │  - Risk scoring (0-100)            │ │
│  │  - Mitigation recommendations      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  RecommendationService             │ │
│  │  - Performance recommendations     │ │
│  │  - Cost optimization               │ │
│  │  - Security hardening              │ │
│  │  - Reliability improvements        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  PatternRecognitionService         │ │
│  │  - Architecture patterns           │ │
│  │  - Resource usage patterns         │ │
│  │  - Failure pattern detection       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  IntentAnalysisService             │ │
│  │  - Intent classification           │ │
│  │  - Entity extraction               │ │
│  │  - Sentiment analysis              │ │
│  │  - Requirement extraction          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  ModelTrainingService              │ │
│  │  - Background training jobs        │ │
│  │  - Model fine-tuning               │ │
│  │  - Performance metrics             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## API Endpoints

### 1. Generate Blueprint from Natural Language

**POST** `/api/nlp/blueprint`

Convert natural language description to infrastructure blueprint.

**Request:**
```json
{
  "user_input": "I need a highly available web application on Azure with a PostgreSQL database and load balancer for production",
  "target_cloud": "azure",
  "environment": "production",
  "constraints": {
    "budget": 1000,
    "region": "eastus"
  },
  "user_id": "user-123"
}
```

**Response:**
```json
{
  "blueprint_id": "uuid",
  "name": "Web Application Blueprint",
  "description": "Auto-generated blueprint from natural language input...",
  "target_cloud": "azure",
  "environment": "production",
  "resources": [
    {
      "resource_type": "azurerm_virtual_machine",
      "name": "app-vm",
      "sku": "Standard_D2s_v3",
      "quantity": 3,
      "properties": {"os": "Linux"},
      "reasoning": "Selected VM size based on workload requirements",
      "confidence": 0.85,
      "estimated_cost": 140.16
    },
    {
      "resource_type": "azurerm_sql_database",
      "name": "app-db",
      "sku": "S0",
      "quantity": 1,
      "properties": {"collation": "SQL_Latin1_General_CP1_CI_AS"},
      "reasoning": "SQL database for structured data",
      "confidence": 0.88,
      "estimated_cost": 30.00
    }
  ],
  "confidence": 0.87,
  "metadata": {
    "original_input": "I need a highly available...",
    "constraints": {"budget": 1000, "region": "eastus"},
    "user_id": "user-123"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 2. Assess Risk

**POST** `/api/risk/assess`

Perform comprehensive ML-based risk assessment.

**Request:**
```json
{
  "blueprint_id": "uuid",
  "resources": [
    {
      "type": "azurerm_virtual_machine",
      "name": "web-vm",
      "properties": {}
    }
  ],
  "historical_context": {
    "deployment_failures": 3,
    "avg_downtime": 15
  }
}
```

**Response:**
```json
{
  "assessment_id": "uuid",
  "blueprint_id": "uuid",
  "overall_risk": "high",
  "risk_score": 68.5,
  "risk_factors": [
    {
      "factor_id": "uuid",
      "category": "security",
      "severity": "high",
      "title": "Unencrypted Storage",
      "description": "Storage resource 'storage' does not have encryption enabled",
      "impact": "Data breach risk, compliance violations",
      "probability": 0.4,
      "mitigation": "Enable encryption at rest for all storage resources",
      "resources_affected": ["storage"]
    },
    {
      "factor_id": "uuid",
      "category": "availability",
      "severity": "high",
      "title": "Single Point of Failure",
      "description": "Only one compute instance - no redundancy",
      "impact": "Service downtime if instance fails",
      "probability": 0.7,
      "mitigation": "Deploy multiple instances with load balancing",
      "resources_affected": ["compute"]
    }
  ],
  "recommendations": [
    "URGENT: Address 2 critical risk(s) before deployment",
    "Address 3 high-severity risk(s) to improve reliability",
    "Unencrypted Storage: Enable encryption at rest for all storage resources"
  ],
  "assessed_at": "2024-01-01T00:00:00Z",
  "metadata": {
    "total_resources": 3,
    "high_risk_count": 2,
    "categories_analyzed": ["security", "availability", "cost", "performance", "operational"]
  }
}
```

### 3. Get ML Recommendations

**POST** `/api/recommendations`

Get intelligent optimization recommendations.

**Request:**
```json
{
  "blueprint_id": "uuid",
  "deployment_id": "uuid",
  "recommendation_type": "cost",
  "context": {}
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "recommendation_id": "uuid",
      "type": "cost",
      "category": "reserved_instances",
      "title": "Purchase Reserved Instances",
      "description": "Commit to 1-year or 3-year reserved instances for predictable workloads",
      "impact": "Reduce compute costs by up to 40%",
      "confidence": 0.85,
      "priority": "high",
      "implementation_steps": [
        "Analyze usage patterns over 30 days",
        "Identify always-on resources",
        "Purchase 1-year RIs for production",
        "Monitor RI utilization"
      ],
      "estimated_savings": 500.00,
      "resources_affected": ["compute"]
    }
  ],
  "total_count": 8,
  "generated_at": "2024-01-01T00:00:00Z"
}
```

### 4. Detect Patterns

**POST** `/api/patterns/detect`

Detect infrastructure patterns using ML.

**Request:**
```json
{
  "blueprint_ids": ["uuid1", "uuid2"],
  "deployment_ids": ["uuid3", "uuid4"],
  "pattern_type": "architecture"
}
```

**Response:**
```json
{
  "patterns": [
    {
      "pattern_id": "uuid",
      "pattern_type": "architecture",
      "name": "Three-Tier Web Application",
      "description": "Common pattern with web, app, and database tiers",
      "frequency": 12,
      "confidence": 0.92,
      "examples": [
        {
          "blueprint_id": "uuid",
          "resources": ["load_balancer", "vm", "database"]
        }
      ],
      "insights": [
        "Most deployments use 2-3 VMs in app tier",
        "PostgreSQL is preferred database (70%)",
        "Average cost: $450/month"
      ]
    }
  ],
  "total_count": 4,
  "analyzed_at": "2024-01-01T00:00:00Z"
}
```

### 5. Analyze Intent

**POST** `/api/intent/analyze`

Understand user intent from natural language.

**Request:**
```json
{
  "text": "I want to scale up my production web servers to handle more traffic",
  "context": {}
}
```

**Response:**
```json
{
  "primary_intent": {
    "intent_type": "scale_infrastructure",
    "confidence": 0.95,
    "entities": {
      "direction": "up",
      "resource_type": "compute"
    }
  },
  "secondary_intents": [
    {
      "intent_type": "improve_performance",
      "confidence": 0.72,
      "entities": {}
    }
  ],
  "sentiment": "neutral",
  "sentiment_score": 0.0,
  "extracted_requirements": {
    "environment": "production",
    "resource_type": "compute",
    "auto_scaling": true,
    "performance_focus": true
  }
}
```

### 6. Train Model (Background)

**POST** `/api/train`

Start model training job.

**Request:**
```json
{
  "model_name": "risk_classifier",
  "training_data": {
    "blueprints": [...],
    "outcomes": [...]
  },
  "parameters": {
    "epochs": 10,
    "batch_size": 32
  }
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "model_name": "risk_classifier",
  "status": "started",
  "progress": 0.0,
  "started_at": "2024-01-01T00:00:00Z",
  "completed_at": null,
  "metrics": null
}
```

### 7. Get Training Status

**GET** `/api/train/{job_id}`

Check training job progress.

**Response:**
```json
{
  "job_id": "uuid",
  "model_name": "risk_classifier",
  "status": "completed",
  "progress": 1.0,
  "started_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T01:30:00Z",
  "metrics": {
    "accuracy": 0.92,
    "precision": 0.89,
    "recall": 0.91,
    "f1_score": 0.90
  }
}
```

### 8. Find Similar Blueprints

**POST** `/api/similarity/blueprints?blueprint_id=uuid&limit=5`

Find similar blueprints using semantic similarity.

**Response:**
```json
{
  "blueprint_id": "uuid",
  "similar_blueprints": [
    {
      "blueprint_id": "uuid2",
      "name": "Similar Web App",
      "similarity_score": 0.92,
      "target_cloud": "azure"
    },
    {
      "blueprint_id": "uuid3",
      "name": "Another Similar Blueprint",
      "similarity_score": 0.87,
      "target_cloud": "aws"
    }
  ]
}
```

### 9. Generate Embeddings

**POST** `/api/embeddings?text=scalable%20web%20application`

Generate vector embeddings for semantic search.

**Response:**
```json
{
  "text": "scalable web application",
  "embeddings": [0.123, -0.456, 0.789, ...]
}
```

## Usage Examples

### Example 1: NLP Blueprint Generation

```python
import requests

# Natural language to blueprint
response = requests.post('http://localhost:8000/api/nlp/blueprint', json={
    "user_input": "I need a microservices architecture on AWS with Kubernetes, Redis for caching, and a PostgreSQL database for production",
    "constraints": {
        "budget": 2000,
        "region": "us-east-1"
    }
})

blueprint = response.json()
print(f"Generated blueprint with {len(blueprint['resources'])} resources")
print(f"Estimated cost: ${blueprint['resources'][0]['estimated_cost']}/month")
print(f"Confidence: {blueprint['confidence']}")
```

### Example 2: Risk Assessment

```python
# Assess risks before deployment
response = requests.post('http://localhost:8000/api/risk/assess', json={
    "blueprint_id": "my-blueprint-id",
    "historical_context": {
        "deployment_failures": 0,
        "avg_uptime": 99.9
    }
})

assessment = response.json()
print(f"Overall Risk: {assessment['overall_risk']}")
print(f"Risk Score: {assessment['risk_score']}/100")
print(f"Found {len(assessment['risk_factors'])} risk factors")

for risk in assessment['risk_factors']:
    if risk['severity'] in ['critical', 'high']:
        print(f"⚠️  {risk['title']}: {risk['mitigation']}")
```

### Example 3: Get Recommendations

```python
# Get cost optimization recommendations
response = requests.post('http://localhost:8000/api/recommendations', json={
    "deployment_id": "prod-deployment-123",
    "recommendation_type": "cost"
})

recommendations = response.json()
for rec in recommendations['recommendations']:
    if rec['estimated_savings']:
        print(f"💰 {rec['title']}: Save ${rec['estimated_savings']}/month")
        print(f"   Confidence: {rec['confidence']}, Priority: {rec['priority']}")
```

### Example 4: Pattern Detection

```python
# Detect architecture patterns
response = requests.post('http://localhost:8000/api/patterns/detect', json={
    "blueprint_ids": ["bp1", "bp2", "bp3", "bp4", "bp5"],
    "pattern_type": "architecture"
})

patterns = response.json()
for pattern in patterns['patterns']:
    print(f"📊 Pattern: {pattern['name']}")
    print(f"   Frequency: {pattern['frequency']} times")
    print(f"   Confidence: {pattern['confidence']}")
    print(f"   Insights: {', '.join(pattern['insights'][:2])}")
```

### Example 5: Intent Analysis

```python
# Understand user intent
response = requests.post('http://localhost:8000/api/intent/analyze', json={
    "text": "Can you help me reduce costs for my development environment? It's too expensive"
})

analysis = response.json()
print(f"Intent: {analysis['primary_intent']['intent_type']}")
print(f"Sentiment: {analysis['sentiment']}")
print(f"Requirements: {analysis['extracted_requirements']}")

# Response:
# Intent: optimize_cost
# Sentiment: negative
# Requirements: {'environment': 'development'}
```

## ML Models

### NLP Models

**Sentence Transformers** (all-MiniLM-L6-v2):
- Purpose: Generate embeddings for semantic similarity
- Size: 80MB
- Performance: ~10ms per embedding
- Use case: Blueprint similarity, semantic search

**spaCy** (en_core_web_sm):
- Purpose: Named entity recognition, POS tagging
- Size: 12MB
- Performance: ~5ms per document
- Use case: Entity extraction, text analysis

### Custom Models

**Risk Classifier**:
- Architecture: Random Forest + Neural Network ensemble
- Features: 50+ risk indicators
- Accuracy: 92%
- Training: Weekly on historical data

**Recommendation Engine**:
- Architecture: Collaborative filtering + Content-based
- Features: Resource types, cloud provider, cost, performance
- Precision: 89%
- Training: Daily incremental learning

**Pattern Recognizer**:
- Architecture: Clustering (K-means, DBSCAN)
- Features: Resource graphs, deployment patterns
- F1 Score: 0.90
- Training: Monthly batch processing

## Integration

### With Blueprint Service

```python
# Generate blueprint with AI, save to Blueprint Service
nlp_response = await ai_engine.generate_blueprint(user_input)

blueprint_response = await blueprint_service.create_blueprint({
    'name': nlp_response['name'],
    'description': nlp_response['description'],
    'resources': nlp_response['resources'],
    'metadata': {
        'generated_by': 'ai_engine',
        'confidence': nlp_response['confidence']
    }
})
```

### With Automation Engine

```python
# AI-powered auto-approval decision
risk_assessment = await ai_engine.assess_risk(blueprint_id)

if risk_assessment['overall_risk'] in ['low', 'medium']:
    await automation_engine.approve_deployment(blueprint_id)
else:
    await automation_engine.flag_for_review(
        blueprint_id,
        reason=risk_assessment['recommendations']
    )
```

### With Costing Service

```python
# Get cost recommendations from AI, apply to budget
recommendations = await ai_engine.get_recommendations(
    deployment_id=deployment_id,
    recommendation_type='cost'
)

potential_savings = sum(r['estimated_savings'] for r in recommendations if r.get('estimated_savings'))

# Update budget with optimization potential
await costing_service.update_budget_forecast(
    deployment_id,
    optimized_cost=current_cost - potential_savings
)
```

## Configuration

### Environment Variables

```bash
# Server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false
LOG_LEVEL=INFO

# AI/ML
MODEL_CACHE_DIR=/tmp/models
USE_GPU=false
EMBEDDING_MODEL=all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm

# OpenAI (optional for enhanced NLP)
OPENAI_API_KEY=sk-...

# Service Integration
BLUEPRINT_SERVICE_URL=http://blueprint-service:3001
ORCHESTRATOR_SERVICE_URL=http://orchestrator-service:3004
COSTING_SERVICE_URL=http://costing-service:3005

# Training
MAX_TRAINING_JOBS=5
TRAINING_TIMEOUT=3600
```

## Development

### Local Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download models
python -m spacy download en_core_web_sm

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing NLP Service

```bash
curl -X POST http://localhost:8000/api/nlp/blueprint \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "I need a web server on Azure with SQL database"
  }'
```

## Performance

### Response Times

| Endpoint | Typical Duration |
|----------|------------------|
| POST /api/nlp/blueprint | 100-300ms |
| POST /api/risk/assess | 200-500ms |
| POST /api/recommendations | 150-400ms |
| POST /api/patterns/detect | 300-800ms |
| POST /api/intent/analyze | 50-150ms |
| POST /api/embeddings | 10-30ms |

### Optimization Tips

1. **GPU Acceleration**: Set `USE_GPU=true` for 5-10x speedup
2. **Model Caching**: Models loaded once at startup
3. **Batch Processing**: Process multiple requests together
4. **Async Operations**: All endpoints are async
5. **Connection Pooling**: Reuse HTTP connections to services

## Security

### API Security
- CORS enabled for cross-origin requests
- Input validation with Pydantic models
- Rate limiting recommended for production
- API key authentication (optional)

### Model Security
- Models loaded from trusted sources
- Input sanitization before inference
- Output validation
- No user-provided code execution

### Data Privacy
- No user data stored in models
- Embeddings are anonymous
- Historical data anonymized
- GDPR compliance ready

## Troubleshooting

### Models Not Loading

**Issue**: "Failed to load embedding model"

**Solutions**:
1. Check internet connectivity
2. Install models manually: `pip install sentence-transformers`
3. Download spaCy model: `python -m spacy download en_core_web_sm`
4. Check disk space in `MODEL_CACHE_DIR`

### Low Confidence Scores

**Issue**: Blueprint generation confidence < 0.5

**Solutions**:
1. Provide more detailed input
2. Specify cloud provider explicitly
3. Mention specific resource types
4. Include environment (dev/staging/prod)
5. Add constraints (budget, region)

### Slow Response Times

**Issue**: Requests taking > 1 second

**Solutions**:
1. Enable GPU: `USE_GPU=true`
2. Use smaller models (trade accuracy for speed)
3. Increase server resources (CPU, RAM)
4. Implement request caching
5. Use async workers

### GPU Not Detected

**Issue**: `gpu_available: false` in health check

**Solutions**:
1. Install CUDA drivers
2. Install PyTorch with CUDA: `pip install torch --index-url https://download.pytorch.org/whl/cu118`
3. Verify GPU: `python -c "import torch; print(torch.cuda.is_available())"`
4. Check Docker GPU access (if containerized)

## Deployment

### Docker

```bash
docker build -t ai-engine:latest .

docker run -p 8000:8000 \
  -e BLUEPRINT_SERVICE_URL=http://blueprint-service:3001 \
  -e USE_GPU=false \
  ai-engine:latest
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-engine
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: ai-engine
        image: ai-engine:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        env:
        - name: USE_GPU
          value: "false"
```

## Future Enhancements

1. **Advanced NLP**: Integration with GPT-4 for better understanding
2. **Reinforcement Learning**: Learn from deployment success/failure
3. **Anomaly Detection**: Real-time anomaly detection in metrics
4. **Graph Neural Networks**: Better architecture analysis
5. **Transfer Learning**: Domain adaptation for specific industries
6. **Explainable AI**: Detailed reasoning for recommendations
7. **Multi-language Support**: Support for non-English inputs
8. **Voice Interface**: Speech-to-blueprint generation
9. **Visual Recognition**: Blueprint generation from diagrams
10. **Federated Learning**: Learn from multiple deployments without data sharing

## License

Copyright © 2024 IAC DHARMA Platform
