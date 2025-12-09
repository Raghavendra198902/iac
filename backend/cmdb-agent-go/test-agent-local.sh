#!/bin/bash

# CMDB Agent Local Test Script
# Tests the agent locally with the 8 cross-platform collectors

set -e

AGENT_DIR="/home/rrd/iac/backend/cmdb-agent-go"
AGENT_BINARY="$AGENT_DIR/dist/cmdb-agent-linux-amd64"
CONFIG_FILE="$AGENT_DIR/config.local.yaml"
API_BASE="http://localhost:8080/api/v1"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "================================================"
echo "CMDB Agent Local Testing"
echo "================================================"
echo ""

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if [ ! -f "$AGENT_BINARY" ]; then
    echo -e "${RED}❌ Agent binary not found: $AGENT_BINARY${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Agent binary found ($(du -h "$AGENT_BINARY" | cut -f1))${NC}"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Configuration file not found: $CONFIG_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Configuration file found${NC}"
echo ""

# Create temp data directory
echo -e "${BLUE}Setting up test environment...${NC}"
mkdir -p /tmp/cmdb-agent-data
echo -e "${GREEN}✅ Data directory created${NC}"
echo ""

# Kill any existing agent
pkill -f "cmdb-agent-linux" 2>/dev/null || true
sleep 2

# Start agent
echo "================================================"
echo "Starting CMDB Agent"
echo "================================================"
echo ""

cd "$AGENT_DIR"
"$AGENT_BINARY" --config "$CONFIG_FILE" > /tmp/cmdb-agent-test.log 2>&1 &
AGENT_PID=$!

echo -e "${GREEN}✅ Agent started (PID: $AGENT_PID)${NC}"
echo "   Log: /tmp/cmdb-agent-test.log"
echo ""

# Wait for startup
echo -e "${BLUE}Waiting for agent initialization...${NC}"
sleep 5

# Check process
if ! kill -0 $AGENT_PID 2>/dev/null; then
    echo -e "${RED}❌ Agent died. Last 20 lines:${NC}"
    tail -n 20 /tmp/cmdb-agent-test.log
    exit 1
fi

echo -e "${GREEN}✅ Agent is running${NC}"
echo ""

# Test function
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "${BLUE}Testing: $description${NC}"
    
    response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}   ✅ Success (HTTP $http_code)${NC}"
        if command -v jq &> /dev/null; then
            echo "$body" | jq -C '.' 2>/dev/null | head -n 15
        else
            echo "$body" | head -c 300
        fi
        echo ""
        return 0
    else
        echo -e "${RED}   ❌ Failed (HTTP $http_code)${NC}"
        echo "$body"
        return 1
    fi
}

# Wait a bit more for full startup
sleep 3

echo "================================================"
echo "Testing API Endpoints"
echo "================================================"
echo ""

# Health check
test_endpoint "$API_BASE/health" "Health Check"
sleep 1

# List collectors
test_endpoint "$API_BASE/collectors" "List All Collectors"
sleep 1

echo ""
echo "================================================"
echo "Testing Collectors"
echo "================================================"
echo ""

# Test each collector
test_endpoint "$API_BASE/collect?collector=system" "System Collector"
sleep 1

test_endpoint "$API_BASE/collect?collector=hardware" "Hardware Collector"
sleep 1

test_endpoint "$API_BASE/collect?collector=network" "Network Collector"
sleep 1

test_endpoint "$API_BASE/collect?collector=software" "Software Collector"
sleep 1

test_endpoint "$API_BASE/collect?collector=service" "Service Collector"
sleep 1

# Collect all
echo ""
echo "================================================"
echo "Testing Collect All"
echo "================================================"
echo ""

test_endpoint "$API_BASE/collect/all" "Collect All Data"

# Show logs
echo ""
echo "================================================"
echo "Recent Agent Logs"
echo "================================================"
echo ""
tail -n 30 /tmp/cmdb-agent-test.log

# Summary
echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo ""

if kill -0 $AGENT_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Agent Status: Running (PID: $AGENT_PID)${NC}"
else
    echo -e "${RED}❌ Agent Status: Stopped${NC}"
fi

echo ""
echo "Access Points:"
echo "   Web UI:     http://localhost:8080"
echo "   API Base:   $API_BASE"
echo "   Health:     curl $API_BASE/health"
echo "   Collectors: curl $API_BASE/collectors"
echo ""

echo "Commands:"
echo "   View logs:  tail -f /tmp/cmdb-agent-test.log"
echo "   Stop agent: kill $AGENT_PID"
echo "   Stop agent: pkill -f cmdb-agent-linux"
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Testing Complete - Agent Running!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
