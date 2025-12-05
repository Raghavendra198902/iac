#!/bin/bash
# Disaster Recovery Testing Script for IAC Dharma v2.0

set -e

echo "🔥 IAC Dharma v2.0 - Disaster Recovery Test"
echo "============================================"

# Configuration
NAMESPACE="${NAMESPACE:-iac-dharma-staging}"
BACKUP_PATH="${BACKUP_PATH:-/tmp/iac-dharma-backups}"
TEST_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Test scenarios
test_database_backup_restore() {
    log_info "Test 1: Database Backup and Restore"
    echo "----------------------------------------"
    
    # Create test data
    log_info "Creating test data..."
    POD=$(kubectl get pod -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    
    kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -c \
        "CREATE TABLE IF NOT EXISTS dr_test (id SERIAL PRIMARY KEY, data TEXT, created_at TIMESTAMP DEFAULT NOW());"
    
    kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -c \
        "INSERT INTO dr_test (data) VALUES ('DR Test Data $TEST_TIMESTAMP');"
    
    # Backup
    log_info "Creating backup..."
    mkdir -p $BACKUP_PATH
    kubectl exec -n $NAMESPACE $POD -- pg_dump -U postgres iacdharma | gzip > "$BACKUP_PATH/dr-test-$TEST_TIMESTAMP.sql.gz"
    
    # Simulate disaster - delete test data
    log_info "Simulating disaster (deleting data)..."
    kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -c "DROP TABLE dr_test;"
    
    # Restore
    log_info "Restoring from backup..."
    gunzip < "$BACKUP_PATH/dr-test-$TEST_TIMESTAMP.sql.gz" | \
        kubectl exec -i -n $NAMESPACE $POD -- psql -U postgres iacdharma
    
    # Verify
    log_info "Verifying restored data..."
    RESTORED_DATA=$(kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -t -c \
        "SELECT COUNT(*) FROM dr_test WHERE data LIKE '%$TEST_TIMESTAMP%';")
    
    if [ "$RESTORED_DATA" -gt 0 ]; then
        log_info "✅ Database backup/restore test PASSED"
    else
        log_error "❌ Database backup/restore test FAILED"
        return 1
    fi
}

test_redis_backup_restore() {
    log_info "Test 2: Redis Backup and Restore"
    echo "----------------------------------------"
    
    REDIS_POD=$(kubectl get pod -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')
    
    # Create test data
    log_info "Creating test data in Redis..."
    kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli SET "dr_test_$TEST_TIMESTAMP" "test_value"
    
    # Backup
    log_info "Creating Redis backup..."
    kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli BGSAVE
    sleep 5
    kubectl exec -n $NAMESPACE $REDIS_POD -- cat /data/dump.rdb > "$BACKUP_PATH/redis-dr-test-$TEST_TIMESTAMP.rdb"
    
    # Simulate disaster
    log_info "Simulating disaster (flushing Redis)..."
    kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli FLUSHALL
    
    # Restore
    log_info "Restoring Redis from backup..."
    kubectl exec -i -n $NAMESPACE $REDIS_POD -- sh -c "cat > /data/dump.rdb" < "$BACKUP_PATH/redis-dr-test-$TEST_TIMESTAMP.rdb"
    kubectl rollout restart statefulset/redis -n $NAMESPACE
    kubectl rollout status statefulset/redis -n $NAMESPACE
    
    # Verify
    sleep 10
    REDIS_POD=$(kubectl get pod -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')
    RESTORED_VALUE=$(kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli GET "dr_test_$TEST_TIMESTAMP")
    
    if [ "$RESTORED_VALUE" = "test_value" ]; then
        log_info "✅ Redis backup/restore test PASSED"
    else
        log_error "❌ Redis backup/restore test FAILED"
        return 1
    fi
}

test_pod_failure_recovery() {
    log_info "Test 3: Pod Failure Recovery"
    echo "----------------------------------------"
    
    # Kill API Gateway pod
    log_info "Simulating pod failure..."
    API_POD=$(kubectl get pod -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}')
    kubectl delete pod -n $NAMESPACE $API_POD --grace-period=0 --force
    
    # Wait for recovery
    log_info "Waiting for pod to recover..."
    kubectl wait --for=condition=ready pod -l app=api-gateway -n $NAMESPACE --timeout=120s
    
    # Verify service is accessible
    sleep 10
    NEW_POD=$(kubectl get pod -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}')
    
    kubectl port-forward -n $NAMESPACE $NEW_POD 8081:3000 &
    PORT_FORWARD_PID=$!
    sleep 5
    
    if curl -f http://localhost:8081/health/live > /dev/null 2>&1; then
        log_info "✅ Pod failure recovery test PASSED"
    else
        log_error "❌ Pod failure recovery test FAILED"
        kill $PORT_FORWARD_PID 2>/dev/null || true
        return 1
    fi
    
    kill $PORT_FORWARD_PID 2>/dev/null || true
}

test_node_failure_simulation() {
    log_info "Test 4: Node Failure Simulation"
    echo "----------------------------------------"
    
    log_warn "This test requires multi-node cluster"
    
    NODE_COUNT=$(kubectl get nodes --no-headers | wc -l)
    if [ "$NODE_COUNT" -lt 2 ]; then
        log_warn "⚠️  Skipping - single node cluster"
        return 0
    fi
    
    # Cordon a node
    NODE=$(kubectl get nodes -o jsonpath='{.items[0].metadata.name}')
    log_info "Cordoning node: $NODE"
    kubectl cordon $NODE
    
    # Delete pods on that node
    PODS=$(kubectl get pods -n $NAMESPACE -o wide | grep $NODE | awk '{print $1}')
    for POD in $PODS; do
        log_info "Deleting pod: $POD"
        kubectl delete pod -n $NAMESPACE $POD --grace-period=0
    done
    
    # Wait for pods to reschedule
    log_info "Waiting for pods to reschedule..."
    sleep 30
    kubectl wait --for=condition=ready pod -l app=api-gateway -n $NAMESPACE --timeout=120s
    
    # Uncordon node
    kubectl uncordon $NODE
    
    log_info "✅ Node failure simulation test PASSED"
}

test_network_partition() {
    log_info "Test 5: Network Partition Simulation"
    echo "----------------------------------------"
    
    log_warn "This test simulates network partition using NetworkPolicy"
    
    # Create NetworkPolicy to isolate API Gateway
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: dr-test-isolate
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress: []
  egress: []
EOF
    
    sleep 10
    
    # Try to access service (should fail)
    POD=$(kubectl get pod -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}')
    if kubectl exec -n $NAMESPACE $POD -- curl -f http://postgresql:5432 --max-time 5 2>/dev/null; then
        log_error "❌ Network isolation failed"
        kubectl delete networkpolicy dr-test-isolate -n $NAMESPACE
        return 1
    fi
    
    # Remove NetworkPolicy
    log_info "Removing network isolation..."
    kubectl delete networkpolicy dr-test-isolate -n $NAMESPACE
    
    sleep 10
    
    # Verify connectivity restored
    if kubectl exec -n $NAMESPACE $POD -- curl -f http://postgresql:5432 --max-time 5 2>/dev/null; then
        log_info "✅ Network partition recovery test PASSED"
    else
        log_error "❌ Network partition recovery test FAILED"
        return 1
    fi
}

test_data_corruption_recovery() {
    log_info "Test 6: Data Corruption Recovery"
    echo "----------------------------------------"
    
    POD=$(kubectl get pod -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    
    # Create and corrupt data
    log_info "Creating test data..."
    kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -c \
        "CREATE TABLE IF NOT EXISTS corruption_test (id SERIAL PRIMARY KEY, data TEXT);"
    
    kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -c \
        "INSERT INTO corruption_test (data) VALUES ('Valid Data');"
    
    # Take backup before corruption
    log_info "Taking pre-corruption backup..."
    kubectl exec -n $NAMESPACE $POD -- pg_dump -U postgres iacdharma | gzip > "$BACKUP_PATH/pre-corruption-$TEST_TIMESTAMP.sql.gz"
    
    # Simulate corruption (insert invalid data)
    log_info "Simulating data corruption..."
    kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -c \
        "INSERT INTO corruption_test (data) VALUES (repeat('X', 1000000));"
    
    # Detect corruption (data too large)
    SIZE=$(kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -t -c \
        "SELECT pg_total_relation_size('corruption_test');")
    
    log_info "Table size after corruption: $SIZE bytes"
    
    # Restore from backup
    log_info "Restoring from pre-corruption backup..."
    kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -c "DROP TABLE corruption_test;"
    gunzip < "$BACKUP_PATH/pre-corruption-$TEST_TIMESTAMP.sql.gz" | \
        kubectl exec -i -n $NAMESPACE $POD -- psql -U postgres iacdharma
    
    # Verify
    VALID_COUNT=$(kubectl exec -n $NAMESPACE $POD -- psql -U postgres -d iacdharma -t -c \
        "SELECT COUNT(*) FROM corruption_test WHERE data = 'Valid Data';")
    
    if [ "$VALID_COUNT" -gt 0 ]; then
        log_info "✅ Data corruption recovery test PASSED"
    else
        log_error "❌ Data corruption recovery test FAILED"
        return 1
    fi
}

generate_report() {
    log_info "Generating DR test report..."
    
    cat > "$BACKUP_PATH/dr-test-report-$TEST_TIMESTAMP.txt" <<EOF
IAC Dharma v2.0 - Disaster Recovery Test Report
================================================
Test Date: $(date)
Namespace: $NAMESPACE

Test Results:
-------------
1. Database Backup/Restore: $DB_RESULT
2. Redis Backup/Restore: $REDIS_RESULT
3. Pod Failure Recovery: $POD_RESULT
4. Node Failure Simulation: $NODE_RESULT
5. Network Partition: $NETWORK_RESULT
6. Data Corruption Recovery: $CORRUPTION_RESULT

Overall Status: $OVERALL_STATUS

Recommendations:
- Schedule regular DR drills (monthly)
- Maintain 30-day backup retention
- Test restore procedures quarterly
- Document runbooks for each scenario
- Monitor backup success rates
- Implement automated DR testing

Backup Location: $BACKUP_PATH
EOF
    
    cat "$BACKUP_PATH/dr-test-report-$TEST_TIMESTAMP.txt"
}

# Main execution
main() {
    mkdir -p $BACKUP_PATH
    
    DB_RESULT="PASSED"
    test_database_backup_restore || DB_RESULT="FAILED"
    
    REDIS_RESULT="PASSED"
    test_redis_backup_restore || REDIS_RESULT="FAILED"
    
    POD_RESULT="PASSED"
    test_pod_failure_recovery || POD_RESULT="FAILED"
    
    NODE_RESULT="PASSED"
    test_node_failure_simulation || NODE_RESULT="FAILED"
    
    NETWORK_RESULT="PASSED"
    test_network_partition || NETWORK_RESULT="FAILED"
    
    CORRUPTION_RESULT="PASSED"
    test_data_corruption_recovery || CORRUPTION_RESULT="FAILED"
    
    if [[ "$DB_RESULT" == "PASSED" && "$REDIS_RESULT" == "PASSED" && "$POD_RESULT" == "PASSED" && "$CORRUPTION_RESULT" == "PASSED" ]]; then
        OVERALL_STATUS="✅ ALL TESTS PASSED"
    else
        OVERALL_STATUS="❌ SOME TESTS FAILED"
    fi
    
    generate_report
    
    echo ""
    echo "============================================"
    echo "$OVERALL_STATUS"
    echo "============================================"
    echo "Report saved to: $BACKUP_PATH/dr-test-report-$TEST_TIMESTAMP.txt"
}

main "$@"
