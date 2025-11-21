# Configuration

Complete configuration guide for IAC Dharma platform.

---

## Environment Variables

### Core Settings

```bash
# Node Environment
NODE_ENV=production|development|staging
LOG_LEVEL=error|warn|info|debug
LOG_FORMAT=json|text

# Application
APP_NAME=iac-dharma
APP_VERSION=1.0.0
APP_PORT=3000
```

### Database Configuration

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_POOL_SIZE=20
DATABASE_POOL_IDLE_TIMEOUT=30000
DATABASE_SSL=true

# Alternative format
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=iac_dharma
```

### Redis Configuration

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600
REDIS_MAX_RETRIES=3
```

### Authentication

```bash
# JWT
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=24h
JWT_ALGORITHM=HS256

# SSO
SSO_ENABLED=true
SAML_ENTRY_POINT=https://idp.example.com/saml
SAML_ISSUER=iac-dharma
SAML_CERT_PATH=/path/to/cert.pem
```

### Cloud Providers

```bash
# AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=secret
AWS_REGION=us-east-1

# Azure
AZURE_SUBSCRIPTION_ID=...
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...

# GCP
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GCP_PROJECT_ID=your-project-id
```

### Monitoring

```bash
# Prometheus
PROMETHEUS_PORT=9090
PROMETHEUS_SCRAPE_INTERVAL=15s

# Grafana
GRAFANA_PORT=3030
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# Jaeger
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
JAEGER_SAMPLING_RATE=0.1
```

---

## Service Configuration Files

### API Gateway (backend/api-gateway/config/)

**config.ts**:
```typescript
export default {
  port: process.env.API_GATEWAY_PORT || 3000,
  rateLimit: {
    windowMs: 60000,
    max: parseInt(process.env.API_RATE_LIMIT || '100')
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
```

### Docker Compose

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-iac_dharma}
```

---

## Best Practices

1. **Use environment-specific .env files**
2. **Never commit secrets to git**
3. **Use secret management tools** (Vault, AWS Secrets Manager)
4. **Rotate credentials regularly**
5. **Use strong passwords** (minimum 16 characters)

---

Last Updated: November 21, 2025 | [Back to Home](Home)
