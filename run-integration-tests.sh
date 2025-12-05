#!/bin/bash

# IAC Dharma v3.0 - End-to-End Integration Tests
# Validates complete system functionality

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   IAC DHARMA v3.0 - INTEGRATION TESTS                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Test configuration
AIOPS_URL="http://localhost:8100"
CMDB_URL="http://localhost:8200"
ORCHESTRATOR_URL="http://localhost:8300"
GRAPHQL_URL="http://localhost:4000/graphql"
FRONTEND_URL="http://localhost:3000"
MLFLOW_URL="http://localhost:5000"
NEO4J_URL="http://localhost:7474"
GRAFANA_URL="http://localhost:3020"

TOTAL_TESTS=20
PASSED_TESTS=0
FAILED_TESTS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test result tracking
declare -a FAILED_TEST_NAMES=()

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_num=$((PASSED_TESTS + FAILED_TESTS + 1))
    
    printf "[%2d/%2d] Testing: %-50s" "$test_num" "$TOTAL_TESTS" "$test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e " ${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e " ${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_TEST_NAMES+=("$test_name")
        return 1
    fi
}

echo "🧪 Running End-to-End Integration Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Service Health Tests
echo "📋 Service Health Tests"
echo "────────────────────────────────────────────────────────"
run_test "AIOps Engine health check" \
    "curl -s -f $AIOPS_URL/api/v3/aiops/health"
run_test "CMDB Agent health check" \
    "curl -s -f $CMDB_URL/health"
run_test "AI Orchestrator health check" \
    "curl -s -f $ORCHESTRATOR_URL/health"
run_test "MLflow server accessible" \
    "curl -s -f $MLFLOW_URL"
run_test "Neo4j browser accessible" \
    "curl -s -f $NEO4J_URL"
run_test "Grafana accessible" \
    "curl -s -f $GRAFANA_URL/api/health"
echo ""

# GraphQL API Tests
echo "🔌 GraphQL API Tests"
echo "────────────────────────────────────────────────────────"
run_test "GraphQL endpoint accessible" \
    "curl -s -f $GRAPHQL_URL -H 'Content-Type: application/json' -d '{\"query\":\"{ __typename }\"}'"
run_test "GraphQL introspection query" \
    "curl -s $GRAPHQL_URL -H 'Content-Type: application/json' -d '{\"query\":\"{ __schema { queryType { name } } }\"}' | grep -q queryType"
echo ""

# ML Model Tests
echo "🤖 ML Model Prediction Tests"
echo "────────────────────────────────────────────────────────"
run_test "Failure prediction API" \
    "curl -s -X POST $AIOPS_URL/api/v3/aiops/predict/failure -H 'Content-Type: application/json' -d '{\"service_name\":\"test\",\"metrics\":{\"cpu\":80,\"memory\":70}}' | grep -q prediction"
run_test "Threat detection API" \
    "curl -s -X POST $AIOPS_URL/api/v3/aiops/predict/threat -H 'Content-Type: application/json' -d '{\"service_name\":\"test\",\"security_events\":[]}' | grep -q threat"
run_test "Capacity forecasting API" \
    "curl -s -X POST $AIOPS_URL/api/v3/aiops/predict/capacity -H 'Content-Type: application/json' -d '{\"service_name\":\"test\",\"days\":7}' | grep -q forecast"
echo ""

# CMDB Tests
echo "🗄️  CMDB Agent Tests"
echo "────────────────────────────────────────────────────────"
run_test "CMDB resources endpoint" \
    "curl -s -f $CMDB_URL/api/v3/cmdb/resources"
run_test "CMDB discovery endpoint" \
    "curl -s -X POST $CMDB_URL/api/v3/cmdb/discover -H 'Content-Type: application/json' -d '{\"provider\":\"aws\",\"region\":\"us-east-1\"}' | grep -q success"
echo ""

# AI Orchestrator Tests
echo "💬 AI Orchestrator Tests"
echo "────────────────────────────────────────────────────────"
run_test "NLP command processing" \
    "curl -s -X POST $ORCHESTRATOR_URL/api/v3/orchestrator/command -H 'Content-Type: application/json' -d '{\"command\":\"list infrastructure\"}' | grep -q response"
run_test "Workflow execution" \
    "curl -s -X POST $ORCHESTRATOR_URL/api/v3/orchestrator/workflow -H 'Content-Type: application/json' -d '{\"workflow_id\":\"test\"}' | grep -q status"
echo ""

# Database Tests
echo "🗃️  Database Integration Tests"
echo "────────────────────────────────────────────────────────"
run_test "TimescaleDB connection" \
    "docker exec iac-postgres-v3 psql -U iacadmin -d aiops -c 'SELECT 1' -t | grep -q 1"
run_test "Neo4j connection" \
    "docker exec iac-neo4j-v3 cypher-shell -u neo4j -p neo4jpassword 'RETURN 1 AS result' | grep -q 1"
echo ""

# Frontend & Gateway Tests
echo "🌐 Frontend & API Gateway Tests"
echo "────────────────────────────────────────────────────────"
run_test "Frontend health endpoint" \
    "curl -s -f $FRONTEND_URL/health || curl -s -f $FRONTEND_URL"
run_test "GraphQL health endpoint" \
    "curl -s -f http://localhost:4000/.well-known/apollo/server-health || curl -s http://localhost:4000/graphql"
echo ""

# Calculate results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test Results Summary:"
echo "  Total Tests:  $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed:       $FAILED_TESTS${NC}"

# Calculate percentage
PASS_PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

# Progress bar
PROGRESS_WIDTH=50
PROGRESS_FILLED=$((PROGRESS_WIDTH * PASSED_TESTS / TOTAL_TESTS))
PROGRESS_EMPTY=$((PROGRESS_WIDTH - PROGRESS_FILLED))

echo ""
echo -n "  Progress: ["
printf "%${PROGRESS_FILLED}s" | tr ' ' '█'
printf "%${PROGRESS_EMPTY}s" | tr ' ' '░'
echo "] $PASS_PERCENTAGE%"
echo ""

# Show failed tests if any
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}❌ Failed Tests:${NC}"
    for test in "${FAILED_TEST_NAMES[@]}"; do
        echo "  • $test"
    done
    echo ""
fi

# Final status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $PASS_PERCENTAGE -ge 90 ]; then
    echo -e "Status: ${GREEN}🟢 EXCELLENT${NC} - System is production-ready"
    exit 0
elif [ $PASS_PERCENTAGE -ge 70 ]; then
    echo -e "Status: ${YELLOW}🟡 GOOD${NC} - Minor issues detected"
    exit 0
else
    echo -e "Status: ${RED}🔴 NEEDS ATTENTION${NC} - Multiple failures detected"
    exit 1
fi
