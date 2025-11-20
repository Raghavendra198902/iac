#!/bin/bash

# Automated Backup Script for IAC DHARMA PostgreSQL Database
# Creates timestamped backups with compression and retention management

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-dharma_db}"
DB_USER="${DB_USER:-dharma_user}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       💾 IAC DHARMA - DATABASE BACKUP 💾                 ║"
echo "╔══════════════════════════════════════════════════════════╗"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/dharma_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo -e "${BLUE}Starting backup...${NC}"
echo "  • Database: $DB_NAME"
echo "  • Host: $DB_HOST:$DB_PORT"
echo "  • Backup file: $BACKUP_FILE_GZ"
echo ""

# Perform backup using Docker container
if docker ps --format '{{.Names}}' | grep -q "dharma-db"; then
    echo -e "${BLUE}Using Docker container for backup...${NC}"
    
    docker exec dharma-db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database dump completed${NC}"
        
        # Compress backup
        echo -e "${BLUE}Compressing backup...${NC}"
        gzip "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
            echo -e "${GREEN}✓ Backup compressed: ${BACKUP_SIZE}${NC}"
        else
            echo -e "${RED}✗ Compression failed${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Database dump failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Docker container not running, using direct connection...${NC}"
    
    # Require password or .pgpass file
    if [ -z "$PGPASSWORD" ] && [ ! -f ~/.pgpass ]; then
        echo -e "${RED}Error: PGPASSWORD not set and ~/.pgpass not found${NC}"
        echo "Set PGPASSWORD environment variable or create ~/.pgpass file"
        exit 1
    fi
    
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database dump completed${NC}"
        gzip "$BACKUP_FILE"
        BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
        echo -e "${GREEN}✓ Backup compressed: ${BACKUP_SIZE}${NC}"
    else
        echo -e "${RED}✗ Database dump failed${NC}"
        exit 1
    fi
fi

# Get backup statistics
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "dharma_backup_*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  BACKUP STATISTICS                       ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Backup Location:      $BACKUP_DIR"
echo "║  Latest Backup:        $BACKUP_FILE_GZ"
echo "║  Backup Size:          $BACKUP_SIZE"
echo "║  Total Backups:        $TOTAL_BACKUPS"
echo "║  Total Size:           $TOTAL_SIZE"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Clean up old backups based on retention policy
echo -e "${BLUE}Applying retention policy (${RETENTION_DAYS} days)...${NC}"

OLD_BACKUPS=$(find "$BACKUP_DIR" -name "dharma_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS)
OLD_COUNT=$(echo "$OLD_BACKUPS" | grep -c "dharma_backup_" || echo "0")

if [ "$OLD_COUNT" -gt 0 ]; then
    echo "Found $OLD_COUNT old backup(s) to delete:"
    echo "$OLD_BACKUPS"
    
    echo "$OLD_BACKUPS" | xargs rm -f
    echo -e "${GREEN}✓ Deleted $OLD_COUNT old backup(s)${NC}"
else
    echo -e "${GREEN}No old backups to delete${NC}"
fi

echo ""
echo -e "${GREEN}✓ Backup completed successfully!${NC}"
echo ""

# Optional: Verify backup integrity
if command -v gunzip &> /dev/null; then
    echo -e "${BLUE}Verifying backup integrity...${NC}"
    if gunzip -t "$BACKUP_FILE_GZ" 2>/dev/null; then
        echo -e "${GREEN}✓ Backup file is valid${NC}"
    else
        echo -e "${RED}✗ Backup file may be corrupted${NC}"
        exit 1
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "To restore this backup, run:"
echo "  gunzip -c $BACKUP_FILE_GZ | docker exec -i dharma-db psql -U $DB_USER $DB_NAME"
echo "═══════════════════════════════════════════════════════════"
echo ""

exit 0
