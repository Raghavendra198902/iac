# Deployment Guide

> **Enterprise Deployment Excellence** - Production-grade deployment strategies, patterns, and best practices for IAC Dharma across all environments and cloud platforms

[![Deployment](https://img.shields.io/badge/Deployment-Production--Ready-brightgreen.svg)](Deployment-Guide)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](Docker-Compose)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Native-326CE5.svg)](Kubernetes-Deployment)
[![Multi-Cloud](https://img.shields.io/badge/Multi--Cloud-AWS%20%7C%20Azure%20%7C%20GCP-orange.svg)](Multi-Cloud-Support)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Automated-success.svg)](CI-CD-Pipeline)
[![High Availability](https://img.shields.io/badge/HA-Multi--AZ-critical.svg)](Architecture-Overview)

---

## 🎯 Quick Navigation

| 🐳 **Docker** | ☸️ **Kubernetes** | ☁️ **Cloud Platforms** | 🔄 **Operations** |
|--------------|------------------|----------------------|------------------|
| [Docker Compose](#docker-compose-deployment) | [K8s Production](#kubernetes-production-deployment) | [AWS Deployment](#aws-deployment-guide) | [Health Checks](#health-checks-and-readiness) |
| [Production Setup](#production-docker-setup) | [Helm Charts](#helm-deployment) | [Azure Deployment](#azure-deployment-guide) | [Rolling Updates](#rolling-update-strategies) |
| [Swarm Mode](#docker-swarm-deployment) | [Auto-scaling](#kubernetes-auto-scaling) | [GCP Deployment](#gcp-deployment-guide) | [Blue-Green](#blue-green-deployment) |
| [Monitoring](#container-monitoring) | [Ingress & LB](#kubernetes-ingress-setup) | [Multi-Region](#multi-region-deployment) | [Canary Releases](#canary-deployment-strategy) |

| 🛡️ **Security** | 📊 **Monitoring** | 🔙 **Backup** | 🚨 **DR** |
|----------------|------------------|--------------|---------|
| [SSL/TLS](#ssltls-configuration) | [Observability](#observability-setup) | [Backup Strategy](#backup-strategies) | [Disaster Recovery](#disaster-recovery-procedures) |
| [Secrets](#secrets-management) | [Logging](#centralized-logging) | [Data Persistence](#data-persistence-volumes) | [Failover](#automatic-failover) |
| [Network Policy](#network-security-policies) | [Tracing](#distributed-tracing) | [Snapshot Strategy](#snapshot-management) | [RTO/RPO](#recovery-objectives) |
| [Compliance](#compliance-security) | [Alerting](#alerting-configuration) | [Recovery Testing](#backup-validation) | [Runbooks](#dr-runbooks) |

---

## 📚 Table of Contents

- [Overview](#overview)
- [Deployment Strategy Matrix](#deployment-strategy-matrix)
- [Pre-Deployment Planning](#pre-deployment-planning)
  - [Architecture Review](#architecture-review-checklist)
  - [Capacity Planning](#capacity-planning-guide)
  - [Security Assessment](#security-assessment-checklist)
  - [Compliance Verification](#compliance-verification)
- [Environment Setup](#environment-setup)
  - [Development Environment](#development-environment-setup)
  - [Staging Environment](#staging-environment-setup)
  - [Production Environment](#production-environment-setup)
- [Deployment Options](#deployment-options)
  - [Docker Compose Deployment](#docker-compose-deployment)
  - [Docker Swarm Deployment](#docker-swarm-deployment)
  - [Kubernetes Deployment](#kubernetes-production-deployment)
  - [Helm Deployment](#helm-deployment)
  - [AWS Deployment](#aws-deployment-guide)
  - [Azure Deployment](#azure-deployment-guide)
  - [GCP Deployment](#gcp-deployment-guide)
  - [Multi-Cloud Deployment](#multi-cloud-deployment-strategy)
- [Configuration Management](#configuration-management)
  - [Environment Variables](#environment-variables-management)
  - [ConfigMaps and Secrets](#kubernetes-configmaps-and-secrets)
  - [Feature Flags](#feature-flags-configuration)
- [Database Deployment](#database-deployment)
  - [Database Migrations](#database-migrations-execution)
  - [Data Seeding](#data-seeding-procedures)
  - [Database High Availability](#database-high-availability)
- [Networking Setup](#networking-setup)
  - [DNS Configuration](#dns-configuration)
  - [Load Balancing](#load-balancing-strategies)
  - [SSL/TLS Configuration](#ssltls-configuration)
  - [CDN Integration](#cdn-integration)
- [Deployment Patterns](#deployment-patterns)
  - [Rolling Updates](#rolling-update-strategies)
  - [Blue-Green Deployment](#blue-green-deployment)
  - [Canary Deployment](#canary-deployment-strategy)
  - [A/B Testing](#ab-testing-deployments)
- [Scaling Strategies](#scaling-strategies)
  - [Horizontal Pod Autoscaling](#horizontal-pod-autoscaling)
  - [Vertical Scaling](#vertical-scaling-guide)
  - [Database Scaling](#database-scaling-strategies)
  - [Cache Scaling](#cache-scaling-redis-memcached)
- [Health and Readiness](#health-checks-and-readiness)
  - [Liveness Probes](#liveness-probe-configuration)
  - [Readiness Probes](#readiness-probe-configuration)
  - [Startup Probes](#startup-probe-configuration)
- [Observability Setup](#observability-setup)
  - [Centralized Logging](#centralized-logging)
  - [Metrics Collection](#metrics-collection-prometheus)
  - [Distributed Tracing](#distributed-tracing)
  - [Alerting Configuration](#alerting-configuration)
- [Backup Strategies](#backup-strategies)
  - [Database Backup](#database-backup-procedures)
  - [Configuration Backup](#configuration-backup-procedures)
  - [Volume Snapshots](#volume-snapshot-management)
  - [Disaster Recovery](#disaster-recovery-procedures)
- [Security Hardening](#security-hardening-deployment)
  - [Network Security](#network-security-policies)
  - [Secrets Management](#secrets-management)
  - [Pod Security](#pod-security-policies)
  - [Image Scanning](#container-image-scanning)
- [CI/CD Integration](#cicd-integration)
  - [GitHub Actions](#github-actions-deployment)
  - [GitLab CI](#gitlab-ci-deployment)
  - [Jenkins Pipeline](#jenkins-pipeline-deployment)
  - [ArgoCD](#argocd-gitops-deployment)
- [Maintenance Operations](#maintenance-operations)
  - [Update Procedures](#update-procedures)
  - [Rollback Strategies](#rollback-strategies)
  - [Troubleshooting](#troubleshooting-deployment-issues)
  - [Performance Optimization](#performance-optimization)
- [Cost Optimization](#cost-optimization-deployment)
- [Compliance and Governance](#compliance-and-governance)
- [Best Practices](#deployment-best-practices)
- [See Also](#see-also)

---

## Overview

The **IAC Dharma Deployment Guide** provides comprehensive, production-tested deployment strategies for all environments—from single-server development setups to multi-region, multi-cloud enterprise production deployments.

### 🎯 Key Deployment Principles

1. **Infrastructure as Code**: All deployment configurations version-controlled and reproducible
2. **Zero-Downtime Deployments**: Rolling updates with health checks and automatic rollback
3. **Security First**: End-to-end encryption, secrets management, and network policies
4. **High Availability**: Multi-AZ deployments with automatic failover
5. **Observability**: Comprehensive logging, metrics, and distributed tracing
6. **Cost Optimization**: Right-sized resources with auto-scaling

### 📊 Deployment Maturity Levels

| Level | Environment | Characteristics | Target Audience |
|-------|-------------|----------------|-----------------|
| **Level 1** | Development | Single-node Docker Compose, local databases | Developers, Testing |
| **Level 2** | Staging | Multi-container, external databases, basic monitoring | QA, Pre-production |
| **Level 3** | Production | Kubernetes cluster, HA databases, full observability | Production workloads |
| **Level 4** | Enterprise | Multi-region, multi-cloud, disaster recovery, compliance | Enterprise, Critical systems |

---

## Deployment Strategy Matrix

Choose the right deployment strategy based on your requirements:

| Strategy | Complexity | Downtime | Rollback Speed | Resource Usage | Best For |
|----------|------------|----------|----------------|----------------|----------|
| **Docker Compose** | ⭐ Low | Minutes | Fast | 💰 Low | Development, Small deployments |
| **Docker Swarm** | ⭐⭐ Medium | Seconds | Fast | 💰💰 Medium | Mid-size production |
| **Kubernetes** | ⭐⭐⭐ High | Zero | Instant | 💰💰💰 High | Large-scale production |
| **Helm** | ⭐⭐⭐ High | Zero | Instant | 💰💰💰 High | Enterprise Kubernetes |
| **AWS ECS** | ⭐⭐ Medium | Zero | Fast | 💰💰 Medium | AWS-native deployments |
| **Azure AKS** | ⭐⭐⭐ High | Zero | Instant | 💰💰💰 High | Azure-native deployments |
| **GCP GKE** | ⭐⭐⭐ High | Zero | Instant | 💰💰💰 High | GCP-native deployments |
| **Multi-Cloud** | ⭐⭐⭐⭐ Very High | Zero | Complex | 💰💰💰💰 Very High | Enterprise, High availability |

---

## Pre-Deployment Planning

### Architecture Review Checklist

Before deploying, ensure your architecture meets production requirements:

#### Infrastructure Requirements
```yaml
Checklist:
  Compute:
    - [ ] Minimum 3 nodes for high availability
    - [ ] CPU: 16+ vCPUs per node (production)
    - [ ] Memory: 32+ GB RAM per node (production)
    - [ ] Storage: 500+ GB SSD per node
  
  Network:
    - [ ] VPC/VNet configured with private subnets
    - [ ] Load balancer with health checks configured
    - [ ] DNS records created (A, CNAME, TXT for verification)
    - [ ] SSL/TLS certificates obtained and validated
    - [ ] Firewall rules configured (ingress/egress)
    - [ ] CDN configured (optional, recommended)
  
  Database:
    - [ ] Production database provisioned (PostgreSQL 14+)
    - [ ] Read replicas configured (minimum 2)
    - [ ] Automated backups enabled (daily minimum)
    - [ ] Point-in-time recovery configured
    - [ ] Database monitoring enabled
  
  Storage:
    - [ ] Object storage configured (S3, Azure Blob, GCS)
    - [ ] Persistent volumes for stateful services
    - [ ] Snapshot policies defined
    - [ ] Cross-region replication (for critical data)
  
  Security:
    - [ ] Secrets manager configured (AWS Secrets Manager, Azure Key Vault, etc.)
    - [ ] IAM roles and policies defined
    - [ ] Network security groups/policies configured
    - [ ] Container image scanning enabled
    - [ ] WAF configured (production)
  
  Monitoring:
    - [ ] Prometheus and Grafana deployed
    - [ ] Alerting rules configured
    - [ ] Log aggregation configured (ELK, Loki)
    - [ ] Distributed tracing configured (Jaeger)
    - [ ] Uptime monitoring configured
  
  Compliance:
    - [ ] Data residency requirements identified
    - [ ] Compliance standards documented (SOC2, HIPAA, GDPR)
    - [ ] Audit logging enabled
    - [ ] Encryption at rest enabled
    - [ ] Encryption in transit enabled
```

### Capacity Planning Guide

Calculate required resources based on expected load:

#### Sizing Calculator

```bash
# Expected metrics (example for 10,000 daily active users)
DAILY_ACTIVE_USERS=10000
REQUESTS_PER_USER_PER_DAY=50
PEAK_CONCURRENCY_MULTIPLIER=0.1  # 10% concurrent users at peak

# Calculate required capacity
TOTAL_DAILY_REQUESTS=$((DAILY_ACTIVE_USERS * REQUESTS_PER_USER_PER_DAY))
PEAK_CONCURRENT_USERS=$((DAILY_ACTIVE_USERS * PEAK_CONCURRENCY_MULTIPLIER))
REQUESTS_PER_SECOND=$((TOTAL_DAILY_REQUESTS / 86400))
PEAK_REQUESTS_PER_SECOND=$((REQUESTS_PER_SECOND * 5))  # 5x peak multiplier

echo "Estimated Load:"
echo "- Daily Requests: $TOTAL_DAILY_REQUESTS"
echo "- Avg Requests/sec: $REQUESTS_PER_SECOND"
echo "- Peak Requests/sec: $PEAK_REQUESTS_PER_SECOND"
echo "- Peak Concurrent Users: $PEAK_CONCURRENT_USERS"

# Recommended resources (rule of thumb: 100 req/sec per 2 vCPU)
REQUIRED_VCPUS=$((PEAK_REQUESTS_PER_SECOND / 50))
REQUIRED_MEMORY_GB=$((REQUIRED_VCPUS * 2))
REQUIRED_PODS=$((REQUIRED_VCPUS / 2))

echo ""
echo "Recommended Resources:"
echo "- vCPUs: $REQUIRED_VCPUS"
echo "- Memory: ${REQUIRED_MEMORY_GB}GB"
echo "- Kubernetes Pods: $REQUIRED_PODS"
echo "- Kubernetes Nodes: $((REQUIRED_PODS / 10 + 1)) (10 pods/node)"
```

#### Resource Requirements by Deployment Size

| Deployment Size | Users | Requests/Day | Nodes | vCPUs/Node | RAM/Node | Database | Storage |
|----------------|-------|--------------|-------|-----------|----------|----------|---------|
| **Small** | <1K | <50K | 2 | 4 | 8GB | db.t3.medium | 100GB |
| **Medium** | 1K-10K | 50K-500K | 3 | 8 | 16GB | db.r5.large | 500GB |
| **Large** | 10K-100K | 500K-5M | 5 | 16 | 32GB | db.r5.xlarge | 1TB |
| **Enterprise** | >100K | >5M | 10+ | 32+ | 64GB+ | db.r5.4xlarge+ | 5TB+ |

### Security Assessment Checklist

```yaml
Security Review:
  Authentication:
    - [ ] SSO configured (OAuth2, SAML, OIDC)
    - [ ] Multi-factor authentication enabled
    - [ ] API key rotation policy defined
    - [ ] JWT token expiration configured
  
  Authorization:
    - [ ] RBAC policies defined and tested
    - [ ] Service-to-service authentication configured
    - [ ] Least privilege principle enforced
  
  Network Security:
    - [ ] Private subnets for backend services
    - [ ] Network policies/security groups configured
    - [ ] DDoS protection enabled
    - [ ] Rate limiting configured
  
  Data Protection:
    - [ ] Encryption at rest enabled (databases, volumes)
    - [ ] Encryption in transit enforced (TLS 1.2+)
    - [ ] Secrets encrypted in secrets manager
    - [ ] PII data identified and protected
  
  Vulnerability Management:
    - [ ] Container images scanned for vulnerabilities
    - [ ] Dependency scanning enabled
    - [ ] Security patching policy defined
    - [ ] Penetration testing completed
  
  Compliance:
    - [ ] Audit logging enabled for all systems
    - [ ] Data retention policies configured
    - [ ] Compliance requirements documented
    - [ ] Incident response plan documented
```

### Compliance Verification

| Standard | Requirements | IAC Dharma Implementation |
|----------|-------------|--------------------------|
| **SOC 2** | Access controls, encryption, logging | ✅ RBAC, TLS, Audit logs |
| **GDPR** | Data privacy, right to deletion, consent | ✅ PII encryption, Data purge APIs |
| **HIPAA** | PHI protection, audit trails, access controls | ✅ Encryption, Logging, MFA |
| **PCI DSS** | Secure payments, network segmentation | ✅ Tokenization, Network policies |
| **ISO 27001** | Information security management | ✅ Security policies, Risk management |

---

## Environment Setup

### Development Environment Setup

**Purpose**: Local development and testing

**Infrastructure**:
- Single Docker host or local Kubernetes (minikube, kind, k3s)
- SQLite or PostgreSQL container
- Redis container
- Local file storage

**Configuration**:

```bash
# Clone repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac

# Create development environment file
cat > .env.development << EOF
NODE_ENV=development
LOG_LEVEL=debug

# API Gateway
API_GATEWAY_PORT=3000
API_GATEWAY_HOST=localhost

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=iac_dharma_dev
DATABASE_USER=dev_user
DATABASE_PASSWORD=dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRATION=24h

# Feature Flags
ENABLE_DEBUG_ENDPOINTS=true
ENABLE_METRICS=true
EOF

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Verify services
docker-compose ps
curl http://localhost:3000/health
```

**Development Environment Health Check**:

```bash
#!/bin/bash
# dev-health-check.sh

echo "🔍 Development Environment Health Check"
echo "========================================"

# Check Docker
if docker ps > /dev/null 2>&1; then
  echo "✅ Docker: Running"
else
  echo "❌ Docker: Not running"
  exit 1
fi

# Check services
services=("api-gateway:3000" "blueprint-service:3001" "postgres:5432" "redis:6379")
for service in "${services[@]}"; do
  name="${service%:*}"
  port="${service#*:}"
  if nc -z localhost $port 2>/dev/null; then
    echo "✅ $name: Healthy (port $port)"
  else
    echo "❌ $name: Not responding (port $port)"
  fi
done

echo ""
echo "🌐 Development URLs:"
echo "   API Gateway: http://localhost:3000"
echo "   API Docs: http://localhost:3000/api-docs"
echo "   Grafana: http://localhost:3030 (admin/admin)"
echo "   Prometheus: http://localhost:9090"
```

### Staging Environment Setup

**Purpose**: Pre-production testing and QA

**Infrastructure**:
- Kubernetes cluster (3 nodes minimum)
- Managed PostgreSQL database
- Managed Redis cluster
- Object storage (S3/Azure Blob/GCS)

**Configuration**:

```yaml
# k8s/overlays/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: iac-dharma-staging

resources:
  - ../../base

replicas:
  - name: api-gateway
    count: 2
  - name: blueprint-service
    count: 2
  - name: iac-generator
    count: 2

images:
  - name: api-gateway
    newTag: staging-latest
  - name: blueprint-service
    newTag: staging-latest

configMapGenerator:
  - name: app-config
    literals:
      - NODE_ENV=staging
      - LOG_LEVEL=info
      - ENABLE_DEBUG_ENDPOINTS=false

secretGenerator:
  - name: app-secrets
    envs:
      - secrets/staging.env
```

**Staging Deployment**:

```bash
# Deploy to staging
kubectl apply -k k8s/overlays/staging/

# Verify deployment
kubectl get pods -n iac-dharma-staging
kubectl get services -n iac-dharma-staging
kubectl get ingress -n iac-dharma-staging

# Run smoke tests
./scripts/run-smoke-tests.sh staging
```

### Production Environment Setup

**Purpose**: Live production workloads

**Infrastructure**:
- Kubernetes cluster (5+ nodes, multi-AZ)
- Managed PostgreSQL with read replicas (multi-AZ)
- Managed Redis cluster with failover
- Object storage with cross-region replication
- CDN for static assets
- WAF for security

**Production Deployment Checklist**:

```yaml
Pre-Deployment:
  - [ ] Staging environment fully tested
  - [ ] Load testing completed with expected traffic + 50%
  - [ ] Security scanning passed (Trivy, Snyk, etc.)
  - [ ] Database migrations tested and validated
  - [ ] Rollback plan documented and tested
  - [ ] Monitoring and alerting configured
  - [ ] On-call team notified
  - [ ] Change management approval obtained
  - [ ] Backup verification completed (last 7 days)
  - [ ] Maintenance window scheduled (if applicable)

During Deployment:
  - [ ] Monitor deployment progress (kubectl rollout status)
  - [ ] Watch metrics dashboard (Grafana)
  - [ ] Monitor error rates and latency
  - [ ] Verify health checks passing
  - [ ] Check application logs for errors
  - [ ] Validate database connectivity
  - [ ] Test critical user flows

Post-Deployment:
  - [ ] Smoke tests passed
  - [ ] Integration tests passed
  - [ ] Performance metrics within SLA
  - [ ] No critical errors in logs
  - [ ] Monitoring alerts normal
  - [ ] User acceptance testing completed
  - [ ] Documentation updated
  - [ ] Deployment post-mortem scheduled (if issues occurred)
```

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

### Docker Compose Deployment

**Best For**: Development, single-server deployments, small production workloads (<1000 users)

#### Basic Docker Compose Deployment

```bash
# 1. Clone repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac

# 2. Configure environment
cp .env.example .env.production
nano .env.production  # Edit configuration

# 3. Pull latest images
docker-compose -f docker-compose.prod.yml pull

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify deployment
docker-compose ps
docker-compose logs -f api-gateway
curl http://localhost:3000/health
```

#### Production Docker Compose Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api-gateway:
    image: iacdharma/api-gateway:1.0.0
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
    networks:
      - iac-network

  blueprint-service:
    image: iacdharma/blueprint-service:1.0.0
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    networks:
      - iac-network

  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    networks:
      - iac-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - iac-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      - api-gateway
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - iac-network

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  nginx-cache:
    driver: local

networks:
  iac-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

#### Docker Compose Scaling

```bash
# Scale specific services
docker-compose -f docker-compose.prod.yml up -d --scale api-gateway=3 --scale blueprint-service=2

# Verify scaling
docker-compose ps

# View logs from all replicas
docker-compose logs -f api-gateway

# Update a single service
docker-compose -f docker-compose.prod.yml up -d --no-deps --build api-gateway
```

#### Docker Compose Monitoring

```bash
# Real-time resource usage
docker stats

# Service health status
docker-compose ps

# View logs with timestamps
docker-compose logs --timestamps --tail=100 api-gateway

# Follow logs from all services
docker-compose logs -f

# Export metrics
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

### Docker Swarm Deployment

**Best For**: Mid-size production deployments (1K-10K users), built-in orchestration without Kubernetes complexity

#### Initialize Docker Swarm

```bash
# Initialize swarm on manager node
docker swarm init --advertise-addr <MANAGER-IP>

# Add worker nodes (run on each worker)
docker swarm join --token <WORKER-TOKEN> <MANAGER-IP>:2377

# Verify cluster
docker node ls
```

#### Deploy Stack to Swarm

```yaml
# docker-stack.yml
version: '3.8'

services:
  api-gateway:
    image: iacdharma/api-gateway:1.0.0
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    ports:
      - "3000:3000"
    networks:
      - iac-network
    environment:
      - NODE_ENV=production
    secrets:
      - db_password
      - jwt_secret
    configs:
      - source: app_config
        target: /app/config.yml

  postgres:
    image: postgres:14-alpine
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.storage == ssd
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - iac-network

volumes:
  postgres-data:
    driver: local

networks:
  iac-network:
    driver: overlay
    attachable: true

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true

configs:
  app_config:
    file: ./config/production.yml
```

#### Swarm Deployment Commands

```bash
# Create secrets
echo "supersecretpassword" | docker secret create db_password -
echo "jwt-secret-key-change-me" | docker secret create jwt_secret -

# Deploy stack
docker stack deploy -c docker-stack.yml iac-dharma

# Verify deployment
docker stack services iac-dharma
docker stack ps iac-dharma

# Scale services
docker service scale iac-dharma_api-gateway=5

# Update service with zero downtime
docker service update --image iacdharma/api-gateway:1.1.0 iac-dharma_api-gateway

# Rollback if needed
docker service update --rollback iac-dharma_api-gateway

# Remove stack
docker stack rm iac-dharma
```

---

### Kubernetes Production Deployment

**Best For**: Large-scale production (10K+ users), enterprise deployments, multi-tenant systems

#### Prerequisites

```bash
# Verify Kubernetes cluster
kubectl cluster-info
kubectl get nodes

# Create namespace
kubectl create namespace iac-dharma

# Set default namespace
kubectl config set-context --current --namespace=iac-dharma
```

#### Kubernetes Deployment Manifests

**API Gateway Deployment**:

```yaml
# k8s/base/api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: iac-dharma
  labels:
    app: api-gateway
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - api-gateway
                topologyKey: kubernetes.io/hostname
      containers:
        - name: api-gateway
          image: iacdharma/api-gateway:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3000"
            - name: DATABASE_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: database_host
            - name: DATABASE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database_password
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: jwt_secret
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "2000m"
              memory: "2Gi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 0
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 30
          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
            - name: logs
              mountPath: /app/logs
      volumes:
        - name: config
          configMap:
            name: app-config
        - name: logs
          emptyDir: {}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: iac-dharma
  labels:
    app: api-gateway
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
  selector:
    app: api-gateway
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: iac-dharma
data:
  database_host: "postgres-service"
  database_port: "5432"
  database_name: "iac_dharma"
  redis_host: "redis-service"
  redis_port: "6379"
  log_level: "info"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: iac-dharma
type: Opaque
stringData:
  database_password: "REPLACE_WITH_SECURE_PASSWORD"
  jwt_secret: "REPLACE_WITH_SECURE_JWT_SECRET"
  redis_password: "REPLACE_WITH_SECURE_REDIS_PASSWORD"
```

#### Kubernetes Deployment Commands

```bash
# Apply all manifests
kubectl apply -f k8s/base/

# Or use kustomize for environment-specific configs
kubectl apply -k k8s/overlays/production/

# Verify deployment
kubectl get deployments
kubectl get pods
kubectl get services

# Check rollout status
kubectl rollout status deployment/api-gateway

# View logs
kubectl logs -f deployment/api-gateway --tail=100

# Execute commands in pod
kubectl exec -it deployment/api-gateway -- /bin/sh

# Port forward for testing
kubectl port-forward service/api-gateway 3000:80
```

#### Horizontal Pod Autoscaling

```yaml
# k8s/base/api-gateway-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: iac-dharma
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
        - type: Pods
          value: 2
          periodSeconds: 60
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
        - type: Pods
          value: 1
          periodSeconds: 60
      selectPolicy: Min
```

```bash
# Apply HPA
kubectl apply -f k8s/base/api-gateway-hpa.yaml

# Monitor autoscaling
kubectl get hpa -w
kubectl describe hpa api-gateway-hpa
```

#### Ingress Configuration

```yaml
# k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iac-dharma-ingress
  namespace: iac-dharma
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/limit-rps: "10"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "30"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.iacdharma.com
      secretName: iacdharma-tls
  rules:
    - host: api.iacdharma.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 80
          - path: /api/blueprints
            pathType: Prefix
            backend:
              service:
                name: blueprint-service
                port:
                  number: 80
```

```bash
# Apply ingress
kubectl apply -f k8s/base/ingress.yaml

# Verify ingress
kubectl get ingress
kubectl describe ingress iac-dharma-ingress

# Test external access
curl https://api.iacdharma.com/health
```

---

### Helm Deployment

**Best For**: Kubernetes deployments with complex configurations, multi-environment management

#### Install IAC Dharma via Helm

```bash
# Add Helm repository
helm repo add iacdharma https://raghavendra198902.github.io/iac-helm-charts
helm repo update

# Search for chart
helm search repo iacdharma

# Install with default values
helm install iac-dharma iacdharma/iac-dharma --namespace iac-dharma --create-namespace

# Install with custom values
helm install iac-dharma iacdharma/iac-dharma \
  --namespace iac-dharma \
  --create-namespace \
  --values values-production.yaml

# Verify installation
helm list -n iac-dharma
kubectl get all -n iac-dharma
```

#### Custom Helm Values

```yaml
# values-production.yaml
replicaCount: 5

image:
  repository: iacdharma/api-gateway
  tag: "1.0.0"
  pullPolicy: IfNotPresent

resources:
  limits:
    cpu: 2000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.iacdharma.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: iacdharma-tls
      hosts:
        - api.iacdharma.com

postgresql:
  enabled: true
  auth:
    username: iacdharma
    password: "CHANGE_ME"
    database: iac_dharma
  primary:
    persistence:
      enabled: true
      size: 100Gi
      storageClass: "fast-ssd"
  readReplicas:
    replicaCount: 2

redis:
  enabled: true
  auth:
    password: "CHANGE_ME"
  master:
    persistence:
      enabled: true
      size: 10Gi
  replica:
    replicaCount: 2

monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
  prometheusRule:
    enabled: true

networkPolicy:
  enabled: true
  policyTypes:
    - Ingress
    - Egress
```

#### Helm Management Commands

```bash
# Upgrade deployment
helm upgrade iac-dharma iacdharma/iac-dharma \
  --namespace iac-dharma \
  --values values-production.yaml \
  --atomic \
  --timeout 10m

# Rollback to previous version
helm rollback iac-dharma -n iac-dharma

# Rollback to specific revision
helm rollback iac-dharma 3 -n iac-dharma

# View deployment history
helm history iac-dharma -n iac-dharma

# Get values
helm get values iac-dharma -n iac-dharma

# Uninstall
helm uninstall iac-dharma -n iac-dharma
```

---

