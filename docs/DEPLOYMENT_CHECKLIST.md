# Infrastructure Deployment Checklist

## Pre-Deployment

### AWS Prerequisites
- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured
- [ ] Terraform >= 1.5.0 installed
- [ ] kubectl installed for EKS management

### Required AWS Resources
- [ ] S3 bucket for Terraform state
  ```bash
  aws s3 mb s3://dharma-terraform-state --region us-west-2
  aws s3api put-bucket-versioning --bucket dharma-terraform-state --versioning-configuration Status=Enabled
  ```

- [ ] DynamoDB table for state locking (production only)
  ```bash
  aws dynamodb create-table \
    --table-name terraform-state-lock \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-west-2
  ```

- [ ] KMS key for encryption (production)
  ```bash
  aws kms create-key --description "IAC Dharma encryption key"
  aws kms create-alias --alias-name alias/dharma-prod --target-key-id <KEY_ID>
  ```

- [ ] SNS topic for alerts (production)
  ```bash
  aws sns create-topic --name dharma-alerts --region us-west-2
  ```

### Security Setup
- [ ] Generate Redis AUTH token (16-128 characters)
  ```bash
  openssl rand -base64 32
  ```

- [ ] Store sensitive variables
  ```bash
  # Create terraform.tfvars (DO NOT commit to git)
  cat > terraform.tfvars <<EOF
  redis_auth_token = "YOUR_GENERATED_TOKEN"
  kms_key_arn = "arn:aws:kms:us-west-2:ACCOUNT:key/KEY_ID"
  allowed_public_cidrs = ["YOUR_OFFICE_IP/32"]
  sns_topic_arns = ["arn:aws:sns:us-west-2:ACCOUNT:dharma-alerts"]
  EOF
  ```

## Development Environment Deployment

### Step 1: Initialize Terraform
```bash
cd terraform/environments/development

terraform init \
  -backend-config="bucket=dharma-terraform-state" \
  -backend-config="key=development/terraform.tfstate" \
  -backend-config="region=us-west-2"
```

- [ ] Initialization successful
- [ ] Backend configured
- [ ] Providers downloaded

### Step 2: Plan Infrastructure
```bash
terraform plan -out=tfplan
```

- [ ] Plan generated successfully
- [ ] Review resources to be created:
  - [ ] VPC with 9 subnets (3 public, 3 private, 3 database)
  - [ ] 1 NAT Gateway (cost optimization)
  - [ ] EKS cluster with 1 node group (2 nodes)
  - [ ] RDS PostgreSQL (single-AZ, db.t3.medium)
  - [ ] ElastiCache Redis (2 nodes, no cluster mode)
  - [ ] Security groups and IAM roles
  - [ ] CloudWatch log groups and alarms

### Step 3: Apply Configuration
```bash
terraform apply tfplan
```

**Expected Duration**: 15-20 minutes (EKS cluster takes ~10 minutes)

- [ ] VPC created
- [ ] EKS cluster created
- [ ] RDS instance created
- [ ] ElastiCache cluster created
- [ ] All resources healthy

### Step 4: Verify Deployment
```bash
# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name dharma-dev

# Verify EKS nodes
kubectl get nodes

# Verify add-ons
kubectl get daemonsets -A

# Get RDS endpoint
terraform output rds_endpoint

# Get Redis endpoint
terraform output redis_endpoint

# Get RDS credentials from Secrets Manager
aws secretsmanager get-secret-value --secret-id $(terraform output -raw rds_secret_arn) --query SecretString --output text | jq
```

- [ ] kubectl configured
- [ ] EKS nodes ready
- [ ] Add-ons running (vpc-cni, coredns, kube-proxy, ebs-csi-driver)
- [ ] RDS endpoint accessible
- [ ] Redis endpoint accessible
- [ ] Secrets retrieved successfully

### Step 5: Deploy Kubernetes Manifests
```bash
# Navigate to Kubernetes directory
cd ../../../kubernetes

# Apply development overlay
kubectl apply -k overlays/development/

# Verify deployments
kubectl get pods -n dharma
kubectl get services -n dharma
kubectl get ingress -n dharma
```

- [ ] Namespace created
- [ ] ConfigMaps applied
- [ ] Secrets applied
- [ ] Deployments created
- [ ] Services exposed
- [ ] Ingress configured
- [ ] All pods running

### Step 6: Configure Application
```bash
# Update database connection in Kubernetes secrets
kubectl create secret generic db-credentials \
  --from-literal=host=$(cd terraform/environments/development && terraform output -raw rds_endpoint | cut -d: -f1) \
  --from-literal=username=dbadmin \
  --from-literal=password=$(aws secretsmanager get-secret-value --secret-id $(cd terraform/environments/development && terraform output -raw rds_secret_arn) --query SecretString --output text | jq -r .password) \
  --from-literal=database=dharma_dev \
  --namespace dharma

# Update Redis connection
kubectl create secret generic redis-credentials \
  --from-literal=host=$(cd terraform/environments/development && terraform output -raw redis_endpoint) \
  --from-literal=password=YOUR_REDIS_AUTH_TOKEN \
  --namespace dharma
```

- [ ] Database secrets created
- [ ] Redis secrets created
- [ ] Application pods restarted

## Production Environment Deployment

### Step 1: Prepare Production Variables
```bash
cd terraform/environments/production

# Create production terraform.tfvars
cat > terraform.tfvars <<EOF
aws_region = "us-west-2"

# Restrict EKS API to corporate network
allowed_public_cidrs = ["203.0.113.0/24", "198.51.100.0/24"]

# Production KMS key
kms_key_arn = "arn:aws:kms:us-west-2:ACCOUNT:key/PRODUCTION_KEY_ID"

# SNS topics for alerts
sns_topic_arns = ["arn:aws:sns:us-west-2:ACCOUNT:dharma-prod-alerts"]

# Redis AUTH token
redis_auth_token = "YOUR_STRONG_PRODUCTION_TOKEN"
EOF
```

- [ ] Variables file created
- [ ] KMS key configured
- [ ] SNS topics configured
- [ ] Network access restricted
- [ ] Strong Redis token generated

### Step 2: Initialize and Plan
```bash
terraform init \
  -backend-config="bucket=dharma-terraform-state" \
  -backend-config="key=production/terraform.tfstate" \
  -backend-config="region=us-west-2"

terraform plan -out=tfplan
```

- [ ] Backend initialized with state locking
- [ ] Plan reviewed:
  - [ ] VPC with Multi-AZ (3 NAT Gateways)
  - [ ] EKS cluster with 2 node groups
  - [ ] RDS Multi-AZ (db.r6g.xlarge)
  - [ ] ElastiCache cluster mode (3 shards, 2 replicas each)
  - [ ] Enhanced monitoring and alarms
  - [ ] Encryption enabled everywhere

### Step 3: Apply with Change Management
```bash
# Production deployment should be scheduled
terraform apply tfplan
```

**Expected Duration**: 25-30 minutes

- [ ] Change ticket created
- [ ] Deployment window scheduled
- [ ] Stakeholders notified
- [ ] Infrastructure deployed
- [ ] Health checks passed

### Step 4: Production Verification
```bash
# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name dharma-prod

# Comprehensive verification
kubectl get nodes
kubectl get pods -A
kubectl top nodes

# Test database connectivity
kubectl run -it --rm psql --image=postgres:15 --restart=Never -- \
  psql -h $(terraform output -raw rds_endpoint | cut -d: -f1) \
  -U dbadmin -d dharma_prod

# Test Redis connectivity
kubectl run -it --rm redis-cli --image=redis:7 --restart=Never -- \
  redis-cli -h $(terraform output -raw redis_configuration_endpoint) \
  --tls -a YOUR_REDIS_AUTH_TOKEN
```

- [ ] All nodes ready
- [ ] System pods running
- [ ] Database accessible
- [ ] Redis cluster accessible
- [ ] Performance metrics normal

### Step 5: Deploy Production Workloads
```bash
cd ../../../kubernetes

# Apply production overlay
kubectl apply -k overlays/production/

# Monitor rollout
kubectl rollout status deployment/api-gateway -n dharma
kubectl rollout status deployment/user-service -n dharma
# ... check all services
```

- [ ] Production manifests applied
- [ ] All deployments rolled out
- [ ] Services healthy
- [ ] Ingress configured
- [ ] SSL certificates provisioned

### Step 6: Enable Monitoring and Alerts
- [ ] CloudWatch dashboards configured
- [ ] SNS subscriptions confirmed
- [ ] PagerDuty integration tested
- [ ] Log aggregation verified
- [ ] Metrics collecting properly

## Post-Deployment

### Development Environment
- [ ] Smoke tests passed
- [ ] API endpoints responding
- [ ] Database migrations successful
- [ ] Cache functioning
- [ ] Development team notified

### Production Environment
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Backup verification
- [ ] Disaster recovery test
- [ ] Runbook updated
- [ ] On-call team trained
- [ ] Go-live announcement

## Cost Monitoring

### Initial Setup
```bash
# Create cost allocation tags
aws ce create-cost-category-definition \
  --name "IAC-Dharma" \
  --rules '[{"Value":"development","Rule":{"Tags":{"Key":"Environment","Values":["development"]}}},{"Value":"production","Rule":{"Tags":{"Key":"Environment","Values":["production"]}}}]'

# Set up budget alerts
aws budgets create-budget \
  --account-id ACCOUNT_ID \
  --budget file://budget.json
```

- [ ] Cost allocation tags configured
- [ ] Budget alerts created
- [ ] Cost anomaly detection enabled

### Ongoing Monitoring
- [ ] Daily cost review
- [ ] Weekly cost optimization check
- [ ] Monthly reserved instance analysis

## Expected Costs

### Development Environment
| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| EKS | Control plane | $73 |
| EC2 | 2x t3.medium nodes | $60 |
| NAT Gateway | 1 gateway | $32 |
| RDS | db.t3.medium single-AZ | $85 |
| ElastiCache | 2x cache.t3.medium | $68 |
| VPC | Data transfer | $20 |
| CloudWatch | Logs & metrics | $30 |
| **Total** | | **~$368/month** |

### Production Environment
| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| EKS | Control plane | $73 |
| EC2 | 5x m5.xlarge + 2x c5.2xlarge nodes | $700 |
| NAT Gateway | 3 gateways | $96 |
| RDS | db.r6g.xlarge Multi-AZ | $580 |
| ElastiCache | 9x cache.r6g.xlarge (3 shards) | $1,944 |
| VPC | Data transfer | $200 |
| CloudWatch | Logs, metrics, alarms | $150 |
| Backups | RDS + ElastiCache snapshots | $100 |
| **Total** | | **~$3,843/month** |

**Cost Optimization Opportunities:**
- [ ] Reserved Instances (30-60% savings)
- [ ] Savings Plans (20-40% savings)
- [ ] Spot Instances for batch workloads (70% savings)
- [ ] Right-sizing based on actual usage
- [ ] S3 lifecycle policies for logs

## Troubleshooting

### Common Issues

**Issue: Terraform state locked**
```bash
terraform force-unlock LOCK_ID
```

**Issue: EKS nodes not joining cluster**
```bash
# Check node group status
aws eks describe-nodegroup --cluster-name dharma-prod --nodegroup-name application

# Check IAM role
aws iam get-role --role-name dharma-prod-node-role

# View logs
kubectl logs -n kube-system -l app=aws-node
```

**Issue: RDS connection timeout**
```bash
# Verify security group
aws ec2 describe-security-groups --group-ids $(terraform output -json | jq -r '.rds_security_group_id.value')

# Test from EKS node
kubectl run -it --rm netcat --image=busybox --restart=Never -- \
  nc -zv RDS_ENDPOINT 5432
```

**Issue: Redis authentication failure**
```bash
# Verify auth token
echo $REDIS_AUTH_TOKEN | wc -c  # Should be 16-128 characters

# Test connection
redis-cli -h REDIS_ENDPOINT --tls -a $REDIS_AUTH_TOKEN PING
```

## Rollback Procedures

### Development Environment
```bash
cd terraform/environments/development
terraform destroy
```

### Production Environment
**DO NOT use terraform destroy in production**

For rollback:
1. Scale down EKS deployments
2. Create RDS snapshot manually
3. Use previous Terraform state version
4. Contact DevOps lead before proceeding

## Maintenance Windows

### Suggested Schedule
- **Development**: Rolling updates, no maintenance window
- **Production**: 
  - Weekly: Sunday 2-4 AM UTC (minor updates)
  - Monthly: First Sunday 2-6 AM UTC (major updates)

### Maintenance Checklist
- [ ] Announce maintenance window
- [ ] Create pre-maintenance snapshots
- [ ] Terraform plan reviewed
- [ ] Apply Terraform changes
- [ ] Verify infrastructure health
- [ ] Run smoke tests
- [ ] Update documentation
- [ ] Close maintenance window

## Security Compliance

### Regular Security Tasks
- [ ] Weekly: Review CloudTrail logs
- [ ] Weekly: Security group audit
- [ ] Monthly: IAM access review
- [ ] Monthly: Secrets rotation
- [ ] Quarterly: Penetration testing
- [ ] Quarterly: Compliance audit

### Compliance Checks
```bash
# Run security scan
cd terraform/environments/production
terraform plan
snyk iac test

# AWS security best practices
aws iam get-account-summary
aws ec2 describe-security-groups --filters Name=ip-permission.cidr,Values='0.0.0.0/0'
```

## Documentation Updates

After deployment:
- [ ] Update network diagram with actual IPs
- [ ] Document all endpoints and credentials
- [ ] Update runbook with production specifics
- [ ] Train team on new infrastructure
- [ ] Update disaster recovery procedures

## Success Criteria

### Development
- [ ] All services deployed and accessible
- [ ] Developers can access and test
- [ ] CI/CD pipeline deploying successfully
- [ ] Monitoring and logging operational

### Production
- [ ] Zero-downtime deployment achieved
- [ ] All health checks passing
- [ ] Performance targets met (p95 < 100ms)
- [ ] 99.9% uptime SLA capability verified
- [ ] Security scan passed
- [ ] Compliance requirements met
- [ ] Team trained and ready for on-call

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Approved By**: _____________
**Next Review**: _____________
