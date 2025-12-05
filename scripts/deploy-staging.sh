#!/bin/bash
# Staging Environment Deployment Script for IAC Dharma v2.0
# This script deploys the complete stack to staging environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 IAC Dharma v2.0 - Staging Deployment"
echo "========================================"

# Configuration
STAGING_NAMESPACE="iac-dharma-staging"
KUBE_CONTEXT="staging"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-iacdharma}"
IMAGE_TAG="${IMAGE_TAG:-staging-$(date +%Y%m%d-%H%M%S)}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    commands=("docker" "kubectl" "helm")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is not installed"
            exit 1
        fi
    done
    
    log_info "✅ All prerequisites met"
}

build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build all service images
    services=(
        "api-gateway"
        "blueprint-service"
        "iac-generator"
        "cost-analyzer"
        "ai-engine"
        "deployment-manager"
        "monitoring-service"
        "drift-detector"
        "notification-service"
        "tenant-service"
        "integration-service"
    )
    
    for service in "${services[@]}"; do
        log_info "Building $service:$IMAGE_TAG"
        docker build \
            -f "backend/$service/Dockerfile" \
            -t "$DOCKER_REGISTRY/$service:$IMAGE_TAG" \
            -t "$DOCKER_REGISTRY/$service:staging-latest" \
            "backend/$service/"
    done
    
    # Build frontend
    log_info "Building frontend:$IMAGE_TAG"
    docker build \
        -f "frontend/Dockerfile" \
        -t "$DOCKER_REGISTRY/frontend:$IMAGE_TAG" \
        -t "$DOCKER_REGISTRY/frontend:staging-latest" \
        "frontend/"
    
    log_info "✅ All images built successfully"
}

push_images() {
    log_info "Pushing images to registry..."
    
    services=(
        "api-gateway"
        "blueprint-service"
        "iac-generator"
        "cost-analyzer"
        "ai-engine"
        "deployment-manager"
        "monitoring-service"
        "drift-detector"
        "notification-service"
        "tenant-service"
        "integration-service"
        "frontend"
    )
    
    for service in "${services[@]}"; do
        log_info "Pushing $service:$IMAGE_TAG"
        docker push "$DOCKER_REGISTRY/$service:$IMAGE_TAG"
        docker push "$DOCKER_REGISTRY/$service:staging-latest"
    done
    
    log_info "✅ All images pushed successfully"
}

create_namespace() {
    log_info "Creating namespace $STAGING_NAMESPACE..."
    
    kubectl create namespace $STAGING_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    log_info "✅ Namespace ready"
}

deploy_secrets() {
    log_info "Deploying secrets..."
    
    # Create secrets from environment file if exists
    if [ -f "$PROJECT_ROOT/.env.staging" ]; then
        kubectl create secret generic app-secrets \
            --from-env-file="$PROJECT_ROOT/.env.staging" \
            --namespace=$STAGING_NAMESPACE \
            --dry-run=client -o yaml | kubectl apply -f -
    else
        log_warn "No .env.staging file found, using defaults"
    fi
    
    log_info "✅ Secrets deployed"
}

deploy_infrastructure() {
    log_info "Deploying infrastructure components..."
    
    # Deploy PostgreSQL
    helm repo add bitnami https://charts.bitnami.com/bitnami || true
    helm repo update
    
    helm upgrade --install postgresql bitnami/postgresql \
        --namespace=$STAGING_NAMESPACE \
        --set auth.postgresPassword=staging123 \
        --set auth.database=iacdharma \
        --set persistence.size=50Gi \
        --set replication.enabled=false \
        --wait
    
    # Deploy Redis
    helm upgrade --install redis bitnami/redis \
        --namespace=$STAGING_NAMESPACE \
        --set auth.password=redis123 \
        --set master.persistence.size=10Gi \
        --wait
    
    log_info "✅ Infrastructure deployed"
}

deploy_application() {
    log_info "Deploying application services..."
    
    # Update image tags in K8s manifests
    cd "$PROJECT_ROOT/k8s/staging"
    
    # Apply ConfigMaps and Secrets
    kubectl apply -f configmap.yaml -n $STAGING_NAMESPACE
    
    # Apply all deployments
    for manifest in *-deployment.yaml; do
        log_info "Applying $manifest"
        # Replace image tags
        sed "s|IMAGE_TAG|$IMAGE_TAG|g" $manifest | \
        sed "s|DOCKER_REGISTRY|$DOCKER_REGISTRY|g" | \
        kubectl apply -f - -n $STAGING_NAMESPACE
    done
    
    # Apply services
    kubectl apply -f services.yaml -n $STAGING_NAMESPACE
    
    # Apply Ingress
    kubectl apply -f ingress.yaml -n $STAGING_NAMESPACE
    
    log_info "✅ Application deployed"
}

run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod \
        -l app=api-gateway \
        -n $STAGING_NAMESPACE \
        --timeout=300s
    
    # Get service URL
    INGRESS_IP=$(kubectl get ingress -n $STAGING_NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$INGRESS_IP" ]; then
        log_warn "Ingress IP not ready, using port-forward"
        kubectl port-forward -n $STAGING_NAMESPACE svc/api-gateway 8080:3000 &
        PORT_FORWARD_PID=$!
        sleep 5
        API_URL="http://localhost:8080"
    else
        API_URL="http://$INGRESS_IP"
    fi
    
    # Health check
    log_info "Testing health endpoint..."
    if curl -f "$API_URL/health/live" > /dev/null 2>&1; then
        log_info "✅ Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Cleanup port-forward if used
    if [ ! -z "$PORT_FORWARD_PID" ]; then
        kill $PORT_FORWARD_PID 2>/dev/null || true
    fi
    
    log_info "✅ Smoke tests passed"
}

print_summary() {
    echo ""
    echo "========================================"
    echo "🎉 Staging Deployment Complete!"
    echo "========================================"
    echo ""
    echo "Namespace: $STAGING_NAMESPACE"
    echo "Image Tag: $IMAGE_TAG"
    echo ""
    echo "Access URLs:"
    INGRESS_IP=$(kubectl get ingress -n $STAGING_NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')
    if [ ! -z "$INGRESS_IP" ]; then
        echo "  API: http://$INGRESS_IP"
        echo "  Frontend: http://$INGRESS_IP:5173"
    else
        echo "  Use port-forward to access services:"
        echo "  kubectl port-forward -n $STAGING_NAMESPACE svc/api-gateway 3000:3000"
    fi
    echo ""
    echo "Monitoring:"
    echo "  kubectl get pods -n $STAGING_NAMESPACE"
    echo "  kubectl logs -f -n $STAGING_NAMESPACE deployment/api-gateway"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    
    read -p "Build and push new images? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_images
        push_images
    fi
    
    create_namespace
    deploy_secrets
    deploy_infrastructure
    deploy_application
    run_smoke_tests
    print_summary
}

# Run main function
main "$@"
