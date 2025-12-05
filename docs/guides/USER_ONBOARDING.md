# IAC Dharma - User Onboarding Guide

Welcome to **IAC Dharma v2.0** - Your Enterprise Infrastructure as Code Automation Platform! 🚀

This guide will help you get started in just 5 minutes.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [First Login](#first-login)
3. [Creating Your First Blueprint](#creating-your-first-blueprint)
4. [Generating Infrastructure Code](#generating-infrastructure-code)
5. [Cost Estimation](#cost-estimation)
6. [Deploying Infrastructure](#deploying-infrastructure)
7. [Next Steps](#next-steps)

---

## Quick Start

### Prerequisites
- Active account credentials (contact your admin if you don't have one)
- Basic understanding of cloud infrastructure (AWS, Azure, or GCP)
- Browser: Chrome, Firefox, or Edge (latest version)

### Access the Platform
Navigate to: `https://iacdharma.example.com` (or your organization's URL)

---

## First Login

### Step 1: Login
1. Enter your **email** and **password**
2. Click **"Sign In"**
3. You'll be redirected to the dashboard

![Login Screen](../assets/login-screen.png)

### Step 2: Complete Your Profile
1. Click on your **profile icon** (top right)
2. Fill in:
   - Full Name
   - Organization
   - Role
   - Preferred Cloud Provider
3. Click **"Save"**

### Step 3: Dashboard Overview
Your dashboard shows:
- **Active Projects**: Your current infrastructure projects
- **Recent Deployments**: Latest infrastructure changes
- **Cost Insights**: Real-time cost tracking
- **AI Recommendations**: Optimization suggestions

---

## Creating Your First Blueprint

Blueprints are templates for your infrastructure.

### Step 1: Navigate to Blueprints
- Click **"Blueprints"** in the left sidebar
- Click **"+ New Blueprint"**

### Step 2: Fill Blueprint Details
```
Name: My First Web Application
Description: A simple web app with load balancer
Cloud Provider: AWS
Region: us-east-1
```

### Step 3: Add Resources
Click **"Add Resource"** and select:

**Example: Web Application Stack**
- ✅ VPC (Virtual Private Cloud)
- ✅ Subnet (Public)
- ✅ Security Group (Allow HTTP/HTTPS)
- ✅ EC2 Instance (t3.medium, 2 vCPU, 4GB RAM)
- ✅ Application Load Balancer
- ✅ RDS Database (PostgreSQL)

### Step 4: Configure Resources
For each resource, configure:
- **VPC**: CIDR block `10.0.0.0/16`
- **EC2 Instance**: 
  - AMI: Ubuntu 22.04
  - Instance Type: t3.medium
  - Storage: 50 GB
- **RDS**:
  - Engine: PostgreSQL 15
  - Instance: db.t3.micro
  - Storage: 20 GB

### Step 5: Save Blueprint
Click **"Save Blueprint"** ✅

---

## Generating Infrastructure Code

### Step 1: Select Your Blueprint
- Go to **"Blueprints"**
- Click on **"My First Web Application"**

### Step 2: Generate Code
1. Click **"Generate IaC Code"**
2. Choose format:
   - **Terraform** (recommended for multi-cloud)
   - **CloudFormation** (AWS native)
   - **ARM Templates** (Azure)
   - **Pulumi** (modern, multi-language)

### Step 3: Review Generated Code
```hcl
# Terraform Example
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "my-first-web-app-vpc"
    Environment = "production"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  
  tags = {
    Name = "web-server"
  }
}

# ... more resources
```

### Step 4: Download or Deploy
- **Download**: Click **"Download Code"** to save locally
- **Deploy**: Click **"Deploy Now"** for direct deployment

---

## Cost Estimation

### Get Cost Estimate
1. On your blueprint page, click **"Estimate Cost"**
2. View breakdown:
   ```
   Monthly Cost Estimate:
   - EC2 Instance (t3.medium):     $30.37
   - RDS PostgreSQL (db.t3.micro): $15.00
   - Application Load Balancer:    $22.00
   - Data Transfer:                $5.00
   - EBS Storage (50GB):           $5.00
   -------------------------------------------
   Total Monthly Cost:             $77.37
   ```

### Optimize Costs
The AI engine will suggest optimizations:
- 💡 **Recommendation**: Switch to t3.small (saves $15/month)
- 💡 **Recommendation**: Use Reserved Instances (saves 40%)
- 💡 **Recommendation**: Enable auto-scaling (optimize usage)

---

## Deploying Infrastructure

### Step 1: Pre-Deployment Checklist
- ✅ Blueprint validated
- ✅ Cost approved
- ✅ Cloud credentials configured
- ✅ Deployment region selected

### Step 2: Configure Deployment
1. Click **"Deploy"**
2. Select deployment type:
   - **Standard**: Regular deployment
   - **Blue-Green**: Zero-downtime
   - **Canary**: Gradual rollout

### Step 3: Review Deployment Plan
```
Deployment Plan:
+ Create: VPC
+ Create: Subnet
+ Create: Security Group
+ Create: EC2 Instance
+ Create: Load Balancer
+ Create: RDS Database

Estimated Time: 15 minutes
```

### Step 4: Execute Deployment
1. Click **"Approve & Deploy"**
2. Monitor progress in real-time
3. View logs and status updates

### Step 5: Verify Deployment
Once complete:
- ✅ All resources created
- ✅ Health checks passing
- ✅ Application accessible
- 🔗 Access URL: `http://my-app-lb-123456.us-east-1.elb.amazonaws.com`

---

## Next Steps

### 🎓 Learn More
- **Tutorials**: [Advanced Blueprints](./tutorials/advanced-blueprints.md)
- **Best Practices**: [Security & Compliance](./guides/security-best-practices.md)
- **API Documentation**: [API Reference](../api/openapi.yaml)

### 🔧 Advanced Features
- **Drift Detection**: Monitor configuration changes
- **CI/CD Integration**: Automate deployments
- **Multi-Tenancy**: Manage multiple teams
- **RBAC**: Role-based access control

### 📊 Monitoring
- **Dashboards**: Real-time infrastructure metrics
- **Alerts**: Get notified of issues
- **Cost Tracking**: Monitor spending

### 🤝 Get Help
- **Documentation**: [docs.iacdharma.com](https://docs.iacdharma.com)
- **Community Forum**: [community.iacdharma.com](https://community.iacdharma.com)
- **Support**: support@iacdharma.com
- **Slack**: [Join our community](https://iacdharma.slack.com)

---

## Common Tasks

### Task 1: Clone an Existing Blueprint
```
1. Go to Blueprints
2. Click "..." on any blueprint
3. Select "Clone"
4. Modify as needed
5. Save with new name
```

### Task 2: Update Running Infrastructure
```
1. Open your blueprint
2. Make changes
3. Click "Generate Change Plan"
4. Review changes (+ add, - remove, ~ modify)
5. Click "Apply Changes"
```

### Task 3: Rollback Deployment
```
1. Go to Deployments
2. Select failed deployment
3. Click "Rollback"
4. Confirm rollback action
```

### Task 4: Set Up Alerts
```
1. Go to Settings → Notifications
2. Click "Add Alert"
3. Configure:
   - Alert Type: Cost Threshold
   - Condition: Monthly cost > $100
   - Notification: Email + Slack
4. Save
```

---

## Tips & Tricks

### 💡 Pro Tips
1. **Use Tags**: Tag all resources for better organization
2. **Enable Auto-Scaling**: Save costs with dynamic scaling
3. **Regular Audits**: Review AI recommendations weekly
4. **Backup Blueprints**: Export important blueprints
5. **Test in Staging**: Always test before production

### 🚨 Common Pitfalls
- ❌ Not setting cost alerts
- ❌ Deploying without review
- ❌ Ignoring security recommendations
- ❌ Not monitoring drift
- ❌ Hardcoding credentials

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Blueprint | `Ctrl + N` |
| Save | `Ctrl + S` |
| Search | `Ctrl + K` |
| Deploy | `Ctrl + D` |
| Help | `F1` |

---

## Troubleshooting

### Issue: Cannot Deploy
**Solution**: Check cloud credentials in Settings → Cloud Providers

### Issue: Cost Estimate Unavailable
**Solution**: Ensure all resources have regions specified

### Issue: Blueprint Validation Failed
**Solution**: Review resource dependencies and configurations

### Issue: Slow Dashboard
**Solution**: Clear browser cache or reduce dashboard widgets

---

## Glossary

| Term | Definition |
|------|------------|
| **Blueprint** | Template for infrastructure resources |
| **IaC** | Infrastructure as Code |
| **Drift** | Untracked changes to infrastructure |
| **Deployment** | Process of creating infrastructure |
| **Recommendation** | AI-suggested optimization |

---

## Video Tutorials

- 📹 [Getting Started (5 min)](https://videos.iacdharma.com/getting-started)
- 📹 [Creating Blueprints (10 min)](https://videos.iacdharma.com/blueprints)
- 📹 [Cost Optimization (8 min)](https://videos.iacdharma.com/cost-optimization)
- 📹 [Advanced Features (15 min)](https://videos.iacdharma.com/advanced)

---

## Feedback

We'd love to hear from you!
- 📝 **Feedback Form**: [feedback.iacdharma.com](https://feedback.iacdharma.com)
- 💬 **Feature Requests**: [features.iacdharma.com](https://features.iacdharma.com)
- 🐛 **Bug Reports**: [bugs.iacdharma.com](https://bugs.iacdharma.com)

---

**Congratulations!** 🎉 You're now ready to use IAC Dharma. Happy automating!
