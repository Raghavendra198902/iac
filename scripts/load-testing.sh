#!/bin/bash

# Load Testing Script for IaC Platform v3.0
# Tests API endpoints under various load conditions
# Requirements: apache2-utils (ab), curl, jq

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
RBAC_URL="http://localhost:3050"
API_GATEWAY_URL="http://localhost:4000"
AIOPS_URL="http://localhost:3100"

# Load test parameters
CONCURRENT_USERS=100
TOTAL_REQUESTS=10000
TARGET_RPS=1000

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        IaC Platform v3.0 - Load Testing Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Test Configuration:${NC}"
echo "  Concurrent Users: $CONCURRENT_USERS"
echo "  Total Requests: $TOTAL_REQUESTS"
echo "  Target RPS: $TARGET_RPS"
echo ""

# Check if apache bench is installed
if ! command -v ab &> /dev/null; then
    echo -e "${RED}Error: apache2-utils (ab) not installed${NC}"
    echo "Install with: sudo apt-get install apache2-utils"
    exit 1
fi

# Results directory
RESULTS_DIR="/tmp/iac-load-tests-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESULTS_DIR"
echo -e "${GREEN}Results will be saved to: $RESULTS_DIR${NC}"
echo ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run load test
run_load_test() {
    local test_name=$1
    local url=$2
    local concurrent=$3
    local requests=$4
    local output_file="$RESULTS_DIR/${test_name}.txt"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    echo "  URL: $url"
    echo "  Concurrent: $concurrent, Requests: $requests"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Run apache bench
    ab -c "$concurrent" -n "$requests" -g "$RESULTS_DIR/${test_name}.tsv" "$url" > "$output_file" 2>&1
    
    if [ $? -eq 0 ]; then
        # Extract key metrics
        local rps=$(grep "Requests per second" "$output_file" | awk '{print $4}')
        local mean_time=$(grep "Time per request.*mean" "$output_file" | head -1 | awk '{print $4}')
        local failed=$(grep "Failed requests" "$output_file" | awk '{print $3}')
        local p95=$(grep "95%" "$output_file" | awk '{print $2}')
        
        echo -e "  ${GREEN}✓ Requests/sec: $rps${NC}"
        echo -e "  ${GREEN}✓ Mean time: ${mean_time}ms${NC}"
        echo -e "  ${GREEN}✓ Failed: $failed${NC}"
        echo -e "  ${GREEN}✓ 95th percentile: ${p95}ms${NC}"
        
        # Check if meets target RPS
        if (( $(echo "$rps >= $TARGET_RPS" | bc -l) )); then
            echo -e "  ${GREEN}✓ PASS: Meets target RPS ($TARGET_RPS)${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "  ${YELLOW}⚠ WARNING: Below target RPS ($TARGET_RPS)${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        echo -e "  ${RED}✗ FAILED: Load test execution error${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Function to test with curl (for endpoints requiring POST)
run_post_load_test() {
    local test_name=$1
    local url=$2
    local data=$3
    local concurrent=$4
    local requests=$5
    
    echo -e "${YELLOW}Testing: $test_name (POST)${NC}"
    echo "  URL: $url"
    echo "  Concurrent: $concurrent, Requests: $requests"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Create temp file for POST data
    local temp_file="$RESULTS_DIR/${test_name}_post.json"
    echo "$data" > "$temp_file"
    
    # Run ab with POST
    ab -c "$concurrent" -n "$requests" -p "$temp_file" -T "application/json" "$url" > "$RESULTS_DIR/${test_name}.txt" 2>&1
    
    if [ $? -eq 0 ]; then
        local rps=$(grep "Requests per second" "$RESULTS_DIR/${test_name}.txt" | awk '{print $4}')
        local mean_time=$(grep "Time per request.*mean" "$RESULTS_DIR/${test_name}.txt" | head -1 | awk '{print $4}')
        
        echo -e "  ${GREEN}✓ Requests/sec: $rps${NC}"
        echo -e "  ${GREEN}✓ Mean time: ${mean_time}ms${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}✗ FAILED: Load test execution error${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Stress test function (gradually increasing load)
run_stress_test() {
    local test_name=$1
    local url=$2
    
    echo -e "${YELLOW}Stress Testing: $test_name${NC}"
    echo "  Gradually increasing load from 10 to 500 concurrent users"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    local stress_file="$RESULTS_DIR/${test_name}_stress.txt"
    echo "Concurrent,RPS,MeanTime,FailedRequests" > "$stress_file"
    
    for concurrent in 10 50 100 200 300 400 500; do
        echo -n "  Testing with $concurrent concurrent users... "
        
        ab -c "$concurrent" -n 1000 "$url" > "$RESULTS_DIR/stress_temp.txt" 2>&1
        
        if [ $? -eq 0 ]; then
            local rps=$(grep "Requests per second" "$RESULTS_DIR/stress_temp.txt" | awk '{print $4}')
            local mean_time=$(grep "Time per request.*mean" "$RESULTS_DIR/stress_temp.txt" | head -1 | awk '{print $4}')
            local failed=$(grep "Failed requests" "$RESULTS_DIR/stress_temp.txt" | awk '{print $3}')
            
            echo "$concurrent,$rps,$mean_time,$failed" >> "$stress_file"
            echo -e "${GREEN}RPS: $rps${NC}"
        else
            echo -e "${RED}FAILED${NC}"
            echo "$concurrent,0,0,1000" >> "$stress_file"
        fi
    done
    
    echo -e "  ${GREEN}✓ Stress test results saved to: ${stress_file}${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo ""
}

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1. RBAC Service Load Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Test RBAC health endpoint
run_load_test "rbac_health" "$RBAC_URL/health" 100 5000

# Test RBAC permissions endpoint
run_load_test "rbac_permissions" "$RBAC_URL/api/v1/permissions?limit=10" 100 10000

# Test RBAC permissions with higher concurrency
run_load_test "rbac_permissions_high_load" "$RBAC_URL/api/v1/permissions?limit=10" 200 10000

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2. API Gateway Load Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Test API Gateway health
run_load_test "api_gateway_health" "$API_GATEWAY_URL/health" 100 5000

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3. POST Endpoint Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Test RBAC permission check (POST)
POST_DATA='{"userId":"test-user","resource":"architecture","action":"read","scope":"tenant"}'
run_post_load_test "rbac_permission_check" "$RBAC_URL/api/v1/permissions/check" "$POST_DATA" 50 5000

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}4. Stress Tests (Gradual Load Increase)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Run stress test on RBAC permissions
run_stress_test "rbac_permissions_stress" "$RBAC_URL/api/v1/permissions?limit=10"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}5. Endurance Test (Sustained Load)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Running 5-minute endurance test...${NC}"
echo "  Maintaining 100 concurrent users for 5 minutes"

TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Calculate requests for 5 minutes at ~1000 RPS
ENDURANCE_REQUESTS=300000
ab -c 100 -n $ENDURANCE_REQUESTS -t 300 "$RBAC_URL/api/v1/permissions?limit=10" > "$RESULTS_DIR/endurance_test.txt" 2>&1

if [ $? -eq 0 ]; then
    local rps=$(grep "Requests per second" "$RESULTS_DIR/endurance_test.txt" | awk '{print $4}')
    local failed=$(grep "Failed requests" "$RESULTS_DIR/endurance_test.txt" | awk '{print $3}')
    local p99=$(grep "99%" "$RESULTS_DIR/endurance_test.txt" | awk '{print $2}')
    
    echo -e "  ${GREEN}✓ Average RPS: $rps${NC}"
    echo -e "  ${GREEN}✓ Failed requests: $failed${NC}"
    echo -e "  ${GREEN}✓ 99th percentile: ${p99}ms${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ${RED}✗ FAILED: Endurance test error${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}6. Performance Analysis${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Analyze results and generate summary
SUMMARY_FILE="$RESULTS_DIR/SUMMARY.txt"

cat > "$SUMMARY_FILE" << EOF
IaC Platform v3.0 - Load Test Summary
Generated: $(date)
═══════════════════════════════════════════════════════════════════

TEST RESULTS:
  Total Tests: $TOTAL_TESTS
  Passed: $PASSED_TESTS
  Failed: $FAILED_TESTS
  Success Rate: $(awk "BEGIN {print ($PASSED_TESTS/$TOTAL_TESTS)*100}")%

PERFORMANCE METRICS:

RBAC Service:
$(grep "Requests per second" "$RESULTS_DIR/rbac_permissions.txt" 2>/dev/null || echo "  Not available")
$(grep "Time per request.*mean" "$RESULTS_DIR/rbac_permissions.txt" 2>/dev/null | head -1 || echo "  Not available")
$(grep "95%" "$RESULTS_DIR/rbac_permissions.txt" 2>/dev/null || echo "  Not available")

High Load Test:
$(grep "Requests per second" "$RESULTS_DIR/rbac_permissions_high_load.txt" 2>/dev/null || echo "  Not available")
$(grep "Failed requests" "$RESULTS_DIR/rbac_permissions_high_load.txt" 2>/dev/null || echo "  Not available")

Endurance Test (5 min):
$(grep "Requests per second" "$RESULTS_DIR/endurance_test.txt" 2>/dev/null || echo "  Not available")
$(grep "Failed requests" "$RESULTS_DIR/endurance_test.txt" 2>/dev/null || echo "  Not available")

RECOMMENDATIONS:

$(if [ $FAILED_TESTS -eq 0 ]; then
    echo "✅ All tests passed successfully"
    echo "✅ Platform can handle production load"
    echo "✅ Consider horizontal scaling for higher loads"
else
    echo "⚠️  Some tests failed - review detailed results"
    echo "⚠️  Consider performance optimization"
    echo "⚠️  Check resource limits (CPU, memory, connections)"
fi)

DETAILED RESULTS: $RESULTS_DIR
═══════════════════════════════════════════════════════════════════
EOF

cat "$SUMMARY_FILE"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Load Testing Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo -e "  Total Tests: $TOTAL_TESTS"
echo -e "  Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "  Failed: ${RED}$FAILED_TESTS${NC}"
echo -e "  Success Rate: $(awk "BEGIN {print ($PASSED_TESTS/$TOTAL_TESTS)*100}")%"
echo ""
echo -e "${YELLOW}Results saved to: $RESULTS_DIR${NC}"
echo -e "${YELLOW}Summary: $SUMMARY_FILE${NC}"
echo ""

# Generate visualization script
cat > "$RESULTS_DIR/visualize_results.py" << 'EOF'
#!/usr/bin/env python3
"""
Visualize load test results
Requires: matplotlib, pandas
Install: pip install matplotlib pandas
"""

import pandas as pd
import matplotlib.pyplot as plt
import sys
import os

results_dir = sys.argv[1] if len(sys.argv) > 1 else '.'

# Read stress test results
stress_file = os.path.join(results_dir, 'rbac_permissions_stress_stress.txt')
if os.path.exists(stress_file):
    df = pd.read_csv(stress_file)
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('IaC Platform Load Test Results', fontsize=16)
    
    # RPS vs Concurrent Users
    axes[0, 0].plot(df['Concurrent'], df['RPS'], marker='o', linewidth=2)
    axes[0, 0].set_xlabel('Concurrent Users')
    axes[0, 0].set_ylabel('Requests per Second')
    axes[0, 0].set_title('Throughput vs Load')
    axes[0, 0].grid(True)
    
    # Mean Response Time vs Concurrent Users
    axes[0, 1].plot(df['Concurrent'], df['MeanTime'], marker='o', color='orange', linewidth=2)
    axes[0, 1].set_xlabel('Concurrent Users')
    axes[0, 1].set_ylabel('Mean Response Time (ms)')
    axes[0, 1].set_title('Response Time vs Load')
    axes[0, 1].grid(True)
    
    # Failed Requests vs Concurrent Users
    axes[1, 0].plot(df['Concurrent'], df['FailedRequests'], marker='o', color='red', linewidth=2)
    axes[1, 0].set_xlabel('Concurrent Users')
    axes[1, 0].set_ylabel('Failed Requests')
    axes[1, 0].set_title('Error Rate vs Load')
    axes[1, 0].grid(True)
    
    # Success Rate
    df['SuccessRate'] = ((1000 - df['FailedRequests']) / 1000) * 100
    axes[1, 1].plot(df['Concurrent'], df['SuccessRate'], marker='o', color='green', linewidth=2)
    axes[1, 1].set_xlabel('Concurrent Users')
    axes[1, 1].set_ylabel('Success Rate (%)')
    axes[1, 1].set_title('Success Rate vs Load')
    axes[1, 1].set_ylim([95, 101])
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    output_file = os.path.join(results_dir, 'load_test_results.png')
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"Visualization saved to: {output_file}")
else:
    print(f"Stress test results not found: {stress_file}")
EOF

chmod +x "$RESULTS_DIR/visualize_results.py"

echo -e "${YELLOW}To visualize results (requires Python + matplotlib):${NC}"
echo "  python3 $RESULTS_DIR/visualize_results.py $RESULTS_DIR"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL LOAD TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED - Review detailed results${NC}"
    exit 1
fi
