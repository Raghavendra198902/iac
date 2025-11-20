# Guardrails Engine

Policy enforcement engine for IAC DHARMA that validates infrastructure blueprints against security, compliance, cost, and operational policies with automated remediation capabilities.

## Overview

The Guardrails Engine ensures infrastructure deployments meet organizational standards by evaluating blueprints and IaC code against customizable policies before deployment.

## Features

### 20+ Built-in Policies
- **Security**: Encryption, TLS, MFA, network segmentation, public access control
- **Compliance**: Tagging, naming conventions, audit logging, data residency, backups
- **Cost Optimization**: Right-sizing, reserved instances, auto-scaling, idle detection
- **Operational**: High availability, monitoring, disaster recovery, health checks

### Policy Evaluation
- Blueprint validation before code generation
- IaC code scanning (Terraform, Bicep, CloudFormation)
- Environment-specific policy enforcement (dev/staging/prod)
- Compliance scoring (0-100)

### Auto-Remediation
- Automatic fixes for common violations
- Manual remediation suggestions
- Configurable remediation actions

### Integration
- Used by Automation Engine for auto-approval decisions
- Provides compliance metrics for dashboards
- Feeds security scores to monitoring service

## API Endpoints

### 1. Evaluate Policies

**POST** `/api/evaluate`

Evaluate a blueprint or IaC code against policies.

**Request:**
```json
{
  "blueprintId": "uuid",
  "policies": ["sec-001", "cost-001"],
  "environment": "production"
}
```

**Response:**
```json
{
  "id": "eval-uuid",
  "blueprintId": "uuid",
  "timestamp": "2024-01-01T00:00:00Z",
  "passed": false,
  "score": 75,
  "violations": [
    {
      "policyId": "sec-002",
      "policyName": "Public Access Prohibited",
      "severity": "critical",
      "category": "security",
      "resource": "storage-account-1",
      "message": "Policy violation: Public Access Prohibited",
      "canAutoRemediate": true
    }
  ],
  "summary": {
    "total": 3,
    "critical": 1,
    "high": 1,
    "medium": 1,
    "low": 0,
    "info": 0
  },
  "remediations": [...]
}
```

### 2. List Policies

**GET** `/api/policies?category=security&severity=high&enabled=true`

Get all policies with optional filters.

**Response:**
```json
{
  "policies": [...],
  "count": 20
}
```

### 3. Get Policy Details

**GET** `/api/policies/:id`

Get details of a specific policy.

### 4. Auto-Remediate

**POST** `/api/remediate`

Apply automatic remediations for violations.

**Request:**
```json
{
  "evaluationId": "eval-uuid",
  "violationIds": ["sec-001", "cost-003"]
}
```

### 5. Compliance Score

**GET** `/api/compliance/:blueprintId`

Get compliance score and trend for a blueprint.

**Response:**
```json
{
  "blueprintId": "uuid",
  "score": 85,
  "status": "compliant",
  "violations": {
    "total": 2,
    "critical": 0,
    "high": 0,
    "medium": 2,
    "low": 0,
    "info": 0
  },
  "lastEvaluated": "2024-01-01T00:00:00Z",
  "trend": "improving"
}
```

## Built-in Policies

### Security Policies

**sec-001: Encryption at Rest**
- **Severity**: Critical
- **Applies to**: Storage, Database
- **Check**: `encryption_enabled` must be `true`
- **Remediation**: Auto - Enable encryption

**sec-002: Public Access Prohibited**
- **Severity**: Critical  
- **Applies to**: Storage, Database, Network
- **Check**: `public_access` must be `false`
- **Remediation**: Auto - Disable public access

**sec-003: TLS 1.2+ Required**
- **Severity**: High
- **Applies to**: App Service, API Gateway, Load Balancer
- **Check**: `min_tls_version` >= 1.2
- **Remediation**: Auto - Set TLS 1.2

**sec-004: MFA Required**
- **Severity**: High
- **Applies to**: Identity, User Pool
- **Check**: `mfa_enabled` must be `true`
- **Remediation**: Manual

**sec-005: Network Segmentation**
- **Severity**: High
- **Applies to**: Compute, Database, Storage
- **Check**: `subnet_type` must be `private`
- **Remediation**: Suggest

### Compliance Policies

**comp-001: Resource Tagging**
- **Severity**: Medium
- **Check**: Must have Environment, Owner, CostCenter tags
- **Remediation**: Auto - Add tags

**comp-002: Naming Convention**
- **Severity**: Low
- **Pattern**: `{env}-{app}-{resource}-{region}`
- **Remediation**: Suggest

**comp-003: Audit Logging**
- **Severity**: High
- **Applies to**: Database, Storage, Compute
- **Check**: `audit_logging` must be `true`
- **Remediation**: Auto

**comp-004: Data Residency**
- **Severity**: Critical
- **Check**: Resources in approved regions only
- **Remediation**: Manual

**comp-005: Backup Policy**
- **Severity**: High
- **Applies to**: Database, Storage
- **Check**: `backup_policy` must be configured
- **Remediation**: Suggest

### Cost Optimization Policies

**cost-001: Right-Sizing**
- **Severity**: Medium
- **Applies to**: Compute
- **Check**: VM sizes should not be oversized (XL, XXL, 32, 64 cores)
- **Remediation**: Suggest

**cost-002: Reserved Instances**
- **Severity**: Low
- **Applies to**: Compute, Database
- **Check**: Production resources should use reserved pricing
- **Remediation**: Suggest

**cost-003: Auto-Scaling**
- **Severity**: Medium
- **Applies to**: Compute, App Service
- **Check**: `auto_scaling` must be enabled
- **Remediation**: Auto

**cost-004: Idle Resource Detection**
- **Severity**: Low
- **Check**: `monitoring_enabled` must be `true`
- **Remediation**: Auto

### Operational Policies

**ops-001: High Availability**
- **Severity**: High
- **Applies to**: Compute, Database, Load Balancer
- **Check**: `availability_zones` >= 2
- **Remediation**: Suggest

**ops-002: Monitoring Enabled**
- **Severity**: Medium
- **Check**: `monitoring_enabled` must be `true`
- **Remediation**: Auto

**ops-003: Disaster Recovery**
- **Severity**: High
- **Applies to**: Database, Storage
- **Check**: `dr_enabled` must be `true`
- **Remediation**: Suggest

**ops-004: Health Checks**
- **Severity**: Medium
- **Applies to**: App Service, API Gateway, Load Balancer
- **Check**: `health_check` must be configured
- **Remediation**: Auto

## Policy Evaluation Logic

### Scoring Algorithm

```
Score = 100 - (weighted_violations / max_possible_violations * 100)

Weights:
- Critical: 10 points
- High: 5 points
- Medium: 2 points
- Low: 1 point
- Info: 0 points
```

### Pass/Fail Criteria

- **Pass**: No critical or high severity violations
- **Fail**: Any critical or high severity violations present

### Environment-Specific Rules

Policies can have different thresholds based on environment:
- **Development**: More lenient, warnings only
- **Staging**: Medium enforcement
- **Production**: Strict enforcement, all policies active

## Usage Examples

### Example 1: Evaluate Blueprint Before Deployment

```bash
# Step 1: Create blueprint
BLUEPRINT_ID=$(curl -X POST http://blueprint-service:3001/api/blueprints \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Web Application",
    "targetCloud": "azure",
    "components": [{
      "name": "webapp-storage",
      "type": "storage",
      "properties": {
        "public_access": true,
        "encryption_enabled": false
      }
    }]
  }' | jq -r '.id')

# Step 2: Evaluate policies
curl -X POST http://localhost:3003/api/evaluate \
  -d "{\"blueprintId\": \"$BLUEPRINT_ID\", \"environment\": \"production\"}"

# Response shows violations:
# - sec-001: Encryption not enabled (Critical)
# - sec-002: Public access enabled (Critical)
# Score: 40/100 - FAILED
```

### Example 2: Auto-Remediate Violations

```bash
# Get evaluation ID from previous result
EVAL_ID="eval-abc-123"

# Apply auto-remediations
curl -X POST http://localhost:3003/api/remediate \
  -d "{\"evaluationId\": \"$EVAL_ID\"}"

# Response:
# {
#   "remediations": [
#     {
#       "violationId": "sec-001",
#       "type": "auto",
#       "action": "Enable encryption at rest"
#     },
#     {
#       "violationId": "sec-002",
#       "type": "auto",
#       "action": "Disable public access"
#     }
#   ]
# }
```

### Example 3: Check Compliance Score

```bash
curl http://localhost:3003/api/compliance/$BLUEPRINT_ID

# Response:
# {
#   "blueprintId": "...",
#   "score": 95,
#   "status": "compliant",
#   "trend": "improving",
#   "violations": { "total": 1, "medium": 1 }
# }
```

### Example 4: Evaluate Custom Policy Set

```bash
# Evaluate only security policies
curl -X POST http://localhost:3003/api/evaluate \
  -d '{
    "blueprintId": "uuid",
    "policies": ["sec-001", "sec-002", "sec-003", "sec-004", "sec-005"],
    "environment": "production"
  }'
```

## Integration with Automation Engine

The Guardrails Engine integrates with the Automation Engine for auto-approval decisions:

```typescript
// In Automation Engine
const evaluation = await axios.post('http://guardrails-engine:3003/api/evaluate', {
  blueprintId: workflow.blueprintId,
  environment: workflow.environment
});

const canAutoApprove = 
  evaluation.data.passed &&
  evaluation.data.score >= getRequiredScore(workflow.environment);

if (canAutoApprove) {
  // Proceed with deployment
} else {
  // Require manual approval
  sendNotificationToApprovers(evaluation.data.violations);
}
```

## Configuration

### Environment Variables

```bash
PORT=3003
NODE_ENV=production
LOG_LEVEL=info

BLUEPRINT_SERVICE_URL=http://blueprint-service:3001

POLICY_EVALUATION_TIMEOUT_MS=60000
MAX_EVALUATIONS_RETAINED=100
```

## Security

### ReDoS Prevention
- All regex patterns validated at startup
- Unsafe regex patterns rejected
- User input limited to pre-validated policy IDs
- Pattern complexity limits enforced

### Policy Validation
- Policies loaded and validated at service startup
- Only whitelisted policy IDs accepted from API
- Regular expressions checked for safety

## Development

### Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

### Adding Custom Policies

Edit `src/policies/default-policies.ts`:

```typescript
{
  id: 'custom-001',
  name: 'My Custom Policy',
  description: 'Description of what this checks',
  category: 'security',
  severity: 'high',
  enabled: true,
  rule: {
    type: 'configuration',
    condition: 'properties.my_setting',
    operator: 'equals',
    value: 'expected_value',
    scope: ['compute', 'storage']
  },
  remediation: {
    type: 'auto',
    action: 'Fix the setting',
    parameters: { my_setting: 'expected_value' }
  },
  tags: ['custom', 'security']
}
```

## Deployment

### Docker

```bash
docker build -t guardrails-engine:latest .
docker run -p 3003:3003 \
  -e BLUEPRINT_SERVICE_URL=http://blueprint-service:3001 \
  guardrails-engine:latest
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: guardrails-engine
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: guardrails-engine
        image: guardrails-engine:latest
        ports:
        - containerPort: 3003
        env:
        - name: BLUEPRINT_SERVICE_URL
          value: "http://blueprint-service:3001"
```

## Troubleshooting

### Low Compliance Score

**Issue**: Blueprint has low compliance score

**Solution**:
1. Check violations: `GET /api/evaluations/:id`
2. Review specific violations and severity
3. Apply auto-remediations: `POST /api/remediate`
4. Update blueprint to fix manual issues
5. Re-evaluate

### Policy Not Triggering

**Issue**: Expected policy violation not detected

**Solution**:
1. Verify policy is enabled: `GET /api/policies/:id`
2. Check policy scope matches resource type
3. Verify condition path matches blueprint structure
4. Check logs for evaluation details

### Auto-Remediation Not Working

**Issue**: Remediation doesn't fix violation

**Solution**:
1. Check if policy supports auto-remediation (`remediation.type === 'auto'`)
2. Verify remediation parameters are correct
3. Some policies require manual fixes (networking, IAM)

## Future Enhancements

1. **Custom Policy Language**: DSL for defining policies without code changes
2. **Policy Testing**: Unit test framework for policies
3. **Compliance Frameworks**: Pre-built policy sets for CIS, NIST, HIPAA, SOC2
4. **Machine Learning**: Learn optimal policies from historical violations
5. **Policy Versioning**: Track policy changes over time
6. **External Policy Sources**: Import policies from OPA, Sentinel, etc.

## License

Copyright © 2024 IAC DHARMA Platform
