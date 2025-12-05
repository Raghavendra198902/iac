#!/bin/bash
# Performance Optimization Deep Dive Script
# Analyzes and optimizes IAC Dharma v2.0 performance

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="${NAMESPACE:-iac-dharma}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
}

echo "⚡ IAC Dharma v2.0 - Performance Optimization Deep Dive"
echo "======================================================"

# 1. Database Performance Analysis
log_section "Database Performance Analysis"

log_info "Analyzing slow queries..."
kubectl exec -n $NAMESPACE deployment/postgresql -- psql -U postgres -d iacdharma -c "
    SELECT 
        queryid,
        substring(query, 1, 50) as query_preview,
        calls,
        ROUND(mean_exec_time::numeric, 2) as avg_ms,
        ROUND(max_exec_time::numeric, 2) as max_ms
    FROM pg_stat_statements
    WHERE mean_exec_time > 100
    ORDER BY mean_exec_time DESC
    LIMIT 10;" 2>/dev/null || log_warn "pg_stat_statements extension not enabled"

log_info "Checking database connections..."
kubectl exec -n $NAMESPACE deployment/postgresql -- psql -U postgres -d iacdharma -c "
    SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle
    FROM pg_stat_activity;"

log_info "Analyzing table sizes..."
kubectl exec -n $NAMESPACE deployment/postgresql -- psql -U postgres -d iacdharma -c "
    SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10;"

# 2. Cache Performance
log_section "Redis Cache Performance"

log_info "Getting cache statistics..."
REDIS_POD=$(kubectl get pod -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli INFO STATS | grep -E "keyspace_hits|keyspace_misses" || true

HIT_RATE=$(kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli INFO STATS | \
    awk '/keyspace_hits/{hits=$2} /keyspace_misses/{misses=$2} END{if(hits+misses>0) print (hits/(hits+misses))*100}')

if [ ! -z "$HIT_RATE" ]; then
    log_info "Cache hit rate: ${HIT_RATE}%"
    if (( $(echo "$HIT_RATE < 80" | bc -l) )); then
        log_warn "Cache hit rate is below 80%. Consider increasing TTL or cache size."
    fi
fi

log_info "Checking memory usage..."
kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli INFO MEMORY | grep -E "used_memory_human|maxmemory_human"

# 3. API Performance
log_section "API Performance Analysis"

log_info "Testing API response times..."
API_POD=$(kubectl get pod -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}')

# Port forward in background
kubectl port-forward -n $NAMESPACE $API_POD 8082:3000 &
PF_PID=$!
sleep 3

# Test endpoints
declare -A ENDPOINTS=(
    ["/health/live"]="Health Check"
    ["/api/blueprints"]="List Blueprints"
    ["/metrics"]="Metrics"
)

for endpoint in "${!ENDPOINTS[@]}"; do
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:8082$endpoint" 2>/dev/null || echo "0")
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
    
    if (( $(echo "$RESPONSE_MS > 0" | bc -l) )); then
        log_info "${ENDPOINTS[$endpoint]}: ${RESPONSE_MS}ms"
        
        if (( $(echo "$RESPONSE_MS > 500" | bc -l) )); then
            log_warn "${ENDPOINTS[$endpoint]} is slow (>500ms)"
        fi
    fi
done

kill $PF_PID 2>/dev/null || true

# 4. Resource Utilization
log_section "Resource Utilization"

log_info "Pod CPU and Memory usage:"
kubectl top pods -n $NAMESPACE 2>/dev/null || log_warn "Metrics server not available"

log_info "Node resource allocation:"
kubectl top nodes 2>/dev/null || log_warn "Metrics server not available"

# 5. Network Performance
log_section "Network Performance"

log_info "Checking service latency..."
kubectl exec -n $NAMESPACE $API_POD -- curl -o /dev/null -s -w "PostgreSQL: %{time_total}s\n" http://postgresql:5432 2>/dev/null || true
kubectl exec -n $NAMESPACE $API_POD -- curl -o /dev/null -s -w "Redis: %{time_total}s\n" http://redis:6379 2>/dev/null || true

# 6. Container Performance
log_section "Container Performance"

log_info "Analyzing container restarts..."
kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}' | \
while read pod restarts; do
    if [ "$restarts" -gt 0 ]; then
        log_warn "Pod $pod has restarted $restarts times"
    fi
done

# 7. Generate Recommendations
log_section "Performance Recommendations"

# Database recommendations
TOTAL_CONN=$(kubectl exec -n $NAMESPACE deployment/postgresql -- psql -U postgres -d iacdharma -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null || echo "0")
MAX_CONN=$(kubectl exec -n $NAMESPACE deployment/postgresql -- psql -U postgres -d iacdharma -t -c "SHOW max_connections;" 2>/dev/null || echo "100")

CONN_USAGE=$(echo "scale=2; ($TOTAL_CONN / $MAX_CONN) * 100" | bc)

if (( $(echo "$CONN_USAGE > 70" | bc -l) )); then
    echo "❌ Database connections at ${CONN_USAGE}% capacity"
    echo "   Recommendation: Increase max_connections or optimize connection pooling"
else
    echo "✅ Database connections: ${CONN_USAGE}% (healthy)"
fi

# Cache recommendations
REDIS_KEYS=$(kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli DBSIZE 2>/dev/null | grep -oP '\d+' || echo "0")
if [ "$REDIS_KEYS" -gt 100000 ]; then
    echo "⚠️  Redis has $REDIS_KEYS keys"
    echo "   Recommendation: Review cache eviction policy and TTL settings"
else
    echo "✅ Redis key count: $REDIS_KEYS (healthy)"
fi

# Resource recommendations
echo ""
echo "📊 Summary of Optimizations:"
echo "   1. Enable query result caching for frequently accessed data"
echo "   2. Implement database connection pooling with PgBouncer (✅ Already configured)"
echo "   3. Add indexes on foreign keys and frequently queried columns"
echo "   4. Configure Redis memory limits and eviction policies"
echo "   5. Enable horizontal pod autoscaling for traffic spikes"
echo "   6. Implement CDN for static assets"
echo "   7. Use read replicas for read-heavy workloads"
echo "   8. Enable gzip compression on API responses"
echo ""

# 8. Performance Benchmarks
log_section "Performance Benchmarks"

log_info "Current Performance Targets:"
echo "  P50 Response Time: < 200ms"
echo "  P95 Response Time: < 500ms"
echo "  P99 Response Time: < 1000ms"
echo "  Database Query Time: < 100ms average"
echo "  Cache Hit Rate: > 90%"
echo "  API Throughput: > 1000 req/s"
echo ""

log_info "Run load tests with: npm run test:load"

# 9. Save Report
REPORT_FILE="/tmp/performance-report-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee -a "$REPORT_FILE")

log_info "Performance report saved to: $REPORT_FILE"

echo ""
echo "======================================================"
echo "⚡ Performance Analysis Complete!"
echo "======================================================"
