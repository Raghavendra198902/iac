# IAC Dharma - AI/ML Models

This directory contains machine learning models and AI components for the IAC Dharma platform.

## Model Types

### 1. NLP Models
**Location**: `ml-models/nlp/`

#### Text-to-Blueprint Model
- **Purpose**: Convert natural language requirements to infrastructure blueprints
- **Architecture**: Fine-tuned Transformer (BERT/GPT)
- **Input**: Natural language text (e.g., "3-tier web app with load balancer")
- **Output**: Blueprint graph JSON

#### Intent Classification
- **Purpose**: Classify user intents (design, deploy, optimize, migrate)
- **Architecture**: BERT-based classifier
- **Classes**: design, deploy, optimize, migrate, query, compliance

### 2. Pattern Mining Models
**Location**: `ml-models/pattern-mining/`

#### Frequent Subgraph Mining
- **Purpose**: Extract reusable patterns from blueprint history
- **Algorithm**: gSpan (Graph-based Substructure Pattern mining)
- **Output**: Pattern library with frequency scores

#### Anti-Pattern Detection
- **Purpose**: Identify problematic design patterns
- **Method**: Association rule mining + incident correlation
- **Output**: Flagged patterns with risk scores

### 3. Sizing Prediction Models
**Location**: `ml-models/sizing/`

#### VM/Compute Sizing
- **Purpose**: Recommend optimal VM/instance sizes
- **Algorithm**: Gradient Boosting (XGBoost)
- **Features**: workload metrics, SLOs, historical utilization
- **Output**: Recommended SKU with confidence score

#### Storage Sizing
- **Purpose**: Predict storage requirements
- **Algorithm**: Time series forecasting (Prophet/LSTM)
- **Output**: Capacity recommendations

### 4. Cost Optimization Models
**Location**: `ml-models/cost-optimization/`

#### Cost Prediction
- **Purpose**: Estimate monthly/yearly costs
- **Algorithm**: Regression models
- **Features**: Resource types, regions, sizes, utilization patterns
- **Output**: Cost estimates with variance bands

#### Optimization Recommendations
- **Purpose**: Suggest cost-saving actions
- **Method**: Multi-objective optimization
- **Output**: Ranked optimization actions

### 5. Risk Prediction Models
**Location**: `ml-models/risk-prediction/`

#### Security Risk Scoring
- **Purpose**: Assess security risk of designs
- **Algorithm**: Random Forest classifier
- **Features**: Guardrail violations, exposed ports, encryption status
- **Output**: Risk score (0-100) with breakdown

#### Availability Risk
- **Purpose**: Predict availability issues
- **Features**: Single points of failure, DR gaps, redundancy
- **Output**: Availability score and recommendations

## Model Architecture

### Training Pipeline
```
Data Collection → Feature Engineering → Model Training → Evaluation → Registry → Deployment
```

### Feature Store
- **Tool**: Feast
- **Features**: Pre-computed features for real-time inference
- **Storage**: PostgreSQL + Redis

### Model Registry
- **Tool**: MLflow
- **Versioning**: Semantic versioning for models
- **Metadata**: Training data, hyperparameters, metrics

### Inference Pipeline
```
API Request → Feature Extraction → Model Inference → Post-processing → Response
```

## Model Training

### Requirements
```bash
pip install -r requirements.txt
```

### Training Example
```bash
# Train NLP model
cd ml-models/nlp
python train_text_to_blueprint.py --data-path ../../data/blueprints --epochs 100

# Train sizing model
cd ml-models/sizing
python train_vm_sizing.py --features ../../data/features/vm_metrics.parquet
```

## Model Deployment

Models are deployed as:
1. **REST API endpoints** via FastAPI
2. **gRPC services** for low-latency inference
3. **Batch jobs** for large-scale predictions

### Deployment Configuration
```yaml
model:
  name: text-to-blueprint
  version: 1.2.0
  framework: transformers
  runtime: python3.11
  resources:
    cpu: 2
    memory: 4Gi
    gpu: optional
```

## Monitoring & Retraining

### Metrics Tracked
- **Model Performance**: Accuracy, precision, recall, F1
- **Inference Latency**: P50, P95, P99
- **Data Drift**: Input distribution changes
- **Model Drift**: Output quality degradation

### Retraining Triggers
- Performance drops below threshold
- Data drift detected
- New labeled data available (weekly/monthly)

## Model Evaluation

### Offline Metrics
- Accuracy, MAE, RMSE (depending on task)
- Cross-validation scores
- Confusion matrices

### Online Metrics
- User acceptance rate (accept/reject AI suggestions)
- Deployment success rate (for AI-generated designs)
- Cost accuracy (predicted vs actual)

## Security & Compliance

### Model Security
- Input validation and sanitization
- Rate limiting on inference endpoints
- Model versioning and rollback capability

### Data Privacy
- PII detection and masking
- Anonymization for training data
- Tenant data isolation

### Compliance
- Model explainability (SHAP, LIME)
- Bias detection and mitigation
- Audit logging for all predictions

## Directory Structure

```
ml-models/
├── nlp/
│   ├── text_to_blueprint/
│   ├── intent_classifier/
│   └── requirements.txt
├── pattern-mining/
│   ├── frequent_subgraph/
│   ├── anti_pattern_detector/
│   └── requirements.txt
├── sizing/
│   ├── vm_sizing/
│   ├── storage_sizing/
│   └── requirements.txt
├── cost-optimization/
│   ├── cost_predictor/
│   ├── optimizer/
│   └── requirements.txt
├── risk-prediction/
│   ├── security_risk/
│   ├── availability_risk/
│   └── requirements.txt
└── shared/
    ├── feature_engineering/
    ├── preprocessing/
    └── utils/
```

## References

- [Feature Store Documentation](../docs/ai-ml/feature-store.md)
- [Model Training Guide](../docs/ai-ml/training.md)
- [Model Deployment Guide](../docs/ai-ml/deployment.md)
- [MLflow Registry](https://mlflow.org/)
