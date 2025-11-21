# Kubernetes Deployment Guide

**Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Phase:** 6 - Task 14: Container Orchestration

---

## Overview

This guide covers deploying the IAC Dharma platform to Kubernetes clusters across development, staging, and production environments using Kustomize for configuration management.

### Architecture

```
IAC Dharma Kubernetes Architecture
==================================

┌─────────────────────────────────────────────────────┐
│               Ingress Controller                     │
│            (Nginx + cert-manager)                    │
│                                                      │
│  iacdharma.com → Frontend                           │
│  api.iacdharma.com → API Gateway                    │
└───────────────────┬─────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌──────────┐   ┌──────────────┐
│Frontend │   │   API    │   │   Backend    │
│ (React) │   │ Gateway  │   │  Services    │
│         │   │          │   │  (8 µservices│
│ 3 pods  │   │ 2-10 pods│   │   2 pods ea.)│
└─────────┘   └─────┬────┘   └───────┬──────┘
                    │                │
                    └────────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │PostgreSQL│  │  Redis   │  │ Secrets  │
        │StatefulSet│ │StatefulSet│ │ConfigMaps│
        │  1 pod   │  │  1 pod   │  │          │
        │  10Gi PV │  │  5Gi PV  │  │          │
        └──────────┘  └──────────┘  └──────────┘
```

---

## Prerequisites

### Required Tools

```bash
# kubectl (Kubernetes CLI)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/

# Helm (for cert-manager, nginx-ingress)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Optional: k9s (Kubernetes TUI)
curl -sS https://webinstall.dev/k9s | bash
```

### Kubernetes Cluster Requirements

#### Development Cluster
- **Nodes:** 2 x t3.medium (2 vCPU, 4GB RAM)
- **Total Resources:** 4 vCPU, 8GB RAM
- **Storage:** 50GB
- **Cost:** ~$70/month

#### Staging Cluster
- **Nodes:** 3 x t3.medium (2 vCPU, 4GB RAM)
- **Total Resources:** 6 vCPU, 12GB RAM
- **Storage:** 100GB
- **Cost:** ~$105/month

#### Production Cluster
- **Nodes:** 5 x t3.large (2 vCPU, 8GB RAM)
- **Total Resources:** 10 vCPU, 40GB RAM
- **Storage:** 200GB
- **High Availability:** Multi-AZ
- **Cost:** ~$350/month

---

## Quick Start

### 1. Connect to Cluster

```bash
# Development
kubectl config use-context dev-cluster

# Staging
kubectl config use-context staging-cluster

# Production
kubectl config use-context production-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### 2. Install Prerequisites

#### Install Nginx Ingress Controller

```bash
# Add Helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install ingress controller
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.service.type=LoadBalancer \
  --set controller.metrics.enabled=true

# Verify installation
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

#### Install cert-manager (SSL/TLS)

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# Create Let's Encrypt issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@iacdharma.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 3. Create GitHub Container Registry Secret

```bash
# Create secret for pulling images from ghcr.io
kubectl create secret docker-registry ghcr-secret \
  --namespace=iacdharma \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN> \
  --docker-email=<YOUR_EMAIL>
```

### 4. Deploy Application

#### Development

```bash
# Navigate to k8s directory
cd /path/to/Iac/k8s

# Review what will be deployed
kubectl kustomize overlays/development

# Deploy to development
kubectl apply -k overlays/development

# Watch deployment
kubectl get pods -n iacdharma-dev -w

# Check services
kubectl get svc -n iacdharma-dev
```

#### Production

```bash
# Review production configuration
kubectl kustomize overlays/production

# Deploy to production (requires confirmation)
kubectl apply -k overlays/production

# Monitor rollout
kubectl rollout status deployment/prod-api-gateway -n iacdharma-prod
kubectl rollout status deployment/prod-frontend -n iacdharma-prod

# Verify all pods are running
kubectl get pods -n iacdharma-prod
```

---

## Configuration Management

### Environment-Specific Configuration

The deployment uses **Kustomize** for environment-specific configurations:

```
k8s/
├── base/                    # Base configurations
│   ├── namespace.yaml       # Namespace definition
│   ├── configmap.yaml       # Common config
│   ├── secrets.yaml         # Base secrets (override per env)
│   ├── postgres.yaml        # Database StatefulSet
│   ├── redis.yaml           # Cache StatefulSet
│   ├── api-gateway.yaml     # API Gateway + HPA
│   ├── blueprint-service.yaml
│   ├── backend-services.yaml # All backend services
│   ├── frontend.yaml        # React frontend
│   ├── ingress.yaml         # Ingress rules
│   └── kustomization.yaml
│
└── overlays/
    ├── development/         # Dev-specific overrides
    │   ├── kustomization.yaml
    │   ├── deployment-patches.yaml
    │   └── ingress-patch.yaml
    │
    ├── staging/             # Staging-specific overrides
    │   └── kustomization.yaml
    │
    └── production/          # Production-specific overrides
        ├── kustomization.yaml
        ├── deployment-patches.yaml
        ├── ingress-patch.yaml
        └── resource-quotas.yaml
```

### Updating Configuration

#### Update ConfigMap

```bash
# Edit configmap
kubectl edit configmap app-config -n iacdharma

# Or apply changes
kubectl apply -f k8s/base/configmap.yaml -n iacdharma

# Restart pods to pick up changes
kubectl rollout restart deployment/api-gateway -n iacdharma
```

#### Update Secrets

```bash
# NEVER commit secrets to git!
# Update secrets manually:
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD='new_secure_password' \
  --from-literal=JWT_SECRET='new_jwt_secret_32_chars' \
  --dry-run=client -o yaml | kubectl apply -f - -n iacdharma

# Restart pods
kubectl rollout restart deployment/api-gateway -n iacdharma
```

---

## Operations

### Monitoring Deployments

#### Check Pod Status

```bash
# Get all pods in namespace
kubectl get pods -n iacdharma

# Describe pod (troubleshooting)
kubectl describe pod <pod-name> -n iacdharma

# Get pod logs
kubectl logs <pod-name> -n iacdharma

# Follow logs in real-time
kubectl logs -f <pod-name> -n iacdharma

# Get logs from previous container (if crashed)
kubectl logs <pod-name> -n iacdharma --previous
```

#### Check Service Status

```bash
# Get all services
kubectl get svc -n iacdharma

# Check ingress
kubectl get ingress -n iacdharma
kubectl describe ingress iacdharma-ingress -n iacdharma

# Get external IP
kubectl get svc nginx-ingress-controller -n ingress-nginx
```

#### Check Resource Usage

```bash
# Node resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -n iacdharma

# Check HPA status
kubectl get hpa -n iacdharma
kubectl describe hpa api-gateway-hpa -n iacdharma
```

### Scaling

#### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment api-gateway --replicas=5 -n iacdharma

# Check scaling status
kubectl get deployment api-gateway -n iacdharma
```

#### Auto-Scaling (HPA)

HPA is configured for:
- API Gateway: 2-10 replicas (70% CPU)
- Frontend: 3-10 replicas (70% CPU)
- All backend services: 2-8 replicas (70% CPU)

```bash
# Check HPA status
kubectl get hpa -n iacdharma

# Describe HPA
kubectl describe hpa api-gateway-hpa -n iacdharma

# Update HPA
kubectl edit hpa api-gateway-hpa -n iacdharma
```

### Rolling Updates

#### Update Image Version

```bash
# Update via kustomize (recommended)
cd k8s/overlays/production

# Edit kustomization.yaml to change image tag
# Then apply:
kubectl apply -k .

# Or update directly
kubectl set image deployment/api-gateway \
  api-gateway=ghcr.io/owner/iacdharma-api-gateway:v1.1.0 \
  -n iacdharma

# Watch rollout
kubectl rollout status deployment/api-gateway -n iacdharma

# Check rollout history
kubectl rollout history deployment/api-gateway -n iacdharma
```

#### Rollback Deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/api-gateway -n iacdharma

# Rollback to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2 -n iacdharma

# Check rollout history
kubectl rollout history deployment/api-gateway -n iacdharma
```

### Database Operations

#### Access PostgreSQL

```bash
# Port-forward to local machine
kubectl port-forward statefulset/postgres 5432:5432 -n iacdharma

# Connect with psql
psql -h localhost -U dharma_admin -d iac_dharma

# Or exec into pod
kubectl exec -it postgres-0 -n iacdharma -- psql -U dharma_admin -d iac_dharma
```

#### Backup Database

```bash
# Create backup
kubectl exec -it postgres-0 -n iacdharma -- \
  pg_dump -U dharma_admin iac_dharma > backup-$(date +%Y%m%d).sql

# Restore backup
kubectl exec -i postgres-0 -n iacdharma -- \
  psql -U dharma_admin iac_dharma < backup-20251116.sql
```

#### Access Redis

```bash
# Port-forward Redis
kubectl port-forward statefulset/redis 6379:6379 -n iacdharma

# Connect with redis-cli
redis-cli -h localhost -p 6379

# Or exec into pod
kubectl exec -it redis-0 -n iacdharma -- redis-cli
```

---

## Troubleshooting

### Common Issues

#### 1. Pod Stuck in Pending

**Symptoms:**
```
NAME                READY   STATUS    RESTARTS   AGE
api-gateway-xxx     0/1     Pending   0          5m
```

**Causes & Solutions:**

```bash
# Check events
kubectl describe pod api-gateway-xxx -n iacdharma

# Common causes:
# 1. Insufficient resources
kubectl top nodes  # Check node capacity

# 2. PVC not bound
kubectl get pvc -n iacdharma

# 3. Image pull error
kubectl describe pod api-gateway-xxx -n iacdharma | grep -A 5 Events
```

#### 2. CrashLoopBackOff

**Symptoms:**
```
NAME                READY   STATUS             RESTARTS   AGE
api-gateway-xxx     0/1     CrashLoopBackOff   5          5m
```

**Solutions:**

```bash
# Check logs
kubectl logs api-gateway-xxx -n iacdharma

# Check previous logs (if crashed)
kubectl logs api-gateway-xxx -n iacdharma --previous

# Common causes:
# 1. Database connection failure (check DB_HOST, credentials)
# 2. Missing environment variables
# 3. Application error

# Describe pod for more details
kubectl describe pod api-gateway-xxx -n iacdharma
```

#### 3. ImagePullBackOff

**Symptoms:**
```
NAME                READY   STATUS             RESTARTS   AGE
api-gateway-xxx     0/1     ImagePullBackOff   0          2m
```

**Solutions:**

```bash
# Check if image exists
docker pull ghcr.io/owner/iacdharma-api-gateway:latest

# Verify image pull secret
kubectl get secret ghcr-secret -n iacdharma

# Recreate secret if needed
kubectl delete secret ghcr-secret -n iacdharma
kubectl create secret docker-registry ghcr-secret \
  --namespace=iacdharma \
  --docker-server=ghcr.io \
  --docker-username=<USERNAME> \
  --docker-password=<GITHUB_TOKEN> \
  --docker-email=<EMAIL>

# Update deployment to trigger re-pull
kubectl rollout restart deployment/api-gateway -n iacdharma
```

#### 4. Service Not Accessible

**Symptoms:**
- Cannot access service via ingress
- 502 Bad Gateway errors

**Solutions:**

```bash
# Check ingress
kubectl get ingress -n iacdharma
kubectl describe ingress iacdharma-ingress -n iacdharma

# Check if pods are ready
kubectl get pods -n iacdharma

# Check service endpoints
kubectl get endpoints -n iacdharma

# Test service internally
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside pod:
apk add curl
curl http://api-gateway-service.iacdharma.svc.cluster.local:3000/health

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

---

## Security Best Practices

### 1. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: iacdharma
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### 2. Pod Security Standards

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: iacdharma
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### 3. RBAC

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: iacdharma-deployer
  namespace: iacdharma
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployer-role
  namespace: iacdharma
rules:
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "update", "patch"]
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-binding
  namespace: iacdharma
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: deployer-role
subjects:
- kind: ServiceAccount
  name: iacdharma-deployer
  namespace: iacdharma
```

---

## Helper Scripts

See `/scripts/k8s-*.sh` for helper scripts:

- `k8s-deploy.sh` - Deploy to specific environment
- `k8s-status.sh` - Check status of all resources
- `k8s-logs.sh` - Aggregate logs from all pods
- `k8s-cleanup.sh` - Clean up resources

---

## Next Steps

1. **Complete Task 14:** All Kubernetes manifests created ✅
2. **Task 15:** Create Terraform modules to provision clusters
3. **Task 16:** Configure environment-specific secrets and configs
4. **Task 17:** Deploy Prometheus + Grafana monitoring
5. **Task 18:** Implement backup and disaster recovery

---

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)

---

**Document Status:** ✅ Complete  
**Last Review:** November 16, 2025  
**Owner:** DevOps Team
