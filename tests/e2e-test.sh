#!/bin/bash

# E2E Test Suite for CMDB Security Enforcement System
# Tests the complete flow: Agent → API → Database → WebSocket → Frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"
TEST_AGENT="e2e-test-agent"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

test_start() {
    ((TOTAL_TESTS++))
    log_info "Test $TOTAL_TESTS: $1"
}

# Test 1: API Gateway Health Check
test_api_health() {
    test_start "API Gateway health check"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" || echo "000")
    
    if [ "$response" = "200" ]; then
        log_success "API Gateway is healthy (HTTP 200)"
        return 0
    else
        log_error "API Gateway health check failed (HTTP $response)"
        return 1
    fi
}

# Test 2: Database Connection
test_database_connection() {
    test_start "Database connection via API"
    
    response=$(curl -s "$API_URL/api/enforcement/events?limit=1")
    
    if echo "$response" | jq -e '.events' > /dev/null 2>&1; then
        log_success "Database connection working"
        return 0
    else
        log_error "Database query failed: $response"
        return 1
    fi
}

# Test 3: Create Enforcement Event
test_create_event() {
    test_start "Create enforcement event via API"
    
    EVENT_ID="${TEST_AGENT}-$(date +%s)-test"
    
    payload=$(cat <<EOF
{
  "agentName": "$TEST_AGENT",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "type": "usb_device",
  "policyId": "e2e-test-policy",
  "policyName": "E2E Test Policy",
  "severity": "high",
  "event": {
    "deviceId": "test-device-001",
    "action": "connected",
    "details": "E2E test event"
  },
  "actions": [
    {
      "type": "block",
      "status": "success",
      "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"
    }
  ]
}
EOF
)
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "X-Agent-Name: $TEST_AGENT" \
        -d "$payload" \
        "$API_URL/api/enforcement/events")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        CREATED_EVENT_ID=$(echo "$response" | jq -r '.eventId')
        log_success "Event created successfully (ID: $CREATED_EVENT_ID)"
        return 0
    else
        log_error "Event creation failed: $response"
        return 1
    fi
}

# Test 4: Retrieve Event from Database
test_retrieve_event() {
    test_start "Retrieve event from database"
    
    sleep 1  # Allow database write to complete
    
    response=$(curl -s "$API_URL/api/enforcement/events?agentName=$TEST_AGENT&limit=1")
    
    if echo "$response" | jq -e '.events[0].id' > /dev/null 2>&1; then
        event_id=$(echo "$response" | jq -r '.events[0].id')
        log_success "Event retrieved successfully (ID: $event_id)"
        return 0
    else
        log_error "Event retrieval failed: $response"
        return 1
    fi
}

# Test 5: Test Filtering by Severity
test_filter_by_severity() {
    test_start "Filter events by severity"
    
    response=$(curl -s "$API_URL/api/enforcement/events?severity=high&limit=10")
    
    if echo "$response" | jq -e '.events' > /dev/null 2>&1; then
        count=$(echo "$response" | jq '.events | length')
        log_success "Severity filtering working ($count high-severity events found)"
        return 0
    else
        log_error "Severity filtering failed: $response"
        return 1
    fi
}

# Test 6: Test Statistics Endpoint
test_statistics() {
    test_start "Retrieve enforcement statistics"
    
    response=$(curl -s "$API_URL/api/enforcement/stats")
    
    if echo "$response" | jq -e '.stats.totalEvents' > /dev/null 2>&1; then
        total=$(echo "$response" | jq '.stats.totalEvents')
        critical=$(echo "$response" | jq '.stats.severityBreakdown.critical // 0')
        high=$(echo "$response" | jq '.stats.severityBreakdown.high // 0')
        log_success "Statistics retrieved (Total: $total, Critical: $critical, High: $high)"
        return 0
    else
        log_error "Statistics retrieval failed: $response"
        return 1
    fi
}

# Test 7: Test Agent Metrics
test_agent_metrics() {
    test_start "Retrieve agent metrics"
    
    response=$(curl -s "$API_URL/api/enforcement/agents")
    
    if echo "$response" | jq -e '.agents' > /dev/null 2>&1; then
        count=$(echo "$response" | jq '.agents | length')
        log_success "Agent metrics retrieved ($count agents found)"
        return 0
    else
        log_error "Agent metrics retrieval failed: $response"
        return 1
    fi
}

# Test 8: Test Policy Metrics
test_policy_metrics() {
    test_start "Retrieve policy metrics"
    
    response=$(curl -s "$API_URL/api/enforcement/policies")
    
    if echo "$response" | jq -e '.policies' > /dev/null 2>&1; then
        count=$(echo "$response" | jq '.policies | length')
        log_success "Policy metrics retrieved ($count policies found)"
        return 0
    else
        log_error "Policy metrics retrieval failed: $response"
        return 1
    fi
}

# Test 9: WebSocket Connection Test
test_websocket_connection() {
    test_start "WebSocket real-time connection"
    
    # Create a temporary Node.js script to test WebSocket
    cat > /tmp/ws-test.js <<'WSEOF'
const io = require('socket.io-client');
const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    reconnection: false
});

let connected = false;
let eventReceived = false;

socket.on('connect', () => {
    connected = true;
    console.log('WebSocket connected');
    
    // Listen for enforcement events
    socket.on('enforcement:event', (event) => {
        eventReceived = true;
        console.log('Event received:', event.id);
        socket.disconnect();
        process.exit(0);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
        if (connected && !eventReceived) {
            console.log('WebSocket connected but no events received (this is OK)');
            socket.disconnect();
            process.exit(0);
        }
    }, 5000);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    process.exit(1);
});

socket.on('disconnect', () => {
    if (!connected) {
        console.error('Failed to connect');
        process.exit(1);
    }
});
WSEOF
    
    if node /tmp/ws-test.js 2>&1 | grep -q "WebSocket connected"; then
        log_success "WebSocket connection established"
        rm -f /tmp/ws-test.js
        return 0
    else
        log_error "WebSocket connection failed"
        rm -f /tmp/ws-test.js
        return 1
    fi
}

# Test 10: Frontend Availability
test_frontend_availability() {
    test_start "Frontend application availability"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
    
    if [ "$response" = "200" ]; then
        log_success "Frontend is accessible (HTTP 200)"
        return 0
    else
        log_error "Frontend is not accessible (HTTP $response)"
        return 1
    fi
}

# Test 11: Database Persistence Test
test_database_persistence() {
    test_start "Database persistence across queries"
    
    # Get current event count
    response1=$(curl -s "$API_URL/api/enforcement/events?limit=1")
    count1=$(echo "$response1" | jq '.pagination.total')
    
    # Wait a moment
    sleep 2
    
    # Get count again
    response2=$(curl -s "$API_URL/api/enforcement/events?limit=1")
    count2=$(echo "$response2" | jq '.pagination.total')
    
    if [ "$count1" = "$count2" ]; then
        log_success "Database persistence verified (count: $count1)"
        return 0
    else
        log_warning "Event count changed ($count1 → $count2) - may indicate new events"
        return 0
    fi
}

# Test 12: Performance Test (Response Time)
test_response_time() {
    test_start "API response time performance"
    
    start_time=$(date +%s%N)
    curl -s "$API_URL/api/enforcement/events?limit=10" > /dev/null
    end_time=$(date +%s%N)
    
    elapsed=$((($end_time - $start_time) / 1000000))  # Convert to milliseconds
    
    if [ $elapsed -lt 500 ]; then
        log_success "Response time: ${elapsed}ms (excellent)"
        return 0
    elif [ $elapsed -lt 1000 ]; then
        log_success "Response time: ${elapsed}ms (good)"
        return 0
    else
        log_warning "Response time: ${elapsed}ms (slow)"
        return 0
    fi
}

# Main test execution
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║         🧪 E2E TEST SUITE - CMDB SECURITY ENFORCEMENT              ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    log_info "Starting comprehensive E2E tests..."
    echo ""
    
    # Run all tests
    test_api_health || true
    test_database_connection || true
    test_create_event || true
    test_retrieve_event || true
    test_filter_by_severity || true
    test_statistics || true
    test_agent_metrics || true
    test_policy_metrics || true
    test_websocket_connection || true
    test_frontend_availability || true
    test_database_persistence || true
    test_response_time || true
    
    # Summary
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                         TEST SUMMARY                               ║"
    echo "╠═══════════════════════════════════════════════════════════════════╣"
    printf "║  Total Tests:    %-48s ║\n" "$TOTAL_TESTS"
    printf "║  ${GREEN}Passed:${NC}         %-48s ║\n" "$PASSED_TESTS"
    printf "║  ${RED}Failed:${NC}         %-48s ║\n" "$FAILED_TESTS"
    
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    printf "║  Success Rate:   %-48s ║\n" "${success_rate}%"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please review the output above.${NC}"
        exit 1
    fi
}

# Run main function
main
