# Quick Start Guide

Get up and running with IAC Dharma in under 5 minutes!

---

## Prerequisites Check

Ensure you have:
- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0
- ✅ Docker >= 20.10.0
- ✅ Docker Compose >= 2.0.0

**Not installed?** See [Installation Guide](Installation-Guide).

---

## Installation (2 minutes)

### Option A: npm (Recommended)

```bash
# Install globally
npm install -g @raghavendra198902/iac-dharma

# Verify
iac-dharma --version
```

### Option B: Git Clone

```bash
# Clone repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac

# Copy environment
cp .env.example .env
```

---

## Start Services (1 minute)

```bash
# Start all services
iac-dharma start
# Or: docker-compose up -d

# Wait 30 seconds for initialization
```

---

## Access Platform (30 seconds)

Once services start, access:

### Core Services
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

### Monitoring Tools
- **Grafana**: http://localhost:3030 (login: admin/admin)
- **Jaeger Tracing**: http://localhost:16686
- **Prometheus**: http://localhost:9090

---

## Verify Installation (30 seconds)

```bash
# Check service status
iac-dharma status

# Health check
curl http://localhost:3000/health/ready

# Expected response:
# {"status":"ok","timestamp":"...","services":{...}}
```

---

## Quick Commands

### Service Management

```bash
# Start all services
iac-dharma start

# Stop all services
iac-dharma stop

# Check status
iac-dharma status

# View logs
iac-dharma logs <service-name>
# Example: iac-dharma logs api-gateway

# Health check
iac-dharma health
```

### Common Tasks

```bash
# Initialize new project
iac-dharma init --name my-project

# View system info
iac-dharma info

# Open documentation
iac-dharma docs

# Update to latest
iac-dharma update
```

---

## First Deployment Example

### 1. Create Infrastructure Blueprint

```bash
# Using curl
curl -X POST http://localhost:3000/api/blueprints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First VPC",
    "provider": "aws",
    "resources": [
      {
        "type": "vpc",
        "properties": {
          "cidr": "10.0.0.0/16",
          "region": "us-east-1"
        }
      }
    ]
  }'
```

### 2. Generate Terraform Code

```bash
# Generate IaC
curl -X POST http://localhost:3000/api/iac/generate \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "BLUEPRINT_ID_FROM_STEP_1",
    "outputFormat": "terraform"
  }'
```

### 3. Apply Infrastructure

```bash
# The platform automatically:
# 1. Validates configuration with guardrails
# 2. Estimates costs
# 3. Runs AI recommendations
# 4. Applies with orchestrator

# Check deployment status
curl http://localhost:3000/api/deployments/DEPLOYMENT_ID
```

---

## Using the Frontend

### 1. Open Dashboard

Navigate to http://localhost:5173

### 2. Create Blueprint

1. Click **"Create Blueprint"**
2. Select **Cloud Provider** (AWS/Azure/GCP)
3. Choose **Resource Type** (VPC, VM, Database, etc.)
4. Configure **Properties**
5. Click **"Generate IaC"**

### 3. Review & Deploy

1. Review **generated Terraform code**
2. Check **cost estimates**
3. View **AI recommendations**
4. Click **"Deploy"**

### 4. Monitor Deployment

1. View **real-time status** on dashboard
2. Check **Grafana** for metrics
3. Use **Jaeger** for distributed tracing

---

## Common Workflows

### Workflow 1: Multi-Cloud Deployment

```bash
# 1. Create AWS VPC
curl -X POST http://localhost:3000/api/blueprints \
  -d '{"name":"AWS VPC","provider":"aws",...}'

# 2. Create Azure VNet
curl -X POST http://localhost:3000/api/blueprints \
  -d '{"name":"Azure VNet","provider":"azure",...}'

# 3. Create GCP Network
curl -X POST http://localhost:3000/api/blueprints \
  -d '{"name":"GCP Network","provider":"gcp",...}'

# 4. View all deployments
curl http://localhost:3000/api/deployments
```

### Workflow 2: Cost Optimization

```bash
# 1. Get cost estimate before deployment
curl http://localhost:3000/api/costing/estimate/BLUEPRINT_ID

# 2. View AI cost recommendations
curl http://localhost:3000/api/ai/recommendations/BLUEPRINT_ID

# 3. Apply recommendations
curl -X POST http://localhost:3000/api/blueprints/BLUEPRINT_ID/apply-recommendations
```

### Workflow 3: Monitoring & Observability

```bash
# 1. View metrics
curl http://localhost:3000/metrics

# 2. Check distributed traces
# Open: http://localhost:16686

# 3. View dashboards
# Open: http://localhost:3030/d/iac-overview
```

---

## Quick Troubleshooting

### Services Not Starting?

```bash
# Check Docker
docker ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

### Port Already in Use?

```bash
# Find process
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Database Connection Error?

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Wait 10 seconds
sleep 10

# Restart API Gateway
docker-compose restart api-gateway
```

### Frontend Not Loading?

```bash
# Rebuild frontend
docker-compose build frontend

# Restart
docker-compose up -d frontend

# Check logs
docker logs dharma-frontend
```

---

## Next Steps

### Essential Reading
1. [Architecture Overview](Architecture-Overview) - Understand system design
2. [Multi-Cloud Support](Multi-Cloud-Support) - AWS, Azure, GCP details
3. [AI Recommendations](AI-Recommendations) - Leverage AI features
4. [API Reference](API-Reference) - Complete API documentation

### Advanced Topics
- [Feature Flags](Feature-Flags) - Dynamic configuration
- [Observability](Observability) - Monitoring & tracing
- [SSO Integration](SSO-Integration) - Authentication setup
- [Admin Dashboard](Admin-Dashboard) - Platform administration

### Development
- [Development Setup](Development-Setup) - Contributing guide
- [API Development](API-Development) - Building extensions
- [Testing Guide](Testing-Guide) - Writing tests

---

## Example Use Cases

### Use Case 1: AWS EKS Cluster

```json
{
  "name": "Production EKS",
  "provider": "aws",
  "resources": [
    {
      "type": "eks_cluster",
      "properties": {
        "name": "prod-cluster",
        "version": "1.28",
        "region": "us-west-2",
        "node_groups": [
          {
            "name": "general",
            "instance_type": "t3.medium",
            "desired_size": 3
          }
        ]
      }
    }
  ]
}
```

### Use Case 2: Azure Web App + Database

```json
{
  "name": "Web App Stack",
  "provider": "azure",
  "resources": [
    {
      "type": "app_service",
      "properties": {
        "name": "my-web-app",
        "runtime": "node|18-lts",
        "sku": "B1"
      }
    },
    {
      "type": "postgresql_server",
      "properties": {
        "name": "my-db-server",
        "version": "14",
        "sku": "B_Gen5_1"
      }
    }
  ]
}
```

### Use Case 3: GCP Cloud Run Service

```json
{
  "name": "API Service",
  "provider": "gcp",
  "resources": [
    {
      "type": "cloud_run_service",
      "properties": {
        "name": "api-service",
        "image": "gcr.io/project/api:latest",
        "region": "us-central1",
        "memory": "512Mi",
        "cpu": "1"
      }
    }
  ]
}
```

---

## Command Reference

### CLI Commands

```bash
# Project Management
iac-dharma init [--name <name>]     # Initialize project
iac-dharma info                     # Show system info
iac-dharma docs                     # Open documentation

# Service Control
iac-dharma start                    # Start all services
iac-dharma stop                     # Stop all services
iac-dharma restart                  # Restart all services
iac-dharma status                   # Show service status

# Monitoring
iac-dharma health                   # Health check
iac-dharma logs <service>           # View service logs
iac-dharma logs -f <service>        # Follow logs

# Maintenance
iac-dharma update                   # Update to latest
iac-dharma clean                    # Clean Docker resources
```

### Docker Compose Commands

```bash
# Basic Operations
docker-compose up -d                # Start in background
docker-compose down                 # Stop and remove
docker-compose ps                   # List containers
docker-compose logs -f              # Follow all logs

# Individual Services
docker-compose restart api-gateway  # Restart service
docker-compose logs frontend        # View service logs
docker-compose exec api-gateway sh  # Shell access

# Maintenance
docker-compose build --no-cache     # Rebuild images
docker-compose pull                 # Pull latest images
docker-compose down -v              # Remove with volumes
```

---

## Performance Tips

1. **Allocate Enough Memory**
   - Docker Desktop: Settings → Resources → 8GB+

2. **Use SSD Storage**
   - Better performance for database operations

3. **Enable BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   ```

4. **Prune Unused Resources**
   ```bash
   docker system prune -a
   ```

5. **Monitor Resource Usage**
   ```bash
   docker stats
   ```

---

## Getting Help

### Documentation
- **Wiki**: Complete reference documentation
- **API Docs**: http://localhost:3000/api-docs
- **README**: Project overview

### Support Channels
- **GitHub Issues**: https://github.com/Raghavendra198902/iac/issues
- **Email**: raghavendra198902@gmail.com

### Useful Links
- [GitHub Repository](https://github.com/Raghavendra198902/iac)
- [npm Package](https://www.npmjs.com/package/@raghavendra198902/iac-dharma)
- [Release Notes](https://github.com/Raghavendra198902/iac/releases)

---

## What's Next?

**Beginner Path**:
1. ✅ Complete this Quick Start
2. 📖 Read [Architecture Overview](Architecture-Overview)
3. 🚀 Try [Example Deployments](Deployment-Examples)
4. 🎓 Follow [Tutorial Series](Tutorials)

**Advanced Path**:
1. ✅ Complete Quick Start
2. ⚙️ Configure [Feature Flags](Feature-Flags)
3. 📊 Set up [Advanced Monitoring](Advanced-Monitoring)
4. 🔒 Enable [SSO Integration](SSO-Integration)

**Developer Path**:
1. ✅ Complete Quick Start
2. 💻 Set up [Development Environment](Development-Setup)
3. 🧪 Read [Testing Guide](Testing-Guide)
4. 🤝 Follow [Contributing Guide](Contributing)

---

**Ready to dive deeper? Check out the [Architecture Overview](Architecture-Overview)!**
