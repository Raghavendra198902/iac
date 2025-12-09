#!/bin/bash

# CMDB Agent - Complete Local Test
# Tests all API endpoints with authentication

set -e

API_BASE="http://localhost:8080"
AUTH="admin:changeme"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "================================================"
echo "CMDB Agent - Complete API Test"
echo "================================================"
echo ""
echo "Target: $API_BASE"
echo "Auth: admin:***"
echo ""

# Test function
test_api() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo "   ${method} ${endpoint}"
    
    local response
    if [ "$method" = "GET" ]; then
        response=$(curl -s -u "$AUTH" -w "\n%{http_code}" "${API_BASE}${endpoint}" 2>/dev/null)
    else
        response=$(curl -s -u "$AUTH" -X POST -w "\n%{http_code}" "${API_BASE}${endpoint}" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}   ✅ Success (HTTP $http_code)${NC}"
        if command -v jq &> /dev/null && [ -n "$body" ]; then
            echo "$body" | jq -C '.' 2>/dev/null | head -n 20 || echo "$body" | head -c 400
        elif [ -n "$body" ]; then
            echo "$body" | head -c 400
        fi
        echo ""
        return 0
    else
        echo -e "${YELLOW}   ⚠️  HTTP $http_code${NC}"
        [ -n "$body" ] && echo "$body" | head -c 200
        echo ""
        return 1
    fi
}

# Check if agent is running
echo -e "${CYAN}Checking agent status...${NC}"
if curl -s -u "$AUTH" "${API_BASE}/health" &>/dev/null; then
    echo -e "${GREEN}✅ Agent is responding${NC}"
else
    echo -e "${RED}❌ Agent not responding. Start it first:${NC}"
    echo "   cd /home/rrd/iac/backend/cmdb-agent-go"
    echo "   ./dist/cmdb-agent-linux-amd64 --config config.local.yaml"
    exit 1
fi
echo ""

# Health Check
echo "================================================"
echo "Health & Status"
echo "================================================"
echo ""

test_api "GET" "/health" "Health Check"
sleep 1

# Dashboard
echo "================================================"
echo "Dashboard & Overview"
echo "================================================"
echo ""

test_api "GET" "/api/dashboard" "Dashboard Statistics"
sleep 1

# Inventory
echo "================================================"
echo "Inventory Endpoints"
echo "================================================"
echo ""

test_api "GET" "/api/inventory/system" "System Inventory"
sleep 1

test_api "GET" "/api/inventory/hardware" "Hardware Inventory"
sleep 1

test_api "GET" "/api/inventory/software" "Software Inventory"
sleep 1

test_api "GET" "/api/inventory/licenses" "License Audit"
sleep 1

# Monitoring
echo "================================================"
echo "Monitoring & Metrics"
echo "================================================"
echo ""

test_api "GET" "/api/monitoring/metrics" "Performance Metrics"
sleep 1

# Enforcement
echo "================================================"
echo "Enforcement & Policies"
echo "================================================"
echo ""

test_api "GET" "/api/enforcement/policies" "Policy Status"
sleep 1

# Trigger Collection
echo "================================================"
echo "Collector Operations"
echo "================================================"
echo ""

test_api "POST" "/api/collectors/run" "Trigger Collection Run"
sleep 2

# Show Web UI
echo ""
echo "================================================"
echo "Web UI Access"
echo "================================================"
echo ""
echo -e "${CYAN}Open in browser:${NC}"
echo "   ${API_BASE}"
echo ""
echo -e "${CYAN}Credentials:${NC}"
echo "   Admin:  admin / changeme"
echo "   Viewer: viewer / viewer123"
echo ""

# Show curl examples
echo "================================================"
echo "Example curl Commands"
echo "================================================"
echo ""
echo "# Health check"
echo "curl -u admin:changeme ${API_BASE}/health | jq ."
echo ""
echo "# Dashboard stats"
echo "curl -u admin:changeme ${API_BASE}/api/dashboard | jq ."
echo ""
echo "# System inventory"
echo "curl -u admin:changeme ${API_BASE}/api/inventory/system | jq ."
echo ""
echo "# Trigger collection"
echo "curl -u admin:changeme -X POST ${API_BASE}/api/collectors/run"
echo ""

# Summary
echo "================================================"
echo "Test Summary"
echo "================================================"
echo ""

# Check if agent process is still running
if pgrep -f "cmdb-agent-linux" > /dev/null; then
    echo -e "${GREEN}✅ Agent Status: Running${NC}"
    echo "   PID: $(pgrep -f cmdb-agent-linux)"
else
    echo -e "${RED}❌ Agent Status: Not running${NC}"
fi

echo ""
echo "Logs: /tmp/cmdb-agent-test.log"
echo "Data: /tmp/cmdb-agent-data/"
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
