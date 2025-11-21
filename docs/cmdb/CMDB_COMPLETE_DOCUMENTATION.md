# CMDB (Configuration Management Database) - Complete System Documentation

## Overview

The CMDB system provides comprehensive infrastructure configuration management with three integrated components:

1. **Web UI** - Administrative interface for viewing and managing all configuration items
2. **Backend Agent** - Monitoring service for automated discovery and metrics collection
3. **Desktop GUI** - User-friendly application for local agent management

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CMDB Ecosystem                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐   ┌────────────┐  │
│  │   Web UI     │◄────►│ API Gateway  │◄──┤ Auth Token │  │
│  │ (React App)  │      │ (Express.js) │   └────────────┘  │
│  └──────────────┘      └──────────────┘                    │
│         │                      │                            │
│         │                      │                            │
│         ▼                      ▼                            │
│  ┌──────────────────────────────────────┐                  │
│  │      CMDB API Routes                 │                  │
│  │  - Config Items CRUD                 │                  │
│  │  - Agent Registration                │                  │
│  │  - Metrics Collection                │                  │
│  │  - Network Discovery                 │                  │
│  │  - Statistics & Reporting            │                  │
│  └──────────────────────────────────────┘                  │
│         ▲                      ▲                            │
│         │                      │                            │
│  ┌──────┴──────┐        ┌─────┴──────┐                    │
│  │ CMDB Agent  │        │ Desktop    │                     │
│  │ (Headless)  │        │ GUI App    │                     │
│  │             │        │ (Electron) │                     │
│  │ - Monitors  │        │            │                     │
│  │ - Discovers │        │ - Controls │                     │
│  │ - Reports   │        │ - Config   │                     │
│  └─────────────┘        └────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Web UI (CMDB.tsx)

**Location:** `frontend/src/pages/CMDB.tsx`  
**Lines:** 1369  
**Purpose:** Administrative interface for IT operations teams

**Features:**
- ✅ Configuration item management (CRUD operations)
- ✅ Real-time agent status monitoring
- ✅ Agent metrics visualization (CPU, Memory, Disk, Network)
- ✅ Network discovery results display
- ✅ One-click agent installation with platform selection
- ✅ Download agent packages (Linux tar.gz, Windows zip, Docker compose)
- ✅ Agent sync and discovery triggers
- ✅ Auto-refresh every 30 seconds
- ✅ Statistics dashboard with 6 metrics cards

**Technology:**
- React 19.2.0 with TypeScript
- Tailwind CSS for styling
- Lucide React icons
- Recharts for data visualization

### 2. Backend API (cmdb.ts)

**Location:** `backend/api-gateway/src/routes/cmdb.ts`  
**Lines:** 445  
**Purpose:** RESTful API for CMDB operations

**Endpoints:**

#### Configuration Items
- `GET /api/cmdb/items` - List all configuration items (with filters)
- `GET /api/cmdb/items/:id` - Get single configuration item
- `POST /api/cmdb/items` - Create new configuration item
- `PUT /api/cmdb/items/:id` - Update configuration item
- `DELETE /api/cmdb/items/:id` - Delete configuration item
- `GET /api/cmdb/stats` - Get statistics summary

#### Agent Management
- `POST /api/cmdb/agents/register` - Register or update agent
- `POST /api/cmdb/agents/:agentId/heartbeat` - Agent heartbeat
- `GET /api/cmdb/agents` - List all agents
- `GET /api/cmdb/agents/:agentId` - Get single agent
- `POST /api/cmdb/agents/:agentId/metrics` - Submit metrics
- `POST /api/cmdb/agents/:agentId/discovery` - Submit discovery data
- `POST /api/cmdb/agents/:agentId/sync` - Trigger agent sync
- `POST /api/cmdb/agents/:agentId/discover` - Trigger network discovery

#### Network Devices
- `GET /api/cmdb/network-devices` - List discovered network devices

**Security:**
- Snyk scan: 1 low severity issue (type validation)
- Authentication required (except downloads)
- Rate limiting on sensitive endpoints

### 3. CMDB Agent (Backend Service)

**Location:** `backend/cmdb-agent/`  
**Purpose:** Headless monitoring service for servers

**Files:**
- `index.ts` - Agent entry point and API server
- `cmdbAgent.ts` - Core agent logic
- `cmdbClient.ts` - CMDB API client
- `systemMonitor.ts` - System metrics collector
- `logger.ts` - Winston logging
- `types/index.ts` - TypeScript interfaces

**Features:**
- ✅ Auto-registration with CMDB API
- ✅ System metrics collection (CPU, Memory, Disk, Network)
- ✅ Docker container discovery
- ✅ Filesystem discovery
- ✅ Network device discovery
- ✅ Health checks with thresholds
- ✅ Scheduled tasks (cron)
- ✅ RESTful API for local control

**Installation Methods:**

**Docker (Recommended):**
```bash
curl -sSL http://192.168.1.10:3000/api/downloads/docker-compose.yml -o docker-compose.yml
docker-compose up -d
```

**Linux:**
```bash
curl -sSL http://192.168.1.10:3000/api/downloads/cmdb-agent-linux.tar.gz | tar -xz
cd cmdb-agent
./setup.sh
```

**Windows:**
```powershell
Invoke-WebRequest -Uri http://192.168.1.10:3000/api/downloads/cmdb-agent-windows.zip -OutFile cmdb-agent.zip
Expand-Archive cmdb-agent.zip
cd cmdb-agent
.\setup.ps1
```

**Configuration:**
- Environment variables or config file
- API URL, API Key, Agent ID, Agent Name
- Discovery and monitoring intervals
- Health check thresholds

### 4. Desktop GUI (Electron App)

**Location:** `backend/cmdb-agent-gui/`  
**Purpose:** User-friendly desktop application for workstations

**Key Files:**
- `src/electron/main.ts` (218 lines) - Main Electron process
- `src/electron/preload.ts` (19 lines) - IPC bridge
- `src/App.tsx` (390 lines) - React UI
- `src/types.ts` (36 lines) - TypeScript interfaces
- `package.json` - Dependencies and build config
- `vite.config.ts` - Build configuration

**Features:**
- ✅ Visual dashboard with real-time metrics
- ✅ Configuration UI for API settings
- ✅ Start/Stop agent controls
- ✅ Live logs viewer
- ✅ System tray integration
- ✅ Auto-start capability
- ✅ Cross-platform builds (Windows NSIS, Linux AppImage/deb, macOS DMG)

**Development:**
```bash
cd backend/cmdb-agent-gui
npm install
npm run electron:dev
```

**Build:**
```bash
npm run electron:build -- --win    # Windows
npm run electron:build -- --linux  # Linux
npm run electron:build -- --mac    # macOS
```

**Requirements:**
- Node.js 20+ (for Vite 7)
- Platform-specific icons in `assets/` directory

### 5. Downloads API

**Location:** `backend/api-gateway/src/routes/downloads.ts`  
**Lines:** 159  
**Purpose:** Public endpoint for agent package downloads

**Endpoints:**
- `GET /api/downloads/cmdb-agent-linux.tar.gz` - Linux package
- `GET /api/downloads/cmdb-agent-windows.zip` - Windows package
- `GET /api/downloads/docker-compose.yml` - Docker deployment
- `GET /api/downloads/agent-info` - Package metadata

**Features:**
- ✅ On-the-fly archive generation (archiver library)
- ✅ Rate limiting: 5 downloads/hour/IP
- ✅ Public access (no authentication required)
- ✅ 0 Snyk vulnerabilities

## Data Models

### Configuration Item
```typescript
interface ConfigItem {
  id: string;
  name: string;
  type: string;               // Server, Database, Network, etc.
  environment: string;         // Production, Staging, Development
  status: string;              // Active, Inactive, Maintenance
  ipAddress?: string;
  hostname?: string;
  os?: string;
  location?: string;
  department?: string;
  owner?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Agent
```typescript
interface Agent {
  agentId: string;
  agentName: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  ipAddress: string;
  hostname: string;
  os: string;
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  metadata?: Record<string, any>;
}
```

### Network Device
```typescript
interface NetworkDevice {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'firewall' | 'loadbalancer' | 'other';
  ipAddress: string;
  macAddress?: string;
  status: 'online' | 'offline' | 'unknown';
  discoveredBy: string;        // Agent ID
  discoveredAt: Date;
}
```

## Deployment

### Development
```bash
# Start API Gateway
cd backend/api-gateway
npm install
npm run dev

# Start CMDB Agent
cd backend/cmdb-agent
npm install
npm start

# Start Desktop GUI
cd backend/cmdb-agent-gui
npm install
npm run electron:dev
```

### Production

**Docker Compose (Recommended):**
```yaml
version: '3.8'
services:
  api-gateway:
    build: ./backend/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend/cmdb-agent:/cmdb-agent:ro

  cmdb-agent:
    build: ./backend/cmdb-agent
    environment:
      - CMDB_API_URL=http://api-gateway:3000/api/cmdb
      - CMDB_API_KEY=your-api-key
      - AGENT_ID=agent-001
      - AGENT_NAME=prod-server-01
```

## Security

### Snyk Scan Results
- ✅ CMDB Agent: 0 vulnerabilities
- ✅ Downloads API: 0 vulnerabilities
- ⚠️ CMDB API Routes: 1 low severity issue (type validation)

### Best Practices
- API authentication via JWT tokens
- Rate limiting on public endpoints
- Input validation on all endpoints
- HTTPS in production
- Secure agent API keys
- Regular security scans

## Monitoring & Observability

### Agent Health Checks
- CPU threshold monitoring
- Memory usage alerts
- Disk space warnings
- Network connectivity checks

### Metrics Collection
- Real-time system metrics every 10 seconds
- Aggregated metrics every 5 minutes
- Historical data retention (configurable)

### Logging
- Structured logging with Winston
- Log levels: error, warn, info, debug
- Centralized log collection (optional)

## Use Cases

### 1. IT Asset Management
- Track all infrastructure components
- Monitor hardware and software inventory
- Manage configuration changes

### 2. Automated Discovery
- Discover new devices on the network
- Auto-register detected systems
- Update configuration database automatically

### 3. Compliance Reporting
- Track system configurations
- Monitor compliance status
- Generate audit reports

### 4. Capacity Planning
- Monitor resource utilization trends
- Identify underutilized resources
- Plan infrastructure scaling

### 5. Incident Management
- Quick lookup of affected systems
- Track system dependencies
- Correlate incidents with configuration changes

## Roadmap

### Phase 1 (Completed) ✅
- Web UI with CRUD operations
- Backend API endpoints
- CMDB monitoring agent
- Agent integration in UI
- One-click installation
- Desktop GUI application

### Phase 2 (Planned)
- Database persistence (PostgreSQL/MongoDB)
- Advanced search and filtering
- Configuration change tracking
- Relationship mapping between CIs
- Alert notifications
- API rate limiting enhancements

### Phase 3 (Future)
- AI-powered anomaly detection
- Automated remediation
- Integration with ITSM tools
- Multi-tenancy support
- Advanced analytics and reporting
- Mobile application

## Support

### Troubleshooting

**Agent won't connect:**
- Check API URL and API key
- Verify network connectivity
- Check firewall rules
- Review agent logs

**Metrics not updating:**
- Check agent status (should be 'active')
- Verify last sync timestamp
- Check agent health endpoint
- Review API gateway logs

**Discovery not working:**
- Verify agent has network access
- Check discovery configuration
- Review discovery logs
- Ensure proper permissions

### Resources
- API Documentation: `/api/` endpoint
- Agent Logs: `backend/cmdb-agent/logs/`
- GUI Logs: Check Electron console
- System Logs: API Gateway logs

## Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development servers
5. Run tests: `npm test`
6. Run security scan: Snyk Code
7. Submit pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Security scanning before merge

## License

Part of IAC DHARMA platform

## Version

Current Version: 1.0.0
Last Updated: November 18, 2025
