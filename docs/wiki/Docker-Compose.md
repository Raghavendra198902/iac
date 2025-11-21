# Docker Compose

Running IAC Dharma with Docker Compose.

---

## Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Service Architecture

```yaml
services:
  # Core Services
  - postgres (Database)
  - redis (Cache)
  
  # Backend Services  
  - api-gateway (:3000)
  - blueprint-service (:3001)
  - iac-generator (:3002)
  - guardrails-engine (:3003)
  - costing-service (:3004)
  - orchestrator-service (:3005)
  - automation-engine (:3006)
  - monitoring-service (:3007)
  - sso-service (:3012)
  - cloud-provider-service (:3010)
  - ai-recommendations-service (:3011)
  - ai-engine (:8000)
  - cmdb-agent
  
  # Monitoring
  - prometheus (:9090)
  - grafana (:3030)
  - jaeger (:16686)
  
  # Frontend
  - frontend (:5173)
```

---

## Common Commands

### Service Management

```bash
# Start specific service
docker-compose up -d api-gateway

# Restart service
docker-compose restart api-gateway

# View service logs
docker-compose logs api-gateway

# Follow logs
docker-compose logs -f api-gateway

# View last 100 lines
docker-compose logs --tail=100 api-gateway
```

### Debugging

```bash
# Execute command in container
docker-compose exec api-gateway sh

# View running processes
docker-compose exec api-gateway ps aux

# Check service health
docker-compose ps

# Inspect service
docker inspect iac_api-gateway_1
```

### Rebuilding

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build api-gateway

# Build without cache
docker-compose build --no-cache api-gateway

# Pull latest images
docker-compose pull
```

---

## Environment Configurations

### Development
```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d

# Override with local changes
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

### Production
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With specific env file
docker-compose --env-file .env.production up -d
```

---

## Scaling Services

```bash
# Scale API Gateway to 3 instances
docker-compose up -d --scale api-gateway=3

# Scale multiple services
docker-compose up -d \
  --scale api-gateway=3 \
  --scale blueprint-service=2 \
  --scale iac-generator=2
```

---

## Networking

```bash
# View networks
docker network ls

# Inspect network
docker network inspect iac_default

# Connect service to network
docker network connect iac_default external-service
```

---

## Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect iac_postgres_data

# Backup volume
docker run --rm -v iac_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v iac_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

---

## Troubleshooting

### Container Exits Immediately
```bash
# Check logs
docker-compose logs api-gateway

# Check exit code
docker-compose ps

# Run interactively
docker-compose run --rm api-gateway sh
```

### Port Conflicts
```bash
# Find process using port
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Use different port
API_GATEWAY_PORT=3001 docker-compose up -d
```

### Out of Memory
```bash
# Increase memory limit
docker-compose up -d \
  -m 2g \
  --memory-swap 4g
```

---

## Best Practices

1. **Use .env files** for configuration
2. **Don't run as root** inside containers
3. **Use health checks** for all services
4. **Limit resources** with mem_limit and cpus
5. **Use named volumes** for persistence
6. **Keep images small** with multi-stage builds
7. **Use docker-compose.override.yml** for local development

---

Last Updated: November 21, 2025 | [Back to Home](Home)
