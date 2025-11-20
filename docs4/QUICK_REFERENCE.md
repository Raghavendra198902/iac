# IAC Dharma Platform - Quick Reference

## 🚀 Start/Stop Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart <service-name>

# View logs
docker logs <container-name> --tail 50 -f

# Validate deployment
./scripts/validate-deployment.sh
```

## 🔗 Service URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| API Gateway | http://localhost:3000 | 3000 |
| Blueprint Service | http://localhost:3001 | 3001 |
| IAC Generator | http://localhost:3002 | 3002 |
| Guardrails | http://localhost:3003 | 3003 |
| Costing Service | http://localhost:3004 | 3004 |
| Orchestrator | http://localhost:3005 | 3005 |
| Automation Engine | http://localhost:3006 | 3006 |
| Monitoring Service | http://localhost:3007 | 3007 |
| Grafana | http://localhost:3030 | 3030 |
| Prometheus | http://localhost:9090 | 9090 |

## 🔐 Default Credentials

```
Frontend Login:
  Email: demo@example.com
  Password: password123

Grafana:
  Username: admin
  Password: admin

Database:
  Host: localhost:5432
  Database: iac_dharma
  User: dharma_admin
  Password: dharma_pass_dev
```

## 🧪 Test Commands

```bash
# Login and get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'

# Test protected endpoint
curl http://localhost:3000/api/ \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# Check service health
curl http://localhost:3001/health  # Blueprint
curl http://localhost:3002/health  # IAC Generator
curl http://localhost:3003/health  # Guardrails
curl http://localhost:3004/health  # Costing
curl http://localhost:3005/health  # Orchestrator
curl http://localhost:3006/health  # Automation
curl http://localhost:3007/health  # Monitoring
```

## 💾 Database Commands

```bash
# Connect to database
docker exec -it dharma-postgres psql -U dharma_admin -d iac_dharma

# List all tables
docker exec dharma-postgres psql -U dharma_admin -d iac_dharma -c "\dt"

# Count tables
docker exec dharma-postgres psql -U dharma_admin -d iac_dharma -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Run migration
cd database/schemas
docker cp V00X__name.sql dharma-postgres:/tmp/
docker exec dharma-postgres psql -U dharma_admin -d iac_dharma -f /tmp/V00X__name.sql
```

## 🔧 Development Commands

```bash
# Build API Gateway
cd backend/api-gateway
npm run build

# Run tests
cd tests/integration
npm test

# Run E2E tests
cd tests/e2e
npx playwright test

# Check for security issues
snyk test
```

## 📊 Role Endpoints

### Solution Architect (SA)
- `GET /api/sa/blueprints` - List blueprints
- `POST /api/sa/blueprints` - Create blueprint
- `POST /api/sa/ai-recommendations/analyze` - AI analysis

### Technical Architect (TA)
- `POST /api/ta/iac/generate` - Generate IaC
- `POST /api/ta/iac/validate` - Validate IaC
- `GET /api/ta/guardrails/violations` - Check violations

### Enterprise Architect (EA)
- `GET /api/ea/policies` - List policies
- `GET /api/ea/compliance/dashboard` - Compliance overview
- `GET /api/ea/patterns` - Architecture patterns

### Project Manager (PM)
- `GET /api/pm/approvals/pending` - Pending approvals
- `POST /api/pm/approvals/:id/approve` - Approve deployment
- `GET /api/pm/budget/dashboard` - Budget dashboard

### Site Engineer (SE)
- `POST /api/se/deployments/execute` - Execute deployment
- `GET /api/se/deployments/:id/logs/stream` - Stream logs
- `GET /api/se/incidents` - List incidents

## 🐛 Troubleshooting

```bash
# Container won't start
docker-compose logs <service-name>
docker-compose restart <service-name>
docker-compose up -d --build <service-name>

# Port already in use
lsof -i :<port>
kill -9 <PID>

# Clear all containers and volumes
docker-compose down -v
docker system prune -a --volumes

# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait 10 seconds
./database/scripts/migrate.sh
```

## 📁 Directory Structure

```
Iac/
├── backend/          # 8 microservices
│   ├── api-gateway/
│   ├── blueprint-service/
│   ├── iac-generator/
│   ├── guardrails-engine/
│   ├── costing-service/
│   ├── orchestrator-service/
│   ├── automation-engine/
│   └── monitoring-service/
├── frontend/         # React app
├── database/         # SQL schemas & migrations
├── tests/           # Integration & E2E tests
├── scripts/         # Helper scripts
├── docs4/           # All documentation
└── docker-compose.yml
```

## 🎯 Common Tasks

### Add New Endpoint
1. Create route in `backend/api-gateway/src/routes/<role>/`
2. Add permission check with `requirePermission(resource, action, scope)`
3. Update router in `src/routes/index.ts`
4. Rebuild: `npm run build`
5. Restart: `docker-compose restart api-gateway`

### Add Database Table
1. Create migration: `database/schemas/V00X__description.sql`
2. Apply: `docker cp ... && docker exec psql ...`
3. Verify: Check table count = previous + new

### Add Frontend Component
1. Create component in `frontend/src/components/`
2. Add route in `App.tsx`
3. Rebuild: `docker-compose up -d --build frontend`

### Update Service
1. Make changes in `backend/<service>/`
2. Build: `npm run build` (if TypeScript)
3. Restart: `docker-compose up -d --build <service>`
4. Test: `curl http://localhost:<port>/health`

## 📈 Monitoring

```bash
# View metrics
open http://localhost:9090  # Prometheus

# View dashboards
open http://localhost:3030  # Grafana

# Check container stats
docker stats

# View all container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 🔒 Security Scan

```bash
# Scan all code
cd backend/api-gateway
snyk test

# Scan Docker images
snyk container test dharma-api-gateway

# Check vulnerabilities
npm audit
```

## 💡 Tips

- Always run `./scripts/validate-deployment.sh` after changes
- Check logs with `docker-compose logs -f <service>` for debugging
- Use `docker-compose restart <service>` for quick reloads
- Database changes require migrations - never modify directly
- Frontend hot-reload enabled - changes reflect immediately
- Backend requires rebuild for TypeScript changes

## 🆘 Support

- Documentation: `docs4/`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`
- Architecture: `docs4/architecture/README.md`
- Test Results: `docs4/TEST_SUMMARY.md`

---

**Last Updated**: November 16, 2025
**Platform Version**: 1.0.0
