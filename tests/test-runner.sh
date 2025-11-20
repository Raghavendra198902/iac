#!/bin/bash

# Automated Test Runner with Monitoring and Reporting
# Continuously runs E2E tests and monitors system health

set -e

# Configuration
TEST_SCRIPT="/home/rrd/Documents/Iac/tests/e2e-test.sh"
TEST_INTERVAL=300  # Run tests every 5 minutes
LOG_DIR="/home/rrd/Documents/Iac/test-logs"
REPORT_FILE="$LOG_DIR/test-report-$(date +%Y%m%d).json"
MAX_FAILURES=3  # Alert after 3 consecutive failures

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_RUNS=0
SUCCESSFUL_RUNS=0
FAILED_RUNS=0
CONSECUTIVE_FAILURES=0

# Create log directory
mkdir -p "$LOG_DIR"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

# Initialize report file
init_report() {
    cat > "$REPORT_FILE" <<EOF
{
  "testRunDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "runs": []
}
EOF
}

# Add test run to report
add_to_report() {
    local status=$1
    local duration=$2
    local passed=$3
    local failed=$4
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Create temp file with new run
    local temp_report=$(mktemp)
    
    jq --arg ts "$timestamp" \
       --arg st "$status" \
       --argjson dur "$duration" \
       --argjson pass "$passed" \
       --argjson fail "$failed" \
       '.runs += [{
          timestamp: $ts,
          status: $st,
          duration: $dur,
          passed: $pass,
          failed: $fail
       }]' "$REPORT_FILE" > "$temp_report"
    
    mv "$temp_report" "$REPORT_FILE"
}

# Send alert notification
send_alert() {
    local message=$1
    local severity=$2
    
    log_warning "ALERT: $message"
    
    # Log to file
    echo "[$(date)] ALERT [$severity]: $message" >> "$LOG_DIR/alerts.log"
    
    # Could integrate with:
    # - Slack webhook
    # - Email notification
    # - PagerDuty
    # - Custom webhook
    
    # Example webhook call (commented out):
    # curl -X POST "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" \
    #   -H "Content-Type: application/json" \
    #   -d "{\"text\":\"🚨 $message\"}"
}

# Run tests and capture results
run_tests() {
    local start_time=$(date +%s)
    local log_file="$LOG_DIR/test-run-$(date +%Y%m%d-%H%M%S).log"
    
    log "Running E2E test suite..."
    
    # Run tests and capture output
    if bash "$TEST_SCRIPT" > "$log_file" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        # Parse results from log
        local passed=$(grep -c "\\[PASS\\]" "$log_file" || echo "0")
        local failed=$(grep -c "\\[FAIL\\]" "$log_file" || echo "0")
        
        ((TOTAL_RUNS++))
        ((SUCCESSFUL_RUNS++))
        CONSECUTIVE_FAILURES=0
        
        log_success "Tests passed ($passed passed, $failed failed) in ${duration}s"
        add_to_report "success" "$duration" "$passed" "$failed"
        
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        # Parse results from log
        local passed=$(grep -c "\\[PASS\\]" "$log_file" || echo "0")
        local failed=$(grep -c "\\[FAIL\\]" "$log_file" || echo "0")
        
        ((TOTAL_RUNS++))
        ((FAILED_RUNS++))
        ((CONSECUTIVE_FAILURES++))
        
        log_error "Tests failed ($passed passed, $failed failed) in ${duration}s"
        add_to_report "failed" "$duration" "$passed" "$failed"
        
        # Alert on consecutive failures
        if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ]; then
            send_alert "E2E tests have failed $CONSECUTIVE_FAILURES times consecutively" "critical"
        fi
        
        return 1
    fi
}

# Monitor system health
check_health() {
    log "Checking system health..."
    
    local health_response=$(curl -s http://localhost:3000/health)
    local status=$(echo "$health_response" | jq -r '.status')
    
    if [ "$status" = "healthy" ]; then
        log_success "System health: $status"
    elif [ "$status" = "degraded" ]; then
        log_warning "System health: $status"
        send_alert "System health is degraded" "warning"
    else
        log_error "System health: $status"
        send_alert "System health is unhealthy" "critical"
    fi
    
    # Check individual services
    local db_status=$(echo "$health_response" | jq -r '.services.database.status')
    local ws_status=$(echo "$health_response" | jq -r '.services.websocket.status')
    
    if [ "$db_status" != "connected" ]; then
        log_error "Database: $db_status"
        send_alert "Database connection issue: $db_status" "critical"
    fi
    
    if [ "$ws_status" != "active" ]; then
        log_warning "WebSocket: $ws_status"
        send_alert "WebSocket server issue: $ws_status" "warning"
    fi
}

# Display statistics
show_stats() {
    local success_rate=0
    if [ $TOTAL_RUNS -gt 0 ]; then
        success_rate=$((SUCCESSFUL_RUNS * 100 / TOTAL_RUNS))
    fi
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                    TEST RUNNER STATISTICS                          ║"
    echo "╠═══════════════════════════════════════════════════════════════════╣"
    printf "║  Total Runs:           %-43s ║\n" "$TOTAL_RUNS"
    printf "║  Successful:           ${GREEN}%-43s${NC} ║\n" "$SUCCESSFUL_RUNS"
    printf "║  Failed:               ${RED}%-43s${NC} ║\n" "$FAILED_RUNS"
    printf "║  Success Rate:         %-43s ║\n" "${success_rate}%"
    printf "║  Consecutive Failures: %-43s ║\n" "$CONSECUTIVE_FAILURES"
    printf "║  Report File:          %-43s ║\n" "$(basename $REPORT_FILE)"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
}

# Cleanup old logs (keep last 7 days)
cleanup_logs() {
    find "$LOG_DIR" -name "test-run-*.log" -mtime +7 -delete 2>/dev/null || true
    find "$LOG_DIR" -name "test-report-*.json" -mtime +7 -delete 2>/dev/null || true
}

# Signal handler for graceful shutdown
cleanup() {
    echo ""
    log "Shutting down test runner..."
    show_stats
    log "Final report saved to: $REPORT_FILE"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main loop
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║         🤖 AUTOMATED TEST RUNNER & MONITORING SYSTEM               ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    log "Starting automated test runner..."
    log "Test interval: ${TEST_INTERVAL}s"
    log "Log directory: $LOG_DIR"
    log "Press Ctrl+C to stop"
    echo ""
    
    init_report
    
    while true; do
        # Run health check
        check_health
        
        # Run E2E tests
        run_tests
        
        # Show current statistics
        show_stats
        
        # Cleanup old logs
        cleanup_logs
        
        # Wait for next run
        log "Next test run in ${TEST_INTERVAL} seconds..."
        sleep "$TEST_INTERVAL"
    done
}

# Check if running in watch mode or single run
if [ "${1:-}" = "--once" ]; then
    log "Running single test..."
    init_report
    check_health
    run_tests
    show_stats
else
    main
fi
