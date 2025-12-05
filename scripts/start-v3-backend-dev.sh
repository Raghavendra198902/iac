#!/bin/bash

# v3.0 Backend Services - Development Startup Script
# Uses existing dharma-ai-engine container to run v3 backend services

set -e

echo "=========================================="
echo "IAC Dharma v3.0 Backend Services Startup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if dharma-ai-engine container is running
echo "Checking prerequisites..."
if ! docker ps | grep -q dharma-ai-engine; then
    print_error "dharma-ai-engine container is not running"
    echo "Please start it first with: docker start dharma-ai-engine"
    exit 1
fi
print_status "Container dharma-ai-engine is running"

# Check if v3 infrastructure is running
echo ""
echo "Checking v3 infrastructure services..."
services=("iac-postgres-v3" "iac-neo4j-v3" "iac-redis-v3")
for service in "${services[@]}"; do
    if docker ps | grep -q "$service"; then
        print_status "$service is running"
    else
        print_warning "$service is not running"
        echo "Start with: docker-compose -f docker-compose.v3.yml up -d"
    fi
done

# Copy backend services to container
echo ""
echo "Copying backend services to container..."

print_status "Copying AIOps Engine v3..."
docker cp backend/ai-engine/. dharma-ai-engine:/app/v3-aiops/ 2>/dev/null || print_warning "Failed to copy AIOps Engine"

print_status "Copying CMDB Agent..."
docker cp backend/cmdb-agent/. dharma-ai-engine:/app/v3-cmdb/ 2>/dev/null || print_warning "Failed to copy CMDB Agent"

print_status "Copying AI Orchestrator..."
docker cp backend/ai-orchestrator/. dharma-ai-engine:/app/v3-orchestrator/ 2>/dev/null || print_warning "Failed to copy AI Orchestrator"

# Install dependencies
echo ""
echo "Installing dependencies..."

print_status "Installing AIOps Engine dependencies..."
docker exec dharma-ai-engine bash -c "cd /app/v3-aiops && pip install -q -r requirements.txt" 2>/dev/null || print_warning "Some AIOps dependencies may already be installed"

print_status "Installing CMDB Agent dependencies..."
docker exec dharma-ai-engine bash -c "cd /app/v3-cmdb && pip install -q -r requirements.txt" 2>/dev/null || print_warning "Some CMDB dependencies may already be installed"

print_status "Installing AI Orchestrator dependencies..."
docker exec dharma-ai-engine bash -c "cd /app/v3-orchestrator && pip install -q -r requirements.txt" 2>/dev/null || print_warning "Some Orchestrator dependencies may already be installed"

# Stop any existing services
echo ""
echo "Stopping any existing v3 services..."
docker exec dharma-ai-engine pkill -f "uvicorn app_v3:app" 2>/dev/null || true
sleep 2

# Start services
echo ""
echo "Starting backend services..."

print_status "Starting AIOps Engine on port 8100..."
docker exec -d dharma-ai-engine bash -c "cd /app/v3-aiops && uvicorn app_v3:app --host 0.0.0.0 --port 8100 > /tmp/aiops-v3.log 2>&1"
sleep 3

print_status "Starting CMDB Agent on port 8200..."
docker exec -d dharma-ai-engine bash -c "cd /app/v3-cmdb && uvicorn app_v3:app --host 0.0.0.0 --port 8200 > /tmp/cmdb-v3.log 2>&1"
sleep 3

print_status "Starting AI Orchestrator on port 8300..."
docker exec -d dharma-ai-engine bash -c "cd /app/v3-orchestrator && uvicorn app_v3:app --host 0.0.0.0 --port 8300 > /tmp/orchestrator-v3.log 2>&1"
sleep 3

# Health checks
echo ""
echo "Performing health checks..."

check_health() {
    local url=$1
    local name=$2
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_status "$name is healthy"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$name health check failed"
    return 1
}

check_health "http://localhost:8100/api/v3/aiops/health" "AIOps Engine"
check_health "http://localhost:8200/api/v3/cmdb/health" "CMDB Agent"
check_health "http://localhost:8300/api/v3/orchestrator/health" "AI Orchestrator"

# Summary
echo ""
echo "=========================================="
echo "Backend Services Status"
echo "=========================================="
echo ""
echo "✅ AIOps Engine:      http://localhost:8100"
echo "✅ CMDB Agent:        http://localhost:8200"
echo "✅ AI Orchestrator:   http://localhost:8300"
echo ""
echo "GraphQL API Gateway:  http://localhost:4000 (needs separate setup)"
echo ""
echo "=========================================="
echo "View Logs:"
echo "=========================================="
echo ""
echo "docker exec dharma-ai-engine tail -f /tmp/aiops-v3.log"
echo "docker exec dharma-ai-engine tail -f /tmp/cmdb-v3.log"
echo "docker exec dharma-ai-engine tail -f /tmp/orchestrator-v3.log"
echo ""
echo "=========================================="
echo "Test Commands:"
echo "=========================================="
echo ""
echo "# Test AI Orchestrator"
echo "curl http://localhost:8300/api/v3/orchestrator/help"
echo ""
echo "# Process NLP command"
echo 'curl -X POST http://localhost:8300/api/v3/orchestrator/command \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"command": "list all infrastructures"}'"'"
echo ""
echo "# Get CMDB statistics"
echo "curl http://localhost:8200/api/v3/cmdb/statistics"
echo ""
echo "=========================================="
print_status "All services started successfully!"
echo "=========================================="
