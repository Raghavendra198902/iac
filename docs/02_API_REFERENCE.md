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

## 🚀 Advanced API Patterns

### 1. Pagination Strategies

#### Cursor-Based Pagination (Recommended)

**Why Cursor-Based?**
- Consistent results (no skipped/duplicate items)
- Efficient for large datasets
- Works with real-time data

```http
GET /api/infrastructure?limit=20&cursor=eyJpZCI6MTIzLCJ0aW1lc3RhbXAiOjE3MDE5OTM2NjB9
```

**Response**:
```json
{
  "data": [
    { "id": "infra-124", "name": "web-server", ... },
    { "id": "infra-125", "name": "database", ... }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6MTQ0LCJ0aW1lc3RhbXAiOjE3MDE5OTM3MjB9",
    "prev_cursor": "eyJpZCI6MTAzLCJ0aW1lc3RhbXAiOjE3MDE5OTM2MDB9",
    "has_more": true,
    "count": 20
  },
  "meta": {
    "total_count": 1520,
    "request_id": "req-abc123"
  }
}
```

#### Offset-Based Pagination (Simple Queries)

```http
GET /api/infrastructure?limit=20&offset=40
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 40,
    "total": 1520,
    "page": 3,
    "pages": 76
  }
}
```

### 2. Filtering and Sorting

#### Complex Filtering with Query DSL

```http
POST /api/infrastructure/search
Content-Type: application/json

{
  "filter": {
    "and": [
      { "field": "provider", "operator": "eq", "value": "aws" },
      { "field": "status", "operator": "in", "value": ["running", "healthy"] },
      {
        "or": [
          { "field": "cost", "operator": "gt", "value": 100 },
          { "field": "tag", "operator": "contains", "value": "production" }
        ]
      }
    ]
  },
  "sort": [
    { "field": "cost", "direction": "desc" },
    { "field": "created_at", "direction": "asc" }
  ],
  "pagination": {
    "cursor": "...",
    "limit": 50
  },
  "include": ["resources", "metrics", "cost_breakdown"]
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "infra-123",
      "provider": "aws",
      "status": "running",
      "cost": 450.50,
      "resources": [...],
      "metrics": {...},
      "cost_breakdown": {...}
    }
  ],
  "pagination": {...},
  "query_performance": {
    "execution_time_ms": 45,
    "scanned_records": 1520,
    "returned_records": 50,
    "cache_hit": false
  }
}
```

#### Simple Query Parameterssafe

```http
GET /api/infrastructure?provider=aws&status=running&cost_gt=100&sort=-cost,created_at&limit=50
```

**Query Operators**:
- `field_eq`: Equal
- `field_ne`: Not equal
- `field_gt`: Greater than
- `field_gte`: Greater than or equal
- `field_lt`: Less than
- `field_lte`: Less than or equal
- `field_in`: In array
- `field_contains`: Contains substring
- `field_starts`: Starts with
- `field_ends`: Ends with

### 3. Batch Operations

#### Batch Create/Update

```http
POST /api/infrastructure/batch
Content-Type: application/json

{
  "operations": [
    {
      "operation": "create",
      "resource_type": "ec2_instance",
      "data": {
        "name": "web-server-1",
        "instance_type": "t3.medium",
        "ami": "ami-12345678"
      }
    },
    {
      "operation": "update",
      "resource_id": "infra-456",
      "data": {
        "tags": { "environment": "production" }
      }
    },
    {
      "operation": "delete",
      "resource_id": "infra-789"
    }
  ],
  "transaction": true,
  "async": true
}
```

**Synchronous Response** (transaction: false, async: false):
```json
{
  "results": [
    { "index": 0, "status": "success", "resource_id": "infra-999" },
    { "index": 1, "status": "success", "resource_id": "infra-456" },
    { "index": 2, "status": "error", "error": "Resource not found" }
  ],
  "summary": {
    "total": 3,
    "succeeded": 2,
    "failed": 1
  }
}
```

**Asynchronous Response** (async: true):
```json
{
  "job_id": "job-abc123",
  "status": "queued",
  "total_operations": 3,
  "status_url": "/api/jobs/job-abc123",
  "webhook_url": "https://your-domain.com/webhook"
}
```

### 4. Webhooks

#### Register Webhook

```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": [
    "infrastructure.created",
    "infrastructure.updated",
    "infrastructure.deleted",
    "deployment.completed",
    "deployment.failed",
    "alert.triggered"
  ],
  "filters": {
    "provider": ["aws", "azure"],
    "cost_threshold": 1000
  },
  "secret": "your-webhook-secret",
  "active": true
}
```

**Response**:
```json
{
  "webhook_id": "hook-123",
  "url": "https://your-domain.com/webhook",
  "events": [...],
  "secret": "your-webhook-secret",
  "created_at": "2025-12-08T12:00:00Z",
  "status": "active"
}
```

#### Webhook Payload Example

```json
{
  "event_id": "evt-abc123",
  "event_type": "infrastructure.created",
  "timestamp": "2025-12-08T12:00:00Z",
  "data": {
    "infrastructure_id": "infra-123",
    "provider": "aws",
    "region": "us-east-1",
    "resources": [...],
    "cost": 150.50,
    "user_id": "user-456"
  },
  "webhook_id": "hook-123"
}
```

**Webhook Signature** (HMAC-SHA256):
```http
X-IAC-Signature: sha256=5f2b8c9d1e3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r
X-IAC-Event-Type: infrastructure.created
X-IAC-Event-ID: evt-abc123
X-IAC-Timestamp: 1701993660
```

**Verify Signature** (Python):
```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

### 5. API Versioning

#### URL Versioning (Current)

```http
GET /api/v3/infrastructure
GET /api/v2/infrastructure  # Legacy support
```

#### Header Versioning (Future)

```http
GET /api/infrastructure
Accept: application/vnd.iac-dharma.v3+json
```

#### Version Deprecation Notice

```json
{
  "data": {...},
  "warnings": [
    {
      "code": "DEPRECATED_API",
      "message": "API v2 will be deprecated on 2026-06-01",
      "migration_guide": "https://docs.iac-dharma.io/migration/v2-to-v3"
    }
  ]
}
```

### 6. GraphQL Advanced Patterns

#### Query Complexity Limiting

```graphql
query ComplexQuery {
  infrastructure(limit: 100) {
    id
    name
    resources {
      id
      metrics {
        cpu
        memory
      }
    }
  }
}
```

**Complexity Calculation**:
- Base: 1 point per field
- List field: × items requested
- Nested: Additional multiplier
- **Example**: 100 infrastructure × 10 resources × 2 metrics = 2,000 points
- **Limit**: 5,000 points per query

**Exceeded Response**:
```json
{
  "errors": [
    {
      "message": "Query complexity 6200 exceeds maximum 5000",
      "extensions": {
        "code": "QUERY_TOO_COMPLEX",
        "complexity": 6200,
        "limit": 5000,
        "suggestion": "Reduce limit or remove nested fields"
      }
    }
  ]
}
```

#### Batched Queries (DataLoader Pattern)

```graphql
query BatchedQuery {
  user1: user(id: "user-1") { name, email }
  user2: user(id: "user-2") { name, email }
  user3: user(id: "user-3") { name, email }
}
```

**Optimization**:
- Without DataLoader: 3 separate database queries
- With DataLoader: 1 batched query
- Performance improvement: ~70% faster

#### Subscriptions for Real-Time Updates

```graphql
subscription DeploymentProgress {
  deploymentStatus(deploymentId: "deploy-123") {
    id
    status
    progress
    logs {
      timestamp
      message
      level
    }
  }
}
```

**WebSocket Connection**:
```javascript
const ws = new WebSocket('ws://localhost:4000/graphql');
ws.send(JSON.stringify({
  type: 'subscribe',
  query: `subscription { ... }`
}));
```

### 7. Idempotency Keys

#### POST with Idempotency

```http
POST /api/infrastructure
Content-Type: application/json
Idempotency-Key: unique-key-12345

{
  "name": "web-server",
  "provider": "aws",
  "instance_type": "t3.medium"
}
```

**First Request**:
```json
{
  "id": "infra-123",
  "status": "created",
  "idempotency_key": "unique-key-12345"
}
```

**Duplicate Request** (within 24 hours):
```json
{
  "id": "infra-123",
  "status": "created",
  "idempotency_key": "unique-key-12345",
  "replayed": true
}
```

**Benefits**:
- Prevents duplicate operations
- Safe retries after network failures
- Consistent responses

### 8. Field Selection (Sparse Fieldsets)

#### Select Specific Fields

```http
GET /api/infrastructure/infra-123?fields=id,name,status,cost
```

**Response** (only requested fields):
```json
{
  "id": "infra-123",
  "name": "web-server",
  "status": "running",
  "cost": 150.50
}
```

#### Include Related Resources

```http
GET /api/infrastructure/infra-123?include=resources,metrics,cost_breakdown
```

**Response**:
```json
{
  "id": "infra-123",
  "name": "web-server",
  "resources": [...],
  "metrics": {...},
  "cost_breakdown": {...}
}
```

### 9. ETags and Conditional Requests

#### GET with ETag

```http
GET /api/infrastructure/infra-123
```

**Response**:
```http
HTTP/1.1 200 OK
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Content-Type: application/json

{ "id": "infra-123", ... }
```

#### Conditional GET (Not Modified)

```http
GET /api/infrastructure/infra-123
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

**Response** (if not modified):
```http
HTTP/1.1 304 Not Modified
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

#### Conditional UPDATE (Optimistic Locking)

```http
PUT /api/infrastructure/infra-123
If-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Content-Type: application/json

{ "name": "updated-name" }
```

**Conflict Response**:
```json
{
  "error": {
    "code": "PRECONDITION_FAILED",
    "message": "Resource was modified by another request",
    "current_etag": "4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v"
  }
}
```

### 10. Long-Running Operations

#### Async Operation Pattern

```http
POST /api/infrastructure/deploy
Content-Type: application/json
Prefer: respond-async

{
  "template": "...",
  "parameters": {...}
}
```

**Response** (202 Accepted):
```http
HTTP/1.1 202 Accepted
Location: /api/jobs/job-abc123
Content-Type: application/json

{
  "job_id": "job-abc123",
  "status": "queued",
  "status_url": "/api/jobs/job-abc123",
  "estimated_duration": 300
}
```

#### Poll Job Status

```http
GET /api/jobs/job-abc123
```

**In Progress**:
```json
{
  "job_id": "job-abc123",
  "status": "running",
  "progress": 45,
  "started_at": "2025-12-08T12:00:00Z",
  "estimated_completion": "2025-12-08T12:05:00Z"
}
```

**Completed**:
```json
{
  "job_id": "job-abc123",
  "status": "completed",
  "progress": 100,
  "result": {
    "infrastructure_id": "infra-123",
    "resources_created": 5
  },
  "started_at": "2025-12-08T12:00:00Z",
  "completed_at": "2025-12-08T12:04:30Z"
}
```

---

## 🔐 OAuth 2.0 Flows (Detailed)

### Authorization Code Flow (Web Apps)

```
┌────────┐                               ┌───────────┐
│ Client │                               │   Auth    │
│  App   │                               │  Server   │
└───┬────┘                               └─────┬─────┘
    │                                          │
    │ 1. Redirect to /oauth/authorize         │
    ├─────────────────────────────────────────►│
    │                                          │
    │ 2. User authenticates                    │
    │                                          │
    │ 3. Redirect with authorization code      │
    │◄─────────────────────────────────────────┤
    │                                          │
    │ 4. POST /oauth/token                     │
    │    (code + client_secret)                │
    ├─────────────────────────────────────────►│
    │                                          │
    │ 5. Return access_token + refresh_token   │
    │◄─────────────────────────────────────────┤
    │                                          │
```

**Step 1: Authorization Request**
```http
GET /oauth/authorize?
  response_type=code&
  client_id=your-client-id&
  redirect_uri=https://your-app.com/callback&
  scope=infrastructure.read infrastructure.write&
  state=random-state-string
```

**Step 3: Callback with Code**
```http
https://your-app.com/callback?
  code=AUTH_CODE_HERE&
  state=random-state-string
```

**Step 4: Token Exchange**
```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE_HERE&
client_id=your-client-id&
client_secret=your-client-secret&
redirect_uri=https://your-app.com/callback
```

**Step 5: Token Response**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def502003abc123...",
  "scope": "infrastructure.read infrastructure.write"
}
```

### Client Credentials Flow (Machine-to-Machine)

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id=your-client-id&
client_secret=your-client-secret&
scope=infrastructure.read
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "infrastructure.read"
}
```

### Refresh Token Flow

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=def502003abc123...&
client_id=your-client-id&
client_secret=your-client-secret
```

---

## 📊 API Performance Best Practices

### 1. Response Compression

**Request**:
```http
GET /api/infrastructure
Accept-Encoding: gzip, deflate, br
```

**Response**:
```http
HTTP/1.1 200 OK
Content-Encoding: gzip
Content-Length: 15230
```

**Savings**: 70-90% reduction in payload size

### 2. Conditional Requests (304 Not Modified)

**Bandwidth Saved**: ~95% on unchanged resources

### 3. Connection Pooling

**Client Configuration**:
```javascript
// Node.js
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 50
});

// Python
import requests
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(pool_maxsize=50)
session.mount('http://', adapter)
```

### 4. Request Timeouts

**Recommended Values**:
```
Connection timeout: 5 seconds
Read timeout: 30 seconds
Total timeout: 60 seconds
```

### 5. Circuit Breaker Implementation

**Client-Side Protection**:
```python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
def call_api():
    return requests.get('http://api-gateway:4000/api/health')
```

---

**Document Version**: 2.0 (Advanced Edition)  
**Last Updated**: December 8, 2025  
**API Version**: v3.0
