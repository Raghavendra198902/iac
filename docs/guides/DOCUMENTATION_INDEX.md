# IAC Dharma Platform - Complete Documentation Index

> **Central hub for all documentation, scripts, and resources**

## 🚀 Getting Started

### Essential Reading (Start Here)
1. **[Main README](README.md)** - Platform overview, features, and quick start
2. **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Installation and setup
3. **[Quick Reference](docs/guides/QUICK_REFERENCE.md)** - Common commands and workflows
4. **[Project Overview](docs/guides/PROBLEM_STATEMENT_SCOPE_PURPOSE.md)** - Understanding the platform

### First-Time Setup Checklist
- [ ] Read [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
- [ ] Review [Project Structure](README.md#-project-structure)
- [ ] Set up [GitHub Secrets](docs/ci-cd/GITHUB_SECRETS_SETUP.md) (if using CI/CD)
- [ ] Run [deployment scripts](scripts/deployment/)
- [ ] Verify with [validation scripts](scripts/validation/)

---

## 📚 Documentation Categories

### 🔌 API & Integration
- **[API Documentation](docs/api/API_DOCUMENTATION.md)** - Complete REST API reference
- **[Rate Limiting Guide](docs/guides/RATE_LIMITING_GUIDE.md)** - API rate limits and quotas
- **[UI-Backend Alignment](docs/guides/UI-BACKEND-ALIGNMENT.md)** - Frontend-backend integration

### 🤖 Automation
- **[Automation Guide](docs/automation/AUTOMATION.md)** - Automation basics and concepts
- **[End-to-End Automation](docs/automation/END_TO_END_AUTOMATION.md)** - Complete automation workflows
- **[Automation Scripts](scripts/deployment/)** - Deployment and orchestration scripts

### 💾 CMDB (Configuration Management Database)
- **[CMDB Complete Documentation](docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md)** - Architecture, APIs, and workflows
- **[Agent User Manual](docs/cmdb/AGENT_USER_MANUAL.md)** - Agent installation and configuration
- **[Data Seeding Scripts](scripts/data/)** - CMDB data management
- **[Mock Data Removal Summary](docs/status/MOCK_DATA_REMOVAL_SUMMARY.md)** - Demo data cleanup

### 🔐 Security & Compliance
- **[DLP Implementation Guide](docs/security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md)** - Data Loss Prevention setup
- **[DLP Quick Reference](docs/security/DLP_QUICK_REFERENCE.md)** - Quick DLP commands
- **[Security Dashboard](docs/security/SECURITY_DASHBOARD.md)** - Security monitoring
- **[Security Audit Implementation](docs/security/security-audit-implementation.md)** - Audit procedures
- **[Security Audit Report](docs/security/security-audit-report.md)** - Latest audit results
- **[Security Scripts](scripts/security/)** - Security testing and auditing

### 🧪 Testing & Quality
- **[Test Summary](docs/testing/TEST_SUMMARY.md)** - Overall test coverage
- **[Intelligent Mock Testing](docs/testing/INTELLIGENT_MOCK_TESTING.md)** - Mock testing approach
- **[Load Testing Report](docs/testing/LOAD_TESTING_REPORT.md)** - Performance test results
- **[Testing Scripts](scripts/testing/)** - Integration and load tests
- **[Validation Scripts](scripts/validation/)** - Deployment verification

### 🚀 Deployment & Operations
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Main deployment instructions
- **[Kubernetes Guide](docs/deployment/KUBERNETES_GUIDE.md)** - K8s deployment
- **[Deployment Summary](docs/deployment/DEPLOYMENT_SUMMARY.md)** - Overview
- **[Service Installation](docs/deployment/SERVICE-INSTALLATION.md)** - Individual services
- **[Deployment Package](docs/deployment/DEPLOYMENT_PACKAGE_README.md)** - Package details
- **[Deployment Scripts](scripts/deployment/)** - Automation scripts

### 🔄 CI/CD
- **[CI/CD Guide](docs/ci-cd/CI_CD_GUIDE.md)** - Complete CI/CD setup
- **[GitHub Secrets Setup](docs/ci-cd/GITHUB_SECRETS_SETUP.md)** - GitHub Actions configuration

### 📊 Performance & Monitoring
- **[Performance Profiling Report](docs/performance/performance-profiling-report.md)** - Performance analysis
- **[Monitoring Scripts](scripts/monitoring/)** - Health checks and logging

### 🔧 Troubleshooting
- **[AI Engine Troubleshooting](docs/troubleshooting/AI_ENGINE_TROUBLESHOOTING.md)** - AI service issues
- **[CMDB Agent Manual](docs/cmdb/AGENT_USER_MANUAL.md#troubleshooting)** - Agent issues
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md#troubleshooting)** - Deployment issues

### 📖 User Guides
- **[Quick Reference](docs/guides/QUICK_REFERENCE.md)** - Command cheat sheet
- **[UI Enhancement Summary](docs/guides/UI-ENHANCEMENT-SUMMARY.md)** - UI improvements
- **[Rate Limiting Guide](docs/guides/RATE_LIMITING_GUIDE.md)** - API usage limits
- **[Problem Statement](docs/guides/PROBLEM_STATEMENT_SCOPE_PURPOSE.md)** - Project context

### 📈 Project Status & Reports
- **[Phase Status](docs/status/PHASE_STATUS.md)** - Current development phase
- **[Project Status](docs/status/PROJECT_STATUS.md)** - Overall progress
- **[Final Implementation Report](docs/status/FINAL_IMPLEMENTATION_REPORT.md)** - Summary
- **[Reorganization Summary](REORGANIZATION_SUMMARY.md)** - Recent changes

### 🏗️ Architecture
- **[Architecture Documentation](docs/architecture/)** - System design and diagrams
- **[Project Structure](README.md#-project-structure)** - Folder organization

---

## 🛠️ Scripts & Utilities

### Database Management
- **[Database Scripts](scripts/database/)** - Backup and restore
  - `backup-database.sh` - PostgreSQL backup
  - `restore-database.sh` - Database restore

### Testing & Validation
- **[Testing Scripts](scripts/testing/)** - Integration, load, and WebSocket tests
  - `test-integration.sh` - Integration tests
  - `test-load.sh` - Load testing
  - `test-websocket.sh` - WebSocket tests
- **[Validation Scripts](scripts/validation/)** - Deployment verification
  - `verify-ci-cd-setup.sh` - CI/CD validation
  - `verify-real-data-only.sh` - Data integrity check

### Deployment & Operations
- **[Deployment Scripts](scripts/deployment/)** - Platform management
  - `start-platform.sh` - Start services
  - `stop-platform.sh` - Stop services
  - `k8s-deploy.sh` - Kubernetes deployment
  - `validate-deployment.sh` - Health check

### Monitoring & Health
- **[Monitoring Scripts](scripts/monitoring/)** - System monitoring
  - `health-check.sh` - Platform health
  - `logs.sh` - View logs
  - `performance-profile.sh` - Performance metrics

### Security & Auditing
- **[Security Scripts](scripts/security/)** - Security testing
  - `security-audit.sh` - Run audit
  - `test-dlp.sh` - DLP testing
  - `test-agent-dlp.ps1` - Windows DLP test

### Data Management
- **[Data Scripts](scripts/data/)** - Data seeding and cleanup
  - `seed-all.sh` - Seed all data
  - `seed-cmdb-data.js` - CMDB data
  - `clean-demo-data.js` - Remove demo data

---

## 🎯 Common Workflows

### Complete Platform Setup
```bash
# 1. Clone and setup
git clone <repo-url>
cd iac

# 2. Deploy platform
./scripts/deployment/start-platform.sh

# 3. Validate deployment
./scripts/deployment/validate-deployment.sh

# 4. Check health
./scripts/monitoring/health-check.sh

# 5. Seed data (optional)
./scripts/data/seed-all.sh
```

📖 **Documentation**: [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)

### CMDB Agent Installation
```bash
# 1. Read documentation
cat docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md
cat docs/cmdb/AGENT_USER_MANUAL.md

# 2. Seed CMDB data
./scripts/data/seed-cmdb-data.js

# 3. Monitor agents
./scripts/monitoring/logs.sh cmdb-agent
```

📖 **Documentation**: [CMDB Guide](docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md) | [Agent Manual](docs/cmdb/AGENT_USER_MANUAL.md)

### Security Audit & DLP
```bash
# 1. Run security audit
./scripts/security/security-audit.sh

# 2. Test DLP functionality
./scripts/security/test-dlp.sh

# 3. Review results
cat docs/security/security-audit-report.md
```

📖 **Documentation**: [DLP Implementation](docs/security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md) | [Security Audit](docs/security/security-audit-report.md)

### Testing & Validation
```bash
# 1. Run integration tests
./scripts/testing/test-integration.sh

# 2. Run load tests
./scripts/testing/test-load.sh

# 3. Verify deployment
./scripts/validation/verify-real-data-only.sh

# 4. Check CI/CD
./scripts/validation/verify-ci-cd-setup.sh
```

📖 **Documentation**: [Testing Guide](docs/testing/TEST_SUMMARY.md) | [CI/CD Guide](docs/ci-cd/CI_CD_GUIDE.md)

---

## 🔗 Quick Navigation

### By Role

#### Developers
- [API Documentation](docs/api/API_DOCUMENTATION.md)
- [Quick Reference](docs/guides/QUICK_REFERENCE.md)
- [Project Structure](README.md#-project-structure)
- [All Scripts](scripts/README.md)

#### Operations/DevOps
- [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
- [CMDB Documentation](docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md)
- [Monitoring Scripts](scripts/monitoring/)
- [Troubleshooting](docs/troubleshooting/)

#### Security Team
- [DLP Implementation](docs/security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md)
- [Security Audit Report](docs/security/security-audit-report.md)
- [Security Scripts](scripts/security/)

#### QA/Testing
- [Test Summary](docs/testing/TEST_SUMMARY.md)
- [Load Testing Report](docs/testing/LOAD_TESTING_REPORT.md)
- [Testing Scripts](scripts/testing/)
- [Validation Scripts](scripts/validation/)

### By Task

#### Installation & Setup
1. [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
2. [Kubernetes Guide](docs/deployment/KUBERNETES_GUIDE.md)
3. [Deployment Scripts](scripts/deployment/)

#### Configuration
1. [CMDB Configuration](docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md)
2. [GitHub Secrets](docs/ci-cd/GITHUB_SECRETS_SETUP.md)
3. [Agent Setup](docs/cmdb/AGENT_USER_MANUAL.md)

#### Monitoring & Debugging
1. [Performance Report](docs/performance/performance-profiling-report.md)
2. [Troubleshooting Guide](docs/troubleshooting/)
3. [Monitoring Scripts](scripts/monitoring/)

#### Security & Compliance
1. [DLP Quick Reference](docs/security/DLP_QUICK_REFERENCE.md)
2. [Security Audit](docs/security/security-audit-report.md)
3. [Security Scripts](scripts/security/)

---

## 📞 Support & Resources

- **Main README**: [README.md](README.md)
- **Complete Documentation**: [docs/README.md](docs/README.md)
- **All Scripts**: [scripts/README.md](scripts/README.md)
- **Recent Changes**: [REORGANIZATION_SUMMARY.md](REORGANIZATION_SUMMARY.md)

---

**Last Updated**: November 21, 2025  
**Version**: 2.0.0  
**Documentation Status**: ✅ Complete and Cross-Referenced
