#!/bin/bash

# Zero Trust Security - Comprehensive Testing Script
# IAC Dharma v3.0

echo "=========================================="
echo "Zero Trust Security - Testing Suite"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8500"
GATEWAY_URL="http://localhost:4000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0

# Test function
run_test() {
    local test_name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${YELLOW}Test $TESTS_RUN: $test_name${NC}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$url" -H "Content-Type: application/json" -d "$data")
    else
        response=$(curl -s "$url")
    fi
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$response" | jq .
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "$response"
    fi
    echo ""
}

# Test 1: Health Check
run_test "Health Check" "$BASE_URL/health"

# Test 2: Root Endpoint
run_test "Root Endpoint" "$BASE_URL/"

# Test 3: List Policies
run_test "List Zero Trust Policies" "$BASE_URL/api/v3/zero-trust/policies"

# Test 4: Verify Access - Production Database (Should Allow for Admin)
echo -e "${YELLOW}Test $TESTS_RUN: Access Verification - Production Database${NC}"
TESTS_RUN=$((TESTS_RUN + 1))
access_request='{
  "user_id": "admin_user_001",
  "resource": "database/production/customer_db",
  "action": "read",
  "source_ip": "10.0.1.50",
  "device_id": "device_12345",
  "device_posture": {
    "device_id": "device_12345",
    "os": "Ubuntu",
    "os_version": "22.04",
    "security_patch_level": "latest",
    "encrypted": true,
    "firewall_enabled": true,
    "antivirus_enabled": true,
    "compliance_score": 95
  },
  "context": {
    "location": "office",
    "time": "business_hours"
  }
}'
response=$(curl -s -X POST "$BASE_URL/api/v3/zero-trust/verify" \
    -H "Content-Type: application/json" \
    -d "$access_request")
echo "$response" | jq .
decision=$(echo "$response" | jq -r '.decision')
if [ "$decision" = "allow" ]; then
    echo -e "${GREEN}✓ PASSED - Access allowed for high-trust admin${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED - Expected 'allow', got '$decision'${NC}"
fi
echo ""

# Test 5: Verify Access - Production Database (Low compliance - Should Deny)
echo -e "${YELLOW}Test $TESTS_RUN: Access Verification - Low Compliance Device${NC}"
TESTS_RUN=$((TESTS_RUN + 1))
low_compliance_request='{
  "user_id": "admin_user_001",
  "resource": "database/production/customer_db",
  "action": "read",
  "source_ip": "203.0.113.10",
  "device_id": "device_99999",
  "device_posture": {
    "device_id": "device_99999",
    "os": "Windows",
    "os_version": "10",
    "security_patch_level": "outdated",
    "encrypted": false,
    "firewall_enabled": false,
    "antivirus_enabled": false,
    "compliance_score": 30
  },
  "context": {
    "location": "unknown"
  }
}'
response=$(curl -s -X POST "$BASE_URL/api/v3/zero-trust/verify" \
    -H "Content-Type: application/json" \
    -d "$low_compliance_request")
echo "$response" | jq .
decision=$(echo "$response" | jq -r '.decision')
if [ "$decision" = "deny" ]; then
    echo -e "${GREEN}✓ PASSED - Access denied for low-compliance device${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED - Expected 'deny', got '$decision'${NC}"
fi
echo ""

# Test 6: Authenticate User
echo -e "${YELLOW}Test $TESTS_RUN: User Authentication${NC}"
TESTS_RUN=$((TESTS_RUN + 1))
response=$(curl -s -X POST "$BASE_URL/api/v3/zero-trust/authenticate?username=test_user&password=test123&device_id=device_12345&mfa_code=123456")
echo "$response" | jq .
token=$(echo "$response" | jq -r '.access_token')
if [ "$token" != "null" ] && [ -n "$token" ]; then
    echo -e "${GREEN}✓ PASSED - Authentication successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED - Authentication failed${NC}"
fi
echo ""

# Test 7: Create New Policy
echo -e "${YELLOW}Test $TESTS_RUN: Create Zero Trust Policy${NC}"
TESTS_RUN=$((TESTS_RUN + 1))
new_policy='{
  "rule_id": "pol_test_001",
  "name": "Test API Access Policy",
  "resource_pattern": "api/test/*",
  "required_roles": ["tester", "developer"],
  "required_trust_level": "medium",
  "conditions": {
    "mfa_required": false,
    "device_compliance_min": 60
  },
  "action": "allow"
}'
response=$(curl -s -X POST "$BASE_URL/api/v3/zero-trust/policies" \
    -H "Content-Type: application/json" \
    -d "$new_policy")
echo "$response" | jq .
status=$(echo "$response" | jq -r '.status')
if [ "$status" = "created" ]; then
    echo -e "${GREEN}✓ PASSED - Policy created${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED - Policy creation failed${NC}"
fi
echo ""

# Test 8: Get Trust Score
run_test "Get Trust Score for User" "$BASE_URL/api/v3/zero-trust/trust-score/admin_user_001"

# Test 9: Get Active Sessions
run_test "Get Active Sessions" "$BASE_URL/api/v3/zero-trust/sessions/active"

# Test 10: Get Audit Log
run_test "Get Audit Log" "$BASE_URL/api/v3/zero-trust/audit?limit=5"

echo "=========================================="
echo "Gateway Integration Tests"
echo "=========================================="
echo ""

# Test 11: Verify Access via Gateway
echo -e "${YELLOW}Test $TESTS_RUN: Gateway - Verify Access${NC}"
TESTS_RUN=$((TESTS_RUN + 1))
response=$(curl -s -X POST "$GATEWAY_URL/api/zero-trust/verify" \
    -H "Content-Type: application/json" \
    -d "$access_request")
echo "$response" | jq .
if echo "$response" | jq -e '.decision' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED - Gateway proxy working${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED - Gateway proxy not working${NC}"
fi
echo ""

# Test 12: List Policies via Gateway
run_test "Gateway - List Policies" "$GATEWAY_URL/api/zero-trust/policies"

# Test 13: Get Audit Log via Gateway
run_test "Gateway - Get Audit Log" "$GATEWAY_URL/api/zero-trust/audit?limit=3"

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests Run: ${TESTS_RUN}"
echo -e "${GREEN}Tests Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Tests Failed: $((TESTS_RUN - TESTS_PASSED))${NC}"
echo ""

if [ $TESTS_PASSED -eq $TESTS_RUN ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed${NC}"
    exit 1
fi
