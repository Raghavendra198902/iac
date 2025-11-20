#!/bin/bash

# Kubernetes Status Check Script
# Usage: ./k8s-status.sh [environment]

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get environment
ENVIRONMENT=${1:-development}

case $ENVIRONMENT in
    development)
        NAMESPACE="iacdharma-dev"
        ;;
    staging)
        NAMESPACE="iacdharma-staging"
        ;;
    production)
        NAMESPACE="iacdharma-prod"
        ;;
    *)
        NAMESPACE="iacdharma"
        ;;
esac

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     IAC Dharma Kubernetes Status                  ║${NC}"
echo -e "${BLUE}║     Environment: $ENVIRONMENT                       ${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo ""

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${YELLOW}Namespace '$NAMESPACE' not found${NC}"
    exit 1
fi

# Pods
echo -e "${BLUE}Pods Status:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get pods -n "$NAMESPACE" -o wide

echo ""
echo -e "${BLUE}Deployments:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get deployments -n "$NAMESPACE"

echo ""
echo -e "${BLUE}StatefulSets:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get statefulsets -n "$NAMESPACE"

echo ""
echo -e "${BLUE}Services:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get svc -n "$NAMESPACE"

echo ""
echo -e "${BLUE}Ingress:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get ingress -n "$NAMESPACE"

echo ""
echo -e "${BLUE}HPA (Horizontal Pod Autoscalers):${NC}"
echo "─────────────────────────────────────────────────"
kubectl get hpa -n "$NAMESPACE"

echo ""
echo -e "${BLUE}PersistentVolumeClaims:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get pvc -n "$NAMESPACE"

echo ""
echo -e "${BLUE}ConfigMaps:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get configmap -n "$NAMESPACE"

echo ""
echo -e "${BLUE}Secrets:${NC}"
echo "─────────────────────────────────────────────────"
kubectl get secrets -n "$NAMESPACE"

echo ""
echo -e "${BLUE}Resource Usage (Top Pods):${NC}"
echo "─────────────────────────────────────────────────"
kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "Metrics server not available"

echo ""
echo -e "${GREEN}Status check complete${NC}"
