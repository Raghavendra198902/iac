# Deployment Guide

Production deployment strategies for IAC Dharma.

---

## Deployment Options

### 1. Docker Compose (Recommended for Single Server)

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With custom environment
cp .env.production .env
docker-compose up -d

# Scale services
docker-compose up -d --scale api-gateway=3
```

### 2. Kubernetes (Recommended for Production)

```bash
# Apply manifests
kubectl apply -f k8s/base/
kubectl apply -f k8s/overlays/production/

# Verify deployment
kubectl get pods -n iac-dharma
kubectl get services -n iac-dharma

# Check logs
kubectl logs -f deployment/api-gateway -n iac-dharma
```

### 3. Cloud-Specific Deployments

#### AWS ECS
```bash
# Build and push images
docker build -t 123456.dkr.ecr.us-east-1.amazonaws.com/api-gateway:latest .
aws ecr get-login-password | docker login --username AWS --password-stdin 123456.dkr.ecr.us-east-1.amazonaws.com
docker push 123456.dkr.ecr.us-east-1.amazonaws.com/api-gateway:latest

# Deploy to ECS
aws ecs update-service --cluster iac-dharma --service api-gateway --force-new-deployment
```

#### Azure Container Instances
```bash
az container create \
  --resource-group iac-dharma-rg \
  --name api-gateway \
  --image iacdharma.azurecr.io/api-gateway:latest \
  --dns-name-label iac-dharma \
  --ports 3000
```

#### Google Cloud Run
```bash
gcloud run deploy api-gateway \
  --image gcr.io/project-id/api-gateway:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Load balancer set up
- [ ] DNS records updated
- [ ] Firewall rules configured

---

## Rolling Updates

```bash
# Zero-downtime deployment
kubectl set image deployment/api-gateway api-gateway=api-gateway:v1.1.0

# Rollback if needed
kubectl rollout undo deployment/api-gateway
```

---

## Health Checks

```bash
# API Gateway
curl http://localhost:3000/health

# Services
curl http://localhost:3001/health  # Blueprint Service
curl http://localhost:3002/health  # IAC Generator
```

---

## Backup and Recovery

### Database Backup
```bash
# Backup
docker exec postgres pg_dump -U postgres iac_dharma > backup.sql

# Restore
docker exec -i postgres psql -U postgres iac_dharma < backup.sql
```

### Configuration Backup
```bash
# Backup configs
tar -czf configs-backup.tar.gz .env docker-compose.yml k8s/

# Restore
tar -xzf configs-backup.tar.gz
```

---

## Scaling

### Horizontal Scaling
```bash
# Docker Compose
docker-compose up -d --scale api-gateway=5

# Kubernetes
kubectl scale deployment api-gateway --replicas=5
```

### Vertical Scaling
```bash
# Update resource limits
kubectl set resources deployment api-gateway \
  --limits=cpu=2,memory=4Gi \
  --requests=cpu=1,memory=2Gi
```

---

## Monitoring

```bash
# Check resource usage
docker stats

# Kubernetes metrics
kubectl top pods -n iac-dharma
kubectl top nodes
```

---

Last Updated: November 21, 2025 | [Back to Home](Home)
