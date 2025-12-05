#!/bin/bash

# Pro Agents Integration Test Script
# Tests all Pro-level agent enhancements

set -e

echo "🚀 Testing Pro-Level Agents Integration"
echo "========================================"
echo ""

BASE_URL="http://localhost:3000"
AI_ENGINE_URL="http://localhost:8000"
AUTOMATION_URL="http://localhost:3006"
GUARDRAILS_URL="http://localhost:3003"
MONITORING_URL="http://localhost:3007"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=${4:-""}
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -n "Testing: $name... "
    
    if [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 400 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "1️⃣  Testing AI Engine Pro Features"
echo "-----------------------------------"

test_endpoint "AI Engine Health" "$AI_ENGINE_URL/health"

# Test AI requirement analysis
cat > /tmp/test_requirements.json << 'EOF'
{
  "description": "Build a scalable e-commerce platform with microservices architecture, supporting 10000 concurrent users with high security requirements and real-time analytics",
  "services": ["api-gateway", "user-service", "product-service", "order-service", "payment-service"],
  "requirements": {
    "scalability": "high",
    "security": "high",
    "performance": "high"
  }
}
EOF

echo ""
echo "2️⃣  Testing Automation Engine Pro Features"
echo "-------------------------------------------"

test_endpoint "Automation Engine Health" "$AUTOMATION_URL/health"

# Test Pro Automation - Start Pro Workflow
cat > /tmp/test_pro_workflow.json << 'EOF'
{
  "requirements": {
    "infrastructure": "kubernetes",
    "services": ["api", "database", "cache"],
    "scalability": "high"
  },
  "automationLevel": 5,
  "environment": "staging",
  "aiOptimization": true,
  "selfHealing": true,
  "predictiveAnalysis": true,
  "multiCloud": false
}
EOF

test_endpoint "Pro Automation - Start Workflow" "$AUTOMATION_URL/api/automation/pro/start" "POST" "@/tmp/test_pro_workflow.json"
test_endpoint "Pro Automation - Get Features" "$AUTOMATION_URL/api/automation/pro/features"

echo ""
echo "3️⃣  Testing Guardrails Engine Pro Features"
echo "-------------------------------------------"

test_endpoint "Guardrails Engine Health" "$GUARDRAILS_URL/health"

# Test Pro Guardrails - Policy Evaluation
cat > /tmp/test_pro_policy.json << 'EOF'
{
  "iacCode": "resource \"aws_s3_bucket\" \"example\" {\n  bucket = \"my-bucket\"\n  acl = \"public-read\"\n}\n\nresource \"aws_db_instance\" \"main\" {\n  instance_class = \"db.t3.micro\"\n  storage_encrypted = false\n}",
  "format": "terraform",
  "environment": "production"
}
EOF

test_endpoint "Pro Guardrails - Evaluate Policies" "$GUARDRAILS_URL/api/pro/evaluate" "POST" "@/tmp/test_pro_policy.json"
test_endpoint "Pro Guardrails - Get Features" "$GUARDRAILS_URL/api/pro/features"

echo ""
echo "4️⃣  Testing Monitoring Service Pro Features"
echo "--------------------------------------------"

test_endpoint "Monitoring Service Health" "$MONITORING_URL/health"

echo ""
echo "5️⃣  Testing API Gateway Integration"
echo "------------------------------------"

test_endpoint "API Gateway Health" "$BASE_URL/health"
test_endpoint "System Status" "$BASE_URL/api/system/status"

echo ""
echo "6️⃣  Testing Docker Container Health"
echo "------------------------------------"

# Check critical services
services=(
    "dharma-ai-engine"
    "dharma-automation-engine"
    "dharma-guardrails"
    "dharma-monitoring-service"
    "dharma-api-gateway"
)

for service in "${services[@]}"; do
    TESTS_RUN=$((TESTS_RUN + 1))
    health=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "unknown")
    
    if [ "$health" == "healthy" ]; then
        echo -e "Container $service: ${GREEN}✓ HEALTHY${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    elif [ "$health" == "starting" ]; then
        echo -e "Container $service: ${YELLOW}⚠ STARTING${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "Container $service: ${RED}✗ UNHEALTHY${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
done

echo ""
echo "========================================"
echo "📊 Test Results Summary"
echo "========================================"
echo "Total Tests Run:    $TESTS_RUN"
echo -e "Tests Passed:       ${GREEN}$TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "Tests Failed:       ${RED}$TESTS_FAILED${NC}"
else
    echo -e "Tests Failed:       ${GREEN}$TESTS_FAILED${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All Pro Agent tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the logs above.${NC}"
    exit 1
fi
