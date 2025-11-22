# Configuration

> **Complete Configuration Reference** - Enterprise-grade configuration management for IAC Dharma platform

[![Configuration](https://img.shields.io/badge/Config-Enterprise-blue.svg)](Configuration)
[![Security](https://img.shields.io/badge/Security-Hardened-green.svg)](Security-Best-Practices)
[![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen.svg)](Home)

---

## 🎯 Quick Navigation

| 🔧 **Environment** | 🔐 **Security** | ☁️ **Cloud** | 📊 **Monitoring** |
|-------------------|-----------------|--------------|------------------|
| [Core Settings](#core-settings) | [Authentication](#authentication-configuration) | [AWS](#aws-configuration) | [Prometheus](#prometheus-configuration) |
| [Database](#database-configuration) | [Secrets Management](#secrets-management) | [Azure](#azure-configuration) | [Grafana](#grafana-configuration) |
| [Redis](#redis-configuration) | [Encryption](#encryption-settings) | [GCP](#gcp-configuration) | [Jaeger](#jaeger-configuration) |
| [Services](#microservices-configuration) | [SSL/TLS](#ssltls-configuration) | [Multi-Cloud](#multi-cloud-settings) | [Logging](#logging-configuration) |

---

## 📚 Table of Contents

- [Environment Variables](#environment-variables)
  - [Core Settings](#core-settings)
  - [Database Configuration](#database-configuration)
  - [Redis Configuration](#redis-configuration)
  - [Authentication Configuration](#authentication-configuration)
  - [Cloud Provider Configuration](#cloud-provider-configuration)
  - [Monitoring Configuration](#monitoring-configuration)
- [Microservices Configuration](#microservices-configuration)
- [Environment-Specific Configurations](#environment-specific-configurations)
- [Secrets Management](#secrets-management)
- [Configuration Validation](#configuration-validation)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [See Also](#see-also)

---

## 🌟 Overview

IAC Dharma uses a **hierarchical configuration system** with environment variables, configuration files, and runtime overrides. This guide covers all configuration options for production, staging, and development environments.

### Configuration Hierarchy

```
1. Runtime Overrides (Highest Priority)
   ├─ Command-line arguments
   └─ Dynamic feature flags

2. Environment Variables
   ├─ .env files (environment-specific)
   └─ System environment variables

3. Configuration Files
   ├─ Service-specific config files
   └─ docker-compose.yml / K8s manifests

4. Default Values (Lowest Priority)
   └─ Hardcoded defaults in source code
```

---

## 🔧 Environment Variables

### Core Settings

**Node.js Runtime Configuration**

```bash
# ===================================
# CORE APPLICATION SETTINGS
# ===================================

# Environment (affects logging, caching, error handling)
NODE_ENV=production              # Options: production | development | staging | test
NODE_OPTIONS=--max-old-space-size=4096  # Increase heap size for large workloads

# Logging Configuration
LOG_LEVEL=info                   # Options: error | warn | info | debug | trace
LOG_FORMAT=json                  # Options: json | text | pretty
LOG_OUTPUT=stdout                # Options: stdout | file | both
LOG_FILE_PATH=/var/log/iac-dharma/app.log
LOG_MAX_SIZE=50m                 # Maximum log file size before rotation
LOG_MAX_FILES=10                 # Number of log files to retain

# Application Metadata
APP_NAME=iac-dharma
APP_VERSION=1.0.0
APP_ENV=production
APP_PORT=3000                    # Default port for API Gateway
APP_HOST=0.0.0.0                 # Bind to all interfaces

# Timezone and Locale
TZ=UTC                           # Server timezone (always use UTC in production)
LOCALE=en_US.UTF-8

# Process Management
WORKER_PROCESSES=4               # Number of Node.js worker processes (recommended: CPU cores)
WORKER_RESTART_DELAY=5000        # Delay before restarting failed workers (ms)

# Performance Settings
MAX_REQUEST_SIZE=10mb            # Maximum request body size
REQUEST_TIMEOUT=30000            # Request timeout in milliseconds
KEEP_ALIVE_TIMEOUT=65000         # Keep-alive timeout (slightly higher than load balancer)

# Feature Flags
ENABLE_SWAGGER_UI=true           # Enable API documentation UI
ENABLE_CORS=true                 # Enable Cross-Origin Resource Sharing
ENABLE_COMPRESSION=true          # Enable gzip/brotli compression
ENABLE_REQUEST_LOGGING=true      # Log all HTTP requests
ENABLE_RATE_LIMITING=true        # Enable rate limiting
ENABLE_CIRCUIT_BREAKER=true      # Enable circuit breaker pattern
```

**Environment-Specific Examples**

<details>
<summary><b>Development Environment (.env.development)</b></summary>

```bash
NODE_ENV=development
LOG_LEVEL=debug
LOG_FORMAT=pretty
APP_PORT=3000

# Enable debugging tools
ENABLE_SWAGGER_UI=true
ENABLE_HOT_RELOAD=true
ENABLE_SOURCE_MAPS=true
DISABLE_AUTH=false               # Set to true only for local testing

# Relaxed settings for local development
REQUEST_TIMEOUT=60000            # Longer timeout for debugging
RATE_LIMIT_MAX=1000              # Higher rate limit for testing
```
</details>

<details>
<summary><b>Staging Environment (.env.staging)</b></summary>

```bash
NODE_ENV=staging
LOG_LEVEL=info
LOG_FORMAT=json
APP_PORT=3000

# Production-like settings with debugging enabled
ENABLE_SWAGGER_UI=true
ENABLE_REQUEST_LOGGING=true
ENABLE_PERFORMANCE_PROFILING=true

# Moderate timeouts and limits
REQUEST_TIMEOUT=30000
RATE_LIMIT_MAX=500
```
</details>

<details>
<summary><b>Production Environment (.env.production)</b></summary>

```bash
NODE_ENV=production
LOG_LEVEL=warn                   # Only warnings and errors
LOG_FORMAT=json                  # Structured logging for aggregation
APP_PORT=3000

# Production hardening
ENABLE_SWAGGER_UI=false          # Disable in production
ENABLE_REQUEST_LOGGING=false     # Use reverse proxy logging
ENABLE_SECURITY_HEADERS=true     # Helmet.js security headers
ENABLE_CSRF_PROTECTION=true      # CSRF token validation

# Strict timeouts and limits
REQUEST_TIMEOUT=30000
RATE_LIMIT_MAX=100
CONNECTION_POOL_MIN=10
CONNECTION_POOL_MAX=50
```
</details>

---

### Database Configuration

**PostgreSQL Settings**

```bash
# ===================================
# POSTGRESQL CONFIGURATION
# ===================================

# Connection String (Recommended for simplicity)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name?sslmode=require

# OR Individual Settings (More granular control)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=iac_dharma

# Connection Pool Configuration
DATABASE_POOL_SIZE=20            # Maximum connections in pool (recommended: 20-50)
DATABASE_POOL_MIN=5              # Minimum idle connections
DATABASE_POOL_IDLE_TIMEOUT=30000 # Idle connection timeout (ms)
DATABASE_POOL_ACQUIRE_TIMEOUT=60000  # Max time to acquire connection (ms)
DATABASE_POOL_EVICTION_RUN_INTERVAL=10000  # Pool cleanup interval (ms)

# SSL/TLS Configuration
DATABASE_SSL=true                # Enable SSL connections
DATABASE_SSL_REJECT_UNAUTHORIZED=true  # Verify SSL certificates
DATABASE_SSL_CA_PATH=/path/to/ca-cert.pem
DATABASE_SSL_CLIENT_CERT_PATH=/path/to/client-cert.pem
DATABASE_SSL_CLIENT_KEY_PATH=/path/to/client-key.pem

# Query Configuration
DATABASE_STATEMENT_TIMEOUT=30000  # Query timeout (ms)
DATABASE_IDLE_TRANSACTION_TIMEOUT=60000  # Idle transaction timeout
DATABASE_LOG_QUERIES=false       # Log all queries (enable for debugging only)
DATABASE_LOG_SLOW_QUERIES=true   # Log slow queries
DATABASE_SLOW_QUERY_THRESHOLD=1000  # Threshold for slow query logging (ms)

# Replication (for read replicas)
DATABASE_REPLICA_URL=postgresql://username:password@replica-hostname:5432/database_name?sslmode=require
DATABASE_REPLICA_POOL_SIZE=10
DATABASE_READ_WRITE_SPLIT=true   # Automatically route reads to replicas

# Backup and Maintenance
DATABASE_BACKUP_ENABLED=true
DATABASE_BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
DATABASE_BACKUP_RETENTION_DAYS=30
DATABASE_AUTO_VACUUM=true

# Migration Settings
RUN_MIGRATIONS=true              # Auto-run migrations on startup
MIGRATION_TABLE=schema_migrations
```

**Connection String Format Examples**

```bash
# Local Development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iac_dharma

# AWS RDS
DATABASE_URL=postgresql://admin:SecurePass123@my-rds-instance.abc123.us-east-1.rds.amazonaws.com:5432/iac_dharma?sslmode=require

# Azure Database for PostgreSQL
DATABASE_URL=postgresql://adminuser@myserver:ComplexPass@myserver.postgres.database.azure.com:5432/iac_dharma?sslmode=require

# GCP Cloud SQL
DATABASE_URL=postgresql://postgres:password@/iac_dharma?host=/cloudsql/project:region:instance

# With Connection Pooling (PgBouncer)
DATABASE_URL=postgresql://user:pass@pgbouncer-host:6432/iac_dharma?pgbouncer=true
```

---

### Redis Configuration

**Cache and Session Store Settings**

```bash
# ===================================
# REDIS CONFIGURATION
# ===================================

# Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                  # Leave empty if no password
REDIS_DB=0                       # Database number (0-15)
REDIS_USERNAME=                  # For Redis 6+ ACL

# Connection URL (Alternative format)
REDIS_URL=redis://:password@hostname:6379/0

# Connection Pool
REDIS_MAX_CONNECTIONS=50
REDIS_MIN_CONNECTIONS=10
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000           # Delay between retries (ms)
REDIS_CONNECT_TIMEOUT=10000      # Connection timeout (ms)
REDIS_COMMAND_TIMEOUT=5000       # Command timeout (ms)

# High Availability (Sentinel)
REDIS_SENTINEL_ENABLED=false
REDIS_SENTINEL_HOSTS=sentinel1:26379,sentinel2:26379,sentinel3:26379
REDIS_SENTINEL_MASTER_NAME=mymaster

# Cluster Configuration
REDIS_CLUSTER_ENABLED=false
REDIS_CLUSTER_NODES=node1:6379,node2:6379,node3:6379

# SSL/TLS
REDIS_TLS_ENABLED=false
REDIS_TLS_CA_PATH=/path/to/ca-cert.pem
REDIS_TLS_CERT_PATH=/path/to/client-cert.pem
REDIS_TLS_KEY_PATH=/path/to/client-key.pem

# Caching Strategy
REDIS_TTL=3600                   # Default TTL for cached items (seconds)
REDIS_CACHE_PREFIX=iac:          # Key prefix for namespacing
REDIS_ENABLE_OFFLINE_QUEUE=true  # Queue commands when disconnected

# Session Management
REDIS_SESSION_TTL=86400          # Session TTL (24 hours)
REDIS_SESSION_PREFIX=sess:

# Feature Flags (stored in Redis)
REDIS_FEATURE_FLAG_PREFIX=flag:
REDIS_FEATURE_FLAG_REFRESH=60    # Refresh interval (seconds)

# Performance
REDIS_KEY_COMPRESSION=true       # Compress large values
REDIS_KEY_COMPRESSION_THRESHOLD=1024  # Compress if value > 1KB
```

**Redis Connection Examples**

```bash
# Local Development
REDIS_URL=redis://localhost:6379

# AWS ElastiCache (no password)
REDIS_URL=redis://my-cluster.abc123.ng.0001.use1.cache.amazonaws.com:6379

# AWS ElastiCache (with in-transit encryption)
REDIS_URL=rediss://my-cluster.abc123.clustercfg.use1.cache.amazonaws.com:6379

# Azure Cache for Redis
REDIS_URL=rediss://:AccessKey@mycache.redis.cache.windows.net:6380

# Redis Sentinel
REDIS_SENTINEL_ENABLED=true
REDIS_SENTINEL_HOSTS=10.0.1.1:26379,10.0.1.2:26379,10.0.1.3:26379
REDIS_SENTINEL_MASTER_NAME=mymaster

# Redis Cluster
REDIS_CLUSTER_ENABLED=true
REDIS_CLUSTER_NODES=10.0.1.1:6379,10.0.1.2:6379,10.0.1.3:6379,10.0.1.4:6379,10.0.1.5:6379,10.0.1.6:6379
```

---

### Authentication Configuration

**JWT, SSO, and Identity Management**

```bash
# ===================================
# JWT AUTHENTICATION
# ===================================

# JWT Settings
JWT_SECRET=your-256-bit-secret-key-change-this-in-production
JWT_ALGORITHM=RS256               # Options: HS256 | HS384 | HS512 | RS256 | RS384 | RS512 | ES256
JWT_EXPIRES_IN=24h               # Token expiration (format: 1d, 12h, 30m, etc.)
JWT_REFRESH_EXPIRES_IN=7d        # Refresh token expiration
JWT_ISSUER=iac-dharma
JWT_AUDIENCE=iac-dharma-api

# RSA Keys (for RS256 algorithm - more secure)
JWT_PRIVATE_KEY_PATH=/path/to/private-key.pem
JWT_PUBLIC_KEY_PATH=/path/to/public-key.pem

# Token Management
JWT_ALLOW_REFRESH=true
JWT_BLACKLIST_ENABLED=true       # Enable token revocation
JWT_BLACKLIST_REDIS_PREFIX=jwt:blacklist:

# ===================================
# SSO / SAML 2.0 CONFIGURATION
# ===================================

SSO_ENABLED=true
SSO_PROVIDER=saml                # Options: saml | oauth2 | oidc | ldap

# SAML 2.0 Settings
SAML_ENTRY_POINT=https://idp.example.com/saml/sso
SAML_ISSUER=iac-dharma
SAML_CALLBACK_URL=https://your-domain.com/auth/saml/callback
SAML_LOGOUT_URL=https://idp.example.com/saml/logout
SAML_CERT_PATH=/path/to/idp-cert.pem
SAML_PRIVATE_KEY_PATH=/path/to/sp-private-key.pem
SAML_IDENTIFIER_FORMAT=urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
SAML_SIGN_REQUESTS=true
SAML_WANT_ASSERTIONS_SIGNED=true

# ===================================
# OAUTH 2.0 / OIDC CONFIGURATION
# ===================================

OAUTH_ENABLED=true
OAUTH_PROVIDER=okta              # Options: okta | auth0 | azure-ad | google | github

# OAuth Client Configuration
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_AUTHORIZATION_URL=https://your-domain.okta.com/oauth2/v1/authorize
OAUTH_TOKEN_URL=https://your-domain.okta.com/oauth2/v1/token
OAUTH_USERINFO_URL=https://your-domain.okta.com/oauth2/v1/userinfo
OAUTH_CALLBACK_URL=https://your-domain.com/auth/callback
OAUTH_SCOPE=openid profile email

# Azure AD Specific
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret

# ===================================
# LDAP / ACTIVE DIRECTORY
# ===================================

LDAP_ENABLED=false
LDAP_URL=ldap://ldap.example.com:389
LDAP_BIND_DN=cn=admin,dc=example,dc=com
LDAP_BIND_PASSWORD=admin-password
LDAP_SEARCH_BASE=ou=users,dc=example,dc=com
LDAP_SEARCH_FILTER=(uid={{username}})
LDAP_TLS_ENABLED=true
LDAP_TLS_REJECT_UNAUTHORIZED=true

# ===================================
# API KEY AUTHENTICATION
# ===================================

API_KEY_ENABLED=true
API_KEY_HEADER=X-API-Key         # Header name for API key
API_KEY_PREFIX=iac_               # Prefix for generated keys
API_KEY_LENGTH=32                # Length of generated keys
API_KEY_RATE_LIMIT=100           # Requests per minute per key

# ===================================
# MULTI-FACTOR AUTHENTICATION
# ===================================

MFA_ENABLED=false
MFA_ISSUER=IAC-Dharma
MFA_TOTP_WINDOW=1                # Time window for TOTP validation
MFA_BACKUP_CODES_COUNT=10        # Number of backup codes to generate
```

---

### Cloud Provider Configuration

#### AWS Configuration

```bash
# ===================================
# AWS CONFIGURATION
# ===================================

# Authentication (Method 1: Access Keys)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SESSION_TOKEN=                # Optional, for temporary credentials

# Authentication (Method 2: IAM Role - Recommended for EC2/ECS)
AWS_IAM_ROLE_ARN=arn:aws:iam::123456789012:role/IACDharmaRole
AWS_USE_IAM_ROLE=true

# Default Region and Settings
AWS_REGION=us-east-1
AWS_DEFAULT_REGION=us-east-1
AWS_AVAILABILITY_ZONES=us-east-1a,us-east-1b,us-east-1c

# SDK Configuration
AWS_SDK_LOAD_CONFIG=1            # Load configuration from ~/.aws/config
AWS_PROFILE=default              # AWS CLI profile to use
AWS_CONFIG_FILE=/path/to/config
AWS_SHARED_CREDENTIALS_FILE=/path/to/credentials

# API Settings
AWS_MAX_ATTEMPTS=3               # Maximum retry attempts
AWS_RETRY_MODE=adaptive          # Options: legacy | standard | adaptive
AWS_REQUEST_TIMEOUT=60000        # Request timeout (ms)
AWS_CONNECTION_TIMEOUT=10000     # Connection timeout (ms)

# Service-Specific Settings
AWS_S3_BUCKET=iac-dharma-artifacts
AWS_S3_REGION=us-east-1
AWS_S3_ENDPOINT=                 # Custom S3 endpoint (for MinIO, LocalStack)
AWS_S3_FORCE_PATH_STYLE=false    # Use path-style URLs

AWS_EC2_ENDPOINT=
AWS_RDS_ENDPOINT=
AWS_LAMBDA_ENDPOINT=

# Cost and Resource Tags
AWS_DEFAULT_TAGS='{"Environment":"production","Project":"iac-dharma","ManagedBy":"terraform"}'

# Assume Role Configuration (for cross-account access)
AWS_ASSUME_ROLE_ARN=arn:aws:iam::987654321098:role/CrossAccountRole
AWS_ASSUME_ROLE_EXTERNAL_ID=external-id-12345
AWS_ASSUME_ROLE_SESSION_NAME=iac-dharma-session
```

#### Azure Configuration

```bash
# ===================================
# AZURE CONFIGURATION
# ===================================

# Authentication (Service Principal)
AZURE_SUBSCRIPTION_ID=12345678-1234-1234-1234-123456789012
AZURE_TENANT_ID=87654321-4321-4321-4321-210987654321
AZURE_CLIENT_ID=abcdef12-ab12-ab12-ab12-abcdef123456
AZURE_CLIENT_SECRET=your-client-secret

# Authentication (Managed Identity - Recommended for Azure VMs)
AZURE_USE_MANAGED_IDENTITY=false
AZURE_MANAGED_IDENTITY_CLIENT_ID=

# Default Settings
AZURE_LOCATION=eastus
AZURE_RESOURCE_GROUP=iac-dharma-rg
AZURE_ENVIRONMENT=AzurePublicCloud  # Options: AzurePublicCloud | AzureUSGovernment | AzureChinaCloud | AzureGermanCloud

# API Configuration
AZURE_REQUEST_TIMEOUT=60000
AZURE_RETRY_MAX_ATTEMPTS=3
AZURE_RETRY_DELAY=1000

# Storage Account
AZURE_STORAGE_ACCOUNT=iacdharmastorage
AZURE_STORAGE_KEY=your-storage-account-key
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net

# Resource Tags
AZURE_DEFAULT_TAGS='{"Environment":"production","Project":"iac-dharma","CostCenter":"engineering"}'
```

#### GCP Configuration

```bash
# ===================================
# GOOGLE CLOUD PLATFORM CONFIGURATION
# ===================================

# Authentication (Service Account Key File)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}  # Or inline JSON

# Project Settings
GCP_PROJECT_ID=your-project-id
GCP_PROJECT_NUMBER=123456789012
GCP_REGION=us-central1
GCP_ZONE=us-central1-a

# API Configuration
GCP_REQUEST_TIMEOUT=60000
GCP_RETRY_MAX_ATTEMPTS=3
GCP_RETRY_DELAY=1000

# Service-Specific Settings
GCP_STORAGE_BUCKET=iac-dharma-artifacts
GCP_STORAGE_LOCATION=US
GCP_STORAGE_CLASS=STANDARD        # Options: STANDARD | NEARLINE | COLDLINE | ARCHIVE

# Resource Labels
GCP_DEFAULT_LABELS='{"environment":"production","project":"iac-dharma","team":"platform"}'

# Impersonation (for service account impersonation)
GCP_IMPERSONATE_SERVICE_ACCOUNT=target-sa@project-id.iam.gserviceaccount.com
```

#### Multi-Cloud Settings

```bash
# ===================================
# MULTI-CLOUD CONFIGURATION
# ===================================

# Enable multiple cloud providers simultaneously
MULTI_CLOUD_ENABLED=true
PRIMARY_CLOUD_PROVIDER=aws       # Options: aws | azure | gcp
SECONDARY_CLOUD_PROVIDERS=azure,gcp

# Cross-Cloud Networking
ENABLE_CLOUD_PEERING=true
ENABLE_CLOUD_VPN=true

# Cost Management
ENABLE_CROSS_CLOUD_COST_TRACKING=true
COST_ALLOCATION_STRATEGY=proportional  # Options: proportional | fixed | usage-based
```

---

### Monitoring Configuration

#### Prometheus Configuration

```bash
# ===================================
# PROMETHEUS CONFIGURATION
# ===================================

PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
PROMETHEUS_HOST=0.0.0.0

# Scraping Configuration
PROMETHEUS_SCRAPE_INTERVAL=15s   # How often to scrape targets
PROMETHEUS_SCRAPE_TIMEOUT=10s    # Timeout for scraping
PROMETHEUS_EVALUATION_INTERVAL=15s  # How often to evaluate rules

# Retention
PROMETHEUS_RETENTION_TIME=30d    # How long to retain metrics
PROMETHEUS_RETENTION_SIZE=50GB   # Maximum storage size

# Remote Storage (for long-term storage)
PROMETHEUS_REMOTE_WRITE_ENABLED=false
PROMETHEUS_REMOTE_WRITE_URL=https://prometheus-remote-storage.example.com/api/v1/write
PROMETHEUS_REMOTE_READ_URL=https://prometheus-remote-storage.example.com/api/v1/read

# Service Discovery
PROMETHEUS_SD_CONSUL_ENABLED=false
PROMETHEUS_SD_K8S_ENABLED=false
PROMETHEUS_SD_FILE_PATH=/etc/prometheus/targets.json

# Metrics Export
PROMETHEUS_METRICS_PATH=/metrics
PROMETHEUS_METRICS_PREFIX=iac_dharma_
```

#### Grafana Configuration

```bash
# ===================================
# GRAFANA CONFIGURATION
# ===================================

GRAFANA_ENABLED=true
GRAFANA_PORT=3030
GRAFANA_HOST=0.0.0.0

# Authentication
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin     # CHANGE THIS IN PRODUCTION!
GRAFANA_ADMIN_EMAIL=admin@example.com

# Security
GRAFANA_SECRET_KEY=your-secret-key-here
GRAFANA_DISABLE_GRAVATAR=true
GRAFANA_ALLOW_SIGN_UP=false      # Disable self-registration
GRAFANA_AUTO_ASSIGN_ORG=true
GRAFANA_AUTO_ASSIGN_ORG_ROLE=Viewer

# SSO Integration
GRAFANA_AUTH_GENERIC_OAUTH_ENABLED=false
GRAFANA_AUTH_SAML_ENABLED=false

# Data Sources
GRAFANA_DATASOURCE_PROMETHEUS_URL=http://prometheus:9090
GRAFANA_DATASOURCE_LOKI_URL=http://loki:3100

# Dashboards
GRAFANA_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/etc/grafana/dashboards/home.json
GRAFANA_PROVISIONING_PATH=/etc/grafana/provisioning
```

#### Jaeger Configuration

```bash
# ===================================
# JAEGER TRACING CONFIGURATION
# ===================================

JAEGER_ENABLED=true
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
JAEGER_COLLECTOR_ENDPOINT=http://jaeger-collector:14268/api/traces

# Sampling Strategy
JAEGER_SAMPLER_TYPE=probabilistic  # Options: const | probabilistic | rate_limiting | remote
JAEGER_SAMPLER_PARAM=0.1         # Sample 10% of traces (adjust based on traffic)

# Reporter Configuration
JAEGER_REPORTER_LOG_SPANS=false
JAEGER_REPORTER_MAX_QUEUE_SIZE=100
JAEGER_REPORTER_FLUSH_INTERVAL=1000

# Service Name
JAEGER_SERVICE_NAME=iac-dharma-${SERVICE_NAME}  # Dynamic per service

# Tags
JAEGER_TAGS=environment=production,region=us-east-1

# Storage Backend
JAEGER_STORAGE_TYPE=elasticsearch  # Options: memory | cassandra | elasticsearch | kafka
JAEGER_ES_SERVER_URLS=http://elasticsearch:9200
JAEGER_ES_INDEX_PREFIX=jaeger
```

#### Logging Configuration

```bash
# ===================================
# LOGGING CONFIGURATION (LOKI)
# ===================================

LOKI_ENABLED=true
LOKI_URL=http://loki:3100
LOKI_BATCH_SIZE=1024
LOKI_BATCH_WAIT=1s
LOKI_TIMEOUT=10s

# Log Labels
LOKI_LABELS='{"app":"iac-dharma","environment":"production"}'

# Retention
LOKI_RETENTION_ENABLED=true
LOKI_RETENTION_PERIOD=30d
LOKI_COMPACTION_INTERVAL=10m
```

---

## 🎯 Microservices Configuration

### API Gateway Configuration

```bash
# ===================================
# API GATEWAY (Port 3000)
# ===================================

API_GATEWAY_PORT=3000
API_GATEWAY_HOST=0.0.0.0

# Rate Limiting
API_RATE_LIMIT_ENABLED=true
API_RATE_LIMIT_WINDOW_MS=60000   # 1 minute window
API_RATE_LIMIT_MAX=100           # 100 requests per minute
API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=*                    # In production: specify exact origins
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_THRESHOLD=50     # Failure threshold percentage
CIRCUIT_BREAKER_TIMEOUT=30000    # Reset timeout (ms)
CIRCUIT_BREAKER_RESET_TIMEOUT=60000

# Request/Response
REQUEST_SIZE_LIMIT=10mb
RESPONSE_COMPRESSION=true
RESPONSE_COMPRESSION_THRESHOLD=1024

# Proxy Settings
TRUST_PROXY=true                 # Enable if behind load balancer
PROXY_TIMEOUT=30000
```

### Blueprint Service Configuration

```bash
# ===================================
# BLUEPRINT SERVICE (Port 3001)
# ===================================

BLUEPRINT_SERVICE_PORT=3001
BLUEPRINT_CACHE_ENABLED=true
BLUEPRINT_CACHE_TTL=3600
BLUEPRINT_MAX_SIZE=10mb          # Maximum blueprint size
BLUEPRINT_VALIDATION_STRICT=true

# Storage
BLUEPRINT_STORAGE_TYPE=database  # Options: database | s3 | filesystem
BLUEPRINT_S3_BUCKET=iac-blueprints
BLUEPRINT_FILE_PATH=/var/lib/iac-dharma/blueprints
```

### IAC Generator Configuration

```bash
# ===================================
# IAC GENERATOR SERVICE (Port 3002)
# ===================================

IAC_GENERATOR_PORT=3002
IAC_OUTPUT_FORMATS=terraform,cloudformation,pulumi
IAC_TERRAFORM_VERSION=1.6.0
IAC_VALIDATE_OUTPUT=true
IAC_FORMAT_OUTPUT=true
IAC_INCLUDE_COMMENTS=true
```

### Automation Engine Configuration

```bash
# ===================================
# AUTOMATION ENGINE (Port 3003)
# ===================================

AUTOMATION_ENGINE_PORT=3003
AUTOMATION_MAX_CONCURRENT_WORKFLOWS=10
AUTOMATION_WORKFLOW_TIMEOUT=3600000  # 1 hour
AUTOMATION_RETRY_FAILED_TASKS=true
AUTOMATION_MAX_RETRIES=3
```

### Guardrails Engine Configuration

```bash
# ===================================
# GUARDRAILS ENGINE (Port 3004)
# ===================================

GUARDRAILS_ENGINE_PORT=3004
GUARDRAILS_POLICY_ENGINE=opa     # Open Policy Agent
OPA_URL=http://opa:8181
OPA_POLICY_PATH=/v1/data/iac/allow
GUARDRAILS_FAIL_ON_VIOLATION=true
GUARDRAILS_LOG_VIOLATIONS=true
```

### Costing Service Configuration

```bash
# ===================================
# COSTING SERVICE (Port 3005)
# ===================================

COSTING_SERVICE_PORT=3005
COSTING_REFRESH_INTERVAL=3600    # Refresh pricing data every hour
COSTING_CACHE_PRICING_DATA=true
COSTING_INCLUDE_RESERVED_INSTANCES=true
COSTING_INCLUDE_SPOT_INSTANCES=true
COSTING_CURRENCY=USD
```

### SSO Service Configuration

```bash
# ===================================
# SSO SERVICE (Port 3006)
# ===================================

SSO_SERVICE_PORT=3006
SSO_SESSION_TIMEOUT=86400        # 24 hours
SSO_COOKIE_SECURE=true
SSO_COOKIE_HTTP_ONLY=true
SSO_COOKIE_SAME_SITE=strict
```

### Monitoring Service Configuration

```bash
# ===================================
# MONITORING SERVICE (Port 3007)
# ===================================

MONITORING_SERVICE_PORT=3007
MONITORING_HEALTH_CHECK_INTERVAL=30000  # 30 seconds
MONITORING_COLLECT_SYSTEM_METRICS=true
MONITORING_COLLECT_PROCESS_METRICS=true
MONITORING_EXPORT_PROMETHEUS=true
```

### Orchestrator Service Configuration

```bash
# ===================================
# ORCHESTRATOR SERVICE (Port 3008)
# ===================================

ORCHESTRATOR_SERVICE_PORT=3008
ORCHESTRATOR_MAX_PARALLEL_DEPLOYMENTS=5
ORCHESTRATOR_DEPLOYMENT_TIMEOUT=1800000  # 30 minutes
ORCHESTRATOR_ENABLE_ROLLBACK=true
ORCHESTRATOR_LOCK_TIMEOUT=300000  # 5 minutes
```

### Cloud Provider Service Configuration

```bash
# ===================================
# CLOUD PROVIDER SERVICE (Port 3010)
# ===================================

CLOUD_PROVIDER_SERVICE_PORT=3010
CLOUD_PROVIDER_CACHE_ENABLED=true
CLOUD_PROVIDER_CACHE_TTL=300     # 5 minutes for instance types, etc.
CLOUD_PROVIDER_API_TIMEOUT=30000
CLOUD_PROVIDER_MAX_RETRIES=3
```

### AI Engine Configuration

```bash
# ===================================
# AI ENGINE (Port 3011)
# ===================================

AI_ENGINE_PORT=3011
AI_ENGINE_HOST=0.0.0.0

# Model Configuration
AI_MODEL_PATH=/app/models
AI_ENABLE_GPU=false              # Set to true if GPU available
AI_BATCH_SIZE=32
AI_MAX_PREDICTION_TIME=5000      # Maximum time for predictions (ms)

# Cost Prediction Model
AI_COST_MODEL_TYPE=lstm
AI_COST_MODEL_RETRAIN_INTERVAL=86400  # Retrain daily

# Anomaly Detection
AI_ANOMALY_MODEL_TYPE=isolation_forest
AI_ANOMALY_THRESHOLD=0.8

# Recommendations
AI_RECOMMENDATION_MIN_CONFIDENCE=0.7
AI_RECOMMENDATION_MAX_RESULTS=10
```

### CMDB Agent Configuration

```bash
# ===================================
# CMDB AGENT (Port 3012)
# ===================================

CMDB_AGENT_PORT=3012
CMDB_DISCOVERY_INTERVAL=3600     # Discover resources every hour
CMDB_DISCOVERY_ENABLED=true
CMDB_TRACK_CHANGES=true
CMDB_CHANGE_DETECTION_INTERVAL=300  # Check for changes every 5 minutes
```

---

## 🌍 Environment-Specific Configurations

### Development Environment

**File: `.env.development`**

```bash
# Development environment optimized for local development
NODE_ENV=development
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Relaxed security for easier development
DISABLE_AUTH=false               # Keep auth enabled even in dev
API_RATE_LIMIT_MAX=1000
REQUEST_TIMEOUT=120000

# Local services
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iac_dharma_dev
REDIS_URL=redis://localhost:6379

# Cloud providers (use test accounts or LocalStack)
AWS_ENDPOINT=http://localhost:4566  # LocalStack
AZURE_USE_EMULATOR=true
GCP_USE_EMULATOR=true

# Monitoring (optional in development)
PROMETHEUS_ENABLED=false
GRAFANA_ENABLED=false
JAEGER_ENABLED=true
JAEGER_SAMPLER_PARAM=1.0         # Sample 100% in development

# Feature flags
ENABLE_SWAGGER_UI=true
ENABLE_HOT_RELOAD=true
ENABLE_DEBUG_ENDPOINTS=true
```

### Staging Environment

**File: `.env.staging`**

```bash
# Staging environment - production-like with debugging enabled
NODE_ENV=staging
LOG_LEVEL=info
LOG_FORMAT=json

# Moderate security
API_RATE_LIMIT_MAX=500
REQUEST_TIMEOUT=60000

# Staging databases
DATABASE_URL=postgresql://user:password@staging-db.internal:5432/iac_dharma_staging?sslmode=require
REDIS_URL=rediss://:password@staging-redis.internal:6379

# Real cloud providers (staging accounts)
AWS_REGION=us-east-1
AWS_PROFILE=staging
AZURE_ENVIRONMENT=AzurePublicCloud
GCP_PROJECT_ID=iac-dharma-staging

# Full monitoring stack
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
JAEGER_ENABLED=true
JAEGER_SAMPLER_PARAM=0.5         # Sample 50% in staging

# Feature flags
ENABLE_SWAGGER_UI=true           # OK to expose in staging
ENABLE_PERFORMANCE_PROFILING=true
```

### Production Environment

**File: `.env.production`**

```bash
# Production environment - maximum security and performance
NODE_ENV=production
LOG_LEVEL=warn
LOG_FORMAT=json
LOG_OUTPUT=file

# Strict security
API_RATE_LIMIT_MAX=100
REQUEST_TIMEOUT=30000
ENABLE_SECURITY_HEADERS=true
ENABLE_CSRF_PROTECTION=true

# Production databases (high availability)
DATABASE_URL=postgresql://user:$(cat /run/secrets/db_password)@prod-db-cluster:5432/iac_dharma?sslmode=require
DATABASE_POOL_SIZE=50
DATABASE_REPLICA_URL=postgresql://user:$(cat /run/secrets/db_password)@prod-db-replica:5432/iac_dharma?sslmode=require

REDIS_URL=rediss://:$(cat /run/secrets/redis_password)@prod-redis-cluster:6379

# Production cloud accounts
AWS_REGION=us-east-1
AWS_USE_IAM_ROLE=true
AZURE_USE_MANAGED_IDENTITY=true
GCP_PROJECT_ID=iac-dharma-production

# Full monitoring with optimized sampling
PROMETHEUS_ENABLED=true
PROMETHEUS_RETENTION_TIME=90d
GRAFANA_ENABLED=true
GRAFANA_ALLOW_SIGN_UP=false
JAEGER_ENABLED=true
JAEGER_SAMPLER_PARAM=0.01        # Sample 1% in production

# Feature flags
ENABLE_SWAGGER_UI=false          # Disabled in production
ENABLE_DEBUG_ENDPOINTS=false
ENABLE_REQUEST_LOGGING=false     # Use reverse proxy logs
```

---

## 🔐 Secrets Management

### Docker Secrets (Recommended for Docker Swarm)

```bash
# Create secrets
echo "MySecurePassword123" | docker secret create db_password -
echo "RedisPassword456" | docker secret create redis_password -
echo "JWT_SECRET_KEY_789" | docker secret create jwt_secret -

# Use in docker-compose.yml
secrets:
  db_password:
    external: true
  redis_password:
    external: true
  jwt_secret:
    external: true
```

### Kubernetes Secrets

```bash
# Create secrets
kubectl create secret generic db-credentials \
  --from-literal=username=postgres \
  --from-literal=password=MySecurePassword123

kubectl create secret generic redis-credentials \
  --from-literal=password=RedisPassword456

kubectl create secret generic jwt-secret \
  --from-literal=secret=JWT_SECRET_KEY_789

# Use in deployment
env:
  - name: POSTGRES_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: password
```

### HashiCorp Vault Integration

```bash
# Vault configuration
VAULT_ENABLED=true
VAULT_ADDR=https://vault.example.com:8200
VAULT_TOKEN=s.abc123xyz
VAULT_NAMESPACE=iac-dharma
VAULT_MOUNT_PATH=secret
VAULT_ROLE_ID=role-id-here
VAULT_SECRET_ID=secret-id-here

# Vault paths
VAULT_DB_CREDENTIALS_PATH=secret/data/database/credentials
VAULT_REDIS_CREDENTIALS_PATH=secret/data/redis/credentials
VAULT_JWT_SECRET_PATH=secret/data/jwt/secret
VAULT_AWS_CREDENTIALS_PATH=secret/data/aws/credentials
```

### AWS Secrets Manager

```bash
# AWS Secrets Manager configuration
AWS_SECRETS_MANAGER_ENABLED=true
AWS_SECRETS_MANAGER_REGION=us-east-1

# Secret ARNs
AWS_SECRET_DB_CREDENTIALS=arn:aws:secretsmanager:us-east-1:123456789012:secret:iac-dharma/database-abc123
AWS_SECRET_REDIS_CREDENTIALS=arn:aws:secretsmanager:us-east-1:123456789012:secret:iac-dharma/redis-def456
AWS_SECRET_JWT_SECRET=arn:aws:secretsmanager:us-east-1:123456789012:secret:iac-dharma/jwt-ghi789
```

### Azure Key Vault

```bash
# Azure Key Vault configuration
AZURE_KEY_VAULT_ENABLED=true
AZURE_KEY_VAULT_NAME=iac-dharma-vault
AZURE_KEY_VAULT_URL=https://iac-dharma-vault.vault.azure.net/

# Secret names
AZURE_SECRET_DB_PASSWORD=database-password
AZURE_SECRET_REDIS_PASSWORD=redis-password
AZURE_SECRET_JWT_SECRET=jwt-secret
```

---

## ✅ Configuration Validation

### Validation Script

Create a script to validate configuration:

```bash
#!/bin/bash
# File: config/validate-env.sh

set -e

echo "🔍 Validating IAC Dharma Configuration..."

# Required environment variables
REQUIRED_VARS=(
  "NODE_ENV"
  "DATABASE_URL"
  "REDIS_URL"
  "JWT_SECRET"
)

# Check required variables
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo "❌ ERROR: $VAR is not set"
    exit 1
  fi
  echo "✅ $VAR is set"
done

# Validate NODE_ENV
if [[ ! "$NODE_ENV" =~ ^(development|staging|production)$ ]]; then
  echo "❌ ERROR: NODE_ENV must be development, staging, or production"
  exit 1
fi
echo "✅ NODE_ENV is valid: $NODE_ENV"

# Test database connection
echo "🔍 Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ ERROR: Cannot connect to database"
  exit 1
fi

# Test Redis connection
echo "🔍 Testing Redis connection..."
if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
  echo "✅ Redis connection successful"
else
  echo "❌ ERROR: Cannot connect to Redis"
  exit 1
fi

# Validate JWT secret length
if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "⚠️  WARNING: JWT_SECRET should be at least 32 characters"
fi

echo ""
echo "✅ Configuration validation complete!"
```

### Runtime Validation

```typescript
// File: src/config/validator.ts
import * as Joi from 'joi';

const configSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').required(),
  APP_PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'trace').default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'text', 'pretty').default('json'),
  
  // Cloud providers (at least one required)
  AWS_ACCESS_KEY_ID: Joi.string().when('AWS_ENABLED', { is: true, then: Joi.required() }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('AWS_ENABLED', { is: true, then: Joi.required() }),
  AWS_REGION: Joi.string().when('AWS_ENABLED', { is: true, then: Joi.required() }),
  
  // Monitoring
  PROMETHEUS_ENABLED: Joi.boolean().default(true),
  GRAFANA_ENABLED: Joi.boolean().default(true),
  JAEGER_ENABLED: Joi.boolean().default(true),
}).unknown(true);

export function validateConfig() {
  const { error, value } = configSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new Error(`Configuration validation failed: ${error.message}`);
  }

  return value;
}
```

---

## 🔧 Troubleshooting

### Common Configuration Issues

<details>
<summary><b>❌ Error: Cannot connect to database</b></summary>

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Check database is running:**
   ```bash
   docker-compose ps postgres
   # Should show "Up"
   ```

2. **Verify connection string:**
   ```bash
   echo $DATABASE_URL
   # Format: postgresql://user:password@host:5432/dbname
   ```

3. **Test connection manually:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

4. **Check database logs:**
   ```bash
   docker-compose logs postgres
   ```

5. **Verify network connectivity:**
   ```bash
   nc -zv postgres-host 5432
   ```
</details>

<details>
<summary><b>❌ Error: Redis connection timeout</b></summary>

**Symptoms:**
```
Error: Redis connection to localhost:6379 failed - connect ETIMEDOUT
```

**Solutions:**

1. **Check Redis is running:**
   ```bash
   docker-compose ps redis
   redis-cli -u $REDIS_URL ping
   # Expected: PONG
   ```

2. **Verify Redis password:**
   ```bash
   redis-cli -u $REDIS_URL AUTH your-password
   ```

3. **Check Redis configuration:**
   ```bash
   redis-cli -u $REDIS_URL CONFIG GET maxmemory
   redis-cli -u $REDIS_URL INFO memory
   ```

4. **Test connection:**
   ```bash
   redis-cli -h redis-host -p 6379 -a password ping
   ```
</details>

<details>
<summary><b>❌ Error: JWT verification failed</b></summary>

**Symptoms:**
```
JsonWebTokenError: invalid signature
```

**Solutions:**

1. **Check JWT_SECRET is consistent across all services:**
   ```bash
   docker-compose exec api-gateway env | grep JWT_SECRET
   docker-compose exec sso-service env | grep JWT_SECRET
   ```

2. **Verify JWT algorithm matches:**
   ```bash
   # If using RS256, ensure public/private keys are correctly configured
   echo $JWT_ALGORITHM
   ls -la $JWT_PRIVATE_KEY_PATH $JWT_PUBLIC_KEY_PATH
   ```

3. **Generate strong JWT secret:**
   ```bash
   openssl rand -base64 32
   ```
</details>

<details>
<summary><b>❌ Error: AWS credentials not found</b></summary>

**Symptoms:**
```
CredentialsError: Missing credentials in config, if using AWS_CONFIG_FILE, set AWS_SDK_LOAD_CONFIG=1
```

**Solutions:**

1. **Set AWS credentials:**
   ```bash
   export AWS_ACCESS_KEY_ID=AKIA...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_REGION=us-east-1
   ```

2. **Use IAM role (recommended for EC2/ECS):**
   ```bash
   export AWS_USE_IAM_ROLE=true
   ```

3. **Verify credentials:**
   ```bash
   aws sts get-caller-identity
   ```

4. **Check AWS config file:**
   ```bash
   cat ~/.aws/credentials
   cat ~/.aws/config
   ```
</details>

<details>
<summary><b>❌ Error: Port already in use</b></summary>

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Find process using the port:**
   ```bash
   lsof -i :3000
   # Or on Linux:
   netstat -tulpn | grep :3000
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Change port in .env:**
   ```bash
   API_GATEWAY_PORT=3001
   ```

4. **Use different ports for each environment:**
   ```bash
   # Development: 3000-3020
   # Staging: 4000-4020
   # Production: 5000-5020
   ```
</details>

### Configuration Debugging

**Enable debug logging:**

```bash
LOG_LEVEL=debug
LOG_FORMAT=pretty
DEBUG=* # Enable all debug namespaces
```

**Dump current configuration:**

```bash
# Create a debug endpoint (development only!)
curl http://localhost:3000/api/debug/config
```

**Check environment variables:**

```bash
# List all IAC Dharma variables
env | grep -E "(DATABASE|REDIS|JWT|AWS|AZURE|GCP|PROMETHEUS|GRAFANA)" | sort
```

**Test service connectivity:**

```bash
# Health check all services
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3010 3011 3012; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/health && echo "✅" || echo "❌"
done
```

---

## ✅ Best Practices

### Security Best Practices

1. **Never Commit Secrets**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   secrets/
   *.pem
   *.key
   credentials.json
   ```

2. **Use Strong Secrets**
   ```bash
   # Generate secure passwords
   openssl rand -base64 32
   
   # Generate RSA keys for JWT
   openssl genrsa -out private-key.pem 2048
   openssl rsa -in private-key.pem -pubout -out public-key.pem
   ```

3. **Rotate Credentials Regularly**
   ```bash
   # Schedule credential rotation
   # - Database passwords: Every 90 days
   # - API keys: Every 60 days
   # - JWT secrets: Every 180 days
   # - Cloud provider keys: Every 90 days
   ```

4. **Use Secret Management Tools**
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault
   - GCP Secret Manager
   - Kubernetes Secrets

5. **Enable Encryption**
   ```bash
   # Always use SSL/TLS
   DATABASE_SSL=true
   REDIS_TLS_ENABLED=true
   
   # Encrypt data at rest
   AWS_S3_SSE_ENABLED=true
   AZURE_STORAGE_ENCRYPTION=true
   ```

### Performance Best Practices

1. **Optimize Connection Pools**
   ```bash
   # Database pool sizing formula: (core_count * 2) + effective_spindle_count
   DATABASE_POOL_SIZE=20
   DATABASE_POOL_MIN=5
   
   # Redis connection pool
   REDIS_MAX_CONNECTIONS=50
   REDIS_MIN_CONNECTIONS=10
   ```

2. **Configure Timeouts**
   ```bash
   # Request timeout < Load balancer timeout < Client timeout
   REQUEST_TIMEOUT=30000        # 30 seconds
   DATABASE_STATEMENT_TIMEOUT=25000  # 25 seconds
   REDIS_COMMAND_TIMEOUT=5000   # 5 seconds
   ```

3. **Enable Caching**
   ```bash
   # Redis caching
   REDIS_TTL=3600               # 1 hour default
   BLUEPRINT_CACHE_ENABLED=true
   CLOUD_PROVIDER_CACHE_ENABLED=true
   
   # HTTP caching
   RESPONSE_CACHE_ENABLED=true
   RESPONSE_CACHE_TTL=300       # 5 minutes
   ```

4. **Tune Monitoring Sampling**
   ```bash
   # Production
   JAEGER_SAMPLER_PARAM=0.01    # 1% sampling
   PROMETHEUS_SCRAPE_INTERVAL=15s
   
   # Staging
   JAEGER_SAMPLER_PARAM=0.1     # 10% sampling
   
   # Development
   JAEGER_SAMPLER_PARAM=1.0     # 100% sampling
   ```

### Operational Best Practices

1. **Use Environment-Specific Configurations**
   ```bash
   # Separate .env files
   .env.development
   .env.staging
   .env.production
   
   # Load based on NODE_ENV
   dotenv -e .env.${NODE_ENV}
   ```

2. **Validate Configuration on Startup**
   ```typescript
   // Fail fast if configuration is invalid
   import { validateConfig } from './config/validator';
   
   try {
     validateConfig();
   } catch (error) {
     console.error('Configuration validation failed:', error);
     process.exit(1);
   }
   ```

3. **Document All Variables**
   ```bash
   # Create .env.example with all variables
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   REDIS_URL=redis://localhost:6379
   # ... etc
   ```

4. **Use Configuration Management**
   - Ansible
   - Terraform
   - Kubernetes ConfigMaps
   - AWS Systems Manager Parameter Store

5. **Monitor Configuration Changes**
   ```bash
   # Audit configuration changes
   git log --all --full-history -- .env*
   
   # Track configuration drift
   ENABLE_CONFIG_DRIFT_DETECTION=true
   ```

---

## 🔗 See Also

### Related Documentation
- **[Installation Guide](Installation-Guide)** - Setup and installation instructions
- **[Deployment Guide](Deployment-Guide)** - Production deployment strategies
- **[Security Best Practices](Security-Best-Practices)** - Comprehensive security guide
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions

### Configuration Tools
- **[Docker Compose](Docker-Compose)** - Container orchestration configuration
- **[Kubernetes Deployment](Kubernetes-Deployment)** - K8s configuration and deployment
- **[Observability](Observability)** - Monitoring and logging setup

### Cloud Provider Guides
- **[Cloud Provider Guides](Cloud-Provider-Guides)** - AWS, Azure, GCP specific configurations
- **[Multi-Cloud Support](Multi-Cloud-Support)** - Multi-cloud deployment strategies

### Advanced Topics
- **[Feature Flags](Feature-Flags)** - Feature flag configuration
- **[SSO Configuration](SSO-Configuration)** - Enterprise SSO setup
- **[Database Management](Database-Management)** - Database optimization and tuning

---

## 📞 Support

Need help with configuration?

- **📖 Documentation**: [IAC Dharma Wiki](Home)
- **🐛 Issues**: [GitHub Issues](https://github.com/Raghavendra198902/iac/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/Raghavendra198902/iac/discussions)
- **📧 Email**: raghavendra198902@gmail.com

---

<div align="center">

**Last Updated**: November 22, 2025 | **Version**: 1.0.0

[![Back to Home](https://img.shields.io/badge/Back_to-Home-blue?style=for-the-badge)](Home) [![Installation Guide](https://img.shields.io/badge/Next-Installation_Guide-green?style=for-the-badge)](Installation-Guide)

---

*Made with ❤️ by the IAC Dharma Team*

</div>
