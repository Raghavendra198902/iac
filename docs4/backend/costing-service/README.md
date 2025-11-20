# Costing Service

TCO calculation, cost optimization, budget tracking, and idle resource detection service for IAC DHARMA platform.

## Overview

The Costing Service provides comprehensive cost management capabilities including infrastructure cost estimation (TCO), actual cost tracking from cloud providers, budget management with alerts, cost optimization recommendations, and automatic idle resource detection.

## Features

### Cost Estimation (TCO)
- **Multi-cloud pricing**: Azure, AWS, GCP pricing data
- **Resource-level costing**: Per-resource cost breakdown
- **Time-based projections**: Hourly, daily, monthly, yearly costs
- **Cost categories**: Compute, storage, network, database, other
- **Optional add-ons**: Support, network egress, backup costs

### Budget Management
- **Flexible periods**: Daily, weekly, monthly, quarterly, yearly budgets
- **Multi-level alerts**: Configurable threshold-based notifications
- **Status tracking**: Active, warning, exceeded budget states
- **Scope filtering**: Blueprint-level or environment-level budgets
- **Automated monitoring**: Hourly budget checks with cron jobs

### Cost Optimization
- **Right-sizing**: Identify oversized VMs and recommend downsizing
- **Reserved Instances**: 40% savings recommendations for predictable workloads
- **Savings Plans**: 35% flexible savings across instance families
- **Storage Tiering**: 30% savings with cool/archive tiers
- **Spot Instances**: 70% savings for fault-tolerant workloads
- **Optimization Reports**: Comprehensive savings analysis

### Idle Resource Detection
- **Automated detection**: Runs every 6 hours via cron
- **Multi-metric analysis**: CPU, memory, network, IOPS thresholds
- **Cost impact**: Monthly cost of idle resources
- **Actionable recommendations**: Specific actions to reduce waste
- **Configurable thresholds**: Custom detection criteria

### Actual Cost Tracking
- **Cloud provider integration**: Azure Cost Management, AWS Cost Explorer, GCP Billing
- **Period analysis**: Date-range cost queries
- **Variance analysis**: Compare estimates vs actual costs
- **Trend forecasting**: Historical cost trends
- **Resource-level details**: Per-resource actual costs

### Cost Alerts
- **Budget exceeded**: Automatic alerts when budgets are exceeded
- **Anomaly detection**: Unusual cost spikes
- **Idle resources**: Notifications for wasted spend
- **Cost spikes**: Sudden increases in spending
- **Alert acknowledgment**: Track and manage alerts

## Architecture

```
┌─────────────────────────────────────┐
│     Costing Service (Port 3005)     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   CostingService (Main)       │  │
│  │  - estimateCost()             │  │
│  │  - getActualCosts()           │  │
│  │  - compareCosts()             │  │
│  │  - getAlerts()                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   PricingEngine               │  │
│  │  - getPricing()               │  │
│  │  - Cache: 100+ pricing rules  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   BudgetManager               │  │
│  │  - createBudget()             │  │
│  │  - updateBudgetSpend()        │  │
│  │  - Cron: Hourly monitoring    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   OptimizationEngine          │  │
│  │  - generateReport()           │  │
│  │  - getRecommendations()       │  │
│  │  - 5 optimization types       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   IdleResourceDetector        │  │
│  │  - detectIdleResources()      │  │
│  │  - Cron: Every 6 hours        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │          │          │
   ┌───────┘          │          └───────┐
   │                  │                  │
┌──▼────┐      ┌──────▼──────┐      ┌───▼────┐
│ Azure │      │     AWS     │      │  GCP   │
│ Cost  │      │    Cost     │      │ Billing│
│ Mgmt  │      │  Explorer   │      │  API   │
└───────┘      └─────────────┘      └────────┘
```

## API Endpoints

### 1. Estimate Infrastructure Costs

**POST** `/api/estimates`

Generate cost estimate for infrastructure blueprint.

**Request:**
```json
{
  "blueprintId": "uuid",
  "targetCloud": "azure",
  "region": "eastus",
  "resources": [
    {
      "type": "azurerm_virtual_machine",
      "name": "web-vm-01",
      "sku": "Standard_D2s_v3",
      "count": 2
    },
    {
      "type": "azurerm_storage_account",
      "name": "storage01",
      "sku": "Standard_LRS",
      "count": 1000
    }
  ],
  "duration": 12,
  "options": {
    "includeSupport": true,
    "includeNetworkEgress": true,
    "includeBackup": false
  }
}
```

**Response (201):**
```json
{
  "estimateId": "uuid",
  "blueprintId": "uuid",
  "targetCloud": "azure",
  "region": "eastus",
  "totalCost": {
    "hourly": 0.35,
    "daily": 8.40,
    "monthly": 252.00,
    "yearly": 3024.00,
    "currency": "USD",
    "breakdown": {
      "compute": 140.16,
      "storage": 20.00,
      "network": 15.00,
      "database": 0,
      "other": 76.84
    }
  },
  "resources": [
    {
      "resourceName": "web-vm-01",
      "resourceType": "azurerm_virtual_machine",
      "sku": "Standard_D2s_v3",
      "quantity": 2,
      "unitPrice": 0.096,
      "monthlyCost": 140.16,
      "yearlyCost": 1681.92,
      "pricingTier": "Standard"
    }
  ],
  "recommendations": [
    {
      "id": "uuid",
      "type": "reserved_instance",
      "severity": "high",
      "title": "Purchase Reserved Instances",
      "description": "Save up to 40% on web-vm-01 with 1-year commitment",
      "currentCost": 1681.92,
      "optimizedCost": 1009.15,
      "savingsAmount": 672.77,
      "savingsPercentage": 40,
      "resourceName": "web-vm-01",
      "implementation": "Purchase Reserved Instance for predictable workloads",
      "effort": "low"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2024-01-08T00:00:00Z"
}
```

### 2. Get Cost Estimate

**GET** `/api/estimates/:estimateId`

Retrieve previously generated estimate.

### 3. Get Actual Costs

**POST** `/api/costs/actual`

Fetch actual costs from cloud providers.

**Request:**
```json
{
  "deploymentId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "resource"
}
```

**Response:**
```json
{
  "deploymentId": "uuid",
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "totalCost": 1250.50,
  "currency": "USD",
  "breakdown": {
    "hourly": 1.71,
    "daily": 41.68,
    "monthly": 1250.50,
    "yearly": 15006.00,
    "currency": "USD",
    "breakdown": {
      "compute": 600.25,
      "storage": 200.15,
      "network": 150.10,
      "database": 250.00,
      "other": 50.00
    }
  },
  "trends": [
    {
      "date": "2024-01-01",
      "cost": 38.50,
      "forecastCost": 40.00
    }
  ],
  "items": [
    {
      "resourceId": "vm-123",
      "resourceName": "web-vm-01",
      "resourceType": "Virtual Machine",
      "service": "Compute",
      "cost": 140.16,
      "usage": {
        "quantity": 730,
        "unit": "hours"
      }
    }
  ]
}
```

### 4. Create Budget

**POST** `/api/budgets`

Create a new budget with alert thresholds.

**Request:**
```json
{
  "name": "Production Monthly Budget",
  "blueprintId": "uuid",
  "environment": "production",
  "amount": 5000.00,
  "period": "monthly",
  "currency": "USD",
  "alerts": [
    {
      "threshold": 80,
      "recipients": ["admin@example.com", "finance@example.com"]
    },
    {
      "threshold": 90,
      "recipients": ["cto@example.com"]
    },
    {
      "threshold": 100,
      "recipients": ["all@example.com"]
    }
  ],
  "createdBy": "user@example.com"
}
```

**Response (201):**
```json
{
  "budgetId": "uuid",
  "name": "Production Monthly Budget",
  "blueprintId": "uuid",
  "environment": "production",
  "amount": 5000.00,
  "period": "monthly",
  "currency": "USD",
  "alerts": [...],
  "currentSpend": 0,
  "lastUpdated": "2024-01-01T00:00:00Z",
  "createdBy": "user@example.com",
  "status": "active"
}
```

### 5. List Budgets

**GET** `/api/budgets?blueprintId=uuid&environment=production&status=active`

List budgets with optional filters.

### 6. Get Budget

**GET** `/api/budgets/:budgetId`

Get specific budget details.

### 7. Update Budget

**PUT** `/api/budgets/:budgetId`

Update budget configuration.

### 8. Delete Budget

**DELETE** `/api/budgets/:budgetId`

Delete a budget (204 No Content).

### 9. Generate Optimization Report

**POST** `/api/optimization/report`

Generate comprehensive cost optimization report.

**Request:**
```json
{
  "blueprintId": "uuid",
  "deploymentId": "uuid"
}
```

**Response:**
```json
{
  "reportId": "uuid",
  "blueprintId": "uuid",
  "deploymentId": "uuid",
  "generatedAt": "2024-01-01T00:00:00Z",
  "currentMonthlyCost": 1500.00,
  "optimizedMonthlyCost": 900.00,
  "totalSavings": 600.00,
  "savingsPercentage": 40,
  "recommendations": [
    {
      "id": "uuid",
      "type": "right_sizing",
      "severity": "high",
      "title": "Right-size web-vm-01",
      "description": "Resource appears oversized...",
      "currentCost": 140.16,
      "optimizedCost": 91.10,
      "savingsAmount": 49.06,
      "savingsPercentage": 35,
      "resourceName": "web-vm-01",
      "implementation": "Analyze CPU, memory metrics...",
      "effort": "low"
    }
  ],
  "summary": {
    "rightSizing": { "count": 2, "savings": 98.12 },
    "reservedInstances": { "count": 3, "savings": 400.00 },
    "idleResources": { "count": 1, "savings": 50.00 },
    "storageTiering": { "count": 1, "savings": 51.88 }
  }
}
```

### 10. Get Cost Recommendations

**GET** `/api/optimization/recommendations?blueprintId=uuid&type=reserved_instance&minSavings=100`

Get filtered cost optimization recommendations.

### 11. Detect Idle Resources

**POST** `/api/idle-resources/detect`

Trigger idle resource detection.

**Request:**
```json
{
  "deploymentId": "uuid",
  "thresholds": {
    "cpuThreshold": 5,
    "memoryThreshold": 10,
    "networkThreshold": 1000,
    "minIdleDuration": 24
  }
}
```

**Response:**
```json
{
  "count": 2,
  "resources": [
    {
      "resourceId": "vm-idle-01",
      "resourceName": "dev-test-vm",
      "resourceType": "azurerm_virtual_machine",
      "deploymentId": "uuid",
      "idleReason": "CPU utilization below 5%; Memory utilization below 10%",
      "idleDuration": 72,
      "monthlyCost": 140.16,
      "recommendation": "Stop or delete this VM if not needed...",
      "detectedAt": "2024-01-01T00:00:00Z",
      "metrics": {
        "cpuUtilization": 2.5,
        "memoryUtilization": 8.0,
        "networkIn": 500,
        "networkOut": 300,
        "iops": 5
      }
    }
  ]
}
```

### 12. Get Idle Resources

**GET** `/api/idle-resources?deploymentId=uuid&minCost=50`

Retrieve detected idle resources with filters.

### 13. Get Cost Alerts

**GET** `/api/alerts?blueprintId=uuid&type=budget_exceeded&severity=critical&acknowledged=false`

List cost alerts with filters.

**Response:**
```json
[
  {
    "alertId": "uuid",
    "type": "budget_exceeded",
    "severity": "critical",
    "title": "Production Budget Exceeded",
    "message": "Budget Production Monthly Budget has exceeded 100% (5200/5000 USD)",
    "blueprintId": "uuid",
    "amount": 5200.00,
    "threshold": 5000.00,
    "detectedAt": "2024-01-15T14:30:00Z",
    "acknowledged": false
  }
]
```

### 14. Acknowledge Alert

**POST** `/api/alerts/:alertId/acknowledge`

Mark alert as acknowledged.

### 15. Compare Costs

**POST** `/api/costs/compare`

Compare estimated vs actual costs.

**Request:**
```json
{
  "estimateId": "uuid",
  "deploymentId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "estimateId": "uuid",
  "deploymentId": "uuid",
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "estimatedCost": 1200.00,
  "actualCost": 1250.50,
  "variance": 50.50,
  "variancePercentage": 4.21,
  "accuracy": 95.79,
  "breakdown": {
    "estimated": {
      "compute": 600.00,
      "storage": 200.00,
      "network": 150.00,
      "database": 200.00,
      "other": 50.00
    },
    "actual": {
      "compute": 600.25,
      "storage": 200.15,
      "network": 150.10,
      "database": 250.00,
      "other": 50.00
    }
  }
}
```

### 16. Get Pricing Data

**GET** `/api/pricing?cloud=azure&region=eastus&resourceType=azurerm_virtual_machine&sku=Standard_D2s_v3`

Retrieve pricing information for resources.

**Response:**
```json
{
  "cloud": "azure",
  "region": "eastus",
  "resourceType": "azurerm_virtual_machine",
  "sku": "Standard_D2s_v3",
  "tier": "Standard",
  "unitPrice": 0.096,
  "unit": "hour",
  "currency": "USD",
  "effectiveDate": "2024-01-01T00:00:00Z"
}
```

## Usage Examples

### Example 1: Estimate Costs for New Blueprint

```bash
# Generate cost estimate
curl -X POST http://localhost:3005/api/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "my-blueprint",
    "targetCloud": "azure",
    "region": "eastus",
    "resources": [
      {
        "type": "azurerm_virtual_machine",
        "name": "web-vm",
        "sku": "Standard_D2s_v3",
        "count": 2
      },
      {
        "type": "azurerm_sql_database",
        "name": "app-db",
        "sku": "S0",
        "count": 1
      }
    ],
    "duration": 12,
    "options": {
      "includeSupport": true
    }
  }'

# Response shows monthly cost: $252.00
# Yearly projection: $3,024.00
# Includes 2 optimization recommendations
```

### Example 2: Create Budget with Alerts

```bash
curl -X POST http://localhost:3005/api/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dev Environment Budget",
    "environment": "development",
    "amount": 1000.00,
    "period": "monthly",
    "currency": "USD",
    "alerts": [
      {
        "threshold": 80,
        "recipients": ["dev-team@example.com"]
      },
      {
        "threshold": 100,
        "recipients": ["manager@example.com"]
      }
    ],
    "createdBy": "admin@example.com"
  }'

# Budget created with ID
# Automatic monitoring starts
# Alerts sent when thresholds reached
```

### Example 3: Detect Idle Resources

```bash
# Trigger detection
curl -X POST http://localhost:3005/api/idle-resources/detect \
  -H "Content-Type: application/json" \
  -d '{
    "deploymentId": "prod-deployment-123",
    "thresholds": {
      "cpuThreshold": 10,
      "memoryThreshold": 15,
      "minIdleDuration": 48
    }
  }'

# Response:
# {
#   "count": 3,
#   "resources": [
#     {
#       "resourceName": "unused-vm",
#       "monthlyCost": 140.16,
#       "idleReason": "CPU below 10%; Memory below 15%",
#       "recommendation": "Stop or delete if not needed"
#     }
#   ]
# }

# Potential monthly savings: $420.48
```

### Example 4: Generate Optimization Report

```bash
curl -X POST http://localhost:3005/api/optimization/report \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "my-blueprint"
  }'

# Response includes:
# - Current monthly cost: $1,500
# - Optimized cost: $900
# - Total savings: $600 (40%)
# - 10 specific recommendations:
#   * 2 right-sizing (save $98)
#   * 3 reserved instances (save $400)
#   * 1 idle resource (save $50)
#   * 1 storage tiering (save $52)
```

### Example 5: Compare Estimate vs Actual

```bash
# After deployment, compare costs
curl -X POST http://localhost:3005/api/costs/compare \
  -H "Content-Type: application/json" \
  -d '{
    "estimateId": "estimate-abc-123",
    "deploymentId": "deploy-xyz-789",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'

# Response:
# Estimated: $1,200
# Actual: $1,250.50
# Variance: +$50.50 (+4.21%)
# Accuracy: 95.79%
```

## Cost Optimization Recommendations

### 1. Right-Sizing (35% savings)
**When**: Resource consistently under-utilized
**How**: Downsize VM/instance to smaller SKU
**Effort**: Low
**Example**: D4 → D2 saves ~$50/month per VM

### 2. Reserved Instances (40% savings)
**When**: Predictable, always-on workloads
**How**: Purchase 1-year or 3-year commitment
**Effort**: Low
**Example**: $140/month → $84/month with 1-year RI

### 3. Savings Plans (35% savings)
**When**: Flexible compute usage patterns
**How**: Commit to $/hour spend, any instance type
**Effort**: Low
**Example**: More flexible than RIs, similar savings

### 4. Storage Tiering (30% savings)
**When**: Infrequently accessed data
**How**: Move to cool/archive tier via lifecycle policies
**Effort**: Medium
**Example**: Hot → Cool saves 50% on storage costs

### 5. Spot/Preemptible Instances (70% savings)
**When**: Fault-tolerant, interruptible workloads
**How**: Use spot instances with checkpointing
**Effort**: High
**Example**: Batch jobs, CI/CD, dev/test environments

## Budget Management

### Budget Periods

| Period | Description | Use Case |
|--------|-------------|----------|
| Daily | $X per day | Short-term testing |
| Weekly | $X per week | Sprint-based work |
| Monthly | $X per month | Standard operations |
| Quarterly | $X per 3 months | Project budgets |
| Yearly | $X per year | Annual planning |

### Alert Thresholds

Recommended threshold configuration:

```javascript
{
  alerts: [
    { threshold: 50, recipients: ["team@example.com"] },    // Early warning
    { threshold: 80, recipients: ["manager@example.com"] },  // Action needed
    { threshold: 90, recipients: ["director@example.com"] }, // Urgent
    { threshold: 100, recipients: ["all@example.com"] }      // Critical
  ]
}
```

### Budget States

- **active**: Current spend < 90% of budget
- **warning**: Current spend 90-99% of budget (alerts sent)
- **exceeded**: Current spend ≥ 100% of budget (critical alerts)
- **disabled**: Budget monitoring paused

## Idle Resource Detection

### Detection Criteria

Resources marked as idle if they meet **2 or more** criteria:

| Metric | Threshold | Duration |
|--------|-----------|----------|
| CPU Utilization | < 5% | 24+ hours |
| Memory Utilization | < 10% | 24+ hours |
| Network Traffic | < 1KB/sec | 24+ hours |
| Disk IOPS | < 10 | 24+ hours |

### Detection Schedule

- **Automatic**: Runs every 6 hours via cron
- **On-demand**: Trigger via API anytime
- **Configurable**: Adjust thresholds per deployment

### Recommendations by Resource Type

| Resource Type | Recommendation |
|---------------|----------------|
| Virtual Machine | Stop or delete if unused; use auto-scaling |
| Database | Pause database; consider smaller tier |
| Storage | Archive data; move to cheaper tier |
| Load Balancer | Remove if no backends; consolidate |

## Pricing Engine

### Pricing Data Sources

**Azure:**
- Azure Retail Prices API
- 100+ pre-loaded SKUs
- Real-time API fallback

**AWS:**
- AWS Pricing API
- EC2, RDS, S3 pricing
- Regional pricing variations

**GCP:**
- Cloud Billing Catalog API
- Compute, Storage pricing
- Sustained use discounts

### Pricing Cache

- **TTL**: 1 hour (configurable)
- **Size**: 1000+ pricing entries
- **Coverage**: 3 clouds, 10+ regions, 50+ resource types
- **Refresh**: Automatic on cache miss

### Mock vs Production

**Development (Mock)**:
- Pre-loaded pricing data
- Fast responses without API calls
- Sufficient for testing

**Production**:
- Real-time pricing API calls
- Cached for performance
- Updated pricing data

## Integration

### With Automation Engine

```typescript
// In Automation Engine - Auto-approval based on cost
async function shouldAutoApprove(blueprintId: string): Promise<boolean> {
  // Get cost estimate
  const estimate = await axios.post('http://costing-service:3005/api/estimates', {
    blueprintId,
    targetCloud: 'azure',
    region: 'eastus',
    resources: blueprint.resources
  });

  // Auto-approve if monthly cost < $1000
  return estimate.data.totalCost.monthly < 1000;
}
```

### With Guardrails Engine

```typescript
// In Guardrails - Cost policy enforcement
async function validateCostPolicy(blueprintId: string): Promise<boolean> {
  const estimate = await getCostEstimate(blueprintId);
  
  // Enforce cost limits
  if (estimate.totalCost.monthly > 5000) {
    return false; // Exceeds cost policy
  }
  
  return true;
}
```

### With Monitoring Service

```typescript
// In Monitoring - Cost anomaly detection
async function checkCostAnomalies(deploymentId: string): Promise<void> {
  const actual = await axios.post('http://costing-service:3005/api/costs/actual', {
    deploymentId,
    startDate: last7Days,
    endDate: today
  });

  // Check for unusual spikes
  if (actual.data.trends.some(t => t.cost > t.forecastCost * 1.5)) {
    createAlert('cost_spike', deploymentId);
  }
}
```

## Configuration

### Environment Variables

```bash
# Server
PORT=3005
NODE_ENV=production
LOG_LEVEL=info

# Cloud Provider APIs
AZURE_SUBSCRIPTION_ID=xxx
AWS_ACCESS_KEY_ID=xxx
GCP_PROJECT_ID=xxx

# Detection Thresholds
IDLE_RESOURCE_CPU_THRESHOLD=5
IDLE_RESOURCE_MEMORY_THRESHOLD=10
IDLE_RESOURCE_MIN_DURATION=24

# Cron Schedules
BUDGET_CHECK_INTERVAL=3600000       # 1 hour
IDLE_DETECTION_INTERVAL=21600000    # 6 hours

# Alerts
ALERT_EMAIL_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_USER=alerts@example.com
```

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev

# Server runs on http://localhost:3005
```

### Testing Cost Estimation

```bash
# Estimate small deployment
curl -X POST http://localhost:3005/api/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "test",
    "targetCloud": "azure",
    "region": "eastus",
    "resources": [
      {
        "type": "azurerm_virtual_machine",
        "name": "test-vm",
        "sku": "Standard_D2s_v3",
        "count": 1
      }
    ]
  }'

# Expected: ~$70/month for single D2s_v3 VM
```

## Troubleshooting

### High Cost Estimates

**Issue**: Cost estimate seems too high

**Solutions**:
1. Review resource SKUs - may be over-provisioned
2. Check resource count multipliers
3. Verify region pricing (some regions cost more)
4. Review optional add-ons (support, egress, backup)
5. Check if recommendations suggest optimizations

### Budget Alerts Not Triggering

**Issue**: Not receiving budget alerts

**Solutions**:
1. Verify budget status is "active"
2. Check alert threshold configuration
3. Verify recipient email addresses
4. Check SMTP configuration
5. Review budget monitoring cron logs
6. Manually update budget spend: `PUT /api/budgets/:id`

### Idle Detection Not Finding Resources

**Issue**: Expecting idle resources but none detected

**Solutions**:
1. Lower detection thresholds
2. Reduce minimum idle duration
3. Check if metrics are available from cloud provider
4. Verify deployment ID is correct
5. Trigger manual detection: `POST /api/idle-resources/detect`

### Pricing Data Not Available

**Issue**: "No pricing found for resource"

**Solutions**:
1. Check if resource type is supported
2. Verify cloud provider and region
3. Check pricing engine cache
4. Ensure pricing APIs are accessible
5. Add custom pricing: `pricingEngine.addPricing(...)`

## Deployment

### Docker

```bash
docker build -t costing-service:latest .

docker run -p 3005:3005 \
  -e AZURE_SUBSCRIPTION_ID=$AZURE_SUB \
  -e AWS_ACCESS_KEY_ID=$AWS_KEY \
  -e GCP_PROJECT_ID=$GCP_PROJECT \
  costing-service:latest
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: costing-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: costing
        image: costing-service:latest
        ports:
        - containerPort: 3005
        env:
        - name: AZURE_SUBSCRIPTION_ID
          valueFrom:
            secretKeyRef:
              name: cloud-credentials
              key: azure-subscription-id
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Performance

### API Response Times

| Endpoint | Typical Duration |
|----------|------------------|
| POST /api/estimates | 100-300ms |
| GET /api/costs/actual | 1-3 seconds (cloud API) |
| POST /api/optimization/report | 500-1000ms |
| POST /api/idle-resources/detect | 2-5 seconds |

### Optimization Tips

1. **Cache pricing data**: 1-hour TTL reduces API calls
2. **Batch cost queries**: Combine multiple resource queries
3. **Async processing**: Use background jobs for large analyses
4. **Index database**: Index on blueprintId, deploymentId
5. **Rate limiting**: Throttle cloud provider API calls

## Security

### API Security
- X-Powered-By header disabled
- Input validation with Joi schemas
- SQL injection prevention (parameterized queries)
- Rate limiting on cost estimation endpoints

### Credentials
- Cloud credentials stored as environment variables
- Support for managed identities (Azure, AWS, GCP)
- Secrets never logged or exposed in responses
- Regular credential rotation recommended

### Cost Data
- Sensitive financial information
- Access control required
- Audit all cost queries
- Encrypt cost data at rest

## Future Enhancements

1. **Machine Learning**: AI-powered cost forecasting
2. **Multi-currency**: Support for non-USD currencies
3. **Chargeback**: Department/team cost allocation
4. **Cost Governance**: Automated policy enforcement
5. **FinOps Dashboard**: Real-time cost visualization
6. **Commitment Recommendations**: Automated RI/SP suggestions
7. **Cost Anomaly Detection**: ML-based anomaly alerts
8. **Resource Tagging**: Tag-based cost tracking
9. **Cost Allocation**: Project-level cost breakdown
10. **ROI Analysis**: Value vs cost analysis

## License

Copyright © 2024 IAC DHARMA Platform
