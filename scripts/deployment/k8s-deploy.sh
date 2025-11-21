#!/bin/bash

# Kubernetes Deployment Script
# Usage: ./k8s-deploy.sh <environment>
# Environments: development, staging, production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get environment from argument
ENVIRONMENT=${1:-development}

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
    echo "Usage: $0 <development|staging|production>"
    exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     IAC Dharma Kubernetes Deployment              ║${NC}"
echo -e "${BLUE}║     Environment: $ENVIRONMENT                       ${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo ""

# Determine namespace
case $ENVIRONMENT in
    development)
        NAMESPACE="iacdharma-dev"
        CONTEXT="dev-cluster"
        ;;
    staging)
        NAMESPACE="iacdharma-staging"
        CONTEXT="staging-cluster"
        ;;
    production)
        NAMESPACE="iacdharma-prod"
        CONTEXT="prod-cluster"
        ;;
esac

# Confirm production deployment
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to PRODUCTION!${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Check prerequisites
echo -e "${BLUE}[1/7] Checking Prerequisites${NC}"
echo "─────────────────────────────────────────────────"

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}✗ kubectl not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ kubectl installed${NC}"

if ! command -v kustomize &> /dev/null; then
    echo -e "${YELLOW}⚠ kustomize not found (using kubectl kustomize)${NC}"
    KUSTOMIZE_CMD="kubectl kustomize"
else
    echo -e "${GREEN}✓ kustomize installed${NC}"
    KUSTOMIZE_CMD="kustomize build"
fi

# Switch to correct context
echo ""
echo -e "${BLUE}[2/7] Switching Kubernetes Context${NC}"
echo "─────────────────────────────────────────────────"

if kubectl config get-contexts | grep -q "$CONTEXT"; then
    kubectl config use-context "$CONTEXT"
    echo -e "${GREEN}✓ Switched to context: $CONTEXT${NC}"
else
    echo -e "${YELLOW}⚠ Context '$CONTEXT' not found. Using current context.${NC}"
fi

# Verify cluster connection
echo ""
echo -e "${BLUE}[3/7] Verifying Cluster Connection${NC}"
echo "─────────────────────────────────────────────────"

if kubectl cluster-info &> /dev/null; then
    echo -e "${GREEN}✓ Connected to cluster${NC}"
    kubectl cluster-info | head -2
else
    echo -e "${RED}✗ Cannot connect to cluster${NC}"
    exit 1
fi

# Check if namespace exists
echo ""
echo -e "${BLUE}[4/7] Checking Namespace${NC}"
echo "─────────────────────────────────────────────────"

if kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${GREEN}✓ Namespace '$NAMESPACE' exists${NC}"
else
    echo -e "${YELLOW}⚠ Namespace '$NAMESPACE' does not exist${NC}"
    echo "Creating namespace..."
    kubectl create namespace "$NAMESPACE"
    echo -e "${GREEN}✓ Namespace created${NC}"
fi

# Check image pull secret
echo ""
echo -e "${BLUE}[5/7] Checking Image Pull Secret${NC}"
echo "─────────────────────────────────────────────────"

if kubectl get secret ghcr-secret -n "$NAMESPACE" &> /dev/null; then
    echo -e "${GREEN}✓ Image pull secret exists${NC}"
else
    echo -e "${YELLOW}⚠ Image pull secret not found${NC}"
    echo "Please create ghcr-secret manually:"
    echo ""
    echo "kubectl create secret docker-registry ghcr-secret \\"
    echo "  --namespace=$NAMESPACE \\"
    echo "  --docker-server=ghcr.io \\"
    echo "  --docker-username=<GITHUB_USERNAME> \\"
    echo "  --docker-password=<GITHUB_TOKEN> \\"
    echo "  --docker-email=<YOUR_EMAIL>"
    echo ""
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

# Review deployment
echo ""
echo -e "${BLUE}[6/7] Reviewing Deployment Configuration${NC}"
echo "─────────────────────────────────────────────────"

cd "$(dirname "$0")/../k8s/overlays/$ENVIRONMENT"

echo "Resources to be deployed:"
$KUSTOMIZE_CMD . | grep "kind:" | sort | uniq -c
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}Final confirmation required for production${NC}"
    read -p "Deploy to production? (yes/no): " FINAL_CONFIRM
    if [ "$FINAL_CONFIRM" != "yes" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Deploy
echo ""
echo -e "${BLUE}[7/7] Deploying to $ENVIRONMENT${NC}"
echo "─────────────────────────────────────────────────"

kubectl apply -k . || {
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
}

echo -e "${GREEN}✓ Deployment applied${NC}"

# Wait for rollout
echo ""
echo "Waiting for deployments to roll out..."
echo ""

DEPLOYMENTS=$(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}')

for DEPLOYMENT in $DEPLOYMENTS; do
    echo "Checking $DEPLOYMENT..."
    kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE" --timeout=5m || {
        echo -e "${RED}✗ Rollout failed for $DEPLOYMENT${NC}"
        exit 1
    }
done

echo ""
echo -e "${GREEN}✓ All deployments rolled out successfully${NC}"

# Show status
echo ""
echo -e "${BLUE}Deployment Status${NC}"
echo "─────────────────────────────────────────────────"

kubectl get pods -n "$NAMESPACE"

echo ""
echo -e "${BLUE}Services${NC}"
echo "─────────────────────────────────────────────────"

kubectl get svc -n "$NAMESPACE"

echo ""
echo -e "${BLUE}Ingress${NC}"
echo "─────────────────────────────────────────────────"

kubectl get ingress -n "$NAMESPACE"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment to $ENVIRONMENT completed successfully! ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""

# Show next steps
echo "Next steps:"
echo "1. Monitor pods: kubectl get pods -n $NAMESPACE -w"
echo "2. Check logs: kubectl logs -f deployment/<service-name> -n $NAMESPACE"
echo "3. Access application: Check ingress for URL"
echo ""
