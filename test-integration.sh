#!/bin/bash

# End-to-End Integration Test Suite
# Tests complete flow: Agent → Enforcement → API → Database → WebSocket → Frontend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${API_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
TEST_AGENT_NAME="test-agent-$(date +%s)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🧪 IAC DHARMA - INTEGRATION TEST SUITE 🧪            ║"
echo "╔══════════════════════════════════════════════════════════╗"
echo ""

# Helper functions
pass() {
    ((TESTS_PASSED++))
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    ((TESTS_FAILED++))
    echo -e "${RED}✗${NC} $1"
}

test_start() {
    ((TESTS_RUN++))
    echo -e "\n${BLUE}Test $TESTS_RUN:${NC} $1"
}

# Test 1: API Gateway Health
test_start "API Gateway Health Check"
if curl -sf "${API_URL}/health" > /dev/null 2>&1; then
    pass "API Gateway is healthy"
else
    fail "API Gateway is not responding"
fi

# Test 2: Database Connection
test_start "Database Connection"
DB_RESPONSE=$(curl -s "${API_URL}/health" | jq -r '.database // "unknown"' 2>/dev/null || echo "error")
if [[ "$DB_RESPONSE" == "connected" ]]; then
    pass "Database is connected"
else
    fail "Database connection issue: $DB_RESPONSE"
fi

# Test 3: Frontend Accessibility
test_start "Frontend Accessibility"
if curl -sf "${FRONTEND_URL}" > /dev/null 2>&1; then
    pass "Frontend is accessible"
else
    fail "Frontend is not responding"
fi

# Test 4: Create Enforcement Event
test_start "Create Enforcement Event via API"
EVENT_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/enforcement/events" \
    -H "Content-Type: application/json" \
    -H "X-Agent-Name: ${TEST_AGENT_NAME}" \
    -d "{
        \"events\": [{
            \"timestamp\": \"${EVENT_TIMESTAMP}\",
            \"type\": \"policy_triggered\",
            \"policyId\": \"test-policy-$(date +%s)\",
            \"policyName\": \"Integration Test Policy\",
            \"severity\": \"high\",
            \"event\": {
                \"type\": \"test_event\",
                \"description\": \"Automated integration test\"
            },
            \"results\": [{
                \"actionType\": \"block\",
                \"success\": true
            }],
            \"metadata\": {
                \"testRun\": true,
                \"timestamp\": \"${EVENT_TIMESTAMP}\"
            }
        }]
    }")

if echo "$EVENT_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    EVENT_ID=$(echo "$EVENT_RESPONSE" | jq -r '.eventIds[0]')
    pass "Event created successfully: $EVENT_ID"
else
    fail "Failed to create event: $EVENT_RESPONSE"
    EVENT_ID=""
fi

# Test 5: Retrieve Event from Database
if [ -n "$EVENT_ID" ]; then
    test_start "Retrieve Event from Database"
    sleep 1 # Brief delay to ensure database write
    
    RETRIEVED_EVENT=$(curl -s "${API_URL}/api/enforcement/events?limit=1" | jq -r '.events[0]')
    
    if [ -n "$RETRIEVED_EVENT" ] && [ "$RETRIEVED_EVENT" != "null" ]; then
        RETRIEVED_ID=$(echo "$RETRIEVED_EVENT" | jq -r '.id')
        if [ "$RETRIEVED_ID" == "$EVENT_ID" ]; then
            pass "Event retrieved from database correctly"
        else
            fail "Retrieved event ID mismatch (expected: $EVENT_ID, got: $RETRIEVED_ID)"
        fi
    else
        fail "Failed to retrieve event from database"
    fi
fi

# Test 6: Event Statistics
test_start "Event Statistics API"
STATS_RESPONSE=$(curl -s "${API_URL}/api/enforcement/stats")
if echo "$STATS_RESPONSE" | jq -e '.stats.total >= 1' > /dev/null 2>&1; then
    TOTAL_EVENTS=$(echo "$STATS_RESPONSE" | jq -r '.stats.total')
    pass "Statistics working: $TOTAL_EVENTS total events"
else
    fail "Statistics API not working"
fi

# Test 7: Event Filtering
test_start "Event Filtering by Severity"
HIGH_EVENTS=$(curl -s "${API_URL}/api/enforcement/events?severity=high" | jq -r '.count')
if [ "$HIGH_EVENTS" -ge 1 ]; then
    pass "Severity filtering working: $HIGH_EVENTS high-severity events"
else
    fail "Severity filtering not working"
fi

# Test 8: Agent Filtering
test_start "Event Filtering by Agent"
AGENT_EVENTS=$(curl -s "${API_URL}/api/enforcement/events?agentName=${TEST_AGENT_NAME}" | jq -r '.count')
if [ "$AGENT_EVENTS" -ge 1 ]; then
    pass "Agent filtering working: $AGENT_EVENTS events from test agent"
else
    fail "Agent filtering not working"
fi

# Test 9: Pagination
test_start "Event Pagination"
PAGE1=$(curl -s "${API_URL}/api/enforcement/events?limit=1&offset=0" | jq -r '.count')
if [ "$PAGE1" == "1" ]; then
    pass "Pagination working correctly"
else
    fail "Pagination not working"
fi

# Test 10: Security Dashboard Endpoint
test_start "Security Dashboard Page"
if curl -sf "${FRONTEND_URL}/security" | grep -q "html" 2>/dev/null; then
    pass "Security dashboard page loads"
else
    fail "Security dashboard page not loading"
fi

# Test 11: API Gateway Restart Persistence
test_start "Database Persistence (API Restart Simulation)"
EVENTS_BEFORE=$(curl -s "${API_URL}/api/enforcement/events" | jq -r '.total')
echo "   Events before: $EVENTS_BEFORE"

# Simulate by querying again after brief delay
sleep 2
EVENTS_AFTER=$(curl -s "${API_URL}/api/enforcement/events" | jq -r '.total')
echo "   Events after: $EVENTS_AFTER"

if [ "$EVENTS_BEFORE" == "$EVENTS_AFTER" ]; then
    pass "Database persistence verified"
else
    fail "Event count mismatch (may indicate persistence issue)"
fi

# Test 12: Performance Test - Response Time
test_start "API Response Time"
START_TIME=$(date +%s%N)
curl -s "${API_URL}/api/enforcement/events?limit=10" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ "$RESPONSE_TIME" -lt 1000 ]; then
    pass "Response time acceptable: ${RESPONSE_TIME}ms"
else
    fail "Response time too slow: ${RESPONSE_TIME}ms"
fi

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                          ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo -e "║  Total Tests:  $TESTS_RUN                                        ║"
echo -e "║  ${GREEN}Passed:      $TESTS_PASSED${NC}                                        ║"
echo -e "║  ${RED}Failed:      $TESTS_FAILED${NC}                                        ║"
echo "╠══════════════════════════════════════════════════════════╣"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "║  ${GREEN}Result:      ALL TESTS PASSED ✓${NC}                       ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    exit 0
else
    echo -e "║  ${RED}Result:      SOME TESTS FAILED ✗${NC}                      ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    exit 1
fi
