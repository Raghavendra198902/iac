# IAC Dharma - IaC Templates Library

This directory contains reusable Infrastructure-as-Code templates and modules for multiple IaC engines.

## Structure

```
iac-templates/
├── terraform/          # Terraform modules
│   ├── azure/         # Azure resources
│   ├── aws/           # AWS resources
│   ├── gcp/           # GCP resources
│   └── common/        # Multi-cloud modules
├── bicep/             # Azure Bicep templates
├── cloudformation/    # AWS CloudFormation
└── ansible/           # Ansible playbooks
```

## Terraform Modules

### Azure Modules
- `vnet` - Virtual Network with subnets
- `vm` - Virtual Machine with disk, NICs
- `aks` - Azure Kubernetes Service
- `sql` - Azure SQL Database
- `storage` - Storage Account
- `firewall` - Azure Firewall
- `appgateway` - Application Gateway

### AWS Modules
- `vpc` - VPC with subnets, IGW, NAT
- `ec2` - EC2 instances
- `eks` - Elastic Kubernetes Service
- `rds` - RDS databases
- `s3` - S3 buckets
- `alb` - Application Load Balancer

### GCP Modules
- `vpc` - VPC networks
- `compute` - Compute Engine instances
- `gke` - Google Kubernetes Engine
- `cloudsql` - Cloud SQL
- `storage` - Cloud Storage

## Bicep Templates

Azure-specific Bicep templates for:
- Landing Zone architecture
- Hub-Spoke networking
- Security baseline
- Monitoring & Logging

## CloudFormation Templates

AWS CloudFormation templates for:
- Multi-tier applications
- Serverless architectures
- Data platforms
- Network infrastructure

## Ansible Playbooks

Configuration management playbooks for:
- OS hardening (CIS compliance)
- Application deployment
- Backup configuration
- Monitoring agent installation

## Usage

Templates are parameterized and can be customized via:
- Variable files per environment
- Naming conventions
- Tagging policies
- Network CIDR ranges

## Naming Conventions

All resources follow the pattern:
```
{tenant}-{env}-{app}-{component}-{seq}
```

Example: `contoso-prod-webapp-vm-001`

## Tagging Standard

Required tags:
- `Environment` - dev/test/prod
- `Application` - Application name
- `Owner` - Team email
- `CostCenter` - Cost center code
- `Compliance` - Compliance level
