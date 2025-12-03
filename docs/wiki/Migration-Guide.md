---
**Document Type**: Platform Migration Guide  
**Audience**: DevOps Engineers, Platform Engineers, Migration Teams  
**Classification**: Technical - Migration  
**Version**: 2.0.0  
**Date**: December 3, 2025  
**Reading Time**: 30 minutes  
**Copyright**: © 2025 IAC Dharma. All rights reserved.

---

# Migration Guide

Complete guide to migrating to IAC Dharma from existing infrastructure management platforms.

---

## 📋 Overview

This guide covers migration strategies for:

- **Legacy Infrastructure**: Manual AWS Console, Azure Portal, GCP Console
- **Existing IaC Tools**: Terraform, CloudFormation, ARM Templates, Pulumi
- **Other Platforms**: Spacelift, env0, Scalr, Atlantis
- **CI/CD Systems**: Jenkins, GitLab CI, GitHub Actions, CircleCI
- **Data Migration**: State files, configurations, secrets

---

## 🎯 Migration Strategies

### Strategy 1: Greenfield Migration (Recommended)

**Best for**: New projects or isolated environments

**Approach**:
1. Start fresh with IAC Dharma
2. Recreate infrastructure using blueprints
3. Migrate workloads during maintenance window
4. Decommission old infrastructure

**Timeline**: 2-4 weeks  
**Risk**: Low  
**Downtime**: Planned maintenance window

### Strategy 2: Brownfield Migration

**Best for**: Existing production infrastructure

**Approach**:
1. Import existing infrastructure
2. Gradual migration with parallel running
3. Incremental cutover by service
4. Final decommissioning

**Timeline**: 1-3 months  
**Risk**: Medium  
**Downtime**: Zero downtime possible

### Strategy 3: Hybrid Approach

**Best for**: Complex enterprise environments

**Approach**:
1. Import critical infrastructure
2. New resources via IAC Dharma
3. Gradual conversion of existing resources
4. Long-term coexistence

**Timeline**: 3-6 months  
**Risk**: Low  
**Downtime**: None

---

## 🔄 Migrating from Terraform

### Step 1: Assess Current State

```bash
# Analyze existing Terraform configuration
cd /path/to/terraform

# List all workspaces
terraform workspace list

# Show current state
terraform show

# Export state to JSON
terraform show -json > terraform-state.json
```

### Step 2: Import Terraform State

**Using IAC Dharma CLI**:

```bash
# Install IAC Dharma
npm install -g @raghavendra198902/iac-dharma

# Import Terraform state
iac-dharma import terraform \
  --state-file terraform.tfstate \
  --workspace production \
  --provider aws \
  --region us-east-1

# Output:
# ✓ Imported 45 resources
# ✓ Created 12 blueprints
# ✓ Mapped 8 modules
```

**Using API**:

```bash
# Upload Terraform state
curl -X POST http://localhost:3000/api/migration/terraform/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -F "stateFile=@terraform.tfstate" \
  -F "provider=aws" \
  -F "region=us-east-1"
```

### Step 3: Convert Terraform Modules to Blueprints

**Automatic Conversion**:

```bash
# Convert Terraform module to blueprint
iac-dharma convert \
  --input ./modules/vpc \
  --output ./blueprints/vpc.yml \
  --format blueprint

# Review generated blueprint
cat ./blueprints/vpc.yml
```

**Manual Conversion Example**:

**Terraform** (`modules/vpc/main.tf`):
```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = var.name
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.name}-public-${count.index + 1}"
  }
}
```

**IAC Dharma Blueprint** (`blueprints/vpc.yml`):
```yaml
apiVersion: v1
kind: Blueprint
metadata:
  name: vpc-module
  version: 1.0.0
  description: VPC with public subnets

spec:
  parameters:
    - name: cidr_block
      type: string
      required: true
      default: 10.0.0.0/16
    
    - name: public_subnet_cidrs
      type: array
      required: true
    
    - name: availability_zones
      type: array
      required: true
    
    - name: name
      type: string
      required: true
    
    - name: environment
      type: string
      required: true

  resources:
    - name: vpc
      type: aws::vpc
      properties:
        cidr_block: "{{ parameters.cidr_block }}"
        enable_dns_hostnames: true
        enable_dns_support: true
        tags:
          Name: "{{ parameters.name }}"
          Environment: "{{ parameters.environment }}"
    
    - name: public_subnets
      type: aws::subnet
      count: "{{ parameters.public_subnet_cidrs | length }}"
      properties:
        vpc_id: "{{ resources.vpc.id }}"
        cidr_block: "{{ parameters.public_subnet_cidrs[count.index] }}"
        availability_zone: "{{ parameters.availability_zones[count.index] }}"
        map_public_ip_on_launch: true
        tags:
          Name: "{{ parameters.name }}-public-{{ count.index + 1 }}"
```

### Step 4: Migrate State Management

**Backend Configuration**:

```bash
# Export Terraform backend config
cat backend.tf

# Configure IAC Dharma backend
iac-dharma config set \
  --backend s3 \
  --bucket iac-dharma-state \
  --region us-east-1 \
  --dynamodb-table terraform-locks

# Migrate state
iac-dharma state migrate \
  --from terraform \
  --backend-config backend.tf
```

### Step 5: Test and Validate

```bash
# Dry run deployment
iac-dharma deploy \
  --blueprint vpc-module \
  --dry-run \
  --param environment=staging

# Validate against current state
iac-dharma plan \
  --blueprint vpc-module \
  --compare-with terraform

# Output:
# No changes detected. Infrastructure matches blueprint.
```

### Step 6: Cutover

**Parallel Running** (recommended):

```bash
# Keep Terraform state read-only
# Deploy via IAC Dharma
iac-dharma deploy \
  --blueprint vpc-module \
  --param environment=production \
  --import-existing

# Monitor for 1-2 weeks
# Decommission Terraform
```

---

## ☁️ Migrating from CloudFormation

### Step 1: Export CloudFormation Stacks

```bash
# List all stacks
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Export stack template
aws cloudformation get-template \
  --stack-name my-stack \
  --query TemplateBody \
  --output text > stack-template.json

# Export stack resources
aws cloudformation describe-stack-resources \
  --stack-name my-stack > stack-resources.json
```

### Step 2: Import to IAC Dharma

```bash
# Import CloudFormation stack
iac-dharma import cloudformation \
  --stack-name my-stack \
  --region us-east-1 \
  --template stack-template.json

# Convert to blueprint
iac-dharma convert \
  --input stack-template.json \
  --output blueprints/my-stack.yml \
  --format blueprint
```

### Step 3: Handle CloudFormation-Specific Features

**Custom Resources**:
```yaml
# CloudFormation Custom Resource
Resources:
  MyCustomResource:
    Type: Custom::MyResource
    Properties:
      ServiceToken: !GetAtt MyLambda.Arn

# IAC Dharma Equivalent
resources:
  - name: custom_resource
    type: aws::lambda::invocation
    properties:
      function_name: "{{ resources.my_lambda.arn }}"
      input:
        action: create
```

**Stack Outputs**:
```yaml
# CloudFormation Outputs
Outputs:
  VpcId:
    Value: !Ref MyVPC
    Export:
      Name: !Sub ${AWS::StackName}-VpcId

# IAC Dharma Outputs
outputs:
  - name: vpc_id
    value: "{{ resources.my_vpc.id }}"
    export: true
```

---

## 🔵 Migrating from Azure Resource Manager

### Step 1: Export ARM Templates

```bash
# Export resource group
az group export \
  --name my-resource-group \
  --output-file arm-template.json

# Include parameters
az deployment group show \
  --name my-deployment \
  --resource-group my-resource-group \
  --query properties.parameters > parameters.json
```

### Step 2: Convert to IAC Dharma

```bash
# Import ARM template
iac-dharma import arm \
  --template arm-template.json \
  --parameters parameters.json \
  --resource-group my-resource-group

# Convert to blueprint
iac-dharma convert \
  --input arm-template.json \
  --output blueprints/azure-infra.yml \
  --format blueprint
```

### Step 3: Handle Azure-Specific Features

**Linked Templates**:
```yaml
# ARM Linked Template
{
  "type": "Microsoft.Resources/deployments",
  "properties": {
    "mode": "Incremental",
    "templateLink": {
      "uri": "https://storage.blob.core.windows.net/templates/storage.json"
    }
  }
}

# IAC Dharma Nested Blueprint
includes:
  - blueprint: azure/storage
    version: 1.0.0
    parameters:
      resource_group: "{{ parameters.resource_group }}"
```

---

## 🟢 Migrating from GCP Deployment Manager

### Step 1: Export Deployment Manager Configs

```bash
# List deployments
gcloud deployment-manager deployments list

# Export deployment
gcloud deployment-manager deployments describe my-deployment \
  --format yaml > deployment.yaml

# Get configuration
gcloud deployment-manager deployments get my-deployment \
  --format yaml > config.yaml
```

### Step 2: Import to IAC Dharma

```bash
# Import Deployment Manager config
iac-dharma import gcp-dm \
  --config config.yaml \
  --project my-project \
  --region us-central1

# Convert to blueprint
iac-dharma convert \
  --input config.yaml \
  --output blueprints/gcp-infra.yml \
  --format blueprint
```

---

## 🔄 Migrating from Pulumi

### Step 1: Export Pulumi State

```bash
# Export Pulumi stack
pulumi stack export > pulumi-state.json

# List all resources
pulumi stack --show-urns
```

### Step 2: Convert Pulumi Programs

**Pulumi TypeScript**:
```typescript
import * as aws from "@pulumi/aws";

const vpc = new aws.ec2.Vpc("main", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    tags: { Name: "main-vpc" }
});

export const vpcId = vpc.id;
```

**IAC Dharma Blueprint**:
```yaml
resources:
  - name: main_vpc
    type: aws::vpc
    properties:
      cidr_block: 10.0.0.0/16
      enable_dns_hostnames: true
      tags:
        Name: main-vpc

outputs:
  - name: vpc_id
    value: "{{ resources.main_vpc.id }}"
```

---

## 📊 Data Migration

### Secrets Migration

```bash
# Export from HashiCorp Vault
vault kv get -format=json secret/app > secrets.json

# Import to IAC Dharma
iac-dharma secrets import \
  --file secrets.json \
  --provider vault \
  --path /app

# Or use environment variables
export IAC_DHARMA_AWS_ACCESS_KEY=...
export IAC_DHARMA_AWS_SECRET_KEY=...
```

### Configuration Migration

```bash
# Export existing configs
iac-dharma config export \
  --from terraform \
  --output config-backup.json

# Import to new environment
iac-dharma config import \
  --file config-backup.json \
  --environment production
```

### Database Migration

```bash
# Backup PostgreSQL state database
pg_dump -h old-db.example.com \
  -U admin \
  -d iac_state \
  --format=custom \
  --file=state-backup.dump

# Restore to IAC Dharma database
pg_restore -h localhost \
  -U postgres \
  -d iac_dharma \
  --clean \
  --if-exists \
  state-backup.dump
```

---

## 🧪 Testing Migration

### Pre-Migration Testing

```bash
# Test import without applying
iac-dharma import terraform \
  --state-file terraform.tfstate \
  --dry-run \
  --validate

# Compare resources
iac-dharma diff \
  --source terraform \
  --target iac-dharma \
  --detailed
```

### Post-Migration Validation

```bash
# Verify all resources imported
iac-dharma validate \
  --blueprint imported-infrastructure \
  --check-drift

# Run compliance checks
iac-dharma compliance scan \
  --blueprint imported-infrastructure \
  --framework all

# Performance test
iac-dharma benchmark \
  --blueprint imported-infrastructure \
  --iterations 10
```

---

## ⚠️ Common Pitfalls

### 1. State File Conflicts

**Problem**: Multiple state files for same resources

**Solution**:
```bash
# Merge state files
iac-dharma state merge \
  --files state1.tfstate,state2.tfstate \
  --output merged.tfstate

# Remove duplicates
iac-dharma state deduplicate \
  --file merged.tfstate
```

### 2. Resource Naming Conflicts

**Problem**: Resources with same name in different providers

**Solution**:
```yaml
# Use namespacing
resources:
  - name: aws_main_vpc
    type: aws::vpc
  
  - name: azure_main_vnet
    type: azure::virtual_network
```

### 3. Circular Dependencies

**Problem**: Resources depend on each other

**Solution**:
```yaml
# Explicit dependency ordering
resources:
  - name: vpc
    type: aws::vpc
  
  - name: subnet
    type: aws::subnet
    depends_on:
      - vpc
```

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Backup all state files
- [ ] Document existing infrastructure
- [ ] Export all configurations
- [ ] Backup databases and secrets
- [ ] Set up IAC Dharma environment
- [ ] Train team on IAC Dharma

### During Migration
- [ ] Import infrastructure to IAC Dharma
- [ ] Convert configurations to blueprints
- [ ] Test in non-production environment
- [ ] Validate resource mappings
- [ ] Run compliance checks
- [ ] Performance testing

### Post-Migration
- [ ] Verify all resources managed
- [ ] Update documentation
- [ ] Configure monitoring and alerts
- [ ] Set up backup and DR
- [ ] Train operations team
- [ ] Decommission old tools

---

## 🚨 Rollback Plan

### Rollback Strategy

```bash
# Create rollback point
iac-dharma snapshot create \
  --name pre-migration-snapshot \
  --description "Before migration to IAC Dharma"

# If issues occur, rollback
iac-dharma snapshot restore \
  --name pre-migration-snapshot \
  --confirm

# Alternative: Keep Terraform in read-only mode
# Revert to Terraform control
terraform import ...
```

---

## 📚 Related Documentation

- [Installation-Guide](Installation-Guide) - Setup IAC Dharma
- [Quick-Start](Quick-Start) - Getting started
- [Terraform-Templates](Terraform-Templates) - Terraform integration
- [Custom-Blueprints](Custom-Blueprints) - Blueprint creation

---

**Next Steps**: Learn about [Workflow-Automation](Workflow-Automation) for CI/CD integration.
