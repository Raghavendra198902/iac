#!/bin/bash
# Backup Verification and Testing Script
# Tests backup integrity and restoration process

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
S3_BUCKET="${S3_BUCKET:-dharma-backups}"
S3_PREFIX="${S3_PREFIX:-database}"
TEST_DB_NAME="${TEST_DB_NAME:-dharma_test_restore}"
ENCRYPTION_KEY_FILE="${ENCRYPTION_KEY_FILE:-/etc/backup/encryption.key}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

log() {
    echo -e "${GREEN}[TEST]${NC} $*"
}

error() {
    echo -e "${RED}[FAIL]${NC} $*"
    ((TESTS_FAILED++))
}

success() {
    echo -e "${GREEN}[PASS]${NC} $*"
    ((TESTS_PASSED++))
}

test_encryption_key() {
    log "Testing encryption key..."
    
    if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then
        success "Encryption key exists"
    else
        error "Encryption key not found"
        return 1
    fi
    
    if [[ $(stat -c %a "$ENCRYPTION_KEY_FILE") == "600" ]]; then
        success "Encryption key has correct permissions (600)"
    else
        error "Encryption key has incorrect permissions"
    fi
}

test_s3_connectivity() {
    log "Testing S3 connectivity..."
    
    if aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" &> /dev/null; then
        success "S3 bucket accessible"
    else
        error "Cannot access S3 bucket"
        return 1
    fi
}

test_latest_backup_integrity() {
    log "Testing latest backup integrity..."
    
    # Get latest backup
    local latest_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | grep "\.sql\.gz\.enc$" | sort | tail -1 | awk '{print $4}')
    
    if [[ -z "$latest_backup" ]]; then
        error "No backups found in S3"
        return 1
    fi
    
    log "Latest backup: $latest_backup"
    
    # Download backup
    local temp_dir=$(mktemp -d)
    local backup_file="$temp_dir/$latest_backup"
    
    if aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/$latest_backup" "$backup_file" &> /dev/null; then
        success "Backup downloaded successfully"
    else
        error "Failed to download backup"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Download and verify checksum
    if aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${latest_backup}.sha256" "${backup_file}.sha256" &> /dev/null; then
        if sha256sum -c "${backup_file}.sha256" &> /dev/null; then
            success "Checksum verification passed"
        else
            error "Checksum verification failed"
        fi
    else
        error "Checksum file not found"
    fi
    
    # Test decryption
    if openssl enc -d -aes-256-cbc -pbkdf2 \
        -in "$backup_file" \
        -pass file:"$ENCRYPTION_KEY_FILE" \
        2>/dev/null | head -c 1000 > /dev/null; then
        success "Decryption test passed"
    else
        error "Decryption test failed"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

test_backup_age() {
    log "Testing backup freshness..."
    
    local latest_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | grep "\.sql\.gz\.enc$" | sort | tail -1)
    local backup_date=$(echo "$latest_backup" | awk '{print $1" "$2}')
    local backup_timestamp=$(date -d "$backup_date" +%s)
    local current_timestamp=$(date +%s)
    local age_hours=$(( (current_timestamp - backup_timestamp) / 3600 ))
    
    log "Latest backup is $age_hours hours old"
    
    if [[ $age_hours -lt 24 ]]; then
        success "Backup is fresh (< 24 hours old)"
    elif [[ $age_hours -lt 48 ]]; then
        error "Warning: Backup is $age_hours hours old (should be < 24 hours)"
    else
        error "Critical: Backup is $age_hours hours old (> 48 hours)"
    fi
}

test_backup_count() {
    log "Testing backup retention..."
    
    local backup_count=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | grep "\.sql\.gz\.enc$" | wc -l)
    
    log "Found $backup_count backups in S3"
    
    if [[ $backup_count -ge 7 ]]; then
        success "At least 7 backups available (1 week retention)"
    elif [[ $backup_count -ge 1 ]]; then
        error "Warning: Only $backup_count backups available"
    else
        error "Critical: No backups available"
    fi
}

test_restoration_dry_run() {
    log "Testing restoration process (dry run)..."
    
    # This would test the restoration script without actually restoring
    if [[ -x "$SCRIPT_DIR/restore-database.sh" ]]; then
        success "Restoration script is executable"
    else
        error "Restoration script not found or not executable"
        return 1
    fi
    
    # Test listing backups
    if "$SCRIPT_DIR/restore-database.sh" --list &> /dev/null; then
        success "Can list available backups"
    else
        error "Cannot list backups"
    fi
}

generate_report() {
    echo ""
    echo "========================================"
    echo "  Backup Verification Report"
    echo "========================================"
    echo ""
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}✓ All tests passed${NC}"
        return 0
    else
        echo -e "${RED}✗ Some tests failed${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "  Backup Verification & Testing"
    echo "========================================"
    echo ""
    
    test_encryption_key
    test_s3_connectivity
    test_latest_backup_integrity
    test_backup_age
    test_backup_count
    test_restoration_dry_run
    
    generate_report
}

main "$@"
