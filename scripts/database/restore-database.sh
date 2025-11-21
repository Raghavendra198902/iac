#!/bin/bash

# Database Restore Script for IAC DHARMA
# Restores PostgreSQL database from compressed backup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/backups}"
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
echo "║      🔄 IAC DHARMA - DATABASE RESTORE 🔄                  ║"
echo "╔══════════════════════════════════════════════════════════╗"
echo ""

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Available backups:${NC}\n"
    
    if [ -d "$BACKUP_DIR" ]; then
        BACKUPS=($(find "$BACKUP_DIR" -name "dharma_backup_*.sql.gz" -type f | sort -r))
        
        if [ ${#BACKUPS[@]} -eq 0 ]; then
            echo -e "${RED}No backups found in $BACKUP_DIR${NC}"
            exit 1
        fi
        
        for i in "${!BACKUPS[@]}"; do
            backup_file="${BACKUPS[$i]}"
            backup_name=$(basename "$backup_file")
            backup_size=$(du -h "$backup_file" | cut -f1)
            backup_date=$(stat -c %y "$backup_file" | cut -d' ' -f1,2 | cut -d'.' -f1)
            echo "  [$i] $backup_name ($backup_size) - $backup_date"
        done
        
        echo ""
        echo -e "${BLUE}Usage:${NC} $0 <backup_file_or_index>"
        echo "  Example: $0 0  (restore latest backup)"
        echo "  Example: $0 ${BACKUPS[0]}"
    else
        echo -e "${RED}Backup directory not found: $BACKUP_DIR${NC}"
        exit 1
    fi
    
    exit 0
fi

# Get backup file
BACKUP_FILE=""
if [[ "$1" =~ ^[0-9]+$ ]]; then
    # User provided an index
    BACKUPS=($(find "$BACKUP_DIR" -name "dharma_backup_*.sql.gz" -type f | sort -r))
    INDEX=$1
    
    if [ $INDEX -ge 0 ] && [ $INDEX -lt ${#BACKUPS[@]} ]; then
        BACKUP_FILE="${BACKUPS[$INDEX]}"
    else
        echo -e "${RED}Invalid index: $INDEX${NC}"
        exit 1
    fi
else
    # User provided a file path
    BACKUP_FILE="$1"
fi

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}Restore Configuration:${NC}"
echo "  • Database: $DB_NAME"
echo "  • Host: $DB_HOST:$DB_PORT"
echo "  • Backup file: $BACKUP_FILE"
echo ""

# Confirm restore operation
echo -e "${YELLOW}⚠️  WARNING: This will replace all data in the database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Starting restore...${NC}"

# Perform restore using Docker container
if docker ps --format '{{.Names}}' | grep -q "dharma-db"; then
    echo -e "${BLUE}Using Docker container for restore...${NC}"
    
    # Drop existing tables (optional, uncomment if needed)
    # docker exec dharma-db psql -U "$DB_USER" -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    # Restore database
    gunzip -c "$BACKUP_FILE" | docker exec -i dharma-db psql -U "$DB_USER" -d "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database restored successfully${NC}"
    else
        echo -e "${RED}✗ Database restore failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Docker container not running, using direct connection...${NC}"
    
    # Require password or .pgpass file
    if [ -z "$PGPASSWORD" ] && [ ! -f ~/.pgpass ]; then
        echo -e "${RED}Error: PGPASSWORD not set and ~/.pgpass not found${NC}"
        exit 1
    fi
    
    gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database restored successfully${NC}"
    else
        echo -e "${RED}✗ Database restore failed${NC}"
        exit 1
    fi
fi

# Verify restore
echo ""
echo -e "${BLUE}Verifying restore...${NC}"

if docker ps --format '{{.Names}}' | grep -q "dharma-db"; then
    EVENT_COUNT=$(docker exec dharma-db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM enforcement_events;" | xargs)
    
    echo -e "${GREEN}✓ Database contains $EVENT_COUNT enforcement events${NC}"
else
    echo -e "${YELLOW}Skipping verification (Docker container not available)${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  RESTORE COMPLETE                        ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  ✓ Database restored from backup                         ║"
echo "║  ✓ Data is now available                                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

exit 0
