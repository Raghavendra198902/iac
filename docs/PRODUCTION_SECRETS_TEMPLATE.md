# Production Secrets Template
# Copy this file to .env.production and fill in actual values
# NEVER commit .env.production to version control!

#═══════════════════════════════════════════════════════════════════
# CRITICAL: Generate Strong Passwords
# Use: openssl rand -hex 32
#═══════════════════════════════════════════════════════════════════

#───────────────────────────────────────────────────────────────────
# PostgreSQL Configuration
#───────────────────────────────────────────────────────────────────
POSTGRES_USER=iac_user
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE
POSTGRES_DB=iac_platform
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Connection string
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=require

# Database pool settings
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000

#───────────────────────────────────────────────────────────────────
# Redis Configuration
#───────────────────────────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD_HERE
REDIS_DB=0

# Redis URL
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}

# Redis cache settings
REDIS_CACHE_TTL=300
REDIS_MAX_RETRIES=3

#───────────────────────────────────────────────────────────────────
# Neo4j Configuration
#───────────────────────────────────────────────────────────────────
NEO4J_USER=neo4j
NEO4J_PASSWORD=CHANGE_ME_NEO4J_PASSWORD_HERE
NEO4J_URI=bolt://neo4j:7687

# Neo4j auth string
NEO4J_AUTH=${NEO4J_USER}/${NEO4J_PASSWORD}

#───────────────────────────────────────────────────────────────────
# HashiCorp Vault Configuration
#───────────────────────────────────────────────────────────────────
VAULT_ADDR=https://vault:8200
VAULT_TOKEN=CHANGE_ME_VAULT_ROOT_TOKEN_HERE
VAULT_SKIP_VERIFY=false

# Vault namespace (Enterprise only)
VAULT_NAMESPACE=

# Vault secrets path
VAULT_SECRETS_PATH=secret/iac-platform

#───────────────────────────────────────────────────────────────────
# API Keys & Tokens
#───────────────────────────────────────────────────────────────────
# Generate with: openssl rand -hex 32

# RBAC Service API Key
RBAC_API_KEY=CHANGE_ME_RBAC_API_KEY_HERE

# API Gateway Secret
API_GATEWAY_SECRET=CHANGE_ME_API_GATEWAY_SECRET_HERE

# ML Engine API Key
ML_API_KEY=CHANGE_ME_ML_API_KEY_HERE

# Self-Healing Engine API Key
SELF_HEALING_API_KEY=CHANGE_ME_SELF_HEALING_KEY_HERE

# JWT Secret for authentication
JWT_SECRET=CHANGE_ME_JWT_SECRET_HERE
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=CHANGE_ME_JWT_REFRESH_SECRET_HERE
JWT_REFRESH_EXPIRY=7d

#───────────────────────────────────────────────────────────────────
# Frontend Configuration
#───────────────────────────────────────────────────────────────────
# Public URLs (accessed by browser)
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_RBAC_URL=https://yourdomain.com/rbac
NEXT_PUBLIC_GRAFANA_URL=https://yourdomain.com/grafana
NEXT_PUBLIC_JAEGER_URL=https://yourdomain.com/jaeger

# Next.js secret
NEXTAUTH_SECRET=CHANGE_ME_NEXTAUTH_SECRET_HERE
NEXTAUTH_URL=https://yourdomain.com

#───────────────────────────────────────────────────────────────────
# SSL/TLS Configuration
#───────────────────────────────────────────────────────────────────
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/server.crt
SSL_KEY_PATH=/etc/ssl/private/server.key
SSL_CA_PATH=/etc/ssl/certs/ca.crt

# Force HTTPS
FORCE_HTTPS=true

#───────────────────────────────────────────────────────────────────
# Kafka Configuration
#───────────────────────────────────────────────────────────────────
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=iac-platform
KAFKA_GROUP_ID=iac-platform-group

# Kafka SASL (if using authentication)
KAFKA_SASL_MECHANISM=PLAIN
KAFKA_SASL_USERNAME=CHANGE_ME_KAFKA_USERNAME
KAFKA_SASL_PASSWORD=CHANGE_ME_KAFKA_PASSWORD

#───────────────────────────────────────────────────────────────────
# Email Configuration (for alerts)
#───────────────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=CHANGE_ME_SMTP_PASSWORD_HERE
SMTP_FROM=noreply@yourdomain.com

#───────────────────────────────────────────────────────────────────
# Monitoring & Alerting
#───────────────────────────────────────────────────────────────────
# Grafana admin credentials
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=CHANGE_ME_GRAFANA_PASSWORD_HERE

# Prometheus
PROMETHEUS_RETENTION=30d

# PagerDuty (optional)
PAGERDUTY_INTEGRATION_KEY=

# Slack (optional)
SLACK_WEBHOOK_URL=
SLACK_CHANNEL=#platform-alerts

#───────────────────────────────────────────────────────────────────
# Cloud Provider Credentials
#───────────────────────────────────────────────────────────────────

# AWS
AWS_ACCESS_KEY_ID=CHANGE_ME_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=CHANGE_ME_AWS_SECRET_KEY
AWS_REGION=us-east-1

# Azure
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_SUBSCRIPTION_ID=

# GCP
GCP_PROJECT_ID=
GCP_SERVICE_ACCOUNT_KEY=

#───────────────────────────────────────────────────────────────────
# External Integrations
#───────────────────────────────────────────────────────────────────

# GitHub
GITHUB_TOKEN=CHANGE_ME_GITHUB_PAT_HERE
GITHUB_ORG=your-org

# GitLab
GITLAB_TOKEN=
GITLAB_URL=https://gitlab.com

# Jira
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@domain.com
JIRA_API_TOKEN=CHANGE_ME_JIRA_TOKEN_HERE

#───────────────────────────────────────────────────────────────────
# Application Settings
#───────────────────────────────────────────────────────────────────
NODE_ENV=production
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=1000

# Session
SESSION_SECRET=CHANGE_ME_SESSION_SECRET_HERE
SESSION_TIMEOUT=3600

# CORS
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

#───────────────────────────────────────────────────────────────────
# Backup Configuration
#───────────────────────────────────────────────────────────────────
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=iac-platform-backups
BACKUP_ENCRYPTION_KEY=CHANGE_ME_BACKUP_ENCRYPTION_KEY_HERE

#───────────────────────────────────────────────────────────────────
# Feature Flags
#───────────────────────────────────────────────────────────────────
FEATURE_ML_PREDICTIONS=true
FEATURE_AUTO_HEALING=true
FEATURE_DISTRIBUTED_TRACING=true
FEATURE_AUDIT_LOGGING=true

#───────────────────────────────────────────────────────────────────
# Security Settings
#───────────────────────────────────────────────────────────────────
# MFA
MFA_ENABLED=true
MFA_ISSUER=IaC Platform

# Password policy
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_UPPERCASE=true

# Session security
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict

#───────────────────────────────────────────────────────────────────
# Performance Settings
#───────────────────────────────────────────────────────────────────
# Cache
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=300

# Compression
COMPRESSION_ENABLED=true
COMPRESSION_THRESHOLD=1024

# Request timeout
REQUEST_TIMEOUT=30000

#───────────────────────────────────────────────────────────────────
# Distributed Tracing
#───────────────────────────────────────────────────────────────────
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6831
JAEGER_SAMPLER_TYPE=probabilistic
JAEGER_SAMPLER_PARAM=0.1

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318
OTEL_SERVICE_NAME=iac-platform

#───────────────────────────────────────────────────────────────────
# ML Model Configuration
#───────────────────────────────────────────────────────────────────
ML_MODEL_PATH=/app/models
ML_MODEL_VERSION=v1.0
ML_PREDICTION_THRESHOLD=0.7
ML_TRAINING_ENABLED=false

#───────────────────────────────────────────────────────────────────
# Resource Limits
#───────────────────────────────────────────────────────────────────
# Memory limits (MB)
MEMORY_LIMIT_RBAC=2048
MEMORY_LIMIT_API_GATEWAY=2048
MEMORY_LIMIT_AIOPS=4096
MEMORY_LIMIT_FRONTEND=2048

# CPU limits (cores)
CPU_LIMIT_RBAC=2
CPU_LIMIT_API_GATEWAY=2
CPU_LIMIT_AIOPS=4
CPU_LIMIT_FRONTEND=2

#═══════════════════════════════════════════════════════════════════
# NOTES:
#═══════════════════════════════════════════════════════════════════
# 1. Replace all "CHANGE_ME_*" values with actual secrets
# 2. Use strong passwords (minimum 32 characters)
# 3. Generate secrets with: openssl rand -hex 32
# 4. Store master copy in secure vault (e.g., HashiCorp Vault)
# 5. Never commit this file to version control
# 6. Add .env.production to .gitignore
# 7. Rotate secrets regularly (every 90 days recommended)
# 8. Use different secrets for each environment
# 9. Audit access to secrets regularly
# 10. Enable secrets encryption at rest
#═══════════════════════════════════════════════════════════════════
