#!/bin/bash
# Database Migration Script for v2.0
# Applies all schemas and optimization indexes

set -e  # Exit on error

echo "========================================"
echo "v2.0 Database Migration Script"
echo "========================================"
echo ""

# Configuration
DB_CONTAINER="iac-postgres"
DB_USER="postgres"
DB_NAME="iac_dharma"
SCHEMA_DIR="./database/schemas"
OPTIMIZATION_DIR="./database/optimization"

# Check if container is running
if ! docker ps | grep -q $DB_CONTAINER; then
    echo "❌ Error: PostgreSQL container '$DB_CONTAINER' is not running"
    echo "   Please start the stack first: docker-compose -f docker-compose.v2.yml up -d postgres"
    exit 1
fi

echo "✅ PostgreSQL container is running"
echo ""

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local description=$2
    
    echo "📄 Applying: $description"
    echo "   File: $file"
    
    if [ ! -f "$file" ]; then
        echo "⚠️  Warning: File not found, skipping: $file"
        echo ""
        return 0
    fi
    
    if docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$file" 2>&1 | grep -q "ERROR"; then
        echo "❌ Error applying $file"
        echo ""
        return 0
    else
        echo "✅ Success"
        echo ""
        return 0
    fi
}

# Step 1: Core Schema
echo "=== Step 1: Core Schema ==="
execute_sql_file "$SCHEMA_DIR/V001__core_schema.sql" "Core schema (users, roles, permissions)"

# Step 2: Blueprint Schema
echo "=== Step 2: Blueprint Schema ==="
execute_sql_file "$SCHEMA_DIR/V002__blueprint_schema.sql" "Blueprint and infrastructure definitions"

# Step 3: CMDB Schema
echo "=== Step 3: CMDB Schema ==="
execute_sql_file "$SCHEMA_DIR/V003__cmdb_schema.sql" "Configuration Management Database"

# Step 4: Approvals Schema
echo "=== Step 4: Approvals Schema ==="
execute_sql_file "$SCHEMA_DIR/V004__approvals_schema.sql" "Approval workflows"

# Step 5: Incidents Schema
echo "=== Step 5: Incidents Schema ==="
execute_sql_file "$SCHEMA_DIR/V005__incidents_schema.sql" "Incident management"

# Step 6: Deployment Logs Schema
echo "=== Step 6: Deployment Logs Schema ==="
execute_sql_file "$SCHEMA_DIR/V006__deployment_logs_schema.sql" "Deployment tracking and logs"

# Step 7: Governance Schema
echo "=== Step 7: Governance Schema ==="
execute_sql_file "$SCHEMA_DIR/V007__governance_schema.sql" "Governance and compliance"

# Step 8: Apply Performance Indexes
echo "=== Step 8: Performance Optimization Indexes ==="
if [ -f "$OPTIMIZATION_DIR/add-indexes.sql" ]; then
    execute_sql_file "$OPTIMIZATION_DIR/add-indexes.sql" "Performance indexes (40+ indexes)"
else
    echo "⚠️  Warning: Optimization indexes not found at $OPTIMIZATION_DIR/add-indexes.sql"
fi

# Step 9: Verify Tables Created
echo "=== Step 9: Verification ==="
echo "📊 Listing all tables in database..."
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "\dt" | grep -E "public \|" || true
echo ""

# Count tables
TABLE_COUNT=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")
echo "Total tables created: $TABLE_COUNT"

# Count indexes
INDEX_COUNT=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'")
echo "Total indexes created: $INDEX_COUNT"

echo ""
echo "========================================"
echo "✅ Migration Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Start all backend services: docker-compose -f docker-compose.v2.yml up -d"
echo "2. Verify services health: docker-compose -f docker-compose.v2.yml ps"
echo "3. Run load tests: npm run load:baseline"
echo ""
