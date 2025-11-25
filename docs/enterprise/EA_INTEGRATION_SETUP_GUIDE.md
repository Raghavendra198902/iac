# Enterprise Architecture Integration - Setup Guide

## Overview
This guide provides step-by-step instructions for setting up and configuring the Enterprise Architecture integration components in IAC DHARMA.

---

## Prerequisites

### Software Requirements
- **Node.js**: v18.x or later
- **PostgreSQL**: v14.x or later
- **Redis**: v7.x or later
- **Open Policy Agent (OPA)**: v0.60.0 or later
- **Docker**: v24.x or later (for containerized deployment)

### Access Requirements
- Database admin access for schema creation
- API Gateway admin privileges
- Cloud provider credentials (for guardrails validation)

---

## Installation Steps

### 1. Database Setup

Run the architecture decisions schema migration:

```bash
# Connect to PostgreSQL
psql -U postgres -d iac_dharma

# Run the schema file
\i database/schemas/architecture_decisions.sql

# Verify tables were created
\dt architecture_*

# Expected output:
# - architecture_decisions
# - blueprint_architecture_decisions
# - architecture_review_requests
# - architecture_templates
# - architecture_assets
# - architecture_compliance_violations
```

### 2. Open Policy Agent Setup

Install and run OPA:

```bash
# Option 1: Docker (Recommended)
docker run -d \
  --name opa \
  -p 8181:8181 \
  -v $(pwd)/backend/guardrails-engine/policies:/policies \
  openpolicyagent/opa:latest \
  run --server --addr :8181 /policies

# Option 2: Binary Installation
wget https://openpolicyagent.org/downloads/latest/opa_linux_amd64
chmod +x opa_linux_amd64
sudo mv opa_linux_amd64 /usr/local/bin/opa

# Run OPA server
opa run --server --addr :8181 backend/guardrails-engine/policies/
```

Verify OPA is running:

```bash
curl http://localhost:8181/health
# Expected: {"status":"ok"}
```

### 3. Install NPM Dependencies

#### API Gateway
```bash
cd backend/api-gateway
npm install
```

**Required dependencies** (already in package.json):
- `express` - Web framework
- `pg` - PostgreSQL client
- `axios` - HTTP client
- `uuid` - ID generation
- `winston` - Logging

#### Guardrails Engine
```bash
cd backend/guardrails-engine

# Add OPA client if not present
npm install axios joi js-yaml
```

#### Orchestrator Service
```bash
cd backend/orchestrator-service
npm install
```

#### CMDB Agent
```bash
cd backend/cmdb-agent
npm install
```

#### Frontend
```bash
cd frontend

# Install chart.js for compliance dashboard
npm install chart.js react-chartjs-2

# Verify Material-UI is installed
npm list @mui/material @mui/icons-material
```

### 4. Environment Configuration

Create/update `.env` files:

#### API Gateway (`.env`)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/iac_dharma

# Redis
REDIS_URL=redis://localhost:6379

# OPA Integration
OPA_URL=http://localhost:8181
OPA_ENABLED=true

# Architecture Review Configuration
ARB_MEETING_SCHEDULE=weekly
AUTO_APPROVAL_THRESHOLD=5000
ARCHITECTURE_REVIEW_SLA_DAYS=5

# Notification Settings
NOTIFICATION_EMAIL_ENABLED=true
ARCHITECTURE_REVIEW_EMAILS=architecture-board@company.com

# Feature Flags
FEATURE_ARCHITECTURE_APPROVAL=true
FEATURE_ADR_MANAGEMENT=true
FEATURE_COMPLIANCE_DASHBOARD=true
```

#### Guardrails Engine (`.env`)
```bash
OPA_URL=http://localhost:8181
OPA_TIMEOUT_MS=5000
POLICY_ENFORCEMENT_MODE=strict
FALLBACK_VALIDATION=true

# Compliance Framework Configuration
COMPLIANCE_FRAMEWORKS=SOC2,ISO27001,PCI-DSS,GDPR,HIPAA
DEFAULT_COMPLIANCE_FRAMEWORK=SOC2

# Technology Catalog
APPROVED_DATABASES=postgresql,mysql,mongodb,cosmosdb,dynamodb
APPROVED_COMPUTE=vm,kubernetes,aks,eks,gke,azure-functions,lambda
APPROVED_STORAGE=s3,azure-blob,gcs,ebs,azure-disk
```

#### Orchestrator Service (`.env`)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/iac_dharma

# Workflow Configuration
WORKFLOW_MAX_PARALLEL_REVIEWS=10
WORKFLOW_TIMEOUT_DAYS=30
WORKFLOW_AUTO_ESCALATE_DAYS=7

# Approval Bot Configuration
AUTO_APPROVAL_ENABLED=true
AUTO_APPROVAL_MAX_COST=5000
AUTO_REJECTION_CRITICAL_VIOLATIONS=true
```

### 5. Docker Compose Setup

Add OPA service to `docker-compose.yml`:

```yaml
services:
  # ... existing services ...

  opa:
    image: openpolicyagent/opa:latest
    container_name: opa
    ports:
      - "8181:8181"
    volumes:
      - ./backend/guardrails-engine/policies:/policies
    command:
      - "run"
      - "--server"
      - "--addr"
      - ":8181"
      - "/policies"
    networks:
      - dharma-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8181/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  guardrails-engine:
    depends_on:
      - opa
      - postgres
      - redis
    environment:
      - OPA_URL=http://opa:8181

networks:
  dharma-network:
    driver: bridge
```

### 6. Build and Start Services

```bash
# Build all services
npm run build

# Using Docker Compose (recommended)
docker-compose up -d

# Or start individually
cd backend/api-gateway && npm run dev &
cd backend/guardrails-engine && npm run dev &
cd backend/orchestrator-service && npm run dev &
cd backend/cmdb-agent && npm run dev &
cd frontend && npm run dev &
```

---

## Configuration

### Architecture Templates

Templates are located in `iac-templates/enterprise-patterns/`. Each template includes:
- `metadata.json` - Template configuration
- `main.tf` - Terraform code
- `variables.tf` - Input variables
- `outputs.tf` - Output values
- `README.md` - Documentation

To add a new template:

```bash
mkdir -p iac-templates/enterprise-patterns/my-template

# Create metadata.json
cat > iac-templates/enterprise-patterns/my-template/metadata.json << 'EOF'
{
  "id": "my-template-001",
  "name": "My Architecture Template",
  "description": "Description of the pattern",
  "version": "1.0.0",
  "complexity": "moderate",
  "estimated_cost": {
    "monthly_min_usd": 1000,
    "monthly_max_usd": 5000
  },
  "architecture_decisions": ["ADR-001"],
  "compliance": ["SOC2"],
  "guardrails": ["encryption_at_rest", "encryption_in_transit"]
}
EOF
```

### OPA Policies

Policies are located in `backend/guardrails-engine/policies/architecture-standards.rego`.

To add custom policies:

1. Edit the Rego file:
```rego
# Add custom rule
deny[msg] {
  input.resources[i].type == "aws_s3_bucket"
  not input.resources[i].config.versioning_enabled
  msg := sprintf("S3 bucket '%s' must have versioning enabled", [input.resources[i].name])
}
```

2. Test the policy:
```bash
# Create test input
cat > test-input.json << EOF
{
  "resources": [{
    "type": "aws_s3_bucket",
    "name": "my-bucket",
    "config": {}
  }]
}
EOF

# Test policy
opa eval -d backend/guardrails-engine/policies/architecture-standards.rego \
  -i test-input.json \
  "data.architecture.deny"
```

3. Reload OPA:
```bash
# Docker
docker restart opa

# Binary
killall opa && opa run --server --addr :8181 backend/guardrails-engine/policies/
```

### Reviewer Routing Rules

Edit `backend/orchestrator-service/src/workflows/architecture-approval.ts`:

```typescript
// Customize routing logic in getRequiredReviewers()
private getRequiredReviewers(blueprint: any): string[] {
  const reviewers: string[] = [];

  // Add your custom logic
  if (blueprint.tags?.compliance_framework === 'HIPAA') {
    reviewers.push('healthcare-architect@company.com');
  }

  // ... existing logic ...
  
  return reviewers;
}
```

---

## Verification

### 1. Test Database Connectivity

```bash
# Test from API Gateway
curl http://localhost:3000/api/health

# Should include database status
```

### 2. Test OPA Integration

```bash
# Test policy evaluation
curl -X POST http://localhost:8181/v1/data/architecture/deny \
  -H 'Content-Type: application/json' \
  -d '{
    "input": {
      "project_name": "test-project",
      "environment": "production",
      "resources": []
    }
  }'
```

### 3. Test ADR API

```bash
# Create ADR
curl -X POST http://localhost:3000/api/adr \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "title": "Use PostgreSQL for primary database",
    "status": "proposed",
    "context": "Need reliable ACID compliance",
    "decision": "PostgreSQL chosen",
    "consequences": "Strong consistency guarantees",
    "domain": "data"
  }'

# List ADRs
curl http://localhost:3000/api/adr \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### 4. Test Approval Workflow

```bash
# Create review request
curl -X POST http://localhost:3000/api/architecture/reviews \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "blueprint_id": "bp-123",
    "requestor": "developer@company.com",
    "priority": "medium"
  }'
```

### 5. Test Compliance Dashboard

Open browser to: `http://localhost:5173/architecture/compliance`

Should display:
- Compliance score gauge
- Active violations
- Portfolio metrics
- Asset distribution charts

---

## Monitoring

### Health Checks

```bash
# API Gateway
curl http://localhost:3000/health/ready

# OPA
curl http://localhost:8181/health

# Guardrails Engine
curl http://localhost:3001/health
```

### Logs

```bash
# API Gateway logs
tail -f backend/api-gateway/logs/combined.log

# Guardrails Engine logs
tail -f backend/guardrails-engine/logs/combined.log

# Orchestrator logs
tail -f backend/orchestrator-service/logs/combined.log
```

### Metrics

Access Prometheus metrics:

```bash
# API Gateway metrics
curl http://localhost:3000/metrics

# Key metrics to monitor:
# - architecture_review_requests_total
# - architecture_review_duration_seconds
# - adr_operations_total
# - compliance_violations_total
# - guardrails_evaluations_total
```

---

## Troubleshooting

### OPA Connection Issues

**Error**: `Failed to connect to OPA at http://localhost:8181`

**Solutions**:
1. Verify OPA is running: `curl http://localhost:8181/health`
2. Check OPA logs: `docker logs opa`
3. Test network connectivity: `telnet localhost 8181`
4. Enable fallback validation: Set `FALLBACK_VALIDATION=true` in `.env`

### Database Schema Issues

**Error**: `relation "architecture_decisions" does not exist`

**Solutions**:
1. Run schema migration: `psql -U postgres -d iac_dharma -f database/schemas/architecture_decisions.sql`
2. Verify connection: `psql -U postgres -d iac_dharma -c "\dt architecture_*"`
3. Check permissions: User needs CREATE TABLE privileges

### Frontend Chart Issues

**Error**: `Cannot find module 'chart.js'`

**Solutions**:
```bash
cd frontend
npm install chart.js react-chartjs-2
npm run dev
```

### Route Not Found

**Error**: `404 Not Found: /api/adr`

**Solutions**:
1. Verify routes are registered in `backend/api-gateway/src/routes/index.ts`
2. Rebuild: `cd backend/api-gateway && npm run build`
3. Restart: `npm run dev`

---

## Performance Tuning

### Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_adr_status ON architecture_decisions(status);
CREATE INDEX CONCURRENTLY idx_adr_domain ON architecture_decisions(domain);
CREATE INDEX CONCURRENTLY idx_review_status ON architecture_review_requests(status);
CREATE INDEX CONCURRENTLY idx_assets_type ON architecture_assets(asset_type);

-- Monitor query performance
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%architecture_%' 
ORDER BY total_exec_time DESC LIMIT 10;
```

### OPA Policy Caching

Enable OPA decision caching:

```yaml
# opa-config.yaml
decision_logs:
  console: true
caching:
  inter_query_builtin_cache:
    max_size_bytes: 10485760  # 10MB
```

Run OPA with config:
```bash
opa run --server --config-file opa-config.yaml backend/guardrails-engine/policies/
```

### Redis Caching

Enable caching for frequently accessed data:

```typescript
// In API Gateway
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache ADR list
app.get('/api/adr', async (req, res) => {
  const cacheKey = `adr:list:${JSON.stringify(req.query)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // ... fetch from DB ...
  await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 min TTL
  res.json(result);
});
```

---

## Security Hardening

### API Authentication

Ensure all EA endpoints require authentication:

```typescript
// In routes/index.ts
router.use('/adr', authMiddleware, adrRoutes);
router.use('/architecture', authMiddleware, metricsRoutes);
```

### Role-Based Access Control

```typescript
// Add authorization middleware
import { authorize } from '../middleware/auth';

router.post('/adr', 
  authMiddleware, 
  authorize(['enterprise_architect', 'solution_architect']), 
  createADR
);
```

### OPA Policy Security

```rego
# Restrict policy modification
package system.authz

default allow = false

allow {
  input.method == "POST"
  input.path[0] == "v1"
  input.path[1] == "policies"
  token.payload.role == "admin"
}
```

---

## Backup and Recovery

### Database Backups

```bash
# Backup architecture data
pg_dump -U postgres -d iac_dharma \
  -t 'architecture_*' \
  -f architecture_backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -d iac_dharma -f architecture_backup_20240101.sql
```

### OPA Policy Backups

```bash
# Backup policies
tar -czf opa_policies_$(date +%Y%m%d).tar.gz \
  backend/guardrails-engine/policies/

# Restore
tar -xzf opa_policies_20240101.tar.gz
```

---

## Next Steps

1. **Customize Templates**: Add organization-specific architecture patterns
2. **Define Standards**: Document ADRs for technology choices
3. **Configure Policies**: Tailor OPA rules to compliance requirements
4. **Set Up Notifications**: Configure email/Slack for review requests
5. **Train Users**: Conduct workshops on EA integration features
6. **Monitor Metrics**: Set up dashboards for approval times and compliance scores

---

## Support

- **Documentation**: See `docs/enterprise/` for detailed guides
- **Issues**: Report issues in project repository
- **Architecture Board**: Contact `architecture-board@company.com`

---

**Last Updated**: January 2025
**Version**: 1.0.0
