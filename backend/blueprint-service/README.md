# Blueprint Service

Central microservice for managing infrastructure blueprints with versioning, graph storage, and multi-tenancy support.

## Overview

The Blueprint Service is the heart of IAC DHARMA, responsible for:
- Storing and managing infrastructure blueprints
- Version control and immutable snapshots
- Graph-based component relationships
- Multi-tenant isolation
- Caching for performance
- Integration with automation workflows

## Features

- ✅ **CRUD Operations**: Create, Read, Update, Delete blueprints
- ✅ **Versioning**: Immutable version history
- ✅ **Multi-Tenancy**: Complete data isolation
- ✅ **Graph Storage**: Component relationships in JSONB
- ✅ **Caching**: Redis for high-performance reads
- ✅ **Authentication**: JWT-based auth with RBAC
- ✅ **Analysis API**: Metrics for auto-approval decisions
- ✅ **Security**: No hardcoded secrets, X-Powered-By disabled

## API Endpoints

### Create Blueprint
```http
POST /api/blueprints
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production Web App",
  "description": "3-tier web application",
  "targetCloud": "azure",
  "components": [
    {
      "name": "web-server",
      "type": "compute",
      "provider": "azurerm_linux_virtual_machine",
      "properties": {
        "size": "Standard_D2s_v3",
        "os": "Ubuntu 22.04"
      }
    },
    {
      "name": "database",
      "type": "database",
      "provider": "azurerm_postgresql_server",
      "properties": {
        "sku": "GP_Gen5_2",
        "storage": "102400"
      }
    }
  ],
  "metadata": {
    "environment": "production",
    "owner": "platform-team"
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "bp-12345-67890",
  "versionId": "v-98765-43210",
  "name": "Production Web App",
  "status": "draft",
  "created_at": "2025-11-15T10:00:00Z"
}
```

### Get Blueprint
```http
GET /api/blueprints/:id
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
{
  "id": "bp-12345-67890",
  "tenant_id": "tenant-123",
  "name": "Production Web App",
  "description": "3-tier web application",
  "target_cloud": "azure",
  "status": "draft",
  "current_version": 1,
  "version_id": "v-98765-43210",
  "version_number": 1,
  "graph_data": {
    "components": [...]
  },
  "components": [
    {
      "id": "c-111",
      "name": "web-server",
      "type": "compute",
      "provider": "azurerm_linux_virtual_machine",
      "properties": {...}
    }
  ],
  "created_at": "2025-11-15T10:00:00Z",
  "created_by_name": "john.doe"
}
```

### List Blueprints
```http
GET /api/blueprints?status=draft&targetCloud=azure&page=1&limit=20
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
{
  "blueprints": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### Update Blueprint
```http
PATCH /api/blueprints/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "published"
}
```

### Delete Blueprint
```http
DELETE /api/blueprints/:id
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
{
  "message": "Blueprint deleted successfully"
}
```

### Get Blueprint Analysis
```http
GET /api/blueprints/:id/analysis
Authorization: Bearer <token>
```

Used by Auto-Approval Engine for decision-making.

**Response**: `200 OK`
```json
{
  "blueprintId": "bp-12345-67890",
  "guardrailsPassed": true,
  "securityScore": 88,
  "complianceScore": 92,
  "complexityScore": 35,
  "componentCount": 7,
  "estimatedDeploymentTime": 9
}
```

### Get Blueprint State
```http
GET /api/blueprints/:id/state
Authorization: Bearer <token>
```

Used by Monitoring Service for drift detection.

**Response**: `200 OK`
```json
{
  "resources": [...],
  "expectedState": {
    "components": [...]
  }
}
```

## Database Schema

### Blueprints Table
```sql
CREATE TABLE blueprints (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_cloud VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    current_version INT DEFAULT 1,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

### Blueprint Versions Table
```sql
CREATE TABLE blueprint_versions (
    id UUID PRIMARY KEY,
    blueprint_id UUID REFERENCES blueprints(id),
    version_number INT NOT NULL,
    graph_data JSONB NOT NULL,
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Components Table
```sql
CREATE TABLE components (
    id UUID PRIMARY KEY,
    blueprint_id UUID REFERENCES blueprints(id),
    version_id UUID REFERENCES blueprint_versions(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    provider VARCHAR(100),
    properties JSONB,
    deleted_at TIMESTAMP
);
```

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=iac_dharma
DB_USER=dharma_admin
DB_PASSWORD=<secure-password>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=<secure-secret-key>  # REQUIRED - must be set!

# Logging
LOG_LEVEL=info
```

## Installation

### Local Development

```bash
# Navigate to service directory
cd backend/blueprint-service

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
nano .env

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

### Docker

```bash
# Build image
docker build -t blueprint-service .

# Run container
docker run -p 3001:3001 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  -e JWT_SECRET=your-secret-key \
  blueprint-service
```

### Docker Compose

Already configured in root `docker-compose.yml`:

```bash
docker-compose up -d blueprint-service
```

## Security

### Authentication
- JWT-based authentication required for all endpoints
- Tokens must include: `id`, `tenantId`, `role`, `username`
- No hardcoded secrets (enforced via Snyk)

### Multi-Tenancy
- All queries filtered by `tenant_id`
- Complete data isolation between tenants
- User context from JWT token

### Data Protection
- Soft deletes (data never permanently removed)
- Audit fields: `created_by`, `updated_by`, `deleted_by`
- Timestamps: `created_at`, `updated_at`, `deleted_at`

## Performance

### Caching Strategy
- Blueprint reads cached for 5 minutes
- Cache invalidation on updates/deletes
- Redis for distributed caching

### Query Optimization
- Indexed columns: `id`, `tenant_id`, `created_at`, `status`
- JSONB GIN indexes on `graph_data`
- Connection pooling (max 20 connections)

### Pagination
- Default: 20 items per page
- Maximum: 100 items per page
- Total count included in response

## Integration

### Used By

**Automation Engine**:
- Creates blueprints from AI generation
- Retrieves blueprints for workflow execution
- Checks analysis for auto-approval

**Monitoring Service**:
- Fetches blueprint state for drift detection
- Compares actual vs expected state

**IaC Generator**:
- Reads blueprint graph data
- Converts components to IaC templates

**Frontend (Lotus Base UI)**:
- CRUD operations via API Gateway
- Drag-and-drop designer updates blueprints
- Version history display

## Error Handling

### Error Responses

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Security scan
snyk test
```

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Metrics
- Request count by endpoint
- Response times
- Cache hit/miss ratio
- Database connection pool usage

### Logs
Structured JSON logging with Winston:
```json
{
  "timestamp": "2025-11-15T10:00:00Z",
  "level": "info",
  "message": "Blueprint created",
  "blueprintId": "bp-123",
  "tenantId": "tenant-456",
  "userId": "user-789"
}
```

## Troubleshooting

### Database Connection Issues
```bash
# Check database connectivity
psql -h localhost -U dharma_admin -d iac_dharma

# Check connection pool
# Watch logs for connection errors
docker-compose logs blueprint-service
```

### Redis Connection Issues
```bash
# Check Redis connectivity
redis-cli -h localhost ping

# Clear cache
redis-cli -h localhost FLUSHDB
```

### JWT Token Errors
- Ensure `JWT_SECRET` is set and matches API Gateway
- Check token expiration
- Verify token includes required fields

## Related Services

- [API Gateway](../api-gateway/README.md) - Routes requests to this service
- [Automation Engine](../automation-engine/README.md) - Orchestrates blueprint workflows
- [IaC Generator](../iac-generator/README.md) - Converts blueprints to code
- [Monitoring Service](../monitoring-service/README.md) - Drift detection

## References

- [Architecture Documentation](../../docs/architecture/README.md)
- [Database Schemas](../../database/schemas/)
- [API Gateway Integration](../api-gateway/README.md)
