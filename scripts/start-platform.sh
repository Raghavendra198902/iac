#!/bin/bash

# IAC DHARMA Platform Startup Script
# Starts all services in the correct order with health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_WAIT=300  # Maximum wait time in seconds
CHECK_INTERVAL=5  # Check every 5 seconds

# Function to print colored output
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

# Function to check if a service is healthy
check_service_health() {
    local service_name=$1
    local health_url=$2
    local max_attempts=$((MAX_WAIT / CHECK_INTERVAL))
    local attempt=0

    print_info "Waiting for ${service_name} to become healthy..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "${health_url}" > /dev/null 2>&1; then
            print_success "${service_name} is healthy!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep $CHECK_INTERVAL
    done
    
    print_error "${service_name} failed to become healthy after ${MAX_WAIT} seconds"
    return 1
}

# Function to check PostgreSQL
check_postgres() {
    print_info "Checking PostgreSQL..."
    docker-compose exec -T postgres pg_isready -U iac_user > /dev/null 2>&1
    return $?
}

# Function to check Redis
check_redis() {
    print_info "Checking Redis..."
    docker-compose exec -T redis redis-cli ping | grep -q PONG
    return $?
}

# Parse command line arguments
MODE="production"
DETACHED=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dev|--development)
            MODE="development"
            shift
            ;;
        -d|--detached)
            DETACHED="-d"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dev, --development   Start in development mode with hot reload"
            echo "  -d, --detached        Run in detached mode"
            echo "  --help                Show this help message"
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
echo "║              IAC DHARMA PLATFORM                           ║"
echo "║   Intelligent Infrastructure Design & Deployment           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

print_info "Starting IAC DHARMA Platform in ${MODE} mode..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Stop any existing containers
print_info "Stopping any existing containers..."
docker-compose down > /dev/null 2>&1 || true

# Build images
print_info "Building Docker images..."
if [ "$MODE" == "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.override.yml build
else
    docker-compose build
fi

if [ $? -ne 0 ]; then
    print_error "Failed to build Docker images"
    exit 1
fi

print_success "Docker images built successfully"
echo ""

# Start infrastructure services first
print_info "Starting infrastructure services (PostgreSQL, Redis)..."
if [ "$MODE" == "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d postgres redis
else
    docker-compose up -d postgres redis
fi

# Wait for PostgreSQL
print_info "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if check_postgres; then
        print_success "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Wait for Redis
print_info "Waiting for Redis to be ready..."
for i in {1..30}; do
    if check_redis; then
        print_success "Redis is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Redis failed to start"
        exit 1
    fi
    sleep 2
done

echo ""

# Start backend services
print_info "Starting backend microservices..."
if [ "$MODE" == "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up $DETACHED \
        blueprint-service \
        iac-generator \
        guardrails-engine \
        orchestrator-service \
        costing-service \
        ai-engine \
        automation-engine \
        monitoring-service
else
    docker-compose up $DETACHED \
        blueprint-service \
        iac-generator \
        guardrails-engine \
        orchestrator-service \
        costing-service \
        ai-engine \
        automation-engine \
        monitoring-service
fi

# Wait for backend services
if [ -z "$DETACHED" ]; then
    exit 0
fi

sleep 10

# Check backend service health
print_info "Checking backend service health..."
check_service_health "Blueprint Service" "http://localhost:3001/health" || exit 1
check_service_health "IaC Generator" "http://localhost:3002/health" || exit 1
check_service_health "Guardrails Engine" "http://localhost:3003/health" || exit 1
check_service_health "Orchestrator" "http://localhost:3004/health" || exit 1
check_service_health "Costing Service" "http://localhost:3005/health" || exit 1
check_service_health "AI Engine" "http://localhost:8000/health" || exit 1
check_service_health "Automation Engine" "http://localhost:3007/health" || exit 1
check_service_health "Monitoring Service" "http://localhost:3006/health" || exit 1

echo ""

# Start API Gateway
print_info "Starting API Gateway..."
if [ "$MODE" == "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up $DETACHED api-gateway
else
    docker-compose up $DETACHED api-gateway
fi

sleep 5

check_service_health "API Gateway" "http://localhost:3000/health" || exit 1

echo ""

# Start frontend
print_info "Starting Frontend..."
if [ "$MODE" == "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up $DETACHED frontend
else
    docker-compose up $DETACHED frontend
fi

sleep 5

echo ""

# Start monitoring stack if in development mode
if [ "$MODE" == "development" ]; then
    print_info "Starting monitoring stack (Prometheus, Grafana)..."
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up $DETACHED \
        prometheus \
        grafana \
        adminer \
        redis-commander
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         IAC DHARMA Platform Started Successfully! 🚀       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

print_success "All services are running!"
echo ""
echo "Access URLs:"
echo "  📱 Frontend:           http://localhost:5173"
echo "  🔌 API Gateway:        http://localhost:3000"
echo "  🤖 AI Engine:          http://localhost:8000"

if [ "$MODE" == "development" ]; then
    echo ""
    echo "Development Tools:"
    echo "  📊 Grafana:            http://localhost:3001 (admin/admin)"
    echo "  📈 Prometheus:         http://localhost:9090"
    echo "  💾 Adminer (DB):       http://localhost:8080"
    echo "  🔴 Redis Commander:    http://localhost:8081"
fi

echo ""
print_info "To view logs: docker-compose logs -f [service-name]"
print_info "To stop: docker-compose down"
echo ""

if [ -z "$DETACHED" ]; then
    print_info "Press Ctrl+C to stop all services"
fi
