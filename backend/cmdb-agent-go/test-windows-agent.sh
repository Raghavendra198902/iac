#!/bin/bash

# Windows Agent Local Testing Script
# Tests the enhanced Windows agent using Wine on Linux

set -e

AGENT_DIR="/home/rrd/iac/backend/cmdb-agent-go"
AGENT_BINARY="$AGENT_DIR/dist/cmdb-agent-windows-amd64-enhanced.exe"
CONFIG_FILE="$AGENT_DIR/config.windows-test.yaml"
API_BASE="http://localhost:8080/api/v1"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "Windows Agent Local Testing"
echo "================================================"
echo ""

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if [ ! -f "$AGENT_BINARY" ]; then
    echo -e "${RED}❌ Enhanced agent binary not found: $AGENT_BINARY${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Agent binary found ($(du -h "$AGENT_BINARY" | cut -f1))${NC}"

if ! command -v wine &> /dev/null; then
    echo -e "${RED}❌ Wine not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Wine installed: $(wine --version)${NC}"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Configuration file not found: $CONFIG_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Configuration file found${NC}"

echo ""

# Create temp data directory
echo -e "${BLUE}Setting up test environment...${NC}"
mkdir -p /tmp/cmdb-agent-data
echo -e "${GREEN}✅ Data directory created: /tmp/cmdb-agent-data${NC}"
echo ""

# Start the agent in background
echo "================================================"
echo "Starting Windows Agent with Wine"
echo "================================================"
echo ""
echo -e "${YELLOW}Note: Wine will simulate Windows environment${NC}"
echo -e "${YELLOW}Some Windows-specific features may not work fully${NC}"
echo ""

# Kill any existing agent
pkill -f "cmdb-agent-windows" 2>/dev/null || true
sleep 2

# Start agent
echo -e "${BLUE}Starting agent...${NC}"
cd "$AGENT_DIR"
wine "$AGENT_BINARY" --config "$CONFIG_FILE" > /tmp/cmdb-agent-test.log 2>&1 &
AGENT_PID=$!

echo -e "${GREEN}✅ Agent started (PID: $AGENT_PID)${NC}"
echo "   Log file: /tmp/cmdb-agent-test.log"
echo ""

# Wait for agent to start
echo -e "${BLUE}Waiting for agent to initialize (10 seconds)...${NC}"
for i in {10..1}; do
    echo -n "."
    sleep 1
done
echo ""
echo ""

# Check if agent is running
if ! kill -0 $AGENT_PID 2>/dev/null; then
    echo -e "${RED}❌ Agent process died${NC}"
    echo "Last 20 lines of log:"
    tail -n 20 /tmp/cmdb-agent-test.log
    exit 1
fi

echo -e "${GREEN}✅ Agent process is running${NC}"
echo ""

# Test API endpoints
echo "================================================"
echo "Testing API Endpoints"
echo "================================================"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo "   Endpoint: $endpoint"
    
    response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}   ✅ Success (HTTP $http_code)${NC}"
        if [ -n "$body" ]; then
            # Pretty print JSON if possible
            if command -v jq &> /dev/null; then
                echo "$body" | jq '.' 2>/dev/null | head -n 10 || echo "$body" | head -c 200
            else
                echo "$body" | head -c 200
            fi
            echo ""
        fi
        return 0
    else
        echo -e "${RED}   ❌ Failed (HTTP $http_code)${NC}"
        return 1
    fi
}

# Test health endpoint
test_endpoint "$API_BASE/health" "Health Check"
sleep 2

# Test collectors list
test_endpoint "$API_BASE/collectors" "List All Collectors"
sleep 2

# Test individual collectors
echo ""
echo "================================================"
echo "Testing Individual Collectors"
echo "================================================"
echo ""

# Cross-platform collectors
test_endpoint "$API_BASE/collect?collector=system" "System Collector"
sleep 2

test_endpoint "$API_BASE/collect?collector=hardware" "Hardware Collector"
sleep 2

# Windows-specific collectors (may not work fully in Wine)
echo ""
echo -e "${YELLOW}Testing Windows-Specific Collectors (may have limitations in Wine):${NC}"
echo ""

test_endpoint "$API_BASE/collect?collector=windows_registry" "Windows Registry Collector"
sleep 2

test_endpoint "$API_BASE/collect?collector=windows_wmi" "Windows WMI Collector"
sleep 2

test_endpoint "$API_BASE/collect?collector=windows_performance" "Windows Performance Collector"
sleep 2

# Test detailed mode
echo ""
echo "================================================"
echo "Testing Detailed Collection Mode"
echo "================================================"
echo ""

test_endpoint "$API_BASE/collect?collector=windows_wmi&mode=detailed" "Windows WMI Collector (Detailed)"
sleep 2

# Show agent logs
echo ""
echo "================================================"
echo "Agent Logs (Last 30 Lines)"
echo "================================================"
echo ""
tail -n 30 /tmp/cmdb-agent-test.log

# Summary
echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo ""
echo "Agent Status:"
if kill -0 $AGENT_PID 2>/dev/null; then
    echo -e "${GREEN}   ✅ Agent is running (PID: $AGENT_PID)${NC}"
else
    echo -e "${RED}   ❌ Agent stopped${NC}"
fi

echo ""
echo "Access Agent:"
echo "   Web UI: http://localhost:8080"
echo "   Health: curl $API_BASE/health"
echo "   Collectors: curl $API_BASE/collectors"
echo ""

echo "View Logs:"
echo "   tail -f /tmp/cmdb-agent-test.log"
echo ""

echo "Stop Agent:"
echo "   kill $AGENT_PID"
echo "   # or"
echo "   pkill -f cmdb-agent-windows"
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "The agent will continue running in the background."
echo "Use the commands above to interact with it."
echo ""
