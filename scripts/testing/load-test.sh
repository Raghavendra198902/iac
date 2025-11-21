#!/bin/bash

# Load Testing Script for IAC Dharma Platform
# Uses Artillery for comprehensive load testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================"
echo "🚀 IAC Dharma Load Testing"
echo "======================================"
echo ""
echo "Date: $(date)"
echo "======================================"

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo -e "${YELLOW}Artillery not installed. Installing...${NC}"
    npm install -g artillery
fi

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
SCENARIO="${SCENARIO:-normal}"

echo ""
echo "Configuration:"
echo "  API Base URL: $API_BASE_URL"
echo "  Test Scenario: $SCENARIO"
echo ""

# Create Artillery configuration
cat > /tmp/artillery-config.yml << 'EOF'
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm-up"
    - duration: 120
      arrivalRate: 50
      name: "Normal load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
    - duration: 60
      arrivalRate: 50
      name: "Cool-down"
  plugins:
    expect: {}
  processor: "./load-test-processor.js"

scenarios:
  - name: "API Endpoints Load Test"
    flow:
      # Authenticate first
      - post:
          url: "/api/auth/login"
          json:
            email: "admin@iacdharma.com"
            password: "admin"
          capture:
            - json: "$.token"
              as: "token"
      
      # Test various endpoints
      - get:
          url: "/health"
          expect:
            - statusCode: 200
      
      - get:
          url: "/api"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
      
      - get:
          url: "/api/blueprints"
          headers:
            Authorization: "Bearer {{ token }}"
      
      - get:
          url: "/api/iac/templates"
          headers:
            Authorization: "Bearer {{ token }}"
      
      - get:
          url: "/api/costing/estimations"
          headers:
            Authorization: "Bearer {{ token }}"
      
      - get:
          url: "/api/pm/projects"
          headers:
            Authorization: "Bearer {{ token }}"
      
      - think: 1  # 1 second think time between requests
EOF

# Adjust target URL
sed -i "s|http://localhost:3000|$API_BASE_URL|g" /tmp/artillery-config.yml

# Run different scenarios based on argument
case "$SCENARIO" in
  "quick")
    echo "Running QUICK load test (30 seconds)..."
    sed -i 's/duration: 60/duration: 15/g; s/duration: 120/duration: 30/g' /tmp/artillery-config.yml
    sed -i 's/arrivalRate: 100/arrivalRate: 30/g' /tmp/artillery-config.yml
    ;;
  "normal")
    echo "Running NORMAL load test (5 minutes)..."
    # Use default config
    ;;
  "stress")
    echo "Running STRESS test (10 minutes)..."
    sed -i 's/duration: 60/duration: 120/g; s/duration: 120/duration: 240/g' /tmp/artillery-config.yml
    sed -i 's/arrivalRate: 50/arrivalRate: 100/g; s/arrivalRate: 100/arrivalRate: 200/g' /tmp/artillery-config.yml
    ;;
  *)
    echo "Unknown scenario: $SCENARIO"
    echo "Available scenarios: quick, normal, stress"
    exit 1
    ;;
esac

echo ""
echo "======================================"
echo "Starting Artillery Load Test"
echo "======================================"
echo ""

# Run Artillery
artillery run /tmp/artillery-config.yml --output /tmp/artillery-report.json 2>&1 | tee /tmp/artillery-output.txt

echo ""
echo "======================================"
echo "Generating HTML Report"
echo "======================================"

# Generate HTML report if json output exists
if [ -f /tmp/artillery-report.json ]; then
    artillery report /tmp/artillery-report.json --output /tmp/artillery-report.html
    echo ""
    echo -e "${GREEN}✓${NC} HTML report generated: /tmp/artillery-report.html"
fi

echo ""
echo "======================================"
echo "Load Test Summary"
echo "======================================"
echo ""

# Parse Artillery output for key metrics
if [ -f /tmp/artillery-output.txt ]; then
    echo "Key Metrics:"
    grep -E "http.codes|http.request_rate|http.response_time" /tmp/artillery-output.txt | head -20
    
    echo ""
    echo "Performance Summary:"
    grep -E "min:|max:|median:|p95:|p99:" /tmp/artillery-output.txt | head -10
fi

echo ""
echo "======================================"
echo "Recommendations"
echo "======================================"
echo ""

# Analyze results and provide recommendations
if [ -f /tmp/artillery-output.txt ]; then
    P95=$(grep "p95:" /tmp/artillery-output.txt | head -1 | awk '{print $2}' | cut -d'.' -f1)
    
    if [ ! -z "$P95" ]; then
        if [ "$P95" -lt 200 ]; then
            echo -e "${GREEN}✓${NC} Excellent performance (p95 < 200ms)"
            echo "  System can handle current load effectively"
        elif [ "$P95" -lt 500 ]; then
            echo -e "${YELLOW}⚠${NC} Acceptable performance (p95 < 500ms)"
            echo "  Consider optimizations for peak load"
        else
            echo -e "${RED}✗${NC} Poor performance (p95 > 500ms)"
            echo "  Performance optimization required"
            echo "  Recommendations:"
            echo "    - Add database indexes"
            echo "    - Implement caching"
            echo "    - Increase connection pool size"
            echo "    - Consider horizontal scaling"
        fi
    fi
fi

echo ""
echo "Reports saved to:"
echo "  - /tmp/artillery-output.txt (console output)"
echo "  - /tmp/artillery-report.json (raw data)"
echo "  - /tmp/artillery-report.html (HTML report)"
echo ""
