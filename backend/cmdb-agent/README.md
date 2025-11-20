# CMDB Agent

A lightweight monitoring agent that automatically discovers infrastructure resources and registers them in the CMDB (Configuration Management Database).

## Features

- **Automatic Registration**: Self-registers in CMDB on startup
- **Real-time Monitoring**: Collects system metrics (CPU, Memory, Disk, Network)
- **Health Checks**: Monitors system health and updates CI status
- **Auto-Discovery**: Discovers and registers:
  - Docker containers
  - Running services
  - File systems
  - Network interfaces
- **Metrics Collection**: Sends periodic metrics to CMDB
- **Threshold Alerting**: Detects degraded states based on configurable thresholds
- **RESTful API**: Exposes endpoints for health checks and manual operations

## Architecture

```
┌─────────────────────────────────────────┐
│         CMDB Agent (Client)             │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     System Monitor                │ │
│  │  - CPU/Memory/Disk metrics        │ │
│  │  - Network interfaces             │ │
│  │  - Health checks                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     Discovery Engine              │ │
│  │  - Docker containers              │ │
│  │  - Services                       │ │
│  │  - File systems                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     CMDB Client                   │ │
│  │  - Register/Update CIs            │ │
│  │  - Send metrics                   │ │
│  │  - Sync status                    │ │
│  └───────────────────────────────────┘ │
│                                         │
└────────────────┬────────────────────────┘
                 │ HTTP/REST API
                 ▼
┌─────────────────────────────────────────┐
│           CMDB API Server               │
│    (Configuration Management DB)        │
└─────────────────────────────────────────┘
```

## Installation

### Quick Setup (Linux/macOS)

```bash
cd backend/cmdb-agent
chmod +x setup.sh
./setup.sh
```

### Quick Setup (Windows)

```powershell
cd backend\cmdb-agent
.\setup.ps1
```

The setup script will:
- Check Docker installation
- Create `.env` from template
- Build Docker image
- Start the agent container
- Display useful commands

### Using Docker Compose (Manual)

**Linux/macOS:**
```bash
cd backend/cmdb-agent

# Copy environment file
cp .env.example .env

# Edit configuration
nano .env

# Start agent
docker-compose up -d

# View logs
docker-compose logs -f
```

**Windows (PowerShell):**
```powershell
cd backend\cmdb-agent

# Copy environment file
Copy-Item .env.example .env

# Edit configuration
notepad .env

# Start agent
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Installation

**Linux/macOS:**
```bash
cd backend/cmdb-agent

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit configuration
nano .env

# Build
npm run build

# Start agent
npm start
```

**Windows (PowerShell):**
```powershell
cd backend\cmdb-agent

# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Edit configuration
notepad .env

# Build
npm run build

# Start agent
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_ID` | Unique agent identifier | agent-001 |
| `AGENT_NAME` | Human-readable agent name | primary-agent |
| `AGENT_ENVIRONMENT` | Environment (production/staging/dev) | production |
| `CMDB_API_URL` | CMDB API endpoint | http://localhost:3000/api/cmdb |
| `CMDB_API_KEY` | API authentication key | - |
| `SCAN_INTERVAL_MINUTES` | Discovery scan interval | 5 |
| `HEALTH_CHECK_INTERVAL_SECONDS` | Health check frequency | 30 |
| `METRIC_COLLECTION_INTERVAL_SECONDS` | Metric collection frequency | 60 |
| `AUTO_DISCOVERY_ENABLED` | Enable auto-discovery | true |
| `CPU_THRESHOLD_PERCENT` | CPU usage alert threshold | 80 |
| `MEMORY_THRESHOLD_PERCENT` | Memory usage alert threshold | 85 |
| `DISK_THRESHOLD_PERCENT` | Disk usage alert threshold | 90 |
| `AGENT_PORT` | Agent API port | 9000 |

### Thresholds

Adjust thresholds based on your infrastructure needs:

```env
CPU_THRESHOLD_PERCENT=80
MEMORY_THRESHOLD_PERCENT=85
DISK_THRESHOLD_PERCENT=90
```

## API Endpoints

### GET /health
Health check endpoint for monitoring

**Response:**
```json
{
  "status": "healthy",
  "registered": true,
  "ciId": "ci-agent-001",
  "errors": 0,
  "lastSync": "2025-11-17T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### GET /status
Detailed agent status

**Response:**
```json
{
  "registered": true,
  "ciId": "ci-agent-001",
  "errors": 0,
  "lastSync": "2025-11-17T10:30:00Z",
  "agentId": "agent-001",
  "environment": "production",
  "config": {
    "scanInterval": 5,
    "autoDiscovery": true,
    "thresholds": {
      "cpu": 80,
      "memory": 85,
      "disk": 90
    }
  },
  "uptime": 3600
}
```

### POST /sync
Trigger manual sync (metrics + health check)

**Response:**
```json
{
  "success": true,
  "message": "Sync completed",
  "timestamp": "2025-11-17T10:30:00Z"
}
```

### POST /discover
Trigger manual discovery scan

**Response:**
```json
{
  "success": true,
  "message": "Discovery completed",
  "timestamp": "2025-11-17T10:30:00Z"
}
```

## Workflow

### 1. Startup
- Load configuration
- Initialize system monitor
- Check CMDB connectivity
- Register self as CI item

### 2. Continuous Monitoring
- **Every 30 seconds**: Health check
- **Every 60 seconds**: Collect and send metrics
- **Every 5 minutes**: Discovery scan (if enabled)

### 3. Health Checks
```
CPU > threshold    → Status: degraded
Memory > threshold → Status: degraded
Disk > threshold   → Status: degraded
Multiple issues    → Status: down
```

### 4. Discovery
Discovers and registers:
- Docker containers (if Docker socket accessible)
- Running system services
- Mounted file systems
- Network interfaces

### 5. Metrics Sent
```json
{
  "cpu": { "usage": 45, "cores": 4, "model": "Intel i7" },
  "memory": { "total": 16GB, "used": 8GB, "usagePercent": 50 },
  "disk": { "total": 500GB, "used": 200GB, "usagePercent": 40 },
  "network": { "interfaces": [...] },
  "uptime": 86400,
  "timestamp": "2025-11-17T10:30:00Z"
}
```

## Usage Examples

### Deploy with Docker Compose

```bash
# Start agent
docker-compose up -d

# Check status
curl http://localhost:9000/status

# View logs
docker-compose logs -f cmdb-agent

# Trigger manual sync
curl -X POST http://localhost:9000/sync

# Trigger discovery
curl -X POST http://localhost:9000/discover
```

### Check Health

```bash
curl http://localhost:9000/health
```

### Monitor Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

## Troubleshooting

### Agent Not Registering

1. Check CMDB API connectivity:
```bash
curl http://localhost:3000/api/cmdb/health
```

2. Verify API key:
```bash
echo $CMDB_API_KEY
```

3. Check agent logs:
```bash
docker-compose logs cmdb-agent
```

### High Error Count

Check `/status` endpoint:
```bash
curl http://localhost:9000/status | jq '.errors'
```

Review logs for error details:
```bash
docker-compose logs cmdb-agent | grep ERROR
```

### Discovery Not Working

1. Ensure Docker socket is mounted:
```bash
docker exec cmdb-agent ls -la /var/run/docker.sock
```

2. Check discovery is enabled:
```bash
curl http://localhost:9000/status | jq '.config.autoDiscovery'
```

3. Manually trigger discovery:
```bash
curl -X POST http://localhost:9000/discover
```

## Security

- **API Keys**: Always use strong API keys in production
- **Docker Socket**: Mount as read-only (`:ro`)
- **Network**: Use internal Docker networks
- **Logs**: Rotate logs to prevent disk fill
- **Permissions**: Run with minimal required permissions

## Performance

- **Memory**: ~100-150 MB
- **CPU**: <5% average
- **Network**: Minimal (periodic API calls)
- **Disk**: Logs only (rotated)

## Integration

### With CMDB API

The agent communicates with the CMDB API using REST endpoints:
- `POST /api/cmdb/ci` - Register new CI
- `PUT /api/cmdb/ci/:id` - Update CI
- `POST /api/cmdb/ci/:id/metrics` - Send metrics
- `GET /api/cmdb/ci/:id` - Get CI details

### With Monitoring Stack

Expose metrics for Prometheus:
```yaml
- job_name: 'cmdb-agent'
  static_configs:
    - targets: ['cmdb-agent:9000']
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## License

MIT
