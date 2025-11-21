# Welcome to IAC Dharma Wiki

🌸 **Balance in Automation** - Enterprise Infrastructure as Code automation platform

[![npm version](https://img.shields.io/npm/v/@raghavendra198902/iac-dharma.svg)](https://www.npmjs.com/package/@raghavendra198902/iac-dharma)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Release](https://img.shields.io/github/v/release/Raghavendra198902/iac)](https://github.com/Raghavendra198902/iac/releases)

---

## 📚 Documentation Hub

### Getting Started
- [Installation Guide](Installation-Guide) - Quick setup and installation
- [Quick Start](Quick-Start) - Get up and running in 5 minutes
- [Architecture Overview](Architecture-Overview) - System design and components
- [Configuration](Configuration) - Environment and service configuration

### Core Features
- [Multi-Cloud Support](Multi-Cloud-Support) - AWS, Azure, GCP integration
- [AI Recommendations](AI-Recommendations) - Intelligent cost optimization
- [Observability](Observability) - Prometheus, Grafana, Jaeger
- [Feature Flags](Feature-Flags) - Gradual rollouts and A/B testing
- [Admin Dashboard](Admin-Dashboard) - Monitoring and control
- [SSO Integration](SSO-Integration) - SAML and OAuth2

### API Documentation
- [API Reference](API-Reference) - Complete API documentation
- [REST API Endpoints](REST-API-Endpoints) - HTTP endpoints reference
- [Authentication](Authentication) - JWT and SSO auth
- [Rate Limiting](Rate-Limiting) - API throttling and quotas

### Development
- [Development Setup](Development-Setup) - Local development environment
- [Contributing Guide](Contributing-Guide) - How to contribute
- [Testing Guide](Testing-Guide) - Unit, integration, and E2E tests
- [Deployment Guide](Deployment-Guide) - Production deployment

### Operations
- [Docker Compose](Docker-Compose) - Running with Docker
- [Kubernetes Deployment](Kubernetes-Deployment) - K8s deployment
- [Monitoring Setup](Monitoring-Setup) - Setting up observability
- [Troubleshooting](Troubleshooting) - Common issues and solutions
- [Performance Tuning](Performance-Tuning) - Optimization tips

### Advanced Topics
- [Circuit Breakers](Circuit-Breakers) - Service resilience
- [Caching Strategy](Caching-Strategy) - Multi-layer caching
- [Database Optimization](Database-Optimization) - Query optimization
- [Security Best Practices](Security-Best-Practices) - Securing your deployment
- [CI/CD Pipeline](CI-CD-Pipeline) - Automated deployment

---

## 🚀 Quick Links

### Installation
```bash
npm install -g @raghavendra198902/iac-dharma
iac-dharma init --name my-project
docker-compose up -d
```

### Access Points
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Admin Dashboard**: http://localhost:3000/admin
- **Grafana**: http://localhost:3030
- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090

---

## 📦 What is IAC Dharma?

IAC Dharma is an enterprise-grade Infrastructure as Code automation platform that combines:

✅ **Multi-Cloud Automation** - Unified interface for AWS, Azure, and GCP  
✅ **AI-Powered Optimization** - Intelligent cost reduction and resource recommendations  
✅ **Comprehensive Observability** - Real-time monitoring with Prometheus, Grafana, and Jaeger  
✅ **Feature Management** - Advanced feature flags with gradual rollouts  
✅ **Enterprise Security** - SSO, RBAC, and compliance enforcement  
✅ **Microservices Architecture** - 18 production-ready services  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                      http://localhost:5173                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Node.js)                    │
│                      http://localhost:3000                   │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐  │
│  │ Auth     │ Rate     │ Circuit  │ Cache    │ Feature   │  │
│  │          │ Limiting │ Breaker  │          │ Flags     │  │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Blueprint   │  │ IAC          │  │ Cloud        │
│  Service     │  │ Generator    │  │ Provider     │
│  :3001       │  │ :3002        │  │ :3010        │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │ Redis        │  │ Prometheus   │
│ :5432        │  │ :6379        │  │ :9090        │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🎯 Key Features

### Infrastructure Automation
- Template-based blueprint system
- Multi-cloud resource provisioning
- Terraform and CloudFormation generation
- Policy enforcement and guardrails

### AI & Intelligence
- Cost optimization recommendations
- Resource usage prediction
- Anomaly detection
- Automated remediation

### Observability & Monitoring
- 40+ custom metrics collected
- 4 pre-configured Grafana dashboards
- Distributed tracing with OpenTelemetry
- Real-time log aggregation

### Security & Compliance
- SAML 2.0 and OAuth2 SSO
- Role-based access control
- Security scanning and auditing
- Compliance policy enforcement

---

## 🔧 Technology Stack

**Backend**: Node.js 20, TypeScript, Express, Python (FastAPI)  
**Frontend**: React 18, TypeScript, Vite, TailwindCSS  
**Databases**: PostgreSQL 15, Redis 7  
**Monitoring**: Prometheus, Grafana, Jaeger, OpenTelemetry  
**DevOps**: Docker, Kubernetes, Terraform, GitHub Actions  

---

## 📊 System Requirements

**Minimum**:
- CPU: 2 cores
- RAM: 4GB
- Disk: 20GB
- Docker: 20.10+
- Node.js: 18.0+

**Recommended**:
- CPU: 4+ cores
- RAM: 8GB+
- Disk: 50GB SSD
- Docker: 24.0+
- Node.js: 20.0+

---

## 🤝 Community

- **GitHub**: [Raghavendra198902/iac](https://github.com/Raghavendra198902/iac)
- **npm**: [@raghavendra198902/iac-dharma](https://www.npmjs.com/package/@raghavendra198902/iac-dharma)
- **Issues**: [GitHub Issues](https://github.com/Raghavendra198902/iac/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Raghavendra198902/iac/discussions)

---

## 📄 License

MIT © Raghavendra

---

## 🗺️ Roadmap

### v1.1.0 (Q1 2026)
- Advanced RBAC with custom roles
- Multi-tenancy support
- Additional cloud providers (Oracle, IBM)
- Enhanced AI models

### v1.2.0 (Q2 2026)
- GitOps integration (ArgoCD, Flux)
- Mobile application
- Advanced compliance reporting
- Real-time collaboration

### v2.0.0 (Q3 2026)
- Service mesh integration
- Plugin ecosystem
- Advanced analytics
- Marketplace for extensions

---

**⭐ Star us on GitHub!**  
**🌸 IAC Dharma - Balance in Automation**

Last Updated: November 21, 2025
