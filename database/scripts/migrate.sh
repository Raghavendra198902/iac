#!/bin/bash
# Database Migration Runner
# Runs Flyway-style versioned SQL migrations

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-dharma}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Migration directory
MIGRATIONS_DIR="$(cd "$(dirname "$0")/../schemas" && pwd)"

echo -e "${GREEN}=== IAC Dharma Database Migrations ===${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Migrations directory: $MIGRATIONS_DIR"
echo ""

# Check PostgreSQL connection
echo -e "${YELLOW}Checking database connection...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
    echo -e "${RED}ERROR: Cannot connect to PostgreSQL${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# Create database if it doesn't exist
echo -e "${YELLOW}Checking if database exists...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}Creating database $DB_NAME...${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi
echo ""

# Create schema_migrations table if it doesn't exist
echo -e "${YELLOW}Setting up migration tracking...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255),
    script_name VARCHAR(255) NOT NULL,
    checksum VARCHAR(64),
    installed_by VARCHAR(100) NOT NULL,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time INTEGER,
    success BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_installed_at 
    ON schema_migrations(installed_at DESC);
EOF
echo -e "${GREEN}✓ Migration tracking ready${NC}"
echo ""

# Get applied migrations
echo -e "${YELLOW}Checking applied migrations...${NC}"
APPLIED_MIGRATIONS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT version FROM schema_migrations WHERE success = true ORDER BY version;")
echo "Applied migrations:"
if [ -z "$APPLIED_MIGRATIONS" ]; then
    echo "  (none)"
else
    echo "$APPLIED_MIGRATIONS" | while read -r version; do
        [ -n "$version" ] && echo "  - $version"
    done
fi
echo ""

# Find pending migrations
echo -e "${YELLOW}Finding pending migrations...${NC}"
PENDING_COUNT=0

for migration_file in $(ls $MIGRATIONS_DIR/V*.sql | sort); do
    filename=$(basename "$migration_file")
    version=$(echo "$filename" | sed 's/V\([0-9]*\)__.*/\1/')
    description=$(echo "$filename" | sed 's/V[0-9]*__\(.*\)\.sql/\1/' | tr '_' ' ')
    
    # Check if already applied
    is_applied=$(echo "$APPLIED_MIGRATIONS" | grep -w "$version" || true)
    
    if [ -z "$is_applied" ]; then
        echo -e "${YELLOW}Found pending: $filename${NC}"
        PENDING_COUNT=$((PENDING_COUNT + 1))
        
        # Calculate checksum
        checksum=$(md5sum "$migration_file" | cut -d' ' -f1)
        
        # Execute migration
        echo "  Executing migration..."
        start_time=$(date +%s)
        
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file" > /tmp/migration_output.log 2>&1; then
            end_time=$(date +%s)
            execution_time=$((end_time - start_time))
            
            # Record successful migration
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
INSERT INTO schema_migrations (version, description, script_name, checksum, installed_by, execution_time, success)
VALUES ('$version', '$description', '$filename', '$checksum', '$USER', $execution_time, true);
EOF
            echo -e "${GREEN}  ✓ Migration successful (${execution_time}s)${NC}"
        else
            # Record failed migration
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
INSERT INTO schema_migrations (version, description, script_name, checksum, installed_by, execution_time, success)
VALUES ('$version', '$description', '$filename', '$checksum', '$USER', 0, false);
EOF
            echo -e "${RED}  ✗ Migration failed${NC}"
            echo -e "${RED}Error output:${NC}"
            cat /tmp/migration_output.log
            exit 1
        fi
    fi
done

echo ""
if [ $PENDING_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ Database is up to date (no pending migrations)${NC}"
else
    echo -e "${GREEN}✓ Applied $PENDING_COUNT migration(s) successfully${NC}"
fi

# Show current schema version
echo ""
echo -e "${YELLOW}Current schema version:${NC}"
LATEST_VERSION=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT version FROM schema_migrations WHERE success = true ORDER BY version DESC LIMIT 1;")
if [ -n "$LATEST_VERSION" ]; then
    echo "  Version: $LATEST_VERSION"
else
    echo "  (no migrations applied)"
fi

echo ""
echo -e "${GREEN}=== Migration Complete ===${NC}"
