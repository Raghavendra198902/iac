# IAC Dharma v3.0 - Documentation Wiki

## 📚 Welcome to IAC Dharma Documentation

A comprehensive Infrastructure as Code platform with AI-powered orchestration, AIOps capabilities, and Zero Trust security.

---

## 🚀 Quick Start

### New Users
1. **[Installation Guide](03_DEPLOYMENT_OPERATIONS.md#installation--deployment)** - Get started in 15 minutes
2. **[Quick Start Tutorial](#quick-start-tutorial)** - Deploy your first infrastructure
3. **[API Overview](02_API_REFERENCE.md#api-gateway-endpoints)** - Explore the API

### Existing Users
- **[What's New in v3.0](#whats-new-in-v30)** - Latest features and improvements
- **[Migration Guide](#migration-from-v20)** - Upgrade from v2.0
- **[Release Notes](#release-notes)** - Detailed changelog

---

## 📖 Documentation Structure

### 1. Architecture & Design

**[Complete Architecture Overview](01_ARCHITECTURE_OVERVIEW.md)**
- System architecture with flowcharts
- Component interactions
- Data flow diagrams
- Security architecture
- Deployment architecture

**Key Topics**:
- [Multi-layer Architecture](01_ARCHITECTURE_OVERVIEW.md#system-architecture)
- [Request Flow](01_ARCHITECTURE_OVERVIEW.md#component-flowcharts)
- [Zero Trust Integration](01_ARCHITECTURE_OVERVIEW.md#zero-trust-access-verification)
- [Service Dependencies](01_ARCHITECTURE_OVERVIEW.md#service-interactions)
- [Data Persistence](01_ARCHITECTURE_OVERVIEW.md#data-flow-architecture)

---

### 2. API Reference

**[Complete API Documentation](02_API_REFERENCE.md)**
- All service endpoints
- Request/response examples
- Authentication flows
- Error handling

**Services**:
- [API Gateway](02_API_REFERENCE.md#api-gateway-endpoints)
- [Zero Trust Security](02_API_REFERENCE.md#zero-trust-security-api)
- [AI Orchestrator](02_API_REFERENCE.md#ai-orchestrator-api)
- [AIOps Engine](02_API_REFERENCE.md#aiops-engine-api)
- [Self-Healing](02_API_REFERENCE.md#self-healing-api)
- [Chaos Engineering](02_API_REFERENCE.md#chaos-engineering-api)
- [Observability](02_API_REFERENCE.md#observability-api)
- [Cost Optimizer](02_API_REFERENCE.md#cost-optimizer-api)
- [CMDB Agent](02_API_REFERENCE.md#cmdb-agent-api)

---

### 3. Deployment & Operations

**[Deployment Guide](03_DEPLOYMENT_OPERATIONS.md)**
- System requirements
- Installation procedures
- Configuration management
- Operations & maintenance

**Topics**:
- [Installation Steps](03_DEPLOYMENT_OPERATIONS.md#installation--deployment)
- [Environment Configuration](03_DEPLOYMENT_OPERATIONS.md#environment-configuration)
- [Service Management](03_DEPLOYMENT_OPERATIONS.md#service-management)
- [Monitoring](03_DEPLOYMENT_OPERATIONS.md#monitoring--troubleshooting)
- [Troubleshooting](03_DEPLOYMENT_OPERATIONS.md#common-issues--solutions)
- [Backup & Recovery](03_DEPLOYMENT_OPERATIONS.md#disaster-recovery)
- [Security Hardening](03_DEPLOYMENT_OPERATIONS.md#security-hardening)

---

### 4. Developer Guide

**[Developer Documentation](04_DEVELOPER_GUIDE.md)**
- Development environment setup
- Project structure
- Coding standards
- Testing guidelines

**Topics**:
- [Environment Setup](04_DEVELOPER_GUIDE.md#development-environment-setup)
- [Project Structure](04_DEVELOPER_GUIDE.md#project-structure)
- [Development Workflow](04_DEVELOPER_GUIDE.md#development-workflow)
- [Coding Standards](04_DEVELOPER_GUIDE.md#coding-standards)
- [Testing](04_DEVELOPER_GUIDE.md#testing-guidelines)
- [Contributing](04_DEVELOPER_GUIDE.md#contributing)
- [Debugging](04_DEVELOPER_GUIDE.md#debugging--profiling)

---

### 5. Feature Documentation

**[Feature Reference](05_FEATURE_DOCUMENTATION.md)**
- Detailed feature descriptions
- Architecture diagrams
- Configuration options
- Use cases and examples

**Features**:
- [Zero Trust Security](05_FEATURE_DOCUMENTATION.md#zero-trust-security)
- [AI Orchestrator (NLI)](05_FEATURE_DOCUMENTATION.md#ai-orchestrator-with-nli)
- [AIOps ML Engine](05_FEATURE_DOCUMENTATION.md#aiops-ml-engine)
- [Self-Healing](05_FEATURE_DOCUMENTATION.md#self-healing-engine)
- [Chaos Engineering](05_FEATURE_DOCUMENTATION.md#chaos-engineering)
- [CMDB Agent](05_FEATURE_DOCUMENTATION.md#cmdb-agent)
- [Observability](05_FEATURE_DOCUMENTATION.md#observability-suite)
- [Cost Optimizer](05_FEATURE_DOCUMENTATION.md#cost-optimizer)
- [User Management](05_FEATURE_DOCUMENTATION.md#user-management)

---

## 🎯 Quick Start Tutorial

### Prerequisites
- Docker 24.0+
- Docker Compose 2.20+
- 16GB RAM
- 50GB disk space

### Step 1: Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-org/iac-dharma.git
cd iac-dharma

# Create environment file
cp .env.example .env

# Generate secure passwords
./scripts/generate-passwords.sh >> .env
```

### Step 2: Deploy Services

```bash
# Build and start all services
docker compose -f docker-compose.v3.yml up -d

# Monitor startup (wait for "ready")
docker compose -f docker-compose.v3.yml logs -f | grep "ready"
```

### Step 3: Verify Installation

```bash
# Run health checks
./test-services.sh

# Expected output:
# ✓ API Gateway: healthy
# ✓ Zero Trust: healthy
# ✓ AI Orchestrator: healthy
# (... all services healthy)
```

### Step 4: Create Admin User

```bash
# Authenticate and get JWT token
TOKEN=$(curl -X POST "http://localhost:4000/api/zero-trust/authenticate" \
  -d "username=admin" \
  -d "password=ChangeMe123!" \
  -d "device_id=admin-workstation" \
  | jq -r '.access_token')

echo "Your token: $TOKEN"
```

### Step 5: Deploy Your First Infrastructure

```bash
# Use Natural Language Interface
curl -X POST "http://localhost:4000/api/ai-orchestrator/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Deploy 3 web servers with load balancer in AWS us-east-1"
  }'

# Response includes:
# - Generated Terraform code
# - Cost estimate
# - Execution plan
# - Recommendations
```

### Step 6: Access Dashboards

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **MLflow**: http://localhost:5000

---

## 🆕 What's New in v3.0

### Zero Trust Security ✨ NEW
- Multi-factor trust scoring (device, user, context)
- 5-tier trust levels with dynamic evaluation
- Policy-based access control
- Continuous verification every 15 minutes
- Comprehensive audit logging

[Learn more →](05_FEATURE_DOCUMENTATION.md#zero-trust-security)

### AI Orchestrator with NLI 🤖 ENHANCED
- Natural language infrastructure deployment
- Intent classification with 95% accuracy
- Multi-cloud code generation
- Real-time cost estimation
- Context-aware recommendations

[Learn more →](05_FEATURE_DOCUMENTATION.md#ai-orchestrator-with-nli)

### AIOps ML Engine 🧠 ENHANCED
- 8 ML models for intelligent operations
- 94% cost prediction accuracy
- Automated resource optimization (20-40% savings)
- Incident classification and root cause analysis
- Compliance prediction

[Learn more →](05_FEATURE_DOCUMENTATION.md#aiops-ml-engine)

### Self-Healing Engine 🏥 IMPROVED
- Automated issue detection and remediation
- 6 remediation strategies
- ML-powered root cause analysis
- Rollback capabilities
- Zero-downtime healing

[Learn more →](05_FEATURE_DOCUMENTATION.md#self-healing-engine)

---

## 📊 Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    IAC Dharma v3.0                      │
└─────────────────────────────────────────────────────────┘

          ┌─────────────────────────────────┐
          │      Client Applications        │
          │   (Web, Mobile, CLI, SDKs)      │
          └──────────────┬──────────────────┘
                         │
                         ▼
          ┌─────────────────────────────────┐
          │        API Gateway (4000)       │
          │  GraphQL, REST, WebSocket       │
          └──────────────┬──────────────────┘
                         │
                         ▼
          ┌─────────────────────────────────┐
          │   Zero Trust Security (8500)    │
          │  Trust Scoring, Policy Engine   │
          └──────────────┬──────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│AI Orchestrator│ │ AIOps Engine │ │ Self-Healing │
│    (8300)     │ │    (8100)    │ │    (8400)    │
│  NLI, Code    │ │ ML Predictions│ │Auto Remediate│
│  Generation   │ │ Cost, Drift  │ │ 6 Strategies │
└───────┬───────┘ └───────┬──────┘ └───────┬──────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Chaos Engineer│ │ Observability│ │Cost Optimizer│
│    (8700)    │ │    (8800)    │ │    (8900)    │
│  Experiments │ │ Metrics, Logs│ │ Savings Recs │
└──────────────┘ └──────────────┘ └──────────────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  CMDB Agent      │           │ User Management  │
│     (8200)       │           │                  │
│ Asset Discovery  │           │ Auth, RBAC       │
└──────────────────┘           └──────────────────┘
         │
         └───────────────┐
                         ▼
         ┌───────────────────────────────┐
         │     Data & Storage Layer      │
         ├───────────────────────────────┤
         │ PostgreSQL, Neo4j, Redis      │
         │ TimescaleDB, Kafka            │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │     Monitoring Layer          │
         │ Prometheus, Grafana, MLflow   │
         └───────────────────────────────┘
```

[View Detailed Architecture →](01_ARCHITECTURE_OVERVIEW.md)

---

## 🔐 Security Overview

IAC Dharma implements defense-in-depth security:

### Layer 1: Network Security
- Docker network isolation
- Container-to-container communication restrictions
- Firewall rules

### Layer 2: API Gateway
- Rate limiting (1000 req/min)
- Input validation
- Request sanitization

### Layer 3: Zero Trust Security ⭐
- Device posture verification
- User behavior analysis
- Context-aware trust scoring
- Policy-based access control
- Continuous verification

### Layer 4: Service-Level Security
- JWT authentication
- Role-based access control (RBAC)
- Service-to-service authentication
- Input sanitization

### Layer 5: Data Security
- Encryption at rest
- Encryption in transit (TLS)
- Audit logging
- Sensitive data masking

### Layer 6: Monitoring & Detection
- Anomaly detection
- Security event correlation
- Incident response automation

[Learn more about security →](03_DEPLOYMENT_OPERATIONS.md#security-hardening)

---

## 🎓 Learning Paths

### For Platform Engineers

1. **Getting Started** (30 minutes)
   - [Installation](03_DEPLOYMENT_OPERATIONS.md#installation--deployment)
   - [Configuration](03_DEPLOYMENT_OPERATIONS.md#configuration-management)
   - [First Deployment](#step-5-deploy-your-first-infrastructure)

2. **Core Concepts** (2 hours)
   - [Architecture Overview](01_ARCHITECTURE_OVERVIEW.md)
   - [Zero Trust Security](05_FEATURE_DOCUMENTATION.md#zero-trust-security)
   - [Service Interactions](01_ARCHITECTURE_OVERVIEW.md#service-interactions)

3. **Advanced Topics** (4 hours)
   - [AIOps ML Models](05_FEATURE_DOCUMENTATION.md#aiops-ml-engine)
   - [Self-Healing Strategies](05_FEATURE_DOCUMENTATION.md#self-healing-engine)
   - [Chaos Engineering](05_FEATURE_DOCUMENTATION.md#chaos-engineering)

### For Developers

1. **Environment Setup** (1 hour)
   - [Dev Environment](04_DEVELOPER_GUIDE.md#development-environment-setup)
   - [Project Structure](04_DEVELOPER_GUIDE.md#project-structure)
   - [Development Workflow](04_DEVELOPER_GUIDE.md#development-workflow)

2. **Contributing** (2 hours)
   - [Coding Standards](04_DEVELOPER_GUIDE.md#coding-standards)
   - [Testing Guidelines](04_DEVELOPER_GUIDE.md#testing-guidelines)
   - [Pull Request Process](04_DEVELOPER_GUIDE.md#contributing)

3. **Deep Dive** (4+ hours)
   - [Service Development](04_DEVELOPER_GUIDE.md#project-structure)
   - [API Integration](02_API_REFERENCE.md)
   - [Debugging & Profiling](04_DEVELOPER_GUIDE.md#debugging--profiling)

### For API Users

1. **API Basics** (1 hour)
   - [Authentication](02_API_REFERENCE.md#authentication-flow)
   - [Core Endpoints](02_API_REFERENCE.md#api-gateway-endpoints)
   - [Error Handling](02_API_REFERENCE.md#error-handling)

2. **Feature APIs** (2 hours)
   - [Zero Trust API](02_API_REFERENCE.md#zero-trust-security-api)
   - [AI Orchestrator API](02_API_REFERENCE.md#ai-orchestrator-api)
   - [AIOps API](02_API_REFERENCE.md#aiops-engine-api)

3. **Advanced Usage** (3 hours)
   - [Rate Limiting](02_API_REFERENCE.md#rate-limiting)
   - [Best Practices](02_API_REFERENCE.md)
   - [Integration Patterns](02_API_REFERENCE.md)

---

## 📚 Additional Resources

### Tutorials
- [Deploy a Multi-Tier Application](#tutorials-multi-tier)
- [Set Up CI/CD Pipeline](#tutorials-cicd)
- [Implement Cost Optimization](#tutorials-cost-optimization)
- [Configure Chaos Experiments](#tutorials-chaos)

### How-To Guides
- [Configure Custom Zero Trust Policies](#howto-zero-trust-policies)
- [Train Custom ML Models](#howto-ml-models)
- [Set Up Multi-Cloud Deployment](#howto-multi-cloud)
- [Implement Custom Self-Healing Strategies](#howto-self-healing)

### Reference
- [Environment Variables](03_DEPLOYMENT_OPERATIONS.md#environment-configuration)
- [Configuration Files](03_DEPLOYMENT_OPERATIONS.md#service-configuration)
- [Database Schemas](01_ARCHITECTURE_OVERVIEW.md#data-flow-architecture)
- [Message Formats](01_ARCHITECTURE_OVERVIEW.md#messaging--event-processing)

### Troubleshooting
- [Common Issues](03_DEPLOYMENT_OPERATIONS.md#common-issues--solutions)
- [Performance Tuning](03_DEPLOYMENT_OPERATIONS.md#performance-tuning)
- [Debug Logs](03_DEPLOYMENT_OPERATIONS.md#log-management)
- [Health Checks](03_DEPLOYMENT_OPERATIONS.md#health-checks)

---

## 🆘 Getting Help

### Community Support
- **GitHub Discussions**: Ask questions, share ideas
- **GitHub Issues**: Report bugs, request features
- **Stack Overflow**: Tag `iac-dharma`

### Documentation Issues
Found an error in the docs? [Open an issue](https://github.com/your-org/iac-dharma/issues/new?labels=documentation)

### Commercial Support
Enterprise support available: support@iac-dharma.com

---

## 🗺️ Roadmap

### v3.1 (Q1 2026)
- Enhanced NLI with conversational context
- Kubernetes native deployment
- Azure DevOps integration
- Advanced cost allocation

### v3.2 (Q2 2026)
- Multi-region disaster recovery
- Advanced ML model explainability
- Custom chaos experiments builder
- Real-time collaboration features

### v4.0 (Q3 2026)
- Web UI with visual infrastructure builder
- Mobile app for monitoring
- Advanced compliance frameworks
- Edge computing support

[View Full Roadmap →](../ROADMAP_v3.0.md)

---

## 📋 Quick Reference

### Common Commands

```bash
# Start all services
docker compose -f docker-compose.v3.yml up -d

# View logs
docker compose -f docker-compose.v3.yml logs -f [service-name]

# Restart service
docker compose -f docker-compose.v3.yml restart [service-name]

# Stop all services
docker compose -f docker-compose.v3.yml stop

# Health check
./test-services.sh

# Backup
./scripts/backup.sh full

# Train ML models
./train-ml-models.sh
```

### Important Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 4000 | http://localhost:4000 |
| Zero Trust | 8500 | http://localhost:8500 |
| AI Orchestrator | 8300 | http://localhost:8300 |
| AIOps Engine | 8100 | http://localhost:8100 |
| Self-Healing | 8400 | http://localhost:8400 |
| Grafana | 3000 | http://localhost:3000 |
| Prometheus | 9090 | http://localhost:9090 |
| MLflow | 5000 | http://localhost:5000 |

### Environment Files

- `.env` - Production configuration
- `.env.dev` - Development configuration
- `.env.test` - Test configuration
- `.env.example` - Template with defaults

---

## 🔖 Document Index

### Core Documentation
1. [Architecture Overview](01_ARCHITECTURE_OVERVIEW.md) - System design and flowcharts
2. [API Reference](02_API_REFERENCE.md) - Complete API documentation
3. [Deployment & Operations](03_DEPLOYMENT_OPERATIONS.md) - Installation and operations
4. [Developer Guide](04_DEVELOPER_GUIDE.md) - Development guidelines
5. [Feature Documentation](05_FEATURE_DOCUMENTATION.md) - Detailed feature descriptions
6. [Documentation Wiki](00_DOCUMENTATION_INDEX.md) - This page

### Additional Documentation
- `README.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - License information
- `SECURITY.md` - Security policy
- `ROADMAP_v3.0.md` - Product roadmap

### Feature-Specific Docs
- `ZERO_TRUST_SECURITY_COMPLETE.md` - Zero Trust implementation
- `AI_ORCHESTRATOR_COMPLETE.md` - AI Orchestrator details
- `ENHANCED_ML_MODELS_COMPLETE.md` - ML models documentation
- `SELF_HEALING_COMPLETE.md` - Self-healing implementation
- `CHAOS_ENGINEERING_COMPLETE.md` - Chaos engineering guide

---

## 📄 Documentation Backup

All documentation is backed up daily to:
- `docs/backup/YYYYMMDD_HHMMSS/` - Timestamped backups
- Git repository - Version controlled
- External storage - S3/Azure Blob (if configured)

Latest backup: **docs/backup/20251208_071159/** (63 files, 940KB)

---

**Documentation Version**: 1.0  
**Last Updated**: December 8, 2025  
**Platform Version**: v3.0  
**Total Documentation Pages**: 6 core documents + 63 feature-specific documents

---

## 🎉 Thank You

Thank you for using IAC Dharma! We're constantly improving the platform and documentation. Your feedback is valuable.

**Happy Infrastructure Coding!** 🚀
