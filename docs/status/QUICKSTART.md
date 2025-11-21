# Quick Start Guide - End-to-End Automation

This guide will help you get started with IAC DHARMA's complete automation capabilities.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Access to cloud provider accounts (Azure/AWS/GCP)
- Snyk account for security scanning (optional)

## Setup Steps

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/iac-dharma/platform.git
cd platform

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check services are running
docker-compose ps

# View logs
docker-compose logs -f automation-engine
```

### 3. Verify Services

```bash
# Check all services are healthy
curl http://localhost:3006/health  # Automation Engine
curl http://localhost:3007/health  # Monitoring Service
curl http://localhost:3000/health  # API Gateway
curl http://localhost:8000/health  # AI Engine
```

## Using Automation

### Level 1: Semi-Automated (First Time)

Start with manual approvals to learn the platform:

```bash
curl -X POST http://localhost:3006/api/automation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requirements": "Create a development environment with web server and PostgreSQL database on Azure",
    "automationLevel": 1,
    "environment": "dev"
  }'
```

**What happens**:
1. AI generates blueprint
2. **You review and approve** the design
3. IaC is generated
4. **You approve** deployment
5. Infrastructure is deployed

### Level 2: Auto-Approved (Standard)

Enable automation for development environments:

```bash
curl -X POST http://localhost:3006/api/automation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requirements": "Deploy 3-tier web application with load balancer, app servers, and database",
    "automationLevel": 2,
    "environment": "dev"
  }'
```

**What happens**:
1. AI generates blueprint
2. Auto-validation with remediation
3. **Auto-approval** if conditions met
4. IaC generation
5. **Auto-deployment**
6. Continuous monitoring starts

### Level 3: Fully Autonomous (Advanced)

Enable complete automation for production:

```bash
curl -X POST http://localhost:3006/api/automation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requirements": "Scale web application cluster from 3 to 5 nodes",
    "automationLevel": 3,
    "environment": "prod"
  }'
```

**What happens**:
1. Complete end-to-end automation
2. Auto-validation and remediation
3. Auto-approval (strict rules for prod)
4. Auto-deployment
5. **Self-healing** enabled
6. **Auto-remediation** on drift

## Tracking Workflows

### Get Workflow Status

```bash
# Get the workflow ID from the start response
WORKFLOW_ID="wf-12345-67890"

# Check status
curl http://localhost:3006/api/automation/status/$WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example**:
```json
{
  "id": "wf-12345-67890",
  "status": "running",
  "currentStep": "deploy",
  "steps": [
    {
      "name": "design",
      "status": "completed",
      "result": { "blueprintId": "bp-789" }
    },
    {
      "name": "validate",
      "status": "completed",
      "result": { "passed": true }
    },
    {
      "name": "approval",
      "status": "completed",
      "result": { "approved": true }
    },
    {
      "name": "generate",
      "status": "completed",
      "result": { "iacJobId": "iac-456" }
    },
    {
      "name": "deploy",
      "status": "running"
    }
  ]
}
```

### Cancel Workflow

```bash
curl -X POST http://localhost:3006/api/automation/cancel/$WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Monitoring Deployments

### Register Deployment for Monitoring

After deployment, register it for continuous monitoring:

```bash
curl -X POST http://localhost:3007/api/monitoring/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deploymentId": "deploy-123",
    "blueprintId": "bp-789",
    "environment": "prod",
    "monitoringConfig": {
      "driftDetection": true,
      "healthChecks": true,
      "costMonitoring": true,
      "complianceMonitoring": true
    }
  }'
```

### Check Deployment Health

```bash
# Get comprehensive status
curl http://localhost:3007/api/monitoring/deployments/deploy-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example**:
```json
{
  "deploymentId": "deploy-123",
  "status": "healthy",
  "drift": {
    "detected": false,
    "lastCheck": "2024-01-15T10:30:00Z"
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
  }
}
```

### Get Drift Report

```bash
curl http://localhost:3007/api/monitoring/drift/deploy-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Scenarios

### Scenario 1: Deploy Web Application

```bash
curl -X POST http://localhost:3006/api/automation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requirements": "Deploy Node.js web application with Redis cache, PostgreSQL database, and HTTPS load balancer on Azure. Enable auto-scaling based on CPU usage.",
    "automationLevel": 2,
    "environment": "staging"
  }'
```

### Scenario 2: Add Database Replica

```bash
curl -X POST http://localhost:3006/api/automation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requirements": "Add a read replica to existing PostgreSQL database in the production environment for improved read performance",
    "automationLevel": 3,
    "environment": "prod"
  }'
```

### Scenario 3: Scale Resources

```bash
curl -X POST http://localhost:3006/api/automation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requirements": "Scale web server instances from 3 to 5 and increase database size from 100GB to 200GB",
    "automationLevel": 2,
    "environment": "prod"
  }'
```

## Accessing Dashboards

### Grafana (Monitoring Dashboards)

```
URL: http://localhost:3030
Username: admin
Password: admin
```

**Available Dashboards**:
- Automation Workflows
- Approval Analytics
- Infrastructure Health
- Cost Optimization

### Frontend UI

```
URL: http://localhost:5173
```

Use the Lotus Base UI to:
- View blueprints
- Monitor deployments
- Manage workflows
- Review costs

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs automation-engine
docker-compose logs monitoring-service

# Restart specific service
docker-compose restart automation-engine
```

### Workflow Stuck

```bash
# Check service health
curl http://localhost:3006/health
curl http://localhost:3001/health  # Blueprint service
curl http://localhost:8000/health  # AI engine

# Cancel and retry
curl -X POST http://localhost:3006/api/automation/cancel/$WORKFLOW_ID
```

### Auto-Approval Denied

Check the workflow status for the denial reason:

```bash
curl http://localhost:3006/api/automation/status/$WORKFLOW_ID
```

Common reasons:
- Security score below threshold
- Cost exceeds budget
- Guardrails validation failed
- Risk level too high

**Fix**: Address the issues and retry the workflow

## Next Steps

1. **Explore Documentation**: Read `docs/END_TO_END_AUTOMATION.md`
2. **Configure Policies**: Customize auto-approval rules in `docs/AUTOMATION.md`
3. **Set Up CI/CD**: Configure GitHub Actions for your repository
4. **Production Deployment**: Deploy to Kubernetes using manifests in `deployment/kubernetes/`

## Getting Help

- **Documentation**: `/docs` directory
- **API Reference**: http://localhost:3000/api-docs
- **Logs**: `docker-compose logs -f <service-name>`
- **Health Checks**: `curl http://localhost:<port>/health`

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate tokens regularly**
3. **Enable Snyk security scanning**
4. **Review approval policies** before enabling Level 3
5. **Monitor audit logs** for all automation actions

---

**Congratulations! You're now ready to use IAC DHARMA's complete automation capabilities! 🎉**
