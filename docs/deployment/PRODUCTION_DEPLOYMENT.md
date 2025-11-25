# IAC Dharma - Production Deployment Guide

This guide covers deploying IAC Dharma to production with security hardening, performance optimization, and high availability.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Security Configuration](#security-configuration)
- [Build & Deploy](#build--deploy)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## 🔧 Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ / RHEL 8+ / Amazon Linux 2
- **CPU**: 4+ cores (recommended 8+)
- **RAM**: 16GB+ (minimum 8GB)
- **Disk**: 100GB+ SSD
- **Network**: Static IP, open ports 80, 443

### Software Requirements

```bash
# Docker
Docker Engine 20.10+
Docker Compose v2.0+

# Optional
kubectl (for Kubernetes deployment)
nginx (if using external reverse proxy)
certbot (for SSL certificates)
```

## 🚀 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/iac-dharma.git
cd iac-dharma
```

### 2. Configure Environment

```bash
# Copy production environment template
cp .env.production .env

# Edit with your production values
nano .env
```

**Critical Environment Variables:**

```bash
# Security (MUST CHANGE!)
JWT_SECRET=<generate-with: openssl rand -base64 64>
SESSION_SECRET=<generate-with: openssl rand -base64 64>
DB_PASSWORD=<strong-database-password>
REDIS_PASSWORD=<strong-redis-password>

# Application
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DB_HOST=postgres
DB_NAME=iac_dharma_prod
DB_USER=dharma_prod

# API URLs
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### 3. Generate Secrets

```bash
# JWT Secret (64 bytes)
openssl rand -base64 64

# Session Secret
openssl rand -base64 64

# Encryption Key (32 bytes)
openssl rand -hex 32

# Update .env file with generated secrets
```

## 🔒 Security Configuration

### SSL/TLS Certificates

#### Option 1: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem frontend/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem frontend/ssl/key.pem
sudo chmod 644 frontend/ssl/*.pem
```

#### Option 2: Self-Signed (Development Only)

```bash
mkdir -p frontend/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout frontend/ssl/key.pem \
  -out frontend/ssl/cert.pem
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables-save > /etc/iptables/rules.v4
```

### Docker Security

```bash
# Enable Docker content trust
export DOCKER_CONTENT_TRUST=1

# Scan images for vulnerabilities
docker scout cves iac-dharma/frontend:latest
docker scout cves iac-dharma/api-gateway:latest
```

## 📦 Build & Deploy

### Automated Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

The script will:
1. ✅ Run preflight checks
2. 💾 Backup existing database
3. 🏗️ Build Docker images
4. 🚀 Deploy services
5. 🏥 Run health checks
6. 🧪 Execute smoke tests
7. 📊 Display status

### Manual Deployment

```bash
# 1. Build images
docker compose -f docker-compose.prod.yml build

# 2. Start services
docker compose -f docker-compose.prod.yml up -d

# 3. Check status
docker compose -f docker-compose.prod.yml ps

# 4. View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Database Migration

```bash
# Run migrations
docker compose -f docker-compose.prod.yml exec api-gateway npm run migrate

# Seed production data (if needed)
docker compose -f docker-compose.prod.yml exec api-gateway npm run seed:prod
```

## 📊 Monitoring & Maintenance

### Access Monitoring Tools

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **Grafana** | http://localhost:3002 | admin / (see .env) |
| **Prometheus** | http://localhost:9091 | N/A |
| **Jaeger** | http://localhost:16686 | N/A |

### Health Checks

```bash
# API Gateway
curl http://localhost:3001/api/health

# Frontend
curl http://localhost/health

# Database
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U dharma_prod

# Redis
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### Log Management

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service
docker compose -f docker-compose.prod.yml logs -f api-gateway

# Export logs
docker compose -f docker-compose.prod.yml logs --no-color > deployment-logs.txt
```

### Backup Strategy

#### Automated Backups

```bash
# Add to crontab
0 2 * * * /path/to/iac-dharma/scripts/backup-database.sh
```

#### Manual Backup

```bash
# Database backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U dharma_prod iac_dharma_prod > backup.sql

# Compress
gzip backup.sql

# Upload to S3 (optional)
aws s3 cp backup.sql.gz s3://your-bucket/backups/$(date +%Y%m%d-%H%M%S).sql.gz
```

### Performance Tuning

#### Database Optimization

```sql
-- Connect to database
docker compose -f docker-compose.prod.yml exec postgres psql -U dharma_prod -d iac_dharma_prod

-- Analyze tables
ANALYZE VERBOSE;

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;
```

#### Cache Optimization

```bash
# Check Redis memory usage
docker compose -f docker-compose.prod.yml exec redis redis-cli INFO memory

# Clear cache (if needed)
docker compose -f docker-compose.prod.yml exec redis redis-cli FLUSHALL
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Service Not Starting

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs api-gateway

# Check container status
docker compose -f docker-compose.prod.yml ps

# Restart service
docker compose -f docker-compose.prod.yml restart api-gateway
```

#### 2. Database Connection Failed

```bash
# Check database is running
docker compose -f docker-compose.prod.yml ps postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres psql -U dharma_prod -d iac_dharma_prod -c "SELECT 1;"

# Check environment variables
docker compose -f docker-compose.prod.yml exec api-gateway env | grep DB_
```

#### 3. High Memory Usage

```bash
# Check memory usage
docker stats

# Restart memory-hungry services
docker compose -f docker-compose.prod.yml restart api-gateway

# Increase memory limits in docker-compose.prod.yml
```

#### 4. SSL Certificate Issues

```bash
# Check certificate expiry
openssl x509 -in frontend/ssl/cert.pem -noout -dates

# Renew Let's Encrypt certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### Debug Mode

```bash
# Enable debug logging
docker compose -f docker-compose.prod.yml exec api-gateway \
  sh -c "export LOG_LEVEL=debug && node dist/index.js"
```

## ⏮️ Rollback Procedures

### Automatic Rollback

The deployment script automatically rolls back on failure:

```bash
./scripts/deploy-production.sh
# Will rollback automatically if health checks fail
```

### Manual Rollback

```bash
# 1. Stop current deployment
docker compose -f docker-compose.prod.yml down

# 2. Restore database from backup
gunzip < backups/postgres-20240115-120000.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U dharma_prod

# 3. Pull previous image version
docker pull iac-dharma/api-gateway:v1.0.0
docker pull iac-dharma/frontend:v1.0.0

# 4. Restart services
docker compose -f docker-compose.prod.yml up -d
```

### Version Pinning

```bash
# Tag current version before deployment
docker tag iac-dharma/api-gateway:latest iac-dharma/api-gateway:v1.0.1
docker tag iac-dharma/frontend:latest iac-dharma/frontend:v1.0.1

# Push to registry
docker push iac-dharma/api-gateway:v1.0.1
docker push iac-dharma/frontend:v1.0.1
```

## 🔄 Updates & Maintenance

### Zero-Downtime Updates

```bash
# 1. Build new images
docker compose -f docker-compose.prod.yml build

# 2. Rolling update (one service at a time)
docker compose -f docker-compose.prod.yml up -d --no-deps --scale api-gateway=2 api-gateway
sleep 30
docker compose -f docker-compose.prod.yml up -d --no-deps --scale api-gateway=1 api-gateway

# 3. Update frontend
docker compose -f docker-compose.prod.yml up -d --no-deps frontend
```

### Maintenance Mode

```bash
# Enable maintenance mode
echo 'MAINTENANCE_MODE=true' >> .env
docker compose -f docker-compose.prod.yml restart api-gateway

# Disable maintenance mode
sed -i '/MAINTENANCE_MODE=true/d' .env
docker compose -f docker-compose.prod.yml restart api-gateway
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale API Gateway
docker compose -f docker-compose.prod.yml up -d --scale api-gateway=3

# Check replicas
docker compose -f docker-compose.prod.yml ps api-gateway
```

### Load Balancer Configuration

Add Nginx load balancer:

```nginx
upstream api_backend {
    least_conn;
    server api-gateway-1:3001 max_fails=3 fail_timeout=30s;
    server api-gateway-2:3001 max_fails=3 fail_timeout=30s;
    server api-gateway-3:3001 max_fails=3 fail_timeout=30s;
}
```

## 🔐 Security Best Practices

1. **Secrets Management**
   - ✅ Never commit `.env` to git
   - ✅ Use Docker secrets or HashiCorp Vault
   - ✅ Rotate secrets every 90 days

2. **Access Control**
   - ✅ Use SSH key authentication
   - ✅ Disable root login
   - ✅ Implement fail2ban
   - ✅ Regular security audits

3. **Monitoring**
   - ✅ Set up alerts for anomalies
   - ✅ Monitor failed login attempts
   - ✅ Track resource usage
   - ✅ Enable audit logging

4. **Backups**
   - ✅ Daily automated backups
   - ✅ Test restore procedures monthly
   - ✅ Off-site backup storage
   - ✅ 30-day retention policy

## 📞 Support

- **Documentation**: `/docs`
- **Issues**: GitHub Issues
- **Slack**: #iac-dharma-prod
- **Email**: ops@iacdharma.com

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0
