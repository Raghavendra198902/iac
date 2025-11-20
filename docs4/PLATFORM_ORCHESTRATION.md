# IAC DHARMA Platform Orchestration Guide

## Overview

This guide provides comprehensive instructions for managing the IAC DHARMA platform locally and in production.

## Table of Contents

- [Quick Start](#quick-start)
- [Platform Scripts](#platform-scripts)
- [Development Mode](#development-mode)
- [Production Mode](#production-mode)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## Quick Start

### Prerequisites

- Docker Engine 20.10+ and Docker Compose 2.0+
- At least 8GB RAM available for Docker
- 20GB free disk space

### Start the Platform

```bash
# Development mode with hot reload
./scripts/start-platform.sh --dev

# Production mode
./scripts/start-platform.sh

# Detached mode (background)
./scripts/start-platform.sh --dev -d
```

### Check Health

```bash
# Check all services
./scripts/health-check.sh
```

### View Logs

```bash
# All services
./scripts/logs.sh --all

# Specific service
./scripts/logs.sh api-gateway

# Backend services only
./scripts/logs.sh --backend

# Last 50 lines without following
./scripts/logs.sh --tail 50 --no-follow ai-engine
```

### Stop the Platform

```bash
# Stop services (preserve data)
./scripts/stop-platform.sh

# Stop and remove volumes (delete all data)
./scripts/stop-platform.sh --volumes

# Stop and remove everything
./scripts/stop-platform.sh --all
```

## Platform Scripts

### start-platform.sh

Unified startup script that orchestrates all services in the correct order.

**Usage:**
```bash
./scripts/start-platform.sh [OPTIONS]
```

**Options:**
- `--dev, --development`: Start in development mode with hot reload
- `-d, --detached`: Run in detached mode (background)
- `--help`: Show help message

**Features:**
- Automatic dependency management
- Health checks for all services
- Sequential startup (infrastructure → backend → gateway → frontend)
- Pretty colored output
- Error handling

**Example:**
```bash
# Start in development mode
./scripts/start-platform.sh --dev

# Start in production mode, detached
./scripts/start-platform.sh -d
```

### health-check.sh

Checks the health status of all platform services.

**Usage:**
```bash
./scripts/health-check.sh
```

**Features:**
- Checks all microservices
- Verifies database and cache connectivity
- Color-coded status (✓ HEALTHY, ✗ DOWN, ⚠ UNHEALTHY)
- Summary with healthy/unhealthy counts
- Troubleshooting suggestions

**Output:**
```
Infrastructure Services:
─────────────────────────────────────────────────────────────
PostgreSQL                     ✓ HEALTHY
Redis                          ✓ HEALTHY

Backend Microservices:
─────────────────────────────────────────────────────────────
API Gateway                    ✓ HEALTHY
Blueprint Service              ✓ HEALTHY
...
```

### stop-platform.sh

Gracefully stops all platform services.

**Usage:**
```bash
./scripts/stop-platform.sh [OPTIONS]
```

**Options:**
- `-v, --volumes`: Remove volumes (deletes all data!)
- `--images`: Remove images
- `--all`: Remove volumes and images
- `--help`: Show help message

**Examples:**
```bash
# Stop services, keep data
./scripts/stop-platform.sh

# Stop and delete all data
./scripts/stop-platform.sh --volumes

# Complete cleanup
./scripts/stop-platform.sh --all
```

### logs.sh

View and follow logs from platform services.

**Usage:**
```bash
./scripts/logs.sh [OPTIONS] [SERVICE_NAMES...]
```

**Options:**
- `--no-follow`: Don't follow log output
- `--tail <n>`: Number of lines to show (default: 100)
- `--all`: Show logs from all services
- `--backend`: Show logs from all backend services
- `--infrastructure`: Show logs from postgres and redis
- `--monitoring`: Show logs from monitoring stack
- `--help`: Show help message

**Examples:**
```bash
# All services, following
./scripts/logs.sh --all

# Specific service
./scripts/logs.sh api-gateway

# Multiple services
./scripts/logs.sh postgres redis

# Last 50 lines, no follow
./scripts/logs.sh --tail 50 --no-follow ai-engine

# All backend services
./scripts/logs.sh --backend
```

## Development Mode

Development mode provides:
- **Hot Reload**: Code changes reflect instantly without rebuilds
- **Debug Logging**: Verbose logs for all services
- **Development Tools**: Adminer, Redis Commander, Prometheus, Grafana
- **Persistent Data**: Volumes survive container restarts

### Starting Development Environment

```bash
./scripts/start-platform.sh --dev
```

### Development Workflow

1. **Edit Code**: Modify any file in `backend/*/src` or `frontend/src`
2. **Auto-Reload**: Changes reflect automatically
3. **Check Logs**: `./scripts/logs.sh <service-name>`
4. **Check Health**: `./scripts/health-check.sh`

### Hot Reload Configuration

All services are configured with volume mounts in `docker-compose.override.yml`:

```yaml
services:
  api-gateway:
    volumes:
      - ./backend/api-gateway/src:/app/src:ro
    command: npm run dev  # Uses nodemon for auto-reload
```

### Development Tools

| Tool | URL | Purpose | Credentials |
|------|-----|---------|-------------|
| **Frontend** | http://localhost:5173 | React application | admin@iac.dharma / any password |
| **API Gateway** | http://localhost:3000 | Backend API | - |
| **Adminer** | http://localhost:8080 | Database management | See below |
| **Redis Commander** | http://localhost:8081 | Redis browser | - |
| **Prometheus** | http://localhost:9090 | Metrics & alerts | - |
| **Grafana** | http://localhost:3001 | Dashboards | admin / admin |

**Adminer Database Credentials:**
- System: PostgreSQL
- Server: postgres
- Username: iac_user
- Password: iac_secure_password
- Database: iac_dharma

### Debugging

**Enable Debug Mode for Specific Service:**
```bash
# Edit docker-compose.override.yml
services:
  api-gateway:
    environment:
      - DEBUG=iac:*  # All debug logs
      - DEBUG=iac:auth  # Only auth logs
```

**View Debug Logs:**
```bash
./scripts/logs.sh api-gateway
```

## Production Mode

Production mode provides:
- Optimized builds
- Production-ready configurations
- No development tools
- Minimal logging

### Starting Production Environment

```bash
./scripts/start-platform.sh
```

### Production Configuration

Services use production Dockerfiles and configurations:
- Optimized Node.js builds
- Production Python images
- Minimal logging
- No hot reload

### Environment Variables

Production environment variables are defined in `.env` files:

```bash
# backend/api-gateway/.env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-secret
DATABASE_URL=postgresql://user:pass@postgres:5432/iac_dharma
```

## Monitoring & Observability

### Prometheus

**Access:** http://localhost:9090

**Features:**
- Metrics collection from all services
- Custom alert rules
- 15-second scrape interval

**Metrics Endpoints:**
- API Gateway: http://api-gateway:3000/metrics
- Blueprint Service: http://blueprint-service:3001/metrics
- ... (all services expose `/metrics`)

**Configuration:**
```yaml
# deployment/monitoring/prometheus.yml
scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
```

### Grafana

**Access:** http://localhost:3001  
**Credentials:** admin / admin

**Dashboards:**
1. **System Overview** (`system-overview.json`)
   - Services up/down
   - Request rate by service
   - Response time (p95)
   - Error rate
   - Memory usage
   - CPU usage

2. **Service Health** (Coming soon)
   - Uptime
   - Error rates
   - Response times
   - SLO tracking

3. **Cost Tracking** (Coming soon)
   - Spend by service
   - Budget alerts
   - Optimization recommendations

**Custom Dashboards:**
Place JSON files in `deployment/monitoring/grafana-dashboards/` and restart Grafana.

### Alert Rules

Alerts are defined in `deployment/monitoring/alert-rules.yml`:

**Critical Alerts:**
- Service down for > 1 minute
- High risk score (> 70)
- Deployment failure

**Warning Alerts:**
- High error rate (> 5%)
- High response time (> 2s p95)
- High CPU/memory usage
- Budget threshold exceeded (> 80%)

**Example Alert:**
```yaml
- alert: ServiceDown
  expr: up == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.job }} is down"
```

### Custom Metrics

**Node.js Services:**
```javascript
const prometheus = require('prom-client');

const requestCounter = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Increment
requestCounter.inc({ method: 'GET', path: '/health', status: '200' });
```

**Python Services:**
```python
from prometheus_client import Counter

request_counter = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'path', 'status']
)

# Increment
request_counter.labels(method='GET', path='/health', status='200').inc()
```

## Troubleshooting

### Service Won't Start

**Check logs:**
```bash
./scripts/logs.sh <service-name>
```

**Common issues:**
1. Port already in use
2. Database not ready
3. Missing environment variables

**Solution:**
```bash
# Stop everything
./scripts/stop-platform.sh

# Check for conflicting processes
lsof -i :3000  # Check port 3000
lsof -i :5432  # Check PostgreSQL port

# Clean restart
./scripts/start-platform.sh --dev
```

### Service Unhealthy

**Check health status:**
```bash
./scripts/health-check.sh
```

**Restart specific service:**
```bash
docker-compose restart <service-name>
```

**Check dependencies:**
```bash
# Ensure PostgreSQL is ready
docker-compose exec postgres pg_isready

# Ensure Redis is ready
docker-compose exec redis redis-cli ping
```

### Hot Reload Not Working

**Check volume mounts:**
```bash
docker-compose config | grep -A 5 "volumes:"
```

**Restart service:**
```bash
docker-compose restart <service-name>
```

**Rebuild if necessary:**
```bash
docker-compose build <service-name>
docker-compose up -d <service-name>
```

### Database Issues

**Connect to PostgreSQL:**
```bash
docker-compose exec postgres psql -U iac_user -d iac_dharma
```

**Reset database:**
```bash
./scripts/stop-platform.sh --volumes
./scripts/start-platform.sh --dev
```

**Backup database:**
```bash
docker-compose exec postgres pg_dump -U iac_user iac_dharma > backup.sql
```

**Restore database:**
```bash
cat backup.sql | docker-compose exec -T postgres psql -U iac_user iac_dharma
```

### Redis Issues

**Connect to Redis:**
```bash
docker-compose exec redis redis-cli
```

**Flush cache:**
```bash
docker-compose exec redis redis-cli FLUSHALL
```

### High Resource Usage

**Check resource usage:**
```bash
docker stats
```

**Adjust resource limits:**
```yaml
# docker-compose.yml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

**Prune unused resources:**
```bash
docker system prune -a --volumes
```

## Architecture

### Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 5173 | React application (dev) |
| API Gateway | 3000 | Main API entry point |
| Blueprint Service | 3001 | Blueprint management |
| IaC Generator | 3002 | Infrastructure code generation |
| Guardrails Engine | 3003 | Policy validation |
| Orchestrator | 3004 | Deployment orchestration |
| Costing Service | 3005 | Cost estimation |
| Monitoring Service | 3006 | Drift detection & health |
| Automation Engine | 3007 | Workflow automation |
| AI Engine | 8000 | NLP & ML services |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & sessions |
| Adminer | 8080 | Database UI |
| Redis Commander | 8081 | Redis UI |
| Prometheus | 9090 | Metrics collection |
| Grafana | 3001 | Dashboards |

### Service Dependencies

```
Frontend → API Gateway → Backend Services → PostgreSQL/Redis
                       ↘ AI Engine → PostgreSQL
                       
Prometheus → All Services (metrics)
Grafana → Prometheus (visualization)
```

### Data Flow

1. **User Request** → Frontend (React)
2. **Frontend** → API Gateway (JWT auth)
3. **API Gateway** → Backend Services (routing)
4. **Backend Services** → PostgreSQL/Redis (data)
5. **All Services** → Prometheus (metrics)
6. **Prometheus** → Grafana (dashboards)

### Volume Mounts (Development)

```
./frontend/src → /app/src (hot reload)
./backend/*/src → /app/src (hot reload)
./deployment/monitoring → /etc/prometheus & /etc/grafana (configs)
```

### Networks

- **Production:** `iac-dharma-network` (bridge)
- **Development:** `iac-dharma-dev` (bridge)

All services communicate on the same network using service names as hostnames.

## Best Practices

### Development

1. **Always use development mode** for local work
2. **Check health** before assuming a service is ready
3. **Monitor logs** for debug information
4. **Use Adminer** for database inspection
5. **Use Grafana** for performance monitoring

### Production

1. **Use environment variables** for secrets
2. **Enable resource limits** for all services
3. **Configure backups** for PostgreSQL
4. **Monitor alerts** in Prometheus
5. **Review Grafana dashboards** regularly

### Troubleshooting

1. **Check logs first** with `./scripts/logs.sh`
2. **Verify health** with `./scripts/health-check.sh`
3. **Restart services** before rebuilding
4. **Clean state** with `--volumes` if data is corrupted
5. **Review metrics** in Grafana for performance issues

## Additional Resources

- [Backend Services README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [Deployment Guide](../deployment/README.md)
- [API Documentation](../docs/API.md)
- [Architecture Overview](../docs/ARCHITECTURE.md)
