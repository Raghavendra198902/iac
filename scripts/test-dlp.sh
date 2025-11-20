#!/bin/bash
# Citadel Data Leakage Control - Automated Test Suite
# Version: 1.0.0
# Date: November 20, 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
TEST_CI_ID="ci-test-agent-001"
TEST_EVENT_PREFIX="test-$(date +%s)"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_test() {
    echo -e "${YELLOW}🧪 TEST: $1${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}\n"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}\n"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Test 1: Service Health Checks
test_service_health() {
    print_header "Service Health Checks"
    
    print_test "API Gateway Health"
    response=$(curl -s "$API_BASE_URL/health")
    if echo "$response" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
        print_pass "API Gateway is healthy"
    else
        print_fail "API Gateway health check failed"
    fi
    
    print_test "Security API Health"
    response=$(curl -s "$API_BASE_URL/api/security/health")
    if echo "$response" | jq -e '.status == "operational"' > /dev/null 2>&1; then
        print_pass "Security API is operational"
    else
        print_fail "Security API health check failed"
    fi
    
    print_test "Frontend Accessibility"
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        print_pass "Frontend is accessible"
    else
        print_fail "Frontend is not accessible"
    fi
}

# Test 2: Security Event Creation
test_event_creation() {
    print_header "Security Event Creation"
    
    # Test clipboard event
    print_test "Create Clipboard Security Event"
    response=$(curl -s -X POST "$API_BASE_URL/api/security/events" \
        -H "Content-Type: application/json" \
        -d "{
            \"ciId\": \"$TEST_CI_ID\",
            \"eventType\": \"clipboard\",
            \"severity\": \"high\",
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
            \"eventId\": \"${TEST_EVENT_PREFIX}-clipboard-001\",
            \"details\": {
                \"containsSensitive\": true,
                \"sensitivePatterns\": [\"PASSWORD\", \"API_KEY\"],
                \"contentLength\": 128,
                \"hash\": \"abc123def456\"
            }
        }")
    
    if echo "$response" | jq -e '.eventId' > /dev/null 2>&1; then
        print_pass "Clipboard event created successfully"
    else
        print_fail "Clipboard event creation failed"
    fi
    
    # Test USB write event
    print_test "Create USB Write Security Event"
    response=$(curl -s -X POST "$API_BASE_URL/api/security/events" \
        -H "Content-Type: application/json" \
        -d "{
            \"ciId\": \"$TEST_CI_ID\",
            \"eventType\": \"usb-write\",
            \"severity\": \"medium\",
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
            \"eventId\": \"${TEST_EVENT_PREFIX}-usb-001\",
            \"details\": {
                \"deviceId\": \"E:\",
                \"volumeLabel\": \"USB_DRIVE\",
                \"fileSize\": 5242880,
                \"fileName\": \"confidential.pdf\"
            }
        }")
    
    if echo "$response" | jq -e '.eventId' > /dev/null 2>&1; then
        print_pass "USB write event created successfully"
    else
        print_fail "USB write event creation failed"
    fi
    
    # Test file access event
    print_test "Create File Access Security Event"
    response=$(curl -s -X POST "$API_BASE_URL/api/security/events" \
        -H "Content-Type: application/json" \
        -d "{
            \"ciId\": \"$TEST_CI_ID\",
            \"eventType\": \"file-access\",
            \"severity\": \"low\",
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
            \"eventId\": \"${TEST_EVENT_PREFIX}-file-001\",
            \"details\": {
                \"filePath\": \"C:\\\\Users\\\\Admin\\\\Documents\\\\report.docx\",
                \"accessType\": \"read\",
                \"processName\": \"WINWORD.EXE\",
                \"pid\": 1234
            }
        }")
    
    if echo "$response" | jq -e '.eventId' > /dev/null 2>&1; then
        print_pass "File access event created successfully"
    else
        print_fail "File access event creation failed"
    fi
    
    # Test network exfiltration event
    print_test "Create Network Exfiltration Event"
    response=$(curl -s -X POST "$API_BASE_URL/api/security/events" \
        -H "Content-Type: application/json" \
        -d "{
            \"ciId\": \"$TEST_CI_ID\",
            \"eventType\": \"network-exfiltration\",
            \"severity\": \"high\",
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
            \"eventId\": \"${TEST_EVENT_PREFIX}-network-001\",
            \"details\": {
                \"processName\": \"suspicious.exe\",
                \"pid\": 5678,
                \"remoteAddress\": \"203.0.113.42\",
                \"remotePort\": 4444,
                \"protocol\": \"TCP\",
                \"isAnomaly\": true
            }
        }")
    
    if echo "$response" | jq -e '.eventId' > /dev/null 2>&1; then
        print_pass "Network exfiltration event created successfully"
    else
        print_fail "Network exfiltration event creation failed"
    fi
}

# Test 3: Event Querying
test_event_querying() {
    print_header "Security Event Querying"
    
    print_test "Query All Events"
    response=$(curl -s "$API_BASE_URL/api/security/events?limit=10")
    event_count=$(echo "$response" | jq -r '.total')
    if [ "$event_count" -gt 0 ]; then
        print_pass "Retrieved $event_count events"
    else
        print_fail "No events retrieved"
    fi
    
    print_test "Query Events by CI ID"
    response=$(curl -s "$API_BASE_URL/api/security/events?ciId=$TEST_CI_ID&limit=10")
    if echo "$response" | jq -e '.events | length > 0' > /dev/null 2>&1; then
        print_pass "Successfully queried events by CI ID"
    else
        print_fail "No events found for test CI ID"
    fi
    
    print_test "Query High Severity Events"
    response=$(curl -s "$API_BASE_URL/api/security/events?severity=high&limit=10")
    if echo "$response" | jq -e '.events | length > 0' > /dev/null 2>&1; then
        print_pass "Successfully queried high severity events"
    else
        print_fail "No high severity events found"
    fi
    
    print_test "Query by Event Type"
    response=$(curl -s "$API_BASE_URL/api/security/events?eventType=clipboard&limit=10")
    if echo "$response" | jq -e '.events | length > 0' > /dev/null 2>&1; then
        print_pass "Successfully queried clipboard events"
    else
        print_fail "No clipboard events found"
    fi
}

# Test 4: Analytics
test_analytics() {
    print_header "Security Analytics"
    
    print_test "Get Analytics (1 hour)"
    response=$(curl -s "$API_BASE_URL/api/security/analytics?timeRange=1h")
    if echo "$response" | jq -e '.totalEvents >= 0' > /dev/null 2>&1; then
        total=$(echo "$response" | jq -r '.totalEvents')
        print_pass "Analytics retrieved: $total total events"
        
        # Display statistics
        print_info "Event Distribution:"
        echo "$response" | jq -r '.statistics.byType | to_entries | .[] | "  - \(.key): \(.value)"'
        
        print_info "Severity Distribution:"
        echo "$response" | jq -r '.statistics.bySeverity | to_entries | .[] | "  - \(.key): \(.value)"'
    else
        print_fail "Failed to retrieve analytics"
    fi
    
    print_test "Get Analytics (24 hours)"
    response=$(curl -s "$API_BASE_URL/api/security/analytics?timeRange=24h")
    if echo "$response" | jq -e '.totalEvents >= 0' > /dev/null 2>&1; then
        print_pass "24-hour analytics retrieved successfully"
    else
        print_fail "Failed to retrieve 24-hour analytics"
    fi
}

# Test 5: Event Retrieval
test_event_retrieval() {
    print_header "Individual Event Retrieval"
    
    print_test "Get Specific Event by ID"
    # Get first event ID from list
    event_id=$(curl -s "$API_BASE_URL/api/security/events?limit=1" | jq -r '.events[0].eventId')
    
    if [ "$event_id" != "null" ] && [ -n "$event_id" ]; then
        response=$(curl -s "$API_BASE_URL/api/security/events/$event_id")
        if echo "$response" | jq -e '.eventId' > /dev/null 2>&1; then
            print_pass "Successfully retrieved event: $event_id"
        else
            print_fail "Failed to retrieve specific event"
        fi
    else
        print_fail "No events available for retrieval test"
    fi
}

# Test 6: Performance Metrics
test_performance() {
    print_header "Performance Testing"
    
    print_test "API Response Time - Health Check"
    start_time=$(date +%s%N)
    curl -s "$API_BASE_URL/api/security/health" > /dev/null
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$response_time" -lt 1000 ]; then
        print_pass "Health check response time: ${response_time}ms (< 1000ms target)"
    else
        print_fail "Health check too slow: ${response_time}ms (> 1000ms)"
    fi
    
    print_test "API Response Time - Event Query"
    start_time=$(date +%s%N)
    curl -s "$API_BASE_URL/api/security/events?limit=10" > /dev/null
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$response_time" -lt 2000 ]; then
        print_pass "Event query response time: ${response_time}ms (< 2000ms target)"
    else
        print_fail "Event query too slow: ${response_time}ms (> 2000ms)"
    fi
    
    print_test "API Response Time - Analytics"
    start_time=$(date +%s%N)
    curl -s "$API_BASE_URL/api/security/analytics?timeRange=24h" > /dev/null
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$response_time" -lt 3000 ]; then
        print_pass "Analytics response time: ${response_time}ms (< 3000ms target)"
    else
        print_fail "Analytics too slow: ${response_time}ms (> 3000ms)"
    fi
}

# Test 7: Data Validation
test_data_validation() {
    print_header "Data Validation"
    
    print_test "Invalid Event - Missing Required Fields"
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/api/security/events" \
        -H "Content-Type: application/json" \
        -d '{"invalid": "data"}')
    
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "400" ]; then
        print_pass "Correctly rejected invalid event (400)"
    else
        print_fail "Invalid event not rejected properly (got $http_code, expected 400)"
    fi
    
    print_test "Valid Event Structure"
    response=$(curl -s "$API_BASE_URL/api/security/events?limit=1")
    if echo "$response" | jq -e '.events[0] | has("ciId") and has("eventType") and has("severity")' > /dev/null 2>&1; then
        print_pass "Event structure is valid"
    else
        print_fail "Event structure validation failed"
    fi
}

# Test 8: Pagination
test_pagination() {
    print_header "Pagination Testing"
    
    print_test "Pagination - Page 1"
    response=$(curl -s "$API_BASE_URL/api/security/events?limit=2&offset=0")
    page1_count=$(echo "$response" | jq -r '.events | length')
    if [ "$page1_count" -le 2 ]; then
        print_pass "Page 1 returned $page1_count events (limit 2)"
    else
        print_fail "Pagination limit not working"
    fi
    
    print_test "Pagination - Page 2"
    response=$(curl -s "$API_BASE_URL/api/security/events?limit=2&offset=2")
    if echo "$response" | jq -e '.events' > /dev/null 2>&1; then
        print_pass "Page 2 accessible"
    else
        print_fail "Page 2 pagination failed"
    fi
}

# Main execution
main() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║      Citadel Data Leakage Control - Test Suite v1.0.0        ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    print_info "API Base URL: $API_BASE_URL"
    print_info "Frontend URL: $FRONTEND_URL"
    print_info "Test CI ID: $TEST_CI_ID"
    print_info "Test Event Prefix: $TEST_EVENT_PREFIX"
    echo ""
    
    # Check dependencies
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl is required but not installed${NC}"
        exit 1
    fi
    
    # Run all tests
    test_service_health
    test_event_creation
    test_event_querying
    test_analytics
    test_event_retrieval
    test_performance
    test_data_validation
    test_pagination
    
    # Summary
    print_header "Test Summary"
    echo -e "${BLUE}Total Tests: $TESTS_RUN${NC}"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                  🎉 ALL TESTS PASSED! 🎉                      ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
        exit 0
    else
        echo -e "\n${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                  ⚠️  SOME TESTS FAILED  ⚠️                     ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
        exit 1
    fi
}

# Run main function
main "$@"
