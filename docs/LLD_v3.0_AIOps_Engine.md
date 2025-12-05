# Low-Level Design: AIOps Engine v3.0

## 1. Service Overview

**Service Name**: AIOps Engine  
**Port**: 8100  
**Framework**: FastAPI (Python 3.11)  
**Purpose**: Predictive analytics, anomaly detection, and auto-remediation

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AIOps Engine (Port 8100)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ API Layer    │  │ ML Pipeline  │  │ Remediation │ │
│  │ (FastAPI)    │→ │ (12 Models)  │→ │ Engine      │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│         ↓                  ↓                 ↓         │
│  ┌─────────────────────────────────────────────────┐  │
│  │          Data Layer (TimescaleDB)               │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 3. Database Schema (TimescaleDB)

### 3.1 predictions Table
```sql
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_type VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    predicted_time TIMESTAMPTZ,
    probability FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_components JSONB,
    recommended_actions JSONB,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hypertable for time-series optimization
SELECT create_hypertable('predictions', 'timestamp');
CREATE INDEX idx_predictions_service ON predictions(service_name, timestamp DESC);
```

### 3.2 anomalies Table
```sql
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id VARCHAR(100) UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    is_anomaly BOOLEAN NOT NULL,
    anomaly_score FLOAT NOT NULL,
    affected_metrics JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,
    root_cause TEXT,
    remediation_suggested BOOLEAN DEFAULT false,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT create_hypertable('anomalies', 'timestamp');
```

### 3.3 remediations Table
```sql
CREATE TABLE remediations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remediation_id VARCHAR(100) UNIQUE NOT NULL,
    incident_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    success BOOLEAN,
    details JSONB,
    rollback_available BOOLEAN DEFAULT true,
    rollback_executed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT create_hypertable('remediations', 'started_at');
```

### 3.4 metrics Table (Time-series)
```sql
CREATE TABLE metrics (
    time TIMESTAMPTZ NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    labels JSONB,
    node VARCHAR(255)
);

SELECT create_hypertable('metrics', 'time');
CREATE INDEX idx_metrics_service_name ON metrics(service_name, metric_name, time DESC);
```

### 3.5 ml_models Table
```sql
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    accuracy FLOAT,
    trained_at TIMESTAMPTZ NOT NULL,
    deployed_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL,
    hyperparameters JSONB,
    metrics JSONB,
    artifact_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_name, version)
);
```

## 4. API Endpoints Implementation

### 4.1 Failure Prediction

**Endpoint**: `POST /api/v3/aiops/predict/failure`

**Request**:
```python
class FailurePredictionRequest(BaseModel):
    service_name: str
    time_window: int = 48  # hours
    metrics: Optional[Dict[str, List[float]]] = None
```

**Processing Flow**:
```python
async def predict_failure(request: FailurePredictionRequest):
    # 1. Fetch historical metrics from TimescaleDB
    query = """
        SELECT time, metric_name, value
        FROM metrics
        WHERE service_name = $1
        AND time > NOW() - INTERVAL '7 days'
        ORDER BY time DESC
    """
    
    # 2. Preprocess data
    df = preprocess_metrics(metrics_data)
    
    # 3. Load LSTM model from MLflow
    model = mlflow.pytorch.load_model(f"models:/FailurePredictor/production")
    
    # 4. Run prediction
    prediction = model.predict(df)
    
    # 5. Calculate probability and confidence
    probability = prediction['failure_probability']
    confidence = prediction['confidence_score']
    
    # 6. Store prediction in database
    await db.execute(
        "INSERT INTO predictions (...) VALUES (...)",
        prediction_data
    )
    
    # 7. Publish to Kafka
    await kafka.send_prediction(...)
    
    # 8. Return response
    return PredictionResponse(...)
```

### 4.2 Anomaly Detection

**Endpoint**: `POST /api/v3/aiops/analyze/anomaly`

**Algorithm**: Isolation Forest + Statistical Analysis

```python
class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.scaler = StandardScaler()
    
    async def detect(self, metrics: Dict[str, float]):
        # 1. Fetch baseline (last 24h)
        baseline = await fetch_baseline(service_name)
        
        # 2. Calculate z-scores
        z_scores = {}
        for metric, value in metrics.items():
            mean = baseline[metric]['mean']
            std = baseline[metric]['std']
            z_scores[metric] = (value - mean) / std
        
        # 3. Run Isolation Forest
        features = np.array(list(metrics.values())).reshape(1, -1)
        anomaly_score = self.model.decision_function(features)[0]
        is_anomaly = self.model.predict(features)[0] == -1
        
        # 4. Identify affected metrics (|z| > 3)
        affected = [m for m, z in z_scores.items() if abs(z) > 3]
        
        # 5. Determine severity
        severity = self._calculate_severity(z_scores, anomaly_score)
        
        return {
            'is_anomaly': is_anomaly,
            'anomaly_score': abs(anomaly_score),
            'affected_metrics': affected,
            'severity': severity
        }
```

### 4.3 Auto-Remediation

**Endpoint**: `POST /api/v3/aiops/remediate/auto`

**Remediation Actions**:

```python
class RemediationEngine:
    def __init__(self):
        self.k8s_client = kubernetes.client.CoreV1Api()
        self.actions = {
            'pod_restart': self.restart_pod,
            'pod_scale': self.scale_deployment,
            'certificate_renewal': self.renew_certificate,
            'index_creation': self.create_index,
        }
    
    async def execute(self, remediation_request: RemediationRequest):
        # 1. Validate request
        if not self.validate_request(remediation_request):
            raise ValidationError()
        
        # 2. Check circuit breaker
        if not await self.circuit_breaker.allow():
            raise CircuitBreakerOpen()
        
        # 3. Create remediation record
        remediation_id = await self.create_record(remediation_request)
        
        # 4. Take snapshot for rollback
        snapshot = await self.take_snapshot(remediation_request)
        
        # 5. Execute action
        action = self.actions[remediation_request.action]
        try:
            result = await action(remediation_request)
            success = True
        except Exception as e:
            success = False
            logger.error(f"Remediation failed: {e}")
        
        # 6. Verify success
        if success:
            verified = await self.verify_health(remediation_request)
            if not verified:
                # Rollback
                await self.rollback(snapshot)
                success = False
        
        # 7. Update record
        await self.update_record(remediation_id, success)
        
        # 8. Publish event
        await kafka.send_remediation(remediation_id, success)
        
        return success
    
    async def restart_pod(self, request):
        """Restart Kubernetes pod"""
        pod_name = request.details['pod_name']
        namespace = request.details.get('namespace', 'default')
        
        # Delete pod (will be recreated by deployment)
        self.k8s_client.delete_namespaced_pod(
            name=pod_name,
            namespace=namespace,
            grace_period_seconds=30
        )
        
        # Wait for new pod to be ready
        await self.wait_for_pod_ready(namespace, pod_name)
        
        return True
```

## 5. ML Model Implementation

### 5.1 Failure Predictor (LSTM)

```python
import torch
import torch.nn as nn

class FailurePredictorLSTM(nn.Module):
    def __init__(self, input_size=10, hidden_size=128, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )
        self.fc1 = nn.Linear(hidden_size, 64)
        self.fc2 = nn.Linear(64, 2)  # [no_failure, failure]
        self.dropout = nn.Dropout(0.3)
        
    def forward(self, x):
        # x shape: (batch, seq_len, features)
        lstm_out, (h_n, c_n) = self.lstm(x)
        
        # Use last hidden state
        last_hidden = h_n[-1]
        
        # Fully connected layers
        x = torch.relu(self.fc1(last_hidden))
        x = self.dropout(x)
        x = self.fc2(x)
        
        return torch.softmax(x, dim=1)

# Training
def train_failure_predictor():
    model = FailurePredictorLSTM()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    for epoch in range(100):
        for batch in train_loader:
            metrics, labels = batch
            
            # Forward pass
            outputs = model(metrics)
            loss = criterion(outputs, labels)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        
        # Log to MLflow
        mlflow.log_metric("loss", loss.item(), step=epoch)
    
    # Save model
    mlflow.pytorch.log_model(model, "failure_predictor")
```

### 5.2 Threat Detector (Random Forest)

```python
from sklearn.ensemble import RandomForestClassifier
import mlflow.sklearn

class ThreatDetector:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=10,
            class_weight='balanced',
            random_state=42
        )
    
    def train(self, X_train, y_train):
        """Train threat detection model"""
        # Feature engineering
        features = self.extract_features(X_train)
        
        # Train model
        self.model.fit(features, y_train)
        
        # Calculate metrics
        from sklearn.metrics import accuracy_score, precision_score, recall_score
        y_pred = self.model.predict(features)
        
        accuracy = accuracy_score(y_train, y_pred)
        precision = precision_score(y_train, y_pred)
        recall = recall_score(y_train, y_pred)
        
        # Log to MLflow
        mlflow.log_params({
            'n_estimators': 200,
            'max_depth': 20
        })
        mlflow.log_metrics({
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall
        })
        
        # Save model
        mlflow.sklearn.log_model(self.model, "threat_detector")
    
    def extract_features(self, data):
        """Extract features from network traffic"""
        features = []
        
        for sample in data:
            f = {
                'request_count': sample['request_count'],
                'unique_ips': len(set(sample['ip_addresses'])),
                'avg_request_size': np.mean(sample['request_sizes']),
                'error_rate': sample['errors'] / sample['total_requests'],
                'unusual_hours': self.is_unusual_hour(sample['timestamp']),
                'geo_anomaly': self.check_geo_anomaly(sample['locations']),
            }
            features.append(list(f.values()))
        
        return np.array(features)
```

## 6. Kafka Integration

### 6.1 Message Schemas

```python
# Prediction Message
{
    "id": "pred_123",
    "type": "failure",
    "service": "api-gateway",
    "probability": 0.85,
    "confidence": 0.92,
    "predicted_time": "2025-12-07T14:30:00Z",
    "timestamp": "2025-12-05T10:15:00Z",
    "details": {...}
}

# Anomaly Message
{
    "id": "anom_456",
    "service": "database",
    "severity": "high",
    "anomaly_score": 0.88,
    "affected_metrics": ["cpu_usage", "query_latency"],
    "timestamp": "2025-12-05T10:15:00Z"
}

# Remediation Message
{
    "id": "rem_789",
    "incident_id": "inc_123",
    "action": "pod_restart",
    "status": "completed",
    "success": true,
    "started_at": "2025-12-05T10:16:00Z",
    "completed_at": "2025-12-05T10:16:45Z"
}
```

### 6.2 Consumer Implementation

```python
class AIOpsKafkaConsumer:
    async def consume_metrics(self):
        """Consume metrics from Kafka"""
        async for message in self.consumer:
            try:
                metric = message.value
                
                # Store in TimescaleDB
                await self.db.execute("""
                    INSERT INTO metrics (time, service_name, metric_name, value, labels)
                    VALUES ($1, $2, $3, $4, $5)
                """, metric['timestamp'], metric['service'], 
                     metric['metric'], metric['value'], metric['labels'])
                
                # Check for anomalies in real-time
                if await self.should_check_anomaly(metric):
                    anomaly = await self.detect_anomaly(metric)
                    if anomaly['is_anomaly']:
                        await self.handle_anomaly(anomaly)
                
            except Exception as e:
                logger.error(f"Error processing metric: {e}")
```

## 7. Configuration

### 7.1 Model Configuration

```yaml
# models_config.yaml
models:
  failure_predictor:
    type: lstm
    input_features:
      - cpu_usage
      - memory_usage
      - disk_io
      - network_io
      - error_rate
      - response_time
    sequence_length: 168  # 7 days of hourly data
    prediction_window: 48  # hours
    retrain_interval: 7  # days
    min_accuracy: 0.85
  
  threat_detector:
    type: random_forest
    features:
      - request_count
      - unique_ips
      - error_rate
      - geo_diversity
      - time_patterns
    threshold: 0.95
    false_positive_max: 0.05
```

### 7.2 Remediation Rules

```yaml
# remediation_rules.yaml
rules:
  high_cpu:
    condition: cpu_usage > 90 for 5m
    actions:
      - type: scale_up
        params:
          replicas: +2
        approval_required: false
  
  pod_crash_loop:
    condition: restart_count > 5 in 10m
    actions:
      - type: rollback_deployment
        params:
          revisions: 1
        approval_required: true
  
  certificate_expiry:
    condition: cert_expiry < 30 days
    actions:
      - type: renew_certificate
        params:
          auto_apply: true
        approval_required: false
```

## 8. Performance Optimizations

### 8.1 Caching Strategy

```python
from redis import asyncio as aioredis

class PredictionCache:
    def __init__(self):
        self.redis = aioredis.from_url("redis://localhost:6379")
        self.ttl = 300  # 5 minutes
    
    async def get_prediction(self, key: str):
        """Get cached prediction"""
        data = await self.redis.get(f"prediction:{key}")
        if data:
            return json.loads(data)
        return None
    
    async def set_prediction(self, key: str, prediction: dict):
        """Cache prediction"""
        await self.redis.setex(
            f"prediction:{key}",
            self.ttl,
            json.dumps(prediction)
        )
```

### 8.2 Batch Processing

```python
async def process_metrics_batch(metrics: List[Dict]):
    """Process metrics in batches for efficiency"""
    batch_size = 1000
    
    for i in range(0, len(metrics), batch_size):
        batch = metrics[i:i+batch_size]
        
        # Bulk insert to TimescaleDB
        await db.executemany(
            "INSERT INTO metrics (...) VALUES (...)",
            [(m['time'], m['service'], m['metric'], m['value']) 
             for m in batch]
        )
```

## 9. Monitoring & Observability

### 9.1 Prometheus Metrics

```python
from prometheus_client import Counter, Histogram, Gauge

# Metrics
prediction_counter = Counter(
    'aiops_predictions_total',
    'Total predictions made',
    ['prediction_type', 'service']
)

prediction_latency = Histogram(
    'aiops_prediction_latency_seconds',
    'Prediction latency',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

model_accuracy = Gauge(
    'aiops_model_accuracy',
    'Model accuracy',
    ['model_name']
)

remediation_success_rate = Gauge(
    'aiops_remediation_success_rate',
    'Remediation success rate'
)
```

### 9.2 Health Checks

```python
@app.get("/health")
async def health_check():
    checks = {
        'database': await check_database(),
        'redis': await check_redis(),
        'kafka': await check_kafka(),
        'models_loaded': len(loaded_models) == 12
    }
    
    healthy = all(checks.values())
    
    return {
        'status': 'healthy' if healthy else 'unhealthy',
        'checks': checks,
        'timestamp': datetime.now().isoformat()
    }
```

## 10. Testing Strategy

### 10.1 Unit Tests

```python
# tests/test_failure_predictor.py
import pytest

@pytest.mark.asyncio
async def test_failure_prediction():
    request = FailurePredictionRequest(
        service_name="test-service",
        time_window=48
    )
    
    response = await predict_failure(request)
    
    assert response.prediction_type == "failure"
    assert 0 <= response.probability <= 1
    assert 0 <= response.confidence <= 1
    assert response.service_name == "test-service"
```

### 10.2 Integration Tests

```python
# tests/integration/test_aiops_flow.py
@pytest.mark.integration
async def test_anomaly_to_remediation_flow():
    # 1. Detect anomaly
    anomaly = await detect_anomaly(high_cpu_metrics)
    assert anomaly.is_anomaly == True
    
    # 2. Trigger remediation
    remediation = await auto_remediate(anomaly)
    assert remediation.status == "completed"
    assert remediation.success == True
    
    # 3. Verify metrics normalized
    await asyncio.sleep(60)
    new_metrics = await fetch_metrics("test-service")
    assert new_metrics['cpu_usage'] < 80
```

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Ready for Implementation
