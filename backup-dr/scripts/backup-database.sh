#!/bin/bash
# Automated Database Backup Script for Dharma IAC Platform
# Supports PostgreSQL with encryption, compression, and S3 upload

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgresql}"
S3_BUCKET="${S3_BUCKET:-dharma-backups}"
S3_PREFIX="${S3_PREFIX:-database}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
ENCRYPTION_KEY_FILE="${ENCRYPTION_KEY_FILE:-/etc/backup/encryption.key}"
ALERT_EMAIL="${ALERT_EMAIL:-ops@dharma.example.com}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-dharma}"
DB_USER="${DB_USER:-postgres}"
PGPASSWORD="${DB_PASSWORD:-}"
export PGPASSWORD

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
LOG_FILE="${LOG_FILE:-/var/log/database-backup.log}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="dharma_${DB_NAME}_${TIMESTAMP}"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*" | tee -a "$LOG_FILE" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $*" | tee -a "$LOG_FILE"
}

send_alert() {
    local subject="$1"
    local message="$2"
    
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
    fi
    
    # Also send to monitoring system if available
    if command -v curl &> /dev/null && [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"🚨 $subject\n$message\"}" \
            2>/dev/null || true
    fi
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    local missing_tools=()
    
    command -v pg_dump &> /dev/null || missing_tools+=("pg_dump")
    command -v gzip &> /dev/null || missing_tools+=("gzip")
    command -v openssl &> /dev/null || missing_tools+=("openssl")
    command -v aws &> /dev/null || missing_tools+=("aws-cli")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing_tools[*]}"
        return 1
    fi
    
    # Check encryption key
    if [[ ! -f "$ENCRYPTION_KEY_FILE" ]]; then
        warning "Encryption key not found at $ENCRYPTION_KEY_FILE"
        warning "Creating new encryption key..."
        mkdir -p "$(dirname "$ENCRYPTION_KEY_FILE")"
        openssl rand -base64 32 > "$ENCRYPTION_KEY_FILE"
        chmod 600 "$ENCRYPTION_KEY_FILE"
    fi
    
    # Check backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Test database connection
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
        error "Cannot connect to database at $DB_HOST:$DB_PORT"
        return 1
    fi
    
    log "Prerequisites check passed"
    return 0
}

create_backup() {
    log "Starting database backup: $BACKUP_NAME"
    
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.sql"
    local compressed_file="${backup_file}.gz"
    local encrypted_file="${compressed_file}.enc"
    
    # Create backup with pg_dump
    log "Creating database dump..."
    if ! pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --format=plain \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        > "$backup_file" 2>> "$LOG_FILE"; then
        error "pg_dump failed"
        rm -f "$backup_file"
        return 1
    fi
    
    local backup_size=$(du -h "$backup_file" | cut -f1)
    log "Database dump created: $backup_size"
    
    # Compress
    log "Compressing backup..."
    if ! gzip -9 "$backup_file"; then
        error "Compression failed"
        rm -f "$backup_file"
        return 1
    fi
    
    local compressed_size=$(du -h "$compressed_file" | cut -f1)
    log "Backup compressed: $compressed_size"
    
    # Encrypt
    log "Encrypting backup..."
    if ! openssl enc -aes-256-cbc \
        -salt \
        -pbkdf2 \
        -in "$compressed_file" \
        -out "$encrypted_file" \
        -pass file:"$ENCRYPTION_KEY_FILE"; then
        error "Encryption failed"
        rm -f "$compressed_file"
        return 1
    fi
    
    rm -f "$compressed_file"
    local encrypted_size=$(du -h "$encrypted_file" | cut -f1)
    log "Backup encrypted: $encrypted_size"
    
    # Create checksum
    log "Creating checksum..."
    sha256sum "$encrypted_file" > "${encrypted_file}.sha256"
    
    # Create metadata
    cat > "${encrypted_file}.meta" <<EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$TIMESTAMP",
  "database": "$DB_NAME",
  "host": "$DB_HOST",
  "size": "$encrypted_size",
  "checksum_file": "${BACKUP_NAME}.sql.gz.enc.sha256",
  "compression": "gzip",
  "encryption": "aes-256-cbc",
  "retention_days": $RETENTION_DAYS
}
EOF
    
    log "Backup created successfully: $encrypted_file"
    echo "$encrypted_file"
}

upload_to_s3() {
    local backup_file="$1"
    local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/$(basename "$backup_file")"
    
    log "Uploading backup to S3: $s3_path"
    
    # Upload backup file
    if ! aws s3 cp "$backup_file" "$s3_path" \
        --storage-class STANDARD_IA \
        --metadata "backup-date=$TIMESTAMP,database=$DB_NAME" \
        2>> "$LOG_FILE"; then
        error "S3 upload failed"
        return 1
    fi
    
    # Upload checksum
    aws s3 cp "${backup_file}.sha256" "${s3_path}.sha256" 2>> "$LOG_FILE" || true
    
    # Upload metadata
    aws s3 cp "${backup_file}.meta" "${s3_path}.meta" 2>> "$LOG_FILE" || true
    
    log "Backup uploaded successfully to S3"
    
    # Verify upload
    if aws s3 ls "$s3_path" &> /dev/null; then
        log "S3 upload verified"
        return 0
    else
        error "S3 upload verification failed"
        return 1
    fi
}

cleanup_old_backups() {
    log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "dharma_*.sql.gz.enc" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "dharma_*.sha256" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "dharma_*.meta" -type f -mtime +$RETENTION_DAYS -delete
    
    local deleted_local=$(find "$BACKUP_DIR" -name "dharma_*" -type f -mtime +$RETENTION_DAYS | wc -l)
    log "Deleted $deleted_local old local backup files"
    
    # S3 cleanup (optional - can also use S3 lifecycle policies)
    local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
        local file_date=$(echo "$line" | awk '{print $4}' | grep -oP '\d{8}' | head -1)
        local file_name=$(echo "$line" | awk '{print $4}')
        
        if [[ "$file_date" < "$cutoff_date" ]]; then
            log "Deleting old S3 backup: $file_name"
            aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${file_name}" 2>> "$LOG_FILE" || true
        fi
    done
    
    log "Cleanup completed"
}

verify_backup() {
    local backup_file="$1"
    
    log "Verifying backup integrity..."
    
    # Verify checksum
    if ! sha256sum -c "${backup_file}.sha256" &> /dev/null; then
        error "Checksum verification failed"
        return 1
    fi
    
    log "Checksum verification passed"
    
    # Test decryption (without full decompression)
    if ! openssl enc -d -aes-256-cbc \
        -pbkdf2 \
        -in "$backup_file" \
        -pass file:"$ENCRYPTION_KEY_FILE" \
        2>/dev/null | head -c 1000 > /dev/null; then
        error "Decryption test failed"
        return 1
    fi
    
    log "Backup verification passed"
    return 0
}

send_success_notification() {
    local backup_file="$1"
    local backup_size=$(du -h "$backup_file" | cut -f1)
    local duration=$SECONDS
    
    local message="✅ Database backup completed successfully

Database: $DB_NAME
Timestamp: $TIMESTAMP
Size: $backup_size
Duration: ${duration}s
Location: s3://${S3_BUCKET}/${S3_PREFIX}/$(basename "$backup_file")
Retention: $RETENTION_DAYS days

Backup is encrypted and verified."
    
    log "$message"
    send_alert "Database Backup Successful" "$message"
}

send_failure_notification() {
    local error_msg="$1"
    
    local message="❌ Database backup FAILED

Database: $DB_NAME
Timestamp: $TIMESTAMP
Error: $error_msg

Please investigate immediately."
    
    error "$message"
    send_alert "Database Backup FAILED" "$message"
}

# Main execution
main() {
    log "=== Database Backup Started ==="
    log "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
    log "S3 Bucket: s3://${S3_BUCKET}/${S3_PREFIX}"
    
    # Track start time
    SECONDS=0
    
    # Check prerequisites
    if ! check_prerequisites; then
        send_failure_notification "Prerequisites check failed"
        exit 1
    fi
    
    # Create backup
    local backup_file
    if ! backup_file=$(create_backup); then
        send_failure_notification "Backup creation failed"
        exit 1
    fi
    
    # Verify backup
    if ! verify_backup "$backup_file"; then
        send_failure_notification "Backup verification failed"
        exit 1
    fi
    
    # Upload to S3
    if ! upload_to_s3 "$backup_file"; then
        send_failure_notification "S3 upload failed"
        exit 1
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send success notification
    send_success_notification "$backup_file"
    
    log "=== Database Backup Completed Successfully ==="
    log "Duration: ${SECONDS}s"
    
    exit 0
}

# Run main function
main "$@"
