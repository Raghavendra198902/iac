#!/bin/bash

################################################################################
# Kubernetes Deployment Script for IAC DHARMA Platform
# Version: 2.0.0
# Description: Deploys the platform to Kubernetes cluster
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="${NAMESPACE:-iac-dharma}"
ENVIRONMENT="${ENVIRONMENT:-production}"
DRY_RUN="${DRY_RUN:-false}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  IAC DHARMA K8s Deployment${NC}"
echo -e "${BLUE}  Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}  Namespace: ${NAMESPACE}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check prerequisites
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

CLUSTER_NAME=$(kubectl config current-context)
echo -e "${GREEN}✓ Connected to cluster: ${CLUSTER_NAME}${NC}"

# Confirm deployment
if [ "$DRY_RUN" != "true" ]; then
    echo -e "\n${YELLOW}You are about to deploy to ${ENVIRONMENT} environment in cluster ${CLUSTER_NAME}${NC}"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 0
    fi
fi

# Create namespace if it doesn't exist
echo -e "\n${YELLOW}[1/6] Checking namespace...${NC}"
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "Creating namespace: $NAMESPACE"
    kubectl create namespace "$NAMESPACE"
    echo -e "${GREEN}✓ Namespace created${NC}"
else
    echo -e "${GREEN}✓ Namespace exists${NC}"
fi

# Apply ConfigMaps
echo -e "\n${YELLOW}[2/6] Applying ConfigMaps...${NC}"
kubectl apply -f k8s/base/configmap.yaml -n "$NAMESPACE"
echo -e "${GREEN}✓ ConfigMaps applied${NC}"

# Apply Secrets (must be created manually beforehand)
echo -e "\n${YELLOW}[3/6] Checking Secrets...${NC}"
if ! kubectl get secret api-secrets -n "$NAMESPACE" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Secret 'api-secrets' not found${NC}"
    echo -e "${YELLOW}Create it with: kubectl create secret generic api-secrets --from-literal=jwt-secret=<value>${NC}"
    read -p "Continue without secrets? (yes/no): " continue_anyway
    if [ "$continue_anyway" != "yes" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Secrets exist${NC}"
fi

# Deploy Backend Services
echo -e "\n${YELLOW}[4/6] Deploying backend services...${NC}"

SERVICES=(
    "api-gateway"
    "iac-generator"
    "blueprint-service"
    "costing-service"
    "monitoring-service"
    "orchestrator-service"
)

for service in "${SERVICES[@]}"; do
    echo "Deploying ${service}..."
    kubectl apply -f "k8s/overlays/${ENVIRONMENT}/deployment-${service}.yaml" -n "$NAMESPACE" 2>/dev/null || \
    kubectl apply -f "k8s/base/deployment-${service}.yaml" -n "$NAMESPACE" 2>/dev/null || \
    echo "⚠️  No deployment file found for ${service}"
done

echo -e "${GREEN}✓ Backend services deployed${NC}"

# Deploy Frontend
echo -e "\n${YELLOW}[5/6] Deploying frontend...${NC}"
kubectl apply -f "k8s/overlays/${ENVIRONMENT}/deployment-frontend.yaml" -n "$NAMESPACE" 2>/dev/null || \
kubectl apply -f k8s/base/deployment-frontend.yaml -n "$NAMESPACE"
echo -e "${GREEN}✓ Frontend deployed${NC}"

# Apply Ingress
echo -e "\n${YELLOW}[6/6] Configuring Ingress...${NC}"
kubectl apply -f "k8s/overlays/${ENVIRONMENT}/ingress.yaml" -n "$NAMESPACE" 2>/dev/null || \
kubectl apply -f k8s/base/ingress.yaml -n "$NAMESPACE" 2>/dev/null || \
echo "⚠️  No ingress configuration found"

# Wait for deployments to be ready
echo -e "\n${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment --all -n "$NAMESPACE"

# Get deployment status
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Deployment Status${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Pods:${NC}"
kubectl get pods -n "$NAMESPACE"

echo -e "\n${YELLOW}Services:${NC}"
kubectl get services -n "$NAMESPACE"

echo -e "\n${YELLOW}Ingress:${NC}"
kubectl get ingress -n "$NAMESPACE"

# Get external IPs
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Access Information${NC}"
echo -e "${BLUE}========================================${NC}\n"

FRONTEND_SERVICE=$(kubectl get svc frontend -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
INGRESS_IP=$(kubectl get ingress -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

echo -e "${GREEN}Frontend Service:${NC} http://${FRONTEND_SERVICE}"
echo -e "${GREEN}Ingress:${NC} http://${INGRESS_IP}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Useful commands:${NC}"
echo -e "  View logs: kubectl logs -f deployment/frontend -n ${NAMESPACE}"
echo -e "  Check status: kubectl get all -n ${NAMESPACE}"
echo -e "  Delete deployment: kubectl delete namespace ${NAMESPACE}"
echo -e "  Rollback: kubectl rollout undo deployment/frontend -n ${NAMESPACE}\n"

exit 0
