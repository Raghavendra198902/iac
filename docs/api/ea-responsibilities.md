# EA Responsibilities API Documentation

## Overview

The EA Responsibilities API provides comprehensive access to Enterprise Architecture responsibility areas, metrics, activities, and analytics. This API enables tracking and management of all 15 EA responsibility areas within the platform.

**Base URL:** `https://api.iac-platform.com/api/ea/responsibilities`

**Authentication:** Bearer token required for all endpoints

---

## Endpoints

### 1. Get All Responsibility Metrics

Returns comprehensive metrics for all 15 EA responsibility areas.

**Endpoint:** `GET /api/ea/responsibilities/metrics`

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "businessStrategyAlignment": {
      "area": "Business Strategy Alignment",
      "healthScore": 85,
      "initiatives": 12,
      "strategies": 8,
      "stakeholders": 24,
      "kpis": 15,
      "completionRate": 78,
      "trend": "up",
      "lastUpdated": "2024-01-15T10:30:00Z"
    },
    "technologyGovernance": {
      "area": "Technology Governance",
      "healthScore": 88,
      "initiatives": 15,
      "policies": 45,
      "stakeholders": 18,
      "kpis": 12,
      "completionRate": 82,
      "trend": "up",
      "lastUpdated": "2024-01-15T09:15:00Z"
    },
    // ... all 15 areas
  },
  "metadata": {
    "totalAreas": 15,
    "averageHealthScore": 84.5,
    "totalInitiatives": 185,
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server error

---

### 2. Get Overview Summary

Returns high-level overview with completion scores for all responsibility areas.

**Endpoint:** `GET /api/ea/responsibilities/overview`

**Authentication:** Required

**Query Parameters:**
- `timeRange` (optional): `7d`, `30d`, `90d`, `1y` - Default: `30d`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "overallHealth": 88,
    "totalInitiatives": 185,
    "activeProjects": 47,
    "stakeholderEngagement": 89,
    "complianceRate": 94,
    "areas": [
      {
        "id": "business-strategy-alignment",
        "name": "Business Strategy Alignment",
        "completionScore": 78,
        "trend": "up",
        "priority": "high",
        "status": "active"
      },
      // ... all 15 areas
    ],
    "timeRange": "30d"
  }
}
```

---

### 3. Get Area-Specific Details

Returns detailed information for a specific EA responsibility area.

**Endpoint:** `GET /api/ea/responsibilities/:area/details`

**Authentication:** Required

**Path Parameters:**
- `area` (required): Area identifier (e.g., `business-strategy-alignment`, `technology-governance`)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "area": "Business Strategy Alignment",
    "id": "business-strategy-alignment",
    "description": "Comprehensive description of the responsibility area...",
    "healthScore": 85,
    "metrics": {
      "initiatives": 12,
      "strategies": 8,
      "stakeholders": 24,
      "documents": 156,
      "kpis": 15
    },
    "initiatives": [
      {
        "id": "init-001",
        "name": "Digital Transformation Initiative",
        "status": "in-progress",
        "progress": 67,
        "startDate": "2024-01-01",
        "targetDate": "2024-06-30",
        "owner": "John Smith"
      }
    ],
    "recentActivities": [
      {
        "id": "act-123",
        "type": "initiative_created",
        "description": "New digital transformation initiative launched",
        "timestamp": "2024-01-15T10:00:00Z",
        "user": "Jane Doe"
      }
    ],
    "kpis": [
      {
        "name": "Strategic Alignment Score",
        "current": 85,
        "target": 90,
        "unit": "percent",
        "trend": "up"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid area identifier
- `404 Not Found` - Area not found

---

### 4. Log Activity

Records a new activity for a specific EA responsibility area.

**Endpoint:** `POST /api/ea/responsibilities/:area/activities`

**Authentication:** Required

**Path Parameters:**
- `area` (required): Area identifier

**Request Body:**

```json
{
  "type": "initiative_created",
  "description": "Launched new cost optimization initiative",
  "metadata": {
    "initiative_id": "init-042",
    "budget": 150000,
    "duration_months": 6
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Activity Types:**
- `initiative_created`
- `document_updated`
- `stakeholder_added`
- `review_completed`
- `policy_updated`
- `kpi_updated`

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "act-456",
    "area": "cost-management",
    "type": "initiative_created",
    "description": "Launched new cost optimization initiative",
    "metadata": {
      "initiative_id": "init-042",
      "budget": 150000,
      "duration_months": 6
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "createdBy": "user-789"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body or activity type
- `404 Not Found` - Area not found

---

### 5. Get Statistics

Returns overall statistics and trends across all EA responsibility areas.

**Endpoint:** `GET /api/ea/responsibilities/statistics`

**Authentication:** Required

**Query Parameters:**
- `startDate` (optional): ISO 8601 date - Default: 30 days ago
- `endDate` (optional): ISO 8601 date - Default: now

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2023-12-15T00:00:00Z",
      "endDate": "2024-01-15T23:59:59Z"
    },
    "overall": {
      "averageHealthScore": 88,
      "totalInitiatives": 185,
      "completedInitiatives": 143,
      "activeInitiatives": 42,
      "totalStakeholders": 1234,
      "totalDocuments": 3456,
      "complianceRate": 94
    },
    "trends": {
      "healthScoreTrend": "up",
      "initiativesChange": "+12%",
      "stakeholderGrowth": "+8%",
      "documentationGrowth": "+15%"
    },
    "topPerformingAreas": [
      {
        "area": "Technology Governance",
        "healthScore": 92,
        "improvement": "+5%"
      },
      {
        "area": "Risk Management",
        "healthScore": 90,
        "improvement": "+3%"
      }
    ],
    "areasNeedingAttention": [
      {
        "area": "Innovation Management",
        "healthScore": 72,
        "issues": ["Low stakeholder engagement", "Delayed initiatives"]
      }
    ]
  }
}
```

---

## Data Models

### Responsibility Area

```typescript
interface ResponsibilityArea {
  id: string;
  name: string;
  description: string;
  healthScore: number; // 0-100
  completionRate: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string; // ISO 8601
  metrics: AreaMetrics;
}
```

### Area Metrics

```typescript
interface AreaMetrics {
  initiatives: number;
  stakeholders: number;
  documents: number;
  kpis: number;
  [key: string]: number; // Area-specific metrics
}
```

### Activity

```typescript
interface Activity {
  id: string;
  area: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string; // ISO 8601
  createdBy: string;
}

type ActivityType = 
  | 'initiative_created'
  | 'document_updated'
  | 'stakeholder_added'
  | 'review_completed'
  | 'policy_updated'
  | 'kpi_updated';
```

---

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **API Tier:** 1000 requests per hour per API key
- **Heavy Operations:** 5 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "field_name",
      "message": "Detailed error message"
    }
  ],
  "requestId": "req-12345",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Common Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

---

## Examples

### cURL

```bash
# Get all metrics
curl -X GET "https://api.iac-platform.com/api/ea/responsibilities/metrics" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get area details
curl -X GET "https://api.iac-platform.com/api/ea/responsibilities/business-strategy-alignment/details" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Log activity
curl -X POST "https://api.iac-platform.com/api/ea/responsibilities/cost-management/activities" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "initiative_created",
    "description": "New cost optimization initiative"
  }'
```

### JavaScript

```javascript
// Get overview
const response = await fetch('https://api.iac-platform.com/api/ea/responsibilities/overview', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

// Log activity
const activity = await fetch('https://api.iac-platform.com/api/ea/responsibilities/risk-management/activities', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'review_completed',
    description: 'Quarterly risk assessment completed'
  })
});
```

### Python

```python
import requests

API_BASE = "https://api.iac-platform.com/api/ea/responsibilities"
TOKEN = "YOUR_TOKEN"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Get statistics
response = requests.get(f"{API_BASE}/statistics", headers=headers)
stats = response.json()
print(f"Average Health Score: {stats['data']['overall']['averageHealthScore']}")

# Log activity
activity_data = {
    "type": "stakeholder_added",
    "description": "Added new executive stakeholder"
}

response = requests.post(
    f"{API_BASE}/compliance-management/activities",
    headers=headers,
    json=activity_data
)
print(response.json())
```

---

## Best Practices

1. **Authentication**: Always include Bearer token in Authorization header
2. **Rate Limiting**: Implement exponential backoff for rate limit errors
3. **Error Handling**: Check response status codes and handle errors appropriately
4. **Caching**: Cache metrics data for 5-10 minutes to reduce API calls
5. **Pagination**: Use pagination parameters for large datasets
6. **Versioning**: Specify API version in requests for stability

---

## Support

For API support:
- **Documentation**: https://docs.iac-platform.com/api
- **Email**: api-support@iac-platform.com
- **Status Page**: https://status.iac-platform.com
