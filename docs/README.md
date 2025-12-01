# Terraform Infrastructure as Code

This directory contains Terraform modules for provisioning the IAC Dharma platform infrastructure on AWS.

## Architecture Overview

The infrastructure consists of:

- **VPC Module**: Multi-AZ networking with public, private, and database subnets
- **EKS Module**: Managed Kubernetes cluster with auto-scaling node groups
- **RDS Module**: PostgreSQL database with Multi-AZ support
- **ElastiCache Module**: Redis cluster for caching and session management

## Directory Structure

```
terraform/
├── modules/
│   ├── vpc/              # VPC networking module
│   ├── eks/              # EKS Kubernetes cluster module
│   ├── rds/              # RDS PostgreSQL module
│   └── elasticache/      # ElastiCache Redis module
└── environments/
    ├── development/      # Development environment
    └── production/       # Production environment
```

## Prerequisites

1. **Terraform**: >= 1.5.0
   ```bash
   terraform --version
   ```

2. **AWS CLI**: Configured with appropriate credentials
   ```bash
   aws configure
   aws sts get-caller-identity
   ```

3. **Required AWS Permissions**:
   - VPC management (ec2:CreateVpc, ec2:CreateSubnet, etc.)
   - EKS cluster management (eks:CreateCluster, eks:CreateNodegroup, etc.)
   - RDS instance management (rds:CreateDBInstance, etc.)
   - ElastiCache management (elasticache:CreateReplicationGroup, etc.)
   - IAM role/policy management
   - Secrets Manager (for RDS passwords)
   - CloudWatch Logs

4. **S3 Backend**: Bucket for Terraform state storage
   ```bash
   aws s3 mb s3://your-terraform-state-bucket --region us-west-2
   
   # Enable versioning
   aws s3api put-bucket-versioning \
     --bucket your-terraform-state-bucket \
     --versioning-configuration Status=Enabled
   
   # Enable encryption
   aws s3api put-bucket-encryption \
     --bucket your-terraform-state-bucket \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

5. **DynamoDB Table** (for state locking - production):
   ```bash
   aws dynamodb create-table \
     --table-name terraform-state-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-west-2
   ```

## Quick Start

### Development Environment

1. **Navigate to development directory**:
   ```bash
   cd terraform/environments/development
   ```

2. **Initialize Terraform**:
   ```bash
   terraform init \
     -backend-config="bucket=your-terraform-state-bucket" \
     -backend-config="key=development/terraform.tfstate" \
     -backend-config="region=us-west-2"
   ```

3. **Review the plan**:
   ```bash
   terraform plan
   ```

4. **Apply the configuration**:
   ```bash
   terraform apply
   ```

5. **Configure kubectl** (after EKS is created):
   ```bash
   aws eks update-kubeconfig --region us-west-2 --name dharma-dev
   kubectl get nodes
   ```

### Production Environment

1. **Navigate to production directory**:
   ```bash
   cd terraform/environments/production
   ```

2. **Create terraform.tfvars**:
   ```hcl
   aws_region = "us-west-2"
   
   # Restrict EKS API access to your office/VPN
   allowed_public_cidrs = ["203.0.113.0/24"]
   
   # KMS key for encryption
   kms_key_arn = "arn:aws:kms:us-west-2:123456789012:key/12345678-1234-1234-1234-123456789012"
   
   # SNS topics for alarms
   sns_topic_arns = ["arn:aws:sns:us-west-2:123456789012:alerts"]
   ```

3. **Initialize Terraform**:
   ```bash
   terraform init \
     -backend-config="bucket=your-terraform-state-bucket" \
     -backend-config="key=production/terraform.tfstate" \
     -backend-config="region=us-west-2"
   ```

4. **Review the plan**:
   ```bash
   terraform plan
   ```

5. **Apply with approval**:
   ```bash
   terraform apply
   ```

6. **Configure kubectl**:
   ```bash
   aws eks update-kubeconfig --region us-west-2 --name dharma-prod
   kubectl get nodes
   ```

## Module Usage

### VPC Module

Creates a VPC with public, private, and database subnets across multiple availability zones.

```hcl
module "vpc" {
  source = "../../modules/vpc"
  
  environment        = "production"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]
  cluster_name       = "my-cluster"
  
  enable_nat_gateway = true
  single_nat_gateway = false  # false = one per AZ (HA)
  
  enable_vpc_flow_logs = true
  
  tags = {
    Environment = "production"
  }
}
```

**Key Variables**:
- `environment`: Environment name
- `vpc_cidr`: VPC CIDR block
- `availability_zones`: List of AZs
- `single_nat_gateway`: Cost vs HA tradeoff

**Outputs**:
- `vpc_id`: VPC ID
- `public_subnet_ids`: Public subnet IDs
- `private_subnet_ids`: Private subnet IDs
- `database_subnet_ids`: Database subnet IDs

### EKS Module

Creates an EKS cluster with managed node groups.

```hcl
module "eks" {
  source = "../../modules/eks"
  
  cluster_name    = "my-cluster"
  cluster_version = "1.28"
  
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  
  node_groups = {
    general = {
      desired_size   = 3
      min_size       = 2
      max_size       = 10
      instance_types = ["m5.xlarge"]
      capacity_type  = "ON_DEMAND"
      disk_size      = 100
      labels = {
        role = "general"
      }
      taints = []
    }
  }
  
  enable_ebs_csi_driver = true
  
  tags = {
    Environment = "production"
  }
}
```

**Key Variables**:
- `cluster_name`: EKS cluster name
- `cluster_version`: Kubernetes version
- `node_groups`: Map of node group configurations
- `enable_public_access`: Public API endpoint

**Outputs**:
- `cluster_endpoint`: API server endpoint
- `cluster_certificate_authority_data`: CA certificate
- `oidc_provider_arn`: OIDC provider for IRSA

### RDS Module

Creates a PostgreSQL RDS instance.

```hcl
module "rds" {
  source = "../../modules/rds"
  
  identifier            = "my-database"
  engine_version        = "15.4"
  instance_class        = "db.r6g.xlarge"
  allocated_storage     = 500
  storage_encrypted     = true
  
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.database_subnet_ids
  allowed_security_group_id  = module.eks.node_security_group_id
  
  multi_az                = true
  backup_retention_period = 30
  deletion_protection     = true
  
  tags = {
    Environment = "production"
  }
}
```

**Key Variables**:
- `identifier`: Database identifier
- `instance_class`: Instance type
- `multi_az`: Multi-AZ deployment
- `storage_encrypted`: Enable encryption

**Outputs**:
- `db_instance_endpoint`: Database endpoint
- `db_secret_arn`: Secrets Manager ARN with credentials

### ElastiCache Module

Creates a Redis cluster.

```hcl
module "elasticache" {
  source = "../../modules/elasticache"
  
  cluster_id      = "my-redis"
  engine_version  = "7.0"
  node_type       = "cache.r6g.xlarge"
  
  cluster_mode_enabled    = true
  num_node_groups         = 3
  replicas_per_node_group = 2
  
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_security_group_id  = module.eks.node_security_group_id
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Environment = "production"
  }
}
```

**Key Variables**:
- `cluster_mode_enabled`: Enable sharding
- `num_node_groups`: Number of shards
- `replicas_per_node_group`: Replicas per shard
- `transit_encryption_enabled`: TLS encryption

**Outputs**:
- `primary_endpoint_address`: Primary endpoint
- `configuration_endpoint_address`: Configuration endpoint (cluster mode)

## Security Best Practices

1. **Network Isolation**:
   - EKS nodes in private subnets
   - RDS in database subnets (no internet access)
   - Security groups with least privilege

2. **Encryption**:
   - EKS secrets encrypted with KMS
   - RDS storage encrypted
   - ElastiCache encryption at rest and in transit
   - Use customer-managed KMS keys in production

3. **Access Control**:
   - Restrict EKS public endpoint access via CIDR blocks
   - Use IAM roles for service accounts (IRSA)
   - Enable MFA for AWS console access
   - RDS passwords stored in Secrets Manager

4. **Monitoring**:
   - VPC Flow Logs enabled
   - EKS control plane logging
   - RDS enhanced monitoring and Performance Insights
   - CloudWatch alarms for critical metrics

5. **Backup and Recovery**:
   - RDS automated backups with retention
   - ElastiCache snapshots
   - Terraform state in S3 with versioning
   - State locking with DynamoDB

## Cost Optimization

### Development Environment

- **Single NAT Gateway**: ~$32/month vs $96/month for 3
- **Single-AZ RDS**: ~50% cost savings vs Multi-AZ
- **Smaller instances**: t3/t4g instance families
- **Reduced backup retention**: 3 days vs 30 days
- **No Multi-AZ ElastiCache**: Single replica per shard

**Estimated Monthly Cost**: ~$500-800

### Production Environment

- **Multi-AZ everything**: High availability
- **Multiple NAT Gateways**: One per AZ
- **Larger instances**: m5/r6g families
- **Extended backup retention**: 30 days
- **Performance Insights**: 7-day retention
- **Cluster mode ElastiCache**: 3 shards with 2 replicas each

**Estimated Monthly Cost**: ~$3,000-5,000

### Cost Reduction Tips

1. **Use Reserved Instances**: 30-60% savings for RDS and ElastiCache
2. **EC2 Savings Plans**: 20-40% savings for EKS nodes
3. **Spot Instances**: Use for non-critical EKS workloads
4. **Right-sizing**: Monitor and adjust instance sizes
5. **Auto-scaling**: Scale down during off-hours
6. **S3 lifecycle policies**: Archive old Terraform state versions

## Maintenance

### Upgrading EKS

1. **Upgrade control plane**:
   ```hcl
   cluster_version = "1.29"  # Update in main.tf
   ```

2. **Update add-on versions**:
   ```hcl
   vpc_cni_version    = "v1.16.0-eksbuild.1"
   coredns_version    = "v1.11.1-eksbuild.4"
   kube_proxy_version = "v1.29.0-eksbuild.1"
   ```

3. **Apply changes**:
   ```bash
   terraform plan
   terraform apply
   ```

4. **Upgrade node groups**: Update node group AMI or recreate nodes

### Upgrading RDS

1. **Update engine version**:
   ```hcl
   engine_version = "15.5"  # Minor version upgrade
   ```

2. **Apply during maintenance window**:
   ```bash
   terraform apply -var="apply_immediately=false"
   ```

3. **For major versions**: Test in dev first, then production

### Rotating Secrets

RDS master password is auto-generated and stored in Secrets Manager. To rotate:

```bash
aws secretsmanager rotate-secret \
  --secret-id $(terraform output -raw rds_secret_arn) \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotation-function
```

## Disaster Recovery

### Backup Strategy

1. **RDS**: Automated daily backups with 30-day retention (production)
2. **ElastiCache**: Daily snapshots with 7-day retention
3. **Terraform State**: S3 versioning enabled
4. **EKS**: Velero for cluster backups

### Recovery Procedures

**Scenario 1: Accidental terraform destroy**

1. Recover state from S3 version:
   ```bash
   aws s3api list-object-versions --bucket your-bucket --prefix production/
   aws s3api get-object --bucket your-bucket --key production/terraform.tfstate --version-id VERSION_ID terraform.tfstate
   ```

2. Re-import resources or restore from backup

**Scenario 2: Database corruption**

1. Restore from automated backup:
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier dharma-prod-restored \
     --db-snapshot-identifier rds:dharma-prod-2024-01-15-03-00
   ```

2. Update Terraform to manage restored instance

**Scenario 3: Regional outage**

1. Have multi-region infrastructure ready
2. Restore RDS from cross-region snapshot
3. Update DNS to point to failover region

## Troubleshooting

### Common Issues

**Issue**: `Error creating EKS Cluster: InvalidParameterException`

**Solution**: Ensure VPC subnets have proper tags:
```
kubernetes.io/cluster/<cluster-name> = "shared"
kubernetes.io/role/elb = "1"  (public subnets)
kubernetes.io/role/internal-elb = "1"  (private subnets)
```

**Issue**: `Error: error creating ElastiCache Replication Group: InvalidParameterValue`

**Solution**: Ensure subnet group spans at least 2 AZs for Multi-AZ

**Issue**: `Error: timeout while waiting for EKS node group`

**Solution**: Check EKS control plane logs, verify IAM role permissions

**Issue**: Terraform state locked

**Solution**: 
```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID
```

### Debug Commands

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check Terraform state
terraform state list
terraform state show module.vpc.aws_vpc.main

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Show outputs
terraform output

# Refresh state
terraform refresh

# Target specific resource
terraform apply -target=module.eks

# Enable debug logging
export TF_LOG=DEBUG
terraform apply
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Terraform Apply

on:
  push:
    branches: [main]
    paths:
      - 'terraform/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions
          aws-region: us-west-2
      
      - name: Terraform Init
        working-directory: terraform/environments/production
        run: |
          terraform init \
            -backend-config="bucket=${{ secrets.TF_STATE_BUCKET }}" \
            -backend-config="key=production/terraform.tfstate" \
            -backend-config="region=us-west-2"
      
      - name: Terraform Plan
        working-directory: terraform/environments/production
        run: terraform plan -out=tfplan
      
      - name: Terraform Apply
        working-directory: terraform/environments/production
        run: terraform apply -auto-approve tfplan
```

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [ElastiCache Best Practices](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review AWS CloudWatch logs
3. Consult Terraform plan output
4. Check AWS service health dashboard
