# Automation Engine

End-to-end automation orchestration service with intelligent auto-approval capabilities.

## Features

- **Workflow Orchestration**: Manages complete automation workflows from requirements to deployment
- **Auto-Approval Engine**: Policy-based approval decisions for autonomous operations
- **Multi-Level Automation**: Supports semi-automated, auto-approved, and fully autonomous modes
- **State Management**: Tracks workflow progress and enables recovery
- **Integration Hub**: Coordinates with all microservices (AI, validation, IaC, deployment)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Automation Orchestrator                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐│
│  │ Design   │──>│ Validate │──>│ Approve  │──>│ Deploy   ││
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘│
│       │              │               │              │       │
│       v              v               v              v       │
│  AI Engine    Guardrails     Auto-Approval   Orchestrator  │
│                Service          Engine          Service     │
└─────────────────────────────────────────────────────────────┘
```

## Workflow Steps

1. **Design**: AI-powered blueprint generation from natural language requirements
2. **Validate**: Guardrails checking (security, compliance, cost, performance)
3. **Approve**: Policy-based auto-approval decision with risk assessment
4. **Generate**: Infrastructure-as-Code generation (Terraform/Bicep/CloudFormation)
5. **Deploy**: Automated deployment with monitoring
6. **Verify**: Post-deployment validation and health checks

## Automation Levels

### Level 1: Semi-Automated
- AI generates blueprint
- Manual review required
- Manual approval required
- Use case: Learning, experimentation

### Level 2: Auto-Approved
- AI generates blueprint
- Auto-validation with remediation
- Auto-approval for low-risk changes
- Manual approval for high-risk
- Use case: Dev/staging environments

### Level 3: Fully Autonomous
- End-to-end automation
- Auto-remediation on failure
- Continuous monitoring
- Self-healing capabilities
- Use case: Production with mature governance

## Auto-Approval Rules

### Design-Time Checks
- ✅ All guardrails pass (security, compliance, cost)
- ✅ Security score ≥ 85
- ✅ Complexity score ≤ 70
- ✅ Cost within budget
- ✅ No critical vulnerabilities

### Deployment-Time Checks (by Environment)

**Dev**
- Security score ≥ 70
- Risk level ≤ 50

**Staging**
- Security score ≥ 80
- Risk level ≤ 30

**Production**
- Security score ≥ 90
- Risk level ≤ 20
- Automation level = 3
- Successful staging deployment required

## API Endpoints

### Start Workflow
```http
POST /api/automation/start
Content-Type: application/json

{
  "requirements": "Create 3-tier web app on Azure with PostgreSQL",
  "automationLevel": 2,
  "environment": "dev"
}

Response: 202 Accepted
{
  "workflowId": "uuid",
  "status": "started"
}
```

### Get Workflow Status
```http
GET /api/automation/status/:workflowId

Response: 200 OK
{
  "id": "uuid",
  "status": "running",
  "currentStep": "validate",
  "steps": [
    {
      "name": "design",
      "status": "completed",
      "startedAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T10:01:30Z",
      "result": { "blueprintId": "bp-123" }
    },
    {
      "name": "validate",
      "status": "running",
      "startedAt": "2024-01-15T10:01:30Z"
    }
  ]
}
```

### Cancel Workflow
```http
POST /api/automation/cancel/:workflowId

Response: 200 OK
{
  "message": "Workflow cancelled"
}
```

## Environment Variables

```env
PORT=3006
NODE_ENV=development

# Redis for workflow state
REDIS_HOST=redis
REDIS_PORT=6379

# Service endpoints
AI_ENGINE_URL=http://ai-engine:8000
BLUEPRINT_SERVICE_URL=http://blueprint-service:3001
IAC_GENERATOR_URL=http://iac-generator:3002
GUARDRAILS_ENGINE_URL=http://guardrails-engine:3003
COSTING_SERVICE_URL=http://costing-service:3004
ORCHESTRATOR_SERVICE_URL=http://orchestrator:3005

# Logging
LOG_LEVEL=info
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Docker

```bash
# Build image
docker build -t automation-engine .

# Run container
docker run -p 3006:3006 \
  -e REDIS_HOST=redis \
  -e AI_ENGINE_URL=http://ai-engine:8000 \
  automation-engine
```

## Testing

```bash
# Run tests
npm test

# End-to-end workflow test
curl -X POST http://localhost:3006/api/automation/start \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "Deploy web app with database",
    "automationLevel": 2,
    "environment": "dev"
  }'
```

## Monitoring

The automation engine exposes metrics for:
- Workflow success/failure rates
- Average execution time per step
- Auto-approval acceptance rate
- Auto-remediation success rate

Metrics available at `/metrics` endpoint (Prometheus format).

## Related Services

- **AI Engine**: Blueprint generation and risk assessment
- **Guardrails Engine**: Validation and auto-remediation
- **Auto-Approval Service**: Policy evaluation (this service)
- **IaC Generator**: Infrastructure code generation
- **Orchestrator Service**: Deployment execution and monitoring

## References

- [Automation Documentation](../../docs/AUTOMATION.md)
- [Architecture Overview](../../docs/architecture/README.md)
- [API Gateway Integration](../api-gateway/README.md)
