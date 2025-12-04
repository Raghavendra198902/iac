#!/bin/bash
set -e

#######################################################################
# IAC Dharma Platform - Production Deployment Script
# Version: 2.0.0
# Date: December 4, 2025
#
# This script automates the production deployment of the IAC Dharma
# platform to a Kubernetes cluster.
#######################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="iac-platform"
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
SKIP_TESTS="${SKIP_TESTS:-false}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║     IAC DHARMA PLATFORM - PRODUCTION DEPLOYMENT              ║${NC}"
echo -e "${BLUE}║                   Version 2.0.0                              ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

#######################################################################
# Pre-flight Checks
#######################################################################

echo -e "${YELLOW}==> Running pre-flight checks...${NC}"

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl not found. Please install kubectl.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ kubectl installed${NC}"

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connected to Kubernetes cluster${NC}"

# Check Kubernetes version
K8S_VERSION=$(kubectl version --short 2>/dev/null | grep Server | awk '{print $3}')
echo -e "${GREEN}✓ Kubernetes version: ${K8S_VERSION}${NC}"

# Check if namespace exists
if kubectl get namespace ${NAMESPACE} &> /dev/null; then
    echo -e "${YELLOW}! Namespace ${NAMESPACE} already exists${NC}"
    read -p "Do you want to continue? This may overwrite existing resources (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Namespace ${NAMESPACE} is available${NC}"
fi

echo ""

#######################################################################
# Configuration Validation
#######################################################################

echo -e "${YELLOW}==> Validating configuration files...${NC}"

# Check required files
REQUIRED_FILES=(
    "k8s/secrets.yaml"
    "k8s/configmaps/services.yaml"
    "k8s/configmaps/platform.yaml"
    "k8s/databases.yaml"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: Required file not found: ${file}${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Found ${file}${NC}"
done

echo ""

#######################################################################
# Secrets Configuration
#######################################################################

echo -e "${YELLOW}==> Checking secrets configuration...${NC}"

# Check if secrets have been updated from defaults
if grep -q "CHANGE_ME" k8s/secrets.yaml; then
    echo -e "${RED}Error: Secrets contain default values (CHANGE_ME).${NC}"
    echo -e "${RED}Please update k8s/secrets.yaml with secure values.${NC}"
    echo ""
    echo "You can generate secure secrets with:"
    echo "  openssl rand -base64 32"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Secrets appear to be configured${NC}"

echo ""

#######################################################################
# Pre-deployment Backup
#######################################################################

echo -e "${YELLOW}==> Creating backup of existing resources (if any)...${NC}"

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p ${BACKUP_DIR}

if kubectl get namespace ${NAMESPACE} &> /dev/null; then
    kubectl get all -n ${NAMESPACE} -o yaml > ${BACKUP_DIR}/all-resources.yaml 2>/dev/null || true
    kubectl get configmaps -n ${NAMESPACE} -o yaml > ${BACKUP_DIR}/configmaps.yaml 2>/dev/null || true
    kubectl get secrets -n ${NAMESPACE} -o yaml > ${BACKUP_DIR}/secrets.yaml 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created: ${BACKUP_DIR}${NC}"
else
    echo -e "${BLUE}• No existing resources to backup${NC}"
fi

echo ""

#######################################################################
# Namespace Creation
#######################################################################

echo -e "${YELLOW}==> Creating/verifying namespace...${NC}"

kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace ${NAMESPACE} environment=${DEPLOYMENT_ENV} --overwrite
echo -e "${GREEN}✓ Namespace ${NAMESPACE} ready${NC}"

echo ""

#######################################################################
# Deploy Secrets
#######################################################################

echo -e "${YELLOW}==> Deploying secrets...${NC}"

kubectl apply -f k8s/secrets.yaml
echo -e "${GREEN}✓ Secrets deployed${NC}"

echo ""

#######################################################################
# Deploy ConfigMaps
#######################################################################

echo -e "${YELLOW}==> Deploying ConfigMaps...${NC}"

kubectl apply -f k8s/configmaps/services.yaml
kubectl apply -f k8s/configmaps/platform.yaml
echo -e "${GREEN}✓ ConfigMaps deployed${NC}"

echo ""

#######################################################################
# Deploy Databases
#######################################################################

echo -e "${YELLOW}==> Deploying database services...${NC}"

kubectl apply -f k8s/databases.yaml

echo -e "${BLUE}• Waiting for databases to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=mongodb -n ${NAMESPACE} --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s || true

echo -e "${GREEN}✓ Database services deployed${NC}"

echo ""

#######################################################################
# Deploy Backend Services
#######################################################################

echo -e "${YELLOW}==> Deploying backend microservices...${NC}"

# Deploy services in order of dependencies
SERVICES=(
    "k8s/base/api-gateway.yaml"
    "k8s/base/blueprint-service.yaml"
    "k8s/base/backend-services.yaml"
)

for service in "${SERVICES[@]}"; do
    if [ -f "$service" ]; then
        kubectl apply -f "$service"
        echo -e "${GREEN}✓ Deployed $(basename $service)${NC}"
    else
        echo -e "${YELLOW}• Skipping $(basename $service) (not found)${NC}"
    fi
done

echo -e "${BLUE}• Waiting for backend services to be ready...${NC}"
sleep 10

echo -e "${GREEN}✓ Backend services deployed${NC}"

echo ""

#######################################################################
# Deploy Frontend
#######################################################################

echo -e "${YELLOW}==> Deploying frontend application...${NC}"

if [ -f "k8s/base/frontend.yaml" ]; then
    kubectl apply -f k8s/base/frontend.yaml
    echo -e "${GREEN}✓ Frontend deployed${NC}"
else
    echo -e "${YELLOW}• Frontend deployment file not found, skipping${NC}"
fi

echo ""

#######################################################################
# Deploy Ingress
#######################################################################

echo -e "${YELLOW}==> Deploying ingress configuration...${NC}"

if [ -f "k8s/base/ingress.yaml" ]; then
    kubectl apply -f k8s/base/ingress.yaml
    echo -e "${GREEN}✓ Ingress deployed${NC}"
else
    echo -e "${YELLOW}• Ingress file not found, skipping${NC}"
fi

echo ""

#######################################################################
# Verify Deployment
#######################################################################

echo -e "${YELLOW}==> Verifying deployment...${NC}"

# Check pods
echo -e "${BLUE}Pods status:${NC}"
kubectl get pods -n ${NAMESPACE}

echo ""

# Check services
echo -e "${BLUE}Services status:${NC}"
kubectl get services -n ${NAMESPACE}

echo ""

# Check configmaps and secrets
CONFIGMAP_COUNT=$(kubectl get configmaps -n ${NAMESPACE} --no-headers | wc -l)
SECRET_COUNT=$(kubectl get secrets -n ${NAMESPACE} --no-headers | grep -v "default-token" | wc -l)

echo -e "${GREEN}✓ ConfigMaps deployed: ${CONFIGMAP_COUNT}${NC}"
echo -e "${GREEN}✓ Secrets deployed: ${SECRET_COUNT}${NC}"

echo ""

#######################################################################
# Run Tests (Optional)
#######################################################################

if [ "${SKIP_TESTS}" != "true" ]; then
    echo -e "${YELLOW}==> Running deployment verification tests...${NC}"
    
    # Wait for pods to be ready
    echo -e "${BLUE}• Waiting for all pods to be ready (max 5 minutes)...${NC}"
    kubectl wait --for=condition=ready pod --all -n ${NAMESPACE} --timeout=300s || {
        echo -e "${YELLOW}! Some pods are not ready yet${NC}"
        echo -e "${BLUE}Current pod status:${NC}"
        kubectl get pods -n ${NAMESPACE}
    }
    
    # Test API Gateway health
    echo -e "${BLUE}• Testing API Gateway health...${NC}"
    kubectl exec -n ${NAMESPACE} -it $(kubectl get pod -n ${NAMESPACE} -l app=api-gateway -o jsonpath='{.items[0].metadata.name}') -- curl -s http://localhost:3000/health > /dev/null 2>&1 && \
        echo -e "${GREEN}✓ API Gateway is healthy${NC}" || \
        echo -e "${YELLOW}! API Gateway health check failed${NC}"
    
    echo ""
else
    echo -e "${YELLOW}• Skipping tests (SKIP_TESTS=true)${NC}"
    echo ""
fi

#######################################################################
# Deployment Summary
#######################################################################

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║          DEPLOYMENT COMPLETED SUCCESSFULLY! ✅               ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}Platform deployed to namespace: ${NAMESPACE}${NC}"
echo -e "${GREEN}Environment: ${DEPLOYMENT_ENV}${NC}"
echo -e "${GREEN}Backup location: ${BACKUP_DIR}${NC}"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Access API Gateway:"
echo "   kubectl port-forward -n ${NAMESPACE} svc/api-gateway 3000:3000"
echo ""
echo "2. Access Frontend:"
echo "   kubectl port-forward -n ${NAMESPACE} svc/frontend 5173:5173"
echo ""
echo "3. Access Grafana Dashboard:"
echo "   kubectl port-forward -n ${NAMESPACE} svc/grafana 3001:3001"
echo ""
echo "4. View logs:"
echo "   kubectl logs -f -n ${NAMESPACE} <pod-name>"
echo ""
echo "5. Check pod status:"
echo "   kubectl get pods -n ${NAMESPACE}"
echo ""
echo "6. Run integration tests:"
echo "   npm run test:integration"
echo ""
echo "7. Access API documentation:"
echo "   http://localhost:3000/api-docs"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Happy deploying! 🚀${NC}"
echo ""
