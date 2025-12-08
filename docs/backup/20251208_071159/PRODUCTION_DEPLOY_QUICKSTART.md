# IAC Dharma v2.0.0 - Production Deployment Quick Start Guide

**Generated**: December 5, 2025  
**Version**: v2.0.0  
**Status**: Production Ready ✅

---

## 🚀 Quick Start Options

### Option A: Kubernetes Production Deployment (Recommended)

#### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/v1.28.0/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

#### Step 1: Prepare Secrets
```bash
# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)

echo "DB_PASSWORD: $DB_PASSWORD"
echo "JWT_SECRET: $JWT_SECRET"
```

#### Step 2: Create Kubernetes Secrets
```bash
# Create namespace
kubectl create namespace iac-dharma-prod

# Create secrets (use the passwords generated above)
kubectl create secret generic dharma-secrets \
  --from-literal=DB_USER='dharma_admin' \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=REDIS_PASSWORD='' \
  --namespace=iac-dharma-prod
```

#### Step 3: Deploy Application
```bash
# Apply all manifests
kubectl apply -f k8s/production/complete-deployment.yaml
kubectl apply -f k8s/production/rbac-security.yaml
kubectl apply -f k8s/production/backup-cronjob.yaml

# Verify deployment
kubectl get pods -n iac-dharma-prod --watch
```

#### Step 4: Setup SSL/TLS (Let's Encrypt)
```bash
# Set your domain
export DOMAIN=iac.yourdomain.com
export EMAIL=admin@yourdomain.com
export CERT_METHOD=letsencrypt

# Run SSL setup
./scripts/setup-ssl.sh
```

#### Step 5: Access Application
```bash
# Get LoadBalancer IP
kubectl get svc -n iac-dharma-prod

# Or use port-forward for testing
kubectl port-forward -n iac-dharma-prod svc/api-gateway 3000:3000

# Access
# Frontend: http://localhost:5173
# API: http://localhost:3000
# Swagger: http://localhost:3000/api-docs
# Grafana: http://localhost:3030
```

---

### Option B: Docker Compose Production (Single Server)

#### Prerequisites
- Ubuntu 22.04+ or similar
- 8+ CPU cores
- 16GB+ RAM
- 100GB+ disk space
- Docker & Docker Compose installed

#### Step 1: Update Production Config
```bash
cd /home/rrd/iac

# Edit production environment file
nano .env.production

# IMPORTANT: Change these values:
# - DB_PASSWORD
# - JWT_SECRET
# - SESSION_SECRET
# - ALLOWED_ORIGINS (your domain)
```

#### Step 2: Build Production Images
```bash
# Build all services
docker compose build

# Tag images with version
export VERSION=v2.0.0
for service in api-gateway blueprint-service iac-generator guardrails-engine \
               costing-service orchestrator-service automation-engine \
               monitoring-service cloud-provider-service ai-recommendations-service \
               sso-service ai-engine; do
  docker tag iac-${service}:latest iacdharma/iac-${service}:${VERSION}
done
```

#### Step 3: Deploy
```bash
# Start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api-gateway
```

#### Step 4: Setup SSL (Let's Encrypt)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install -y certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be in: /etc/letsencrypt/live/yourdomain.com/
```

#### Step 5: Setup Nginx/Traefik Reverse Proxy
```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/iac-dharma

# Add SSL configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable and restart
sudo ln -s /etc/nginx/sites-available/iac-dharma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option C: Cloud Platform Deployment

#### AWS EKS
```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create cluster
eksctl create cluster \
  --name iac-dharma-prod \
  --region us-east-1 \
  --nodes 3 \
  --node-type t3.xlarge \
  --nodes-min 2 \
  --nodes-max 5

# Get credentials
aws eks update-kubeconfig --region us-east-1 --name iac-dharma-prod

# Deploy (follow Kubernetes steps above)
kubectl apply -f k8s/production/
```

#### Azure AKS
```bash
# Create resource group
az group create --name iac-dharma-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group iac-dharma-rg \
  --name iac-dharma-prod \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-managed-identity \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group iac-dharma-rg --name iac-dharma-prod

# Deploy
kubectl apply -f k8s/production/
```

#### Google GKE
```bash
# Create cluster
gcloud container clusters create iac-dharma-prod \
  --num-nodes=3 \
  --machine-type=n1-standard-4 \
  --zone=us-central1-a \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=5

# Get credentials
gcloud container clusters get-credentials iac-dharma-prod --zone=us-central1-a

# Deploy
kubectl apply -f k8s/production/
```

---

## 📋 Post-Deployment Checklist

### Immediate Actions (First Hour)

- [ ] **Verify all pods are running**
  ```bash
  kubectl get pods -n iac-dharma-prod
  ```

- [ ] **Check service health**
  ```bash
  curl http://your-domain/health
  ```

- [ ] **Test API endpoints**
  ```bash
  curl http://your-domain/api-docs
  ```

- [ ] **Verify database connection**
  ```bash
  kubectl exec -it postgres-0 -n iac-dharma-prod -- psql -U dharma_admin -d iac_dharma -c "SELECT 1;"
  ```

- [ ] **Check Redis cache**
  ```bash
  kubectl exec -it redis-0 -n iac-dharma-prod -- redis-cli ping
  ```

### First Day

- [ ] **Run security tests**
  ```bash
  python3 tests/security/penetration-tests.py https://your-domain
  ```

- [ ] **Setup monitoring alerts**
  - Configure Prometheus alert rules
  - Setup Grafana dashboards
  - Configure Slack/email notifications

- [ ] **Test disaster recovery**
  ```bash
  ./scripts/testing/test-disaster-recovery.sh
  ```

- [ ] **Configure backup schedule**
  ```bash
  kubectl apply -f k8s/production/backup-cronjob.yaml
  ```

- [ ] **Setup log aggregation**
  - Verify Loki is collecting logs
  - Configure log retention (30 days)

### First Week

- [ ] **Performance testing**
  ```bash
  ./scripts/testing/run-performance-tests.sh
  ```

- [ ] **Cost optimization**
  - Enable auto-scaling
  - Review resource limits
  - Setup Reserved Instances

- [ ] **Documentation**
  - Document runbook procedures
  - Create incident response plan
  - Train operations team

- [ ] **Security hardening**
  - Enable network policies
  - Configure WAF rules
  - Setup Istio service mesh

- [ ] **Compliance validation**
  - Run OPA policy checks
  - Generate compliance reports
  - Setup audit logging

---

## 🔒 Security Configuration

### 1. Change Default Passwords
```bash
# Generate secure passwords
NEW_DB_PASSWORD=$(openssl rand -base64 32)
NEW_JWT_SECRET=$(openssl rand -base64 48)

# Update Kubernetes secret
kubectl create secret generic dharma-secrets \
  --from-literal=DB_PASSWORD="$NEW_DB_PASSWORD" \
  --from-literal=JWT_SECRET="$NEW_JWT_SECRET" \
  --namespace=iac-dharma-prod \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to use new secrets
kubectl rollout restart deployment -n iac-dharma-prod
```

### 2. Enable HTTPS Only
```bash
# Update ingress for HTTPS redirect
kubectl patch ingress iac-dharma-ingress -n iac-dharma-prod \
  -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/force-ssl-redirect":"true"}}}'
```

### 3. Configure Network Policies
```bash
# Apply network policies
kubectl apply -f k8s/production/rbac-security.yaml
```

### 4. Enable Audit Logging
```bash
# Update ConfigMap
kubectl patch configmap dharma-config -n iac-dharma-prod \
  -p '{"data":{"ENABLE_AUDIT_LOGGING":"true","LOG_LEVEL":"info"}}'
```

---

## 📊 Monitoring Setup

### Grafana Dashboards
1. Access Grafana: `http://your-domain:3030`
2. Login: admin/admin (change on first login)
3. Import dashboards from `/monitoring/dashboards/`

### Prometheus Alerts
```bash
# View configured alerts
curl http://your-domain:9090/api/v1/rules

# Configure alert manager
kubectl apply -f monitoring/alertmanager-config.yaml
```

### Key Metrics
- API response time (P95 < 500ms)
- Error rate (< 1%)
- Database connections (< 70%)
- Redis cache hit rate (> 80%)
- Pod CPU usage (< 80%)
- Pod memory usage (< 80%)

---

## 🔧 Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n iac-dharma-prod

# Check logs
kubectl logs <pod-name> -n iac-dharma-prod --tail=100

# Check events
kubectl get events -n iac-dharma-prod --sort-by='.lastTimestamp'
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
kubectl exec -it postgres-0 -n iac-dharma-prod -- psql -U dharma_admin -d iac_dharma

# Check PgBouncer
kubectl logs pgbouncer-0 -n iac-dharma-prod

# Reset connection pool
kubectl rollout restart statefulset pgbouncer -n iac-dharma-prod
```

### Performance Issues
```bash
# Run performance analysis
./scripts/testing/performance-deep-dive.sh

# Check slow queries
kubectl exec -it postgres-0 -n iac-dharma-prod -- \
  psql -U dharma_admin -d iac_dharma -c \
  "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## 💰 Cost Estimates

### AWS (Medium Enterprise)
| Resource | Type | Monthly Cost |
|----------|------|--------------|
| EKS Cluster | 3x m5.xlarge | $260 |
| RDS PostgreSQL | db.r5.large Multi-AZ | $340 |
| ElastiCache Redis | cache.m5.large | $160 |
| ALB | 1 Load Balancer | $23 |
| S3 Storage | 500GB | $12 |
| Data Transfer | 1TB | $90 |
| CloudWatch | 50GB logs | $25 |
| **Total** | | **~$910/month** |

**Optimization Savings**: 30-50% with Reserved Instances + Auto-scaling

---

## 📞 Support

### Documentation
- Release Notes: `/RELEASE_NOTES_v2.0.0.md`
- API Docs: `http://your-domain/api-docs`
- User Guide: `/docs/guides/USER_ONBOARDING.md`

### Community
- GitHub: https://github.com/Raghavendra198902/iac
- Issues: https://github.com/Raghavendra198902/iac/issues

### Enterprise Support
- Email: support@iacdharma.com
- SLA: 24/7 with 1-hour response

---

**🎉 Congratulations on deploying IAC Dharma v2.0.0 to production!**

For questions or issues, check the troubleshooting section or open a GitHub issue.
