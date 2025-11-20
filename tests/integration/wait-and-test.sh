#!/bin/bash

# Script to wait for all services to be healthy and then run integration tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== IAC DHARMA Integration Test Runner ===${NC}\n"

# Function to check if a service is healthy
check_service() {
    local url=$1
    local name=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is healthy"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not ready"
        return 1
    fi
}

# Wait for all services
echo "Waiting for services to become healthy..."
echo "This may take several minutes on first build..."
echo ""

MAX_WAIT=600  # 10 minutes
ELAPSED=0
CHECK_INTERVAL=10

while [ $ELAPSED -lt $MAX_WAIT ]; do
    ALL_HEALTHY=true
    
    # Check all services
    check_service "http://localhost:3000/health" "API Gateway" || ALL_HEALTHY=false
    check_service "http://localhost:3001/health" "Blueprint Service" || ALL_HEALTHY=false
    check_service "http://localhost:3002/health" "IaC Generator" || ALL_HEALTHY=false
    check_service "http://localhost:3003/health" "Guardrails Engine" || ALL_HEALTHY=false
    check_service "http://localhost:3004/health" "Costing Service" || ALL_HEALTHY=false
    check_service "http://localhost:3005/health" "Orchestrator Service" || ALL_HEALTHY=false
    check_service "http://localhost:3006/health" "Automation Engine" || ALL_HEALTHY=false
    check_service "http://localhost:3007/health" "Monitoring Service" || ALL_HEALTHY=false
    check_service "http://localhost:8000/health" "AI Engine" || ALL_HEALTHY=false
    
    if [ "$ALL_HEALTHY" = true ]; then
        echo -e "\n${GREEN}✓ All services are healthy!${NC}\n"
        break
    fi
    
    ELAPSED=$((ELAPSED + CHECK_INTERVAL))
    echo -e "\nWaiting... ($ELAPSED/${MAX_WAIT}s elapsed)\n"
    sleep $CHECK_INTERVAL
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e "\n${RED}✗ Timeout waiting for services${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

# Run integration tests
echo -e "${YELLOW}=== Running Integration Tests ===${NC}\n"
cd "$SCRIPT_DIR"

npm test

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✓ All integration tests passed!${NC}"
else
    echo -e "\n${RED}✗ Some tests failed${NC}"
fi

exit $TEST_EXIT_CODE
