#!/bin/bash
# Database Restoration Script for Dharma IAC Platform
# Restores encrypted PostgreSQL backups from S3

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESTORE_DIR="${RESTORE_DIR:-/var/backups/postgresql/restore}"
S3_BUCKET="${S3_BUCKET:-dharma-backups}"
S3_PREFIX="${S3_PREFIX:-database}"
ENCRYPTION_KEY_FILE="${ENCRYPTION_KEY_FILE:-/etc/backup/encryption.key}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-dharma}"
DB_USER="${DB_USER:-postgres}"
PGPASSWORD="${DB_PASSWORD:-}"
export PGPASSWORD

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="${LOG_FILE:-/var/log/database-restore.log}"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*" | tee -a "$LOG_FILE" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $*" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $*" | tee -a "$LOG_FILE"
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    local missing_tools=()
    
    command -v psql &> /dev/null || missing_tools+=("psql")
    command -v gunzip &> /dev/null || missing_tools+=("gunzip")
    command -v openssl &> /dev/null || missing_tools+=("openssl")
    command -v aws &> /dev/null || missing_tools+=("aws-cli")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing_tools[*]}"
        return 1
    fi
    
    # Check encryption key
    if [[ ! -f "$ENCRYPTION_KEY_FILE" ]]; then
        error "Encryption key not found at $ENCRYPTION_KEY_FILE"
        return 1
    fi
    
    # Check restore directory
    mkdir -p "$RESTORE_DIR"
    
    # Test database connection
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
        error "Cannot connect to database at $DB_HOST:$DB_PORT"
        return 1
    fi
    
    log "Prerequisites check passed"
    return 0
}

list_available_backups() {
    log "Listing available backups from S3..."
    
    echo ""
    echo "Available Backups:"
    echo "=================="
    
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | grep "\.sql\.gz\.enc$" | while read -r line; do
        local file_name=$(echo "$line" | awk '{print $4}')
        local file_size=$(echo "$line" | awk '{print $3}')
        local file_date=$(echo "$line" | awk '{print $1" "$2}')
        
        echo "  $file_name"
        echo "    Date: $file_date"
        echo "    Size: $file_size bytes"
        echo ""
    done
    
    echo "=================="
}

download_backup() {
    local backup_name="$1"
    local local_file="$RESTORE_DIR/$backup_name"
    
    log "Downloading backup from S3..."
    
    # Download backup file
    if ! aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/$backup_name" "$local_file" 2>> "$LOG_FILE"; then
        error "Failed to download backup from S3"
        return 1
    fi
    
    # Download checksum if available
    aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${backup_name}.sha256" "${local_file}.sha256" 2>> "$LOG_FILE" || true
    
    log "Backup downloaded: $local_file"
    echo "$local_file"
}

verify_backup() {
    local backup_file="$1"
    
    log "Verifying backup integrity..."
    
    # Verify checksum if available
    if [[ -f "${backup_file}.sha256" ]]; then
        if ! sha256sum -c "${backup_file}.sha256" &> /dev/null; then
            error "Checksum verification failed"
            return 1
        fi
        log "Checksum verification passed"
    else
        warning "Checksum file not found, skipping verification"
    fi
    
    # Test decryption
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

create_pre_restore_backup() {
    log "Creating pre-restore backup of current database..."
    
    local pre_restore_backup="$RESTORE_DIR/pre_restore_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-acl \
        > "$pre_restore_backup" 2>> "$LOG_FILE"; then
        gzip "$pre_restore_backup"
        log "Pre-restore backup created: ${pre_restore_backup}.gz"
        return 0
    else
        warning "Pre-restore backup failed (database may not exist yet)"
        return 0
    fi
}

restore_database() {
    local backup_file="$1"
    local decrypted_file="${backup_file%.enc}"
    local decompressed_file="${decrypted_file%.gz}"
    
    log "Starting database restoration..."
    
    # Decrypt
    log "Decrypting backup..."
    if ! openssl enc -d -aes-256-cbc \
        -pbkdf2 \
        -in "$backup_file" \
        -out "$decrypted_file" \
        -pass file:"$ENCRYPTION_KEY_FILE"; then
        error "Decryption failed"
        return 1
    fi
    
    log "Backup decrypted"
    
    # Decompress
    log "Decompressing backup..."
    if ! gunzip "$decrypted_file"; then
        error "Decompression failed"
        rm -f "$decrypted_file"
        return 1
    fi
    
    log "Backup decompressed"
    
    # Drop existing connections
    log "Terminating existing database connections..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
        2>> "$LOG_FILE" || true
    
    # Restore database
    log "Restoring database..."
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        < "$decompressed_file" 2>> "$LOG_FILE"; then
        error "Database restoration failed"
        rm -f "$decompressed_file"
        return 1
    fi
    
    rm -f "$decompressed_file"
    log "Database restored successfully"
    return 0
}

verify_restoration() {
    log "Verifying database restoration..."
    
    # Check if database exists
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &> /dev/null; then
        error "Database verification failed: cannot connect"
        return 1
    fi
    
    # Count tables
    local table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>> "$LOG_FILE")
    
    log "Database contains $table_count tables"
    
    # Check some key tables exist (customize based on your schema)
    local key_tables=("users" "blueprints" "iac_templates")
    for table in "${key_tables[@]}"; do
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
            "SELECT 1 FROM information_schema.tables WHERE table_name = '$table'" 2>> "$LOG_FILE" | grep -q 1; then
            log "✓ Table '$table' exists"
        else
            warning "✗ Table '$table' not found"
        fi
    done
    
    log "Database restoration verified"
    return 0
}

interactive_restore() {
    echo ""
    echo "========================================"
    echo "  Database Restoration Wizard"
    echo "========================================"
    echo ""
    
    # List backups
    list_available_backups
    
    # Prompt for backup selection
    echo ""
    read -p "Enter the backup filename to restore: " backup_name
    
    if [[ -z "$backup_name" ]]; then
        error "No backup selected"
        exit 1
    fi
    
    # Confirm restoration
    echo ""
    warning "This will restore the database: $DB_NAME"
    warning "Current data will be overwritten!"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        log "Restoration cancelled by user"
        exit 0
    fi
    
    # Perform restoration
    restore_from_backup "$backup_name"
}

restore_from_backup() {
    local backup_name="$1"
    
    log "=== Database Restoration Started ==="
    log "Backup: $backup_name"
    log "Target: $DB_NAME @ $DB_HOST:$DB_PORT"
    
    SECONDS=0
    
    # Check prerequisites
    if ! check_prerequisites; then
        error "Prerequisites check failed"
        exit 1
    fi
    
    # Download backup
    local backup_file
    if ! backup_file=$(download_backup "$backup_name"); then
        error "Backup download failed"
        exit 1
    fi
    
    # Verify backup
    if ! verify_backup "$backup_file"; then
        error "Backup verification failed"
        exit 1
    fi
    
    # Create pre-restore backup
    create_pre_restore_backup
    
    # Restore database
    if ! restore_database "$backup_file"; then
        error "Database restoration failed"
        exit 1
    fi
    
    # Verify restoration
    if ! verify_restoration; then
        error "Restoration verification failed"
        exit 1
    fi
    
    # Cleanup
    rm -f "$backup_file" "${backup_file}.sha256"
    
    log "=== Database Restoration Completed Successfully ==="
    log "Duration: ${SECONDS}s"
    
    exit 0
}

# Usage information
usage() {
    cat << EOF
Database Restoration Script

Usage:
    $0 [OPTIONS] [BACKUP_NAME]

Options:
    -h, --help              Show this help message
    -l, --list              List available backups
    -i, --interactive       Interactive restoration wizard
    -b, --backup NAME       Restore specific backup by name

Environment Variables:
    DB_HOST                 Database host (default: localhost)
    DB_PORT                 Database port (default: 5432)
    DB_NAME                 Database name (default: dharma)
    DB_USER                 Database user (default: postgres)
    DB_PASSWORD             Database password
    S3_BUCKET               S3 bucket for backups
    S3_PREFIX               S3 prefix for backups
    ENCRYPTION_KEY_FILE     Path to encryption key

Examples:
    # Interactive mode
    $0 --interactive

    # List available backups
    $0 --list

    # Restore specific backup
    $0 --backup dharma_dharma_20251116_120000.sql.gz.enc

EOF
}

# Main execution
main() {
    case "${1:-}" in
        -h|--help)
            usage
            exit 0
            ;;
        -l|--list)
            list_available_backups
            exit 0
            ;;
        -i|--interactive)
            interactive_restore
            exit 0
            ;;
        -b|--backup)
            if [[ -z "${2:-}" ]]; then
                error "Backup name required"
                usage
                exit 1
            fi
            restore_from_backup "$2"
            exit 0
            ;;
        "")
            interactive_restore
            exit 0
            ;;
        *)
            restore_from_backup "$1"
            exit 0
            ;;
    esac
}

main "$@"
