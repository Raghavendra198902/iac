# Orchestrator Service

Deployment orchestration service for IAC DHARMA that executes Infrastructure-as-Code, manages deployment state, and coordinates with cloud providers (Azure, AWS, GCP).

## Overview

The Orchestrator Service is the execution engine that takes generated IaC code and deploys it to cloud environments. It handles the complete deployment lifecycle including planning, applying, state management, rollback, and monitoring.

## Features

### Multi-Cloud Deployment
- **Terraform**: Cross-cloud deployments (Azure, AWS, GCP)
- **Bicep**: Azure-native deployments with ARM
- **CloudFormation**: AWS-native deployments

### Deployment Lifecycle
- **Plan**: Preview changes before applying
- **Apply**: Execute infrastructure provisioning
- **Rollback**: Revert to previous working state
- **Destroy**: Clean up resources

### State Management
- Version-controlled state tracking
- State locking for concurrent safety
- State backup and recovery (10 versions retained)
- State history and audit trail

### Deployment Control
- Async execution with status tracking
- Auto-approve for dev/staging
- Manual approval gates for production
- Deployment cancellation
- Real-time deployment logs

## Architecture

```
┌─────────────────┐
│  IaC Generator  │
│   (Code Gen)    │
└────────┬────────┘
         │ IaC Code
         ▼
┌─────────────────────────────────┐
│   Orchestrator Service          │
│  ┌──────────────────────────┐   │
│  │ Deployment Orchestrator  │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │   State Manager          │   │
│  └──────────────────────────┘   │
│  ┌───────┐ ┌────────┐ ┌────┐   │
│  │ TF    │ │ Bicep  │ │ CFN│   │
│  │ Exec  │ │ Exec   │ │Exec│   │
│  └───────┘ └────────┘ └────┘   │
└─────────┬───────────────────────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼────┐  ┌──▼───┐  ┌────▼───┐
│ Azure  │  │ AWS  │  │  GCP   │
└────────┘  └──────┘  └────────┘
```

## API Endpoints

### 1. Start Deployment

**POST** `/api/deployments`

Initiate infrastructure deployment.

**Request:**
```json
{
  "blueprintId": "uuid",
  "generationJobId": "uuid",
  "environment": "production",
  "targetCloud": "azure",
  "format": "terraform",
  "options": {
    "autoApprove": false,
    "dryRun": false,
    "parallelism": 10
  }
}
```

**Response (202 Accepted):**
```json
{
  "deploymentId": "uuid",
  "status": "pending",
  "message": "Deployment started"
}
```

### 2. Get Deployment Status

**GET** `/api/deployments/:id`

Check deployment progress and results.

**Response:**
```json
{
  "id": "uuid",
  "blueprintId": "uuid",
  "status": "completed",
  "environment": "production",
  "targetCloud": "azure",
  "format": "terraform",
  "state": {
    "stateId": "uuid",
    "version": 1,
    "resources": [
      {
        "id": "azurerm_virtual_machine.web",
        "type": "azurerm_virtual_machine",
        "name": "web-vm-01",
        "status": "created",
        "attributes": {...}
      }
    ],
    "locked": false
  },
  "outputs": {
    "vm_ip": "10.0.1.5",
    "resource_group": "prod-rg"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": "2024-01-01T00:05:30Z"
}
```

### 3. List Deployments

**GET** `/api/deployments?blueprintId=uuid&environment=production&status=completed&limit=10`

List deployments with filters.

### 4. Get Deployment Logs

**GET** `/api/deployments/:id/logs`

Retrieve real-time deployment logs.

**Response:**
```json
{
  "deploymentId": "uuid",
  "logs": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "level": "info",
      "message": "Starting deployment planning",
      "resource": null
    },
    {
      "timestamp": "2024-01-01T00:02:30Z",
      "level": "info",
      "message": "Resource created successfully",
      "resource": "azurerm_virtual_machine.web"
    }
  ]
}
```

### 5. Cancel Deployment

**POST** `/api/deployments/:id/cancel`

Stop an in-progress deployment.

### 6. Rollback Deployment

**POST** `/api/deployments/:id/rollback`

Revert to a previous working state.

**Request:**
```json
{
  "targetVersion": 5,
  "reason": "Critical bug in new version"
}
```

**Response:**
```json
{
  "deploymentId": "original-uuid",
  "rollbackDeploymentId": "rollback-uuid",
  "status": "applying"
}
```

### 7. Get Deployment State

**GET** `/api/deployments/:id/state`

Retrieve current infrastructure state.

### 8. Lock State

**POST** `/api/deployments/:id/state/lock`

Acquire lock for concurrent operation safety.

**Request:**
```json
{
  "operation": "apply",
  "who": "user@example.com"
}
```

### 9. Unlock State

**POST** `/api/deployments/:id/state/unlock`

Release state lock.

**Request:**
```json
{
  "lockId": "lock-uuid"
}
```

### 10. State History

**GET** `/api/deployments/:id/state/history?limit=10`

Get state version history for audit and rollback.

## Deployment Executors

### Terraform Executor

Executes Terraform-based deployments across Azure, AWS, and GCP.

**Workflow:**
1. Setup project directory with `.tf` files
2. `terraform init` - Initialize providers
3. `terraform plan` - Preview changes
4. `terraform apply` - Execute deployment
5. `terraform show` - Extract state
6. `terraform output` - Get outputs

**Features:**
- Remote state backend support
- Parallelism control
- Auto-approve option
- State locking

### Bicep Executor

Executes Azure Bicep deployments.

**Workflow:**
1. Setup project with `.bicep` file
2. `az bicep build` - Compile to ARM
3. `az deployment group validate` - Validate template
4. `az deployment group create` - Deploy to Azure
5. Extract deployment state and outputs

**Features:**
- Resource group targeting
- Parameter injection
- Deployment naming
- Output extraction

### CloudFormation Executor

Executes AWS CloudFormation deployments.

**Workflow:**
1. Setup project with `template.yaml`
2. `aws cloudformation validate-template` - Validate
3. `aws cloudformation create-change-set` - Preview changes
4. `aws cloudformation execute-change-set` - Deploy
5. `aws cloudformation wait` - Wait for completion
6. `aws cloudformation describe-stacks` - Get outputs

**Features:**
- Change set preview
- Stack naming convention
- Capability management (IAM)
- Wait conditions

## State Management

### State Structure

```typescript
{
  stateId: "uuid",
  version: 1,
  resources: [
    {
      id: "resource-id",
      type: "azurerm_virtual_machine",
      name: "web-vm-01",
      provider: "azurerm",
      attributes: {...},
      dependencies: ["azurerm_network_interface.main"],
      status: "created"
    }
  ],
  lastModified: "2024-01-01T00:00:00Z",
  locked: false
}
```

### State Versioning

- Each deployment creates a new state version
- Previous versions backed up (10 retained)
- Enables rollback to any previous version
- Audit trail of all state changes

### State Locking

Prevents concurrent modifications:

```bash
# Acquire lock before deployment
curl -X POST /api/deployments/abc-123/state/lock \
  -d '{"operation": "apply", "who": "user@example.com"}'

# Perform deployment...

# Release lock after completion
curl -X POST /api/deployments/abc-123/state/unlock \
  -d '{"lockId": "lock-xyz"}'
```

## Configuration

### Environment Variables

```bash
# Server
PORT=3004
NODE_ENV=production
LOG_LEVEL=info

# Service Integration
IAC_GENERATOR_URL=http://iac-generator:3002

# Working Directories
TERRAFORM_WORK_DIR=/tmp/terraform
BICEP_WORK_DIR=/tmp/bicep
CFN_WORK_DIR=/tmp/cloudformation

# Deployment Settings
MAX_DEPLOYMENT_TIMEOUT_MS=1800000
STATE_BACKUP_RETENTION=10

# Azure (for Bicep)
AZURE_SUBSCRIPTION_ID=xxx
AZURE_TENANT_ID=xxx
AZURE_CLIENT_ID=xxx
AZURE_CLIENT_SECRET=xxx

# AWS (for CloudFormation)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1

# GCP (for Terraform GCP)
GCP_PROJECT_ID=xxx
GCP_CREDENTIALS_FILE=/path/to/key.json
```

## Usage Examples

### Example 1: Deploy to Azure with Terraform

```bash
# Step 1: Generate IaC code
GEN_JOB=$(curl -X POST http://iac-generator:3002/api/generate \
  -d '{"blueprintId":"abc-123","targetFormat":"terraform"}' \
  | jq -r '.jobId')

# Step 2: Wait for generation
while [ $(curl http://iac-generator:3002/api/generate/$GEN_JOB | jq -r '.status') != "completed" ]; do
  sleep 2
done

# Step 3: Start deployment
DEPLOY_ID=$(curl -X POST http://localhost:3004/api/deployments \
  -d '{
    "blueprintId": "abc-123",
    "generationJobId": "'$GEN_JOB'",
    "environment": "production",
    "targetCloud": "azure",
    "format": "terraform",
    "options": {"autoApprove": true}
  }' | jq -r '.deploymentId')

# Step 4: Monitor deployment
watch curl http://localhost:3004/api/deployments/$DEPLOY_ID
```

### Example 2: Deploy to Azure with Bicep

```bash
curl -X POST http://localhost:3004/api/deployments \
  -d '{
    "blueprintId": "web-app-blueprint",
    "generationJobId": "gen-job-456",
    "environment": "production",
    "targetCloud": "azure",
    "format": "bicep",
    "options": {
      "autoApprove": false
    }
  }'

# Response:
# {
#   "deploymentId": "deploy-789",
#   "status": "planning",
#   "message": "Deployment started"
# }
```

### Example 3: Deploy to AWS with CloudFormation

```bash
curl -X POST http://localhost:3004/api/deployments \
  -d '{
    "blueprintId": "lambda-api",
    "generationJobId": "gen-123",
    "environment": "staging",
    "targetCloud": "aws",
    "format": "cloudformation"
  }'
```

### Example 4: Rollback Deployment

```bash
# List previous deployments
curl http://localhost:3004/api/deployments?blueprintId=abc-123

# Get state history
curl http://localhost:3004/api/deployments/deploy-789/state/history

# Rollback to version 5
curl -X POST http://localhost:3004/api/deployments/deploy-789/rollback \
  -d '{
    "targetVersion": 5,
    "reason": "Critical production bug"
  }'
```

### Example 5: View Deployment Logs

```bash
# Stream logs
curl http://localhost:3004/api/deployments/deploy-789/logs

# Watch logs in real-time
watch -n 2 curl -s http://localhost:3004/api/deployments/deploy-789/logs
```

## Integration with Automation Engine

The Orchestrator integrates with the Automation Engine for the complete workflow:

```typescript
// In Automation Engine
async function executeWorkflow(workflow) {
  // 1. Generate IaC
  const genJob = await generateIaC(workflow.blueprintId);
  
  // 2. Start deployment
  const deployment = await axios.post('http://orchestrator:3004/api/deployments', {
    blueprintId: workflow.blueprintId,
    generationJobId: genJob.id,
    environment: workflow.environment,
    targetCloud: workflow.targetCloud,
    format: workflow.format,
    options: {
      autoApprove: workflow.autoApproved
    }
  });
  
  // 3. Monitor deployment
  let status = 'pending';
  while (status === 'pending' || status === 'planning' || status === 'applying') {
    await sleep(5000);
    const result = await axios.get(
      `http://orchestrator:3004/api/deployments/${deployment.data.deploymentId}`
    );
    status = result.data.status;
  }
  
  // 4. Handle completion
  if (status === 'completed') {
    return result.data.outputs;
  } else {
    throw new Error(`Deployment failed: ${result.data.error}`);
  }
}
```

## Deployment Status States

| Status | Description |
|--------|-------------|
| `pending` | Deployment queued, not started |
| `planning` | Running plan/validation phase |
| `applying` | Executing infrastructure changes |
| `completed` | Successfully deployed |
| `failed` | Deployment failed with error |
| `rolled_back` | Reverted to previous state |

## Resource Status States

| Status | Description |
|--------|-------------|
| `creating` | Resource provisioning in progress |
| `created` | Resource successfully created |
| `updating` | Resource modification in progress |
| `updated` | Resource successfully updated |
| `deleting` | Resource deletion in progress |
| `deleted` | Resource successfully deleted |
| `failed` | Resource operation failed |

## Error Handling

### Common Errors

**Invalid Blueprint:**
```json
{
  "error": "blueprintId and generationJobId are required"
}
```

**Code Generation Failed:**
```json
{
  "error": "Failed to fetch generated code: Job not found"
}
```

**Deployment Failed:**
```json
{
  "id": "deploy-123",
  "status": "failed",
  "error": "Terraform apply failed: insufficient permissions"
}
```

**State Locked:**
```json
{
  "error": "State is already locked"
}
```

## Security

### Cloud Credentials
- Credentials stored as environment variables
- Support for IAM roles and managed identities
- Secrets never logged or exposed in responses
- Rotate credentials regularly

### State Security
- State contains sensitive resource details
- Access control required for state endpoints
- State encryption at rest recommended
- Audit all state access

### CLI Tools
- Terraform, Azure CLI, AWS CLI run in isolated containers
- Working directories cleaned after deployment
- Temporary files securely deleted

## Performance

### Deployment Times

| Environment | Typical Duration |
|-------------|-----------------|
| Small (1-5 resources) | 2-5 minutes |
| Medium (6-20 resources) | 5-15 minutes |
| Large (21-50 resources) | 15-30 minutes |
| X-Large (50+ resources) | 30-60 minutes |

### Optimization
- Parallel resource creation (Terraform parallelism)
- Cached provider plugins
- Incremental deployments (change sets)
- Resource dependency optimization

## Monitoring

### Health Check
```bash
curl http://localhost:3004/health
```

### Metrics to Track
- Active deployments count
- Deployment success/failure rate
- Average deployment duration
- State version count
- Lock contention events

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Install cloud CLIs
# Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure environment
cp .env.example .env
# Edit .env with your cloud credentials

# Start development server
npm run dev
```

### Testing Deployment

```bash
# Test Terraform deployment
curl -X POST http://localhost:3004/api/deployments \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "test-blueprint",
    "generationJobId": "test-gen-job",
    "environment": "dev",
    "targetCloud": "azure",
    "format": "terraform",
    "options": {"dryRun": true}
  }'
```

## Troubleshooting

### Deployment Stuck in "planning"

**Issue**: Deployment remains in planning status

**Solutions**:
1. Check executor logs for errors
2. Verify cloud CLI tools are installed
3. Validate cloud credentials
4. Check network connectivity to cloud provider
5. Increase timeout: `MAX_DEPLOYMENT_TIMEOUT_MS`

### State Lock Conflicts

**Issue**: Cannot deploy due to locked state

**Solutions**:
1. Check lock info: `GET /api/deployments/:id/state`
2. Verify no other deployment is running
3. Force unlock if safe: `POST /api/deployments/:id/state/unlock`
4. Contact lock owner before force unlocking

### Terraform Init Fails

**Issue**: Terraform initialization errors

**Solutions**:
1. Check provider versions in generated code
2. Verify internet connectivity for plugin download
3. Check disk space in `TERRAFORM_WORK_DIR`
4. Review Terraform logs in deployment logs

## Deployment

### Docker

```bash
docker build -t orchestrator-service:latest .

docker run -p 3004:3004 \
  -e IAC_GENERATOR_URL=http://iac-generator:3002 \
  -e AZURE_SUBSCRIPTION_ID=$AZURE_SUB \
  -e AWS_ACCESS_KEY_ID=$AWS_KEY \
  -v /var/run/docker.sock:/var/run/docker.sock \
  orchestrator-service:latest
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestrator-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: orchestrator
        image: orchestrator-service:latest
        ports:
        - containerPort: 3004
        env:
        - name: IAC_GENERATOR_URL
          value: "http://iac-generator:3002"
        - name: AZURE_SUBSCRIPTION_ID
          valueFrom:
            secretKeyRef:
              name: cloud-credentials
              key: azure-subscription-id
        volumeMounts:
        - name: workspace
          mountPath: /tmp
      volumes:
      - name: workspace
        emptyDir: {}
```

## Future Enhancements

1. **GitOps Integration**: Store IaC in Git, track with PRs
2. **Drift Detection**: Compare actual vs desired state
3. **Cost Tracking**: Report deployment costs
4. **Approval Workflows**: Integrate with Slack/Teams for approvals
5. **Multi-Region**: Deploy across multiple regions simultaneously
6. **Canary Deployments**: Gradual rollout with monitoring
7. **Terraform Cloud**: Integration with Terraform Cloud backend

## License

Copyright © 2024 IAC DHARMA Platform
