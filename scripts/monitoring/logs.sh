#!/bin/bash

# IAC DHARMA Platform Logs Viewer
# View logs from all or specific services

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

# Parse command line arguments
FOLLOW="-f"
TAIL="100"
SERVICES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-follow)
            FOLLOW=""
            shift
            ;;
        --tail)
            TAIL="$2"
            shift 2
            ;;
        --all)
            SERVICES="postgres redis api-gateway blueprint-service iac-generator guardrails-engine orchestrator-service costing-service monitoring-service automation-engine ai-engine frontend"
            shift
            ;;
        --backend)
            SERVICES="api-gateway blueprint-service iac-generator guardrails-engine orchestrator-service costing-service monitoring-service automation-engine ai-engine"
            shift
            ;;
        --infrastructure)
            SERVICES="postgres redis"
            shift
            ;;
        --monitoring)
            SERVICES="prometheus grafana"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS] [SERVICE_NAMES...]"
            echo ""
            echo "Options:"
            echo "  --no-follow          Don't follow log output"
            echo "  --tail <n>           Number of lines to show (default: 100)"
            echo "  --all                Show logs from all services"
            echo "  --backend            Show logs from all backend services"
            echo "  --infrastructure     Show logs from postgres and redis"
            echo "  --monitoring         Show logs from monitoring stack"
            echo "  --help               Show this help message"
            echo ""
            echo "Services:"
            echo "  postgres             PostgreSQL database"
            echo "  redis                Redis cache"
            echo "  api-gateway          API Gateway"
            echo "  blueprint-service    Blueprint Service"
            echo "  iac-generator        IaC Generator"
            echo "  guardrails-engine    Guardrails Engine"
            echo "  orchestrator-service Orchestrator Service"
            echo "  costing-service      Costing Service"
            echo "  monitoring-service   Monitoring Service"
            echo "  automation-engine    Automation Engine"
            echo "  ai-engine            AI Engine"
            echo "  frontend             Frontend"
            echo "  prometheus           Prometheus"
            echo "  grafana              Grafana"
            echo ""
            echo "Examples:"
            echo "  $0 --all                    # All services"
            echo "  $0 --backend                # All backend services"
            echo "  $0 api-gateway              # Single service"
            echo "  $0 postgres redis           # Multiple services"
            echo "  $0 --tail 50 --no-follow ai-engine  # Last 50 lines, no follow"
            exit 0
            ;;
        *)
            SERVICES="$SERVICES $1"
            shift
            ;;
    esac
done

# If no services specified, show all
if [ -z "$SERVICES" ]; then
    SERVICES="postgres redis api-gateway blueprint-service iac-generator guardrails-engine orchestrator-service costing-service monitoring-service automation-engine ai-engine frontend"
fi

# Print banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         IAC DHARMA Platform Logs                           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

print_info "Showing logs for: $SERVICES"
if [ -n "$FOLLOW" ]; then
    print_info "Following logs (Ctrl+C to stop)..."
else
    print_info "Showing last $TAIL lines..."
fi
echo ""

# Show logs
docker-compose logs $FOLLOW --tail=$TAIL $SERVICES
