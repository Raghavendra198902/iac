# IaC Dharma Platform - Citadel Edition

> **AI-Powered Infrastructure as Code Management Platform with Integrated CMDB & Data Leakage Control**

A comprehensive enterprise platform for managing infrastructure blueprints, deployments, configuration management, and security monitoring with AI-powered insights and automated agent distribution featuring Data Loss Prevention (DLP).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Security](https://img.shields.io/badge/Security-DLP%20Enabled-red.svg)](docs/security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md)

## 📚 Documentation

> **[📖 Complete Documentation Index](DOCUMENTATION_INDEX.md)** - Comprehensive guide to all documentation and scripts  
> **[⚡ Quick Navigation](QUICK_NAV.md)** - Fast access to common tasks and documentation

### Quick Links
- **[Quick Navigation Guide](QUICK_NAV.md)** - "I want to..." task-based navigation
- **[Complete Documentation Index](DOCUMENTATION_INDEX.md)** - Master index of all docs and scripts
- **[Documentation Categories](docs/README.md)** - All documentation organized by category
- **[Quick Start Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Get started in minutes
- **[API Documentation](docs/api/API_DOCUMENTATION.md)** - Complete API reference
- **[CMDB Guide](docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md)** - CMDB setup and usage
- **[Security & DLP](docs/security/)** - Security features and DLP implementation
- **[Scripts Reference](scripts/README.md)** - Utility scripts documentation
- **[Recent Changes](REORGANIZATION_SUMMARY.md)** - Project reorganization summary

## 🌟 Features

### Infrastructure Management
- 📋 **Blueprint Management** - Create, edit, and version control infrastructure blueprints
- 🤖 **AI-Powered Designer** - Natural language to infrastructure code generation
- 🔧 **IaC Generator** - Multi-cloud infrastructure code generation
- 🚀 **Deployment Monitor** - Real-time deployment tracking and management
- 🛡️ **Guardrails** - Policy enforcement and compliance checking

### Configuration Management Database (CMDB)
- 💾 **Asset Discovery** - Automatic discovery and registration of IT assets
- 🔄 **Real-time Monitoring** - Live system metrics and health monitoring
- 📊 **Relationship Mapping** - Visualize dependencies between components
- 🤝 **Multi-Agent Support** - Deploy agents across your infrastructure
- 📦 **Professional Installers** - One-click installation packages

📖 **Learn More**: [CMDB Complete Documentation](docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md) | [Agent User Manual](docs/cmdb/AGENT_USER_MANUAL.md)

### 🔐 Data Leakage Control (DLP) **NEW**
- 📋 **Clipboard Monitoring** - Detect sensitive data in clipboard (SSN, credit cards, API keys, passwords)
- 💾 **USB Write Detection** - Monitor and block unauthorized USB data transfers
- 📁 **File Access Watchdog** - Track sensitive folder access (Documents, Desktop, Downloads)
- 🌐 **Network Exfiltration Guard** - Detect suspicious network connections (FTP, SSH, RDP, reverse shells)
- ⚡ **Auto-Blocking** - Automatic threat response for high-severity events
- 📊 **Security Dashboard** - Real-time DLP event visualization and analytics
- 🎯 **Compliance Ready** - ISO 27001, SOC 2, GDPR, PCI DSS, HIPAA, NIST 800-53

📖 **Learn More**: [DLP Implementation Guide](docs/security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md) | [DLP Quick Reference](docs/security/DLP_QUICK_REFERENCE.md) | [Security Audit](docs/security/security-audit-report.md)

### Analytics & Insights
- 📈 **Performance Analytics** - Track system and deployment performance
- 💰 **Cost Management** - Monitor and optimize cloud spending
- ⚠️ **Risk Assessment** - Security and compliance risk analysis
- 🧠 **AI Insights** - Machine learning-powered recommendations
- 📊 **Custom Dashboards** - Configurable monitoring dashboards

### Automation
- ⚡ **Automation Engine** - Workflow automation and orchestration
- 🔔 **Smart Alerts** - Intelligent alerting and notifications
- 🔄 **Auto-remediation** - Automatic issue resolution
- 📅 **Scheduled Tasks** - Recurring automation workflows

📖 **Learn More**: [Automation Guide](docs/automation/AUTOMATION.md) | [End-to-End Automation](docs/automation/END_TO_END_AUTOMATION.md)

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (or Node.js 20+ for standalone executables)
- **Docker 20.10+** (optional, for containerized deployment)
- **PostgreSQL 13+** (for production)

### Installation

#### Option 1: Development Setup
```bash
# Clone the repository
git clone https://github.com/your-org/iac-dharma.git
cd iac-dharma

# Install dependencies
npm install

# Start API Gateway
cd backend/api-gateway
npm run dev

# Start Frontend (in new terminal)
cd frontend
npm run dev

# Start CMDB Agent (in new terminal)
cd backend/cmdb-agent
npm run dev
```

#### Option 2: Docker Deployment
```bash
# Start all services with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# API: http://localhost:3000
```

#### Option 3: CMDB Agent Only
Download pre-built installers from the Downloads page:
- **Windows**: Professional installer with GUI wizard
- **Linux**: Self-extracting installer
- **Portable**: Standalone executables (no Node.js required)

Visit: `http://your-server:5173/downloads`

## 📁 Project Structure

```
iac/
├── backend/                    # Backend microservices
│   ├── api-gateway/           # Main API gateway
│   ├── ai-engine/             # AI/ML services
│   ├── automation-engine/     # Automation workflows
│   ├── blueprint-service/     # Blueprint management
│   ├── cmdb-agent/            # CMDB agent service
│   ├── cmdb-agent-gui/        # Agent GUI installer
│   ├── costing-service/       # Cost analytics
│   ├── guardrails-engine/     # Policy enforcement
│   ├── iac-generator/         # IaC code generation
│   ├── monitoring-service/    # System monitoring
│   └── orchestrator-service/  # Deployment orchestration
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API clients
│   │   └── contexts/          # React contexts
│   └── public/                # Static assets
│
├── docs/                       # Documentation (organized)
│   ├── api/                   # API documentation
│   ├── automation/            # Automation guides
│   ├── cmdb/                  # CMDB documentation
│   ├── security/              # Security & DLP docs
│   ├── testing/               # Testing guides
│   ├── deployment/            # Deployment guides
│   ├── ci-cd/                 # CI/CD documentation
│   ├── guides/                # User guides
│   ├── status/                # Project status reports
│   └── architecture/          # System architecture
│
├── scripts/                    # Utility scripts (organized)
│   ├── database/              # Database scripts
│   └── testing/               # Testing scripts
│
├── config/                     # Configuration files
├── database/                   # Database schemas & migrations
├── deployment/                 # Deployment configurations
│   ├── kubernetes/            # K8s manifests
│   └── monitoring/            # Monitoring configs
├── iac-templates/             # Infrastructure templates
├── tests/                      # Test suites
├── terraform/                  # Terraform modules
└── docker-compose.yml         # Docker orchestration
```

See [docs/README.md](docs/README.md) for detailed documentation structure.

## 📦 CMDB Agent Distribution

We provide multiple installation options for the CMDB Agent:

### Professional Installers (Recommended)

#### Windows
```powershell
# Download from /downloads page or
curl -O http://localhost:3000/api/downloads/cmdb-agent-installer.zip

# Extract and build
iexpress /N installer.sed

# Result: cmdb-agent-installer-1.0.0.exe
```

#### Linux
```bash
# Download and run
curl -O http://localhost:3000/api/downloads/cmdb-agent-setup.run
chmod +x cmdb-agent-setup-1.0.0.run
./cmdb-agent-setup-1.0.0.run
```

### Standalone Executables (Portable)

#### Windows
```powershell
# Download standalone executable (42 MB)
curl -O http://localhost:3000/api/downloads/cmdb-agent-win.exe

# Create configuration
echo '{"apiUrl":"http://localhost:3000","apiKey":"your-key","agentName":"MyPC"}' > config.json

# Run
.\cmdb-agent-win.exe
```

#### Linux
```bash
# Download standalone binary (50 MB)
curl -O http://localhost:3000/api/downloads/cmdb-agent-linux
chmod +x cmdb-agent-linux

# Create configuration
cat > config.json << EOF
{
  "apiUrl": "http://localhost:3000",
  "apiKey": "your-api-key",
  "agentName": "$(hostname)"
}
EOF

# Run
./cmdb-agent-linux
```

### API Downloads

All installers available via REST API:
```bash
# Get download information
curl http://localhost:3000/api/downloads/agent-info | jq

# Download specific package
curl -O http://localhost:3000/api/downloads/cmdb-agent-win.exe
curl -O http://localhost:3000/api/downloads/cmdb-agent-installer.zip
curl -O http://localhost:3000/api/downloads/cmdb-agent-setup.run
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  - Material-UI Components                                   │
│  - Real-time WebSocket updates                              │
│  - AI-powered UI/UX                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS/WSS
                  │
┌─────────────────▼───────────────────────────────────────────┐
│               API Gateway (Express + TypeScript)            │
│  - RESTful APIs                                             │
│  - WebSocket support                                        │
│  - Authentication & Authorization                           │
│  - Rate limiting                                            │
│  - Download endpoints                                       │
└────────┬──────────────────────┬─────────────────────────────┘
         │                      │
         │                      │
┌────────▼────────┐   ┌─────────▼──────────┐
│   PostgreSQL    │   │   CMDB Agents      │
│   Database      │   │  (Multiple nodes)  │
│                 │   │  - Windows/Linux   │
│  - Blueprints   │   │  - System metrics  │
│  - Deployments  │   │  - Auto-discovery  │
│  - Assets       │   │  - Health checks   │
│  - Metrics      │   └────────────────────┘
└─────────────────┘
```

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed setup instructions
- **[API Documentation](http://localhost:3000/api-docs)** - OpenAPI/Swagger docs
- **[CMDB Agent Distribution](backend/cmdb-agent/DISTRIBUTION.md)** - Agent installation options
- **[Building Installers](backend/cmdb-agent/BUILD_INSTALLERS.md)** - Create custom installers
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing guidelines
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment

## 🔧 Configuration

### Environment Variables

#### API Gateway
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/iac_dharma
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:5173
```

#### Frontend
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

#### CMDB Agent
```json
{
  "apiUrl": "http://localhost:3000",
  "apiKey": "your-api-key",
  "agentName": "server-01",
  "scanInterval": 300000,
  "logLevel": "info"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- blueprints

# Watch mode
npm run test:watch
```

## 🚢 Deployment

### Production Build
```bash
# Build all services
npm run build

# Start in production mode
NODE_ENV=production npm start
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n iac-dharma
```

## 📊 Monitoring

Access monitoring dashboards:
- **Application**: http://localhost:5173/monitoring
- **Performance**: http://localhost:5173/performance
- **CMDB**: http://localhost:5173/cmdb
- **Metrics**: http://localhost:3000/metrics (Prometheus)
- **Health**: http://localhost:3000/health

## 🔐 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: 5 downloads per hour (configurable)
- **Secure Headers**: CSP, HSTS, X-Frame-Options
- **Input Validation**: Comprehensive request validation
- **Checksum Verification**: SHA256 for all downloads

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development process
- Submitting pull requests
- Coding standards

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- UI powered by [Material-UI](https://mui.com/)
- Backend with [Express](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/)
- Monitoring with [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/iac-dharma/issues)
- **Documentation**: [Wiki](https://github.com/your-org/iac-dharma/wiki)
- **Email**: support@iac-dharma.com

## 🗺️ Roadmap

- [x] Blueprint management
- [x] AI-powered designer
- [x] CMDB integration
- [x] Professional installers
- [x] Download distribution system
- [ ] Multi-cloud support (AWS, Azure, GCP)
- [ ] Advanced AI recommendations
- [ ] Mobile app
- [ ] Enterprise SSO integration
- [ ] Advanced analytics

---

**Made with ❤️ by the IaC Dharma Team**

*Version 1.0.0 - November 2025*
