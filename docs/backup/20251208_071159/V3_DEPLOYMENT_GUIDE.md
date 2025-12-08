# v3.0 Deployment & Testing Guide

## 🚀 Complete Deployment Guide for IAC Dharma v3.0

**Status**: All backend services implemented and ready for deployment  
**Date**: December 5, 2025  
**Progress**: 70% complete (Backend services ready, Frontend pending)

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Services](#infrastructure-services)
3. [Backend Services Deployment](#backend-services-deployment)
4. [Testing Procedures](#testing-procedures)
5. [Docker Containerization](#docker-containerization)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 22.04+), macOS, or Windows with WSL2
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Node.js**: 20.x (for GraphQL API Gateway)
- **Python**: 3.11+ (for backend services)
- **RAM**: 8GB minimum, 16GB recommended
- **Disk**: 20GB free space

### Already Running (Verified ✅)
```bash
✅ PostgreSQL 16 + TimescaleDB (port 5433)
✅ Neo4j 5.15 (ports 7474, 7687)
✅ Redis 7.x (port 6380)
✅ Apache Kafka (port 9093)
✅ Zookeeper (port 2182)
✅ Prometheus (port 9091)
✅ Grafana (port 3020)
```

**Check Status**:
```bash
docker ps --filter "name=iac-.*-v3" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 2. Infrastructure Services

### Database Initialization

**PostgreSQL v3 Schema** (Already initialized):
```bash
# Verify schema
docker exec -it iac-postgres-v3 psql -U iacadmin -d iac_v3 -c "\dt"

# Expected output:
# - infrastructures
# - compute_resources
# - deployments
# - users
# - audit_logs
# - predictions
# - metrics
```

**Neo4j Graph Database**:
```bash
# Verify Neo4j
curl http://localhost:7474

# Or use browser
open http://localhost:7474

# Login: neo4j / neo4j123
```

### Infrastructure Health Check

```bash
# Check all v3 services
docker ps --filter "name=iac-.*-v3" --format "{{.Names}}: {{.Status}}"

# Expected: All services "Up X minutes (healthy)"
```

---

## 3. Backend Services Deployment

### Option A: Docker Containerization (Recommended)

#### 3.1 Create Dockerfiles

**Create `backend/ai-engine/Dockerfile.v3`**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8100/api/v3/aiops/health')"

# Run application
CMD ["uvicorn", "app_v3:app", "--host", "0.0.0.0", "--port", "8100"]
```

**Create `backend/api-gateway/Dockerfile.v3`**:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.v3.json package.json
COPY tsconfig.v3.json tsconfig.json

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Run application
CMD ["npm", "start"]
```

**Create `backend/cmdb-agent/Dockerfile.v3`**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8200/api/v3/cmdb/health')"

# Run application
CMD ["uvicorn", "app_v3:app", "--host", "0.0.0.0", "--port", "8200"]
```

**Create `backend/ai-orchestrator/Dockerfile.v3`**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8300

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8300/api/v3/orchestrator/health')"

# Run application
CMD ["uvicorn", "app_v3:app", "--host", "0.0.0.0", "--port", "8300"]
```

#### 3.2 Update docker-compose.v3.yml

Add to existing `docker-compose.v3.yml`:

```yaml
  # AIOps Engine
  aiops-engine-v3:
    build:
      context: ./backend/ai-engine
      dockerfile: Dockerfile.v3
    container_name: iac-aiops-v3
    ports:
      - "8100:8100"
    environment:
      - PORT=8100
      - ENVIRONMENT=production
    networks:
      - iac-v3-network
    restart: unless-stopped
    depends_on:
      - postgres-v3
      - redis-v3

  # GraphQL API Gateway
  graphql-api-v3:
    build:
      context: ./backend/api-gateway
      dockerfile: Dockerfile.v3
    container_name: iac-graphql-v3
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - POSTGRES_HOST=postgres-v3
      - POSTGRES_PORT=5432
      - POSTGRES_USER=iacadmin
      - POSTGRES_PASSWORD=iacadmin123
      - POSTGRES_DB=iac_v3
      - AIOPS_URL=http://aiops-engine-v3:8100
      - JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production}
    networks:
      - iac-v3-network
    restart: unless-stopped
    depends_on:
      - postgres-v3
      - aiops-engine-v3

  # CMDB Agent
  cmdb-agent-v3:
    build:
      context: ./backend/cmdb-agent
      dockerfile: Dockerfile.v3
    container_name: iac-cmdb-v3
    ports:
      - "8200:8200"
    environment:
      - PORT=8200
      - NEO4J_URI=bolt://neo4j-v3:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=neo4j123
    networks:
      - iac-v3-network
    restart: unless-stopped
    depends_on:
      - neo4j-v3

  # AI Orchestrator
  ai-orchestrator-v3:
    build:
      context: ./backend/ai-orchestrator
      dockerfile: Dockerfile.v3
    container_name: iac-orchestrator-v3
    ports:
      - "8300:8300"
    environment:
      - PORT=8300
      - GRAPHQL_URL=http://graphql-api-v3:4000/graphql
      - AIOPS_URL=http://aiops-engine-v3:8100/api/v3/aiops
      - CMDB_URL=http://cmdb-agent-v3:8200/api/v3/cmdb
    networks:
      - iac-v3-network
    restart: unless-stopped
    depends_on:
      - graphql-api-v3
      - aiops-engine-v3
      - cmdb-agent-v3
```

#### 3.3 Deploy with Docker Compose

```bash
# Build and start all services
cd /home/rrd/iac
docker-compose -f docker-compose.v3.yml up -d --build

# Check status
docker-compose -f docker-compose.v3.yml ps

# View logs
docker-compose -f docker-compose.v3.yml logs -f aiops-engine-v3
docker-compose -f docker-compose.v3.yml logs -f graphql-api-v3
docker-compose -f docker-compose.v3.yml logs -f cmdb-agent-v3
docker-compose -f docker-compose.v3.yml logs -f ai-orchestrator-v3
```

---

### Option B: Local Development (Using Existing Container)

Since `pip` installation is problematic on the host system, we can use the existing `dharma-ai-engine` container which has Python 3.11.

#### 3.1 Run Backend Services in Existing Container

**Copy backend code to container**:
```bash
# Copy AI Engine v3
docker cp backend/ai-engine/. dharma-ai-engine:/app/v3-aiops/

# Install dependencies in container
docker exec dharma-ai-engine pip install -r /app/v3-aiops/requirements.txt

# Run AI Engine v3 (in background)
docker exec -d dharma-ai-engine bash -c "cd /app/v3-aiops && uvicorn app_v3:app --host 0.0.0.0 --port 8100"

# Copy CMDB Agent
docker cp backend/cmdb-agent/. dharma-ai-engine:/app/v3-cmdb/

# Install CMDB dependencies
docker exec dharma-ai-engine pip install -r /app/v3-cmdb/requirements.txt

# Run CMDB Agent (in background)
docker exec -d dharma-ai-engine bash -c "cd /app/v3-cmdb && uvicorn app_v3:app --host 0.0.0.0 --port 8200"

# Copy AI Orchestrator
docker cp backend/ai-orchestrator/. dharma-ai-engine:/app/v3-orchestrator/

# Install Orchestrator dependencies
docker exec dharma-ai-engine pip install -r /app/v3-orchestrator/requirements.txt

# Run AI Orchestrator (in background)
docker exec -d dharma-ai-engine bash -c "cd /app/v3-orchestrator && uvicorn app_v3:app --host 0.0.0.0 --port 8300"
```

**For GraphQL API (needs Node.js)**:
```bash
# Option 1: Use existing dharma-api-gateway container
docker exec dharma-api-gateway node --version  # Check if Node.js available

# Option 2: Install in new container
docker run -d --name iac-graphql-v3 \
  --network iac-v3-network \
  -p 4000:4000 \
  -v $(pwd)/backend/api-gateway:/app \
  -w /app \
  node:20-alpine \
  sh -c "npm install && npm run build && npm start"
```

---

### Option C: Standalone Services (Manual)

If you need to run services individually for testing:

**Terminal 1 - AIOps Engine**:
```bash
# Use Docker exec
docker exec -it dharma-ai-engine bash
cd /app/v3-aiops
pip install -r requirements.txt
uvicorn app_v3:app --host 0.0.0.0 --port 8100 --reload
```

**Terminal 2 - CMDB Agent**:
```bash
docker exec -it dharma-ai-engine bash
cd /app/v3-cmdb
pip install -r requirements.txt
uvicorn app_v3:app --host 0.0.0.0 --port 8200 --reload
```

**Terminal 3 - AI Orchestrator**:
```bash
docker exec -it dharma-ai-engine bash
cd /app/v3-orchestrator
pip install -r requirements.txt
uvicorn app_v3:app --host 0.0.0.0 --port 8300 --reload
```

**Terminal 4 - GraphQL API**:
```bash
cd /home/rrd/iac/backend/api-gateway
npm install
npm run build
npm start
```

---

## 4. Testing Procedures

### 4.1 Infrastructure Health Checks

```bash
# PostgreSQL
docker exec iac-postgres-v3 pg_isready -U iacadmin

# Neo4j
curl http://localhost:7474

# Redis
docker exec iac-redis-v3 redis-cli ping

# Kafka
docker exec iac-kafka-v3 kafka-topics.sh --list --bootstrap-server localhost:9092
```

### 4.2 Backend Services Health Checks

```bash
# AIOps Engine
curl http://localhost:8100/api/v3/aiops/health

# GraphQL API
curl http://localhost:4000/health

# CMDB Agent
curl http://localhost:8200/api/v3/cmdb/health

# AI Orchestrator
curl http://localhost:8300/api/v3/orchestrator/health
```

**Expected Response** (AI Orchestrator):
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "uptime_seconds": 123.45,
  "services": {
    "graphql": {"status": "healthy", "url": "http://localhost:4000"},
    "aiops": {"status": "healthy", "url": "http://localhost:8100"},
    "cmdb": {"status": "healthy", "url": "http://localhost:8200"}
  }
}
```

### 4.3 Functional Testing

#### Test 1: AIOps Prediction
```bash
curl -X POST http://localhost:8100/api/v3/aiops/predict/failure \
  -H "Content-Type: application/json" \
  -d '{
    "infrastructure_id": "test-infra",
    "metrics": {
      "cpu_usage": [75.0, 80.0, 85.0],
      "memory_usage": [60.0, 65.0, 70.0],
      "error_rate": [0.01, 0.02, 0.03]
    },
    "time_window_hours": 24
  }'
```

#### Test 2: GraphQL Query
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __typename }"
  }'
```

#### Test 3: CMDB Statistics
```bash
curl http://localhost:8200/api/v3/cmdb/statistics
```

#### Test 4: AI Orchestrator Command
```bash
curl -X POST http://localhost:8300/api/v3/orchestrator/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "list all infrastructures",
    "user_id": "test-user"
  }'
```

#### Test 5: AI Orchestrator Help
```bash
curl http://localhost:8300/api/v3/orchestrator/help
```

### 4.4 Integration Testing

**Test Full Workflow**:
```bash
# 1. Natural language command
curl -X POST http://localhost:8300/api/v3/orchestrator/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "predict failure for prod-app"
  }'

# Expected flow:
# AI Orchestrator → Analyzes command
# ↓ Extracts intent: PREDICT_FAILURE
# ↓ Routes to AIOps Engine
# AIOps Engine → Runs ML model
# ↓ Returns prediction
# AI Orchestrator → Formats response
# ↓ Returns to user
```

### 4.5 WebSocket Testing

**Using `websocat` or `wscat`**:
```bash
# Install wscat
npm install -g wscat

# Connect to AI Orchestrator
wscat -c ws://localhost:8300/api/v3/orchestrator/ws/chat

# Send command
> {"type": "command", "payload": {"command": "list all infrastructures"}}

# Receive response
< {"type":"assistant_message","payload":{...}}
```

**Using JavaScript**:
```javascript
const ws = new WebSocket('ws://localhost:8300/api/v3/orchestrator/ws/chat');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'command',
    payload: {command: 'list all infrastructures'}
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

---

## 5. Docker Containerization

### 5.1 Complete Docker Setup

**Create `backend/docker-compose.backend-v3.yml`**:
```yaml
version: '3.8'

services:
  aiops-engine-v3:
    build:
      context: ./ai-engine
      dockerfile: Dockerfile.v3
    container_name: iac-aiops-v3
    ports:
      - "8100:8100"
    environment:
      PORT: 8100
      ENVIRONMENT: production
    networks:
      - iac-v3-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8100/api/v3/aiops/health')"]
      interval: 30s
      timeout: 10s
      retries: 3

  graphql-api-v3:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile.v3
    container_name: iac-graphql-v3
    ports:
      - "4000:4000"
    environment:
      PORT: 4000
      POSTGRES_HOST: iac-postgres-v3
      POSTGRES_PORT: 5432
      POSTGRES_USER: iacadmin
      POSTGRES_PASSWORD: iacadmin123
      POSTGRES_DB: iac_v3
      AIOPS_URL: http://aiops-engine-v3:8100
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
    networks:
      - iac-v3-network
    restart: unless-stopped
    depends_on:
      - aiops-engine-v3

  cmdb-agent-v3:
    build:
      context: ./cmdb-agent
      dockerfile: Dockerfile.v3
    container_name: iac-cmdb-v3
    ports:
      - "8200:8200"
    environment:
      PORT: 8200
      NEO4J_URI: bolt://iac-neo4j-v3:7687
      NEO4J_USER: neo4j
      NEO4J_PASSWORD: neo4j123
    networks:
      - iac-v3-network
    restart: unless-stopped

  ai-orchestrator-v3:
    build:
      context: ./ai-orchestrator
      dockerfile: Dockerfile.v3
    container_name: iac-orchestrator-v3
    ports:
      - "8300:8300"
    environment:
      PORT: 8300
      GRAPHQL_URL: http://graphql-api-v3:4000/graphql
      AIOPS_URL: http://aiops-engine-v3:8100/api/v3/aiops
      CMDB_URL: http://cmdb-agent-v3:8200/api/v3/cmdb
    networks:
      - iac-v3-network
    restart: unless-stopped
    depends_on:
      - graphql-api-v3
      - aiops-engine-v3
      - cmdb-agent-v3

networks:
  iac-v3-network:
    external: true
```

### 5.2 Build and Deploy

```bash
cd /home/rrd/iac/backend

# Build all images
docker-compose -f docker-compose.backend-v3.yml build

# Start all services
docker-compose -f docker-compose.backend-v3.yml up -d

# Check status
docker-compose -f docker-compose.backend-v3.yml ps

# View logs
docker-compose -f docker-compose.backend-v3.yml logs -f

# Stop all services
docker-compose -f docker-compose.backend-v3.yml down
```

---

## 6. Production Deployment

### 6.1 Environment Variables

Create `.env.v3.production`:
```bash
# General
ENVIRONMENT=production
LOG_LEVEL=info

# PostgreSQL
POSTGRES_HOST=iac-postgres-v3
POSTGRES_PORT=5432
POSTGRES_USER=iacadmin
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=iac_v3

# Neo4j
NEO4J_URI=bolt://iac-neo4j-v3:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<strong-password>

# Redis
REDIS_HOST=iac-redis-v3
REDIS_PORT=6379

# JWT
JWT_SECRET=<generated-secret-key>
JWT_EXPIRY=24h

# Service URLs (internal)
GRAPHQL_URL=http://graphql-api-v3:4000/graphql
AIOPS_URL=http://aiops-engine-v3:8100/api/v3/aiops
CMDB_URL=http://cmdb-agent-v3:8200/api/v3/cmdb

# AWS (for CMDB discovery)
AWS_REGION=us-east-1
# AWS credentials should be provided via IAM roles in production
```

### 6.2 Security Hardening

**1. Update default passwords**:
```bash
# PostgreSQL
ALTER USER iacadmin WITH PASSWORD 'strong-password';

# Neo4j (via browser at http://localhost:7474)
# Login with neo4j/neo4j123, then change password
```

**2. Enable HTTPS** (use Nginx reverse proxy):
```nginx
server {
    listen 443 ssl;
    server_name api.iacdharma.com;

    ssl_certificate /etc/ssl/certs/iacdharma.crt;
    ssl_certificate_key /etc/ssl/private/iacdharma.key;

    location /graphql {
        proxy_pass http://localhost:4000/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api/v3/aiops {
        proxy_pass http://localhost:8100/api/v3/aiops;
    }

    location /api/v3/cmdb {
        proxy_pass http://localhost:8200/api/v3/cmdb;
    }

    location /api/v3/orchestrator {
        proxy_pass http://localhost:8300/api/v3/orchestrator;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**3. Configure CORS**:
Update CORS in each service to allow only specific origins.

### 6.3 Monitoring

**Prometheus Metrics**:
- Service health endpoints already configured
- Add custom metrics for business logic
- Configure Grafana dashboards

**Logging**:
- Centralized logging with ELK stack or Loki
- Log rotation configured
- Error tracking with Sentry

---

## 7. Troubleshooting

### Issue: Service won't start

```bash
# Check logs
docker logs iac-aiops-v3
docker logs iac-graphql-v3
docker logs iac-cmdb-v3
docker logs iac-orchestrator-v3

# Check resource usage
docker stats

# Restart service
docker restart iac-aiops-v3
```

### Issue: Database connection failed

```bash
# Check PostgreSQL
docker exec iac-postgres-v3 pg_isready -U iacadmin

# Check Neo4j
curl http://localhost:7474

# Test connection from service
docker exec iac-cmdb-v3 python -c "from neo4j import GraphDatabase; driver = GraphDatabase.driver('bolt://iac-neo4j-v3:7687', auth=('neo4j', 'neo4j123')); driver.verify_connectivity()"
```

### Issue: Service unreachable

```bash
# Check network
docker network inspect iac-v3-network

# Check port binding
netstat -tulpn | grep 8100
netstat -tulpn | grep 4000
netstat -tulpn | grep 8200
netstat -tulpn | grep 8300

# Test from host
curl http://localhost:8300/api/v3/orchestrator/health

# Test from container
docker exec iac-orchestrator-v3 curl http://localhost:8300/api/v3/orchestrator/health
```

### Issue: High memory usage

```bash
# Check memory
docker stats --no-stream

# Limit container memory
docker update --memory 2g iac-aiops-v3

# Or in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

### Issue: Python dependencies

```bash
# Rebuild without cache
docker-compose -f docker-compose.backend-v3.yml build --no-cache aiops-engine-v3

# Manual install in container
docker exec -it iac-aiops-v3 bash
pip install --upgrade -r requirements.txt
```

---

## 8. Quick Start Commands

### Development

```bash
# Start infrastructure
docker-compose -f docker-compose.v3.yml up -d

# Start backend services (Option B - using existing container)
./scripts/start-v3-backend-dev.sh

# Test health
curl http://localhost:8300/api/v3/orchestrator/health
```

### Production

```bash
# Build and deploy
docker-compose -f docker-compose.v3.yml -f docker-compose.backend-v3.yml up -d --build

# Verify all services
docker-compose ps

# Run health checks
./scripts/health-check-v3.sh
```

---

## 📊 Deployment Checklist

### Pre-deployment
- [ ] All Dockerfiles created
- [ ] Environment variables configured
- [ ] Secrets generated (JWT, passwords)
- [ ] SSL certificates obtained
- [ ] Backup strategy defined

### Deployment
- [ ] Infrastructure services running
- [ ] Database schemas initialized
- [ ] Backend services deployed
- [ ] Health checks passing
- [ ] Logs verified

### Post-deployment
- [ ] Integration tests run
- [ ] Performance tests completed
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Documentation updated
- [ ] Team trained

---

## 🎯 Next Steps

1. **Create Dockerfiles** for all backend services
2. **Test locally** using Option B (existing container)
3. **Build Docker images** using Option A (full containerization)
4. **Deploy to staging** environment
5. **Run integration tests**
6. **Deploy to production**
7. **Begin frontend development**

---

*Last Updated*: 2025-12-05  
*Version*: v3.0-beta  
*Status*: Ready for Deployment Testing
