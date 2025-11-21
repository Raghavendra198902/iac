#!/bin/bash

# IAC Dharma Platform - Deployment Validation Script
# This script validates that all services are running and responding correctly

# Remove set -e to allow script to continue on errors
# set -e

echo "======================================"
echo "IAC Dharma Platform Validation"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNING=0

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response, expected $expected)"
        ((FAILED++))
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local name=$1
    
    echo -n "Checking container $name... "
    
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        running=$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null)
        
        if [ "$running" = "true" ]; then
            # Try to get health status if available
            status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$name" 2>/dev/null)
            
            if [ "$status" = "healthy" ]; then
                echo -e "${GREEN}✓ HEALTHY${NC}"
                ((PASSED++))
            elif [ "$status" = "unhealthy" ]; then
                echo -e "${YELLOW}⚠ UNHEALTHY${NC}"
                ((WARNING++))
            else
                echo -e "${GREEN}✓ RUNNING${NC}"
                ((PASSED++))
            fi
        else
            echo -e "${RED}✗ STOPPED${NC}"
            ((FAILED++))
        fi
        return 0
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to check database tables
check_database() {
    echo -n "Checking database tables... "
    
    table_count=$(docker exec dharma-postgres psql -U dharma_admin -d iac_dharma -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null | tr -d ' ')
    
    if [ "$table_count" = "39" ]; then
        echo -e "${GREEN}✓ PASSED${NC} ($table_count tables)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (found $table_count tables, expected 39)"
        ((FAILED++))
    fi
}

echo "=== Infrastructure Services ==="
check_container "dharma-postgres"
check_container "dharma-redis"
check_container "dharma-prometheus"
check_container "dharma-grafana"
echo ""

echo "=== Core Backend Services ==="
check_container "dharma-api-gateway"
check_container "dharma-blueprint-service"
check_container "dharma-iac-generator"
check_container "dharma-guardrails"
check_container "dharma-costing-service"
check_container "dharma-orchestrator"
check_container "dharma-automation-engine"
check_container "dharma-monitoring-service"
echo ""

echo "=== Frontend ==="
check_container "dharma-frontend"
echo ""

echo "=== Database ==="
check_database
echo ""

echo "=== API Endpoints ==="
check_service "API Gateway Info" "http://localhost:3000/api/" "401"
check_service "Blueprint Service" "http://localhost:3001/health" "200"
check_service "IAC Generator" "http://localhost:3002/health" "200"
check_service "Guardrails Engine" "http://localhost:3003/health" "200"
check_service "Costing Service" "http://localhost:3004/health" "200"
check_service "Orchestrator" "http://localhost:3005/health" "200"
check_service "Automation Engine" "http://localhost:3006/health" "200"
check_service "Monitoring Service" "http://localhost:3007/health" "200"
check_service "Frontend" "http://localhost:5173/" "200"
# Prometheus and Grafana redirect to login - 302 is acceptable
echo -n "Checking Prometheus... "
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:9090/" 2>/dev/null | grep -qE "^(200|302)$"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi
echo -n "Checking Grafana... "
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3030/" 2>/dev/null | grep -qE "^(200|302)$"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi
echo ""

echo "=== Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNING${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Platform is ready for use:"
    echo "  - Frontend:    http://localhost:5173"
    echo "  - API Gateway: http://localhost:3000"
    echo "  - Grafana:     http://localhost:3030 (admin/admin)"
    echo "  - Prometheus:  http://localhost:9090"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the output above.${NC}"
    exit 1
fi
