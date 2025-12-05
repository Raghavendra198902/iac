# IAC Dharma - Interactive Demo Script

Welcome to the **IAC Dharma v2.0** interactive demo! 🎉

This demo will walk you through the key features of our Enterprise Infrastructure as Code Automation Platform.

---

## Demo Scenario: E-Commerce Platform Deployment

**Context**: You're a DevOps engineer at "TechMart" tasked with deploying a new e-commerce platform on AWS.

**Requirements**:
- High availability (multi-AZ)
- Auto-scaling based on traffic
- Secure (encrypted data, private subnets)
- Cost-optimized
- Compliance-ready (PCI-DSS for payment processing)

---

## Part 1: Creating the Blueprint (5 minutes)

### Step 1: Login
```
URL: https://demo.iacdharma.com
Username: demo@techmart.com
Password: Demo2024!
```

### Step 2: Create New Blueprint
1. Click **"+ New Blueprint"**
2. Fill in details:
   ```
   Name: TechMart E-Commerce Platform
   Description: Production e-commerce infrastructure
   Provider: AWS
   Region: us-east-1
   Environment: Production
   ```

### Step 3: Add Infrastructure Components

**Network Layer**:
- ✅ VPC (10.0.0.0/16)
  - Public Subnets: 2 (10.0.1.0/24, 10.0.2.0/24)
  - Private Subnets: 2 (10.0.10.0/24, 10.0.11.0/24)
  - NAT Gateway (for private subnet internet access)
  - Internet Gateway

**Compute Layer**:
- ✅ Auto Scaling Group
  - Instance Type: t3.medium
  - Min: 2, Max: 10, Desired: 2
  - Health Check: ELB
  - Scaling Policy: CPU > 70%
  
**Load Balancing**:
- ✅ Application Load Balancer
  - Scheme: Internet-facing
  - Listeners: HTTP (80), HTTPS (443)
  - Health Check: /health
  - Stickiness: Enabled

**Database**:
- ✅ RDS PostgreSQL
  - Instance: db.t3.medium
  - Multi-AZ: Yes
  - Storage: 100 GB (Encrypted)
  - Backup: 7 days
  - Maintenance Window: Sun 03:00-04:00

**Cache Layer**:
- ✅ ElastiCache Redis
  - Node Type: cache.t3.medium
  - Nodes: 2 (with automatic failover)
  - Encryption: At-rest and in-transit

**Storage**:
- ✅ S3 Bucket
  - Name: techmart-assets
  - Versioning: Enabled
  - Encryption: AES-256
  - Lifecycle: Move to Glacier after 90 days

**Security**:
- ✅ Security Groups
  - ALB: Allow 80, 443 from 0.0.0.0/0
  - App Servers: Allow 8080 from ALB only
  - Database: Allow 5432 from App Servers only
  - Redis: Allow 6379 from App Servers only

### Step 4: Add Tags
```
Environment: production
Owner: devops@techmart.com
Cost-Center: engineering
Project: ecommerce
Compliance: PCI-DSS
```

### Step 5: Save Blueprint
Click **"Save Blueprint"** ✅

---

## Part 2: AI Recommendations (3 minutes)

After saving, IAC Dharma AI analyzes your blueprint and provides recommendations:

### Recommendation 1: Cost Optimization
```
💡 Recommendation: Use Reserved Instances
Potential Savings: $245/month (35%)
Details: Your t3.medium instances run 24/7. Consider 1-year Reserved Instances.
Action: [Apply] [Dismiss]
```
**Demo Action**: Click **Apply**

### Recommendation 2: Security
```
🔒 Recommendation: Enable AWS GuardDuty
Risk Level: Medium
Details: Enable threat detection for your VPC and workloads.
Action: [Apply] [Dismiss]
```
**Demo Action**: Click **Apply**

### Recommendation 3: Performance
```
⚡ Recommendation: Enable CloudFront CDN
Performance Gain: 60% faster page loads
Details: Serve static assets from edge locations.
Cost Impact: +$50/month
Action: [Apply] [Dismiss]
```
**Demo Action**: Click **Apply**

---

## Part 3: Cost Estimation (2 minutes)

Click **"Estimate Cost"** to see detailed breakdown:

```
┌─────────────────────────────────┬──────────┐
│ Resource                        │ Monthly  │
├─────────────────────────────────┼──────────┤
│ EC2 Instances (2x t3.medium)    │ $60.74   │
│ Auto Scaling (avg 4 instances)  │ $121.48  │
│ Application Load Balancer       │ $22.00   │
│ RDS PostgreSQL (Multi-AZ)       │ $146.00  │
│ ElastiCache Redis (2 nodes)     │ $48.00   │
│ S3 Storage (500 GB)             │ $11.50   │
│ NAT Gateway                     │ $32.40   │
│ Data Transfer                   │ $45.00   │
│ CloudFront CDN                  │ $50.00   │
│ Reserved Instance Discount      │ -$85.00  │
├─────────────────────────────────┼──────────┤
│ Total Monthly Cost              │ $452.12  │
└─────────────────────────────────┴──────────┘

Annual Cost: $5,425.44
3-Year Projected Cost: $16,276.32

💰 Cost Optimization Score: 85/100
```

---

## Part 4: Generate Infrastructure Code (3 minutes)

### Step 1: Select Format
Click **"Generate IaC Code"** and choose:
- ✅ Terraform (recommended)
- ☐ CloudFormation
- ☐ Pulumi

### Step 2: Preview Generated Code
The system generates 15+ Terraform files:
```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── vpc.tf
├── security_groups.tf
├── alb.tf
├── asg.tf
├── rds.tf
├── elasticache.tf
├── s3.tf
├── cloudfront.tf
└── providers.tf
```

**Sample - vpc.tf**:
```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "techmart-vpc"
    Environment = "production"
    Owner       = "devops@techmart.com"
    Project     = "ecommerce"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "techmart-public-1"
    Tier = "public"
  }
}

# ... more resources
```

### Step 3: Validate Code
Click **"Validate"** - the system runs:
- ✅ Terraform fmt (formatting check)
- ✅ Terraform validate (syntax check)
- ✅ TFLint (best practices)
- ✅ Checkov (security scanning)

**Results**:
```
✅ Validation Passed
⚠️  2 Warnings:
  - Consider enabling VPC Flow Logs
  - Add lifecycle policy for S3 versioning
```

---

## Part 5: Security & Compliance Check (2 minutes)

Click **"Security Scan"**:

### Security Report
```
Security Score: 92/100

✅ Passed (18 checks):
  - All storage encrypted at rest
  - Databases in private subnets
  - No public access to databases
  - Security groups follow least privilege
  - IAM roles properly configured
  - CloudTrail enabled
  - VPC endpoints configured
  - ... (11 more)

⚠️  Warnings (2):
  - MFA not enabled on root account
  - Consider AWS Config for compliance tracking

❌ Failed (0): None
```

### Compliance Report
```
PCI-DSS Compliance: ✅ Ready

Requirements Met:
✅ Network segmentation (separate subnets)
✅ Data encryption (RDS, S3, Redis)
✅ Access logging (ALB, S3)
✅ Regular backups (automated)
✅ Audit trail (CloudTrail)
✅ Firewall rules (Security Groups)

Action Items:
1. Enable AWS WAF for application layer protection
2. Implement log aggregation with retention
3. Set up quarterly security reviews
```

---

## Part 6: Deployment (5 minutes)

### Step 1: Pre-Deployment Checklist
```
✅ Blueprint validated
✅ Cost approved ($452/month)
✅ Security scan passed
✅ Compliance check passed
✅ AWS credentials configured
✅ Terraform state backend configured (S3)
```

### Step 2: Select Deployment Strategy
Choose deployment method:
- ✅ Standard (create all resources)
- ☐ Blue-Green (zero downtime)
- ☐ Canary (gradual rollout)

### Step 3: Review Execution Plan
```
Terraform will perform the following actions:

+ 47 resources to create
~ 0 resources to modify
- 0 resources to destroy

Estimated time: 12-15 minutes
```

### Step 4: Deploy
Click **"Deploy Now"**

**Real-time Progress**:
```
[●●●●●●●●○○] 80% - Creating RDS instance
  
✅ Created: VPC (vpc-0abc123)
✅ Created: Internet Gateway (igw-0def456)
✅ Created: Subnets (4/4)
✅ Created: NAT Gateway (nat-0ghi789)
✅ Created: Route Tables (3/3)
✅ Created: Security Groups (4/4)
✅ Created: Application Load Balancer (alb-techmart)
⏳ Creating: RDS Instance (db-techmart)...
⏳ Pending: ElastiCache cluster
⏳ Pending: Auto Scaling Group

Current Cost: $0.00 (resources not yet running)
Estimated Monthly: $452.12
```

### Step 5: Deployment Complete
```
🎉 Deployment Successful!

Time Taken: 14 minutes 32 seconds
Resources Created: 47
Status: All healthy

Access URLs:
  Load Balancer: https://techmart-alb-123456.us-east-1.elb.amazonaws.com
  CloudFront: https://d123456.cloudfront.net
  
Next Steps:
  1. Configure DNS (Route53)
  2. Deploy application code
  3. Run smoke tests
  4. Enable monitoring dashboards
```

---

## Part 7: Monitoring & Observability (3 minutes)

### Real-time Dashboard
Navigate to **"Monitoring"** tab:

**System Health**:
```
┌──────────────────────────────────────┐
│ System Status: ✅ Healthy            │
│ Uptime: 100%                         │
│ Response Time: 45ms (P95)            │
│ Error Rate: 0.01%                    │
└──────────────────────────────────────┘
```

**Resource Metrics**:
- CPU Utilization: 35% (2 instances)
- Memory Usage: 60%
- Network In: 125 MB/s
- Network Out: 89 MB/s
- Database Connections: 45/100
- Cache Hit Rate: 94%

**Cost Tracking**:
```
Today: $15.04
This Month: $452.12 (projected)
Compared to last month: -15% 💰
```

**Alerts Configured**:
```
✅ CPU > 80% for 5 minutes → Email + Slack
✅ Error rate > 1% → PagerDuty
✅ Cost > $500/month → Email to Finance
✅ Database storage > 80% → Auto-scale
```

---

## Part 8: AI-Powered Insights (2 minutes)

View **"AI Insights"** panel:

### Insight 1: Traffic Pattern
```
📊 Insight: Peak Traffic Detected
Pattern: Mon-Fri 2pm-4pm EST (3x normal traffic)
Recommendation: Add scheduled scaling policy
  - Scale up at 1:30 PM (6 instances)
  - Scale down at 4:30 PM (2 instances)
Potential Savings: $89/month
[Apply Recommendation]
```

### Insight 2: Cost Anomaly
```
💰 Insight: Data Transfer Cost Spike
Detection: Data transfer increased 40% last week
Root Cause: Large file uploads without compression
Recommendation: Enable gzip compression on ALB
Expected Savings: $35/month
[Apply Fix]
```

### Insight 3: Optimization
```
⚡ Insight: Database Query Performance
Analysis: 15% of queries take > 1 second
Recommendation: Add database indexes on user_id and order_date
Impact: 60% faster query performance
[View SQL Migrations]
```

---

## Part 9: Drift Detection (2 minutes)

### Manual Change Detection
Someone manually changed security group rules in AWS Console:

**Drift Alert**:
```
🚨 Configuration Drift Detected

Resource: Security Group (sg-web-servers)
Change: Manually added port 3000 access from 0.0.0.0/0
Detected: 2 minutes ago
Risk Level: HIGH (unrestricted access)

Actions:
  [Revert to Blueprint] [Update Blueprint] [Ignore]
  
Impact Analysis:
  - Violates security policy
  - PCI-DSS compliance at risk
  - Potential unauthorized access vector
```

**Demo Action**: Click **"Revert to Blueprint"**

Result: Change automatically reverted, alert sent to admin.

---

## Part 10: Collaboration Features (2 minutes)

### Share Blueprint
Click **"Share"** and invite team member:
```
Share with: john@techmart.com
Role: Viewer
Permissions:
  ✅ View blueprint
  ✅ View deployments
  ☐ Edit blueprint
  ☐ Deploy infrastructure
  ☐ Delete resources
  
[Send Invitation]
```

### Comments & Annotations
Add comment to blueprint:
```
💬 Comment by sarah@techmart.com:
"Consider adding a staging environment 
for testing before production deployments"

[Reply] [Resolve] [Tag: @john]
```

### Version Control
View blueprint history:
```
Version History:
  v1.3 (Current) - 2 hours ago
    + Added CloudFront CDN
    + Applied AI recommendations
    
  v1.2 - 1 day ago
    ~ Updated RDS instance size
    
  v1.1 - 3 days ago
    + Added ElastiCache Redis
    
  v1.0 - 1 week ago
    * Initial blueprint creation
    
[Compare Versions] [Rollback]
```

---

## Demo Summary

**What You Accomplished**:
1. ✅ Created production-grade infrastructure blueprint
2. ✅ Applied AI-powered optimization recommendations
3. ✅ Generated Terraform code (15+ files)
4. ✅ Validated security and compliance (PCI-DSS ready)
5. ✅ Deployed 47 AWS resources in 15 minutes
6. ✅ Set up monitoring and alerting
7. ✅ Detected and remediated configuration drift
8. ✅ Enabled team collaboration

**Results**:
- 💰 35% cost reduction vs manual setup
- ⚡ 85% faster than manual infrastructure creation
- 🔒 100% security compliance
- 📊 Real-time monitoring and insights

**Time Saved**: 
- Manual setup: 2-3 days
- With IAC Dharma: 30 minutes

---

## Try It Yourself!

🌐 **Demo Environment**: https://demo.iacdharma.com
📧 **Username**: demo@example.com
🔑 **Password**: Demo2024!

---

## Next Steps

1. **Schedule a personalized demo**: sales@iacdharma.com
2. **Start free trial**: https://iacdharma.com/trial
3. **Join community**: https://community.iacdharma.com
4. **Read documentation**: https://docs.iacdharma.com

---

**Questions?**
- 💬 Live Chat: Available 24/7
- 📧 Email: support@iacdharma.com
- 📞 Phone: 1-800-IAC-HELP

---

*This demo script is designed for live presentations and trade shows. Total presentation time: 25-30 minutes.*
