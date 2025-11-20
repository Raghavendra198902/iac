# Monitoring & Self-Healing Service

Continuous monitoring, drift detection, and auto-remediation service for IAC Dharma platform.

## Features

- **Drift Detection**: Monitors deployed infrastructure for configuration drift
- **Auto-Remediation**: Automatically corrects detected drift based on policies
- **Health Monitoring**: Continuous health checks and alerting
- **Rollback Automation**: Automatic rollback on deployment failures
- **Performance Monitoring**: Tracks resource utilization and performance metrics
- **Cost Monitoring**: Detects cost anomalies and optimization opportunities
- **Compliance Monitoring**: Continuous compliance validation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Monitoring & Self-Healing Service               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │ Drift        │   │ Health       │   │ Cost         │   │
│  │ Detector     │   │ Monitor      │   │ Monitor      │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                   │                   │           │
│         v                   v                   v           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Auto-Remediation Engine                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │ Fix      │  │ Rollback │  │ Scale    │          │  │
│  │  │ Config   │  │ Deploy   │  │ Resource │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring Types

### 1. Configuration Drift Detection

Detects when deployed infrastructure deviates from the desired state defined in blueprints.

**Detection Methods:**
- Periodic state comparison (Terraform state vs actual)
- Event-driven detection (cloud provider webhooks)
- Real-time change tracking

**Auto-Remediation:**
- Apply stored configuration
- Re-run IaC templates
- Notify on critical drift

### 2. Health Monitoring

Continuous monitoring of application and infrastructure health.

**Checks:**
- HTTP/HTTPS endpoints (response time, status codes)
- Service availability (uptime, downtime events)
- Resource health (CPU, memory, disk, network)
- Database connectivity and performance
- Certificate expiration

**Actions:**
- Restart unhealthy services
- Scale resources automatically
- Trigger alerts and notifications
- Create incident tickets

### 3. Cost Monitoring

Tracks spending and detects anomalies.

**Monitors:**
- Daily/monthly cost trends
- Budget threshold alerts
- Resource utilization vs cost
- Idle resource detection

**Actions:**
- Stop idle resources
- Recommend rightsizing
- Alert on budget overrun
- Auto-apply optimization policies

### 4. Compliance Monitoring

Ensures ongoing compliance with security and regulatory policies.

**Checks:**
- Security group rules
- Encryption status
- Access controls
- Audit log integrity
- Certificate validity

**Actions:**
- Auto-fix policy violations
- Quarantine non-compliant resources
- Generate compliance reports
- Escalate critical violations

## API Endpoints

### Register Deployment for Monitoring
```http
POST /api/monitoring/register
Content-Type: application/json

{
  "deploymentId": "deploy-123",
  "blueprintId": "bp-456",
  "environment": "prod",
  "monitoringConfig": {
    "driftDetection": true,
    "healthChecks": true,
    "costMonitoring": true,
    "complianceMonitoring": true
  }
}
```

### Get Monitoring Status
```http
GET /api/monitoring/deployments/:deploymentId

Response:
{
  "deploymentId": "deploy-123",
  "status": "healthy",
  "lastChecked": "2024-01-15T10:30:00Z",
  "drift": {
    "detected": false,
    "lastCheck": "2024-01-15T10:25:00Z"
  },
  "health": {
    "status": "healthy",
    "checks": [
      {
        "name": "web-server",
        "status": "healthy",
        "responseTime": 45
      }
    ]
  },
  "cost": {
    "current": 125.50,
    "budget": 200.00,
    "trend": "stable"
  },
  "compliance": {
    "score": 95,
    "violations": []
  }
}
```

### Trigger Manual Remediation
```http
POST /api/monitoring/remediate/:deploymentId
Content-Type: application/json

{
  "action": "fix-drift",
  "approve": true
}
```

### Get Drift Report
```http
GET /api/monitoring/drift/:deploymentId

Response:
{
  "deploymentId": "deploy-123",
  "driftDetected": true,
  "driftItems": [
    {
      "resource": "azurerm_virtual_network.main",
      "property": "address_space",
      "expected": ["10.0.0.0/16"],
      "actual": ["10.0.0.0/16", "10.1.0.0/16"],
      "severity": "medium",
      "action": "auto-fix"
    }
  ],
  "autoRemediationEnabled": true
}
```

## Remediation Policies

### Drift Remediation
```yaml
drift_remediation:
  enabled: true
  auto_fix:
    - severity: low
      action: fix
      approval: auto
    - severity: medium
      action: fix
      approval: auto
      max_resources: 5
    - severity: high
      action: notify
      approval: manual
```

### Health Remediation
```yaml
health_remediation:
  unhealthy_service:
    action: restart
    max_attempts: 3
    backoff: exponential
  resource_exhaustion:
    action: scale_up
    threshold: 80%
    max_scale: 2x
```

### Cost Optimization
```yaml
cost_optimization:
  idle_resources:
    detection_period: 7d
    action: stop
    approval: auto
  oversized_resources:
    detection: usage < 30%
    action: recommend_downsize
    approval: manual
```

## Self-Healing Workflows

### Workflow 1: Drift Detected → Auto-Fix
```
1. Detect drift (5-min polling)
2. Classify severity (low/medium/high)
3. Check remediation policy
4. If auto-fix enabled:
   a. Create remediation plan
   b. Apply configuration
   c. Verify fix
   d. Log action
5. If manual approval:
   a. Create incident
   b. Notify team
```

### Workflow 2: Service Unhealthy → Auto-Restart
```
1. Health check fails (3 consecutive)
2. Classify issue (service down, slow response, error rate)
3. Check remediation policy
4. If restart enabled:
   a. Attempt graceful restart
   b. Wait for service recovery (30s)
   c. Verify health
   d. If failed, escalate
5. Log action and metrics
```

### Workflow 3: Cost Anomaly → Auto-Optimize
```
1. Detect cost spike (threshold exceeded)
2. Analyze cause (new resources, usage increase)
3. Identify optimization opportunities
4. If auto-optimize enabled:
   a. Stop idle resources
   b. Schedule non-critical workloads
   c. Apply reserved instance recommendations
5. Report savings
```

## Environment Variables

```env
PORT=3007
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/iac_dharma

# Redis for caching
REDIS_HOST=redis
REDIS_PORT=6379

# Monitoring intervals
DRIFT_CHECK_INTERVAL=300000  # 5 minutes
HEALTH_CHECK_INTERVAL=60000  # 1 minute
COST_CHECK_INTERVAL=3600000  # 1 hour

# Cloud provider credentials
AZURE_SUBSCRIPTION_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# Service endpoints
ORCHESTRATOR_URL=http://orchestrator:3005
IAC_GENERATOR_URL=http://iac-generator:3002

# Alerts
ALERT_WEBHOOK_URL=
ALERT_EMAIL=
SLACK_WEBHOOK_URL=

# Logging
LOG_LEVEL=info
```

## Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Docker

```bash
# Build image
docker build -t monitoring-service .

# Run container
docker run -p 3007:3007 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_HOST=redis \
  monitoring-service
```

## Metrics & Alerts

### Prometheus Metrics
- `drift_detections_total` - Total drift detections
- `drift_remediations_total` - Total auto-remediations
- `health_checks_total` - Total health checks
- `health_check_failures_total` - Failed health checks
- `cost_anomalies_total` - Cost anomaly detections
- `remediation_duration_seconds` - Remediation execution time

### Alerts
- **Critical Drift**: Manual approval required
- **Service Down**: Multiple restart attempts failed
- **Cost Overrun**: Budget threshold exceeded
- **Compliance Violation**: Critical security issue detected

## Integration

### With Automation Engine
The monitoring service integrates with the automation engine for:
- Post-deployment verification
- Continuous monitoring registration
- Auto-healing trigger coordination

### With Guardrails Engine
- Continuous compliance validation
- Policy violation detection
- Auto-remediation coordination

### With Orchestrator
- Deployment status updates
- Rollback triggering
- State synchronization

## Related Services

- [Automation Engine](../automation-engine/README.md)
- [Guardrails Engine](../guardrails-engine/README.md)
- [Orchestrator Service](../orchestrator-service/README.md)
- [Architecture Documentation](../../docs/architecture/README.md)
