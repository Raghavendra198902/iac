# API Reference

Complete API documentation for IAC Dharma platform.

---

## Base URL

```
http://localhost:3000/api
```

**Production**: `https://api.iac-dharma.com/api`

---

## Authentication

### Overview

IAC Dharma uses **JWT (JSON Web Tokens)** for authentication with OAuth 2.0 support.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### Using Access Tokens

Include the access token in the `Authorization` header:

```http
GET /blueprints
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

---

## Blueprints API

### List Blueprints

```http
GET /blueprints?page=1&limit=20&provider=aws
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `provider` (optional): Filter by provider (`aws`, `azure`, `gcp`)
- `tags` (optional): Filter by tags (comma-separated)

**Response**:
```json
{
  "data": [
    {
      "id": "blueprint-uuid",
      "name": "Production VPC",
      "version": "1.0.0",
      "provider": "aws",
      "resources": [...],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Get Blueprint

```http
GET /blueprints/:id
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": "blueprint-uuid",
  "name": "Production VPC",
  "version": "1.0.0",
  "provider": "aws",
  "resources": [
    {
      "id": "resource-1",
      "type": "aws_vpc",
      "properties": {
        "cidr_block": "10.0.0.0/16",
        "enable_dns_hostnames": true,
        "enable_dns_support": true,
        "tags": {
          "Name": "production-vpc"
        }
      }
    }
  ],
  "variables": [
    {
      "name": "region",
      "type": "string",
      "default": "us-east-1"
    }
  ],
  "outputs": [
    {
      "name": "vpc_id",
      "value": "${aws_vpc.main.id}"
    }
  ],
  "metadata": {
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "tags": ["production", "networking"]
  }
}
```

### Create Blueprint

```http
POST /blueprints
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Production VPC",
  "version": "1.0.0",
  "provider": "aws",
  "resources": [
    {
      "type": "aws_vpc",
      "properties": {
        "cidr_block": "10.0.0.0/16",
        "enable_dns_hostnames": true
      }
    }
  ],
  "variables": [
    {
      "name": "region",
      "type": "string",
      "default": "us-east-1"
    }
  ]
}
```

**Response**: `201 Created`
```json
{
  "id": "blueprint-uuid",
  "name": "Production VPC",
  "version": "1.0.0",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Update Blueprint

```http
PUT /blueprints/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated VPC",
  "resources": [...]
}
```

**Response**: `200 OK`

### Delete Blueprint

```http
DELETE /blueprints/:id
Authorization: Bearer {token}
```

**Response**: `204 No Content`

### Validate Blueprint

```http
POST /blueprints/:id/validate
Authorization: Bearer {token}
```

**Response**:
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Resource 'aws_subnet' should have explicit availability zone"
  ]
}
```

---

## IAC Generation API

### Generate IAC Code

```http
POST /iac/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "blueprintId": "blueprint-uuid",
  "outputFormat": "terraform",
  "options": {
    "includeModules": true,
    "minify": false
  }
}
```

**Output Formats**:
- `terraform` - Terraform HCL
- `cloudformation` - AWS CloudFormation
- `arm` - Azure ARM Templates
- `deployment-manager` - GCP Deployment Manager
- `pulumi-typescript` - Pulumi (TypeScript)
- `pulumi-python` - Pulumi (Python)

**Response**:
```json
{
  "id": "generation-uuid",
  "blueprintId": "blueprint-uuid",
  "format": "terraform",
  "code": "resource \"aws_vpc\" \"main\" {\n  cidr_block = \"10.0.0.0/16\"\n}",
  "files": [
    {
      "name": "main.tf",
      "content": "..."
    },
    {
      "name": "variables.tf",
      "content": "..."
    },
    {
      "name": "outputs.tf",
      "content": "..."
    }
  ],
  "generatedAt": "2024-01-01T00:00:00Z"
}
```

### Download IAC Code

```http
GET /iac/:id/download?format=zip
Authorization: Bearer {token}
```

**Formats**:
- `zip` - ZIP archive
- `tar.gz` - Tarball

**Response**: Binary file download

---

## Guardrails API

### Validate Against Policies

```http
POST /guardrails/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "blueprintId": "blueprint-uuid",
  "policies": ["security", "cost", "compliance"]
}
```

**Response**:
```json
{
  "valid": false,
  "violations": [
    {
      "policyId": "security-001",
      "severity": "high",
      "resource": "aws_s3_bucket.data",
      "message": "S3 bucket must have encryption enabled",
      "remediation": "Add server_side_encryption_configuration block"
    }
  ],
  "warnings": [
    {
      "policyId": "best-practice-005",
      "resource": "aws_instance.web",
      "message": "Consider using t3 instead of t2 instances"
    }
  ],
  "passed": 15,
  "failed": 1,
  "warned": 1
}
```

### List Policies

```http
GET /guardrails/policies
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "id": "policy-uuid",
      "name": "S3 Encryption Required",
      "type": "security",
      "enabled": true,
      "severity": "high",
      "description": "Ensures all S3 buckets have encryption enabled"
    }
  ]
}
```

### Create Policy

```http
POST /guardrails/policies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Custom Security Policy",
  "type": "security",
  "content": "package terraform.analysis\n\ndeny[msg] {...}",
  "enabled": true
}
```

---

## Costing API

### Get Cost Estimate

```http
POST /costing/estimate
Authorization: Bearer {token}
Content-Type: application/json

{
  "blueprintId": "blueprint-uuid",
  "region": "us-east-1",
  "duration": "monthly"
}
```

**Response**:
```json
{
  "totalCost": 1250.50,
  "currency": "USD",
  "duration": "monthly",
  "breakdown": [
    {
      "resourceType": "aws_instance",
      "resourceName": "web-server",
      "instanceType": "t3.medium",
      "quantity": 3,
      "unitPrice": 0.0416,
      "hoursPerMonth": 730,
      "monthlyCost": 91.10
    },
    {
      "resourceType": "aws_rds_instance",
      "resourceName": "database",
      "instanceType": "db.t3.large",
      "quantity": 1,
      "monthlyCost": 146.00
    }
  ],
  "optimizationSavings": 320.00,
  "confidence": 95
}
```

### Get Cost Optimization Recommendations

```http
GET /costing/recommendations/:blueprintId
Authorization: Bearer {token}
```

**Response**:
```json
{
  "recommendations": [
    {
      "id": "rec-uuid",
      "type": "right-sizing",
      "resource": "aws_instance.web",
      "current": "t3.large",
      "recommended": "t3.medium",
      "monthlySavings": 45.00,
      "impact": "Low performance impact expected",
      "confidence": 92
    },
    {
      "id": "rec-uuid-2",
      "type": "reserved-instance",
      "resource": "aws_instance.app",
      "monthlySavings": 120.00,
      "term": "1-year",
      "upfrontCost": 500.00,
      "confidence": 98
    }
  ],
  "totalPotentialSavings": 165.00
}
```

---

## Deployment API

### Create Deployment

```http
POST /deployments
Authorization: Bearer {token}
Content-Type: application/json

{
  "blueprintId": "blueprint-uuid",
  "environment": "production",
  "region": "us-east-1",
  "autoApprove": false,
  "variables": {
    "instance_count": 3
  }
}
```

**Response**: `202 Accepted`
```json
{
  "id": "deployment-uuid",
  "status": "planning",
  "blueprintId": "blueprint-uuid",
  "environment": "production",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Deployment Status

```http
GET /deployments/:id
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": "deployment-uuid",
  "status": "applying",
  "progress": 65,
  "stages": [
    {
      "name": "validation",
      "status": "completed",
      "startedAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:00:05Z"
    },
    {
      "name": "planning",
      "status": "completed",
      "startedAt": "2024-01-01T00:00:05Z",
      "completedAt": "2024-01-01T00:00:15Z"
    },
    {
      "name": "applying",
      "status": "in-progress",
      "startedAt": "2024-01-01T00:00:15Z",
      "progress": 65
    }
  ],
  "resourcesCreated": 13,
  "resourcesTotal": 20,
  "estimatedCompletion": "2024-01-01T00:05:00Z"
}
```

### List Deployments

```http
GET /deployments?environment=production&status=completed
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "id": "deployment-uuid",
      "blueprintId": "blueprint-uuid",
      "environment": "production",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:05:00Z",
      "duration": 300
    }
  ]
}
```

### Cancel Deployment

```http
POST /deployments/:id/cancel
Authorization: Bearer {token}
```

**Response**: `200 OK`

### Rollback Deployment

```http
POST /deployments/:id/rollback
Authorization: Bearer {token}
```

**Response**: `202 Accepted`

---

## AI Recommendations API

### Get Recommendations

```http
GET /ai/recommendations/:blueprintId
Authorization: Bearer {token}
```

**Response**:
```json
{
  "recommendations": [
    {
      "id": "rec-uuid",
      "category": "cost",
      "priority": "high",
      "title": "Use Reserved Instances",
      "description": "Switch to Reserved Instances for stable workloads",
      "impact": {
        "cost": -450.00,
        "performance": 0,
        "security": 0
      },
      "effort": "low",
      "implementation": "Purchase 1-year Reserved Instances for production instances",
      "confidence": 95
    },
    {
      "id": "rec-uuid-2",
      "category": "performance",
      "priority": "medium",
      "title": "Enable CloudFront CDN",
      "description": "Implement CDN for static assets",
      "impact": {
        "cost": 50.00,
        "performance": 40,
        "security": 5
      },
      "effort": "medium",
      "confidence": 88
    }
  ]
}
```

### Apply Recommendation

```http
POST /ai/recommendations/:id/apply
Authorization: Bearer {token}
```

**Response**:
```json
{
  "blueprintId": "blueprint-uuid",
  "applied": true,
  "changes": [
    "Updated instance type from t3.large to reserved t3.large"
  ]
}
```

---

## Feature Flags API

### Get Feature Flags

```http
GET /feature-flags
Authorization: Bearer {token}
```

**Response**:
```json
{
  "flags": {
    "ai_recommendations": true,
    "cost_optimization": true,
    "multi_region_deployments": true,
    "advanced_guardrails": true,
    "beta_gcp_support": false
  }
}
```

### Update Feature Flag

```http
PUT /feature-flags/:flagName
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": true
}
```

**Response**: `200 OK`

---

## Monitoring API

### Get System Metrics

```http
GET /monitoring/metrics
Authorization: Bearer {token}
```

**Response**:
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "metrics": {
    "api": {
      "requestsPerSecond": 125.5,
      "averageLatency": 145,
      "p95Latency": 280,
      "p99Latency": 450,
      "errorRate": 0.02
    },
    "deployments": {
      "active": 5,
      "completed": 150,
      "failed": 3,
      "successRate": 98.0
    },
    "resources": {
      "cpu": 45.5,
      "memory": 62.3,
      "disk": 35.8
    }
  }
}
```

### Get Service Health

```http
GET /health/ready
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "api-gateway": "healthy",
    "blueprint-service": "healthy",
    "iac-generator": "healthy",
    "guardrails": "healthy",
    "costing": "healthy",
    "orchestrator": "healthy",
    "ai-engine": "healthy",
    "database": "healthy",
    "redis": "healthy"
  },
  "uptime": 864000
}
```

---

## Webhooks

### Configure Webhook

```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["deployment.completed", "deployment.failed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

**Deployment Completed**:
```json
{
  "event": "deployment.completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "deploymentId": "deployment-uuid",
    "blueprintId": "blueprint-uuid",
    "environment": "production",
    "duration": 300,
    "resourcesCreated": 20
  }
}
```

**Deployment Failed**:
```json
{
  "event": "deployment.failed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "deploymentId": "deployment-uuid",
    "blueprintId": "blueprint-uuid",
    "error": "Resource quota exceeded",
    "stage": "applying"
  }
}
```

---

## Rate Limiting

**Limits**:
- **Anonymous**: 60 requests/hour
- **Authenticated**: 1000 requests/hour
- **Premium**: 5000 requests/hour

**Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1640000000
```

**429 Response**:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid blueprint configuration",
    "details": [
      {
        "field": "resources[0].type",
        "message": "Resource type 'aws_invalid' is not supported"
      }
    ],
    "requestId": "req-uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 202 | Accepted - Async operation started |
| 204 | No Content - Success with no response body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service down |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## Pagination

**Request**:
```http
GET /blueprints?page=2&limit=50
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "pages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Filtering & Sorting

**Filter by multiple fields**:
```http
GET /blueprints?provider=aws&tags=production,networking
```

**Sorting**:
```http
GET /blueprints?sort=createdAt&order=desc
```

**Search**:
```http
GET /blueprints?search=vpc
```

---

## API Versioning

**Current Version**: v1

**Version Header**:
```http
GET /blueprints
Accept: application/vnd.iac-dharma.v1+json
```

**URL Versioning** (alternative):
```http
GET /v1/blueprints
```

---

## SDKs & Client Libraries

### JavaScript/TypeScript

```bash
npm install @raghavendra198902/iac-dharma-sdk
```

```typescript
import { IacDharmaClient } from '@raghavendra198902/iac-dharma-sdk';

const client = new IacDharmaClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000/api'
});

// List blueprints
const blueprints = await client.blueprints.list();

// Create blueprint
const blueprint = await client.blueprints.create({
  name: 'My VPC',
  provider: 'aws',
  resources: [...]
});
```

### Python

```bash
pip install iac-dharma
```

```python
from iac_dharma import Client

client = Client(
    api_key='your-api-key',
    base_url='http://localhost:3000/api'
)

# List blueprints
blueprints = client.blueprints.list()

# Create deployment
deployment = client.deployments.create(
    blueprint_id='blueprint-uuid',
    environment='production'
)
```

---

## Interactive API Documentation

Access interactive API docs with Swagger UI:

**URL**: http://localhost:3000/api-docs

**Features**:
- Try API calls directly in browser
- View request/response schemas
- Authentication testing
- Example requests

---

## Next Steps

- [Authentication Guide](Authentication) - Detailed auth setup
- [Webhook Integration](Webhook-Integration) - Event notifications
- [SDK Documentation](SDK-Documentation) - Client library docs
- [API Examples](API-Examples) - Code samples

---

**Questions about the API? Check [GitHub Issues](https://github.com/Raghavendra198902/iac/issues)!**
