#!/bin/bash

# Stress Test Runner for IAC Dharma Platform
# Runs various stress test scenarios

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
TEST_DIR="/home/rrd/iac/tests/load"
RESULTS_DIR="/home/rrd/iac/tests/results/stress"

# Create results directory
mkdir -p "$RESULTS_DIR"

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

print_header() {
    echo ""
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║$(printf '%64s' | tr ' ' ' ')║${NC}"
    echo -e "${PURPLE}║$(printf '%-64s' "  $1")║${NC}"
    echo -e "${PURPLE}║$(printf '%64s' | tr ' ' ' ')║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if API is running
check_api() {
    log "Checking API availability at $API_BASE_URL..."
    
    if timeout 5 curl -sf "$API_BASE_URL/api/health" > /dev/null 2>&1; then
        log_success "API is running"
        return 0
    else
        log_error "API is not responding at $API_BASE_URL"
        log_warning "Please start the API Gateway first"
        return 1
    fi
}

# Run spike test
run_spike_test() {
    print_header "SPIKE TEST - Sudden Traffic Surge"
    
    local output_file="$RESULTS_DIR/spike-test-$(date +%Y%m%d-%H%M%S).log"
    
    log "Running spike test..."
    log "Output: $output_file"
    
    TEST_TYPE=spike \
    API_BASE_URL="$API_BASE_URL" \
    MAX_CONCURRENCY=200 \
    node "$TEST_DIR/stress-test.js" 2>&1 | tee "$output_file"
    
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        log_success "Spike test PASSED"
        return 0
    else
        log_error "Spike test FAILED"
        return 1
    fi
}

# Run soak test
run_soak_test() {
    print_header "SOAK TEST - Sustained Load"
    
    local output_file="$RESULTS_DIR/soak-test-$(date +%Y%m%d-%H%M%S).log"
    
    log "Running soak test (this will take ~5 minutes)..."
    log "Output: $output_file"
    
    TEST_TYPE=soak \
    API_BASE_URL="$API_BASE_URL" \
    DURATION=300 \
    node "$TEST_DIR/stress-test.js" 2>&1 | tee "$output_file"
    
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        log_success "Soak test PASSED"
        return 0
    else
        log_error "Soak test FAILED"
        return 1
    fi
}

# Run breakpoint test
run_breakpoint_test() {
    print_header "BREAKPOINT TEST - Finding System Limits"
    
    local output_file="$RESULTS_DIR/breakpoint-test-$(date +%Y%m%d-%H%M%S).log"
    
    log "Running breakpoint test..."
    log "Output: $output_file"
    
    TEST_TYPE=breakpoint \
    API_BASE_URL="$API_BASE_URL" \
    MAX_CONCURRENCY=500 \
    node "$TEST_DIR/stress-test.js" 2>&1 | tee "$output_file"
    
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        log_success "Breakpoint test PASSED"
        return 0
    else
        log_error "Breakpoint test FAILED"
        return 1
    fi
}

# Run recovery test
run_recovery_test() {
    print_header "RECOVERY TEST - System Resilience"
    
    local output_file="$RESULTS_DIR/recovery-test-$(date +%Y%m%d-%H%M%S).log"
    
    log "Running recovery test..."
    log "Output: $output_file"
    
    TEST_TYPE=recovery \
    API_BASE_URL="$API_BASE_URL" \
    node "$TEST_DIR/stress-test.js" 2>&1 | tee "$output_file"
    
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        log_success "Recovery test PASSED"
        return 0
    else
        log_error "Recovery test FAILED"
        return 1
    fi
}

# Run quick stress test (all scenarios with reduced duration)
run_quick_test() {
    print_header "QUICK STRESS TEST - All Scenarios"
    
    local output_file="$RESULTS_DIR/quick-test-$(date +%Y%m%d-%H%M%S).log"
    
    log "Running quick stress test..."
    
    # Spike test (quick)
    log "1/4 - Spike test..."
    TEST_TYPE=spike API_BASE_URL="$API_BASE_URL" MAX_CONCURRENCY=100 \
        node "$TEST_DIR/stress-test.js" >> "$output_file" 2>&1
    
    sleep 5
    
    # Soak test (quick - 1 minute)
    log "2/4 - Soak test..."
    TEST_TYPE=soak API_BASE_URL="$API_BASE_URL" DURATION=60 \
        node "$TEST_DIR/stress-test.js" >> "$output_file" 2>&1
    
    sleep 5
    
    # Breakpoint test (quick)
    log "3/4 - Breakpoint test..."
    TEST_TYPE=breakpoint API_BASE_URL="$API_BASE_URL" MAX_CONCURRENCY=200 \
        node "$TEST_DIR/stress-test.js" >> "$output_file" 2>&1
    
    sleep 5
    
    # Recovery test
    log "4/4 - Recovery test..."
    TEST_TYPE=recovery API_BASE_URL="$API_BASE_URL" \
        node "$TEST_DIR/stress-test.js" >> "$output_file" 2>&1
    
    log_success "Quick stress test completed"
    log "Full results: $output_file"
}

# Generate summary report
generate_summary() {
    print_header "TEST SUMMARY"
    
    log "Analyzing test results..."
    
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    if [ -d "$RESULTS_DIR" ]; then
        for log_file in "$RESULTS_DIR"/*.log; do
            if [ -f "$log_file" ]; then
                total_tests=$((total_tests + 1))
                if grep -q "✅ PASSED" "$log_file"; then
                    passed_tests=$((passed_tests + 1))
                else
                    failed_tests=$((failed_tests + 1))
                fi
            fi
        done
    fi
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  STRESS TEST SUMMARY${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Total Tests:    ${total_tests}"
    echo -e "  Passed:         ${GREEN}${passed_tests}${NC}"
    echo -e "  Failed:         ${RED}${failed_tests}${NC}"
    echo -e "  Success Rate:   $([ $total_tests -gt 0 ] && echo "$((passed_tests * 100 / total_tests))%" || echo "N/A")"
    echo ""
    echo -e "  Results Dir:    ${RESULTS_DIR}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          IAC DHARMA - STRESS TEST SUITE                       ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Select stress test to run:"
    echo ""
    echo "  1) Spike Test       - Sudden traffic surge (2 min)"
    echo "  2) Soak Test        - Sustained load (5 min)"
    echo "  3) Breakpoint Test  - Find system limits (3 min)"
    echo "  4) Recovery Test    - System resilience (2 min)"
    echo "  5) Quick Test       - All scenarios (reduced duration)"
    echo "  6) Full Suite       - All stress tests (15+ min)"
    echo "  7) View Summary     - Analyze previous results"
    echo "  8) Exit"
    echo ""
}

# Main execution
main() {
    # Check if API is running
    if ! check_api; then
        exit 1
    fi
    
    # If argument provided, run that test
    case "$1" in
        spike)
            run_spike_test
            exit $?
            ;;
        soak)
            run_soak_test
            exit $?
            ;;
        breakpoint)
            run_breakpoint_test
            exit $?
            ;;
        recovery)
            run_recovery_test
            exit $?
            ;;
        quick)
            run_quick_test
            exit $?
            ;;
        full)
            run_spike_test
            sleep 10
            run_soak_test
            sleep 10
            run_breakpoint_test
            sleep 10
            run_recovery_test
            generate_summary
            exit $?
            ;;
        summary)
            generate_summary
            exit 0
            ;;
    esac
    
    # Interactive menu
    while true; do
        show_menu
        read -p "Enter choice [1-8]: " choice
        
        case $choice in
            1)
                run_spike_test
                ;;
            2)
                run_soak_test
                ;;
            3)
                run_breakpoint_test
                ;;
            4)
                run_recovery_test
                ;;
            5)
                run_quick_test
                ;;
            6)
                log "Running full stress test suite..."
                run_spike_test
                sleep 10
                run_soak_test
                sleep 10
                run_breakpoint_test
                sleep 10
                run_recovery_test
                generate_summary
                ;;
            7)
                generate_summary
                ;;
            8)
                log "Exiting..."
                exit 0
                ;;
            *)
                log_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"
