# IAC Dharma v3.0 - Deployment & Operations Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation & Deployment](#installation--deployment)
3. [Configuration Management](#configuration-management)
4. [Operations & Maintenance](#operations--maintenance)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
6. [Disaster Recovery](#disaster-recovery)
7. [Security Hardening](#security-hardening)

---

## 💻 System Requirements

### Hardware Requirements

#### Minimum Configuration (Development)
```
CPU: 4 cores (8 threads)
RAM: 16 GB
Disk: 50 GB SSD
Network: 100 Mbps
```

#### Recommended Configuration (Production)
```
CPU: 16 cores (32 threads)
RAM: 64 GB
Disk: 500 GB NVMe SSD
Network: 1 Gbps
Redundancy: Multi-node cluster
```

### Software Requirements

```yaml
Operating System:
  - Ubuntu 22.04 LTS (recommended)
  - RHEL 8+
  - CentOS 8+
  - Debian 11+

Container Runtime:
  - Docker 24.0+
  - Docker Compose 2.20+

Optional (for Kubernetes):
  - Kubernetes 1.28+
  - Helm 3.12+
```

---

## 🚀 Installation & Deployment

### Installation Flow

```
┌──────────────────┐
│  Prerequisites   │
│  - Docker        │
│  - Git           │
│  - Port Check    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Clone Repo      │
│  git clone ...   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Environment     │
│  Setup (.env)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Build Images    │
│  docker compose  │
│  build           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Start Services  │
│  docker compose  │
│  up -d           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Health Check    │
│  Verify all      │
│  services        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Initial Config  │
│  - Admin user    │
│  - Policies      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  System Ready    │
└──────────────────┘
```

### Step 1: Install Prerequisites

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Git
sudo apt install git -y

# Verify installations
docker --version          # Should be 24.0+
docker compose version    # Should be 2.20+
git --version
```

#### RHEL/CentOS
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Git
sudo yum install git -y
```

### Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/iac-dharma.git
cd iac-dharma

# Checkout v3.0 branch
git checkout v3.0-development
```

### Step 3: Environment Configuration

```bash
# Create environment file
cat > .env << 'EOF'
# ========================================
# IAC Dharma v3.0 Environment Configuration
# ========================================

# Environment Type
ENVIRONMENT=production

# Database Configuration
POSTGRES_HOST=postgresql
POSTGRES_PORT=5432
POSTGRES_DB=iac_dharma
POSTGRES_USER=iac_admin
POSTGRES_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>

# Neo4j Configuration
NEO4J_HOST=neo4j
NEO4J_PORT=7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>

# TimescaleDB Configuration
TIMESCALE_HOST=timescaledb
TIMESCALE_PORT=5432
TIMESCALE_DB=observability
TIMESCALE_USER=timescale_admin
TIMESCALE_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_TOPIC_PREFIX=iac_dharma

# JWT Configuration
JWT_SECRET=<GENERATE_RANDOM_64_CHAR_STRING>
JWT_EXPIRY=900

# Zero Trust Configuration
ZERO_TRUST_ENABLED=true
ZERO_TRUST_DEFAULT_TRUST_LEVEL=medium
ZERO_TRUST_SESSION_TIMEOUT=900

# ML Models Configuration
ML_MODELS_PATH=/app/models
MLFLOW_TRACKING_URI=http://mlflow:5000

# Observability Configuration
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
GRAFANA_ADMIN_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>

# Cost Optimizer Configuration
COST_OPTIMIZATION_ENABLED=true
COST_ANALYSIS_INTERVAL=3600

# Self-Healing Configuration
AUTO_HEALING_ENABLED=true
HEALING_MAX_RETRIES=3
HEALING_COOLDOWN_SECONDS=300

# Chaos Engineering Configuration
CHAOS_ENABLED=false
CHAOS_SAFE_MODE=true

# API Gateway Configuration
API_GATEWAY_PORT=4000
API_RATE_LIMIT=1000
API_RATE_WINDOW=60

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Cloud Provider Credentials (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1

AZURE_SUBSCRIPTION_ID=
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=

GCP_PROJECT_ID=
GCP_CREDENTIALS_PATH=/secrets/gcp-credentials.json

EOF

# Secure the environment file
chmod 600 .env

# Generate strong passwords
echo "Please update the following in .env file:"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "NEO4J_PASSWORD=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"
echo "TIMESCALE_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 32)"
```

### Step 4: Pre-flight Checks

```bash
# Check port availability
./scripts/check-ports.sh

# Output should show all ports available:
# ✓ Port 4000 (API Gateway) - Available
# ✓ Port 5432 (PostgreSQL) - Available
# ✓ Port 6379 (Redis) - Available
# ✓ Port 7474 (Neo4j) - Available
# ✓ Port 8100 (AIOps Engine) - Available
# ✓ Port 8200 (CMDB Agent) - Available
# ✓ Port 8300 (AI Orchestrator) - Available
# ✓ Port 8400 (Self-Healing) - Available
# ✓ Port 8500 (Zero Trust) - Available
# ✓ Port 8700 (Chaos Engineering) - Available
# ✓ Port 8800 (Observability) - Available
# ✓ Port 8900 (Cost Optimizer) - Available
# ✓ Port 9090 (Prometheus) - Available
# ✓ Port 3000 (Grafana) - Available

# Check system resources
./scripts/check-resources.sh

# Output:
# ✓ CPU cores: 16 (minimum: 4)
# ✓ Memory: 64 GB (minimum: 16 GB)
# ✓ Disk space: 500 GB (minimum: 50 GB)
```

### Step 5: Deploy Services

#### Production Deployment (Recommended)

```bash
# Build all images
docker compose -f docker-compose.v3.yml build --no-cache

# Start infrastructure services first
docker compose -f docker-compose.v3.yml up -d \
  postgresql \
  timescaledb \
  neo4j \
  redis \
  zookeeper \
  kafka \
  prometheus \
  grafana \
  mlflow

# Wait for infrastructure to be ready (30-60 seconds)
sleep 60

# Start application services
docker compose -f docker-compose.v3.yml up -d

# Monitor startup
docker compose -f docker-compose.v3.yml logs -f
```

#### Development Deployment

```bash
# Use development compose file
docker compose -f docker-compose.dev.yml up -d

# Watch logs
docker compose -f docker-compose.dev.yml logs -f
```

### Step 6: Verify Deployment

```bash
# Check all services are running
docker compose -f docker-compose.v3.yml ps

# Expected output:
# NAME                          STATUS              PORTS
# iac-api-gateway-v3            Up (healthy)        0.0.0.0:4000->4000/tcp
# iac-aiops-engine-v3           Up (healthy)        0.0.0.0:8100->8100/tcp
# iac-cmdb-agent-v3             Up (healthy)        0.0.0.0:8200->8200/tcp
# iac-ai-orchestrator-v3        Up (healthy)        0.0.0.0:8300->8300/tcp
# iac-self-healing-v3           Up (healthy)        0.0.0.0:8400->8400/tcp
# iac-zero-trust-security-v3    Up (healthy)        0.0.0.0:8500->8500/tcp
# iac-chaos-engineering-v3      Up (healthy)        0.0.0.0:8700->8700/tcp
# iac-observability-v3          Up (healthy)        0.0.0.0:8800->8800/tcp
# iac-cost-optimizer-v3         Up (healthy)        0.0.0.0:8900->8900/tcp
# (plus infrastructure services)

# Run health check script
./test-services.sh

# Expected: All services return 200 OK
```

### Step 7: Initial Configuration

```bash
# Create admin user
curl -X POST http://localhost:4000/api/zero-trust/authenticate \
  -d "username=admin" \
  -d "password=ChangeMe123!" \
  -d "device_id=admin-workstation-01"

# Response includes JWT token
# Save token for subsequent requests

# Create default Zero Trust policies
curl -X POST http://localhost:4000/api/zero-trust/policies \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rule_id": "pol_admin_access",
    "name": "Admin Full Access",
    "resource_pattern": "*",
    "required_roles": ["admin"],
    "required_trust_level": "high",
    "action": "allow"
  }'

# Import ML models
./train-ml-models.sh

# Configure Grafana dashboards
./configure-grafana.sh
```

---

## ⚙️ Configuration Management

### Service Configuration

Each service has its own configuration. Modify via environment variables or config files:

#### API Gateway Configuration

```typescript
// backend/api-gateway/config/default.ts
export default {
  port: process.env.API_GATEWAY_PORT || 4000,
  rateLimit: {
    windowMs: parseInt(process.env.API_RATE_WINDOW || '60') * 1000,
    max: parseInt(process.env.API_RATE_LIMIT || '1000')
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
    credentials: true
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRY || '900'
  }
}
```

#### Zero Trust Configuration

```python
# backend/zero-trust-security/config.py
TRUST_WEIGHTS = {
    'device': float(os.getenv('TRUST_WEIGHT_DEVICE', '0.35')),
    'user': float(os.getenv('TRUST_WEIGHT_USER', '0.40')),
    'context': float(os.getenv('TRUST_WEIGHT_CONTEXT', '0.25'))
}

TRUST_LEVELS = {
    'none': (0, 20),
    'low': (20, 40),
    'medium': (40, 60),
    'high': (60, 80),
    'full': (80, 100)
}

SESSION_TIMEOUT = int(os.getenv('ZERO_TRUST_SESSION_TIMEOUT', '900'))
```

### Database Initialization

```bash
# PostgreSQL initialization
docker exec -it iac-postgresql-v3 psql -U iac_admin -d iac_dharma

# Create schemas
CREATE SCHEMA IF NOT EXISTS zero_trust;
CREATE SCHEMA IF NOT EXISTS cmdb;
CREATE SCHEMA IF NOT EXISTS cost_optimizer;

# Create tables (automatically done by services)
# Verify tables exist
\dt zero_trust.*
\dt cmdb.*
```

### Backup Configuration

```bash
# Create backup directory
mkdir -p /var/backups/iac-dharma

# Configure automated backups
cat > /etc/cron.daily/iac-dharma-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/iac-dharma/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker exec iac-postgresql-v3 pg_dumpall -U iac_admin > "$BACKUP_DIR/postgresql.sql"

# Backup Neo4j
docker exec iac-neo4j-v3 neo4j-admin backup --to="$BACKUP_DIR/neo4j"

# Backup Redis
docker exec iac-redis-v3 redis-cli BGSAVE
docker cp iac-redis-v3:/data/dump.rdb "$BACKUP_DIR/redis.rdb"

# Backup volumes
docker run --rm -v iac_ml_models:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/ml_models.tar.gz /data

# Cleanup old backups (keep last 30 days)
find /var/backups/iac-dharma -type d -mtime +30 -exec rm -rf {} +
EOF

chmod +x /etc/cron.daily/iac-dharma-backup
```

---

## 🔧 Operations & Maintenance

### Service Management

#### Start/Stop Services

```bash
# Stop all services
docker compose -f docker-compose.v3.yml stop

# Start all services
docker compose -f docker-compose.v3.yml start

# Restart specific service
docker compose -f docker-compose.v3.yml restart api-gateway

# Stop and remove all containers
docker compose -f docker-compose.v3.yml down

# Stop and remove all containers + volumes (CAUTION: Data loss!)
docker compose -f docker-compose.v3.yml down -v
```

#### Scale Services

```bash
# Scale AIOps Engine to 3 replicas
docker compose -f docker-compose.v3.yml up -d --scale aiops-engine=3

# Scale API Gateway to 5 replicas
docker compose -f docker-compose.v3.yml up -d --scale api-gateway=5

# Verify scaling
docker compose -f docker-compose.v3.yml ps
```

#### Update Services

```bash
# Pull latest images
docker compose -f docker-compose.v3.yml pull

# Rebuild specific service
docker compose -f docker-compose.v3.yml build --no-cache api-gateway

# Rolling update (zero downtime)
docker compose -f docker-compose.v3.yml up -d --force-recreate --no-deps api-gateway

# Update all services
docker compose -f docker-compose.v3.yml up -d --force-recreate
```

### Log Management

```bash
# View logs for all services
docker compose -f docker-compose.v3.yml logs -f

# View logs for specific service
docker compose -f docker-compose.v3.yml logs -f api-gateway

# View last 100 lines
docker compose -f docker-compose.v3.yml logs --tail=100 api-gateway

# Search logs
docker compose -f docker-compose.v3.yml logs | grep ERROR

# Export logs
docker compose -f docker-compose.v3.yml logs > /var/log/iac-dharma-$(date +%Y%m%d).log

# Configure log rotation
cat > /etc/logrotate.d/iac-dharma << 'EOF'
/var/log/iac-dharma-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
EOF
```

### Resource Management

```bash
# View resource usage
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

### Database Maintenance

```bash
# PostgreSQL maintenance
docker exec -it iac-postgresql-v3 psql -U iac_admin -d iac_dharma -c "VACUUM ANALYZE;"

# Rebuild indexes
docker exec -it iac-postgresql-v3 psql -U iac_admin -d iac_dharma -c "REINDEX DATABASE iac_dharma;"

# Check database size
docker exec -it iac-postgresql-v3 psql -U iac_admin -d iac_dharma -c "
  SELECT pg_database.datname,
         pg_size_pretty(pg_database_size(pg_database.datname)) AS size
  FROM pg_database;
"

# Neo4j maintenance
docker exec -it iac-neo4j-v3 cypher-shell -u neo4j -p <password> "
  CALL db.indexes();
  CALL db.stats.retrieve('GRAPH COUNTS');
"

# Redis maintenance
docker exec -it iac-redis-v3 redis-cli INFO memory
docker exec -it iac-redis-v3 redis-cli BGREWRITEAOF
```

---

## 📊 Monitoring & Troubleshooting

### Health Checks

```bash
# Comprehensive health check
./test-services.sh

# Individual service health checks
curl http://localhost:4000/health              # API Gateway
curl http://localhost:8100/health              # AIOps Engine
curl http://localhost:8200/health              # CMDB Agent
curl http://localhost:8300/health              # AI Orchestrator
curl http://localhost:8400/health              # Self-Healing
curl http://localhost:8500/health              # Zero Trust
curl http://localhost:8700/health              # Chaos Engineering
curl http://localhost:8800/health              # Observability
curl http://localhost:8900/health              # Cost Optimizer
```

### Monitoring Dashboards

#### Grafana Dashboards

Access: `http://localhost:3000`

**Pre-configured dashboards**:
1. **System Overview** - Overall system health
2. **Service Metrics** - Per-service performance
3. **Infrastructure** - Database, Redis, Kafka metrics
4. **Cost Analysis** - Cloud spending trends
5. **Security** - Zero Trust metrics
6. **ML Models** - Model performance
7. **Incidents** - Self-healing actions

#### Prometheus Queries

Access: `http://localhost:9090`

**Useful queries**:
```promql
# Request rate per service
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Response time (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
container_memory_usage_bytes{name=~"iac-.*"}

# CPU usage
rate(container_cpu_usage_seconds_total{name=~"iac-.*"}[5m])
```

### Common Issues & Solutions

#### Issue 1: Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.v3.yml logs service-name

# Common causes:
# 1. Port already in use
sudo netstat -tulpn | grep :PORT_NUMBER
# Kill process using the port

# 2. Database not ready
# Wait for database to be fully up
docker compose -f docker-compose.v3.yml logs postgresql | grep "ready to accept connections"

# 3. Environment variable missing
docker compose -f docker-compose.v3.yml config
# Verify all variables are set
```

#### Issue 2: High Memory Usage

```bash
# Identify memory hog
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}" | sort -k 2 -h

# Restart heavy service
docker compose -f docker-compose.v3.yml restart service-name

# Adjust memory limits in docker-compose.v3.yml
services:
  service-name:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

#### Issue 3: Database Connection Errors

```bash
# Test database connectivity
docker exec -it iac-postgresql-v3 pg_isready

# Check connections
docker exec -it iac-postgresql-v3 psql -U iac_admin -d iac_dharma -c "
  SELECT count(*) as connections
  FROM pg_stat_activity
  WHERE datname = 'iac_dharma';
"

# Reset connections
docker compose -f docker-compose.v3.yml restart postgresql

# Check connection pool settings
docker compose -f docker-compose.v3.yml exec api-gateway cat config/database.ts
```

#### Issue 4: ML Predictions Failing

```bash
# Check model files exist
docker compose -f docker-compose.v3.yml exec aiops-engine ls -lh /app/models/

# Retrain models
./train-ml-models.sh

# Check MLflow
curl http://localhost:5000/api/2.0/mlflow/experiments/list

# Verify model registry
docker compose -f docker-compose.v3.yml logs mlflow
```

#### Issue 5: Zero Trust Denying Access

```bash
# Check trust score
curl http://localhost:8500/api/v3/zero-trust/trust-score/USER_ID

# Review audit log
curl http://localhost:8500/api/v3/zero-trust/audit?limit=10

# Adjust trust level requirements
# Edit policies via API or database

# Temporarily disable Zero Trust (EMERGENCY ONLY)
docker compose -f docker-compose.v3.yml exec api-gateway \
  sed -i 's/ZERO_TRUST_ENABLED=true/ZERO_TRUST_ENABLED=false/' .env
docker compose -f docker-compose.v3.yml restart api-gateway
```

### Performance Tuning

#### Database Optimization

```sql
-- PostgreSQL tuning
ALTER SYSTEM SET shared_buffers = '8GB';
ALTER SYSTEM SET effective_cache_size = '24GB';
ALTER SYSTEM SET maintenance_work_mem = '2GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Restart PostgreSQL
docker compose -f docker-compose.v3.yml restart postgresql
```

#### Redis Optimization

```bash
# Edit Redis configuration
docker exec -it iac-redis-v3 redis-cli CONFIG SET maxmemory 4gb
docker exec -it iac-redis-v3 redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Enable persistence
docker exec -it iac-redis-v3 redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

#### Node.js Services Optimization

```bash
# Increase Node.js memory limit
# Edit docker-compose.v3.yml
services:
  api-gateway:
    environment:
      - NODE_OPTIONS=--max-old-space-size=4096

# Enable clustering (multiple workers)
# Modify service code to use cluster module
```

---

## 🛡️ Disaster Recovery

### Backup Strategy

```
┌─────────────────┐
│  Daily Backups  │──► Keep 7 days
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Weekly Backups  │──► Keep 4 weeks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Monthly Backups │──► Keep 12 months
└─────────────────┘
```

### Backup Procedure

```bash
# Full system backup
./scripts/backup.sh full

# Incremental backup
./scripts/backup.sh incremental

# Backup to remote storage
./scripts/backup.sh full --remote s3://my-backup-bucket/iac-dharma/
```

### Restore Procedure

```bash
# Stop all services
docker compose -f docker-compose.v3.yml down

# Restore PostgreSQL
docker run --rm -v iac_postgresql_data:/data -v /var/backups/iac-dharma/20251208:/backup alpine sh -c "cd /data && rm -rf * && tar xzf /backup/postgresql.tar.gz"

# Restore Neo4j
docker run --rm -v iac_neo4j_data:/data -v /var/backups/iac-dharma/20251208:/backup alpine sh -c "cd /data && rm -rf * && tar xzf /backup/neo4j.tar.gz"

# Restore Redis
docker run --rm -v iac_redis_data:/data -v /var/backups/iac-dharma/20251208:/backup alpine sh -c "cp /backup/redis.rdb /data/dump.rdb"

# Restore ML models
docker run --rm -v iac_ml_models:/data -v /var/backups/iac-dharma/20251208:/backup alpine sh -c "cd /data && rm -rf * && tar xzf /backup/ml_models.tar.gz"

# Start services
docker compose -f docker-compose.v3.yml up -d

# Verify restoration
./test-services.sh
```

### High Availability Setup

```yaml
# docker-compose.ha.yml
version: '3.8'

services:
  api-gateway:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        max_attempts: 3

  postgresql:
    deploy:
      replicas: 1
    volumes:
      - postgresql_master:/var/lib/postgresql/data

  postgresql-replica:
    image: postgres:16
    environment:
      - POSTGRES_MASTER_HOST=postgresql
      - POSTGRES_REPLICATION_MODE=slave
    deploy:
      replicas: 2

  haproxy:
    image: haproxy:2.8
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
```

---

## 🔐 Security Hardening

### Network Security

```bash
# Create isolated networks
docker network create iac-frontend-network
docker network create iac-backend-network
docker network create iac-data-network

# Update docker-compose.v3.yml
services:
  api-gateway:
    networks:
      - iac-frontend-network
      - iac-backend-network

  aiops-engine:
    networks:
      - iac-backend-network

  postgresql:
    networks:
      - iac-data-network
```

### SSL/TLS Configuration

```bash
# Generate SSL certificates
mkdir -p /etc/iac-dharma/ssl
cd /etc/iac-dharma/ssl

# Self-signed (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=iac-dharma.local"

# Production (Let's Encrypt)
certbot certonly --standalone -d iac-dharma.example.com

# Configure API Gateway for HTTPS
# Edit backend/api-gateway/server.ts
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/ssl/privkey.pem'),
  cert: fs.readFileSync('/ssl/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

### Secrets Management

```bash
# Use Docker secrets (Swarm mode)
echo "my_db_password" | docker secret create postgres_password -

# Or use external secrets manager
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name iac-dharma/postgres-password \
  --secret-string "my_db_password"

# Update services to use secrets
# docker-compose.v3.yml
services:
  postgresql:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password

secrets:
  postgres_password:
    external: true
```

### Security Scanning

```bash
# Scan images for vulnerabilities
docker scan iac-api-gateway:v3.0

# Use Trivy
trivy image iac-api-gateway:v3.0

# Scan for secrets
trufflehog filesystem .

# OWASP Dependency Check
dependency-check --project IAC-Dharma --scan .
```

---

**Document Version**: 1.0  
**Last Updated**: December 8, 2025  
**Platform Version**: v3.0
