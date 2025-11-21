# AI Recommendations

Comprehensive guide to AI-powered infrastructure recommendations and cost optimization in IAC Dharma.

---

## 📋 Overview

IAC Dharma's AI Engine provides intelligent recommendations using machine learning models:

- **Cost Prediction**: LSTM neural networks for cost forecasting
- **Anomaly Detection**: Isolation Forest for unusual spending patterns
- **Right-Sizing**: Resource optimization recommendations
- **Pattern Recognition**: CNN for architecture analysis
- **Confidence Scoring**: 0-100% confidence levels for all recommendations

---

## 🤖 Machine Learning Models

### 1. Cost Forecasting (LSTM)

**Model Architecture**:
```python
# LSTM Model for Cost Prediction
class CostForecastModel(nn.Module):
    def __init__(self, input_size=10, hidden_size=128, num_layers=2, output_size=30):
        super(CostForecastModel, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )
        
        # Attention mechanism
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_size,
            num_heads=8
        )
        
        # Fully connected layers
        self.fc1 = nn.Linear(hidden_size, 64)
        self.fc2 = nn.Linear(64, output_size)
        
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, x):
        # LSTM forward pass
        lstm_out, _ = self.lstm(x)
        
        # Apply attention
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        # Take the last output
        out = attn_out[:, -1, :]
        
        # Fully connected layers
        out = self.fc1(out)
        out = self.relu(out)
        out = self.dropout(out)
        out = self.fc2(out)
        
        return out
```

**Training Data**:
```yaml
training_data:
  features:
    - daily_cost
    - resource_count
    - cpu_utilization
    - memory_utilization
    - network_traffic
    - storage_usage
    - deployment_count
    - day_of_week
    - month
    - is_weekend
  
  target:
    - next_30_days_cost
  
  preprocessing:
    normalization: min_max_scaler
    sequence_length: 90  # 90 days lookback
    train_test_split: 0.8
  
  hyperparameters:
    hidden_size: 128
    num_layers: 2
    learning_rate: 0.001
    batch_size: 32
    epochs: 100
    early_stopping_patience: 10
```

**API Usage**:
```bash
# Get cost forecast
curl -X POST http://localhost:3005/api/ai/cost-forecast \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "aws-123456",
    "forecastDays": 30,
    "includeConfidenceInterval": true
  }'

# Response
{
  "forecast": [
    {"date": "2025-11-22", "predicted_cost": 12500, "lower_bound": 11800, "upper_bound": 13200},
    {"date": "2025-11-23", "predicted_cost": 12600, "lower_bound": 11900, "upper_bound": 13300}
  ],
  "summary": {
    "total_predicted_cost": 385000,
    "average_daily_cost": 12833,
    "trend": "increasing",
    "confidence": 92
  },
  "model_info": {
    "version": "v2.1.0",
    "last_trained": "2025-11-15",
    "mae": 450,
    "rmse": 620
  }
}
```

### 2. Anomaly Detection (Isolation Forest)

**Model Configuration**:
```python
from sklearn.ensemble import IsolationForest
import numpy as np

class CostAnomalyDetector:
    def __init__(self, contamination=0.05):
        """
        Initialize anomaly detector
        contamination: Expected proportion of outliers (5%)
        """
        self.model = IsolationForest(
            contamination=contamination,
            n_estimators=100,
            max_samples='auto',
            max_features=1.0,
            bootstrap=False,
            random_state=42
        )
        
        self.scaler = StandardScaler()
        self.trained = False
    
    def fit(self, cost_data):
        """
        Train model on historical cost data
        """
        features = self._extract_features(cost_data)
        scaled_features = self.scaler.fit_transform(features)
        self.model.fit(scaled_features)
        self.trained = True
    
    def detect_anomalies(self, current_costs):
        """
        Detect anomalies in current costs
        Returns: anomaly_score (-1 for anomaly, 1 for normal)
        """
        if not self.trained:
            raise ValueError("Model not trained")
        
        features = self._extract_features(current_costs)
        scaled_features = self.scaler.transform(features)
        predictions = self.model.predict(scaled_features)
        anomaly_scores = self.model.score_samples(scaled_features)
        
        return {
            'is_anomaly': predictions == -1,
            'anomaly_score': anomaly_scores,
            'threshold': self.model.offset_
        }
    
    def _extract_features(self, cost_data):
        """Extract features from cost data"""
        return np.array([
            cost_data['total_cost'],
            cost_data['cost_per_service'],
            cost_data['cost_change_rate'],
            cost_data['hour_of_day'],
            cost_data['day_of_week'],
            cost_data['resource_count']
        ])
```

**Real-Time Monitoring**:
```yaml
anomaly_detection:
  enabled: true
  check_interval: 5_minutes
  
  thresholds:
    sensitivity: medium  # low, medium, high
    min_deviation: 20  # % from expected
    min_cost_increase: 1000  # USD
  
  alerting:
    channels:
      - email
      - slack
      - pagerduty
    
    severity_levels:
      low:
        deviation: 20-30%
        action: log_only
      
      medium:
        deviation: 30-50%
        action: notify_team
      
      high:
        deviation: 50-100%
        action: notify_oncall
      
      critical:
        deviation: >100%
        action: page_oncall_immediate
  
  auto_analysis:
    enabled: true
    identify_root_cause: true
    suggest_remediation: true
```

### 3. Right-Sizing Recommendations

**Recommendation Engine**:
```python
class RightSizingRecommendation:
    def __init__(self):
        self.utilization_thresholds = {
            'cpu': {'low': 20, 'high': 80},
            'memory': {'low': 25, 'high': 85},
            'network': {'low': 15, 'high': 75}
        }
    
    def analyze_instance(self, instance_metrics):
        """
        Analyze instance utilization and recommend sizing
        """
        recommendations = []
        
        # Calculate average utilization over 30 days
        avg_cpu = np.mean(instance_metrics['cpu_utilization'])
        avg_memory = np.mean(instance_metrics['memory_utilization'])
        p95_cpu = np.percentile(instance_metrics['cpu_utilization'], 95)
        p95_memory = np.percentile(instance_metrics['memory_utilization'], 95)
        
        current_type = instance_metrics['instance_type']
        current_cost = instance_metrics['monthly_cost']
        
        # Check if under-utilized
        if avg_cpu < self.utilization_thresholds['cpu']['low'] and \
           avg_memory < self.utilization_thresholds['memory']['low']:
            
            # Find smaller instance type
            recommended_type = self._find_smaller_instance(current_type)
            recommended_cost = self._get_instance_cost(recommended_type)
            savings = current_cost - recommended_cost
            
            recommendations.append({
                'type': 'downsize',
                'current_instance': current_type,
                'recommended_instance': recommended_type,
                'current_cost': current_cost,
                'recommended_cost': recommended_cost,
                'monthly_savings': savings,
                'annual_savings': savings * 12,
                'reason': f'Low utilization: CPU {avg_cpu:.1f}%, Memory {avg_memory:.1f}%',
                'confidence': self._calculate_confidence(avg_cpu, avg_memory, p95_cpu, p95_memory),
                'risk': 'low',
                'impact': 'none'
            })
        
        # Check if over-utilized
        elif p95_cpu > self.utilization_thresholds['cpu']['high'] or \
             p95_memory > self.utilization_thresholds['memory']['high']:
            
            # Find larger instance type
            recommended_type = self._find_larger_instance(current_type)
            recommended_cost = self._get_instance_cost(recommended_type)
            additional_cost = recommended_cost - current_cost
            
            recommendations.append({
                'type': 'upsize',
                'current_instance': current_type,
                'recommended_instance': recommended_type,
                'current_cost': current_cost,
                'recommended_cost': recommended_cost,
                'additional_cost': additional_cost,
                'reason': f'High utilization: P95 CPU {p95_cpu:.1f}%, Memory {p95_memory:.1f}%',
                'confidence': 95,
                'risk': 'high',
                'impact': 'performance_degradation'
            })
        
        return recommendations
    
    def _calculate_confidence(self, avg_cpu, avg_memory, p95_cpu, p95_memory):
        """Calculate recommendation confidence score"""
        # Lower utilization = higher confidence for downsizing
        cpu_confidence = 100 - (avg_cpu / self.utilization_thresholds['cpu']['low']) * 100
        memory_confidence = 100 - (avg_memory / self.utilization_thresholds['memory']['low']) * 100
        
        # Consider variance
        variance_penalty = abs(p95_cpu - avg_cpu) / 10
        
        confidence = (cpu_confidence + memory_confidence) / 2 - variance_penalty
        return max(0, min(100, confidence))
```

**API Endpoint**:
```bash
# Get right-sizing recommendations
curl -X POST http://localhost:3005/api/ai/right-sizing \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "aws-123456",
    "region": "us-east-1",
    "minSavings": 100,
    "minConfidence": 75
  }'

# Response
{
  "recommendations": [
    {
      "resourceId": "i-1234567890abcdef0",
      "resourceName": "web-server-01",
      "type": "downsize",
      "currentInstance": "m5.2xlarge",
      "recommendedInstance": "m5.xlarge",
      "currentCost": 280,
      "recommendedCost": 140,
      "monthlySavings": 140,
      "annualSavings": 1680,
      "utilizationStats": {
        "avgCpu": 15.3,
        "avgMemory": 22.1,
        "p95Cpu": 28.5,
        "p95Memory": 35.2
      },
      "confidence": 92,
      "risk": "low",
      "impact": "none",
      "implementationSteps": [
        "1. Create snapshot of current instance",
        "2. Stop instance during maintenance window",
        "3. Change instance type to m5.xlarge",
        "4. Start instance and verify functionality",
        "5. Monitor for 24 hours"
      ]
    }
  ],
  "totalPotentialSavings": {
    "monthly": 3250,
    "annual": 39000
  },
  "summary": {
    "totalRecommendations": 23,
    "highConfidence": 18,
    "mediumConfidence": 4,
    "lowConfidence": 1
  }
}
```

### 4. Reserved Instance Optimization

**RI Recommendation Model**:
```python
class ReservedInstanceOptimizer:
    def __init__(self):
        self.min_runtime_days = 90
        self.min_utilization = 0.80
    
    def analyze_ri_opportunities(self, usage_data):
        """
        Analyze usage patterns to identify RI opportunities
        """
        recommendations = []
        
        for instance_family in usage_data:
            # Calculate utilization
            total_hours = instance_family['runtime_hours']
            total_days = total_hours / 24
            utilization = instance_family['utilization_percentage']
            
            # Check if candidate for RI
            if total_days >= self.min_runtime_days and utilization >= self.min_utilization:
                
                # Calculate savings for different RI terms
                on_demand_cost = self._calculate_on_demand_cost(instance_family)
                
                ri_options = []
                for term in ['1year', '3year']:
                    for payment in ['all_upfront', 'partial_upfront', 'no_upfront']:
                        ri_cost = self._calculate_ri_cost(instance_family, term, payment)
                        savings = on_demand_cost - ri_cost
                        roi = (savings / ri_cost) * 100
                        
                        ri_options.append({
                            'term': term,
                            'payment_option': payment,
                            'cost': ri_cost,
                            'savings': savings,
                            'roi': roi,
                            'breakeven_months': self._calculate_breakeven(on_demand_cost, ri_cost, term)
                        })
                
                # Find best option (highest savings with acceptable ROI)
                best_option = max(ri_options, key=lambda x: x['savings'])
                
                recommendations.append({
                    'instance_type': instance_family['instance_type'],
                    'region': instance_family['region'],
                    'quantity': instance_family['average_count'],
                    'current_cost': on_demand_cost,
                    'recommended_option': best_option,
                    'utilization': utilization,
                    'runtime_days': total_days,
                    'confidence': self._calculate_ri_confidence(utilization, total_days)
                })
        
        return recommendations
```

---

## 📊 Recommendation Dashboard

### Grafana Integration

**Dashboard Panels**:

**Cost Forecast Panel**:
```json
{
  "title": "30-Day Cost Forecast",
  "type": "graph",
  "targets": [
    {
      "expr": "ai_cost_forecast_predicted",
      "legendFormat": "Predicted Cost"
    },
    {
      "expr": "ai_cost_forecast_lower_bound",
      "legendFormat": "Lower Bound"
    },
    {
      "expr": "ai_cost_forecast_upper_bound",
      "legendFormat": "Upper Bound"
    }
  ]
}
```

**Anomaly Detection Panel**:
```json
{
  "title": "Cost Anomalies",
  "type": "table",
  "targets": [
    {
      "expr": "ai_anomaly_detected",
      "format": "table"
    }
  ],
  "columns": [
    "timestamp",
    "service",
    "expected_cost",
    "actual_cost",
    "deviation_percent",
    "severity"
  ]
}
```

**Savings Opportunities Panel**:
```json
{
  "title": "Potential Monthly Savings",
  "type": "gauge",
  "targets": [
    {
      "expr": "sum(ai_recommendations_potential_savings)"
    }
  ],
  "thresholds": [
    {"value": 0, "color": "red"},
    {"value": 1000, "color": "yellow"},
    {"value": 5000, "color": "green"}
  ]
}
```

---

## 🎯 Recommendation Types

### 1. Cost Optimization

**Right-Sizing**:
- Downsize over-provisioned instances
- Upsize under-provisioned instances
- Modernize instance families

**Purchase Options**:
- Reserved Instances (1-year, 3-year)
- Savings Plans
- Spot Instances for suitable workloads

**Storage Optimization**:
- S3 lifecycle policies
- EBS volume optimization
- Snapshot cleanup

### 2. Performance Optimization

**Compute**:
- CPU-optimized instances for compute-heavy workloads
- Memory-optimized for data processing
- Burstable instances for variable workloads

**Database**:
- Read replica recommendations
- Connection pooling
- Query optimization suggestions

**Caching**:
- Redis cluster sizing
- Cache hit ratio optimization
- TTL tuning

### 3. Security Hardening

**Encryption**:
- Enable encryption at rest
- Enforce TLS 1.3
- Rotate encryption keys

**Access Control**:
- Remove overly permissive IAM policies
- Enable MFA
- Review security group rules

**Compliance**:
- Enable audit logging
- Configure backup retention
- Implement least privilege

### 4. Reliability Improvements

**High Availability**:
- Multi-AZ deployment
- Auto-scaling configuration
- Health check optimization

**Backup & Recovery**:
- Automated backup schedules
- Cross-region replication
- Disaster recovery testing

**Monitoring**:
- Add missing metrics
- Configure alerts
- Set up dashboards

---

## 🔧 Configuration

### AI Engine Settings

```yaml
ai_engine:
  enabled: true
  
  models:
    cost_forecast:
      enabled: true
      retrain_frequency: weekly
      min_training_data_days: 90
      forecast_horizon_days: 30
    
    anomaly_detection:
      enabled: true
      sensitivity: medium
      check_interval: 5_minutes
      min_deviation_percent: 20
    
    right_sizing:
      enabled: true
      analysis_period_days: 30
      min_utilization_cpu: 20
      max_utilization_cpu: 80
      min_confidence: 75
    
    ri_optimization:
      enabled: true
      min_runtime_days: 90
      min_utilization_percent: 80
      preferred_term: 1year
  
  recommendations:
    auto_generate: true
    generation_schedule: "0 2 * * *"  # Daily at 2 AM
    
    priorities:
      high: savings > 1000 AND confidence > 85
      medium: savings > 500 AND confidence > 70
      low: savings > 100
    
    notifications:
      enabled: true
      channels:
        - email
        - slack
      recipients:
        - finops@company.com
        - devops@company.com
```

---

## 📈 Model Training

### Retraining Pipeline

```python
class ModelRetrainingPipeline:
    def __init__(self):
        self.models = {
            'cost_forecast': CostForecastModel(),
            'anomaly_detection': CostAnomalyDetector()
        }
    
    def retrain_all_models(self):
        """Retrain all models with latest data"""
        logger.info("Starting model retraining...")
        
        # Fetch latest training data
        training_data = self._fetch_training_data()
        
        # Retrain cost forecast model
        logger.info("Retraining cost forecast model...")
        cost_model = self._retrain_cost_forecast(training_data)
        
        # Evaluate model
        metrics = self._evaluate_model(cost_model, training_data['test'])
        logger.info(f"Cost model metrics: MAE={metrics['mae']}, RMSE={metrics['rmse']}")
        
        # Deploy if performance improved
        if self._should_deploy(metrics):
            self._deploy_model(cost_model, 'cost_forecast')
            logger.info("Cost forecast model deployed successfully")
        
        # Retrain anomaly detection model
        logger.info("Retraining anomaly detection model...")
        anomaly_model = self._retrain_anomaly_detection(training_data)
        self._deploy_model(anomaly_model, 'anomaly_detection')
        
        logger.info("Model retraining completed")
```

**Automated Retraining Schedule**:
```yaml
model_retraining:
  schedule: "0 3 * * 0"  # Weekly on Sunday at 3 AM
  
  triggers:
    - schedule
    - performance_degradation
    - data_drift_detected
  
  validation:
    test_set_size: 0.2
    min_improvement: 5  # % improvement required
    
  deployment:
    strategy: blue_green
    rollback_on_errors: true
    monitor_duration: 24_hours
```

---

## 🔍 Troubleshooting

### Low Confidence Recommendations

**Causes**:
- Insufficient historical data (< 30 days)
- High variance in usage patterns
- Recent infrastructure changes

**Solutions**:
```bash
# Check data availability
curl http://localhost:3005/api/ai/data-quality

# Increase analysis period
curl -X POST http://localhost:3005/api/ai/config \
  -d '{"analysis_period_days": 90}'

# Adjust confidence threshold
curl -X POST http://localhost:3005/api/ai/config \
  -d '{"min_confidence": 70}'
```

### Model Performance Degradation

**Monitoring**:
```bash
# Check model metrics
curl http://localhost:3005/api/ai/model-metrics

# Response
{
  "cost_forecast": {
    "mae": 520,
    "rmse": 680,
    "last_trained": "2025-11-15",
    "version": "v2.1.0"
  },
  "anomaly_detection": {
    "false_positive_rate": 0.03,
    "false_negative_rate": 0.01,
    "last_trained": "2025-11-18"
  }
}
```

**Trigger Manual Retraining**:
```bash
curl -X POST http://localhost:3005/api/ai/retrain \
  -d '{"model": "cost_forecast", "force": true}'
```

---

## 📚 Related Documentation

- [Cost Optimization](Cost-Optimization) - Detailed cost strategies
- [Performance Tuning](Performance-Tuning) - Performance optimization
- [Observability](Observability) - Monitoring AI recommendations
- [API Reference](API-Reference) - AI API endpoints

---

**Next Steps**: Explore [CMDB-Integration](CMDB-Integration) for infrastructure discovery.
