# IAC Dharma v3.0 - API Reference Documentation

## 📋 Table of Contents
1. [API Gateway Endpoints](#api-gateway-endpoints)
2. [GraphQL API](#graphql-api)
3. [Service-Specific APIs](#service-specific-apis)
4. [Authentication & Authorization](#authentication--authorization)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## 🌐 API Gateway Endpoints

**Base URL**: `http://localhost:4000`

### Authentication Flow

```
┌──────────┐                                    ┌─────────────┐
│  Client  │                                    │ API Gateway │
└────┬─────┘                                    └──────┬──────┘
     │                                                 │
     │ 1. POST /api/auth/login                        │
     │    { username, password, device_id }           │
     ├───────────────────────────────────────────────►│
     │                                                 │
     │                                                 │ 2. Forward to
     │                                                 │    Zero Trust
     │                                                 ├──────────────┐
     │                                                 │              │
     │                                                 │◄─────────────┘
     │                                                 │ 3. Trust Score
     │                                                 │    Calculation
     │ 4. Return JWT + Session                        │
     │◄───────────────────────────────────────────────┤
     │ { access_token, expires_in: 900 }              │
     │                                                 │
     │ 5. Use JWT for subsequent requests             │
     │    Header: Authorization: Bearer <token>       │
     ├───────────────────────────────────────────────►│
     │                                                 │
```

### Core Endpoints

#### 1. Health Check
```http
GET /health
```

**Response**: 200 OK
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "services": {
    "postgresql": "connected",
    "redis": "connected",
    "aiops_engine": "connected"
  },
  "timestamp": "2025-12-08T01:00:00Z"
}
```

---

## 🔐 Zero Trust Security API

**Base URL**: `http://localhost:4000/api/zero-trust/` or `http://localhost:8500/api/v3/zero-trust/`

### 1. Verify Access

```http
POST /api/zero-trust/verify
Content-Type: application/json
```

**Request Body**:
```json
{
  "user_id": "string",
  "resource": "string",
  "action": "string",
  "source_ip": "string",
  "device_id": "string",
  "device_posture": {
    "device_id": "string",
    "os": "string",
    "os_version": "string",
    "security_patch_level": "string",
    "encrypted": boolean,
    "firewall_enabled": boolean,
    "antivirus_enabled": boolean,
    "compliance_score": number (0-100)
  },
  "context": {
    "location": "string",
    "time": "string"
  }
}
```

**Response**: 200 OK
```json
{
  "decision": "allow|deny|challenge",
  "trust_score": {
    "overall_score": 88.05,
    "trust_level": "high",
    "breakdown": {
      "device_trust": 98.0,
      "user_trust": 100.0,
      "context_trust": 55.0
    }
  },
  "policy_evaluation": {
    "decision": "allow",
    "reason": "All policy requirements met",
    "policy_id": "pol_001",
    "evaluation_details": ["..."]
  },
  "user_context": {
    "user_id": "admin_user_001",
    "roles": ["admin", "developer"],
    "mfa_enabled": true
  },
  "timestamp": "2025-12-08T01:27:42.114553"
}
```

### 2. Authenticate User

```http
POST /api/zero-trust/authenticate
```

**Query Parameters**:
- `username`: string (required)
- `password`: string (required)
- `device_id`: string (required)
- `mfa_code`: string (optional)

**Response**: 200 OK
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "session_id": "uuid",
  "requires_reverification_in": 15
}
```

**Response**: 401 Unauthorized (MFA Required)
```json
{
  "status": "mfa_required",
  "message": "Multi-factor authentication code required",
  "mfa_methods": ["totp", "sms", "push"]
}
```

### 3. List Policies

```http
GET /api/zero-trust/policies
```

**Response**: 200 OK
```json
{
  "policies": [
    {
      "rule_id": "pol_001",
      "name": "Production Database Access",
      "resource_pattern": "database/production/*",
      "required_roles": ["admin", "dba"],
      "required_trust_level": "high",
      "action": "allow"
    }
  ],
  "total": 3
}
```

### 4. Create Policy

```http
POST /api/zero-trust/policies
Content-Type: application/json
```

**Request Body**:
```json
{
  "rule_id": "pol_custom_001",
  "name": "Custom Access Policy",
  "resource_pattern": "api/custom/*",
  "required_roles": ["custom_role"],
  "required_trust_level": "medium",
  "conditions": {
    "mfa_required": true,
    "device_compliance_min": 80
  },
  "action": "allow"
}
```

**Response**: 201 Created
```json
{
  "status": "created",
  "policy": { ...policy object },
  "total_policies": 4
}
```

### 5. Get Trust Score

```http
GET /api/zero-trust/trust-score/{user_id}
```

**Response**: 200 OK
```json
{
  "user_id": "admin_user_001",
  "trust_score": 85.5,
  "trust_level": "high",
  "last_updated": "2025-12-08T01:27:42.156122"
}
```

### 6. Get Audit Log

```http
GET /api/zero-trust/audit?limit=100
```

**Query Parameters**:
- `limit`: number (optional, default: 100)

**Response**: 200 OK
```json
{
  "entries": [
    {
      "timestamp": "2025-12-08T01:27:42.114546",
      "user_id": "admin_user_001",
      "resource": "database/production/customer_db",
      "action": "read",
      "decision": "allow",
      "trust_score": 88.05,
      "source_ip": "10.0.1.50",
      "device_id": "device_12345"
    }
  ],
  "total_entries": 100,
  "limit": 100
}
```

### 7. Get Active Sessions

```http
GET /api/zero-trust/sessions/active
```

**Response**: 200 OK
```json
{
  "active_sessions": [
    {
      "user_id": "test_user",
      "device_id": "device_12345",
      "created_at": "2025-12-08T01:27:42.156122",
      "last_verified": "2025-12-08T01:27:42.156128"
    }
  ],
  "total": 1
}
```

---

## 🤖 AI Orchestrator API

**Base URL**: `http://localhost:8300/api/v3/ai-orchestrator/`

### 1. Process Natural Language Query

```http
POST /query
Content-Type: application/json
```

**Request Body**:
```json
{
  "query": "Deploy 3 web servers with load balancer in AWS us-east-1",
  "context": {
    "user_id": "string",
    "project_id": "string",
    "preferences": {}
  }
}
```

**Response**: 200 OK
```json
{
  "query_id": "uuid",
  "intent": {
    "action": "deploy",
    "resource_type": ["compute", "networking"],
    "confidence": 0.95
  },
  "entities": [
    { "type": "infrastructure", "value": "web servers", "count": 3 },
    { "type": "infrastructure", "value": "load balancer" },
    { "type": "cloud_provider", "value": "AWS" },
    { "type": "region", "value": "us-east-1" }
  ],
  "generated_code": {
    "language": "terraform",
    "code": "resource \"aws_instance\" \"web\" {...}",
    "validated": true
  },
  "cost_estimate": {
    "monthly": 101.80,
    "currency": "USD",
    "breakdown": [...]
  },
  "execution_plan": "terraform plan output...",
  "recommendations": ["Use t3.medium for better performance"],
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 2. Get Conversation History

```http
GET /conversations/{user_id}
```

**Response**: 200 OK
```json
{
  "user_id": "string",
  "conversations": [
    {
      "conversation_id": "uuid",
      "started_at": "2025-12-08T01:00:00Z",
      "messages": [
        {
          "role": "user",
          "content": "Deploy 3 web servers",
          "timestamp": "2025-12-08T01:00:00Z"
        },
        {
          "role": "assistant",
          "content": "I'll help you deploy 3 web servers...",
          "timestamp": "2025-12-08T01:00:05Z"
        }
      ]
    }
  ]
}
```

---

## 🧠 AIOps Engine API

**Base URL**: `http://localhost:8100/api/v3/ml/`

### 1. Cost Prediction

```http
POST /cost/predict
Content-Type: application/json
```

**Request Body**:
```json
{
  "days": 30,
  "resource_types": ["compute", "storage", "network"],
  "include_confidence": true
}
```

**Response**: 200 OK
```json
{
  "predictions": {
    "daily": [
      { "date": "2025-12-09", "cost": 150.20, "confidence": 0.92 },
      { "date": "2025-12-10", "cost": 152.80, "confidence": 0.91 }
    ],
    "monthly_total": 4567.89,
    "confidence": 0.92
  },
  "insights": {
    "trend": "increasing",
    "trend_percentage": 2.3,
    "anomalies": [],
    "peak_days": [15, 28]
  },
  "recommendations": [
    {
      "action": "right_size",
      "resources": ["i-123456"],
      "potential_savings": 230.00
    }
  ],
  "potential_savings": 755.00,
  "model_version": "v2.0",
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 2. Drift Detection

```http
POST /drift/detect
Content-Type: application/json
```

**Request Body**:
```json
{
  "infrastructure_id": "string",
  "check_type": "all|config|resource|security"
}
```

**Response**: 200 OK
```json
{
  "drift_detected": true,
  "drift_score": 0.75,
  "changes": [
    {
      "resource": "aws_instance.web-01",
      "property": "instance_type",
      "expected": "t3.medium",
      "actual": "t3.large",
      "severity": "medium",
      "recommendation": "Update configuration or apply changes"
    }
  ],
  "total_changes": 5,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 3. Resource Optimization

```http
POST /resource/optimize
Content-Type: application/json
```

**Request Body**:
```json
{
  "resource_ids": ["i-123456", "i-789012"],
  "optimization_goals": ["cost", "performance"],
  "constraints": {
    "max_downtime_minutes": 30,
    "min_performance_level": 0.8
  }
}
```

**Response**: 200 OK
```json
{
  "recommendations": [
    {
      "resource_id": "i-123456",
      "current_config": {
        "instance_type": "t3.xlarge",
        "cpu_utilization": 15,
        "memory_utilization": 20
      },
      "recommended_config": {
        "instance_type": "t3.medium",
        "expected_cpu_utilization": 45,
        "expected_memory_utilization": 60
      },
      "impact": {
        "cost_savings_monthly": 145.00,
        "performance_change": -5,
        "downtime_required": 15
      },
      "confidence": 0.89
    }
  ],
  "total_potential_savings": 345.00,
  "total_resources_analyzed": 2,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 4. Performance Optimization

```http
POST /performance/optimize
Content-Type: application/json
```

**Request Body**:
```json
{
  "application_id": "string",
  "metrics": {
    "response_time_ms": 450,
    "throughput_rps": 100,
    "error_rate": 0.05
  },
  "targets": {
    "response_time_ms": 200,
    "throughput_rps": 200,
    "error_rate": 0.01
  }
}
```

**Response**: 200 OK
```json
{
  "current_grade": "C",
  "target_grade": "A",
  "optimizations": [
    {
      "category": "caching",
      "recommendation": "Implement Redis caching for frequently accessed data",
      "expected_improvement": {
        "response_time_reduction": 40,
        "cost_increase": 15.00
      },
      "priority": "high",
      "implementation_effort": "medium"
    }
  ],
  "expected_outcomes": {
    "response_time_ms": 180,
    "throughput_rps": 220,
    "error_rate": 0.008
  },
  "estimated_cost_change": 45.00,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 5. Compliance Prediction

```http
POST /compliance/predict
Content-Type: application/json
```

**Request Body**:
```json
{
  "infrastructure_id": "string",
  "compliance_frameworks": ["SOC2", "HIPAA", "GDPR"]
}
```

**Response**: 200 OK
```json
{
  "overall_score": 75,
  "framework_scores": {
    "SOC2": 85,
    "HIPAA": 70,
    "GDPR": 80
  },
  "violations": [
    {
      "framework": "HIPAA",
      "rule": "Encryption at rest required",
      "resource": "s3-bucket-medical-data",
      "severity": "critical",
      "remediation": "Enable S3 bucket encryption"
    }
  ],
  "recommendations": [
    "Enable encryption on 3 S3 buckets",
    "Implement audit logging for database access",
    "Add MFA for all admin accounts"
  ],
  "estimated_remediation_time_hours": 8,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 6. Incident Classification

```http
POST /incident/classify
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "High CPU usage on production server",
  "description": "Server experiencing 95% CPU utilization",
  "metrics": {
    "cpu_percent": 95,
    "memory_percent": 60,
    "disk_io": 1000
  },
  "logs": ["Recent log entries..."]
}
```

**Response**: 200 OK
```json
{
  "classification": {
    "category": "performance",
    "severity": "P1",
    "confidence": 0.92
  },
  "suggested_priority": "critical",
  "estimated_impact": {
    "users_affected": 5000,
    "revenue_at_risk": 10000.00,
    "sla_breach": true
  },
  "similar_incidents": [
    {
      "incident_id": "INC-2024-001",
      "similarity": 0.85,
      "resolution": "Restarted service, added resource limits"
    }
  ],
  "recommended_actions": [
    "Investigate runaway process",
    "Scale horizontally",
    "Enable CPU throttling"
  ],
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 7. Root Cause Analysis

```http
POST /rootcause/analyze
Content-Type: application/json
```

**Request Body**:
```json
{
  "incident_id": "string",
  "symptoms": ["high latency", "connection timeouts"],
  "affected_services": ["api-gateway", "database"],
  "time_range": {
    "start": "2025-12-08T00:00:00Z",
    "end": "2025-12-08T01:00:00Z"
  }
}
```

**Response**: 200 OK
```json
{
  "root_causes": [
    {
      "cause": "Database connection pool exhaustion",
      "confidence": 0.87,
      "evidence": [
        "Connection pool size: 100/100",
        "Wait time increasing over time",
        "No database errors logged"
      ],
      "contributing_factors": [
        "Increased traffic (2x normal)",
        "Long-running queries detected"
      ]
    }
  ],
  "timeline": [
    {
      "timestamp": "2025-12-08T00:30:00Z",
      "event": "Traffic spike detected",
      "impact": "Connection pool filling up"
    }
  ],
  "recommendations": [
    {
      "action": "Increase connection pool size to 200",
      "expected_resolution_time": 15,
      "risk": "low"
    }
  ],
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 8. Churn Prediction

```http
POST /churn/predict
Content-Type: application/json
```

**Request Body**:
```json
{
  "customer_ids": ["cust_123", "cust_456"],
  "prediction_horizon_days": 30
}
```

**Response**: 200 OK
```json
{
  "predictions": [
    {
      "customer_id": "cust_123",
      "churn_probability": 0.75,
      "risk_level": "high",
      "key_factors": [
        "Decreased usage (50% reduction)",
        "Support tickets increasing",
        "No purchases in 60 days"
      ],
      "recommended_actions": [
        "Reach out with personalized offer",
        "Schedule success manager call",
        "Provide usage optimization guidance"
      ],
      "estimated_value_at_risk": 5000.00
    }
  ],
  "total_customers_analyzed": 2,
  "high_risk_count": 1,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

---

## 🏥 Self-Healing API

**Base URL**: `http://localhost:8400/api/v3/self-healing/`

### 1. Get System Health

```http
GET /health/status
```

**Response**: 200 OK
```json
{
  "overall_health": "healthy",
  "services": [
    {
      "name": "api-gateway",
      "status": "healthy",
      "uptime_seconds": 86400,
      "last_check": "2025-12-08T01:00:00Z"
    }
  ],
  "active_issues": 0,
  "recent_remediations": 5,
  "auto_heal_enabled": true,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 2. Trigger Remediation

```http
POST /remediate
Content-Type: application/json
```

**Request Body**:
```json
{
  "resource_id": "string",
  "issue_type": "high_memory|high_cpu|service_down|connection_error",
  "severity": "low|medium|high|critical",
  "auto_execute": boolean
}
```

**Response**: 202 Accepted
```json
{
  "remediation_id": "uuid",
  "status": "in_progress",
  "strategy": "restart_service",
  "estimated_completion_seconds": 30,
  "steps": [
    "Create snapshot",
    "Restart service",
    "Verify health",
    "Monitor for 5 minutes"
  ],
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 3. Get Remediation Status

```http
GET /remediate/{remediation_id}
```

**Response**: 200 OK
```json
{
  "remediation_id": "uuid",
  "status": "completed|in_progress|failed",
  "progress_percent": 100,
  "steps_completed": [
    {
      "step": "Create snapshot",
      "status": "completed",
      "timestamp": "2025-12-08T01:00:00Z"
    }
  ],
  "result": {
    "success": true,
    "issue_resolved": true,
    "health_status": "healthy"
  },
  "duration_seconds": 45,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

---

## 🎭 Chaos Engineering API

**Base URL**: `http://localhost:8700/api/v3/chaos/`

### 1. Create Experiment

```http
POST /experiments
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "API Gateway Latency Test",
  "description": "Test system behavior under increased latency",
  "target": {
    "service": "api-gateway",
    "scope": "single_instance"
  },
  "fault_type": "latency|cpu_stress|memory_stress|network_loss|pod_kill",
  "parameters": {
    "latency_ms": 500,
    "duration_seconds": 300
  },
  "hypothesis": "System should maintain <1s response time",
  "abort_conditions": [
    "error_rate > 5%",
    "response_time > 2s"
  ]
}
```

**Response**: 201 Created
```json
{
  "experiment_id": "uuid",
  "status": "scheduled",
  "start_time": "2025-12-08T02:00:00Z",
  "estimated_duration_seconds": 300,
  "safety_checks_enabled": true,
  "monitoring_dashboard_url": "http://grafana:3000/d/chaos/experiment-uuid"
}
```

### 2. Get Experiment Results

```http
GET /experiments/{experiment_id}
```

**Response**: 200 OK
```json
{
  "experiment_id": "uuid",
  "status": "completed",
  "results": {
    "hypothesis_validated": false,
    "metrics": {
      "avg_response_time_ms": 1250,
      "max_response_time_ms": 2100,
      "error_rate": 0.03,
      "throughput_reduction": 15
    },
    "issues_discovered": [
      "Response time exceeded 2s threshold",
      "Downstream service timeout"
    ],
    "recommendations": [
      "Increase timeout configuration",
      "Add circuit breaker pattern",
      "Implement request queuing"
    ]
  },
  "duration_seconds": 305,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

---

## 📊 Observability API

**Base URL**: `http://localhost:8800/api/v3/observability/`

### 1. Get Dashboard Data

```http
GET /dashboard
```

**Response**: 200 OK
```json
{
  "overview": {
    "total_services": 20,
    "healthy_services": 18,
    "degraded_services": 2,
    "down_services": 0
  },
  "metrics": {
    "cpu_usage_percent": 45,
    "memory_usage_percent": 60,
    "disk_usage_percent": 55,
    "network_throughput_mbps": 150
  },
  "recent_alerts": [
    {
      "severity": "warning",
      "service": "self-healing-engine",
      "message": "High memory usage detected",
      "timestamp": "2025-12-08T00:55:00Z"
    }
  ],
  "performance": {
    "requests_per_second": 1500,
    "avg_response_time_ms": 45,
    "error_rate": 0.002
  },
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 2. Query Metrics

```http
POST /metrics/query
Content-Type: application/json
```

**Request Body**:
```json
{
  "query": "rate(http_requests_total[5m])",
  "start": "2025-12-08T00:00:00Z",
  "end": "2025-12-08T01:00:00Z",
  "step": "60s"
}
```

**Response**: 200 OK
```json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": {
          "service": "api-gateway",
          "status": "200"
        },
        "values": [
          [1701993600, "150.5"],
          [1701993660, "155.2"]
        ]
      }
    ]
  }
}
```

---

## 💰 Cost Optimizer API

**Base URL**: `http://localhost:8900/api/v3/cost-optimizer/`

### 1. Get Cost Analysis

```http
GET /analysis
```

**Response**: 200 OK
```json
{
  "current_month": {
    "total_cost": 12450.00,
    "daily_average": 415.00,
    "breakdown": {
      "compute": 7500.00,
      "storage": 2000.00,
      "network": 1500.00,
      "database": 1450.00
    }
  },
  "trend": {
    "direction": "increasing",
    "percentage": 8.5
  },
  "optimization_potential": 2150.00,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

### 2. Get Recommendations

```http
GET /recommendations?min_savings=50
```

**Query Parameters**:
- `min_savings`: number (optional, default: 50)

**Response**: 200 OK
```json
{
  "recommendations": [
    {
      "id": "rec_001",
      "type": "right_sizing",
      "resource": "i-123456",
      "current_cost_monthly": 150.00,
      "recommended_cost_monthly": 75.00,
      "savings_monthly": 75.00,
      "impact": "low",
      "effort": "low",
      "details": "Instance is over-provisioned. CPU avg: 15%"
    }
  ],
  "total_potential_savings": 2150.00,
  "total_recommendations": 15,
  "timestamp": "2025-12-08T01:00:00Z"
}
```

---

## 🗄️ CMDB Agent API

**Base URL**: `http://localhost:8200/api/v3/cmdb/`

### 1. Query Assets

```http
POST /assets/query
Content-Type: application/json
```

**Request Body**:
```json
{
  "filters": {
    "type": "compute",
    "provider": "aws",
    "status": "active"
  },
  "include_relationships": true,
  "limit": 100
}
```

**Response**: 200 OK
```json
{
  "assets": [
    {
      "id": "asset_001",
      "type": "compute",
      "name": "web-server-01",
      "provider": "aws",
      "region": "us-east-1",
      "status": "active",
      "properties": {
        "instance_type": "t3.medium",
        "public_ip": "54.123.45.67",
        "private_ip": "10.0.1.10"
      },
      "relationships": [
        {
          "type": "depends_on",
          "target": "asset_002",
          "target_name": "database-01"
        }
      ],
      "tags": {
        "environment": "production",
        "team": "platform"
      },
      "created_at": "2025-12-01T00:00:00Z",
      "updated_at": "2025-12-08T01:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 100
}
```

---

## 🔒 Error Handling

### Standard Error Response

All APIs return errors in a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "request_id": "uuid",
    "timestamp": "2025-12-08T01:00:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 202 | Accepted | Async operation started |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily down |

---

## ⚡ Rate Limiting

### Default Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| Read operations | 1000 requests | 1 minute |
| Write operations | 100 requests | 1 minute |
| ML predictions | 60 requests | 1 minute |

### Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1701993660
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 60 seconds",
    "retry_after": 60,
    "limit": 1000,
    "window": 60
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: December 8, 2025  
**API Version**: v3.0
