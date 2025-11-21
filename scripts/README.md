# IAC Dharma - Utility Scripts

Comprehensive collection of utility scripts organized by function for easy maintenance and discovery.

> 📖 **Quick Links**: [Main README](../README.md) | [Documentation Index](../docs/README.md) | [Deployment Guide](../docs/deployment/DEPLOYMENT_GUIDE.md)

## 📚 Related Documentation

- **[Deployment Guide](../docs/deployment/DEPLOYMENT_GUIDE.md)** - How to deploy the platform
- **[CMDB Documentation](../docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md)** - CMDB setup and usage
- **[Testing Guide](../docs/testing/)** - Testing strategies
- **[CI/CD Guide](../docs/ci-cd/CI_CD_GUIDE.md)** - Continuous integration

## 📁 Directory Structure

### `/database`
Database backup, restore, and management
- **backup-database.sh** - Backup PostgreSQL database
- **restore-database.sh** - Restore database from backup

Usage:
```bash
./scripts/database/backup-database.sh
./scripts/database/restore-database.sh <backup-file>
```

📖 **Documentation**: [Deployment Guide](../docs/deployment/DEPLOYMENT_GUIDE.md) | [Database Schemas](../database/)

### `/testing`
Testing and validation scripts
- **test-integration.sh** - Run integration tests
- **test-load.sh** - Load testing script (moved from load-test.sh)
- **test-websocket.sh** - WebSocket connectivity tests

Usage:
```bash
./scripts/testing/test-integration.sh
./scripts/testing/test-load.sh
./scripts/testing/test-websocket.sh
```

📖 **Documentation**: [Testing Guide](../docs/testing/) | [Test Summary](../docs/testing/TEST_SUMMARY.md) | [Load Testing Report](../docs/testing/LOAD_TESTING_REPORT.md)

### `/deployment`
Platform deployment and orchestration
- **start-platform.sh** - Start all platform services
- **stop-platform.sh** - Stop all platform services
- **k8s-deploy.sh** - Deploy to Kubernetes
- **k8s-status.sh** - Check Kubernetes deployment status
- **validate-deployment.sh** - Validate deployment health

Usage:
```bash
./scripts/deployment/start-platform.sh
./scripts/deployment/k8s-deploy.sh
./scripts/deployment/validate-deployment.sh
```

📖 **Documentation**: [Deployment Guide](../docs/deployment/DEPLOYMENT_GUIDE.md) | [Kubernetes Guide](../docs/deployment/KUBERNETES_GUIDE.md) | [CI/CD Guide](../docs/ci-cd/CI_CD_GUIDE.md)

### `/monitoring`
System monitoring and health checks
- **health-check.sh** - Platform health check
- **logs.sh** - View service logs
- **performance-profile.sh** - Performance profiling

Usage:
```bash
./scripts/monitoring/health-check.sh
./scripts/monitoring/logs.sh [service-name]
./scripts/monitoring/performance-profile.sh
```

📖 **Documentation**: [Performance Report](../docs/performance/performance-profiling-report.md) | [Troubleshooting Guide](../docs/troubleshooting/) | [CMDB Monitoring](../docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md)

### `/security`
Security auditing and DLP testing
- **security-audit.sh** - Run security audit
- **test-dlp.sh** - Test DLP functionality (Linux)
- **test-agent-dlp.ps1** - Test agent DLP (Windows PowerShell)
- **enable-audit-policy.ps1** - Enable Windows audit policies

Usage:
```bash
./scripts/security/security-audit.sh
./scripts/security/test-dlp.sh

# Windows
powershell -ExecutionPolicy Bypass ./scripts/security/test-agent-dlp.ps1
```

📖 **Documentation**: [DLP Implementation](../docs/security/DATA_LEAKAGE_CONTROL_IMPLEMENTATION.md) | [DLP Quick Reference](../docs/security/DLP_QUICK_REFERENCE.md) | [Security Audit Report](../docs/security/security-audit-report.md)

### `/data`
Data seeding and demo data management
- **seed-demo-data.sh** - Seed demo data
- **seed-demo-data.ts** - TypeScript data seeding
- **seed-all.sh** - Seed all data types
- **seed-cmdb-data.js** - CMDB-specific data
- **seed-network-devices.js** - Network device data
- **clean-demo-data.js** - Remove demo data

Usage:
```bash
./scripts/data/seed-all.sh
./scripts/data/clean-demo-data.js
```

📖 **Documentation**: [CMDB Guide](../docs/cmdb/CMDB_COMPLETE_DOCUMENTATION.md) | [Mock Data Removal](../docs/status/MOCK_DATA_REMOVAL_SUMMARY.md)

### `/validation`
Validation and verification scripts
- **verify-ci-cd-setup.sh** - Verify CI/CD configuration
- **verify-demo-data.sh** - Check demo data integrity
- **verify-real-data-only.sh** - Ensure no demo data present

Usage:
```bash
./scripts/validation/verify-ci-cd-setup.sh
./scripts/validation/verify-real-data-only.sh
```

📖 **Documentation**: [CI/CD Guide](../docs/ci-cd/CI_CD_GUIDE.md) | [Testing Guide](../docs/testing/) | [Project Status](../docs/status/)

## 📚 Quick Workflows

### Complete Platform Deployment
```bash
# 1. Deploy platform
./scripts/deployment/start-platform.sh

# 2. Validate deployment
./scripts/deployment/validate-deployment.sh

# 3. Check health
./scripts/monitoring/health-check.sh

# 4. Seed data (optional)
./scripts/data/seed-all.sh
```

### Testing Workflow
```bash
# 1. Run integration tests
./scripts/testing/test-integration.sh

# 2. Run load tests
./scripts/testing/test-load.sh

# 3. Verify deployment
./scripts/validation/verify-real-data-only.sh
```

### Security Audit
```bash
# 1. Run security audit
./scripts/security/security-audit.sh

# 2. Test DLP functionality
./scripts/security/test-dlp.sh

# 3. Review audit results
cat ../docs/security/security-audit-report.md
```

## 🔗 Related Resources

- **[Complete Documentation](../docs/README.md)** - All documentation organized
- **[Main README](../README.md)** - Project overview
- **[Deployment Guide](../docs/deployment/DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[Quick Reference](../docs/guides/QUICK_REFERENCE.md)** - Common commands

## 🔧 Prerequisites

Most scripts require:
- Docker and Docker Compose installed
- Appropriate permissions (some may need sudo)
- Environment variables configured (see `.env.example`)
- For PowerShell scripts: Windows PowerShell 5.1+ or PowerShell Core 7+

## 📝 Adding New Scripts

When adding new scripts:

**Network Devices (3):**
- `core-router-01` - 48 ports, 32 connected devices
- `core-switch-01` - 48 ports, 45 connected devices
- `firewall-01` - 8 ports, 8 connected devices

**Security Events (6):**
- 2 clipboard events (1 high, 1 medium severity)
- 2 USB write events (1 high, 1 medium severity)
- 1 file access event (low severity)
- 1 network exfiltration event (high severity)

**Metrics History:**
- 5 data points per agent (15 total)
- CPU, Memory, Disk usage over time

### Usage

#### Method 1: Bash Script (Recommended)
```bash
cd /home/rrd/Documents/Iac
./scripts/seed-demo-data.sh
```

#### Method 2: Direct TypeScript
```bash
cd /home/rrd/Documents/Iac/scripts
npm install
npm run seed
```

#### Method 3: ts-node
```bash
cd /home/rrd/Documents/Iac/scripts
npx ts-node seed-demo-data.ts
```

### Prerequisites

1. **API Gateway Running:**
   ```bash
   docker-compose up -d
   ```

2. **Verify API:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Node.js & npm:**
   - Node.js 18+ required
   - npm 9+ recommended

### Output

```
🌱 Starting demo data seeding...

📡 Registering agents...
  ✅ Registered: web-server-prod-01 (agent-001)
  ✅ Registered: api-server-prod-01 (agent-002)
  ✅ Registered: db-server-prod-01 (agent-003)

💾 Creating configuration items...
  ✅ Created CI: Nginx Web Server (Application)
  ✅ Created CI: Ubuntu Server (Operating System)
  [... 14 more CIs ...]

🌐 Creating network devices...
  ✅ Created: core-router-01 (router)
  ✅ Created: core-switch-01 (switch)
  ✅ Created: firewall-01 (firewall)

🔒 Creating security events...
  ✅ Created: clipboard (medium) - agent-001
  ✅ Created: usb-write (high) - agent-002
  [... 4 more events ...]

📊 Sending agent metrics...
  ✅ Sent metrics for: agent-001
  ✅ Sent metrics for: agent-002
  ✅ Sent metrics for: agent-003

🔄 Updating agent status...
  ✅ Updated: web-server-prod-01 - online (98%)
  ✅ Updated: api-server-prod-01 - online (95%)
  ✅ Updated: db-server-prod-01 - warning (78%)

╔═══════════════════════════════════════════════════════════╗
║            🎉 Demo Data Seeded Successfully! 🎉           ║
╚═══════════════════════════════════════════════════════════╝

📋 Summary:
   Agents: 3
   Configuration Items: 16
   Network Devices: 3
   Security Events: 6
   Metrics Data Points: 15

🌐 Access the dashboard at: http://localhost:5173
🔒 View security events at: http://localhost:5173/security/dlp
```

### Verify Data

#### View Agents
```bash
curl http://localhost:3000/api/agents | jq
```

#### View Configuration Items
```bash
curl http://localhost:3000/api/cmdb/ci | jq
```

#### View Network Devices
```bash
curl http://localhost:3000/api/network/devices | jq
```

#### View Security Events
```bash
curl http://localhost:3000/api/security/events | jq
```

### Re-seeding

The script is idempotent - you can run it multiple times:
- Existing agents will be skipped (409 Conflict)
- New data will be created
- Existing CIs will be updated if IDs match

### Troubleshooting

**Error: API Gateway not running**
```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps
```

**Error: Cannot find module 'axios'**
```bash
cd scripts
npm install
```

**Error: ts-node not found**
```bash
npm install --save-dev ts-node typescript @types/node
```

**Error: Connection refused**
```bash
# Check API is accessible
curl http://localhost:3000/health

# Check Docker network
docker network ls
docker network inspect iac_default
```

### Clean Demo Data

To remove all demo data and start fresh:

```bash
# Stop services
docker-compose down

# Remove volumes (⚠️ destroys all data)
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait 30 seconds for initialization
sleep 30

# Re-seed
./scripts/seed-demo-data.sh
```

### Customization

Edit `seed-demo-data.ts` to customize:

- **agents[]** - Add/modify agent definitions
- **configurationItems[]** - Add/modify CI data
- **networkDevices[]** - Add/modify network devices
- **securityEvents[]** - Add/modify DLP events
- **agentMetrics[]** - Modify metric time series

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agents/register` | POST | Register agent |
| `/api/agents/:id/heartbeat` | POST | Update status |
| `/api/cmdb/ci` | POST | Create CI |
| `/api/cmdb/ci/:id/metrics` | POST | Send metrics |
| `/api/network/devices` | POST | Create network device |
| `/api/security/events` | POST | Create security event |

### Integration Testing

Use this seeder for:
- Development environment setup
- Demo presentations
- Integration testing
- Performance testing baseline
- UI screenshot generation

---

**Version:** 1.0.0  
**Last Updated:** November 20, 2025  
**Author:** Citadel Development Team
