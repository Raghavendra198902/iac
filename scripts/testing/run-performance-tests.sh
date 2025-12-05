#!/bin/bash

################################################################################
# Performance Load Testing Script
# Tests IAC Dharma platform under various load conditions
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================"
echo "🚀 IAC Dharma Performance Testing"
echo "======================================"
echo ""

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
RESULTS_DIR="tests/load/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}Configuration:${NC}"
echo "  API Base URL: $API_BASE_URL"
echo "  Results Dir:  $RESULTS_DIR"
echo ""

# Check if K6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${YELLOW}K6 not found. Installing...${NC}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo gpg -k
        sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install k6
    else
        echo -e "${RED}Unsupported OS. Please install K6 manually: https://k6.io/docs/getting-started/installation${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ K6 installed${NC}"
echo ""

# Function to run test
run_test() {
    local test_name=$1
    local test_file=$2
    local output_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}.json"
    
    echo -e "${BLUE}Running: $test_name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    BASE_URL=$API_BASE_URL k6 run \
        --out json="$output_file" \
        "$test_file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Test completed: $test_name${NC}"
        echo -e "Results saved to: $output_file"
    else
        echo -e "${RED}✗ Test failed: $test_name${NC}"
    fi
    
    echo ""
}

# Check if services are running
echo -e "${BLUE}Checking service availability...${NC}"
if curl -f -s "$API_BASE_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ Services are running${NC}"
else
    echo -e "${RED}✗ Services are not available at $API_BASE_URL${NC}"
    echo "Please start the platform with: docker-compose up -d"
    exit 1
fi
echo ""

# Run baseline test
if [ -f "tests/load/baseline.js" ]; then
    run_test "baseline" "tests/load/baseline.js"
fi

# Run stress test
if [ -f "tests/load/stress.js" ]; then
    run_test "stress" "tests/load/stress.js"
fi

# Run spike test
if [ -f "tests/load/spike.js" ]; then
    run_test "spike" "tests/load/spike.js"
fi

# Run performance test
if [ -f "tests/load/performance-test.js" ]; then
    run_test "performance" "tests/load/performance-test.js"
fi

# Generate summary report
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo ""
echo "Test results saved in: $RESULTS_DIR"
echo ""
echo "To view detailed metrics:"
echo "  1. Import results into Grafana"
echo "  2. Or analyze JSON files in $RESULTS_DIR"
echo ""

# Check for performance regressions
echo -e "${BLUE}Analyzing results...${NC}"

if [ -f "$RESULTS_DIR/performance_${TIMESTAMP}.json" ]; then
    # Extract key metrics using jq if available
    if command -v jq &> /dev/null; then
        echo "Key Metrics:"
        jq -r '.metrics | to_entries[] | select(.key == "http_req_duration" or .key == "http_reqs" or .key == "http_req_failed") | "\(.key): \(.value.values)"' "$RESULTS_DIR/performance_${TIMESTAMP}.json" 2>/dev/null || echo "  (Install jq for detailed analysis)"
    fi
fi

echo ""
echo -e "${GREEN}✓ Performance testing complete!${NC}"
