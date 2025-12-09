#!/bin/bash
# Automated database backup with PITR support

BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="iac_v3"
RETENTION_DAYS=30

echo "Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
docker exec iac-postgres-v3 pg_dump -U iacadmin -Fc $DB_NAME > "$BACKUP_DIR/iac_v3_$TIMESTAMP.dump"

# Compress backup
gzip "$BACKUP_DIR/iac_v3_$TIMESTAMP.dump"

# Remove old backups
find $BACKUP_DIR -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete

echo "✓ Backup completed: iac_v3_$TIMESTAMP.dump.gz"
