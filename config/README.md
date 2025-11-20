# Multi-Environment Configuration

Comprehensive configuration management for IAC Dharma platform across development, staging, and production environments.

## Directory Structure

```
config/
├── environments/           # Environment-specific configurations
│   ├── development.env    # Development environment
│   ├── staging.env        # Staging environment
│   └── production.env     # Production environment
├── secrets/               # Secrets management scripts
│   ├── manage-secrets.sh  # AWS Secrets Manager integration
│   └── init-secrets.sh    # Initialize secrets for an environment
├── ssl/                   # SSL/TLS certificates
│   ├── development/       # Self-signed certs
│   ├── staging/          # Staging certs
│   ├── production/       # Production certs
│   └── manage-certs.sh   # Certificate management
└── switch-env.sh         # Environment switching utility
```

## Quick Start

### 1. Switch Environment

```bash
# Switch to development
./config/switch-env.sh development

# Switch to staging
./config/switch-env.sh staging

# Switch to production
./config/switch-env.sh production
```

### 2. Initialize Secrets

```bash
# Generate and store secrets in AWS Secrets Manager
./config/secrets/init-secrets.sh production us-west-2
```

### 3. Generate SSL Certificates

```bash
# Development (self-signed)
./config/ssl/manage-certs.sh -e development -d localhost -a generate-self-signed

# Production (Let's Encrypt)
./config/ssl/manage-certs.sh -e production \
  -d app.dharma.example.com \
  -m admin@example.com \
  -a request-letsencrypt
```

## Environment Details

### Development Environment

**Purpose**: Local development and testing

**Characteristics**:
- Local database (PostgreSQL via Docker)
- Local Redis cache
- Self-signed SSL certificates
- Debug logging enabled
- No rate limiting
- Hot reload enabled
- Mock external services

**Infrastructure**:
- Single-instance services
- No high availability
- Minimal resource allocation
- Local storage

**Usage**:
```bash
./config/switch-env.sh development
docker-compose up -d
```

### Staging Environment

**Purpose**: Pre-production testing and validation

**Characteristics**:
- AWS RDS PostgreSQL (single-AZ)
- AWS ElastiCache Redis
- Valid SSL certificates
- Production-like configuration
- Rate limiting enabled
- Monitoring enabled
- Real cloud services

**Infrastructure**:
- Kubernetes on AWS EKS
- Single-AZ RDS for cost optimization
- 2-node Redis cluster
- CloudWatch logging
- S3 storage

**Usage**:
```bash
./config/switch-env.sh staging
kubectl apply -k kubernetes/overlays/staging/
```

### Production Environment

**Purpose**: Live production workloads

**Characteristics**:
- AWS RDS PostgreSQL (Multi-AZ)
- AWS ElastiCache Redis (Cluster mode)
- Valid SSL certificates (ACM or Let's Encrypt)
- Strict security settings
- Rate limiting enforced
- Full observability
- High availability

**Infrastructure**:
- Kubernetes on AWS EKS
- Multi-AZ RDS with read replicas
- Redis cluster with sharding
- Multi-region backup
- Auto-scaling enabled
- DDoS protection

**Usage**:
```bash
./config/switch-env.sh production
kubectl apply -k kubernetes/overlays/production/
```

## Configuration Management

### Environment Variables

Each environment file contains:

1. **Application Settings**: Ports, timeouts, logging
2. **Database Configuration**: Connection strings, pool sizes
3. **Cache Configuration**: Redis settings, TTLs
4. **Security Settings**: JWT secrets, encryption keys
5. **Service URLs**: Microservice endpoints
6. **Cloud Configuration**: AWS settings, regions
7. **Feature Flags**: Enable/disable features
8. **Monitoring**: Metrics, tracing, logging

### Secrets Management

Sensitive values use placeholder format: `${SECRET_NAME}`

**Never commit actual secrets to version control!**

#### Fetch Secrets

```bash
# Get a specific secret
./config/secrets/manage-secrets.sh \
  -e production \
  -a get \
  -n JWT_SECRET

# List all secrets
./config/secrets/manage-secrets.sh \
  -e production \
  -a list
```

#### Create Secrets

```bash
# Create a new secret
./config/secrets/manage-secrets.sh \
  -e production \
  -a create \
  -n API_KEY \
  -v "your-secret-value"
```

#### Rotate Secrets

```bash
# Rotate a secret (generates new random value)
./config/secrets/manage-secrets.sh \
  -e production \
  -a rotate \
  -n JWT_SECRET
```

## SSL/TLS Certificates

### Development

Self-signed certificates for local development:

```bash
./config/ssl/manage-certs.sh \
  -e development \
  -d localhost \
  -a generate-self-signed
```

### Staging/Production

#### Option 1: Let's Encrypt (Free)

```bash
./config/ssl/manage-certs.sh \
  -e production \
  -d app.dharma.example.com \
  -m admin@example.com \
  -a request-letsencrypt
```

#### Option 2: AWS Certificate Manager (Recommended)

1. Request certificate in AWS ACM
2. Validate domain ownership (DNS or email)
3. Use with ALB/CloudFront
4. Automatic renewal

#### Option 3: Custom Certificate

```bash
# Place your certificate files in config/ssl/production/
# - tls.crt (certificate)
# - tls.key (private key)
# - ca.crt (CA bundle, optional)
```

### Certificate Renewal

Let's Encrypt certificates expire every 90 days:

```bash
# Manual renewal
./config/ssl/manage-certs.sh -e production -a renew

# Automated renewal (add to crontab)
0 0 1 * * /path/to/manage-certs.sh -e production -a renew
```

## Kubernetes Integration

### Create ConfigMaps

```bash
# Create ConfigMap from environment file
kubectl create configmap dharma-config \
  --from-env-file=config/environments/production.env \
  --namespace=dharma
```

### Create Secrets

```bash
# Database credentials
kubectl create secret generic db-credentials \
  --from-literal=host=dharma-prod.xxxx.rds.amazonaws.com \
  --from-literal=username=dharma_user \
  --from-literal=password=$DB_PASSWORD \
  --namespace=dharma

# Redis credentials
kubectl create secret generic redis-credentials \
  --from-literal=host=dharma-prod.xxxx.cache.amazonaws.com \
  --from-literal=password=$REDIS_PASSWORD \
  --namespace=dharma

# TLS certificate
kubectl create secret tls dharma-tls \
  --cert=config/ssl/production/tls.crt \
  --key=config/ssl/production/tls.key \
  --namespace=dharma
```

### Sync Secrets from AWS

```bash
# Install External Secrets Operator
kubectl apply -f https://raw.githubusercontent.com/external-secrets/external-secrets/main/deploy/crds/bundle.yaml

# Configure SecretStore
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: dharma
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-west-2
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
EOF

# Create ExternalSecret
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: dharma-secrets
  namespace: dharma
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: dharma-app-secrets
  data:
  - secretKey: JWT_SECRET
    remoteRef:
      key: dharma/production/JWT_SECRET
  - secretKey: DB_PASSWORD
    remoteRef:
      key: dharma/production/DB_PASSWORD
EOF
```

## Environment Comparison

| Feature | Development | Staging | Production |
|---------|------------|---------|------------|
| Database | Local PostgreSQL | RDS Single-AZ | RDS Multi-AZ |
| Cache | Local Redis | ElastiCache 2 nodes | ElastiCache Cluster |
| SSL | Self-signed | Let's Encrypt | ACM / Let's Encrypt |
| Logging | Debug | Info | Warn |
| Monitoring | Basic | Full | Full + Alerts |
| Backups | None | Daily (7 days) | Daily (30 days) |
| HA | No | Partial | Full |
| Cost/Month | ~$0 | ~$500 | ~$3,800 |

## Security Best Practices

### 1. Never Commit Secrets

```bash
# Add to .gitignore
echo "*.env" >> .gitignore
echo "config/ssl/**/*.key" >> .gitignore
echo "config/ssl/**/*.pem" >> .gitignore
echo ".env.*" >> .gitignore
```

### 2. Use AWS Secrets Manager

- Centralized secret storage
- Automatic rotation
- Encryption at rest
- Audit logging
- IAM-based access control

### 3. Rotate Secrets Regularly

```bash
# Quarterly rotation recommended
./config/secrets/manage-secrets.sh -e production -a rotate -n JWT_SECRET
./config/secrets/manage-secrets.sh -e production -a rotate -n DB_PASSWORD
```

### 4. Principle of Least Privilege

- Each environment has separate AWS IAM roles
- Developers cannot access production secrets
- Service accounts have minimal permissions

### 5. Audit and Monitor

- Enable AWS CloudTrail for secret access
- Alert on secret usage anomalies
- Regular access reviews

## Troubleshooting

### Issue: Environment variables not loading

**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check file permissions
chmod 644 .env

# Reload environment
source .env
```

### Issue: Cannot connect to database

**Solution**:
```bash
# Verify database credentials
echo $DATABASE_HOST
echo $DATABASE_USER

# Test connection
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME

# Check security groups (AWS)
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Issue: SSL certificate expired

**Solution**:
```bash
# Check expiration
openssl x509 -in config/ssl/production/tls.crt -noout -enddate

# Renew Let's Encrypt certificate
./config/ssl/manage-certs.sh -e production -a renew

# Update Kubernetes secret
kubectl delete secret dharma-tls -n dharma
kubectl create secret tls dharma-tls \
  --cert=config/ssl/production/tls.crt \
  --key=config/ssl/production/tls.key \
  --namespace=dharma
```

### Issue: Placeholder values in config

**Solution**:
```bash
# List all secrets for environment
./config/secrets/manage-secrets.sh -e production -a list

# Get specific secret
./config/secrets/manage-secrets.sh -e production -a get -n DB_PASSWORD

# Update .env manually or use script to populate
```

## Migration Between Environments

### Development → Staging

1. Export database:
   ```bash
   pg_dump dharma_dev > backup.sql
   ```

2. Sanitize data (remove sensitive info)

3. Import to staging:
   ```bash
   psql -h $STAGING_DB_HOST -U $STAGING_DB_USER dharma_staging < backup.sql
   ```

### Staging → Production

1. Full testing in staging
2. Create production backup
3. Schedule maintenance window
4. Deploy via CI/CD pipeline
5. Run database migrations
6. Verify health checks
7. Monitor for issues

## Monitoring Configuration Changes

```bash
# Track configuration changes in Git
git log --follow config/environments/production.env

# Diff configurations
diff config/environments/staging.env config/environments/production.env

# Audit secret access
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=dharma/production/JWT_SECRET
```

## Additional Resources

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [External Secrets Operator](https://external-secrets.io/)

## Support

For configuration issues:
1. Check this README
2. Review environment-specific .env file
3. Verify secrets in AWS Secrets Manager
4. Check Kubernetes ConfigMaps and Secrets
5. Review application logs
