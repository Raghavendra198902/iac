# IAC Dharma

[![npm version](https://img.shields.io/npm/v/@raghavendra198902/iac-dharma.svg)](https://www.npmjs.com/package/@raghavendra198902/iac-dharma)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@raghavendra198902/iac-dharma.svg)](https://nodejs.org)

🌸 **Balance in Automation** - Enterprise Infrastructure as Code automation platform with AI-powered recommendations, multi-cloud support, and comprehensive observability.

## Features

- ✅ **Multi-Cloud Support**: AWS, Azure, and GCP integration
- ✅ **AI-Powered Recommendations**: Intelligent cost optimization and resource suggestions
- ✅ **Distributed Tracing**: OpenTelemetry & Jaeger for request flow visualization
- ✅ **Comprehensive Observability**: Prometheus metrics + Grafana dashboards
- ✅ **Feature Flags**: Gradual rollouts and A/B testing support
- ✅ **Admin Dashboard**: Real-time monitoring and control
- ✅ **Enterprise SSO**: SAML 2.0 and OAuth2 integration
- ✅ **Circuit Breakers**: Service resilience and graceful degradation
- ✅ **Rate Limiting**: Tiered API protection
- ✅ **18 Microservices**: Production-ready architecture

## Quick Start

### Installation

```bash
npm install -g @raghavendra198902/iac-dharma
```

### Initialize a New Project

```bash
# Create new project
iac-dharma init --name my-infrastructure

# Navigate to project
cd my-infrastructure

# Start all services
docker-compose up -d
```

### Access the Platform

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Admin Dashboard**: http://localhost:3000/admin
- **Grafana**: http://localhost:3030 (admin/admin)
- **Jaeger Tracing**: http://localhost:16686
- **Prometheus**: http://localhost:9090

## CLI Commands

```bash
# Initialize new project
iac-dharma init

# Start services
iac-dharma start

# Stop services
iac-dharma stop

# Check service status
iac-dharma status

# View logs
iac-dharma logs
iac-dharma logs --service api-gateway --follow

# Health check
iac-dharma health

# View documentation
iac-dharma docs

# System information
iac-dharma info

# Update to latest version
iac-dharma update
```

## Architecture

IAC Dharma consists of 18 microservices:

### Core Services
- **API Gateway** (3000) - Main API entry point
- **Frontend** (5173) - React web application
- **Blueprint Service** (3001) - Template management
- **IAC Generator** (3002) - Infrastructure code generation
- **Guardrails Engine** (3003) - Policy enforcement
- **Costing Service** (3004) - Cost calculation
- **Orchestrator** (3005) - Deployment workflows
- **Automation Engine** (3006) - Workflow automation

### AI & Analytics
- **AI Engine** (8000) - Python ML service
- **AI Recommendations** (3011) - Cost optimization

### Cloud Integration
- **Cloud Provider Service** (3010) - Multi-cloud integration
- **Monitoring Service** (3007) - Service monitoring

### Security & Auth
- **SSO Service** (3012) - Authentication

### Infrastructure
- **PostgreSQL** (5432) - Primary database
- **Redis** (6379) - Cache & sessions
- **Prometheus** (9090) - Metrics collection
- **Grafana** (3030) - Metrics visualization
- **Jaeger** (16686) - Distributed tracing

## Technology Stack

**Backend**: Node.js 20, TypeScript, Express, PostgreSQL, Redis  
**Frontend**: React 18, TypeScript, Vite, TailwindCSS  
**DevOps**: Docker, Kubernetes, Terraform, GitHub Actions  
**Monitoring**: Prometheus, Grafana, Jaeger, OpenTelemetry

## Requirements

- **Node.js**: >= 18.0.0
- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0
- **npm**: >= 9.0.0

## Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Release Notes](./RELEASE_NOTES.md)
- [Changelog](./CHANGELOG.md)
- [API Documentation](http://localhost:3000/api-docs)
- [Feature Documentation](./ADVANCED_FEATURES_COMPLETE.md)

## Configuration

Create a `.env` file with your configuration:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=iac_dharma

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Authentication
JWT_SECRET=your_secret_key

# Cloud Providers
AWS_ACCESS_KEY_ID=your_key
AZURE_SUBSCRIPTION_ID=your_subscription
GCP_PROJECT_ID=your_project
```

## Performance

- **Response Time**: P50 < 50ms, P95 < 200ms, P99 < 500ms
- **Throughput**: 1000+ requests/sec per instance
- **Resource Usage**: ~2GB memory total
- **Uptime**: 99.9% target

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **GitHub Issues**: https://github.com/Raghavendra198902/iac/issues
- **Documentation**: https://github.com/Raghavendra198902/iac
- **Email**: raghavendra198902@gmail.com

## License

MIT © Raghavendra

## Roadmap

### v1.1.0 (Q1 2026)
- Advanced RBAC with custom roles
- Multi-tenancy support
- Additional cloud providers (Oracle, IBM)
- Enhanced AI recommendations

### v1.2.0 (Q2 2026)
- GitOps integration
- Automated compliance reporting
- Mobile application
- Advanced cost forecasting

### v2.0.0 (Q3 2026)
- Service mesh integration
- Advanced ML models
- Real-time collaboration
- Plugin ecosystem

---

**⭐ Star us on GitHub if you find this project useful!**

**🌸 IAC Dharma - Balance in Automation**
