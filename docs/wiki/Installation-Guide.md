# Installation Guide

Complete guide to installing and setting up IAC Dharma.

---

## Prerequisites

Before installing IAC Dharma, ensure you have:

### Required Software
- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org/))
- **npm**: >= 9.0.0 (comes with Node.js)
- **Docker**: >= 20.10.0 ([Download](https://docs.docker.com/get-docker/))
- **Docker Compose**: >= 2.0.0 ([Download](https://docs.docker.com/compose/install/))

### System Requirements
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Disk**: 20GB free space (50GB+ recommended)
- **OS**: Linux, macOS, or Windows with WSL2

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should show: v18.x.x or higher

# Check npm version
npm --version
# Should show: 9.x.x or higher

# Check Docker version
docker --version
# Should show: 20.10.x or higher

# Check Docker Compose version
docker-compose --version
# Should show: 2.x.x or higher
```

---

## Installation Methods

### Method 1: npm Installation (Recommended)

Install IAC Dharma globally using npm:

```bash
# Install globally
npm install -g @raghavendra198902/iac-dharma

# Verify installation
iac-dharma --version

# Initialize a new project
iac-dharma init --name my-infrastructure
```

### Method 2: Git Clone

Clone the repository directly:

```bash
# Clone repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac

# Copy environment file
cp .env.example .env

# Edit environment variables (optional)
nano .env
```

### Method 3: Docker Only

Use pre-built Docker images:

```bash
# Pull Docker Compose file
curl -O https://raw.githubusercontent.com/Raghavendra198902/iac/master/docker-compose.yml

# Create environment file
curl -O https://raw.githubusercontent.com/Raghavendra198902/iac/master/.env.example
mv .env.example .env

# Start services
docker-compose up -d
```

---

## Quick Start

### 1. Start Services

```bash
# Using npm CLI
iac-dharma start

# Or directly with Docker Compose
docker-compose up -d
```

### 2. Wait for Services

Services take 20-30 seconds to initialize:

```bash
# Check service status
docker-compose ps

# Follow logs
docker-compose logs -f
```

### 3. Access the Platform

Once services are running:

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Admin Dashboard**: http://localhost:3000/admin
- **Grafana**: http://localhost:3030 (admin/admin)
- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090

### 4. Verify Installation

```bash
# Check health
curl http://localhost:3000/health/ready

# View metrics
curl http://localhost:3000/metrics

# Test CLI
iac-dharma status
```

---

## Configuration

### Environment Variables

Edit `.env` file to configure services:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=iac_dharma
DB_USER=dharma_admin
DB_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRY=24h

# Cloud Provider Credentials
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AZURE_SUBSCRIPTION_ID=your_azure_subscription
GCP_PROJECT_ID=your_gcp_project

# Feature Flags
FEATURE_FLAGS_ENABLED=true

# Monitoring
JAEGER_ENDPOINT=http://jaeger:14268/api/traces
PROMETHEUS_ENDPOINT=http://prometheus:9090
```

### Port Configuration

Default ports used by services:

| Service | Port | Protocol |
|---------|------|----------|
| Frontend | 5173 | HTTP |
| API Gateway | 3000 | HTTP |
| Blueprint Service | 3001 | HTTP |
| IAC Generator | 3002 | HTTP |
| Guardrails | 3003 | HTTP |
| Costing Service | 3004 | HTTP |
| Orchestrator | 3005 | HTTP |
| Automation Engine | 3006 | HTTP |
| Monitoring Service | 3007 | HTTP |
| AI Engine | 8000 | HTTP |
| Cloud Provider | 3010 | HTTP |
| AI Recommendations | 3011 | HTTP |
| SSO Service | 3012 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |
| Grafana | 3030 | HTTP |
| Prometheus | 9090 | HTTP |
| Jaeger UI | 16686 | HTTP |

To change ports, edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:5173"  # Change 8080 to your desired port
```

---

## Database Setup

### Automatic Setup

Database migrations run automatically on first startup.

### Manual Migration

If needed, run migrations manually:

```bash
# Connect to API Gateway container
docker exec -it dharma-api-gateway sh

# Run migrations
npm run migrate:latest

# Check migration status
npm run migrate:status
```

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it dharma-postgres psql -U dharma_admin -d iac_dharma

# List tables
\dt

# Exit
\q
```

---

## Verification

### 1. Check Service Health

```bash
# All services should show "Up"
docker-compose ps

# Check specific service
docker logs dharma-api-gateway --tail 50
```

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/health/ready

# Get feature flags
curl http://localhost:3000/api/feature-flags

# View metrics
curl http://localhost:3000/metrics
```

### 3. Access Web Interfaces

Open in your browser:
- Frontend: http://localhost:5173
- API Docs: http://localhost:3000/api-docs
- Grafana: http://localhost:3030

### 4. Verify CLI

```bash
# Show system info
iac-dharma info

# Check status
iac-dharma status

# View help
iac-dharma --help
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker ps

# Check logs for errors
docker-compose logs

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process (if safe)
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check PostgreSQL logs
docker logs dharma-postgres

# Restart database
docker-compose restart postgres

# Wait 10 seconds and retry
sleep 10
docker-compose restart api-gateway
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop: Settings → Resources → Memory (set to 4GB+)

# Or adjust service limits in docker-compose.yml
services:
  api-gateway:
    mem_limit: 512m
```

### Permission Denied

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run with sudo (not recommended)
sudo docker-compose up -d
```

---

## Uninstallation

### Remove npm Package

```bash
npm uninstall -g @raghavendra198902/iac-dharma
```

### Stop and Remove Services

```bash
# Stop services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

### Clean Up

```bash
# Remove project directory
rm -rf /path/to/iac

# Clean Docker system (optional)
docker system prune -a
```

---

## Next Steps

- [Quick Start Guide](Quick-Start) - Get started quickly
- [Configuration Guide](Configuration) - Advanced configuration
- [Development Setup](Development-Setup) - Set up for development
- [Deployment Guide](Deployment-Guide) - Deploy to production

---

## Getting Help

- **Documentation**: This wiki
- **GitHub Issues**: https://github.com/Raghavendra198902/iac/issues
- **Email**: raghavendra198902@gmail.com

---

**Successfully installed? Start with the [Quick Start Guide](Quick-Start)!**
