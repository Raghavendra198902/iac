# Citadel CMDB - Utility Scripts

This directory contains utility scripts for the Citadel CMDB platform.

## Demo Data Seeder

Seeds the database with realistic demo data matching the production UI.

### What Gets Created

**Agents (3):**
- `web-server-prod-01` - 98% health, online
- `api-server-prod-01` - 95% health, online  
- `db-server-prod-01` - 78% health, warning

**Configuration Items (16 total):**
- 5 CIs for web-server
- 8 CIs for api-server
- 3 CIs for db-server
- Types: Application, Operating System, Network, Hardware, Storage, Database

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
