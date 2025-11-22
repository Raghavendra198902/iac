# Backup and Recovery

Comprehensive backup, disaster recovery, and business continuity strategies for IAC Dharma platform.

## Table of Contents

| Section | Description | Time to Read |
|---------|-------------|--------------|
| [Overview](#overview) | Backup strategy and principles | 3 min |
| [Backup Strategy](#backup-strategy) | 3-2-1 rule, backup types, schedules | 5 min |
| [Database Backup](#database-backup) | PostgreSQL backup methods | 12 min |
| [Redis Backup](#redis-backup) | Redis persistence and backup | 6 min |
| [Application Backup](#application-backup) | Configuration, volumes, secrets | 8 min |
| [File Storage Backup](#file-storage-backup) | User uploads, artifacts | 5 min |
| [Kubernetes Backup](#kubernetes-backup) | Cluster state, resources | 10 min |
| [Automated Backup](#automated-backup) | Automation scripts, scheduling | 8 min |
| [Backup Storage](#backup-storage) | Local, S3, cloud storage | 6 min |
| [Restoration Procedures](#restoration-procedures) | Step-by-step recovery | 15 min |
| [Disaster Recovery](#disaster-recovery) | DR plan, RTO/RPO, scenarios | 12 min |
| [Testing & Verification](#testing--verification) | Backup validation, dry runs | 8 min |
| [Monitoring](#monitoring) | Backup health, alerting | 6 min |
| [Best Practices](#best-practices) | Guidelines and recommendations | 5 min |

---

## Overview

### Backup Philosophy

IAC Dharma implements a **defense-in-depth** backup strategy:

1. **Multiple Backup Types**: Full, incremental, differential, continuous
2. **Redundant Storage**: Local, cloud, offsite locations
3. **Automated Processes**: Scheduled backups with validation
4. **Regular Testing**: Monthly restoration drills
5. **Documented Procedures**: Clear recovery runbooks
6. **Encryption**: All backups encrypted at rest and in transit
7. **Monitoring**: Continuous health checks and alerting

### Key Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| **RTO** (Recovery Time Objective) | 1 hour (critical) | 45 minutes |
| **RPO** (Recovery Point Objective) | 15 minutes | 5 minutes |
| **Backup Success Rate** | 99.9% | 99.95% |
| **Restoration Success Rate** | 100% | 100% |
| **Data Integrity** | 100% | 100% |
| **Offsite Backup Lag** | < 1 hour | 15 minutes |

### Backup Coverage

```
┌─────────────────────────────────────────────┐
│         IAC Dharma Components               │
├─────────────────────────────────────────────┤
│ ✓ PostgreSQL Database (continuous)         │
│ ✓ Redis Cache (every 5 minutes)            │
│ ✓ Configuration Files (hourly)             │
│ ✓ Docker Volumes (daily)                   │
│ ✓ Kubernetes Resources (hourly)            │
│ ✓ User Uploads (continuous)                │
│ ✓ IAC Templates (real-time)                │
│ ✓ Monitoring Data (daily)                  │
│ ✓ Audit Logs (continuous)                  │
│ ✓ Secrets (daily, encrypted)               │
└─────────────────────────────────────────────┘
```

---

## Backup Strategy

### 3-2-1-1-0 Rule

Modern backup best practice (extension of 3-2-1 rule):

- **3** copies of data (production + 2 backups)
- **2** different storage types (disk + cloud)
- **1** copy offsite (different geographic location)
- **1** copy offline/air-gapped (immutable)
- **0** errors after verification

### Backup Types

#### Full Backup

Complete copy of all data.

**Advantages**:
- Simplest restoration (single file)
- No dependency on other backups
- Complete point-in-time snapshot

**Disadvantages**:
- Largest storage requirement
- Longest backup time
- Higher network bandwidth usage

**Schedule**: Weekly (Sunday 3:00 AM)  
**Retention**: 4 weeks (rolling)

#### Incremental Backup

Only changes since last backup (any type).

**Advantages**:
- Minimal storage space
- Fastest backup time
- Efficient for frequent backups

**Disadvantages**:
- Requires all previous backups for restoration
- Longer restoration time
- Higher complexity

**Schedule**: Hourly  
**Retention**: 7 days

#### Differential Backup

Changes since last full backup.

**Advantages**:
- Faster restoration than incremental
- Less storage than full backup
- Only needs last full + last differential

**Disadvantages**:
- Grows over time until next full
- More storage than incremental

**Schedule**: Daily (2:00 AM)  
**Retention**: 7 days

#### Continuous Backup

Real-time or near real-time replication.

**Methods**:
- PostgreSQL streaming replication
- Redis AOF (Append-Only File)
- File system snapshots
- Cloud storage sync

**Advantages**:
- Minimal data loss (RPO < 1 minute)
- Always up-to-date
- Near-instant recovery point

**Disadvantages**:
- Higher resource usage
- More complex setup
- Continuous network bandwidth

**Coverage**: Critical data only (database, audit logs, uploads)

### Backup Schedule

```
┌─────────────┬──────────────┬─────────────┬──────────────┐
│   Time      │    Type      │  Components │  Destination │
├─────────────┼──────────────┼─────────────┼──────────────┤
│ Continuous  │ Streaming    │ PostgreSQL  │ Standby DB   │
│ Continuous  │ AOF          │ Redis       │ Local disk   │
│ Every 5min  │ Snapshot     │ Redis       │ S3           │
│ Hourly      │ Incremental  │ Database    │ Local + S3   │
│ Daily 2AM   │ Differential │ All         │ Local + S3   │
│ Weekly 3AM  │ Full         │ All         │ Local + S3   │
│ Monthly 1st │ Archive      │ All         │ Glacier      │
└─────────────┴──────────────┴─────────────┴──────────────┘
```

---

## Database Backup

### PostgreSQL Backup Methods

#### Method 1: Logical Backup (pg_dump)

Best for: Individual database backup, schema migration, point-in-time snapshots.

```bash
#!/bin/bash
# postgres-logical-backup.sh

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-iac_dharma}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="/backups/postgres/logical"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting logical backup at $TIMESTAMP"

# Full database backup (custom format, compressed)
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.pgdump" \
  "$DB_NAME"

# Plain SQL backup (for human readability and portability)
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  --format=plain \
  --file="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql" \
  "$DB_NAME"

# Compress plain SQL
gzip "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Schema-only backup (for documentation and version control)
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  --schema-only \
  --format=plain \
  --file="$BACKUP_DIR/${DB_NAME}_schema_${TIMESTAMP}.sql" \
  "$DB_NAME"

# Data-only backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  --data-only \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/${DB_NAME}_data_${TIMESTAMP}.pgdump" \
  "$DB_NAME"

# Backup specific critical tables (separate for faster restoration)
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  --table=blueprints \
  --table=deployments \
  --table=users \
  --table=projects \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/${DB_NAME}_critical_${TIMESTAMP}.pgdump" \
  "$DB_NAME"

# Backup globals (roles, tablespaces)
pg_dumpall -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  --globals-only \
  --file="$BACKUP_DIR/globals_${TIMESTAMP}.sql"

# Calculate checksums
cd "$BACKUP_DIR"
sha256sum *_${TIMESTAMP}.* > checksums_${TIMESTAMP}.txt

# Encrypt backups
for file in *_${TIMESTAMP}.*; do
  if [[ ! "$file" =~ \.gpg$ ]] && [[ "$file" != checksums_* ]]; then
    gpg --encrypt --recipient backup@iac-dharma.com "$file"
    rm "$file"  # Remove unencrypted file
  fi
done

# Upload to S3
aws s3 sync "$BACKUP_DIR" s3://iac-dharma-backups/postgres/logical/ \
  --exclude "*" \
  --include "*_${TIMESTAMP}*" \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256

# Clean up old local backups
find "$BACKUP_DIR" -name "*.pgdump.gpg" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.sql.gz.gpg" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "checksums_*.txt" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
BACKUP_SIZE=$(stat -f%z "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.pgdump.gpg" 2>/dev/null || stat -c%s "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.pgdump.gpg")

if [ "$BACKUP_SIZE" -lt 1000 ]; then
  echo "ERROR: Backup file suspiciously small ($BACKUP_SIZE bytes)"
  exit 1
fi

echo "Logical backup completed successfully"
echo "Files:"
ls -lh "$BACKUP_DIR"/*_${TIMESTAMP}*

# Send success notification
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"PostgreSQL logical backup completed: ${TIMESTAMP}\"}"
```

#### Method 2: Physical Backup (pg_basebackup)

Best for: Fast full recovery, setting up replicas, disaster recovery.

```bash
#!/bin/bash
# postgres-physical-backup.sh

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="/backups/postgres/physical"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/base_${TIMESTAMP}"

mkdir -p "$BACKUP_PATH"

echo "Starting physical backup at $TIMESTAMP"

# Create base backup with WAL streaming
pg_basebackup \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -D "$BACKUP_PATH" \
  --format=tar \
  --gzip \
  --compress=9 \
  --progress \
  --verbose \
  --wal-method=stream \
  --checkpoint=fast \
  --label="iac_dharma_${TIMESTAMP}"

# Create backup manifest
cat > "$BACKUP_PATH/backup_manifest.txt" << EOF
Backup Date: $(date)
Backup Type: Physical (pg_basebackup)
PostgreSQL Version: $(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -t -c "SELECT version()")
Database: iac_dharma
Backup Size: $(du -sh "$BACKUP_PATH" | cut -f1)
WAL Method: stream
Compression: gzip level 9
EOF

# Calculate checksums
find "$BACKUP_PATH" -type f -exec sha256sum {} \; > "$BACKUP_PATH/checksums.txt"

# Upload to S3
aws s3 sync "$BACKUP_PATH" "s3://iac-dharma-backups/postgres/physical/base_${TIMESTAMP}/" \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256

echo "Physical backup completed: $BACKUP_PATH"
```

#### Method 3: Continuous Archiving (WAL Archiving)

Best for: Point-in-time recovery, minimal data loss.

**PostgreSQL Configuration** (`postgresql.conf`):

```conf
# Write-Ahead Logging (WAL)
wal_level = replica
archive_mode = on
archive_command = '/usr/local/bin/archive_wal.sh %p %f'
archive_timeout = 300  # Archive every 5 minutes

# WAL configuration
max_wal_size = 2GB
min_wal_size = 1GB
wal_keep_size = 1GB
wal_compression = on
```

**WAL Archive Script**:

```bash
#!/bin/bash
# archive_wal.sh

WAL_PATH="$1"
WAL_FILE="$2"
ARCHIVE_DIR="/backups/postgres/wal"
S3_BUCKET="s3://iac-dharma-backups/postgres/wal"

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Copy WAL file locally
cp "$WAL_PATH" "$ARCHIVE_DIR/$WAL_FILE"

# Upload to S3 immediately
aws s3 cp "$WAL_PATH" "$S3_BUCKET/$WAL_FILE" \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256

# Verify upload
if aws s3 ls "$S3_BUCKET/$WAL_FILE" > /dev/null; then
  echo "WAL archived successfully: $WAL_FILE"
  exit 0
else
  echo "WAL archive failed: $WAL_FILE"
  exit 1
fi
```

#### Method 4: Streaming Replication (Hot Standby)

Best for: High availability, read scaling, instant failover.

**Primary Server Configuration**:

```conf
# postgresql.conf (primary)
listen_addresses = '*'
max_wal_senders = 5
wal_keep_size = 2GB
synchronous_commit = on
synchronous_standby_names = 'standby1'
```

```conf
# pg_hba.conf (primary)
# Allow replication from standby server
host    replication     replication     10.0.1.0/24     scram-sha-256
```

**Standby Server Setup**:

```bash
#!/bin/bash
# setup-standby.sh

PRIMARY_HOST="10.0.1.10"
PRIMARY_PORT="5432"
STANDBY_DATA="/var/lib/postgresql/standby"

# Stop PostgreSQL on standby
systemctl stop postgresql

# Clean data directory
rm -rf "$STANDBY_DATA"/*

# Create base backup from primary
pg_basebackup \
  -h "$PRIMARY_HOST" \
  -p "$PRIMARY_PORT" \
  -U replication \
  -D "$STANDBY_DATA" \
  --wal-method=stream \
  --write-recovery-conf \
  --progress \
  --verbose

# Start standby
systemctl start postgresql

echo "Standby server configured and started"
```

**Standby Configuration** (`postgresql.conf`):

```conf
# postgresql.conf (standby)
hot_standby = on
max_standby_streaming_delay = 30s
hot_standby_feedback = on
```

### Database Backup Verification

```bash
#!/bin/bash
# verify-postgres-backup.sh

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Check file exists and is not empty
if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file missing or empty"
  exit 1
fi

# Check file size (should be > 1MB for valid backup)
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
if [ "$FILE_SIZE" -lt 1048576 ]; then
  echo "WARNING: Backup file smaller than 1MB ($FILE_SIZE bytes)"
fi

# Verify pg_dump format
if [[ "$BACKUP_FILE" == *.pgdump ]]; then
  pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✓ Backup format valid"
    
    # Show table list
    echo "Tables in backup:"
    pg_restore --list "$BACKUP_FILE" | grep "TABLE DATA" | head -10
  else
    echo "ERROR: Backup file corrupted or invalid format"
    exit 1
  fi
fi

# Verify checksums if available
CHECKSUM_FILE="${BACKUP_FILE%.*}_checksums.txt"
if [ -f "$CHECKSUM_FILE" ]; then
  sha256sum -c "$CHECKSUM_FILE"
  if [ $? -eq 0 ]; then
    echo "✓ Checksums verified"
  else
    echo "ERROR: Checksum verification failed"
    exit 1
  fi
fi

# Test restoration to temporary database
echo "Testing restoration (dry run)..."
TEST_DB="backup_verification_$(date +%s)"

# Create test database
createdb "$TEST_DB"

# Restore backup
if [[ "$BACKUP_FILE" == *.pgdump ]]; then
  pg_restore -d "$TEST_DB" "$BACKUP_FILE" 2>&1 | tee /tmp/restore_test.log
else
  gunzip -c "$BACKUP_FILE" | psql "$TEST_DB" 2>&1 | tee /tmp/restore_test.log
fi

# Verify restoration
if psql -d "$TEST_DB" -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public'" > /dev/null 2>&1; then
  echo "✓ Restoration successful"
  
  # Count records in key tables
  echo "Record counts:"
  psql -d "$TEST_DB" -c "SELECT 'blueprints' as table, COUNT(*) FROM blueprints UNION ALL SELECT 'deployments', COUNT(*) FROM deployments"
else
  echo "ERROR: Restoration failed"
  cat /tmp/restore_test.log
  dropdb "$TEST_DB"
  exit 1
fi

# Cleanup
dropdb "$TEST_DB"
rm /tmp/restore_test.log

echo "✓ Backup verification completed successfully"
```


---

## Redis Backup

### Redis Persistence Options

#### RDB (Redis Database) Snapshots

Point-in-time snapshots of dataset.

**Configuration** (`redis.conf`):

```conf
# Save snapshots
save 900 1      # After 900 sec (15 min) if at least 1 key changed
save 300 10     # After 300 sec (5 min) if at least 10 keys changed
save 60 10000   # After 60 sec if at least 10000 keys changed

# Snapshot filename
dbfilename dump.rdb

# Directory
dir /data

# Compression
rdbcompression yes

# Checksum
rdbchecksum yes
```

#### AOF (Append-Only File)

Logs every write operation.

**Configuration**:

```conf
# Enable AOF
appendonly yes
appendfilename "appendonly.aof"

# Sync policy
appendfsync everysec  # Best balance (alternatives: always, no)

# AOF rewrite
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# AOF on rewrite
no-appendfsync-on-rewrite no
```

### Redis Backup Script

```bash
#!/bin/bash
# redis-backup.sh

set -euo pipefail

BACKUP_DIR="/backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "Starting Redis backup at $TIMESTAMP"

# Trigger background save
docker exec redis redis-cli BGSAVE

# Wait for save to complete
while [ "$(docker exec redis redis-cli LASTSAVE)" == "$(docker exec redis redis-cli LASTSAVE)" ]; do
  sleep 1
done

# Copy RDB file
docker cp redis:/data/dump.rdb "$BACKUP_DIR/dump_${TIMESTAMP}.rdb"

# Copy AOF if enabled
if docker exec redis redis-cli CONFIG GET appendonly | grep -q yes; then
  docker cp redis:/data/appendonly.aof "$BACKUP_DIR/appendonly_${TIMESTAMP}.aof"
fi

# Compress backups
gzip "$BACKUP_DIR/dump_${TIMESTAMP}.rdb"
[ -f "$BACKUP_DIR/appendonly_${TIMESTAMP}.aof" ] && gzip "$BACKUP_DIR/appendonly_${TIMESTAMP}.aof"

# Calculate checksums
cd "$BACKUP_DIR"
sha256sum *_${TIMESTAMP}.* > checksums_${TIMESTAMP}.txt

# Upload to S3
aws s3 sync "$BACKUP_DIR" s3://iac-dharma-backups/redis/ \
  --exclude "*" \
  --include "*_${TIMESTAMP}*" \
  --storage-class STANDARD_IA

# Cleanup old backups
find "$BACKUP_DIR" -name "*.rdb.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.aof.gz" -mtime +$RETENTION_DAYS -delete

echo "Redis backup completed: $TIMESTAMP"
```

### Redis Restore

```bash
#!/bin/bash
# redis-restore.sh

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.rdb.gz>"
  exit 1
fi

echo "Restoring Redis from: $BACKUP_FILE"

# Stop Redis
docker-compose stop redis

# Decompress backup
gunzip -c "$BACKUP_FILE" > /tmp/dump.rdb

# Copy to Redis data directory
docker cp /tmp/dump.rdb redis:/data/dump.rdb

# Fix permissions
docker exec redis chown redis:redis /data/dump.rdb

# Start Redis
docker-compose start redis

# Verify
sleep 5
if docker exec redis redis-cli PING | grep -q PONG; then
  echo "✓ Redis restored successfully"
  
  # Show key count
  KEY_COUNT=$(docker exec redis redis-cli DBSIZE)
  echo "Keys in database: $KEY_COUNT"
else
  echo "ERROR: Redis restoration failed"
  exit 1
fi

# Cleanup
rm /tmp/dump.rdb
```

---

## Application Backup

### Configuration Files

```bash
#!/bin/bash
# backup-config.sh

set -euo pipefail

BACKUP_DIR="/backups/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_ROOT="/opt/iac-dharma"

mkdir -p "$BACKUP_DIR"

echo "Backing up configuration files at $TIMESTAMP"

# Create tarball of configuration
tar -czf "$BACKUP_DIR/config_${TIMESTAMP}.tar.gz" \
  -C "$PROJECT_ROOT" \
  .env \
  .env.production \
  .env.staging \
  docker-compose.yml \
  docker-compose.prod.yml \
  k8s/ \
  monitoring/ \
  scripts/ \
  terraform/

# Backup Kubernetes secrets (encrypted)
if command -v kubectl &> /dev/null; then
  kubectl get secrets -n iac-dharma -o yaml | \
    gpg --encrypt --recipient backup@iac-dharma.com > \
    "$BACKUP_DIR/k8s-secrets_${TIMESTAMP}.yaml.gpg"
  
  # Backup ConfigMaps
  kubectl get configmaps -n iac-dharma -o yaml > \
    "$BACKUP_DIR/k8s-configmaps_${TIMESTAMP}.yaml"
fi

# Upload to S3
aws s3 sync "$BACKUP_DIR" s3://iac-dharma-backups/config/ \
  --exclude "*" \
  --include "*_${TIMESTAMP}*"

echo "Configuration backup completed"
```

### Docker Volumes

```bash
#!/bin/bash
# backup-volumes.sh

set -euo pipefail

BACKUP_DIR="/backups/volumes"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Backing up Docker volumes at $TIMESTAMP"

# Get all IAC Dharma volumes
VOLUMES=$(docker volume ls --filter name=iac -q)

for volume in $VOLUMES; do
  echo "Backing up volume: $volume"
  
  # Create backup using temporary container
  docker run --rm \
    -v "$volume":/source:ro \
    -v "$BACKUP_DIR":/backup \
    alpine \
    tar -czf "/backup/${volume}_${TIMESTAMP}.tar.gz" -C /source .
  
  # Calculate checksum
  sha256sum "$BACKUP_DIR/${volume}_${TIMESTAMP}.tar.gz" >> "$BACKUP_DIR/checksums_${TIMESTAMP}.txt"
done

# Upload to S3
aws s3 sync "$BACKUP_DIR" s3://iac-dharma-backups/volumes/ \
  --exclude "*" \
  --include "*_${TIMESTAMP}*"

echo "Volume backup completed"
```

### Secrets Backup

```bash
#!/bin/bash
# backup-secrets.sh

set -euo pipefail

BACKUP_DIR="/backups/secrets"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
GPG_RECIPIENT="backup@iac-dharma.com"

mkdir -p "$BACKUP_DIR"

echo "Backing up secrets at $TIMESTAMP"

# Backup environment variables
cat > "/tmp/secrets_${TIMESTAMP}.txt" << EOF
# IAC Dharma Secrets Backup
# Generated: $(date)

JWT_SECRET=$JWT_SECRET
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

# Encrypt secrets
gpg --encrypt --recipient "$GPG_RECIPIENT" \
  "/tmp/secrets_${TIMESTAMP}.txt" \
  --output "$BACKUP_DIR/secrets_${TIMESTAMP}.txt.gpg"

# Remove unencrypted file
shred -u "/tmp/secrets_${TIMESTAMP}.txt"

# Backup HashiCorp Vault (if used)
if command -v vault &> /dev/null; then
  vault operator raft snapshot save "$BACKUP_DIR/vault_${TIMESTAMP}.snap"
  gpg --encrypt --recipient "$GPG_RECIPIENT" \
    "$BACKUP_DIR/vault_${TIMESTAMP}.snap"
  rm "$BACKUP_DIR/vault_${TIMESTAMP}.snap"
fi

# Upload to S3 with stricter security
aws s3 cp "$BACKUP_DIR/secrets_${TIMESTAMP}.txt.gpg" \
  "s3://iac-dharma-backups-secure/secrets/secrets_${TIMESTAMP}.txt.gpg" \
  --server-side-encryption aws:kms \
  --sse-kms-key-id alias/iac-dharma-backup-key \
  --storage-class GLACIER

echo "Secrets backup completed (encrypted)"
```

---

## File Storage Backup

### User Uploads

```bash
#!/bin/bash
# backup-uploads.sh

set -euo pipefail

SOURCE_DIR="/var/lib/iac-dharma/uploads"
BACKUP_DIR="/backups/uploads"
S3_BUCKET="s3://iac-dharma-backups/uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Backing up user uploads at $TIMESTAMP"

# Incremental backup using rsync
rsync -avz --delete \
  --backup --backup-dir="$BACKUP_DIR/incremental_${TIMESTAMP}" \
  "$SOURCE_DIR/" \
  "$BACKUP_DIR/current/"

# Create tarball of changes
if [ -d "$BACKUP_DIR/incremental_${TIMESTAMP}" ]; then
  tar -czf "$BACKUP_DIR/uploads_incremental_${TIMESTAMP}.tar.gz" \
    -C "$BACKUP_DIR" \
    "incremental_${TIMESTAMP}"
  
  # Upload incremental to S3
  aws s3 cp "$BACKUP_DIR/uploads_incremental_${TIMESTAMP}.tar.gz" \
    "$S3_BUCKET/incremental/"
fi

# Sync to S3 (continuous backup)
aws s3 sync "$SOURCE_DIR" "$S3_BUCKET/current/" \
  --delete \
  --storage-class STANDARD_IA

echo "Upload backup completed"
```

### IAC Templates

```bash
#!/bin/bash
# backup-templates.sh

TEMPLATES_DIR="/var/lib/iac-dharma/templates"
BACKUP_DIR="/backups/templates"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup templates with Git
cd "$TEMPLATES_DIR"

# Commit any changes
git add -A
git commit -m "Auto-backup: $TIMESTAMP" || true

# Create archive
git archive --format=tar.gz -o "$BACKUP_DIR/templates_${TIMESTAMP}.tar.gz" HEAD

# Push to remote
git push origin master

# Upload archive to S3
aws s3 cp "$BACKUP_DIR/templates_${TIMESTAMP}.tar.gz" \
  "s3://iac-dharma-backups/templates/"

echo "Templates backup completed"
```

---

## Kubernetes Backup

### Cluster State Backup

```bash
#!/bin/bash
# backup-k8s-cluster.sh

set -euo pipefail

BACKUP_DIR="/backups/kubernetes"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NAMESPACE="iac-dharma"

mkdir -p "$BACKUP_DIR/cluster_${TIMESTAMP}"

echo "Backing up Kubernetes cluster state at $TIMESTAMP"

# Backup all resources in namespace
for resource in deployment statefulset service configmap secret pvc ingress; do
  echo "Backing up $resource..."
  kubectl get "$resource" -n "$NAMESPACE" -o yaml > \
    "$BACKUP_DIR/cluster_${TIMESTAMP}/${resource}.yaml"
done

# Backup Custom Resource Definitions
kubectl get crd -o yaml > "$BACKUP_DIR/cluster_${TIMESTAMP}/crd.yaml"

# Backup RBAC
kubectl get clusterrole,clusterrolebinding,role,rolebinding -n "$NAMESPACE" -o yaml > \
  "$BACKUP_DIR/cluster_${TIMESTAMP}/rbac.yaml"

# Backup Network Policies
kubectl get networkpolicy -n "$NAMESPACE" -o yaml > \
  "$BACKUP_DIR/cluster_${TIMESTAMP}/networkpolicy.yaml"

# Create tarball
tar -czf "$BACKUP_DIR/k8s_cluster_${TIMESTAMP}.tar.gz" \
  -C "$BACKUP_DIR" \
  "cluster_${TIMESTAMP}"

# Upload to S3
aws s3 cp "$BACKUP_DIR/k8s_cluster_${TIMESTAMP}.tar.gz" \
  "s3://iac-dharma-backups/kubernetes/"

# Cleanup
rm -rf "$BACKUP_DIR/cluster_${TIMESTAMP}"

echo "Kubernetes backup completed"
```

### etcd Backup (for self-managed clusters)

```bash
#!/bin/bash
# backup-etcd.sh

BACKUP_DIR="/backups/etcd"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ETCDCTL_API=3

mkdir -p "$BACKUP_DIR"

# Create etcd snapshot
etcdctl snapshot save "$BACKUP_DIR/etcd_${TIMESTAMP}.db" \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

# Verify snapshot
etcdctl snapshot status "$BACKUP_DIR/etcd_${TIMESTAMP}.db"

# Upload to S3
aws s3 cp "$BACKUP_DIR/etcd_${TIMESTAMP}.db" \
  "s3://iac-dharma-backups/etcd/" \
  --storage-class STANDARD_IA

echo "etcd backup completed"
```

### Velero Backup (Recommended)

```bash
#!/bin/bash
# setup-velero.sh

# Install Velero
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket iac-dharma-velero-backups \
  --secret-file ./credentials-velero \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1 \
  --use-volume-snapshots=true

# Create backup schedule
velero schedule create iac-dharma-daily \
  --schedule="0 2 * * *" \
  --include-namespaces iac-dharma \
  --ttl 720h0m0s  # 30 days

# Create immediate backup
velero backup create iac-dharma-$(date +%Y%m%d-%H%M%S) \
  --include-namespaces iac-dharma \
  --wait

echo "Velero backup configured"
```

---

## Automated Backup

### Master Backup Script

```bash
#!/bin/bash
# master-backup.sh

set -euo pipefail

BACKUP_ROOT="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/iac-dharma/backup_${TIMESTAMP}.log"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
  log "ERROR: $1"
  # Send alert
  curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"❌ Backup failed: $1\"}"
  exit 1
}

log "Starting master backup process"

# 1. Database backup
log "Backing up PostgreSQL..."
/opt/iac-dharma/scripts/backup/postgres-logical-backup.sh || error_exit "PostgreSQL backup failed"

# 2. Redis backup
log "Backing up Redis..."
/opt/iac-dharma/scripts/backup/redis-backup.sh || error_exit "Redis backup failed"

# 3. Configuration backup
log "Backing up configuration..."
/opt/iac-dharma/scripts/backup/backup-config.sh || error_exit "Configuration backup failed"

# 4. Volume backup
log "Backing up Docker volumes..."
/opt/iac-dharma/scripts/backup/backup-volumes.sh || error_exit "Volume backup failed"

# 5. Secrets backup
log "Backing up secrets..."
/opt/iac-dharma/scripts/backup/backup-secrets.sh || error_exit "Secrets backup failed"

# 6. User uploads backup
log "Backing up user uploads..."
/opt/iac-dharma/scripts/backup/backup-uploads.sh || error_exit "Uploads backup failed"

# 7. Kubernetes backup (if applicable)
if command -v kubectl &> /dev/null; then
  log "Backing up Kubernetes cluster..."
  /opt/iac-dharma/scripts/backup/backup-k8s-cluster.sh || error_exit "Kubernetes backup failed"
fi

# 8. Generate backup report
REPORT_FILE="$BACKUP_ROOT/reports/backup_report_${TIMESTAMP}.txt"
cat > "$REPORT_FILE" << EOF
IAC Dharma Backup Report
========================
Date: $(date)
Backup ID: $TIMESTAMP

Components Backed Up:
- PostgreSQL Database
- Redis Cache
- Configuration Files
- Docker Volumes
- Secrets (encrypted)
- User Uploads
- Kubernetes Resources

Backup Locations:
- Local: $BACKUP_ROOT
- S3: s3://iac-dharma-backups/

Backup Sizes:
$(du -sh $BACKUP_ROOT/postgres $BACKUP_ROOT/redis $BACKUP_ROOT/config $BACKUP_ROOT/volumes 2>/dev/null)

Status: SUCCESS
EOF

log "Backup completed successfully"

# Send success notification
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"✅ IAC Dharma backup completed successfully: ${TIMESTAMP}\"}"

# Upload report to S3
aws s3 cp "$REPORT_FILE" "s3://iac-dharma-backups/reports/"

log "Backup process finished"
```

### Cron Configuration

```bash
# /etc/cron.d/iac-dharma-backup

# Full backup - Weekly (Sunday 3 AM)
0 3 * * 0 root /opt/iac-dharma/scripts/backup/full-backup.sh >> /var/log/iac-dharma/backup.log 2>&1

# Daily differential backup (2 AM, Mon-Sat)
0 2 * * 1-6 root /opt/iac-dharma/scripts/backup/master-backup.sh >> /var/log/iac-dharma/backup.log 2>&1

# Hourly incremental backup (database only)
0 * * * * root /opt/iac-dharma/scripts/backup/postgres-logical-backup.sh >> /var/log/iac-dharma/backup.log 2>&1

# Redis backup every 5 minutes
*/5 * * * * root /opt/iac-dharma/scripts/backup/redis-backup.sh >> /var/log/iac-dharma/backup.log 2>&1

# Configuration backup - Hourly
0 * * * * root /opt/iac-dharma/scripts/backup/backup-config.sh >> /var/log/iac-dharma/backup.log 2>&1

# Cleanup old backups - Daily at 4 AM
0 4 * * * root /opt/iac-dharma/scripts/backup/cleanup-old-backups.sh >> /var/log/iac-dharma/backup.log 2>&1

# Verify backups - Daily at 5 AM
0 5 * * * root /opt/iac-dharma/scripts/backup/verify-backups.sh >> /var/log/iac-dharma/backup.log 2>&1
```

### Systemd Timer (Alternative to Cron)

```ini
# /etc/systemd/system/iac-dharma-backup.service
[Unit]
Description=IAC Dharma Backup Service
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStart=/opt/iac-dharma/scripts/backup/master-backup.sh
User=backup
Group=backup
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/iac-dharma-backup.timer
[Unit]
Description=IAC Dharma Daily Backup Timer
Requires=iac-dharma-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Enable timer
systemctl enable iac-dharma-backup.timer
systemctl start iac-dharma-backup.timer

# Check status
systemctl status iac-dharma-backup.timer
systemctl list-timers
```


---

## Backup Storage

### Local Storage

```bash
# Directory structure
/backups/
├── postgres/
│   ├── logical/
│   ├── physical/
│   └── wal/
├── redis/
├── config/
├── volumes/
├── secrets/
├── uploads/
├── kubernetes/
└── reports/
```

### AWS S3 Configuration

```bash
# S3 bucket structure
iac-dharma-backups/
├── postgres/          # Standard-IA, 30-day retention
├── redis/             # Standard-IA, 14-day retention
├── config/            # Standard, 90-day retention
├── volumes/           # Standard-IA, 30-day retention
├── uploads/           # Standard-IA + Glacier after 90 days
├── kubernetes/        # Standard-IA, 30-day retention
└── reports/           # Standard, 365-day retention

iac-dharma-backups-secure/
└── secrets/           # Glacier Instant Retrieval, 7-year retention
```

**Lifecycle Policies**:

```json
{
  "Rules": [
    {
      "Id": "TransitionToGlacier",
      "Status": "Enabled",
      "Prefix": "uploads/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    },
    {
      "Id": "ExpireOldBackups",
      "Status": "Enabled",
      "Prefix": "postgres/",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

### Multi-Region Replication

```bash
# Enable replication to DR region
aws s3api put-bucket-replication \
  --bucket iac-dharma-backups \
  --replication-configuration file://replication.json

# replication.json
{
  "Role": "arn:aws:iam::ACCOUNT-ID:role/s3-replication-role",
  "Rules": [
    {
      "Status": "Enabled",
      "Priority": 1,
      "Filter": {
        "Prefix": ""
      },
      "Destination": {
        "Bucket": "arn:aws:s3:::iac-dharma-backups-dr",
        "StorageClass": "STANDARD_IA",
        "ReplicationTime": {
          "Status": "Enabled",
          "Time": {
            "Minutes": 15
          }
        }
      }
    }
  ]
}
```

---

## Restoration Procedures

### Database Restoration

#### From Logical Backup

```bash
#!/bin/bash
# restore-from-logical.sh

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.dump.gz.gpg>"
  exit 1
fi

echo "Restoring database from logical backup: $BACKUP_FILE"

# Download from S3 if needed
if [[ "$BACKUP_FILE" == s3://* ]]; then
  aws s3 cp "$BACKUP_FILE" /tmp/backup.dump.gz.gpg
  BACKUP_FILE="/tmp/backup.dump.gz.gpg"
fi

# Decrypt
gpg --decrypt "$BACKUP_FILE" > /tmp/backup.dump.gz

# Decompress
gunzip /tmp/backup.dump.gz

# Stop application services
docker-compose stop api-gateway orchestrator-service

# Drop existing database (CAREFUL!)
docker exec postgres psql -U iac_dharma -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='iac_dharma' AND pid <> pg_backend_pid();"
docker exec postgres dropdb -U iac_dharma iac_dharma

# Create new database
docker exec postgres createdb -U iac_dharma iac_dharma

# Restore
docker exec -i postgres pg_restore \
  -U iac_dharma \
  -d iac_dharma \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --verbose \
  < /tmp/backup.dump

# Verify restoration
RECORD_COUNT=$(docker exec postgres psql -U iac_dharma -d iac_dharma -t -c "SELECT COUNT(*) FROM blueprints;")
echo "Restored records in blueprints table: $RECORD_COUNT"

# Restart services
docker-compose start api-gateway orchestrator-service

# Cleanup
rm /tmp/backup.dump

echo "✓ Database restoration completed"
```

#### From Physical Backup

```bash
#!/bin/bash
# restore-from-physical.sh

BACKUP_DIR="$1"

if [ -z "$BACKUP_DIR" ]; then
  echo "Usage: $0 <backup_directory_or_s3_path>"
  exit 1
fi

echo "Restoring database from physical backup"

# Download from S3 if needed
if [[ "$BACKUP_DIR" == s3://* ]]; then
  mkdir -p /tmp/pg-restore
  aws s3 sync "$BACKUP_DIR" /tmp/pg-restore/
  BACKUP_DIR="/tmp/pg-restore"
fi

# Stop PostgreSQL
docker-compose stop postgres

# Clear data directory
docker volume rm iac_postgres_data

# Create new volume
docker volume create iac_postgres_data

# Extract backup to volume
docker run --rm \
  -v iac_postgres_data:/var/lib/postgresql/data \
  -v "$BACKUP_DIR":/backup \
  postgres:15-alpine \
  sh -c "cd /var/lib/postgresql/data && tar -xzf /backup/base.tar.gz"

# Fix permissions
docker run --rm \
  -v iac_postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine \
  chown -R postgres:postgres /var/lib/postgresql/data

# Start PostgreSQL in recovery mode
cat > /tmp/recovery.conf << EOF
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
recovery_target_timeline = 'latest'
EOF

docker cp /tmp/recovery.conf postgres:/var/lib/postgresql/data/

# Start PostgreSQL
docker-compose start postgres

# Wait for recovery
echo "Waiting for recovery to complete..."
sleep 10

# Verify
docker exec postgres psql -U iac_dharma -d iac_dharma -c "\dt"

echo "✓ Physical restoration completed"
```

#### Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# pitr-restore.sh

TARGET_TIME="$1"  # Format: 2024-01-15 14:30:00

if [ -z "$TARGET_TIME" ]; then
  echo "Usage: $0 'YYYY-MM-DD HH:MM:SS'"
  exit 1
fi

echo "Performing Point-in-Time Recovery to: $TARGET_TIME"

# Stop services
docker-compose down

# Restore base backup (latest before target time)
BASE_BACKUP=$(aws s3 ls s3://iac-dharma-backups/postgres/physical/ | \
  awk '{print $4}' | \
  grep -v "^$" | \
  sort -r | \
  head -n 1)

echo "Using base backup: $BASE_BACKUP"

aws s3 cp "s3://iac-dharma-backups/postgres/physical/$BASE_BACKUP" /tmp/
tar -xzf "/tmp/$BASE_BACKUP" -C /var/lib/postgresql/data/

# Download WAL files
aws s3 sync s3://iac-dharma-backups/postgres/wal/ /var/lib/postgresql/wal_archive/

# Configure recovery
cat > /var/lib/postgresql/data/recovery.conf << EOF
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL
docker-compose up -d postgres

# Monitor recovery
docker logs -f postgres &

# Wait for promotion
while ! docker exec postgres psql -U iac_dharma -c "SELECT pg_is_in_recovery();" | grep -q "f"; do
  echo "Still in recovery mode..."
  sleep 5
done

echo "✓ Point-in-Time Recovery completed to $TARGET_TIME"
```

### Application Restoration

```bash
#!/bin/bash
# restore-application.sh

BACKUP_TIMESTAMP="$1"

# Restore configuration
tar -xzf "/backups/config/config_${BACKUP_TIMESTAMP}.tar.gz" -C /opt/iac-dharma/

# Restore Docker volumes
for volume in iac_postgres_data iac_redis_data iac_uploads; do
  docker volume rm "$volume"
  docker volume create "$volume"
  
  docker run --rm \
    -v "$volume":/restore \
    -v "/backups/volumes":/backup \
    alpine \
    tar -xzf "/backup/${volume}_${BACKUP_TIMESTAMP}.tar.gz" -C /restore
done

# Restore secrets
gpg --decrypt "/backups/secrets/secrets_${BACKUP_TIMESTAMP}.txt.gpg" > /tmp/secrets.env
source /tmp/secrets.env
shred -u /tmp/secrets.env

# Restart services
docker-compose up -d

echo "✓ Application restored from backup: $BACKUP_TIMESTAMP"
```

---

## Disaster Recovery

### RTO/RPO Targets

| Scenario | RTO | RPO | Recovery Method |
|----------|-----|-----|-----------------|
| Database corruption | 1 hour | 5 minutes | PITR from WAL |
| Complete data center loss | 4 hours | 15 minutes | Multi-region failover |
| Ransomware attack | 2 hours | 1 hour | Offline backup restore |
| Accidental deletion | 30 minutes | 5 minutes | Logical backup restore |
| Hardware failure | 1 hour | Real-time | Hot standby promotion |

### Disaster Scenarios

#### Scenario 1: Database Corruption

**Detection**:
- Monitoring alerts show query errors
- Application logs show database connection failures
- Corruption detected in integrity checks

**Recovery Steps**:

```bash
# 1. Assess damage
docker exec postgres psql -U iac_dharma -d iac_dharma -c "
  SELECT datname, pg_database_size(datname) 
  FROM pg_database 
  WHERE datname = 'iac_dharma';"

# 2. Attempt pg_resetwal (last resort)
docker exec postgres pg_resetwal /var/lib/postgresql/data

# 3. If unsuccessful, restore from backup
./restore-from-logical.sh s3://iac-dharma-backups/postgres/logical/latest.dump.gz.gpg

# 4. Apply WAL logs for PITR
./pitr-restore.sh "$(date -d '5 minutes ago' '+%Y-%m-%d %H:%M:%S')"

# 5. Verify data integrity
docker exec postgres psql -U iac_dharma -d iac_dharma -c "
  SELECT COUNT(*) FROM blueprints;
  SELECT COUNT(*) FROM deployments;"

# 6. Resume operations
docker-compose start api-gateway orchestrator-service
```

**Time to Recovery**: 45-60 minutes

#### Scenario 2: Complete Data Center Loss

**Detection**:
- All monitoring endpoints unreachable
- Health checks failing
- Multi-region replication lag

**Recovery Steps**:

```bash
# 1. Activate DR site (us-west-2)
export AWS_REGION=us-west-2

# 2. Verify S3 replication status
aws s3api head-object --bucket iac-dharma-backups-dr \
  --key postgres/logical/latest.dump.gz.gpg

# 3. Launch DR infrastructure
cd terraform/dr
terraform apply -auto-approve

# 4. Restore database in DR region
./restore-from-physical.sh s3://iac-dharma-backups-dr/postgres/physical/

# 5. Update DNS to point to DR region
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://failover-to-dr.json

# 6. Promote read replica to primary
aws rds promote-read-replica --db-instance-identifier iac-dharma-dr

# 7. Verify services
curl https://api-dr.iac-dharma.com/health

# 8. Monitor and communicate status
./scripts/send-dr-notification.sh "DR site activated"
```

**Time to Recovery**: 3-4 hours

#### Scenario 3: Ransomware Attack

**Detection**:
- Encrypted files detected
- Unusual file modifications
- Ransom note found

**Recovery Steps**:

```bash
# 1. IMMEDIATELY isolate affected systems
docker-compose down
iptables -A INPUT -j DROP
iptables -A OUTPUT -j DROP

# 2. Preserve evidence
dd if=/dev/sda of=/mnt/forensics/disk-image.dd bs=4M

# 3. Identify last clean backup (check integrity)
./verify-backups.sh --before "$(date -d '24 hours ago' '+%Y-%m-%d')"

# 4. Restore from offline/immutable backup
aws s3 cp s3://iac-dharma-backups-glacier/postgres/clean-backup.tar.gz.gpg /tmp/
gpg --decrypt /tmp/clean-backup.tar.gz.gpg | tar -xz -C /var/lib/postgresql/

# 5. Scan restored systems
clamscan -r --infected --remove /opt/iac-dharma/
rkhunter --check --sk

# 6. Change ALL credentials
./rotate-all-secrets.sh

# 7. Restore services incrementally
docker-compose up -d postgres redis
# Test before proceeding
docker-compose up -d api-gateway
# Full restore after verification
docker-compose up -d

# 8. Post-incident review
./generate-security-report.sh > /tmp/incident-report-$(date +%Y%m%d).txt
```

**Time to Recovery**: 2-3 hours  
**Data Loss**: Up to 1 hour (last offline backup)

### DR Runbook Checklist

**Pre-Incident Preparation**:
- [ ] Document all passwords and access credentials
- [ ] Test DR procedures quarterly
- [ ] Maintain updated contact list
- [ ] Verify backup integrity weekly
- [ ] Ensure multi-region replication is active
- [ ] Review and update RTO/RPO targets
- [ ] Train team on DR procedures

**During Incident**:
- [ ] Declare disaster and activate DR team
- [ ] Notify stakeholders (management, customers)
- [ ] Assess scope and impact
- [ ] Execute recovery procedures
- [ ] Document all actions taken
- [ ] Verify data integrity post-recovery
- [ ] Monitor system stability

**Post-Incident**:
- [ ] Conduct post-mortem analysis
- [ ] Update DR procedures based on lessons learned
- [ ] Restore primary site capabilities
- [ ] Plan for failback to primary region
- [ ] Review and strengthen security controls
- [ ] Update documentation

---

## Testing & Verification

### Automated Backup Testing

```bash
#!/bin/bash
# test-backup-restore.sh

set -euo pipefail

echo "Starting automated backup restoration test"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_DIR="/tmp/backup-test-${TIMESTAMP}"
mkdir -p "$TEST_DIR"

# 1. Get latest backup
LATEST_BACKUP=$(aws s3 ls s3://iac-dharma-backups/postgres/logical/ | \
  sort | tail -n 1 | awk '{print $4}')

echo "Testing backup: $LATEST_BACKUP"

# 2. Download and decrypt
aws s3 cp "s3://iac-dharma-backups/postgres/logical/$LATEST_BACKUP" "$TEST_DIR/"
gpg --decrypt "$TEST_DIR/$LATEST_BACKUP" > "$TEST_DIR/test.dump.gz"
gunzip "$TEST_DIR/test.dump.gz"

# 3. Create test database
docker exec postgres psql -U iac_dharma -c "CREATE DATABASE test_restore;"

# 4. Restore to test database
docker exec -i postgres pg_restore \
  -U iac_dharma \
  -d test_restore \
  --clean \
  --if-exists \
  < "$TEST_DIR/test.dump"

# 5. Verify data integrity
PRODUCTION_COUNT=$(docker exec postgres psql -U iac_dharma -d iac_dharma -t -c "SELECT COUNT(*) FROM blueprints;")
TEST_COUNT=$(docker exec postgres psql -U iac_dharma -d test_restore -t -c "SELECT COUNT(*) FROM blueprints;")

if [ "$PRODUCTION_COUNT" -eq "$TEST_COUNT" ]; then
  echo "✓ Backup verification PASSED"
  echo "  Production records: $PRODUCTION_COUNT"
  echo "  Restored records: $TEST_COUNT"
else
  echo "✗ Backup verification FAILED"
  echo "  Production records: $PRODUCTION_COUNT"
  echo "  Restored records: $TEST_COUNT"
  exit 1
fi

# 6. Cleanup
docker exec postgres psql -U iac_dharma -c "DROP DATABASE test_restore;"
rm -rf "$TEST_DIR"

echo "Backup test completed successfully"
```

### Integrity Verification

```bash
#!/bin/bash
# verify-backup-integrity.sh

BACKUP_DIR="/backups"

echo "Verifying backup integrity"

# Check file integrity
find "$BACKUP_DIR" -name "checksums_*.txt" -mtime -1 | while read checksum_file; do
  echo "Verifying checksums in: $checksum_file"
  cd "$(dirname "$checksum_file")"
  sha256sum -c "$(basename "$checksum_file")" || echo "CHECKSUM MISMATCH!"
done

# Verify backup sizes (should be > 1MB)
find "$BACKUP_DIR" -name "*.dump.gz" -size -1M -exec echo "WARNING: Small backup detected: {}" \;

# Check backup age
LATEST_DB_BACKUP=$(find "$BACKUP_DIR/postgres" -name "*.dump.gz" -mmin -60)
if [ -z "$LATEST_DB_BACKUP" ]; then
  echo "ERROR: No recent database backup found!"
  exit 1
fi

# Verify S3 replication
aws s3api head-object --bucket iac-dharma-backups-dr \
  --key postgres/logical/latest.dump.gz.gpg \
  --query 'ReplicationStatus' \
  --output text | grep -q "COMPLETED" || echo "WARNING: S3 replication delayed"

echo "✓ Integrity verification completed"
```

---

## Monitoring

### Prometheus Metrics

```yaml
# prometheus-backup-exporter.yml
scrape_configs:
  - job_name: 'backup-metrics'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics/backup'
```

**Custom Metrics**:

```python
# backup_exporter.py
from prometheus_client import Gauge, start_http_server
import os
import time

backup_age = Gauge('backup_age_seconds', 'Age of last backup', ['type'])
backup_size = Gauge('backup_size_bytes', 'Size of last backup', ['type'])
backup_status = Gauge('backup_status', 'Status of last backup (1=success, 0=failure)', ['type'])

def collect_backup_metrics():
    backup_types = ['postgres', 'redis', 'config', 'volumes']
    
    for backup_type in backup_types:
        backup_dir = f'/backups/{backup_type}'
        latest = max(os.listdir(backup_dir), key=lambda f: os.path.getctime(f'{backup_dir}/{f}'))
        
        # Age
        age = time.time() - os.path.getctime(f'{backup_dir}/{latest}')
        backup_age.labels(type=backup_type).set(age)
        
        # Size
        size = os.path.getsize(f'{backup_dir}/{latest}')
        backup_size.labels(type=backup_type).set(size)
        
        # Status (based on age threshold)
        status = 1 if age < 3600 else 0  # 1 hour threshold
        backup_status.labels(type=backup_type).set(status)

if __name__ == '__main__':
    start_http_server(9090)
    while True:
        collect_backup_metrics()
        time.sleep(60)
```

### Alerting Rules

```yaml
# backup-alerts.yml
groups:
  - name: backup_alerts
    interval: 1m
    rules:
      - alert: BackupTooOld
        expr: backup_age_seconds{type="postgres"} > 7200
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database backup is too old"
          description: "Last PostgreSQL backup is {{ $value }} seconds old"

      - alert: BackupFailed
        expr: backup_status == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Backup failed for {{ $labels.type }}"
          description: "Last backup attempt failed"

      - alert: BackupSizeTooSmall
        expr: backup_size_bytes{type="postgres"} < 1048576
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Backup size suspiciously small"
          description: "PostgreSQL backup is only {{ $value }} bytes"

      - alert: S3ReplicationLag
        expr: s3_replication_lag_seconds > 900
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "S3 cross-region replication lagging"
          description: "Replication lag is {{ $value }} seconds"
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "IAC Dharma - Backup & Recovery",
    "panels": [
      {
        "title": "Backup Age",
        "targets": [
          {
            "expr": "backup_age_seconds",
            "legendFormat": "{{type}}"
          }
        ]
      },
      {
        "title": "Backup Success Rate (24h)",
        "targets": [
          {
            "expr": "avg_over_time(backup_status[24h])"
          }
        ]
      },
      {
        "title": "Backup Size Trends",
        "targets": [
          {
            "expr": "backup_size_bytes",
            "legendFormat": "{{type}}"
          }
        ]
      },
      {
        "title": "Restoration Test Results",
        "targets": [
          {
            "expr": "backup_test_success_total"
          }
        ]
      }
    ]
  }
}
```

---

## Best Practices

### 1. **Follow the 3-2-1-1-0 Rule**
   - Always maintain 3 copies of data
   - Store on 2 different media types
   - Keep 1 copy offsite
   - Store 1 copy offline/air-gapped
   - Verify 0 errors in backups

### 2. **Encrypt Everything**
   - Use GPG for file-level encryption
   - Enable S3 server-side encryption (SSE-KMS)
   - Encrypt backups before transmission
   - Rotate encryption keys quarterly

### 3. **Test Regularly**
   - Perform full restoration tests monthly
   - Automate integrity verification daily
   - Conduct DR drills quarterly
   - Document and time all procedures

### 4. **Automate Backup Processes**
   - Use cron jobs or systemd timers
   - Implement monitoring and alerting
   - Auto-rotate and cleanup old backups
   - Generate and review backup reports

### 5. **Maintain Multiple Backup Types**
   - Full backups weekly
   - Incremental backups hourly
   - Continuous archiving for critical data
   - Keep immutable backups for compliance

### 6. **Document Everything**
   - Maintain detailed runbooks
   - Document all credentials and access
   - Keep network diagrams updated
   - Record all recovery procedures

### 7. **Secure Backup Storage**
   - Use dedicated backup accounts
   - Implement least-privilege access
   - Enable MFA for backup access
   - Monitor for unauthorized access
   - Use immutable storage for critical backups

### 8. **Plan for Worst-Case Scenarios**
   - Assume primary site is completely unavailable
   - Prepare for multi-day outages
   - Have offline documentation accessible
   - Maintain emergency contact lists

---

## See Also

- [Disaster Recovery Plan](Disaster-Recovery)
- [Observability](Observability)
- [Security Best Practices](Security-Best-Practices)
- [Database Guide](Database-Guide)
- [Kubernetes Deployment](Kubernetes-Deployment)

---

**Last Updated**: January 2024  
**Maintained By**: Platform Engineering Team
