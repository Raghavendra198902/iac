# IAC Dharma Documentation

This directory contains all documentation for the IAC Dharma platform, organized by category for easy navigation.

> 📖 **Quick Links**: [Main README](../README.md) | [Scripts Guide](../scripts/README.md) | [Reorganization Summary](../REORGANIZATION_SUMMARY.md)

## 📚 Documentation Index

### Getting Started
1. **[Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)** - Start here for installation
2. **[Quick Reference](guides/QUICK_REFERENCE.md)** - Common commands and workflows
3. **[API Documentation](api/API_DOCUMENTATION.md)** - REST API reference
4. **[Project Overview](guides/PROBLEM_STATEMENT_SCOPE_PURPOSE.md)** - Understanding the platform

## 📁 Directory Structure

### `/api`
API documentation and specifications
- **[API_DOCUMENTATION.md](api/API_DOCUMENTATION.md)** - Complete API reference

🔗 **Related**: [Rate Limiting Guide](guides/RATE_LIMITING_GUIDE.md) | [CI/CD Guide](ci-cd/CI_CD_GUIDE.md)

### `/automation`
Automation engine and workflow documentation
- **[AUTOMATION.md](automation/AUTOMATION.md)** - Automation basics
- **[END_TO_END_AUTOMATION.md](automation/END_TO_END_AUTOMATION.md)** - Complete automation workflows

🔗 **Related**: [Deployment Scripts](../scripts/deployment/) | [Monitoring Scripts](../scripts/monitoring/)

### `/cmdb`
Configuration Management Database documentation
- **[CMDB_COMPLETE_DOCUMENTATION.md](cmdb/CMDB_COMPLETE_DOCUMENTATION.md)** - CMDB architecture and APIs
- **[AGENT_USER_MANUAL.md](cmdb/AGENT_USER_MANUAL.md)** - CMDB agent installation and usage

🔗 **Related**: [Data Seeding Scripts](../scripts/data/) | [Monitoring Guide](performance/performance-profiling-report.md) | [Troubleshooting](troubleshooting/)

### `/security`
Security, compliance, and data protection
- **[SECURITY_DASHBOARD.md](security/SECURITY_DASHBOARD.md)** - Security monitoring
- **[DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md](security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md)** - DLP implementation
- **[DLP_QUICK_REFERENCE.md](security/DLP_QUICK_REFERENCE.md)** - Quick reference for DLP
- **[security-audit-implementation.md](security/security-audit-implementation.md)** - Security audit details
- **[security-audit-report.md](security/security-audit-report.md)** - Audit results

🔗 **Related**: [Security Scripts](../scripts/security/) | [Testing Guide](testing/)

### `/testing`
Testing strategies and reports
- **[INTELLIGENT_MOCK_TESTING.md](testing/INTELLIGENT_MOCK_TESTING.md)** - Mock testing approach
- **[LOAD_TESTING_REPORT.md](testing/LOAD_TESTING_REPORT.md)** - Performance testing results
- **[TEST_SUMMARY.md](testing/TEST_SUMMARY.md)** - Overall test coverage

🔗 **Related**: [Testing Scripts](../scripts/testing/) | [Validation Scripts](../scripts/validation/) | [CI/CD Guide](ci-cd/CI_CD_GUIDE.md)

### `/deployment`
Deployment guides and configurations
- **[DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)** - Main deployment guide
- **[DEPLOYMENT_PACKAGE_README.md](deployment/DEPLOYMENT_PACKAGE_README.md)** - Package details
- **[DEPLOYMENT_SUMMARY.md](deployment/DEPLOYMENT_SUMMARY.md)** - Deployment overview
- **[KUBERNETES_GUIDE.md](deployment/KUBERNETES_GUIDE.md)** - K8s deployment
- **[SERVICE-INSTALLATION.md](deployment/SERVICE-INSTALLATION.md)** - Service installation steps

🔗 **Related**: [Deployment Scripts](../scripts/deployment/) | [Database Scripts](../scripts/database/) | [CI/CD Guide](ci-cd/CI_CD_GUIDE.md)

### `/ci-cd`
CI/CD pipeline documentation
- **[CI_CD_GUIDE.md](ci-cd/CI_CD_GUIDE.md)** - Complete CI/CD guide
- **[GITHUB_SECRETS_SETUP.md](ci-cd/GITHUB_SECRETS_SETUP.md)** - GitHub Actions secrets

🔗 **Related**: [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) | [Testing Guide](testing/) | [Validation Scripts](../scripts/validation/)

### `/performance`
Performance monitoring and optimization
- **[performance-profiling-report.md](performance/performance-profiling-report.md)** - Performance analysis

🔗 **Related**: [Monitoring Scripts](../scripts/monitoring/) | [Load Testing](testing/LOAD_TESTING_REPORT.md) | [CMDB Monitoring](cmdb/CMDB_COMPLETE_DOCUMENTATION.md)

### `/troubleshooting`
Troubleshooting guides and common issues
- **[AI_ENGINE_TROUBLESHOOTING.md](troubleshooting/AI_ENGINE_TROUBLESHOOTING.md)** - AI engine issues

🔗 **Related**: [CMDB Agent Manual](cmdb/AGENT_USER_MANUAL.md) | [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) | [Monitoring Scripts](../scripts/monitoring/)

### `/guides`
User guides and quick references
- **[QUICK_REFERENCE.md](guides/QUICK_REFERENCE.md)** - Quick command reference
- **[UI-BACKEND-ALIGNMENT.md](guides/UI-BACKEND-ALIGNMENT.md)** - UI/Backend integration
- **[UI-ENHANCEMENT-SUMMARY.md](guides/UI-ENHANCEMENT-SUMMARY.md)** - UI improvements
- **[RATE_LIMITING_GUIDE.md](guides/RATE_LIMITING_GUIDE.md)** - API rate limiting
- **[PROBLEM_STATEMENT_SCOPE_PURPOSE.md](guides/PROBLEM_STATEMENT_SCOPE_PURPOSE.md)** - Project overview

🔗 **Related**: [API Documentation](api/API_DOCUMENTATION.md) | [All Scripts](../scripts/README.md)

### `/status`
Project status, phase completion, and reports
- **[PHASE_STATUS.md](status/PHASE_STATUS.md)** - Current phase status
- **[MOCK_DATA_REMOVAL_SUMMARY.md](status/MOCK_DATA_REMOVAL_SUMMARY.md)** - Demo data cleanup
- **[PROJECT_STATUS.md](status/PROJECT_STATUS.md)** - Overall project status
- **[FINAL_IMPLEMENTATION_REPORT.md](status/FINAL_IMPLEMENTATION_REPORT.md)** - Implementation summary
- Various `*_COMPLETE.md` files - Phase completion reports

🔗 **Related**: [Reorganization Summary](../REORGANIZATION_SUMMARY.md)

### `/architecture`
System architecture diagrams and documentation

## 🚀 Quick Start

1. **New Users**: Start with [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)
2. **Developers**: Check [API Documentation](api/API_DOCUMENTATION.md) and [Quick Reference](guides/QUICK_REFERENCE.md)
3. **Operators**: Review [CMDB Guide](cmdb/CMDB_COMPLETE_DOCUMENTATION.md) and [Troubleshooting](troubleshooting/)
4. **Security Team**: See [Security Documentation](security/)

## 📝 Common Workflows

### First-Time Setup
1. Read [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)
2. Configure [GitHub Secrets](ci-cd/GITHUB_SECRETS_SETUP.md) (if using CI/CD)
3. Review [Quick Reference](guides/QUICK_REFERENCE.md)
4. Run deployment scripts from [../scripts/deployment/](../scripts/deployment/)

### CMDB Agent Installation
1. Read [CMDB Complete Documentation](cmdb/CMDB_COMPLETE_DOCUMENTATION.md)
2. Follow [Agent User Manual](cmdb/AGENT_USER_MANUAL.md)
3. Use data seeding scripts from [../scripts/data/](../scripts/data/)

### Security & Compliance
1. Review [DLP Implementation Guide](security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md)
2. Check [Security Audit Report](security/security-audit-report.md)
3. Use [DLP Quick Reference](security/DLP_QUICK_REFERENCE.md)
4. Run security scripts from [../scripts/security/](../scripts/security/)

### Testing & Validation
1. Read [Test Summary](testing/TEST_SUMMARY.md)
2. Run tests using [../scripts/testing/](../scripts/testing/)
3. Validate with [../scripts/validation/](../scripts/validation/)
4. Review [Load Testing Report](testing/LOAD_TESTING_REPORT.md)

## 📚 Related Resources

- **[Main Project README](../README.md)** - Project overview and features
- **[Scripts Documentation](../scripts/README.md)** - All utility scripts
- **[Reorganization Summary](../REORGANIZATION_SUMMARY.md)** - Recent changes
- **[Docker Compose](../docker-compose.yml)** - Container orchestration

## 📝 Contributing

When adding new documentation:
1. Place files in the appropriate category folder
2. Update this README with the new file reference
3. Use clear, descriptive filenames
4. Follow the existing markdown format

## 🔗 Related Directories

- `/scripts/` - Utility scripts organized by function
- `/config/` - Configuration files
- `/tests/` - Test files and test documentation
