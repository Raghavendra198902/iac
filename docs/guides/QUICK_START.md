# 🚀 IAC Dharma - Quick Start Guide

## Current Status: ✅ FULLY OPERATIONAL

**Last Updated**: November 21, 2025  
**System Health**: 18/18 services running (100%)  
**Latest Commit**: `04072af` - Deployment success report and TypeScript fixes

---

## 🎯 Quick Access

### Primary Endpoints
```
Frontend:        http://localhost:5173
API Gateway:     http://localhost:3000
API Docs:        http://localhost:3000/api-docs
Admin Dashboard: http://localhost:3000/admin
```

### Monitoring & Observability
```
Grafana:    http://localhost:3030 (admin/admin)
Jaeger:     http://localhost:16686
Prometheus: http://localhost:9090
Metrics:    http://localhost:3000/metrics
```

### Health Checks
```
Liveness:  http://localhost:3000/health/live
Readiness: http://localhost:3000/health/ready
Startup:   http://localhost:3000/health/startup
```

---

## ⚡ Quick Commands

### Docker Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild service
docker-compose build [service-name]
docker-compose up -d [service-name]
```

### Git Operations
```bash
# Check status
git status

# View recent commits
git log --oneline -10

# Pull latest changes
git pull origin master

# Push changes
git push origin master

# Create branch
git checkout -b feature/new-feature
```

### Service Management
```bash
# Check all running containers
docker ps

# Check container logs
docker logs dharma-api-gateway --tail 50

# Execute command in container
docker exec -it dharma-api-gateway sh

# Check resource usage
docker stats
```

---

## 🎨 Feature Flags

### Available Flags (Default)
```javascript
ai_recommendations      - Enable/disable AI recommendations
advanced_analytics     - Enable advanced analytics features
multi_cloud_support    - Enable multi-cloud deployment
cost_optimization      - Enable cost optimization suggestions
auto_remediation       - Enable automated issue remediation
blueprint_versioning   - Enable blueprint version control
real_time_monitoring   - Enable real-time monitoring dashboards
```

### API Usage
```bash
# List all flags
curl http://localhost:3000/api/feature-flags

# Evaluate flag (requires auth)
curl -X POST http://localhost:3000/api/feature-flags/ai_recommendations/evaluate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Update flag (admin only)
curl -X PUT http://localhost:3000/api/admin/feature-flags/ai_recommendations \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "rolloutPercentage": 50}'
```

---

## 📊 Metrics & Monitoring

### Key Metrics
- **System Metrics**: CPU, memory, disk usage
- **HTTP Metrics**: Request rate, response time, error rate
- **Database Metrics**: Query time, connection pool
- **Cache Metrics**: Hit rate, miss rate, evictions
- **Business Metrics**: Projects, deployments, users

### Grafana Dashboards
1. **System Overview** - Overall system health
2. **API Performance** - Request/response metrics
3. **Database Performance** - Query performance
4. **Cache Performance** - Redis metrics

### Alert Rules (Prometheus)
- High error rate (>5% for 5 minutes)
- Slow response time (>2s p95 for 5 minutes)
- High memory usage (>80% for 10 minutes)
- Database connection errors

---

## 🔧 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker logs [service-name] --tail 100

# Check if port is in use
sudo lsof -i :[port-number]

# Remove and recreate
docker-compose rm -f [service-name]
docker-compose up -d [service-name]
```

### Database Issues
```bash
# Check database connection
docker exec dharma-api-gateway npx ts-node -e "
  const { Pool } = require('pg');
  const pool = new Pool({
    host: 'postgres',
    database: 'iac_dharma',
    user: 'dharma_admin',
    password: 'dharma_pass_dev'
  });
  pool.query('SELECT NOW()').then(console.log).catch(console.error);
"

# Run migrations manually
docker exec dharma-api-gateway npm run migrate:latest
```

### Redis Issues
```bash
# Check Redis connection
docker exec dharma-redis redis-cli ping

# Check Redis keys
docker exec dharma-redis redis-cli keys '*'

# Clear Redis cache
docker exec dharma-redis redis-cli FLUSHALL
```

### Frontend Issues
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Check frontend logs
docker logs dharma-frontend --tail 50

# Access frontend container
docker exec -it dharma-frontend sh
```

---

## 📁 Project Structure

```
iac/
├── backend/                 # Backend microservices
│   ├── api-gateway/        # Main API gateway (port 3000)
│   ├── ai-engine/          # AI/ML service (port 8000)
│   ├── ai-recommendations/ # AI recommendations (port 3011)
│   ├── automation-engine/  # Automation service (port 3006)
│   ├── blueprint-service/  # Blueprint management (port 3001)
│   ├── cloud-provider/     # Cloud provider integration (port 3010)
│   ├── costing-service/    # Cost calculation (port 3004)
│   ├── guardrails-engine/  # Policy enforcement (port 3003)
│   ├── iac-generator/      # IaC generation (port 3002)
│   ├── monitoring-service/ # Monitoring (port 3007)
│   ├── orchestrator/       # Orchestration (port 3005)
│   └── sso-service/        # SSO/Auth (port 3012)
├── frontend/               # React frontend (port 5173)
├── database/               # Database schemas & migrations
├── docs/                   # Documentation
├── k8s/                    # Kubernetes configs
├── monitoring/             # Monitoring configs
├── terraform/              # Terraform modules
└── tests/                  # Test suites
```

---

## 🔐 Authentication

### JWT Token
```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Use token in requests
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### SSO Configuration
- **SAML**: Configure SAML_ENTRY_POINT and SAML_CERT in .env
- **OAuth2**: Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- **Azure AD**: Configure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET

---

## 📈 Performance Optimization

### Cache Configuration
```javascript
// Redis cache (default TTL: 1 hour)
const cache = new CacheService({
  defaultTTL: 3600,
  maxMemory: '256mb'
});
```

### Rate Limiting
```javascript
// Default: 100 requests per minute per IP
app.use(rateLimitMiddleware({
  windowMs: 60000,
  max: 100
}));
```

### Circuit Breaker
```javascript
// Trips after 5 failures in 30 seconds
const breaker = new CircuitBreakerService({
  failureThreshold: 5,
  timeout: 3000,
  resetTimeout: 30000
});
```

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/health

# Using k6
k6 run tests/load/api-gateway.js
```

---

## 🚀 Deployment

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to Kubernetes
kubectl apply -k k8s/overlays/production
```

### Environment Variables
```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env

# Restart services to apply
docker-compose restart
```

---

## 📚 Documentation

### Comprehensive Guides
- [DEPLOYMENT_SUCCESS.md](./DEPLOYMENT_SUCCESS.md) - Full deployment status
- [ADVANCED_FEATURES_COMPLETE.md](./ADVANCED_FEATURES_COMPLETE.md) - Feature details
- [WORKSPACE_PENDING_ANALYSIS.md](./WORKSPACE_PENDING_ANALYSIS.md) - Analysis & tasks

### Feature Documentation
- [Feature Flags](./docs/features/FEATURE_FLAGS.md)
- [Admin Dashboard](./docs/features/ADMIN_DASHBOARD.md)
- [Observability](./docs/features/observability/)
- [Distributed Tracing](./docs/features/tracing/)

### API Documentation
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI Spec: http://localhost:3000/api-docs.json

---

## 💡 Tips & Best Practices

### Development Workflow
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run tests: `npm test`
4. Commit with meaningful message
5. Push and create PR: `git push origin feature/my-feature`

### Monitoring Workflow
1. Check Grafana dashboards regularly
2. Set up alerts in Prometheus
3. Review Jaeger traces for slow requests
4. Monitor error rates in logs

### Feature Flag Workflow
1. Create flag for new feature
2. Start with 0% rollout (disabled)
3. Gradually increase percentage
4. Monitor metrics during rollout
5. Full rollout or rollback based on data

---

## 🆘 Getting Help

### Logs & Debugging
```bash
# All service logs
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway

# Last 100 lines
docker logs dharma-api-gateway --tail 100

# Follow logs
docker logs -f dharma-api-gateway
```

### Health Checks
```bash
# Check all services
docker-compose ps

# API Gateway health
curl http://localhost:3000/health/ready | jq

# Database connection
docker exec dharma-api-gateway npm run db:check
```

### Common Issues
1. **Port already in use**: Check with `lsof -i :3000` and kill process
2. **Database not ready**: Wait 10 seconds and retry
3. **Redis connection failed**: Ensure Redis container is running
4. **Frontend build errors**: Rebuild with `docker-compose build frontend`

---

## 🎉 Success Checklist

- ✅ All 18 services running
- ✅ Frontend accessible at :5173
- ✅ API Gateway responding at :3000
- ✅ Grafana dashboards showing data
- ✅ Jaeger collecting traces
- ✅ Prometheus scraping metrics
- ✅ Feature flags operational
- ✅ Admin dashboard accessible
- ✅ Database connected
- ✅ Redis caching active

---

**Repository**: https://github.com/Raghavendra198902/iac  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
