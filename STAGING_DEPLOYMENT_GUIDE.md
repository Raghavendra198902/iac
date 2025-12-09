# 🚀 Staging Deployment Guide - IaC Platform v3.0

## Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] 16GB RAM minimum (32GB recommended)
- [ ] 100GB disk space available
- [ ] Ports available: 3000-4000, 5432, 6379, 7474, 8200-8400, 9090-9093, 16686
- [ ] SSL certificates ready (optional for staging)
- [ ] Environment variables prepared

### ✅ Platform Validation
Run integration tests before deployment:
```bash
cd /home/rrd/iac
chmod +x scripts/integration-tests.sh
./scripts/integration-tests.sh
```

Expected result: **16/16 tests passing (100% success rate)**

---

## Deployment Methods

### Method 1: Quick Deploy (Recommended for Staging)

**Single command deployment:**
```bash
cd /home/rrd/iac
./DEPLOY_NOW.sh staging
```

This script will:
1. ✅ Validate environment
2. ✅ Build all Docker images
3. ✅ Start services in correct order
4. ✅ Initialize databases
5. ✅ Run health checks
6. ✅ Display service URLs

**Estimated time: 10-15 minutes**

---

### Method 2: Manual Step-by-Step Deployment

#### Step 1: Environment Configuration
```bash
# Copy environment template
cp .env.example .env.staging

# Edit staging configuration
nano .env.staging
```

**Required variables:**
```bash
# Database
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=iac_platform
POSTGRES_USER=iac_user

# Redis
REDIS_PASSWORD=<strong-password>

# Neo4j
NEO4J_AUTH=neo4j/<strong-password>

# Vault
VAULT_DEV_ROOT_TOKEN_ID=<generate-token>
VAULT_ADDR=http://vault:8200

# API Keys
RBAC_API_KEY=<generate-api-key>
ML_API_KEY=<generate-api-key>

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RBAC_URL=http://localhost:3050
```

#### Step 2: Build Services
```bash
# Build all services
docker-compose -f docker-compose.v3.yml build

# Verify images
docker images | grep iac
```

Expected output:
- iac-advanced-rbac-v3
- iac-aiops-engine-v3
- iac-api-gateway-v3
- iac-self-healing-engine-v3
- iac-frontend-v3

#### Step 3: Start Infrastructure Services
```bash
# Start databases first
docker-compose -f docker-compose.v3.yml up -d postgres redis neo4j kafka zookeeper

# Wait 30 seconds for databases to initialize
sleep 30

# Verify database health
docker exec iac-postgres-v3 pg_isready
docker exec iac-redis-v3 redis-cli ping
```

#### Step 4: Initialize Databases
```bash
# Load RBAC schema
docker exec -i iac-postgres-v3 psql -U iac_user -d iac_platform < backend/advanced-rbac-service/schema.sql

# Verify permissions loaded
docker exec iac-postgres-v3 psql -U iac_user -d iac_platform -c "SELECT COUNT(*) FROM permissions;"
```

Expected: **76 permissions**

#### Step 5: Start Application Services
```bash
# Start backend services
docker-compose -f docker-compose.v3.yml up -d \
  advanced-rbac \
  aiops-engine \
  api-gateway \
  self-healing-engine

# Wait for services to start
sleep 20
```

#### Step 6: Start Observability Stack
```bash
# Start monitoring
docker-compose -f docker-compose.v3.yml up -d \
  prometheus \
  grafana \
  jaeger

# Start tracing (optional)
docker-compose -f docker-compose.tracing.yml up -d
```

#### Step 7: Start Vault
```bash
# Start Vault in dev mode (staging only)
docker-compose -f docker-compose.vault.yml up -d

# Initialize Vault
docker exec iac-vault vault operator init
```

#### Step 8: Start Frontend
```bash
# Start Next.js frontend
docker-compose -f docker-compose.v3.yml up -d frontend

# Wait for build
sleep 30
```

#### Step 9: Verify Deployment
```bash
# Run integration tests
./scripts/integration-tests.sh

# Check service health
docker-compose -f docker-compose.v3.yml ps
```

All services should show **"healthy"** status.

---

## Service Access URLs

### Application Services
- **Frontend Dashboard**: http://localhost:3002
- **API Gateway**: http://localhost:4000
- **RBAC Service**: http://localhost:3050/health
- **AIOps Engine**: http://localhost:3100
- **Self-Healing Engine**: http://localhost:8400/health

### Observability
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686

### Databases
- **PostgreSQL**: localhost:5432 (iac_user/<password>)
- **Redis**: localhost:6379
- **Neo4j Browser**: http://localhost:7474 (neo4j/<password>)

### Secrets Management
- **Vault UI**: http://localhost:8200

---

## Health Check Endpoints

Verify all services are operational:

```bash
# RBAC Service
curl http://localhost:3050/health
# Expected: {"status":"healthy","database":"connected"}

# API Gateway
curl http://localhost:4000/health
# Expected: {"status":"healthy"}

# Self-Healing Engine
curl http://localhost:8400/health
# Expected: {"status":"healthy","auto_remediation_enabled":true}

# Jaeger
curl http://localhost:16686
# Expected: HTTP 200

# Prometheus
curl http://localhost:9090/api/v1/status/buildinfo
# Expected: {"status":"success"}
```

---

## Post-Deployment Validation

### 1. RBAC Permission Check
```bash
# Get permissions
curl http://localhost:3050/api/v1/permissions?limit=5

# Expected: JSON with 5 permissions
```

### 2. Dashboard Access
1. Open http://localhost:3002
2. Navigate to Enterprise Architect Dashboard
3. Verify live data loading:
   - Active Policies: 24
   - Compliance Score: 96%
   - Architecture Patterns: 18
   - Pending Approvals: 7
4. Check auto-refresh (30-second interval)

### 3. ML Models
```bash
# Check model files
docker exec iac-aiops-engine-v3 ls -l /app/models/

# Expected: 16 files (.py, .joblib)
```

### 4. Distributed Tracing
1. Open http://localhost:16686
2. Search for traces
3. Verify service graph

### 5. Vault Secrets
```bash
# Check Vault status
docker exec iac-vault vault status

# Expected: Initialized: true, Sealed: false
```

---

## Monitoring & Alerts

### Grafana Dashboards
1. Login: http://localhost:3001 (admin/admin)
2. Import dashboards:
   - Dashboard ID: 1860 (Node Exporter)
   - Dashboard ID: 3662 (Prometheus)
   - Custom: `/grafana-dashboards/platform-overview.json`

### Prometheus Alerts
Configure alerts in `prometheus/alerts.yml`:
- High CPU usage (>80%)
- High memory usage (>90%)
- Service down
- Database connection failures

### Log Aggregation
```bash
# View service logs
docker-compose -f docker-compose.v3.yml logs -f advanced-rbac
docker-compose -f docker-compose.v3.yml logs -f aiops-engine
docker-compose -f docker-compose.v3.yml logs -f api-gateway
```

---

## Backup & Recovery

### Database Backup
```bash
# Backup PostgreSQL
docker exec iac-postgres-v3 pg_dump -U iac_user iac_platform > backup_$(date +%Y%m%d).sql

# Backup Neo4j
docker exec iac-neo4j-v3 neo4j-admin dump --database=neo4j --to=/backup/neo4j_$(date +%Y%m%d).dump
```

### Restore
```bash
# Restore PostgreSQL
docker exec -i iac-postgres-v3 psql -U iac_user -d iac_platform < backup_20251209.sql

# Restore Neo4j
docker exec iac-neo4j-v3 neo4j-admin load --from=/backup/neo4j_20251209.dump --database=neo4j
```

---

## Scaling Configuration

### Horizontal Scaling
```bash
# Scale RBAC service
docker-compose -f docker-compose.v3.yml up -d --scale advanced-rbac=3

# Scale API Gateway
docker-compose -f docker-compose.v3.yml up -d --scale api-gateway=2
```

### Resource Limits
Edit `docker-compose.v3.yml`:
```yaml
services:
  advanced-rbac:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.v3.yml logs <service-name>

# Check container status
docker ps -a | grep iac

# Restart service
docker-compose -f docker-compose.v3.yml restart <service-name>
```

### Database Connection Issues
```bash
# Check PostgreSQL
docker exec iac-postgres-v3 psql -U iac_user -d iac_platform -c "SELECT 1;"

# Check Redis
docker exec iac-redis-v3 redis-cli ping

# Check Neo4j
curl http://localhost:7474
```

### Permission Issues
```bash
# Reload RBAC schema
docker exec -i iac-postgres-v3 psql -U iac_user -d iac_platform < backend/advanced-rbac-service/schema.sql

# Restart RBAC service
docker-compose -f docker-compose.v3.yml restart advanced-rbac
```

### Frontend Not Loading
```bash
# Check Next.js build
docker-compose -f docker-compose.v3.yml logs frontend

# Rebuild if needed
docker-compose -f docker-compose.v3.yml build frontend
docker-compose -f docker-compose.v3.yml up -d frontend
```

### High Memory Usage
```bash
# Check container stats
docker stats

# Restart heavy services
docker-compose -f docker-compose.v3.yml restart aiops-engine
```

---

## Security Hardening (Before Production)

### 1. Change Default Passwords
- PostgreSQL: Update POSTGRES_PASSWORD
- Redis: Set REDIS_PASSWORD
- Neo4j: Change NEO4J_AUTH
- Grafana: Change admin password

### 2. Enable TLS/SSL
- Configure SSL certificates
- Update service URLs to https://
- Enable SSL in PostgreSQL, Redis

### 3. API Key Rotation
```bash
# Generate new API keys
openssl rand -hex 32

# Update .env and restart services
```

### 4. Network Isolation
```yaml
# docker-compose.v3.yml
networks:
  frontend:
  backend:
  database:
```

### 5. Firewall Rules
```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

---

## Rollback Procedure

### Quick Rollback
```bash
# Stop all services
docker-compose -f docker-compose.v3.yml down

# Restore from backup
docker exec -i iac-postgres-v3 psql -U iac_user -d iac_platform < backup_latest.sql

# Start services
./DEPLOY_NOW.sh staging
```

### Git Rollback
```bash
# Checkout previous version
git checkout v3.0-stable

# Rebuild and redeploy
docker-compose -f docker-compose.v3.yml build
docker-compose -f docker-compose.v3.yml up -d
```

---

## Performance Optimization

### 1. Enable Redis Caching
```yaml
# docker-compose.v3.yml
environment:
  REDIS_ENABLED: "true"
  CACHE_TTL: "300"
```

### 2. Database Connection Pooling
```typescript
// backend/advanced-rbac-service/src/db.ts
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000
});
```

### 3. CDN Configuration
- Deploy static assets to CDN
- Configure caching headers
- Enable gzip compression

---

## Maintenance Windows

### Recommended Schedule
- **Daily**: Log rotation, cache cleanup
- **Weekly**: Database backups, security updates
- **Monthly**: Performance review, capacity planning

### Maintenance Commands
```bash
# Clean up Docker
docker system prune -a --volumes

# Vacuum PostgreSQL
docker exec iac-postgres-v3 psql -U iac_user -d iac_platform -c "VACUUM ANALYZE;"

# Clear Redis cache
docker exec iac-redis-v3 redis-cli FLUSHDB
```

---

## Support & Documentation

### Documentation
- **API Documentation**: `/docs/RBAC_API_DOCUMENTATION.md`
- **99% Completion Report**: `/PLATFORM_COMPLETE_99_PERCENT.md`
- **Integration Tests**: `/scripts/integration-tests.sh`

### Monitoring
- Integration tests: Run every 30 minutes
- Health checks: Every 10 seconds
- Alerts: Configured in Prometheus

### Contact
- GitHub Issues: https://github.com/Raghavendra198902/iac/issues
- Git Branch: v3.0-development
- Latest Commit: 1559fb5

---

## Success Criteria

Deployment is successful when:
- ✅ All 16 integration tests passing
- ✅ All services showing "healthy" status
- ✅ Dashboard loading with live data
- ✅ 76 RBAC permissions loaded
- ✅ 16 ML model files available
- ✅ Vault initialized and unsealed
- ✅ Jaeger UI accessible
- ✅ Grafana dashboards visible
- ✅ Zero critical errors in logs

**Current Status: READY FOR STAGING DEPLOYMENT**
