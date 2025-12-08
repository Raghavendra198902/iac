# Quick Start Guide - GraphQL API Gateway v3.0

## 🚀 One-Command Startup (After npm is available)

```bash
cd /home/rrd/iac/backend/api-gateway
cp .env.v3 .env
npm install
npm run dev
```

GraphQL API will be available at: **http://localhost:4000/graphql**

## 📋 Installation Steps (Detailed)

### Option 1: Using npm (Recommended)
```bash
cd /home/rrd/iac/backend/api-gateway

# Install all dependencies
npm install --save \
  @apollo/server@^4.9.5 \
  @graphql-tools/schema@^10.0.2 \
  apollo-datasource@^3.3.2 \
  axios@^1.6.2 \
  bcryptjs@^2.4.3 \
  body-parser@^1.20.2 \
  cors@^2.8.5 \
  express@^4.18.2 \
  graphql@^16.8.1 \
  graphql-ws@^5.14.3 \
  jsonwebtoken@^9.0.2 \
  lodash@^4.17.21 \
  pg@^8.11.3 \
  ws@^8.15.1

# Install dev dependencies
npm install --save-dev \
  @types/bcryptjs@^2.4.6 \
  @types/cors@^2.8.17 \
  @types/express@^4.17.21 \
  @types/jsonwebtoken@^9.0.5 \
  @types/lodash@^4.14.202 \
  @types/node@^20.10.5 \
  @types/pg@^8.10.9 \
  @types/ws@^8.5.10 \
  typescript@^5.3.3 \
  ts-node@^10.9.2 \
  ts-node-dev@^2.0.0

# Copy environment config
cp .env.v3 .env

# Start development server
npm run dev
```

### Option 2: Using yarn
```bash
cd /home/rrd/iac/backend/api-gateway

# Install yarn if not available
npm install -g yarn

# Install dependencies
yarn add @apollo/server @graphql-tools/schema apollo-datasource axios bcryptjs body-parser cors express graphql graphql-ws jsonwebtoken lodash pg ws

# Install dev dependencies
yarn add -D @types/bcryptjs @types/cors @types/express @types/jsonwebtoken @types/lodash @types/node @types/pg @types/ws typescript ts-node ts-node-dev

# Copy environment config
cp .env.v3 .env

# Start development server
yarn dev
```

### Option 3: Using Docker (Alternative)
```dockerfile
# Create Dockerfile for GraphQL API
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.v3.json package.json
COPY tsconfig.v3.json tsconfig.json

# Install dependencies
RUN npm install

# Copy source code
COPY graphql ./graphql
COPY server.ts .
COPY .env.v3 .env

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t iac-graphql-api:v3 .
docker run -p 4000:4000 --network iac-v3-network iac-graphql-api:v3
```

## ✅ Pre-Flight Checklist

### Infrastructure Services (Must be Running)
```bash
# Check all v3 services
docker ps | grep v3

# Expected output:
# iac-postgres-v3    ✓ Port 5433
# iac-neo4j-v3       ✓ Ports 7474, 7687
# iac-redis-v3       ✓ Port 6380
# iac-kafka-v3       ✓ Port 9093
# iac-prometheus-v3  ✓ Port 9091
# iac-grafana-v3     ✓ Port 3020
```

### Database Schema (Already Initialized ✅)
```bash
# Verify database tables
docker exec -i iac-postgres-v3 psql -U iacadmin -d iac_v3 -c "\dt"

# Expected output:
# public | audit_logs         | table | iacadmin
# public | compute_resources  | table | iacadmin
# public | deployments        | table | iacadmin
# public | infrastructures    | table | iacadmin
# public | metrics            | table | iacadmin
# public | predictions        | table | iacadmin
# public | users              | table | iacadmin
```

### AIOps Engine (Should be Running or Startable)
```bash
# Check if AIOps is running
curl http://localhost:8100/api/v3/aiops/health

# If not, start it:
cd /home/rrd/iac/backend/aiops-engine
uvicorn app_v3:app --host 0.0.0.0 --port 8100
```

## 🧪 Testing GraphQL API

### 1. Health Check
```bash
curl http://localhost:4000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-12-05T14:00:00.000Z",
  "services": {
    "graphql": true,
    "postgres": true,
    "aiops": true
  }
}
```

### 2. GraphQL Introspection
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } mutationType { name } subscriptionType { name } } }"}'

# Expected response:
{
  "data": {
    "__schema": {
      "queryType": { "name": "Query" },
      "mutationType": { "name": "Mutation" },
      "subscriptionType": { "name": "Subscription" }
    }
  }
}
```

### 3. Login (Get JWT Token)
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(email: \"admin@iacdharma.local\", password: \"admin123\") { token user { email role } } }"
  }'

# Save the token from response
export JWT_TOKEN="<token-from-response>"
```

### 4. Create Infrastructure (Authenticated)
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "mutation { createInfrastructure(input: { name: \"Test Cluster\", provider: aws, region: \"us-east-1\", config: {}, tags: [\"test\"] }) { id name status } }"
  }'
```

### 5. List Infrastructures
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "{ listInfrastructures(limit: 5) { edges { node { id name provider region status } } totalCount } }"
  }'
```

## 🎮 GraphQL Playground Usage

### Open in Browser
```
http://localhost:4000/graphql
```

### Example Queries to Try:

#### 1. Get Schema Documentation
```graphql
{
  __schema {
    types {
      name
      description
    }
  }
}
```

#### 2. Login and Get Token
```graphql
mutation Login {
  login(email: "admin@iacdharma.local", password: "admin123") {
    token
    refreshToken
    user {
      id
      email
      username
      role
      permissions
    }
    expiresAt
  }
}
```

#### 3. Create Infrastructure
```graphql
mutation CreateInfra {
  createInfrastructure(input: {
    name: "Production Cluster"
    provider: aws
    region: "us-east-1"
    config: {instanceType: "t3.medium", vpcId: "vpc-12345"}
    tags: ["production", "web"]
  }) {
    id
    name
    provider
    region
    status
    config
    tags
    createdAt
  }
}
```

#### 4. List All Infrastructures
```graphql
query ListInfra {
  listInfrastructures(limit: 10) {
    edges {
      node {
        id
        name
        provider
        region
        status
        computeResources {
          instanceType
          cpuCores
          memoryGb
          status
        }
      }
    }
    pageInfo {
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

#### 5. Predict Infrastructure Failure
```graphql
mutation PredictFailure {
  predictFailure(
    serviceId: "550e8400-e29b-41d4-a716-446655440000"
    metrics: {
      cpuUsage: 85.5
      memoryUsage: 92.0
      diskIo: 75.0
      errorRate: 5.2
      responseTimeMs: 450
    }
  ) {
    id
    probability
    confidence
    severity
    affectedComponents
    recommendedActions
    details
  }
}
```

#### 6. Subscribe to Anomalies (WebSocket)
```graphql
subscription AnomalyAlerts {
  anomalyDetected(serviceId: "550e8400-e29b-41d4-a716-446655440000") {
    id
    serviceId
    anomalyScore
    affectedMetrics
    severity
    message
    timestamp
  }
}
```

### Set HTTP Headers in Playground
```json
{
  "Authorization": "Bearer <your-jwt-token-here>"
}
```

## 🔧 Troubleshooting

### Issue: Port 4000 already in use
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use different port
export PORT=4001
npm run dev
```

### Issue: Cannot connect to PostgreSQL
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres-v3

# Restart PostgreSQL
docker restart iac-postgres-v3

# Check logs
docker logs iac-postgres-v3 --tail 50
```

### Issue: Cannot connect to AIOps Engine
```bash
# Check if AIOps is running
curl http://localhost:8100/api/v3/aiops/health

# Start AIOps Engine
cd /home/rrd/iac/backend/aiops-engine
uvicorn app_v3:app --host 0.0.0.0 --port 8100
```

### Issue: JWT token expired
```bash
# Get new token
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"admin@iacdharma.local\", password: \"admin123\") { token } }"}'
```

### Issue: TypeScript compilation errors
```bash
# Clean build
rm -rf dist/
npm run build

# Check TypeScript version
npx tsc --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring

### Check Service Logs
```bash
# In development (shows live logs)
npm run dev

# In production (check logs)
pm2 logs graphql-api
# or
docker logs <container-id>
```

### Check Prometheus Metrics
```bash
# GraphQL API exposes metrics at:
curl http://localhost:4000/metrics

# Prometheus UI:
# http://localhost:9091
```

### Check Grafana Dashboard
```
http://localhost:3020
Username: admin
Password: admin123
```

## 🔄 Development Workflow

```bash
# 1. Make code changes
vim graphql/resolvers/infrastructure.ts

# 2. Save file (ts-node-dev auto-reloads)

# 3. Test in GraphQL Playground
# http://localhost:4000/graphql

# 4. Run tests
npm test

# 5. Build for production
npm run build

# 6. Start production server
npm start
```

## 📝 Environment Variables Reference

```bash
# Server
PORT=4000
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=iac_v3
POSTGRES_USER=iacadmin
POSTGRES_PASSWORD=iacadmin123

# AIOps
AIOPS_URL=http://localhost:8100

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

## 🚀 Production Deployment

```bash
# Build optimized production bundle
npm run build

# Start with PM2
pm2 start dist/server.js --name graphql-api-v3

# Or with Docker
docker build -t iac-graphql-api:v3 .
docker run -d -p 4000:4000 --name iac-graphql-api iac-graphql-api:v3

# Or with systemd service
sudo systemctl start graphql-api-v3
```

## 📚 Additional Resources

- **GraphQL Schema**: `/home/rrd/iac/backend/api-gateway/graphql/schemas/schema.graphql`
- **Implementation Guide**: `/home/rrd/iac/GRAPHQL_API_IMPLEMENTATION_COMPLETE.md`
- **Progress Report**: `/home/rrd/iac/V3_GRAPHQL_PROGRESS_REPORT.md`
- **LLD Document**: `/home/rrd/iac/docs/LLD_v3.0_GraphQL_API.md`

---

**Status**: ✅ Ready to Start (pending npm install)  
**Time to First API Call**: ~5 minutes after npm install  
**Estimated Setup Time**: 10-15 minutes total
