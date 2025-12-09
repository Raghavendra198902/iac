#!/bin/bash

# Automated Backup Script for IaC Platform v3.0
# Backs up PostgreSQL, Redis, Neo4j, and critical files
# Supports local and S3 storage with encryption

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/iac-platform}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DATE=$(date +%Y-%m-%d)

# S3 Configuration (optional)
S3_ENABLED="${S3_ENABLED:-false}"
S3_BUCKET="${S3_BUCKET:-iac-platform-backups}"
S3_REGION="${S3_REGION:-us-east-1}"

# Encryption
ENCRYPTION_ENABLED="${ENCRYPTION_ENABLED:-true}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"

# Docker compose file
COMPOSE_FILE="/home/rrd/iac/docker-compose.v3.yml"

# Notification
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
EMAIL_RECIPIENT="${EMAIL_RECIPIENT:-}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}      IaC Platform v3.0 - Automated Backup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Backup started at: $(date)"
echo "Backup directory: $BACKUP_DIR"
echo "Retention: $RETENTION_DAYS days"
echo ""

# Create backup directory structure
mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}/{postgres,redis,neo4j,vault,configs}

# Determine backup type (daily, weekly, monthly)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)

if [ "$DAY_OF_MONTH" = "01" ]; then
    BACKUP_TYPE="monthly"
elif [ "$DAY_OF_WEEK" = "7" ]; then
    BACKUP_TYPE="weekly"
else
    BACKUP_TYPE="daily"
fi

echo "Backup type: $BACKUP_TYPE"
echo ""

CURRENT_BACKUP_DIR="$BACKUP_DIR/$BACKUP_TYPE"

# Function to send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"IaC Platform Backup $status: $message\"}" \
            2>/dev/null || true
    fi
    
    # Email notification
    if [ -n "$EMAIL_RECIPIENT" ]; then
        echo "$message" | mail -s "IaC Platform Backup $status" "$EMAIL_RECIPIENT" 2>/dev/null || true
    fi
}

# Function to encrypt file
encrypt_file() {
    local file=$1
    
    if [ "$ENCRYPTION_ENABLED" = "true" ] && [ -n "$ENCRYPTION_KEY" ]; then
        echo -n "  Encrypting... "
        openssl enc -aes-256-cbc -salt -in "$file" -out "${file}.enc" -k "$ENCRYPTION_KEY"
        rm "$file"
        echo -e "${GREEN}✓${NC}"
        return 0
    fi
    return 1
}

# Function to compress and optionally encrypt
compress_and_encrypt() {
    local source=$1
    local dest=$2
    
    echo -n "  Compressing... "
    tar czf "$dest" -C "$(dirname "$source")" "$(basename "$source")"
    echo -e "${GREEN}✓${NC}"
    
    encrypt_file "$dest"
}

#═══════════════════════════════════════════════════════════════════
# 1. PostgreSQL Backup
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}1. Backing up PostgreSQL...${NC}"

PG_BACKUP_FILE="$CURRENT_BACKUP_DIR/postgres/iac_platform_${TIMESTAMP}.sql"
PG_DUMP_FILE="$CURRENT_BACKUP_DIR/postgres/iac_platform_${TIMESTAMP}.dump"

# SQL dump
echo -n "  Creating SQL dump... "
docker exec iac-postgres-v3 pg_dump -U iac_user -d iac_platform -F p > "$PG_BACKUP_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Compress and encrypt
    gzip "$PG_BACKUP_FILE"
    encrypt_file "${PG_BACKUP_FILE}.gz"
    
    PG_SIZE=$(du -h "${PG_BACKUP_FILE}.gz"* | awk '{print $1}')
    echo "  Size: $PG_SIZE"
else
    echo -e "${RED}✗ FAILED${NC}"
    send_notification "FAILED" "PostgreSQL backup failed"
fi

# Custom format dump (for selective restore)
echo -n "  Creating custom format dump... "
docker exec iac-postgres-v3 pg_dump -U iac_user -d iac_platform -F c > "$PG_DUMP_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    encrypt_file "$PG_DUMP_FILE"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Backup RBAC permissions specifically
echo -n "  Backing up RBAC permissions... "
RBAC_BACKUP="$CURRENT_BACKUP_DIR/postgres/rbac_permissions_${TIMESTAMP}.sql"
docker exec iac-postgres-v3 psql -U iac_user -d iac_platform -c "\COPY permissions TO STDOUT WITH CSV HEADER" > "$RBAC_BACKUP"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    gzip "$RBAC_BACKUP"
    encrypt_file "${RBAC_BACKUP}.gz"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# 2. Redis Backup
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}2. Backing up Redis...${NC}"

REDIS_BACKUP_DIR="$CURRENT_BACKUP_DIR/redis"
echo -n "  Creating RDB snapshot... "

# Trigger Redis BGSAVE
docker exec iac-redis-v3 redis-cli BGSAVE

# Wait for save to complete
sleep 5

# Copy RDB file
docker cp iac-redis-v3:/data/dump.rdb "$REDIS_BACKUP_DIR/redis_${TIMESTAMP}.rdb"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Compress and encrypt
    gzip "$REDIS_BACKUP_DIR/redis_${TIMESTAMP}.rdb"
    encrypt_file "$REDIS_BACKUP_DIR/redis_${TIMESTAMP}.rdb.gz"
    
    REDIS_SIZE=$(du -h "$REDIS_BACKUP_DIR"/redis_${TIMESTAMP}.rdb* | awk '{print $1}')
    echo "  Size: $REDIS_SIZE"
else
    echo -e "${RED}✗ FAILED${NC}"
    send_notification "WARNING" "Redis backup failed"
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# 3. Neo4j Backup
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}3. Backing up Neo4j...${NC}"

NEO4J_BACKUP_DIR="$CURRENT_BACKUP_DIR/neo4j"
echo -n "  Creating Neo4j dump... "

# Export Neo4j database
docker exec iac-neo4j-v3 neo4j-admin database dump neo4j --to-path=/tmp > /dev/null 2>&1
docker cp iac-neo4j-v3:/tmp/neo4j.dump "$NEO4J_BACKUP_DIR/neo4j_${TIMESTAMP}.dump"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Compress and encrypt
    gzip "$NEO4J_BACKUP_DIR/neo4j_${TIMESTAMP}.dump"
    encrypt_file "$NEO4J_BACKUP_DIR/neo4j_${TIMESTAMP}.dump.gz"
    
    NEO4J_SIZE=$(du -h "$NEO4J_BACKUP_DIR"/neo4j_${TIMESTAMP}.dump* | awk '{print $1}')
    echo "  Size: $NEO4J_SIZE"
else
    echo -e "${RED}✗ FAILED${NC}"
    send_notification "WARNING" "Neo4j backup failed"
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# 4. Vault Backup (if running)
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}4. Backing up Vault...${NC}"

if docker ps | grep -q iac-vault; then
    VAULT_BACKUP_DIR="$CURRENT_BACKUP_DIR/vault"
    echo -n "  Creating Vault snapshot... "
    
    # Export Vault data
    docker exec iac-vault vault operator raft snapshot save /tmp/vault_${TIMESTAMP}.snap 2>/dev/null
    docker cp iac-vault:/tmp/vault_${TIMESTAMP}.snap "$VAULT_BACKUP_DIR/vault_${TIMESTAMP}.snap"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC}"
        
        # Compress and encrypt
        gzip "$VAULT_BACKUP_DIR/vault_${TIMESTAMP}.snap"
        encrypt_file "$VAULT_BACKUP_DIR/vault_${TIMESTAMP}.snap.gz"
        
        VAULT_SIZE=$(du -h "$VAULT_BACKUP_DIR"/vault_${TIMESTAMP}.snap* | awk '{print $1}')
        echo "  Size: $VAULT_SIZE"
    else
        echo -e "${RED}✗ FAILED${NC}"
    fi
else
    echo "  Vault not running, skipping..."
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# 5. Configuration Files Backup
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}5. Backing up configuration files...${NC}"

CONFIG_BACKUP_DIR="$CURRENT_BACKUP_DIR/configs"
CONFIG_TAR="$CONFIG_BACKUP_DIR/configs_${TIMESTAMP}.tar.gz"

echo -n "  Archiving configs... "

# List of important files to backup
CONFIG_FILES=(
    "/home/rrd/iac/docker-compose.v3.yml"
    "/home/rrd/iac/docker-compose.vault.yml"
    "/home/rrd/iac/docker-compose.tracing.yml"
    "/home/rrd/iac/.env"
    "/home/rrd/iac/prometheus/prometheus.yml"
    "/home/rrd/iac/prometheus/alerts.yml"
    "/home/rrd/iac/backend/advanced-rbac-service/schema.sql"
    "/home/rrd/iac/scripts/integration-tests.sh"
)

tar czf "$CONFIG_TAR" -C / $(printf '%s ' "${CONFIG_FILES[@]}") 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    encrypt_file "$CONFIG_TAR"
    
    CONFIG_SIZE=$(du -h "$CONFIG_TAR"* | awk '{print $1}')
    echo "  Size: $CONFIG_SIZE"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# 6. ML Models Backup
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}6. Backing up ML models...${NC}"

ML_BACKUP_DIR="$CURRENT_BACKUP_DIR/ml_models"
mkdir -p "$ML_BACKUP_DIR"

echo -n "  Copying ML models... "
docker cp iac-aiops-engine-v3:/app/models "$ML_BACKUP_DIR/models_${TIMESTAMP}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Compress and encrypt
    tar czf "$ML_BACKUP_DIR/models_${TIMESTAMP}.tar.gz" -C "$ML_BACKUP_DIR" "models_${TIMESTAMP}"
    rm -rf "$ML_BACKUP_DIR/models_${TIMESTAMP}"
    encrypt_file "$ML_BACKUP_DIR/models_${TIMESTAMP}.tar.gz"
    
    ML_SIZE=$(du -h "$ML_BACKUP_DIR"/models_${TIMESTAMP}.tar.gz* | awk '{print $1}')
    echo "  Size: $ML_SIZE"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# 7. Upload to S3 (if enabled)
#═══════════════════════════════════════════════════════════════════
if [ "$S3_ENABLED" = "true" ]; then
    echo -e "${YELLOW}7. Uploading to S3...${NC}"
    
    if command -v aws &> /dev/null; then
        echo -n "  Syncing to s3://$S3_BUCKET/$BACKUP_TYPE/$BACKUP_DATE/... "
        
        aws s3 sync "$CURRENT_BACKUP_DIR" "s3://$S3_BUCKET/$BACKUP_TYPE/$BACKUP_DATE/" --region "$S3_REGION"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗ FAILED${NC}"
            send_notification "WARNING" "S3 upload failed"
        fi
    else
        echo -e "${RED}  AWS CLI not installed, skipping S3 upload${NC}"
    fi
    echo ""
fi

#═══════════════════════════════════════════════════════════════════
# 8. Cleanup Old Backups
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}8. Cleaning up old backups...${NC}"

echo "  Retention policy: $RETENTION_DAYS days"

# Clean daily backups older than retention period
echo -n "  Cleaning daily backups... "
find "$BACKUP_DIR/daily" -type f -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✓${NC}"

# Keep weekly backups for 3 months
echo -n "  Cleaning weekly backups (>90 days)... "
find "$BACKUP_DIR/weekly" -type f -mtime +90 -delete
echo -e "${GREEN}✓${NC}"

# Keep monthly backups for 1 year
echo -n "  Cleaning monthly backups (>365 days)... "
find "$BACKUP_DIR/monthly" -type f -mtime +365 -delete
echo -e "${GREEN}✓${NC}"

# Clean S3 if enabled
if [ "$S3_ENABLED" = "true" ] && command -v aws &> /dev/null; then
    echo -n "  Cleaning S3 backups... "
    
    # Delete daily backups older than retention
    aws s3 ls "s3://$S3_BUCKET/daily/" | while read -r line; do
        backup_date=$(echo "$line" | awk '{print $2}')
        if [ -n "$backup_date" ]; then
            age=$(( ($(date +%s) - $(date -d "$backup_date" +%s)) / 86400 ))
            if [ $age -gt $RETENTION_DAYS ]; then
                aws s3 rm "s3://$S3_BUCKET/daily/$backup_date" --recursive
            fi
        fi
    done
    
    echo -e "${GREEN}✓${NC}"
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# 9. Generate Backup Report
#═══════════════════════════════════════════════════════════════════
REPORT_FILE="$CURRENT_BACKUP_DIR/backup_report_${TIMESTAMP}.txt"

cat > "$REPORT_FILE" << EOF
IaC Platform v3.0 - Backup Report
Generated: $(date)
═══════════════════════════════════════════════════════════════════

Backup Type: $BACKUP_TYPE
Backup Date: $BACKUP_DATE
Backup Directory: $CURRENT_BACKUP_DIR

BACKUP CONTENTS:
───────────────────────────────────────────────────────────────────
PostgreSQL:
  $(ls -lh "$CURRENT_BACKUP_DIR/postgres" 2>/dev/null | tail -n +2 || echo "No backups found")

Redis:
  $(ls -lh "$CURRENT_BACKUP_DIR/redis" 2>/dev/null | tail -n +2 || echo "No backups found")

Neo4j:
  $(ls -lh "$CURRENT_BACKUP_DIR/neo4j" 2>/dev/null | tail -n +2 || echo "No backups found")

Vault:
  $(ls -lh "$CURRENT_BACKUP_DIR/vault" 2>/dev/null | tail -n +2 || echo "No backups found")

Configs:
  $(ls -lh "$CURRENT_BACKUP_DIR/configs" 2>/dev/null | tail -n +2 || echo "No backups found")

ML Models:
  $(ls -lh "$CURRENT_BACKUP_DIR/ml_models" 2>/dev/null | tail -n +2 || echo "No backups found")

TOTAL BACKUP SIZE:
  $(du -sh "$CURRENT_BACKUP_DIR" | awk '{print $1}')

DISK USAGE:
  $(df -h "$BACKUP_DIR" | tail -1)

ENCRYPTION: $ENCRYPTION_ENABLED
S3 SYNC: $S3_ENABLED

═══════════════════════════════════════════════════════════════════
EOF

cat "$REPORT_FILE"

#═══════════════════════════════════════════════════════════════════
# 10. Verify Backups
#═══════════════════════════════════════════════════════════════════
echo -e "${YELLOW}10. Verifying backups...${NC}"

VERIFY_FAILED=0

# Verify PostgreSQL backup
if [ -f "$CURRENT_BACKUP_DIR/postgres/iac_platform_${TIMESTAMP}.sql.gz"* ]; then
    echo -e "  PostgreSQL: ${GREEN}✓${NC}"
else
    echo -e "  PostgreSQL: ${RED}✗ MISSING${NC}"
    VERIFY_FAILED=1
fi

# Verify Redis backup
if [ -f "$CURRENT_BACKUP_DIR/redis/redis_${TIMESTAMP}.rdb.gz"* ]; then
    echo -e "  Redis: ${GREEN}✓${NC}"
else
    echo -e "  Redis: ${RED}✗ MISSING${NC}"
    VERIFY_FAILED=1
fi

# Verify Neo4j backup
if [ -f "$CURRENT_BACKUP_DIR/neo4j/neo4j_${TIMESTAMP}.dump.gz"* ]; then
    echo -e "  Neo4j: ${GREEN}✓${NC}"
else
    echo -e "  Neo4j: ${RED}✗ MISSING${NC}"
    VERIFY_FAILED=1
fi

echo ""

#═══════════════════════════════════════════════════════════════════
# Final Summary
#═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"

if [ $VERIFY_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ BACKUP COMPLETED SUCCESSFULLY${NC}"
    send_notification "SUCCESS" "Backup completed successfully on $(date)"
    exit 0
else
    echo -e "${RED}⚠️  BACKUP COMPLETED WITH WARNINGS${NC}"
    send_notification "WARNING" "Backup completed with warnings on $(date)"
    exit 1
fi
