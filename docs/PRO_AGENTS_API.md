# 🚀 Pro Agents API Reference

Complete API documentation for all Pro-Level agent enhancements.

## Base URLs

- **AI Engine**: `http://localhost:8000`
- **Automation Engine**: `http://localhost:3006`
- **Guardrails Engine**: `http://localhost:3003`
- **Monitoring Service**: `http://localhost:3007`
- **API Gateway**: `http://localhost:3000`

---

## 1. AI Engine Pro APIs

### 1.1 Analyze Requirements (Advanced)

**Endpoint**: `POST /api/ai/analyze-advanced`

**Description**: Advanced requirement analysis using NLP, Deep Learning, and AutoML

**Request**:
```json
{
  "description": "Build a scalable microservices platform...",
  "services": ["api-gateway", "user-service", "payment"],
  "requirements": {
    "scalability": "high",
    "security": "high"
  }
}
```

**Response**:
```json
{
  "analysis": {
    "nlp_insights": {
      "entities": {
        "service": ["api-gateway", "user-service"],
        "technology": ["kubernetes", "docker"],
        "security": ["ssl", "auth"]
      },
      "complexity": "high",
      "intents": ["scalability", "security"]
    },
    "recommended_architecture": "microservices",
    "confidence": 0.85
  },
  "predictions": {
    "architecture_pattern": "microservices",
    "alternatives": [...]
  }
}
```

### 1.2 Optimize Infrastructure

**Endpoint**: `POST /api/ai/optimize`

**Request**:
```json
{
  "current_state": {
    "cpu_usage": 75,
    "memory_usage": 82,
    "instance_count": 4
  },
  "constraints": {
    "max_cost": 5000,
    "min_instances": 2
  }
}
```

**Response**:
```json
{
  "optimization": {
    "action": "scale_down_cpu",
    "expected_reward": 20,
    "confidence": 0.87
  },
  "anomalies": {
    "total_anomalies": 2,
    "anomalies": [...]
  },
  "recommendations": [
    "🔽 Consider scaling down to save costs: scale_down_cpu",
    "💰 High ROI expected from this optimization"
  ]
}
```

### 1.3 Forecast Capacity

**Endpoint**: `POST /api/ai/forecast`

**Request**:
```json
{
  "metric_history": [65.2, 67.1, 69.3, ...],
  "metric_name": "cpu",
  "periods": 30
}
```

**Response**:
```json
{
  "forecast": [71.5, 73.2, 75.1, ...],
  "upper_bound": [76.5, 78.2, 80.1, ...],
  "lower_bound": [66.5, 68.2, 70.1, ...],
  "trend": "increasing",
  "confidence": 0.89,
  "scaling_recommendation": {
    "scale_needed": true,
    "scale_factor": 1.15,
    "urgency": "medium",
    "estimated_days_until_capacity": 15
  }
}
```

---

## 2. Automation Engine Pro APIs

### 2.1 Start Pro Workflow

**Endpoint**: `POST /api/automation/pro/start`

**Description**: Start an AI-optimized workflow with advanced features

**Request**:
```json
{
  "requirements": {
    "infrastructure": "kubernetes",
    "services": ["api", "database", "cache"]
  },
  "automationLevel": 5,
  "environment": "production",
  "aiOptimization": true,
  "selfHealing": true,
  "predictiveAnalysis": true,
  "multiCloud": false,
  "chaosEngineering": false
}
```

**Response** (202 Accepted):
```json
{
  "workflowId": "pro_1733364123456",
  "status": "started",
  "message": "Pro Automation workflow initiated with AI capabilities",
  "trackingUrl": "/api/automation/pro/status/pro_1733364123456",
  "features": {
    "aiOptimization": true,
    "selfHealing": true,
    "predictiveAnalysis": true,
    "multiCloud": false
  }
}
```

### 2.2 Get Pro Workflow Status

**Endpoint**: `GET /api/automation/pro/status/:workflowId`

**Response**:
```json
{
  "workflowId": "pro_1733364123456",
  "status": "running",
  "healingActions": 3,
  "performanceMetrics": {
    "totalSteps": 8,
    "avgCpu": 65.4,
    "avgMemory": 72.1,
    "avgDuration": 45.2
  },
  "features": {
    "aiOptimization": true,
    "selfHealing": true,
    "predictiveAnalysis": true
  }
}
```

### 2.3 Get Pro Features

**Endpoint**: `GET /api/automation/pro/features`

**Response**:
```json
{
  "features": [
    "AI-Powered Workflow Optimization",
    "Predictive Failure Detection",
    "Self-Healing Capabilities",
    "Multi-Cloud Orchestration",
    "Dynamic Resource Allocation",
    ...
  ],
  "mlModels": [
    {
      "name": "step_duration_predictor",
      "type": "gradient_boosting",
      "accuracy": 0.89
    },
    ...
  ],
  "statistics": {
    "totalWorkflows": 156,
    "totalHealingActions": 42,
    "activeWorkflows": 5
  }
}
```

### 2.4 Cancel Pro Workflow

**Endpoint**: `POST /api/automation/pro/cancel/:workflowId`

**Response**:
```json
{
  "status": "cancelled"
}
```

---

## 3. Guardrails Engine Pro APIs

### 3.1 Pro Policy Evaluation

**Endpoint**: `POST /api/pro/evaluate`

**Description**: AI-powered policy evaluation with ML-based risk scoring

**Request**:
```json
{
  "blueprintId": "bp_123",
  "iacCode": "resource \"aws_s3_bucket\" \"example\" {...}",
  "format": "terraform",
  "environment": "production"
}
```

**Response**:
```json
{
  "evaluationId": "eval_1733364123456",
  "violations": [
    {
      "policyId": "pol_security_001",
      "policyName": "Encryption at Rest",
      "severity": "critical",
      "resource": "database.main",
      "violation": "Database does not have encryption enabled",
      "impact": "Data exposure risk",
      "autoRemediable": true,
      "mlConfidence": 0.95
    }
  ],
  "riskScore": 45.2,
  "complianceScore": 87.5,
  "predictions": [
    {
      "predictionType": "compliance_drift",
      "probability": 0.78,
      "timeframe": "7 days",
      "affectedResources": ["all"],
      "preventiveActions": [
        "Review recent infrastructure changes",
        "Enable automated compliance checks"
      ]
    }
  ],
  "recommendations": [
    "🚨 Address 1 critical violations immediately",
    "🤖 1 violations can be auto-remediated"
  ],
  "autoRemediationSuggestions": [
    {
      "actionId": "action_1733364123_0",
      "policyId": "pol_security_001",
      "actionType": "add",
      "description": "Auto-remediate: Database does not have encryption enabled",
      "impact": "high",
      "estimatedTime": 300,
      "autoExecutable": true,
      "code": "resource \"aws_db_instance\" \"main\" {\n  storage_encrypted = true\n  kms_key_id = aws_kms_key.database.arn\n}"
    }
  ]
}
```

### 3.2 Execute Auto-Remediation

**Endpoint**: `POST /api/pro/remediate/:actionId`

**Description**: Execute automated remediation action

**Response**:
```json
{
  "success": true,
  "message": "Remediation applied successfully"
}
```

### 3.3 Drift Detection

**Endpoint**: `POST /api/pro/drift/:resourceId`

**Request**:
```json
{
  "currentState": {
    "security_groups": ["sg-123"],
    "iam_roles": ["role-456"],
    "encryption": true
  }
}
```

**Response**:
```json
{
  "hasDrift": true,
  "driftPercentage": 35.2,
  "changedProperties": ["security_groups", "iam_roles"],
  "riskLevel": "high"
}
```

### 3.4 Get Pro Features

**Endpoint**: `GET /api/pro/features`

**Response**:
```json
{
  "features": [
    "AI-Powered Policy Prediction",
    "Real-time Compliance Monitoring",
    "Automated Remediation",
    "ML-Based Risk Scoring",
    "Drift Detection",
    ...
  ],
  "mlModels": [
    {
      "name": "risk_scorer",
      "type": "gradient_boosting",
      "accuracy": 0.93
    },
    ...
  ],
  "statistics": {
    "totalPolicies": 15,
    "complianceHistory": 342,
    "avgComplianceScore": 89.5
  }
}
```

---

## 4. Monitoring Service Pro APIs

### 4.1 Ingest Metrics

**Endpoint**: `POST /api/pro/metrics/:deploymentId`

**Request**:
```json
{
  "timestamp": "2025-12-04T10:00:00Z",
  "cpu": 65.4,
  "memory": 72.1,
  "disk": 45.8,
  "network": 1250.5,
  "responseTime": 245,
  "errorRate": 1.2,
  "requestsPerSecond": 850
}
```

**Response**:
```json
{
  "success": true,
  "anomaliesDetected": 0
}
```

**Events Emitted**:
- `anomalies:detected` - When anomalies are found
- `rca:completed` - Root cause analysis completed
- `sla:checked` - SLA status updated

### 4.2 Get Performance Forecast

**Endpoint**: `GET /api/pro/forecast/:deploymentId/:metric?periods=7`

**Response**:
```json
{
  "metric": "cpu",
  "current": 65.4,
  "forecast": [67.2, 69.1, 71.3, 73.8, 76.5, 79.2, 82.1],
  "timeframe": "7 days",
  "trend": "increasing",
  "willExceedThreshold": true,
  "estimatedDaysUntilThreshold": 5
}
```

### 4.3 Get Anomalies

**Endpoint**: `GET /api/pro/anomalies/:deploymentId`

**Response**:
```json
{
  "anomalies": [
    {
      "anomalyId": "anom_1733364123_cpu",
      "metric": "cpu",
      "value": 87.5,
      "expectedValue": 45.2,
      "deviation": 93.6,
      "severity": "high",
      "confidence": 0.92,
      "timestamp": "2025-12-04T10:15:00Z",
      "recommendation": "CPU usage 93.6% above normal. Consider scaling horizontally."
    }
  ]
}
```

### 4.4 Get Root Cause Analysis

**Endpoint**: `GET /api/pro/rca/:deploymentId/:anomalyId`

**Response**:
```json
{
  "issue": "Anomaly in errorRate: 8.5 (expected: 1.2)",
  "possibleCauses": [
    {
      "cause": "Application errors or dependency failures",
      "probability": 0.80,
      "evidence": [
        "Error rate spike detected",
        "608% above baseline"
      ]
    }
  ],
  "recommendations": [
    "Address: Application errors or dependency failures"
  ],
  "relatedMetrics": ["responseTime", "cpu"]
}
```

### 4.5 Get SLA Status

**Endpoint**: `GET /api/pro/sla/:deploymentId`

**Response**:
```json
{
  "slas": [
    {
      "slaId": "response_time",
      "name": "Response Time SLA",
      "target": 200,
      "current": 245,
      "status": "at-risk",
      "prediction": "will_violate",
      "confidence": 0.85
    }
  ]
}
```

### 4.6 Get Pro Features

**Endpoint**: `GET /api/pro/features`

**Response**:
```json
{
  "features": [
    "Predictive Anomaly Detection",
    "AI-Powered Root Cause Analysis",
    "Performance Forecasting",
    "SLA Tracking and Prediction",
    ...
  ],
  "mlModels": [
    {
      "name": "anomaly_detector",
      "algorithm": "isolation_forest",
      "accuracy": 0.94
    }
  ],
  "statistics": {
    "totalDeployments": 45,
    "totalMetrics": 125000,
    "totalAnomalies": 234
  }
}
```

---

## 5. Event-Driven Architecture

All Pro Agents support real-time events via WebSocket connections:

### Automation Engine Events

```javascript
socket.on('workflow:started', (data) => { ... });
socket.on('workflow:optimized', (data) => { ... });
socket.on('workflow:predictions', (data) => { ... });
socket.on('workflow:step_started', (data) => { ... });
socket.on('workflow:step_completed', (data) => { ... });
socket.on('workflow:self_healed', (data) => { ... });
socket.on('workflow:anomaly', (data) => { ... });
socket.on('workflow:completed', (data) => { ... });
```

### Guardrails Engine Events

```javascript
socket.on('evaluation:completed', (data) => { ... });
socket.on('remediation:completed', (data) => { ... });
```

### Monitoring Service Events

```javascript
socket.on('anomalies:detected', (data) => { ... });
socket.on('rca:completed', (data) => { ... });
socket.on('sla:checked', (data) => { ... });
```

---

## 6. Error Responses

All APIs follow standard HTTP status codes:

- **200 OK**: Successful request
- **202 Accepted**: Request accepted for processing
- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

**Error Response Format**:
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2025-12-04T10:00:00Z"
}
```

---

## 7. Authentication

All Pro APIs support JWT authentication via API Gateway:

**Header**:
```
Authorization: Bearer <jwt_token>
```

---

## 8. Rate Limiting

- **Standard**: 100 requests per minute
- **Pro Features**: 1000 requests per minute
- **ML Predictions**: 50 requests per minute

---

## 9. Pagination

For list endpoints, use query parameters:

```
?page=1&limit=50&sort=createdAt&order=desc
```

---

## 10. Monitoring & Metrics

All Pro APIs expose Prometheus metrics at `/metrics`:

- Request count
- Request duration
- Error rate
- ML model accuracy
- Active workflows
- Resource utilization

---

## Example: Complete Workflow

```bash
# 1. Analyze requirements with AI
curl -X POST http://localhost:8000/api/ai/analyze-advanced \
  -H "Content-Type: application/json" \
  -d '{"description": "E-commerce platform..."}'

# 2. Start Pro Automation workflow
curl -X POST http://localhost:3006/api/automation/pro/start \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {...},
    "automationLevel": 5,
    "aiOptimization": true,
    "selfHealing": true
  }'

# 3. Evaluate with Pro Guardrails
curl -X POST http://localhost:3003/api/pro/evaluate \
  -H "Content-Type: application/json" \
  -d '{"iacCode": "...", "environment": "production"}'

# 4. Start monitoring with Pro features
curl -X POST http://localhost:3007/api/pro/metrics/deployment_123 \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-12-04T10:00:00Z",
    "cpu": 65.4,
    "memory": 72.1,
    ...
  }'
```

---

**Documentation Version**: 1.0.0  
**Last Updated**: December 4, 2025
