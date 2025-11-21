#!/bin/bash

# Performance Profiling Script for IAC Dharma Platform
# Analyzes API response times, database query performance, and identifies bottlenecks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================"
echo "🚀 IAC Dharma Performance Profiling"
echo "======================================"
echo ""
echo "Date: $(date)"
echo "======================================"

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TOKEN=""
PROFILE_DURATION="${PROFILE_DURATION:-60}"

# Function to get auth token
get_auth_token() {
    echo "Authenticating..."
    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@iacdharma.com","password":"admin"}')
    
    TOKEN=$(echo "$RESPONSE" | jq -r '.token // empty')
    
    if [ -z "$TOKEN" ]; then
        echo -e "${YELLOW}WARNING${NC} - Could not authenticate (API may be down)"
        echo "Continuing with direct database analysis..."
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} Authentication successful"
    return 0
}

# Function to test endpoint performance
test_endpoint() {
    local method=$1
    local path=$2
    local name=$3
    
    if [ -z "$TOKEN" ]; then
        return
    fi
    
    local start=$(date +%s%N)
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -X "$method" \
        "${API_BASE_URL}${path}" \
        -H "Authorization: Bearer $TOKEN")
    local end=$(date +%s%N)
    
    local duration=$(( (end - start) / 1000000 ))
    
    if [ $duration -gt 200 ]; then
        echo -e "${RED}SLOW${NC} - $name: ${duration}ms (HTTP $http_code)"
    elif [ $duration -gt 100 ]; then
        echo -e "${YELLOW}MODERATE${NC} - $name: ${duration}ms (HTTP $http_code)"
    else
        echo -e "${GREEN}FAST${NC} - $name: ${duration}ms (HTTP $http_code)"
    fi
    
    echo "$path,$duration,$http_code" >> /tmp/performance-profile.csv
}

echo ""
echo "======================================"
echo "1. API Endpoint Performance"
echo "======================================"

# Initialize CSV
echo "endpoint,response_time_ms,http_code" > /tmp/performance-profile.csv

if get_auth_token; then
    echo ""
    echo "Testing common endpoints..."
    
    test_endpoint "GET" "/health" "Health Check"
    test_endpoint "GET" "/api" "API Info"
    test_endpoint "GET" "/api/blueprints" "List Blueprints"
    test_endpoint "GET" "/api/iac/templates" "List IAC Templates"
    test_endpoint "GET" "/api/costing/estimations" "List Cost Estimations"
    test_endpoint "GET" "/api/pm/projects" "List Projects"
    test_endpoint "GET" "/api/se/workflows" "List Workflows"
    test_endpoint "GET" "/api/ea/frameworks" "List EA Frameworks"
    test_endpoint "GET" "/api/ta/standards" "List TA Standards"
    test_endpoint "GET" "/api/sa/policies" "List SA Policies"
    
    echo ""
    echo "Performance profile saved to: /tmp/performance-profile.csv"
    
    # Calculate statistics
    echo ""
    echo "Response Time Statistics:"
    awk -F',' 'NR>1 {sum+=$2; if($2>max) max=$2; if(NR==2 || $2<min) min=$2; count++} 
        END {printf "  Average: %.0fms\n  Minimum: %.0fms\n  Maximum: %.0fms\n  Samples: %d\n", 
        sum/count, min, max, count}' /tmp/performance-profile.csv
fi

echo ""
echo "======================================"
echo "2. Database Query Performance"
echo "======================================"

# Check if database is accessible
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}WARNING${NC} - psql not installed, skipping database analysis"
else
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-iac_dharma}"
    DB_USER="${DB_USER:-dharma_admin}"
    
    echo "Analyzing database performance..."
    echo ""
    
    # Check for slow queries (using pg_stat_statements if available)
    echo "Top 10 Slowest Queries (if pg_stat_statements enabled):"
    PGPASSWORD="${DB_PASSWORD:-dharma_pass_dev}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 
            ROUND(mean_exec_time::numeric, 2) as avg_ms,
            calls,
            SUBSTRING(query, 1, 80) as query_preview
        FROM pg_stat_statements
        ORDER BY mean_exec_time DESC
        LIMIT 10;
    " 2>/dev/null || echo "  pg_stat_statements not enabled"
    
    echo ""
    echo "Database Connection Statistics:"
    PGPASSWORD="${DB_PASSWORD:-dharma_pass_dev}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active,
            count(*) FILTER (WHERE state = 'idle') as idle
        FROM pg_stat_activity
        WHERE datname = '$DB_NAME';
    " 2>/dev/null || echo "  Could not connect to database"
    
    echo ""
    echo "Table Sizes (Top 10 largest):"
    PGPASSWORD="${DB_PASSWORD:-dharma_pass_dev}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10;
    " 2>/dev/null || echo "  Could not query table sizes"
    
    echo ""
    echo "Index Usage Analysis:"
    PGPASSWORD="${DB_PASSWORD:-dharma_pass_dev}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as index_scans,
            pg_size_pretty(pg_relation_size(indexrelid)) as index_size
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan
        LIMIT 10;
    " 2>/dev/null || echo "  Could not query index usage"
fi

echo ""
echo "======================================"
echo "3. Application Metrics"
echo "======================================"

if [ -n "$TOKEN" ]; then
    echo "Fetching performance statistics from API..."
    
    PERF_STATS=$(curl -s -X GET "${API_BASE_URL}/api/performance/stats" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$PERF_STATS" | jq -e '.success' > /dev/null 2>&1; then
        echo ""
        echo "Performance Statistics:"
        echo "$PERF_STATS" | jq -r '.data | 
            "  Total Requests: \(.totalRequests)
  Avg Response Time: \(.avgResponseTime)ms
  Median Response Time: \(.medianResponseTime)ms
  95th Percentile: \(.p95ResponseTime)ms
  99th Percentile: \(.p99ResponseTime)ms"'
        
        echo ""
        echo "Slowest Endpoints:"
        echo "$PERF_STATS" | jq -r '.data.slowestEndpoints[] | 
            "  \(.endpoint) - Avg: \(.avgTime)ms (p95: \(.p95)ms, count: \(.count))"' | head -5
        
        echo ""
        echo "Status Code Distribution:"
        echo "$PERF_STATS" | jq -r '.data.statusCodeDistribution | 
            to_entries[] | "  HTTP \(.key): \(.value) requests"'
    else
        echo "  No performance data available (may need to send some requests first)"
    fi
    
    echo ""
    echo "Slow Endpoint Details:"
    SLOW_ENDPOINTS=$(curl -s -X GET "${API_BASE_URL}/api/performance/slow-endpoints" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$SLOW_ENDPOINTS" | jq -e '.success' > /dev/null 2>&1; then
        echo "$SLOW_ENDPOINTS" | jq -r '.data[] | 
            "  \(.endpoint) - \(.occurrences) occurrences, avg: \(.avgTime)ms, max: \(.maxTime)ms"' | head -10
    else
        echo "  No slow endpoints detected"
    fi
fi

echo ""
echo "======================================"
echo "4. Resource Utilization"
echo "======================================"

if command -v docker &> /dev/null; then
    echo "Docker Container Statistics:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
        $(docker ps --filter "name=dharma-" --format "{{.Names}}") 2>/dev/null | head -15
else
    echo "  Docker not available"
fi

echo ""
echo "======================================"
echo "5. Optimization Recommendations"
echo "======================================"

echo ""
echo "Analyzing performance data..."
echo ""

# Analyze CSV data for recommendations
if [ -f /tmp/performance-profile.csv ]; then
    SLOW_ENDPOINTS_COUNT=$(awk -F',' 'NR>1 && $2>200 {count++} END {print count+0}' /tmp/performance-profile.csv)
    MODERATE_ENDPOINTS_COUNT=$(awk -F',' 'NR>1 && $2>100 && $2<=200 {count++} END {print count+0}' /tmp/performance-profile.csv)
    
    if [ $SLOW_ENDPOINTS_COUNT -gt 0 ]; then
        echo -e "${RED}⚠${NC}  Found $SLOW_ENDPOINTS_COUNT slow endpoints (>200ms)"
        echo "   Recommendations:"
        echo "   - Add database indexes for frequently queried columns"
        echo "   - Implement caching for read-heavy endpoints"
        echo "   - Consider database query optimization"
        echo "   - Review N+1 query patterns"
        echo ""
    fi
    
    if [ $MODERATE_ENDPOINTS_COUNT -gt 0 ]; then
        echo -e "${YELLOW}ℹ${NC}  Found $MODERATE_ENDPOINTS_COUNT moderate endpoints (100-200ms)"
        echo "   Recommendations:"
        echo "   - Monitor these endpoints under load"
        echo "   - Consider implementing pagination"
        echo "   - Add response caching where appropriate"
        echo ""
    fi
fi

# Database recommendations
echo "Database Optimization:"
echo "  - Ensure pg_stat_statements extension is enabled"
echo "  - Run VACUUM ANALYZE regularly"
echo "  - Monitor index usage and remove unused indexes"
echo "  - Consider connection pooling tuning (current: 20 max connections)"
echo "  - Review long-running queries and add appropriate indexes"
echo ""

echo "Caching Strategy:"
echo "  - Implement Redis caching for frequently accessed data"
echo "  - Cache IAC templates and blueprints"
echo "  - Cache cost estimation results"
echo "  - Set appropriate TTL based on data volatility"
echo ""

echo "Application Performance:"
echo "  - Enable compression middleware (gzip)"
echo "  - Implement API response caching headers"
echo "  - Consider implementing GraphQL for flexible data fetching"
echo "  - Monitor memory usage and implement memory limits"
echo ""

echo "======================================"
echo "📊 Performance Profiling Complete"
echo "======================================"
echo ""
echo "Reports generated:"
echo "  - /tmp/performance-profile.csv (endpoint response times)"
echo ""
echo "Next steps:"
echo "  1. Review slow endpoints and optimize queries"
echo "  2. Implement caching for frequently accessed data"
echo "  3. Add database indexes for slow queries"
echo "  4. Run load testing to identify breaking points"
echo "  5. Monitor production performance with Grafana dashboards"
echo ""
