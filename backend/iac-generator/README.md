# IaC Generator Service

The IaC Generator Service is a core microservice in the IAC DHARMA platform that converts infrastructure blueprints into deployable Infrastructure-as-Code (IaC) in multiple formats.

## Overview

This service takes blueprint definitions from the Blueprint Service and generates production-ready IaC code in:
- **Terraform** (HashiCorp Configuration Language)
- **Bicep** (Azure native IaC)
- **CloudFormation** (AWS native IaC)

## Features

### Multi-Format Code Generation
- **Terraform**: Supports Azure, AWS, and GCP providers with proper resource mappings
- **Bicep**: Azure-native declarative syntax with latest API versions
- **CloudFormation**: AWS YAML templates with intrinsic functions

### Asynchronous Processing
- Job-based generation with status tracking
- Non-blocking API for large blueprints
- Job retention and cleanup

### Code Validation
- Syntax validation for all formats
- Best practice warnings
- Security checks (sensitive values, proper configurations)

### Multi-File Output
- Separate files for main resources, variables, and outputs
- Modular structure for better organization
- Template metadata and comments

## Architecture

```
┌─────────────────┐
│  Blueprint      │
│  Service        │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  IaC Generator  │
│  ┌───────────┐  │
│  │ Terraform │  │
│  │ Generator │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │   Bicep   │  │
│  │ Generator │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │CloudForm. │  │
│  │ Generator │  │
│  └───────────┘  │
└─────────────────┘
```

## API Endpoints

### 1. Generate IaC Code

**POST** `/api/generate`

Start an asynchronous IaC generation job.

**Request Body:**
```json
{
  "blueprintId": "uuid",
  "targetFormat": "terraform|bicep|cloudformation",
  "options": {
    "includeComments": true,
    "moduleName": "my-infrastructure",
    "namespace": "production"
  }
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "uuid",
  "status": "pending",
  "message": "IaC generation started"
}
```

**Example:**
```bash
curl -X POST http://localhost:3002/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "123e4567-e89b-12d3-a456-426614174000",
    "targetFormat": "terraform"
  }'
```

### 2. Get Job Status

**GET** `/api/generate/:jobId`

Check the status of a generation job.

**Response:**
```json
{
  "id": "uuid",
  "blueprintId": "uuid",
  "targetFormat": "terraform",
  "status": "completed|pending|processing|failed",
  "output": {
    "code": "...",
    "files": [
      {
        "name": "main.tf",
        "content": "...",
        "type": "main"
      }
    ],
    "metadata": {
      "resourceCount": 5,
      "warnings": []
    }
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:00:30.000Z"
}
```

**Example:**
```bash
curl http://localhost:3002/api/generate/abc-123-def
```

### 3. Download Generated Code

**GET** `/api/generate/:jobId/download`

Download the generated IaC code as a file.

**Response:**
- Content-Type: text/plain
- Content-Disposition: attachment
- File extension based on format (.tf, .bicep, .yaml)

**Example:**
```bash
curl http://localhost:3002/api/generate/abc-123-def/download \
  -o infrastructure.tf
```

### 4. Validate IaC Syntax

**POST** `/api/validate`

Validate IaC code syntax without generating from a blueprint.

**Request Body:**
```json
{
  "code": "resource \"aws_instance\" \"web\" { ... }",
  "format": "terraform|bicep|cloudformation"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": ["Sensitive values should be marked as sensitive"]
}
```

**Example:**
```bash
curl -X POST http://localhost:3002/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "resource \"aws_s3_bucket\" \"data\" { bucket = \"my-bucket\" }",
    "format": "terraform"
  }'
```

### 5. List Supported Resources

**GET** `/api/resources/:provider`

Get a list of supported resource types for a provider.

**Parameters:**
- `provider`: terraform | bicep | cloudformation

**Response:**
```json
{
  "provider": "terraform",
  "resources": [
    "azurerm_linux_virtual_machine",
    "aws_instance",
    "google_compute_instance",
    ...
  ]
}
```

### 6. Health Check

**GET** `/health`

Check service health.

**Response:**
```json
{
  "status": "healthy",
  "service": "iac-generator"
}
```

## Code Generation Details

### Terraform Generation

The service generates complete Terraform configurations with:

**Provider Configuration:**
```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}
```

**Resource Mapping:**
- Generic `compute` → `azurerm_linux_virtual_machine` (Azure)
- Generic `compute` → `aws_instance` (AWS)
- Generic `compute` → `google_compute_instance` (GCP)

**File Structure:**
- `main.tf`: Resource definitions
- `variables.tf`: Input variables
- `outputs.tf`: Output values

### Bicep Generation

Azure-native Bicep code with:

**Resource Syntax:**
```bicep
resource vmName 'Microsoft.Compute/virtualMachines@2023-03-01' = {
  name: 'my-vm'
  location: location
  properties: {
    hardwareProfile: {
      vmSize: 'Standard_D2s_v3'
    }
  }
}
```

**Features:**
- Latest API versions
- Proper parameter definitions
- Tagged resources
- Output exports

### CloudFormation Generation

AWS CloudFormation YAML templates with:

**Template Structure:**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Generated by IAC DHARMA
Parameters:
  Environment:
    Type: String
    Default: dev
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t3.micro
Outputs:
  InstanceId:
    Value: !Ref MyInstance
    Export:
      Name: !Sub ${AWS::StackName}-InstanceId
```

## Resource Type Mappings

### Azure (Terraform/Bicep)

| Generic Type | Terraform Resource | Bicep Resource |
|--------------|-------------------|----------------|
| compute | azurerm_linux_virtual_machine | Microsoft.Compute/virtualMachines |
| network | azurerm_virtual_network | Microsoft.Network/virtualNetworks |
| storage | azurerm_storage_account | Microsoft.Storage/storageAccounts |
| database | azurerm_postgresql_server | Microsoft.DBforPostgreSQL/servers |
| aks | azurerm_kubernetes_cluster | Microsoft.ContainerService/managedClusters |

### AWS (Terraform/CloudFormation)

| Generic Type | Terraform Resource | CloudFormation Resource |
|--------------|-------------------|------------------------|
| compute | aws_instance | AWS::EC2::Instance |
| network | aws_vpc | AWS::EC2::VPC |
| storage | aws_s3_bucket | AWS::S3::Bucket |
| database | aws_db_instance | AWS::RDS::DBInstance |
| lambda | aws_lambda_function | AWS::Lambda::Function |

### GCP (Terraform)

| Generic Type | Terraform Resource |
|--------------|-------------------|
| compute | google_compute_instance |
| network | google_compute_network |
| storage | google_storage_bucket |
| database | google_sql_database_instance |

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3002
NODE_ENV=production
LOG_LEVEL=info

# Service URLs
BLUEPRINT_SERVICE_URL=http://blueprint-service:3001

# Generation Options
MAX_JOB_RETENTION_HOURS=24
GENERATION_TIMEOUT_MS=300000
```

## Integration with Other Services

### Blueprint Service
- **Dependency**: Fetches blueprint data
- **Endpoint**: GET `/api/blueprints/:id`
- **Data Used**: Components, graph data, target cloud

### Automation Engine
- **Consumer**: Triggers generation during workflow
- **Flow**: Design → Generate IaC → Deploy

### Orchestrator Service
- **Consumer**: Receives generated IaC for deployment
- **Format**: Terraform/Bicep/CloudFormation code

## Usage Examples

### Example 1: Generate Terraform for Azure VM

1. **Create Blueprint** (via Blueprint Service):
```bash
curl -X POST http://blueprint-service:3001/api/blueprints \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Web Server",
    "targetCloud": "azure",
    "components": [{
      "name": "web-vm",
      "type": "compute",
      "provider": "azurerm_linux_virtual_machine",
      "properties": {
        "size": "Standard_D2s_v3",
        "admin_username": "azureuser"
      }
    }]
  }'
```

2. **Generate Terraform**:
```bash
curl -X POST http://localhost:3002/api/generate \
  -d '{
    "blueprintId": "<blueprint-id>",
    "targetFormat": "terraform"
  }'
```

3. **Check Status**:
```bash
curl http://localhost:3002/api/generate/<job-id>
```

4. **Download Code**:
```bash
curl http://localhost:3002/api/generate/<job-id>/download -o main.tf
```

### Example 2: Generate Bicep for AKS Cluster

```bash
# Generate
curl -X POST http://localhost:3002/api/generate \
  -d '{
    "blueprintId": "<aks-blueprint-id>",
    "targetFormat": "bicep",
    "options": {
      "includeComments": true
    }
  }'

# Download
curl http://localhost:3002/api/generate/<job-id>/download -o aks.bicep
```

### Example 3: Generate CloudFormation for Lambda

```bash
curl -X POST http://localhost:3002/api/generate \
  -d '{
    "blueprintId": "<lambda-blueprint-id>",
    "targetFormat": "cloudformation"
  }'
```

## Error Handling

### Common Errors

**Blueprint Not Found:**
```json
{
  "error": "Blueprint not found: <id>"
}
```

**Invalid Format:**
```json
{
  "error": "Invalid targetFormat. Must be one of: terraform, bicep, cloudformation"
}
```

**Generation Failed:**
```json
{
  "id": "job-id",
  "status": "failed",
  "error": "Failed to fetch blueprint: Connection refused"
}
```

## Validation Rules

### Terraform Validation
- ✓ Provider configuration present
- ✓ At least one resource defined
- ⚠️ Sensitive values should use `sensitive = true`
- ⚠️ Variables should have descriptions

### Bicep Validation
- ✓ Resources have valid type format
- ✓ API versions are specified
- ⚠️ Resources should specify location
- ⚠️ targetScope should be defined

### CloudFormation Validation
- ✓ AWSTemplateFormatVersion present
- ✓ Resources have valid AWS:: types
- ✓ Valid YAML syntax
- ⚠️ Sensitive parameters should use NoEcho

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Testing Generation

```bash
# Test Terraform generation
curl -X POST http://localhost:3002/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "test-blueprint-id",
    "targetFormat": "terraform"
  }'

# Test validation
curl -X POST http://localhost:3002/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "resource \"test\" \"example\" {}",
    "format": "terraform"
  }'
```

## Performance

### Generation Times
- **Simple Blueprint** (1-5 resources): < 1 second
- **Medium Blueprint** (6-20 resources): 1-3 seconds
- **Complex Blueprint** (21-50 resources): 3-10 seconds
- **Large Blueprint** (50+ resources): 10-30 seconds

### Optimization
- Asynchronous job processing
- In-memory job storage (Redis recommended for production)
- Efficient string building with arrays
- Template caching

## Monitoring

### Health Endpoint
```bash
curl http://localhost:3002/health
```

### Metrics to Track
- Generation success rate
- Average generation time per format
- Active jobs count
- Failed jobs with error types
- API response times

## Security

### Best Practices
- ✅ X-Powered-By header disabled
- ✅ No hardcoded secrets
- ✅ Input validation with Joi
- ✅ Job ID uses UUID v4
- ✅ Request size limit (10MB)

### Generated Code Security
- Validates sensitive parameter handling
- Warns about missing security configurations
- Checks for proper resource tagging
- Validates IAM policies (CloudFormation)

## Troubleshooting

### Job Stuck in "processing"
**Symptom**: Job status remains "processing" indefinitely

**Solution**:
1. Check Blueprint Service connectivity
2. Verify blueprint exists and is valid
3. Check service logs for errors
4. Consider increasing GENERATION_TIMEOUT_MS

### Invalid Resource Types
**Symptom**: Generated code contains unknown resource types

**Solution**:
1. Use `/api/resources/:provider` to check supported types
2. Update component `provider` field to explicit resource type
3. Check resource type mapping in generator classes

### CloudFormation YAML Errors
**Symptom**: Generated CloudFormation template has syntax errors

**Solution**:
1. Use `/api/validate` endpoint to check syntax
2. Verify property names are PascalCase
3. Check for unsupported intrinsic functions

## Deployment

### Docker

```bash
# Build image
docker build -t iac-generator:latest .

# Run container
docker run -p 3002:3002 \
  -e BLUEPRINT_SERVICE_URL=http://blueprint-service:3001 \
  iac-generator:latest
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iac-generator
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: iac-generator
        image: iac-generator:latest
        ports:
        - containerPort: 3002
        env:
        - name: BLUEPRINT_SERVICE_URL
          value: "http://blueprint-service:3001"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Future Enhancements

### Planned Features
1. **Additional Formats**
   - Pulumi support
   - Ansible playbooks
   - Helm charts

2. **Advanced Generation**
   - Module decomposition
   - Dependency graph optimization
   - Cost-optimized resource selection

3. **Enhanced Validation**
   - Static security analysis
   - Compliance checks (CIS benchmarks)
   - Cost estimation integration

4. **Template Library**
   - Pre-built templates
   - Best practice patterns
   - Industry-specific blueprints

## Support

### Common Issues
- Check service logs: `docker logs <container-id>`
- Verify environment variables are set
- Ensure Blueprint Service is accessible
- Test with `/health` endpoint

### Contact
- GitHub Issues: [IAC DHARMA Issues](https://github.com/org/iac-dharma/issues)
- Documentation: [docs.iac-dharma.io](https://docs.iac-dharma.io)
- Slack: #iac-generator channel

## License

Copyright © 2024 IAC DHARMA Platform
