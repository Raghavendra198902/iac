# Kubernetes Deployment Guide

Complete guide for deploying IAC Dharma on Kubernetes with production-grade configuration, high availability, security, and observability.

---

## Table of Contents

| Section | Description | Time |
|---------|-------------|------|
| [Overview](#overview) | K8s deployment architecture | 5 min |
| [Prerequisites](#prerequisites) | Requirements and tools | 10 min |
| [Quick Start](#quick-start) | Fast deployment (Helm/kubectl) | 15 min |
| [Architecture](#architecture) | System design and components | 10 min |
| [Namespace Setup](#namespace-setup) | Resource organization | 5 min |
| [Configuration](#configuration) | ConfigMaps and Secrets | 15 min |
| [Database](#database-deployment) | PostgreSQL StatefulSet | 20 min |
| [Cache](#cache-deployment) | Redis StatefulSet | 15 min |
| [Services](#service-deployments) | Microservices deployment | 30 min |
| [Ingress](#ingress-configuration) | External access and TLS | 20 min |
| [Storage](#persistent-storage) | PV, PVC, StorageClass | 15 min |
| [Networking](#networking) | Network policies and service mesh | 20 min |
| [Security](#security) | RBAC, PSP, Pod Security | 25 min |
| [Monitoring](#monitoring-stack) | Prometheus, Grafana, Jaeger | 25 min |
| [Autoscaling](#autoscaling) | HPA, VPA, Cluster Autoscaler | 20 min |
| [Upgrades](#rolling-updates) | Zero-downtime deployments | 15 min |
| [Backup & DR](#backup-disaster-recovery) | Velero, data protection | 20 min |
| [Troubleshooting](#troubleshooting) | Common issues and solutions | 15 min |
| [Production Checklist](#production-checklist) | Pre-launch validation | 10 min |

**Total Time**: ~4-5 hours for complete production setup

---

## Overview

### Why Kubernetes?

IAC Dharma on Kubernetes provides:

- **Scalability**: Auto-scale from 3 to 100+ pods based on load
- **High Availability**: Multi-replica deployments with automatic failover
- **Resource Efficiency**: Optimal CPU/memory utilization with bin-packing
- **Self-Healing**: Automatic pod restart and rescheduling
- **Rolling Updates**: Zero-downtime deployments with automatic rollback
- **Service Discovery**: Built-in DNS and load balancing
- **Cloud Agnostic**: Deploy on any K8s cluster (EKS, GKE, AKS, on-prem)

### Deployment Options

| Option | Best For | Setup Time | Complexity |
|--------|----------|------------|------------|
| **Helm Chart** | Quick start, standardized | 15 min | Low |
| **Kustomize** | Customization, GitOps | 30 min | Medium |
| **kubectl** | Manual control, learning | 45 min | High |
| **Terraform** | Infrastructure as Code | 60 min | High |

### Resource Requirements

#### Minimum (Development/Testing)

- **Nodes**: 3 nodes (1 master + 2 workers)
- **CPU**: 8 cores total (4 cores/node)
- **Memory**: 16 GB total (8 GB/node)
- **Storage**: 100 GB total

#### Recommended (Production)

- **Nodes**: 6+ nodes (3 masters + 3+ workers)
- **CPU**: 32+ cores total
- **Memory**: 64+ GB total
- **Storage**: 500+ GB SSD

#### Expected Resource Usage

| Component | Replicas | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|----------|-------------|-----------|----------------|--------------|
| API Gateway | 3-5 | 250m | 500m | 256Mi | 512Mi |
| IAC Generator | 3 | 500m | 1000m | 512Mi | 1Gi |
| Blueprint Service | 3 | 250m | 500m | 256Mi | 512Mi |
| Orchestrator | 2 | 500m | 1000m | 512Mi | 1Gi |
| Guardrails | 2 | 250m | 500m | 256Mi | 512Mi |
| Costing Service | 2 | 250m | 500m | 256Mi | 512Mi |
| AI Engine | 2 | 1000m | 2000m | 1Gi | 2Gi |
| CMDB | 2 | 250m | 500m | 256Mi | 512Mi |
| Monitoring | 2 | 250m | 500m | 256Mi | 512Mi |
| Frontend | 3 | 100m | 200m | 128Mi | 256Mi |
| PostgreSQL | 3 | 1000m | 2000m | 2Gi | 4Gi |
| Redis | 3 | 500m | 1000m | 512Mi | 1Gi |
| **Total** | **28-32** | **~6 cores** | **~12 cores** | **~8 GB** | **~16 GB** |

---

## Prerequisites

### Required Tools

#### 1. Kubernetes Cluster

**Cloud Providers**:

```bash
# AWS EKS
eksctl create cluster \
  --name iac-dharma \
  --region us-east-1 \
  --nodes 3 \
  --node-type t3.large

# Google GKE
gcloud container clusters create iac-dharma \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-4

# Azure AKS
az aks create \
  --resource-group iac-dharma-rg \
  --name iac-dharma \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3
```

**Local Development**:

```bash
# Minikube
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=50g \
  --driver=docker

# Kind (Kubernetes in Docker)
kind create cluster --config kind-config.yaml

# k3s (Lightweight)
curl -sfL https://get.k3s.io | sh -
```

#### 2. kubectl

```bash
# Install kubectl
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Windows (PowerShell)
choco install kubernetes-cli

# Verify installation
kubectl version --client --output=yaml
```

#### 3. Helm

```bash
# Install Helm 3
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows
choco install kubernetes-helm

# Verify
helm version
```

#### 4. Additional Tools

```bash
# Kustomize (if not using kubectl 1.14+)
brew install kustomize

# kubectx and kubens (context/namespace switching)
brew install kubectx

# k9s (terminal UI)
brew install k9s

# Stern (multi-pod log tailing)
brew install stern

# Velero (backup/restore)
brew install velero
```

### Cluster Validation

```bash
#!/bin/bash
# validate-cluster.sh - Verify cluster readiness

echo "=== Kubernetes Cluster Validation ==="
echo ""

# Check cluster info
echo "Cluster Info:"
kubectl cluster-info
echo ""

# Check nodes
echo "Node Status:"
kubectl get nodes -o wide
echo ""

# Check node resources
echo "Node Resources:"
kubectl top nodes 2>/dev/null || echo "Metrics Server not installed"
echo ""

# Check storage classes
echo "Storage Classes:"
kubectl get storageclass
echo ""

# Check Kubernetes version
K8S_VERSION=$(kubectl version --short 2>/dev/null | grep Server | awk '{print $3}')
echo "Kubernetes Version: $K8S_VERSION"

# Version check
REQUIRED_VERSION="1.28"
if [[ $(echo -e "$K8S_VERSION\n$REQUIRED_VERSION" | sort -V | head -n1) != "$REQUIRED_VERSION" ]]; then
    echo "⚠️  Warning: Kubernetes $REQUIRED_VERSION+ recommended"
else
    echo "✅ Kubernetes version OK"
fi
echo ""

# Check for metrics server
if kubectl get deployment metrics-server -n kube-system &>/dev/null; then
    echo "✅ Metrics Server installed"
else
    echo "⚠️  Metrics Server not found (required for HPA)"
    echo "   Install: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
fi
echo ""

# Check available resources
echo "Available Cluster Resources:"
kubectl describe nodes | grep -A 5 "Allocated resources"
echo ""

echo "=== Validation Complete ==="
```

**Run validation**:

```bash
chmod +x validate-cluster.sh
./validate-cluster.sh
```

### Install Metrics Server

Required for HPA (Horizontal Pod Autoscaler):

```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For development clusters (disable TLS verification)
kubectl patch deployment metrics-server -n kube-system --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Verify
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
```

### Install Ingress Controller

**NGINX Ingress**:

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

# Verify
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

**Traefik**:

```bash
# Install Traefik
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik \
  --namespace traefik \
  --create-namespace
```

### Install Cert-Manager (TLS)

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Verify
kubectl get pods -n cert-manager

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

---

## Quick Start

### Option 1: Helm Deployment (Recommended)

#### Step 1: Add Helm Repository

```bash
# Add IAC Dharma Helm repo
helm repo add iac-dharma https://charts.iacdharma.io
helm repo update

# Search available charts
helm search repo iac-dharma
```

#### Step 2: Create values.yaml

```yaml
# values.yaml - Production configuration
global:
  environment: production
  domain: iac.yourdomain.com

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: iac.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: iac-dharma-tls
      hosts:
        - iac.yourdomain.com

apiGateway:
  replicaCount: 3
  image:
    repository: iacdharma/api-gateway
    tag: "1.0.0"
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70

postgresql:
  enabled: true
  auth:
    username: dharma
    password: "CHANGE_ME"
    database: iac_platform
  primary:
    persistence:
      enabled: true
      size: 20Gi
      storageClass: gp3
  resources:
    requests:
      cpu: 1000m
      memory: 2Gi
    limits:
      cpu: 2000m
      memory: 4Gi

redis:
  enabled: true
  auth:
    enabled: true
    password: "CHANGE_ME"
  master:
    persistence:
      enabled: true
      size: 10Gi
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

monitoring:
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPassword: "CHANGE_ME"
  jaeger:
    enabled: true

security:
  jwt:
    secret: "CHANGE_ME"  # Generate with: openssl rand -base64 32
  encryption:
    key: "CHANGE_ME"     # Generate with: openssl rand -hex 32
```

#### Step 3: Install with Helm

```bash
# Install IAC Dharma
helm install iac-dharma iac-dharma/iac-dharma \
  --namespace iac-dharma \
  --create-namespace \
  --values values.yaml \
  --timeout 10m \
  --wait

# Verify installation
helm status iac-dharma -n iac-dharma
kubectl get pods -n iac-dharma
```

#### Step 4: Access Platform

```bash
# Get ingress IP/hostname
kubectl get ingress -n iac-dharma

# Or port-forward for testing
kubectl port-forward -n iac-dharma svc/api-gateway 3000:3000
```

### Option 2: kubectl with Kustomize

#### Step 1: Clone Repository

```bash
# Clone IAC Dharma repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac
```

#### Step 2: Customize Configuration

```bash
# Edit kustomization for your environment
cd k8s/overlays/production

# Update kustomization.yaml
nano kustomization.yaml
```

**k8s/overlays/production/kustomization.yaml**:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: iac-dharma

bases:
  - ../../base

resources:
  - namespace.yaml
  - ingress.yaml
  - certificates.yaml

configMapGenerator:
  - name: iac-dharma-config
    literals:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - DATABASE_HOST=postgres
      - REDIS_HOST=redis

secretGenerator:
  - name: iac-dharma-secrets
    literals:
      - JWT_SECRET=CHANGE_ME
      - DB_PASSWORD=CHANGE_ME
      - REDIS_PASSWORD=CHANGE_ME

replicas:
  - name: api-gateway
    count: 3
  - name: iac-generator
    count: 3
  - name: blueprint-service
    count: 3

images:
  - name: iacdharma/api-gateway
    newTag: 1.0.0
  - name: iacdharma/iac-generator
    newTag: 1.0.0
  - name: iacdharma/blueprint-service
    newTag: 1.0.0

patches:
  - path: resource-limits.yaml
  - path: production-env.yaml
```

#### Step 3: Deploy with kubectl

```bash
# Apply configuration
kubectl apply -k k8s/overlays/production/

# Verify deployment
kubectl get all -n iac-dharma

# Watch rollout
kubectl rollout status deployment/api-gateway -n iac-dharma
```

### Option 3: Manual kubectl Deployment

#### Step 1: Create Namespace

```bash
kubectl create namespace iac-dharma
kubectl label namespace iac-dharma environment=production
```

#### Step 2: Deploy Resources

```bash
# Apply in order
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/base/secrets.yaml
kubectl apply -f k8s/base/postgres-statefulset.yaml
kubectl apply -f k8s/base/redis-statefulset.yaml
kubectl apply -f k8s/base/services/
kubectl apply -f k8s/base/deployments/
kubectl apply -f k8s/base/ingress.yaml

# Verify
kubectl get all -n iac-dharma
```

---

## Architecture

### Kubernetes Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                    (Cloud LB / MetalLB)                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                     Ingress Controller                           │
│              (NGINX / Traefik / Kong / Istio)                   │
│  - TLS Termination                                              │
│  - Path-based routing                                           │
│  - Rate limiting                                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
    ┌────▼────┐                                 ┌────▼────┐
    │Frontend │                                 │   API   │
    │Service  │                                 │ Gateway │
    │(ClusterIP)                               │ Service │
    └────┬────┘                                 └────┬────┘
         │                                           │
    ┌────▼────────┐                        ┌────────▼───────────┐
    │  Frontend   │                        │   API Gateway      │
    │ Deployment  │                        │   Deployment       │
    │  (3 pods)   │                        │   (3-10 pods)      │
    │             │                        │   - HPA enabled    │
    └─────────────┘                        └────────┬───────────┘
                                                    │
                              ┌────────────────────┼─────────────────────┐
                              │                    │                     │
                         ┌────▼────┐          ┌───▼───┐          ┌──────▼──────┐
                         │Blueprint│          │  IAC  │          │Orchestrator│
                         │ Service │          │ Gen.  │          │  Service   │
                         │(3 pods) │          │(3 pod)│          │  (2 pods)  │
                         └────┬────┘          └───┬───┘          └──────┬──────┘
                              │                   │                     │
         ┌────────────────────┴───────────────────┴─────────────────────┴─────┐
         │                                                                    │
    ┌────▼────┐   ┌──────────┐   ┌─────────┐   ┌───────┐   ┌────────────┐   │
    │Guardrails│   │ Costing │   │   AI    │   │ CMDB  │   │ Monitoring │   │
    │(2 pods) │   │(2 pods) │   │ Engine  │   │(2pods)│   │  (2 pods)  │   │
    └────┬────┘   └─────┬────┘   │(2 pods) │   └───┬───┘   └──────┬─────┘   │
         │              │         └────┬────┘       │              │         │
         └──────────────┴──────────────┴────────────┴──────────────┴─────────┘
                                      │
                    ┌─────────────────┴──────────────────┐
                    │                                    │
              ┌─────▼─────┐                      ┌───────▼──────┐
              │PostgreSQL │                      │    Redis     │
              │StatefulSet│                      │ StatefulSet  │
              │ (3 pods)  │                      │  (3 pods)    │
              │ - Primary │                      │  - Sentinel  │
              │ - Replicas│                      │  - Replication│
              └─────┬─────┘                      └───────┬──────┘
                    │                                    │
              ┌─────▼─────┐                      ┌───────▼──────┐
              │   PVC     │                      │     PVC      │
              │  (20Gi)   │                      │   (10Gi)     │
              └───────────┘                      └──────────────┘
```

### Component Breakdown

#### Frontend Tier
- **Frontend Deployment**: 3 pods (React/Vite application)
- **Service Type**: ClusterIP
- **Resources**: 100m CPU, 128Mi Memory per pod

#### API Tier
- **API Gateway**: 3-10 pods (HPA enabled)
- **Service Type**: ClusterIP with session affinity
- **Resources**: 250m-500m CPU, 256Mi-512Mi Memory per pod

#### Microservices Tier
- **Blueprint Service**: 3 pods
- **IAC Generator**: 3 pods (CPU intensive)
- **Orchestrator**: 2 pods
- **Guardrails Engine**: 2 pods
- **Costing Service**: 2 pods
- **AI Engine**: 2 pods (memory intensive)
- **CMDB**: 2 pods
- **Monitoring Service**: 2 pods

#### Data Tier
- **PostgreSQL**: StatefulSet with 3 pods (primary + 2 replicas)
- **Redis**: StatefulSet with 3 pods (Sentinel configuration)
- **Persistent Volumes**: Dedicated PVCs for each StatefulSet pod

#### Observability Stack
- **Prometheus**: Metrics collection (1 pod + 2 alertmanagers)
- **Grafana**: Visualization dashboards (2 pods)
- **Jaeger**: Distributed tracing (all-in-one or production setup)
- **Loki**: Log aggregation (optional)

---

## Namespace Setup

### Create Namespace with Labels

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: iac-dharma
  labels:
    name: iac-dharma
    environment: production
    app.kubernetes.io/name: iac-dharma
    app.kubernetes.io/version: "1.0.0"
    app.kubernetes.io/component: platform
    app.kubernetes.io/part-of: infrastructure-as-code
    app.kubernetes.io/managed-by: kubectl
  annotations:
    description: "IAC Dharma Infrastructure as Code Platform"
    owner: "platform-team@company.com"
    cost-center: "engineering"
```

```bash
kubectl apply -f namespace.yaml
```

### Resource Quotas

Limit namespace resource consumption:

```yaml
# resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: iac-dharma-quota
  namespace: iac-dharma
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.cpu: "40"
    limits.memory: 80Gi
    persistentvolumeclaims: "10"
    services.loadbalancers: "2"
    pods: "50"
```

### Limit Ranges

Set default resource limits for pods:

```yaml
# limit-range.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: iac-dharma-limits
  namespace: iac-dharma
spec:
  limits:
  - max:
      cpu: "2"
      memory: 4Gi
    min:
      cpu: 100m
      memory: 64Mi
    default:
      cpu: 500m
      memory: 512Mi
    defaultRequest:
      cpu: 250m
      memory: 256Mi
    type: Container
  - max:
      storage: 100Gi
    min:
      storage: 1Gi
    type: PersistentVolumeClaim
```

```bash
kubectl apply -f resource-quota.yaml
kubectl apply -f limit-range.yaml

# Verify
kubectl describe namespace iac-dharma
kubectl get resourcequota -n iac-dharma
kubectl get limitrange -n iac-dharma
```

---

## Configuration

### ConfigMap

Centralized non-sensitive configuration:

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: iac-dharma-config
  namespace: iac-dharma
  labels:
    app: iac-dharma
data:
  # Application
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  LOG_FORMAT: "json"
  
  # Database
  DATABASE_HOST: "postgres"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "iac_platform"
  DATABASE_POOL_MIN: "2"
  DATABASE_POOL_MAX: "20"
  DATABASE_IDLE_TIMEOUT: "10000"
  DATABASE_CONNECTION_TIMEOUT: "5000"
  
  # Redis
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
  REDIS_DB: "0"
  CACHE_TTL: "3600"
  
  # Features
  FEATURE_AI_ENABLED: "true"
  FEATURE_COSTING_ENABLED: "true"
  FEATURE_GUARDRAILS_ENABLED: "true"
  FEATURE_SSO_ENABLED: "false"
  
  # Microservices
  IAC_GENERATOR_URL: "http://iac-generator:3001"
  BLUEPRINT_SERVICE_URL: "http://blueprint-service:3002"
  ORCHESTRATOR_URL: "http://orchestrator:3003"
  GUARDRAILS_URL: "http://guardrails:3004"
  COSTING_URL: "http://costing-service:3005"
  AI_ENGINE_URL: "http://ai-engine:3006"
  CMDB_URL: "http://cmdb:3007"
  MONITORING_URL: "http://monitoring-service:3008"
  
  # Observability
  JAEGER_AGENT_HOST: "jaeger-agent"
  JAEGER_AGENT_PORT: "6831"
  JAEGER_SAMPLER_TYPE: "probabilistic"
  JAEGER_SAMPLER_PARAM: "0.1"
  
  # Prometheus
  PROMETHEUS_ENABLED: "true"
  PROMETHEUS_PORT: "9090"
  
  # CORS
  CORS_ORIGIN: "https://iac.yourdomain.com"
  CORS_CREDENTIALS: "true"
  
  # Rate Limiting
  RATE_LIMIT_WINDOW: "15m"
  RATE_LIMIT_MAX_REQUESTS: "1000"
```

```bash
kubectl apply -f configmap.yaml
```

### Secrets Management

#### Option 1: kubectl create secret

```bash
# Create secrets from literals
kubectl create secret generic iac-dharma-secrets \
  --from-literal=jwt-secret=$(openssl rand -base64 32) \
  --from-literal=db-password=$(openssl rand -base64 24) \
  --from-literal=redis-password=$(openssl rand -base64 24) \
  --from-literal=encryption-key=$(openssl rand -hex 32) \
  --from-literal=grafana-admin-password=$(openssl rand -base64 16) \
  --namespace=iac-dharma

# Create secrets from file
kubectl create secret generic iac-dharma-secrets \
  --from-env-file=.env.production \
  --namespace=iac-dharma

# Create TLS secret
kubectl create secret tls iac-dharma-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  --namespace=iac-dharma
```

#### Option 2: YAML Manifest (Base64 encoded)

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: iac-dharma-secrets
  namespace: iac-dharma
type: Opaque
data:
  # Base64 encoded values
  # Generate with: echo -n 'secret-value' | base64
  jwt-secret: <base64-encoded>
  db-password: <base64-encoded>
  redis-password: <base64-encoded>
  encryption-key: <base64-encoded>
```

**Generate base64 values**:

```bash
#!/bin/bash
# generate-secrets.sh

echo "Generating secrets..."
echo ""

echo "JWT_SECRET:"
echo -n $(openssl rand -base64 32) | base64
echo ""

echo "DB_PASSWORD:"
echo -n $(openssl rand -base64 24) | base64
echo ""

echo "REDIS_PASSWORD:"
echo -n $(openssl rand -base64 24) | base64
echo ""

echo "ENCRYPTION_KEY:"
echo -n $(openssl rand -hex 32) | base64
```

#### Option 3: External Secrets Operator

For production, use external secret managers:

**AWS Secrets Manager**:

```yaml
# external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: iac-dharma-secrets
  namespace: iac-dharma
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: iac-dharma-secrets
    creationPolicy: Owner
  data:
  - secretKey: jwt-secret
    remoteRef:
      key: iac-dharma/jwt-secret
  - secretKey: db-password
    remoteRef:
      key: iac-dharma/db-password
  - secretKey: redis-password
    remoteRef:
      key: iac-dharma/redis-password
```

**HashiCorp Vault**:

```yaml
# vault-secret.yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultStaticSecret
metadata:
  name: iac-dharma-secrets
  namespace: iac-dharma
spec:
  vaultAuthRef: vault-auth
  mount: secret
  type: kv-v2
  path: iac-dharma/config
  refreshAfter: 1h
  destination:
    name: iac-dharma-secrets
    create: true
```

### Verify Configuration

```bash
# View ConfigMap
kubectl get configmap iac-dharma-config -n iac-dharma -o yaml

# View Secrets (base64 encoded)
kubectl get secret iac-dharma-secrets -n iac-dharma -o yaml

# Decode secret
kubectl get secret iac-dharma-secrets -n iac-dharma \
  -o jsonpath='{.data.jwt-secret}' | base64 --decode
```


---

## Database Deployment

### PostgreSQL StatefulSet with HA

Production-grade PostgreSQL with streaming replication:

```yaml
# postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: iac-dharma
  labels:
    app: postgres
    component: database
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
        component: database
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - postgres
            topologyKey: kubernetes.io/hostname
      initContainers:
      - name: init-chmod
        image: busybox:1.35
        command:
        - sh
        - -c
        - |
          chown -R 999:999 /var/lib/postgresql/data
          chmod 700 /var/lib/postgresql/data
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
          protocol: TCP
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: iac-dharma-config
              key: DATABASE_NAME
        - name: POSTGRES_USER
          value: dharma
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: db-password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: POSTGRES_INITDB_ARGS
          value: "--encoding=UTF8 --locale=en_US.UTF-8"
        resources:
          requests:
            cpu: 1000m
            memory: 2Gi
          limits:
            cpu: 2000m
            memory: 4Gi
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        - name: postgres-config
          mountPath: /etc/postgresql
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - dharma
            - -d
            - iac_platform
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - dharma
            - -d
            - iac_platform
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
      volumes:
      - name: postgres-config
        configMap:
          name: postgres-config
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
      labels:
        app: postgres
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: gp3
      resources:
        requests:
          storage: 20Gi
```

### PostgreSQL Services

```yaml
# postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: iac-dharma
  labels:
    app: postgres
spec:
  type: ClusterIP
  ports:
  - port: 5432
    targetPort: 5432
    protocol: TCP
    name: postgres
  selector:
    app: postgres

---
# postgres-headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
  namespace: iac-dharma
  labels:
    app: postgres
spec:
  type: ClusterIP
  clusterIP: None
  ports:
  - port: 5432
    targetPort: 5432
    protocol: TCP
    name: postgres
  selector:
    app: postgres
```

### PostgreSQL Configuration

```yaml
# postgres-config-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
  namespace: iac-dharma
data:
  postgresql.conf: |
    # Connection Settings
    listen_addresses = '*'
    max_connections = 200
    
    # Memory Settings
    shared_buffers = 2GB
    effective_cache_size = 6GB
    work_mem = 16MB
    maintenance_work_mem = 512MB
    
    # WAL Settings (for replication)
    wal_level = replica
    max_wal_senders = 10
    max_replication_slots = 10
    hot_standby = on
    
    # Checkpoint Settings
    checkpoint_completion_target = 0.9
    wal_buffers = 16MB
    min_wal_size = 1GB
    max_wal_size = 4GB
    
    # Logging
    logging_collector = on
    log_directory = 'log'
    log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
    log_min_duration_statement = 500
    log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
    log_checkpoints = on
    log_connections = on
    log_disconnections = on
    log_lock_waits = on
    
    # Query Tuning
    random_page_cost = 1.1
    effective_io_concurrency = 200
    
    # Autovacuum
    autovacuum = on
    autovacuum_max_workers = 4
    autovacuum_naptime = 30s
```

### Database Initialization Job

```yaml
# postgres-init-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: postgres-init
  namespace: iac-dharma
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: postgres-init
        image: postgres:15-alpine
        env:
        - name: PGHOST
          value: postgres
        - name: PGPORT
          value: "5432"
        - name: PGUSER
          value: dharma
        - name: PGPASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: db-password
        - name: PGDATABASE
          value: iac_platform
        command:
        - sh
        - -c
        - |
          # Wait for PostgreSQL
          until pg_isready; do
            echo "Waiting for PostgreSQL..."
            sleep 2
          done
          
          # Create extensions
          psql -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
          psql -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
          psql -c "CREATE EXTENSION IF NOT EXISTS btree_gin;"
          psql -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
          
          # Create indexes
          psql -c "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);"
          psql -c "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deployments_status ON deployments(status);"
          
          echo "Database initialization complete!"
```

---

## Cache Deployment

### Redis StatefulSet with Sentinel

High availability Redis with automatic failover:

```yaml
# redis-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: iac-dharma
  labels:
    app: redis
spec:
  serviceName: redis-headless
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
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
                  - redis
              topologyKey: kubernetes.io/hostname
      containers:
      - name: redis
        image: redis:7-alpine
        command:
        - redis-server
        - /etc/redis/redis.conf
        - --requirepass
        - $(REDIS_PASSWORD)
        - --appendonly
        - "yes"
        - --maxmemory
        - 512mb
        - --maxmemory-policy
        - allkeys-lru
        ports:
        - containerPort: 6379
          name: redis
          protocol: TCP
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: redis-password
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        - name: redis-config
          mountPath: /etc/redis
        livenessProbe:
          exec:
            command:
            - redis-cli
            - -a
            - $(REDIS_PASSWORD)
            - ping
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          exec:
            command:
            - redis-cli
            - -a
            - $(REDIS_PASSWORD)
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
      volumes:
      - name: redis-config
        configMap:
          name: redis-config
  volumeClaimTemplates:
  - metadata:
      name: redis-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: gp3
      resources:
        requests:
          storage: 10Gi
```

### Redis Services

```yaml
# redis-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: iac-dharma
spec:
  type: ClusterIP
  ports:
  - port: 6379
    targetPort: 6379
    protocol: TCP
    name: redis
  selector:
    app: redis

---
# redis-headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-headless
  namespace: iac-dharma
spec:
  type: ClusterIP
  clusterIP: None
  ports:
  - port: 6379
    targetPort: 6379
    protocol: TCP
    name: redis
  selector:
    app: redis
```

### Redis Configuration

```yaml
# redis-config-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
  namespace: iac-dharma
data:
  redis.conf: |
    # Network
    bind 0.0.0.0
    protected-mode no
    port 6379
    tcp-backlog 511
    timeout 0
    tcp-keepalive 300
    
    # General
    daemonize no
    supervised no
    loglevel notice
    
    # Snapshotting
    save 900 1
    save 300 10
    save 60 10000
    stop-writes-on-bgsave-error yes
    rdbcompression yes
    rdbchecksum yes
    dbfilename dump.rdb
    dir /data
    
    # Replication
    replica-serve-stale-data yes
    replica-read-only yes
    repl-diskless-sync no
    repl-diskless-sync-delay 5
    repl-disable-tcp-nodelay no
    
    # Append Only File
    appendonly yes
    appendfilename "appendonly.aof"
    appendfsync everysec
    no-appendfsync-on-rewrite no
    auto-aof-rewrite-percentage 100
    auto-aof-rewrite-min-size 64mb
    
    # Limits
    maxclients 10000
    
    # Slow Log
    slowlog-log-slower-than 10000
    slowlog-max-len 128
```

---

## Service Deployments

### API Gateway Deployment

```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: iac-dharma
  labels:
    app: api-gateway
    component: api
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
        component: api
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
        - containerPort: 9090
          name: metrics
          protocol: TCP
        envFrom:
        - configMapRef:
            name: iac-dharma-config
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: jwt-secret
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: db-password
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: redis-password
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 15
      terminationGracePeriodSeconds: 30
```

### API Gateway Service

```yaml
# api-gateway-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: iac-dharma
  labels:
    app: api-gateway
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: ClusterIP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
  ports:
  - port: 3000
    targetPort: 3000
    protocol: TCP
    name: http
  - port: 9090
    targetPort: 9090
    protocol: TCP
    name: metrics
  selector:
    app: api-gateway
```

### Template for Other Microservices

Use similar pattern for other services. Here's one example:

```yaml
# iac-generator-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iac-generator
  namespace: iac-dharma
spec:
  replicas: 3
  selector:
    matchLabels:
      app: iac-generator
  template:
    metadata:
      labels:
        app: iac-generator
    spec:
      containers:
      - name: iac-generator
        image: iacdharma/iac-generator:1.0.0
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: iac-dharma-config
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: iac-generator
  namespace: iac-dharma
spec:
  type: ClusterIP
  ports:
  - port: 3001
    targetPort: 3001
  selector:
    app: iac-generator
```

*Apply similar patterns for:*
- blueprint-service (port 3002)
- orchestrator (port 3003)
- guardrails (port 3004)
- costing-service (port 3005)
- ai-engine (port 3006)
- cmdb (port 3007)
- monitoring-service (port 3008)

---

## Ingress Configuration

### NGINX Ingress with TLS

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iac-dharma
  namespace: iac-dharma
  annotations:
    # Cert-Manager
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    
    # NGINX
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
    
    # Rate Limiting
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-connections: "50"
    
    # CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://iac.yourdomain.com"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-credentials: "true"
    
    # Security Headers
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "X-Frame-Options: DENY";
      more_set_headers "X-Content-Type-Options: nosniff";
      more_set_headers "X-XSS-Protection: 1; mode=block";
      more_set_headers "Strict-Transport-Security: max-age=31536000; includeSubDomains";
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - iac.yourdomain.com
    - www.iac.yourdomain.com
    secretName: iac-dharma-tls
  rules:
  - host: iac.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  - host: www.iac.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

### Certificate with Cert-Manager

```yaml
# certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: iac-dharma-tls
  namespace: iac-dharma
spec:
  secretName: iac-dharma-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - iac.yourdomain.com
  - www.iac.yourdomain.com
```

---

## Persistent Storage

### Storage Class (AWS EBS gp3)

```yaml
# storageclass-aws-gp3.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
  kmsKeyId: "arn:aws:kms:us-east-1:ACCOUNT:key/KEY_ID"
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Retain
```

### Storage Class (GCP Persistent Disk)

```yaml
# storageclass-gcp-ssd.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: pd.csi.storage.gke.io
parameters:
  type: pd-ssd
  replication-type: regional-pd
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

### Storage Class (Azure Disk)

```yaml
# storageclass-azure-premium.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: azure-premium
provisioner: disk.csi.azure.com
parameters:
  skuName: Premium_LRS
  kind: Managed
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

### PersistentVolumeClaim Examples

```yaml
# backup-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: backup-storage
  namespace: iac-dharma
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 50Gi
```

---

## Networking

### Network Policies

Restrict pod-to-pod communication:

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: iac-dharma
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
    - podSelector:
        matchLabels:
          app: frontend
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
  - to:
    - podSelector:
        matchLabels:
          component: microservice
    ports:
    - protocol: TCP
      port: 3001
    - protocol: TCP
      port: 3002
    - protocol: TCP
      port: 3003
    - protocol: TCP
      port: 3004
    - protocol: TCP
      port: 3005
    - protocol: TCP
      port: 3006
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53

---
# database-network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgres-policy
  namespace: iac-dharma
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          component: api
    - podSelector:
        matchLabels:
          component: microservice
    ports:
    - protocol: TCP
      port: 5432
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

### Service Mesh (Istio) - Optional

For advanced traffic management:

```bash
# Install Istio
istioctl install --set profile=production

# Label namespace for injection
kubectl label namespace iac-dharma istio-injection=enabled

# Apply strict mTLS
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: iac-dharma
spec:
  mtls:
    mode: STRICT
EOF
```


---

## Security

### RBAC (Role-Based Access Control)

```yaml
# service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: iac-dharma-sa
  namespace: iac-dharma

---
# role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: iac-dharma-role
  namespace: iac-dharma
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "watch"]

---
# rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: iac-dharma-rolebinding
  namespace: iac-dharma
subjects:
- kind: ServiceAccount
  name: iac-dharma-sa
  namespace: iac-dharma
roleRef:
  kind: Role
  name: iac-dharma-role
  apiGroup: rbac.authorization.k8s.io
```

### Pod Security Standards

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: iac-dharma-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: false
```

---

## Monitoring Stack

### Prometheus

```yaml
# prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: iac-dharma
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:v2.47.0
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
        - '--web.console.libraries=/etc/prometheus/console_libraries'
        - '--web.console.templates=/etc/prometheus/consoles'
        - '--storage.tsdb.retention.time=30d'
        ports:
        - containerPort: 9090
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-storage
```

### Grafana

```yaml
# grafana-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: iac-dharma
spec:
  replicas: 2
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:10.1.5
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: grafana-admin-password
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        volumeMounts:
        - name: grafana-storage
          mountPath: /var/lib/grafana
      volumes:
      - name: grafana-storage
        persistentVolumeClaim:
          claimName: grafana-storage
```

---

## Autoscaling

### Horizontal Pod Autoscaler (HPA)

```yaml
# hpa-api-gateway.yaml
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
  maxReplicas: 10
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
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Min
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 4
        periodSeconds: 30
      selectPolicy: Max
```

---

## Rolling Updates

### Update Strategy

```bash
# Update image
kubectl set image deployment/api-gateway \
  api-gateway=iacdharma/api-gateway:1.1.0 \
  -n iac-dharma

# Watch rollout
kubectl rollout status deployment/api-gateway -n iac-dharma

# Check rollout history
kubectl rollout history deployment/api-gateway -n iac-dharma

# Rollback if needed
kubectl rollout undo deployment/api-gateway -n iac-dharma

# Rollback to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2 -n iac-dharma
```

---

## Backup & Disaster Recovery

### Velero Setup

```bash
# Install Velero
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket iac-dharma-backups \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1

# Create backup schedule
velero schedule create iac-dharma-daily \
  --schedule="0 2 * * *" \
  --include-namespaces iac-dharma \
  --ttl 720h

# Manual backup
velero backup create iac-dharma-backup-$(date +%Y%m%d) \
  --include-namespaces iac-dharma

# Restore from backup
velero restore create --from-backup iac-dharma-backup-20241122
```

---

## Troubleshooting

### Pod Issues

```bash
# Describe pod
kubectl describe pod <pod-name> -n iac-dharma

# View logs
kubectl logs <pod-name> -n iac-dharma --tail=100 --follow

# View previous container logs (if restarted)
kubectl logs <pod-name> -n iac-dharma --previous

# Execute commands in pod
kubectl exec -it <pod-name> -n iac-dharma -- /bin/sh

# Check resource usage
kubectl top pod -n iac-dharma

# Get events
kubectl get events -n iac-dharma --sort-by='.lastTimestamp'
```

### Service Discovery

```bash
# Test DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  nslookup postgres.iac-dharma.svc.cluster.local

# Test connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://api-gateway.iac-dharma:3000/health
```

### Common Issues

**1. Pod stuck in Pending**:
- Check node resources: `kubectl describe nodes`
- Check PVC status: `kubectl get pvc -n iac-dharma`
- Check events: `kubectl get events -n iac-dharma`

**2. CrashLoopBackOff**:
- Check logs: `kubectl logs <pod> -n iac-dharma --previous`
- Check liveness/readiness probes
- Verify environment variables and secrets

**3. ImagePullBackOff**:
- Verify image name and tag
- Check image pull secrets
- Verify registry credentials

---

## Production Checklist

### Pre-Launch Validation

- [ ] **Cluster Requirements**
  - [ ] K8s version 1.28+
  - [ ] Sufficient node capacity (6+ nodes)
  - [ ] Storage class configured
  - [ ] Ingress controller installed
  - [ ] Cert-manager installed for TLS

- [ ] **Security**
  - [ ] All secrets created with strong passwords
  - [ ] RBAC configured
  - [ ] Network policies applied
  - [ ] Pod security policies enabled
  - [ ] TLS certificates valid

- [ ] **High Availability**
  - [ ] Database replicas (3 pods)
  - [ ] Redis replicas (3 pods)
  - [ ] API Gateway HPA configured
  - [ ] Pod anti-affinity rules set
  - [ ] Multiple availability zones

- [ ] **Monitoring**
  - [ ] Prometheus deployed
  - [ ] Grafana dashboards imported
  - [ ] Alerting rules configured
  - [ ] Jaeger tracing enabled
  - [ ] Log aggregation configured

- [ ] **Backup & DR**
  - [ ] Velero installed
  - [ ] Backup schedule created
  - [ ] Restore tested successfully
  - [ ] Off-site backup configured

- [ ] **Performance**
  - [ ] Resource requests/limits set
  - [ ] HPA configured for key services
  - [ ] Database indexes created
  - [ ] Connection pooling configured

- [ ] **Testing**
  - [ ] All pods healthy
  - [ ] Services accessible via ingress
  - [ ] Database connectivity verified
  - [ ] API endpoints responding
  - [ ] Load testing completed

### Deployment Verification

```bash
#!/bin/bash
# verify-deployment.sh

echo "=== IAC Dharma K8s Deployment Verification ==="

# Check all pods are running
echo "Checking pod status..."
kubectl get pods -n iac-dharma

# Check services
echo "Checking services..."
kubectl get svc -n iac-dharma

# Check ingress
echo "Checking ingress..."
kubectl get ingress -n iac-dharma

# Check certificates
echo "Checking certificates..."
kubectl get certificate -n iac-dharma

# Check HPA
echo "Checking HPA..."
kubectl get hpa -n iac-dharma

# Check PVC
echo "Checking PVC..."
kubectl get pvc -n iac-dharma

# Health checks
echo "Running health checks..."
kubectl run healthcheck --image=curlimages/curl --rm -it --restart=Never -- \
  curl -f http://api-gateway.iac-dharma:3000/health

echo "=== Verification Complete ==="
```

---

## Maintenance Commands

```bash
# Scale deployment
kubectl scale deployment api-gateway --replicas=5 -n iac-dharma

# Update ConfigMap
kubectl edit configmap iac-dharma-config -n iac-dharma

# Restart deployment
kubectl rollout restart deployment/api-gateway -n iac-dharma

# Delete pod (will be recreated)
kubectl delete pod <pod-name> -n iac-dharma

# Drain node for maintenance
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Uncordon node
kubectl uncordon <node-name>

# Get cluster info
kubectl cluster-info dump > cluster-dump.txt
```

---

## Best Practices

1. **Resource Management**
   - Always set resource requests and limits
   - Use HPA for scalable services
   - Monitor resource usage regularly

2. **High Availability**
   - Run multiple replicas (minimum 3 for critical services)
   - Use pod anti-affinity rules
   - Deploy across multiple availability zones

3. **Security**
   - Use RBAC for access control
   - Enable network policies
   - Store secrets externally (Vault, AWS Secrets Manager)
   - Regular security updates

4. **Monitoring**
   - Implement comprehensive monitoring
   - Set up alerting for critical issues
   - Use distributed tracing for debugging

5. **Backup & DR**
   - Regular automated backups
   - Test restore procedures
   - Document disaster recovery plan

6. **Updates**
   - Use rolling updates for zero downtime
   - Test in staging before production
   - Always have rollback plan

---

## See Also

- [Quick Start Guide](Quick-Start) - Get started with Docker Compose
- [Installation Guide](Installation-Guide) - Detailed installation
- [Configuration Guide](Configuration) - Configuration options
- [Security Best Practices](Security-Best-Practices) - Security hardening
- [Backup and Recovery](Backup-and-Recovery) - Backup strategies
- [Performance Tuning](Performance-Tuning) - Optimization guide
- [Observability](Observability) - Monitoring and tracing
- [Troubleshooting](Troubleshooting) - Common issues

---

Last Updated: November 22, 2025 | [Back to Home](Home)
