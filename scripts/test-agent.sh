#!/bin/bash

################################################################################
# Test CMDB Agent
# Comprehensive testing suite for agent functionality
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AGENT_URL="${AGENT_URL:-http://localhost:9000}"

echo "🧪 Testing CMDB Agent"
echo "===================="
echo

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_passed=0
test_failed=0

run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing: ${test_name}... "
    
    if eval "${test_command}" &>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
        ((test_passed++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        ((test_failed++))
        return 1
    fi
}

# Test 1: Health endpoint
run_test "Health Endpoint" \
    "curl -sf ${AGENT_URL}/health"

# Test 2: Status endpoint
run_test "Status Endpoint" \
    "curl -sf ${AGENT_URL}/status"

# Test 3: Security stats
run_test "Security Stats" \
    "curl -sf ${AGENT_URL}/security/stats"

# Test 4: Update check
run_test "Update Check" \
    "curl -sf ${AGENT_URL}/updates/status"

# Test 5: Trigger sync
run_test "Manual Sync" \
    "curl -sf -X POST ${AGENT_URL}/sync"

# Test 6: Agent is monitoring processes
run_test "Process Monitoring" \
    "curl -sf ${AGENT_URL}/status | grep -q '\"processes\"'"

echo
echo "================================"
echo "Test Results"
echo "================================"
echo -e "${GREEN}Passed: ${test_passed}${NC}"
echo -e "${RED}Failed: ${test_failed}${NC}"
echo "================================"

if [ ${test_failed} -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
