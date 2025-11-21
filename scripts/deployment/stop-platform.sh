#!/bin/bash

# IAC DHARMA Platform Stop Script
# Gracefully stops all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
REMOVE_VOLUMES=false
REMOVE_IMAGES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --volumes|-v)
            REMOVE_VOLUMES=true
            shift
            ;;
        --images)
            REMOVE_IMAGES=true
            shift
            ;;
        --all)
            REMOVE_VOLUMES=true
            REMOVE_IMAGES=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -v, --volumes    Remove volumes (deletes all data!)"
            echo "  --images         Remove images"
            echo "  --all            Remove volumes and images"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Print banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         IAC DHARMA Platform Shutdown                       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

print_info "Stopping IAC DHARMA Platform..."

# Check if any containers are running
if [ -z "$(docker-compose ps -q)" ]; then
    print_warning "No containers are currently running"
else
    # Stop services gracefully
    print_info "Stopping frontend..."
    docker-compose stop frontend 2>/dev/null || true
    
    print_info "Stopping API Gateway..."
    docker-compose stop api-gateway 2>/dev/null || true
    
    print_info "Stopping backend microservices..."
    docker-compose stop \
        automation-engine \
        monitoring-service \
        ai-engine \
        costing-service \
        orchestrator-service \
        guardrails-engine \
        iac-generator \
        blueprint-service 2>/dev/null || true
    
    print_info "Stopping development tools..."
    docker-compose stop grafana prometheus redis-commander adminer 2>/dev/null || true
    
    print_info "Stopping infrastructure services..."
    docker-compose stop redis postgres 2>/dev/null || true
    
    print_success "All services stopped"
fi

# Remove containers
print_info "Removing containers..."
docker-compose down --remove-orphans

# Remove volumes if requested
if [ "$REMOVE_VOLUMES" = true ]; then
    print_warning "Removing volumes (this will delete all data)..."
    docker-compose down -v
    print_success "Volumes removed"
fi

# Remove images if requested
if [ "$REMOVE_IMAGES" = true ]; then
    print_info "Removing images..."
    docker-compose down --rmi local
    print_success "Images removed"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         IAC DHARMA Platform Stopped Successfully           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ "$REMOVE_VOLUMES" = true ]; then
    print_warning "All data has been removed. Next startup will be fresh."
else
    print_info "Data volumes preserved. Use --volumes to remove data."
fi

echo ""
print_info "To start again: ./scripts/start-platform.sh"
echo ""
