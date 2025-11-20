#!/bin/bash

# Load Testing Script for IAC DHARMA
# Simulates multiple agents sending events concurrently

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${API_URL:-http://localhost:3000}"
NUM_AGENTS="${NUM_AGENTS:-10}"
EVENTS_PER_AGENT="${EVENTS_PER_AGENT:-10}"
CONCURRENT="${CONCURRENT:-5}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       🚀 IAC DHARMA - LOAD TEST SUITE 🚀                 ║"
echo "╔══════════════════════════════════════════════════════════╗"
echo ""
echo "Configuration:"
echo "  • API URL: $API_URL"
echo "  • Number of Agents: $NUM_AGENTS"
echo "  • Events per Agent: $EVENTS_PER_AGENT"
echo "  • Concurrent Requests: $CONCURRENT"
echo "  • Total Events: $((NUM_AGENTS * EVENTS_PER_AGENT))"
echo ""

# Create temp directory for results
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Counters
TOTAL_SENT=0
TOTAL_SUCCESS=0
TOTAL_FAILED=0

# Function to send events from a single agent
send_agent_events() {
    local agent_id=$1
    local agent_name="load-test-agent-${agent_id}"
    local results_file="${TEMP_DIR}/agent-${agent_id}.json"
    
    local success_count=0
    local failed_count=0
    local total_time=0
    
    for i in $(seq 1 $EVENTS_PER_AGENT); do
        local start_time=$(date +%s%N)
        local timestamp=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
        
        local response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/enforcement/events" \
            -H "Content-Type: application/json" \
            -H "X-Agent-Name: ${agent_name}" \
            -d "{
                \"events\": [{
                    \"timestamp\": \"${timestamp}\",
                    \"type\": \"policy_triggered\",
                    \"policyId\": \"load-test-policy-${i}\",
                    \"policyName\": \"Load Test Policy ${i}\",
                    \"severity\": \"medium\",
                    \"event\": {
                        \"type\": \"load_test\",
                        \"description\": \"Load test event from agent ${agent_id}\"
                    },
                    \"results\": [{
                        \"actionType\": \"alert\",
                        \"success\": true
                    }],
                    \"metadata\": {
                        \"loadTest\": true,
                        \"agentId\": ${agent_id},
                        \"eventNumber\": ${i}
                    }
                }]
            }" 2>/dev/null)
        
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))
        total_time=$((total_time + response_time))
        
        local http_code=$(echo "$response" | tail -n1)
        local body=$(echo "$response" | head -n-1)
        
        if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
            ((success_count++))
        else
            ((failed_count++))
        fi
    done
    
    local avg_time=$((total_time / EVENTS_PER_AGENT))
    
    # Write results to file
    cat > "$results_file" <<EOF
{
    "agentId": ${agent_id},
    "agentName": "${agent_name}",
    "totalEvents": ${EVENTS_PER_AGENT},
    "successful": ${success_count},
    "failed": ${failed_count},
    "avgResponseTime": ${avg_time}
}
EOF
}

# Run load test
echo -e "${BLUE}Starting load test...${NC}\n"

START_TIME=$(date +%s)

# Run agents in parallel batches
for batch_start in $(seq 1 $CONCURRENT $NUM_AGENTS); do
    batch_end=$((batch_start + CONCURRENT - 1))
    if [ $batch_end -gt $NUM_AGENTS ]; then
        batch_end=$NUM_AGENTS
    fi
    
    echo -e "${YELLOW}Batch: Agents ${batch_start} to ${batch_end}${NC}"
    
    # Start agents in background
    for agent_id in $(seq $batch_start $batch_end); do
        send_agent_events $agent_id &
    done
    
    # Wait for batch to complete
    wait
done

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}Load test completed!${NC}\n"

# Aggregate results
echo "Aggregating results..."

for results_file in ${TEMP_DIR}/*.json; do
    if [ -f "$results_file" ]; then
        success=$(jq -r '.successful' "$results_file")
        failed=$(jq -r '.failed' "$results_file")
        TOTAL_SUCCESS=$((TOTAL_SUCCESS + success))
        TOTAL_FAILED=$((TOTAL_FAILED + failed))
    fi
done

TOTAL_SENT=$((TOTAL_SUCCESS + TOTAL_FAILED))

# Calculate statistics
EVENTS_PER_SECOND=$((TOTAL_SENT / TOTAL_TIME))
SUCCESS_RATE=0
if [ $TOTAL_SENT -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($TOTAL_SUCCESS / $TOTAL_SENT) * 100}")
fi

# Get average response time
AVG_RESPONSE_TIME=0
RESPONSE_TIMES=()
for results_file in ${TEMP_DIR}/*.json; do
    if [ -f "$results_file" ]; then
        rt=$(jq -r '.avgResponseTime' "$results_file")
        RESPONSE_TIMES+=($rt)
    fi
done

if [ ${#RESPONSE_TIMES[@]} -gt 0 ]; then
    SUM=0
    for rt in "${RESPONSE_TIMES[@]}"; do
        SUM=$((SUM + rt))
    done
    AVG_RESPONSE_TIME=$((SUM / ${#RESPONSE_TIMES[@]}))
fi

# Display results
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  LOAD TEST RESULTS                       ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Test Duration:        ${TOTAL_TIME}s                            ║"
echo "║  Total Events Sent:    ${TOTAL_SENT}                             ║"
echo "║  Successful:           ${TOTAL_SUCCESS}                             ║"
echo "║  Failed:               ${TOTAL_FAILED}                              ║"
echo "║  Success Rate:         ${SUCCESS_RATE}%                        ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Events per Second:    ${EVENTS_PER_SECOND}                              ║"
echo "║  Avg Response Time:    ${AVG_RESPONSE_TIME}ms                         ║"
echo "╠══════════════════════════════════════════════════════════╣"

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "║  ${GREEN}Status: ALL EVENTS PROCESSED SUCCESSFULLY ✓${NC}      ║"
else
    echo -e "║  ${YELLOW}Status: SOME EVENTS FAILED${NC}                       ║"
fi

echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Performance analysis
if [ $AVG_RESPONSE_TIME -lt 100 ]; then
    echo -e "${GREEN}✓ Excellent performance (<100ms average)${NC}"
elif [ $AVG_RESPONSE_TIME -lt 500 ]; then
    echo -e "${YELLOW}⚠ Good performance (100-500ms average)${NC}"
else
    echo -e "${RED}✗ Performance needs improvement (>500ms average)${NC}"
fi

if [ $EVENTS_PER_SECOND -ge 10 ]; then
    echo -e "${GREEN}✓ High throughput (${EVENTS_PER_SECOND} events/sec)${NC}"
else
    echo -e "${YELLOW}⚠ Moderate throughput (${EVENTS_PER_SECOND} events/sec)${NC}"
fi

echo ""

# Exit with appropriate code
if [ $TOTAL_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
