# Machine Learning Implementation Guide

## Overview

This document describes the complete Machine Learning implementation for the IAC DHARMA platform. All ML models are now fully implemented and integrated with the frontend.

**Implementation Date**: January 2025  
**Status**: ✅ Complete

---

## ML Models Implemented

### 1. Cost Forecasting Model

**Location**: `ml-models/cost-forecasting/model.py`

**Technology**: Facebook Prophet (Time Series Forecasting)

**Features**:
- 30-day cost predictions with 95% confidence intervals
- Automatic seasonality detection (yearly, weekly, monthly)
- Anomaly detection in historical cost data (3-sigma rule)
- Cost breakdown by components (trend, seasonal, baseline)
- Training metrics (MAE, RMSE, MAPE)
- Model persistence (save/load)

**Key Methods**:
```python
model = CostForecastingModel()
model.train(historical_data)              # Train on historical costs
forecast = model.forecast(days=30)         # Generate 30-day forecast
anomalies = model.detect_anomalies(data)   # Detect cost spikes
breakdown = model.get_cost_breakdown()     # Decompose forecast
model.save('cost_model.pkl')               # Save trained model
```

**Use Cases**:
- Budget planning and allocation
- Cost spike detection
- Trend analysis (is spending increasing?)
- Capacity planning

---

### 2. Anomaly Detection Model

**Location**: `ml-models/anomaly-detection/model.py`

**Technology**: scikit-learn Isolation Forest + Statistical Methods

**Features**:
- Multi-method anomaly detection:
  - Isolation Forest (unsupervised ML)
  - Z-Score (3-sigma statistical threshold)
  - IQR (Interquartile Range outlier detection)
- Severity classification (critical, high, medium, low)
- Feature importance calculation
- Baseline statistics tracking
- StandardScaler normalization
- Model persistence

**Key Methods**:
```python
model = AnomalyDetectionModel()
model.train(baseline_data)                    # Establish normal behavior
results = model.detect_anomalies(metrics)     # Detect anomalies
importance = model.get_feature_importance()   # Feature ranking
model.save('anomaly_model.pkl')               # Save trained model
```

**Metrics Monitored**:
- CPU utilization (%)
- Memory utilization (%)
- Disk usage (%)
- Network throughput (Mbps)
- Response time (ms)

**Use Cases**:
- Infrastructure health monitoring
- Early warning system for failures
- Performance degradation detection
- Security incident detection

---

### 3. Recommendation Engine

**Location**: `ml-models/recommendation-engine/model.py`

**Technology**: Rule-Based AI with Priority Scoring

**Features**:
- Cost optimization recommendations (5 rules)
- Security recommendations (5 rules)
- Performance recommendations (5 rules)
- Priority scoring (critical, high, medium, low)
- Potential savings calculation
- Compliance framework mapping

**Recommendation Categories**:

#### Cost Optimization
- VM Rightsizing (detect underutilized resources)
- Reserved Instances (for consistent workloads)
- Spot Instances (for fault-tolerant workloads)
- Storage Tiering (move cold data to cheaper storage)
- Idle Resource Cleanup (terminate unused resources)

#### Security
- Encryption at Rest (enable for sensitive data)
- Public Access Restrictions (remove public access)
- Multi-Factor Authentication (enable MFA)
- Security Group Tightening (restrict IP ranges)
- Patch Management (apply security updates)

#### Performance
- Auto-Scaling (handle variable load)
- Caching (Redis/Memcached optimization)
- CDN (Content Delivery Network for static content)
- Database Query Optimization (fix slow queries)
- Connection Pooling (reduce connection overhead)

**Key Methods**:
```python
engine = RecommendationEngine()
cost_recs = engine.generate_cost_recommendations(resource_metrics)
security_recs = engine.generate_security_recommendations(security_audits)
performance_recs = engine.generate_performance_recommendations(perf_metrics)
all_recs = engine.get_all_recommendations(resource_data)
```

---

## ML API Service

**Location**: `ml-models/api/ml_service.py`

**Technology**: Flask REST API with CORS support

**Port**: 5000 (configurable via `ML_API_PORT` env var)

### API Endpoints

#### Health & Status
```bash
GET /health
GET /api/models/status
```

#### Cost Forecasting
```bash
POST /api/forecast
{
  "historical_data": [
    {"date": "2024-01-01", "cost": 1000, "component": "compute"},
    ...
  ],
  "forecast_days": 30
}
```

#### Anomaly Detection
```bash
POST /api/detect-anomalies
{
  "metrics": [
    {"cpu": 45.2, "memory": 62.5, "disk": 78.3, "network": 125.4, "response_time": 234.5},
    ...
  ],
  "method": "isolation_forest"  // or "z_score", "iqr"
}
```

#### AI Recommendations
```bash
POST /api/recommendations
{
  "resource_metrics": [...],
  "security_audits": [...],
  "performance_metrics": [...]
}

POST /api/recommendations/cost          # Cost optimization only
POST /api/recommendations/security      # Security only
POST /api/recommendations/performance   # Performance only
```

#### Model Training
```bash
POST /api/models/train/cost
{
  "historical_data": [...]
}

POST /api/models/train/anomaly
{
  "baseline_data": [...]
}
```

---

## Model Training

### Automated Training Script

**Location**: `scripts/train_models.py`

**Usage**:
```bash
# Train all models with synthetic data
python scripts/train_models.py --model all

# Train cost forecasting model only
python scripts/train_models.py --model cost

# Train anomaly detection model only
python scripts/train_models.py --model anomaly

# Train with custom data
python scripts/train_models.py --model cost --cost-data path/to/data.csv
python scripts/train_models.py --model anomaly --anomaly-data path/to/data.csv

# Specify output directory
python scripts/train_models.py --model all --output-dir /path/to/models
```

**Features**:
- Generates synthetic training data (1 year for cost, 1000 samples for anomaly)
- Trains models with realistic patterns (trend, seasonality, noise)
- Validates model performance with test data
- Saves trained models to disk
- Provides training metrics and summaries

---

## Frontend Integration

### API Service Configuration

**File**: `frontend/src/config/api.config.ts`

```typescript
export const API_CONFIG = {
  // ... existing services
  mlApi: import.meta.env.VITE_ML_API_URL || 'http://localhost:5000',
};
```

### ML API Client

**File**: `frontend/src/services/api.service.ts`

```typescript
import { mlApi } from './services/api.service';

// Cost forecasting
const forecast = await mlApi.forecastCost(historicalData, 30);

// Anomaly detection
const anomalies = await mlApi.detectAnomalies(metrics, 'isolation_forest');

// Get all recommendations
const recommendations = await mlApi.getAllRecommendations({
  resource_metrics: [...],
  security_audits: [...],
  performance_metrics: [...]
});

// Get specific recommendation types
const costRecs = await mlApi.getCostRecommendations(resourceMetrics);
const securityRecs = await mlApi.getSecurityRecommendations(securityAudits);
const perfRecs = await mlApi.getPerformanceRecommendations(perfMetrics);

// Model training
await mlApi.trainCostModel(historicalData);
await mlApi.trainAnomalyModel(baselineData);

// Check model status
const status = await mlApi.getModelStatus();

// Health check
const health = await mlApi.healthCheck();
```

### Environment Variables

Add to `.env` files:

```bash
# .env.development
VITE_ML_API_URL=http://localhost:5000

# .env.production
VITE_ML_API_URL=https://ml-api.your-domain.com
```

---

## Dependencies

**File**: `ml-models/requirements.txt`

```
prophet==1.1.5           # Time series forecasting
scikit-learn==1.4.0      # Machine learning (Isolation Forest)
pandas==2.2.0            # Data manipulation
numpy==1.26.3            # Numerical computing
scipy==1.12.0            # Statistical functions
flask==3.0.1             # REST API framework
flask-cors==4.0.0        # CORS support for frontend
```

**Installation**:
```bash
cd ml-models
pip install -r requirements.txt
```

---

## Deployment

### Local Development

1. **Install dependencies**:
```bash
cd ml-models
pip install -r requirements.txt
```

2. **Train models**:
```bash
cd ..
python scripts/train_models.py --model all
```

3. **Start ML API service**:
```bash
python ml-models/api/ml_service.py
```

4. **Verify service**:
```bash
curl http://localhost:5000/health
```

### Production Deployment

#### Option 1: Docker Container

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY ml-models/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml-models/ ./ml-models/
COPY scripts/train_models.py ./scripts/

# Train models on startup (optional)
RUN python scripts/train_models.py --model all

EXPOSE 5000

CMD ["python", "ml-models/api/ml_service.py"]
```

Build and run:
```bash
docker build -t iac-dharma-ml .
docker run -p 5000:5000 iac-dharma-ml
```

#### Option 2: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ml-api
  template:
    metadata:
      labels:
        app: ml-api
    spec:
      containers:
      - name: ml-api
        image: iac-dharma-ml:latest
        ports:
        - containerPort: 5000
        env:
        - name: ML_API_PORT
          value: "5000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: ml-api-service
spec:
  selector:
    app: ml-api
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s/ml-api-deployment.yaml
```

#### Option 3: Systemd Service (Linux)

Create `/etc/systemd/system/ml-api.service`:
```ini
[Unit]
Description=IAC DHARMA ML API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/iac-dharma
ExecStart=/usr/bin/python3 /opt/iac-dharma/ml-models/api/ml_service.py
Restart=always
Environment="ML_API_PORT=5000"

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ml-api
sudo systemctl start ml-api
sudo systemctl status ml-api
```

---

## Model Retraining Strategy

### When to Retrain

1. **Cost Forecasting Model**:
   - Every 7 days (weekly retraining with latest data)
   - When cost patterns change significantly (>20% deviation)
   - After infrastructure changes (new services added/removed)

2. **Anomaly Detection Model**:
   - Every 30 days (monthly baseline update)
   - After major system upgrades
   - When false positive rate exceeds 10%

### Automated Retraining

**Cron Job Example** (Linux):
```bash
# Retrain cost model weekly (Sunday 2 AM)
0 2 * * 0 /usr/bin/python3 /opt/iac-dharma/scripts/train_models.py --model cost --cost-data /data/latest_costs.csv

# Retrain anomaly model monthly (1st of month, 3 AM)
0 3 1 * * /usr/bin/python3 /opt/iac-dharma/scripts/train_models.py --model anomaly --anomaly-data /data/baseline_metrics.csv
```

### Model Versioning

Store models with timestamps:
```python
import datetime

timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
model_path = f'ml-models/cost-forecasting/cost_model_{timestamp}.pkl'
model.save(model_path)
```

Keep last 5 versions for rollback capability.

---

## Monitoring & Performance

### Model Performance Metrics

Track these metrics in production:

1. **Cost Forecasting**:
   - MAE (Mean Absolute Error) - Target: <$100
   - MAPE (Mean Absolute Percentage Error) - Target: <15%
   - Prediction latency - Target: <2 seconds

2. **Anomaly Detection**:
   - False positive rate - Target: <5%
   - False negative rate - Target: <1%
   - Detection latency - Target: <1 second

3. **Recommendation Engine**:
   - Recommendation acceptance rate - Target: >30%
   - Cost savings realized - Track actual vs predicted
   - API response time - Target: <500ms

### Logging

All models include comprehensive logging:
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Training cost model...")
logger.warning("Low data quality detected")
logger.error("Model training failed")
```

### Health Checks

Monitor these endpoints:
```bash
# Service health
curl http://localhost:5000/health

# Model status
curl http://localhost:5000/api/models/status
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "models": {
    "cost_forecasting": true,
    "anomaly_detection": true,
    "recommendation_engine": true
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Models Not Loading
**Problem**: API returns "model not trained" errors

**Solution**:
```bash
# Train models first
python scripts/train_models.py --model all

# Verify model files exist
ls -lh ml-models/cost-forecasting/cost_model.pkl
ls -lh ml-models/anomaly-detection/anomaly_model.pkl
```

#### 2. Prophet Installation Fails
**Problem**: `pip install prophet` fails

**Solution**:
```bash
# Install dependencies first (Ubuntu/Debian)
sudo apt-get install python3-dev gcc g++

# Or use conda
conda install -c conda-forge prophet
```

#### 3. Memory Issues During Training
**Problem**: Out of memory errors

**Solution**:
```python
# Reduce data size
df = df.tail(180)  # Use only last 6 months

# Or increase available memory
# Use cloud instance with more RAM
```

#### 4. CORS Errors in Frontend
**Problem**: Browser blocks ML API requests

**Solution**:
```python
# Verify CORS is enabled in ml_service.py
from flask_cors import CORS
CORS(app)

# Or configure specific origins
CORS(app, origins=['http://localhost:5173', 'https://your-domain.com'])
```

#### 5. Slow API Responses
**Problem**: API takes >5 seconds to respond

**Solution**:
- Pre-load models on startup (already implemented)
- Cache predictions for 5-15 minutes
- Use smaller forecast windows (7 days instead of 30)
- Optimize data preprocessing (use numpy vectorization)

---

## Example Usage

### Complete Workflow Example

```python
# 1. Train Models
from cost_forecasting.model import CostForecastingModel
from anomaly_detection.model import AnomalyDetectionModel
import pandas as pd

# Load historical data
cost_data = pd.read_csv('historical_costs.csv')
cost_data['date'] = pd.to_datetime(cost_data['date'])

metric_data = pd.read_csv('baseline_metrics.csv')

# Train models
cost_model = CostForecastingModel()
cost_model.train(cost_data)
cost_model.save('cost_model.pkl')

anomaly_model = AnomalyDetectionModel()
anomaly_model.train(metric_data)
anomaly_model.save('anomaly_model.pkl')

# 2. Start API Service
# python ml-models/api/ml_service.py

# 3. Frontend Integration
# In your React component:
import { mlApi } from '@/services/api.service';

async function getCostForecast() {
  const forecast = await mlApi.forecastCost(historicalData, 30);
  console.log(`Total 30-day forecast: $${forecast.summary.total_predicted_cost}`);
  return forecast;
}

async function checkForAnomalies() {
  const currentMetrics = await monitoringApi.getMetrics();
  const anomalies = await mlApi.detectAnomalies(currentMetrics);
  
  if (anomalies.summary.anomaly_count > 0) {
    alert(`⚠️ ${anomalies.summary.anomaly_count} anomalies detected!`);
  }
}

async function getOptimizationRecommendations() {
  const resourceData = {
    resource_metrics: await getResourceMetrics(),
    security_audits: await getSecurityAudits(),
    performance_metrics: await getPerformanceMetrics()
  };
  
  const recs = await mlApi.getAllRecommendations(resourceData);
  console.log(`💡 ${recs.summary.total_recommendations} recommendations available`);
  console.log(`💰 Potential savings: $${recs.summary.total_potential_savings}/month`);
  
  return recs;
}
```

---

## Future Enhancements

### Phase 2 ML Features (Future)

1. **Advanced Cost Forecasting**
   - Multi-region cost optimization
   - What-if scenario modeling
   - Budget allocation optimization

2. **Predictive Maintenance**
   - Failure prediction before it happens
   - Optimal maintenance scheduling
   - Resource lifecycle management

3. **Auto-Scaling AI**
   - ML-powered auto-scaling decisions
   - Workload pattern prediction
   - Cost-aware scaling policies

4. **Security AI**
   - Threat pattern recognition
   - Automated incident response
   - Vulnerability prioritization

5. **Natural Language Interface**
   - Ask questions in plain English: "Will my costs increase next month?"
   - Natural language queries for infrastructure data
   - Conversational AI for operations

---

## Summary

✅ **Completed ML Implementation**:
- 3 ML models (Cost Forecasting, Anomaly Detection, Recommendation Engine)
- REST API service with 10+ endpoints
- Automated training scripts
- Frontend integration layer
- Production-ready deployment guides
- Comprehensive documentation

**Total Lines of Code**: ~1,500 lines of Python ML code

**Total Files Created**: 5 new files
- `ml-models/cost-forecasting/model.py` (321 lines)
- `ml-models/anomaly-detection/model.py` (284 lines)
- `ml-models/recommendation-engine/model.py` (439 lines)
- `ml-models/api/ml_service.py` (460 lines)
- `scripts/train_models.py` (214 lines)

**Dependencies**: 7 Python packages (Prophet, scikit-learn, pandas, numpy, scipy, flask, flask-cors)

**API Endpoints**: 10 endpoints across forecasting, detection, and recommendations

**Recommendation Rules**: 15 rules (5 cost + 5 security + 5 performance)

---

## Contact & Support

For ML-related issues:
1. Check troubleshooting section above
2. Review model training logs
3. Verify all dependencies are installed
4. Check API health endpoint
5. Review error logs in console

For questions or feature requests, refer to the main project documentation.
