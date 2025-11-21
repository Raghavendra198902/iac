# Backup and Recovery

Comprehensive backup and disaster recovery strategies for IAC Dharma.

---

## Backup Strategy

### 3-2-1 Backup Rule

- **3** copies of data
- **2** different storage media
- **1** copy offsite

### Backup Types

**Full Backup**: Complete copy of all data
- Frequency: Weekly
- Retention: 4 weeks

**Incremental Backup**: Changes since last backup
- Frequency: Daily
- Retention: 7 days

**Continuous Backup**: Real-time replication
- Database streaming replication
- File system snapshots

---

## Database Backup

### PostgreSQL Backup

#### Logical Backup (pg_dump)

```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="iac_dharma"

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database dump
pg_dump -U postgres -h localhost $DB_NAME | gzip > \
  $BACKUP_DIR/iac_dharma_${TIMESTAMP}.sql.gz

# Schema-only backup
pg_dump -U postgres -h localhost --schema-only $DB_NAME > \
  $BACKUP_DIR/schema_${TIMESTAMP}.sql

# Data-only backup
pg_dump -U postgres -h localhost --data-only $DB_NAME | gzip > \
  $BACKUP_DIR/data_${TIMESTAMP}.sql.gz

# Specific tables
pg_dump -U postgres -h localhost -t blueprints -t deployments $DB_NAME | gzip > \
  $BACKUP_DIR/critical_tables_${TIMESTAMP}.sql.gz

echo "Backup completed: $TIMESTAMP"
```

#### Physical Backup (pg_basebackup)

```bash
#!/bin/bash
# physical-backup.sh

BACKUP_DIR="/backups/physical"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create base backup
pg_basebackup -U postgres -h localhost -D $BACKUP_DIR/base_${TIMESTAMP} \
  -Ft -z -P --wal-method=stream

echo "Physical backup completed: $TIMESTAMP"
```

#### Continuous Archiving (WAL)

```bash
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /backups/wal/%f && cp %p /backups/wal/%f'
archive_timeout = 300  # 5 minutes
```

### Automated Backup Script

```bash
#!/bin/bash
# automated-backup.sh

set -e

# Configuration
BACKUP_DIR="/backups"
DB_NAME="iac_dharma"
RETENTION_DAYS=30
S3_BUCKET="s3://my-backups/iac-dharma"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "Starting backup at $TIMESTAMP"

# Database backup
docker exec postgres pg_dump -U postgres $DB_NAME | gzip > \
  $BACKUP_DIR/db_${TIMESTAMP}.sql.gz

# Redis backup
docker exec redis redis-cli --rdb $BACKUP_DIR/redis_${TIMESTAMP}.rdb

# Configuration files
tar -czf $BACKUP_DIR/config_${TIMESTAMP}.tar.gz \
  .env docker-compose.yml k8s/

# Upload to S3
aws s3 sync $BACKUP_DIR $S3_BUCKET --exclude "*" --include "*${TIMESTAMP}*"

# Clean old local backups
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.rdb" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully"
```

### Cron Schedule

```bash
# /etc/cron.d/iac-dharma-backup

# Daily backup at 2 AM
0 2 * * * /opt/iac-dharma/scripts/automated-backup.sh >> /var/log/backup.log 2>&1

# Weekly full backup on Sunday at 3 AM
0 3 * * 0 /opt/iac-dharma/scripts/full-backup.sh >> /var/log/backup.log 2>&1

# Hourly incremental backup
0 * * * * /opt/iac-dharma/scripts/incremental-backup.sh >> /var/log/backup.log 2>&1
```

---

## Database Restoration

### Restore from Logical Backup

```bash
#!/bin/bash
# restore-postgres.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Stop services
docker-compose stop api-gateway blueprint-service iac-generator

# Drop existing database (CAUTION!)
docker exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS iac_dharma"

# Create new database
docker exec postgres psql -U postgres -c "CREATE DATABASE iac_dharma"

# Restore from backup
gunzip -c $BACKUP_FILE | docker exec -i postgres psql -U postgres -d iac_dharma

# Restart services
docker-compose start

echo "Restoration completed"
```

### Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# pitr-restore.sh

TARGET_TIME="2025-11-21 10:30:00"
BASE_BACKUP="/backups/physical/base_20251121_000000"
WAL_ARCHIVE="/backups/wal"

# Stop PostgreSQL
docker-compose stop postgres

# Restore base backup
rm -rf /var/lib/postgresql/data/*
tar -xzf ${BASE_BACKUP}/base.tar.gz -C /var/lib/postgresql/data/

# Configure recovery
cat > /var/lib/postgresql/data/recovery.conf << EOF
restore_command = 'cp ${WAL_ARCHIVE}/%f %p'
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL
docker-compose start postgres

echo "PITR restore initiated to ${TARGET_TIME}"
```

---

## Application State Backup

### Configuration Backup

```bash
#!/bin/bash
# backup-config.sh

BACKUP_DIR="/backups/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create archive of configuration files
tar -czf $BACKUP_DIR/config_${TIMESTAMP}.tar.gz \
  .env \
  .env.* \
  docker-compose.yml \
  k8s/ \
  monitoring/ \
  scripts/

# Backup secrets (encrypted)
kubectl get secrets -n iac-dharma -o yaml | \
  gpg --encrypt --recipient admin@example.com > \
  $BACKUP_DIR/secrets_${TIMESTAMP}.yaml.gpg

echo "Configuration backup completed"
```

### Volume Backup

```bash
#!/bin/bash
# backup-volumes.sh

BACKUP_DIR="/backups/volumes"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup Docker volumes
for volume in $(docker volume ls -q | grep iac); do
  echo "Backing up volume: $volume"
  docker run --rm -v $volume:/source -v $BACKUP_DIR:/backup \
    alpine tar -czf /backup/${volume}_${TIMESTAMP}.tar.gz -C /source .
done

echo "Volume backup completed"
```

---

## Redis Backup & Restore

### Backup

```bash
# Trigger save
docker exec redis redis-cli BGSAVE

# Copy RDB file
docker cp redis:/data/dump.rdb /backups/redis/dump_$(date +%Y%m%d_%H%M%S).rdb

# AOF backup (if enabled)
docker cp redis:/data/appendonly.aof /backups/redis/appendonly_$(date +%Y%m%d_%H%M%S).aof
```

### Restore

```bash
# Stop Redis
docker-compose stop redis

# Replace RDB file
docker cp /backups/redis/dump_20251121_120000.rdb redis:/data/dump.rdb

# Start Redis
docker-compose start redis
```

---

## Disaster Recovery Plan

### Recovery Time Objective (RTO)

Target time to restore service after disaster:
- **Critical Services**: 1 hour
- **Non-Critical Services**: 4 hours
- **Full System**: 8 hours

### Recovery Point Objective (RPO)

Maximum acceptable data loss:
- **Database**: 15 minutes (via WAL archiving)
- **Configuration**: 1 hour (via hourly backups)
- **User uploads**: 5 minutes (via continuous replication)

### DR Checklist

```markdown
## Pre-Disaster Preparation
- [ ] Backup procedures automated and tested
- [ ] Offsite backup location configured
- [ ] DR documentation up to date
- [ ] Team trained on recovery procedures
- [ ] Emergency contacts documented

## During Disaster
- [ ] Assess impact and scope
- [ ] Notify stakeholders
- [ ] Activate DR team
- [ ] Begin recovery procedures
- [ ] Document all actions

## Post-Recovery
- [ ] Verify data integrity
- [ ] Confirm all services operational
- [ ] Communicate restoration to users
- [ ] Conduct post-mortem
- [ ] Update DR procedures
```

### Disaster Scenarios

#### Scenario 1: Database Corruption

```bash
# 1. Identify corruption
SELECT * FROM pg_stat_database WHERE datname = 'iac_dharma';

# 2. Stop services
docker-compose stop

# 3. Restore from latest backup
./scripts/restore-postgres.sh /backups/db_latest.sql.gz

# 4. Verify data integrity
docker exec postgres psql -U postgres -d iac_dharma -c "SELECT COUNT(*) FROM blueprints"

# 5. Restart services
docker-compose start
```

#### Scenario 2: Complete System Failure

```bash
# 1. Provision new infrastructure
terraform apply -var="environment=dr"

# 2. Restore configurations
tar -xzf /backups/config_latest.tar.gz -C /opt/iac-dharma/

# 3. Restore database
./scripts/restore-postgres.sh /backups/db_latest.sql.gz

# 4. Restore Redis
docker cp /backups/redis/dump_latest.rdb redis:/data/dump.rdb

# 5. Restore volumes
for vol in /backups/volumes/*.tar.gz; do
  docker run --rm -v $(basename $vol .tar.gz):/target -v /backups/volumes:/backup \
    alpine tar -xzf /backup/$(basename $vol) -C /target
done

# 6. Start all services
docker-compose up -d

# 7. Verify health
./scripts/health-check.sh
```

---

## Backup Verification

### Automated Testing

```bash
#!/bin/bash
# test-backup.sh

BACKUP_FILE=$1

# Create test environment
docker-compose -f docker-compose.test.yml up -d

# Restore backup to test environment
gunzip -c $BACKUP_FILE | docker exec -i test-postgres psql -U postgres -d iac_dharma

# Run validation queries
docker exec test-postgres psql -U postgres -d iac_dharma -c "SELECT COUNT(*) FROM blueprints"
docker exec test-postgres psql -U postgres -d iac_dharma -c "SELECT COUNT(*) FROM users"

# Cleanup
docker-compose -f docker-compose.test.yml down -v

echo "Backup verification completed"
```

### Integrity Checks

```bash
# Calculate checksums
md5sum /backups/db_*.sql.gz > /backups/checksums.md5

# Verify checksums
md5sum -c /backups/checksums.md5

# Test restoration
./scripts/test-backup.sh /backups/db_latest.sql.gz
```

---

## Monitoring & Alerting

### Backup Monitoring

```yaml
# Prometheus alerts
groups:
  - name: backup
    rules:
      - alert: BackupFailed
        expr: backup_last_success_timestamp{job="iac-dharma"} < (time() - 86400)
        annotations:
          summary: "Backup has not succeeded in 24 hours"
      
      - alert: BackupSizeAnomaly
        expr: abs(backup_size_bytes - backup_size_bytes offset 1d) / backup_size_bytes > 0.5
        annotations:
          summary: "Backup size changed by more than 50%"
```

---

## Best Practices

1. **Test Restores Regularly**: Monthly restoration tests
2. **Encrypt Backups**: Use GPG or cloud encryption
3. **Verify Integrity**: Checksum validation after backup
4. **Document Everything**: Keep runbooks updated
5. **Monitor Backup Health**: Alert on failures
6. **Offsite Storage**: Store copies in different regions
7. **Retention Policy**: Balance cost with recovery needs
8. **Access Control**: Limit backup access to authorized personnel

---

Last Updated: November 21, 2025 | [Back to Home](Home)
