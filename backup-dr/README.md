# Backup and Disaster Recovery

This directory contains automated backup and disaster recovery infrastructure for the Dharma IAC Platform.

## Overview

The backup and DR system provides:
- **Automated Daily Backups**: PostgreSQL database backups with encryption
- **Secure Storage**: AES-256-CBC encrypted backups stored in S3
- **Retention Management**: 30-day automated retention with lifecycle policies
- **Disaster Recovery**: Comprehensive DR procedures with defined RTO/RPO
- **Verification**: Daily backup integrity testing
- **Monitoring**: Integration with Prometheus for backup metrics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────┐      │
│  │  Backup CronJob  │         │ Verification CronJob│      │
│  │  (Daily 2 AM)    │         │  (Daily 4 AM)       │      │
│  └────────┬─────────┘         └──────────┬──────────┘      │
│           │                               │                  │
│           │  1. pg_dump                   │ 5. Verify        │
│           │  2. gzip                      │    checksum      │
│           │  3. encrypt                   │    & decrypt     │
│           │  4. S3 upload                 │                  │
│           │                               │                  │
│  ┌────────▼───────────────────────────────▼──────────┐      │
│  │           PostgreSQL Database                      │      │
│  └────────────────────────────────────────────────────┘      │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    AWS S3 Bucket     │
                 │  dharma-backups/     │
                 │   - Primary (us-west-2)
                 │   - DR (us-east-1)   │
                 └──────────────────────┘
```

## Components

### 1. Backup Scripts (`scripts/`)

#### `backup-database.sh` (450 lines)
Comprehensive backup automation script with:
- PostgreSQL pg_dump with optimal flags
- gzip level 9 compression (~80-90% size reduction)
- AES-256-CBC encryption with PBKDF2
- SHA-256 checksum generation
- S3 upload with STANDARD_IA storage class
- 30-day retention enforcement
- Backup verification (checksum + decryption test)
- Multi-channel alerting (Slack + email)
- Comprehensive logging

**Usage**:
```bash
# Set environment variables
export DB_HOST=postgres.dharma
export DB_PORT=5432
export DB_NAME=dharma
export DB_USER=postgres
export DB_PASSWORD=your_password
export S3_BUCKET=dharma-backups
export ENCRYPTION_KEY_FILE=/etc/backup/encryption.key

# Run backup
./scripts/backup-database.sh
```

#### `restore-database.sh` (400 lines)
Interactive restoration tool with:
- S3 backup listing with metadata
- Interactive restoration wizard
- Pre-restore safety backup
- Integrity verification (checksum)
- Decryption and decompression
- Connection termination before restore
- Post-restore verification
- Multiple usage modes

**Usage**:
```bash
# List available backups
./scripts/restore-database.sh --list

# Interactive restoration
./scripts/restore-database.sh --interactive

# Restore specific backup
./scripts/restore-database.sh --backup dharma_dharma_20251116_020000.sql.gz.enc
```

#### `verify-backups.sh` (200 lines)
Daily backup verification with:
- S3 connectivity testing
- Backup age verification
- Checksum validation
- Decryption testing
- Backup count verification
- Automated reporting

**Usage**:
```bash
./scripts/verify-backups.sh
```

### 2. Kubernetes Manifests (`k8s/`)

#### `backup-cronjobs.yml`
Defines two CronJobs:

**Backup CronJob**:
- **Schedule**: Daily at 2 AM (`0 2 * * *`)
- **Image**: `postgres:15-alpine` with aws-cli and openssl
- **Resources**: 250m CPU, 512Mi RAM (request) / 1 CPU, 2Gi RAM (limit)
- **Volumes**:
  - ConfigMap: backup scripts
  - Secret: encryption key
  - EmptyDir: temporary backup storage
- **Service Account**: backup-service-account with S3 permissions

**Verification CronJob**:
- **Schedule**: Daily at 4 AM (`0 4 * * *`) - 2 hours after backup
- **Purpose**: Verify backup integrity
- **Resources**: 100m CPU, 256Mi RAM (request) / 500m CPU, 512Mi RAM (limit)

**RBAC Configuration**:
- ServiceAccount: `backup-service-account`
- Role: Read pods/logs, read secrets
- RoleBinding: Grants permissions to ServiceAccount

#### `backup-configmap.yml`
Contains:
- **ConfigMap**: All backup scripts (backup, restore, verify)
- **Secrets**:
  - `postgres-credentials`: Database username/password
  - `aws-credentials`: AWS access keys for S3
  - `backup-encryption-key`: AES-256 encryption key
  - `backup-notifications`: Slack webhook URL

### 3. Documentation

#### `DISASTER-RECOVERY-PLAN.md` (850 lines)
Comprehensive DR documentation including:

**Recovery Objectives**:
- **RTO**: 2-6 hours depending on scenario
- **RPO**: 24 hours for database, 0 for configuration

**Disaster Scenarios**:
1. **Database Corruption/Loss** (RTO: 2 hours)
   - Assessment and backup selection
   - Database restoration
   - Service restart and verification

2. **Complete Kubernetes Cluster Failure** (RTO: 4 hours)
   - New cluster provisioning with Terraform
   - Infrastructure deployment
   - Secret restoration
   - Database restoration
   - Application deployment

3. **AWS Region Failure** (RTO: 6 hours)
   - DR region activation
   - Cross-region backup restoration
   - DNS failover
   - Application deployment

4. **Data Corruption (Logical)** (RTO: 2 hours)
   - Corruption timeframe identification
   - Point-in-time recovery
   - Selective data restoration

5. **Complete Infrastructure Loss** (RTO: 8 hours)
   - AWS account bootstrap
   - Complete infrastructure rebuild
   - Cross-region backup restoration

**Testing Schedule**:
- **Weekly**: Automated backup verification
- **Monthly**: Full DR drill (first Saturday at 10 AM)
- **Quarterly**: Regional failover test

**Monitoring & Alerting**:
- BackupFailed alert (24 hours)
- BackupOld alert (48 hours)
- BackupSizeAnomaly alert
- NoRecentDRTest alert (30 days)

## Deployment

### 1. Prerequisites

**AWS Resources**:
```bash
# Create S3 buckets
aws s3 mb s3://dharma-backups --region us-west-2
aws s3 mb s3://dharma-backups-dr --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket dharma-backups \
  --versioning-configuration Status=Enabled

# Configure lifecycle policy (30-day retention)
aws s3api put-bucket-lifecycle-configuration \
  --bucket dharma-backups \
  --lifecycle-configuration file://s3-lifecycle.json
```

**S3 Lifecycle Policy** (`s3-lifecycle.json`):
```json
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "database/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "TransitionToGlacier",
      "Status": "Enabled",
      "Prefix": "database/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

**Encryption Key**:
```bash
# Generate encryption key
openssl rand -base64 32 > encryption.key

# Create Kubernetes secret
kubectl create secret generic backup-encryption-key \
  --from-file=encryption.key=encryption.key \
  -n dharma
```

**IAM Permissions**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::dharma-backups/*",
        "arn:aws:s3:::dharma-backups"
      ]
    }
  ]
}
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace dharma

# Deploy ConfigMap with scripts
kubectl apply -f k8s/backup-configmap.yml

# Deploy CronJobs
kubectl apply -f k8s/backup-cronjobs.yml

# Verify deployment
kubectl get cronjobs -n dharma
kubectl get secrets -n dharma
kubectl get configmaps -n dharma
```

### 3. Update Secrets

**IMPORTANT**: Update placeholder secrets with actual values:

```bash
# Database credentials
kubectl create secret generic postgres-credentials \
  --from-literal=username=postgres \
  --from-literal=password=YOUR_ACTUAL_PASSWORD \
  -n dharma --dry-run=client -o yaml | kubectl apply -f -

# AWS credentials
kubectl create secret generic aws-credentials \
  --from-literal=access-key-id=YOUR_ACCESS_KEY \
  --from-literal=secret-access-key=YOUR_SECRET_KEY \
  -n dharma --dry-run=client -o yaml | kubectl apply -f -

# Slack webhook (optional)
kubectl create secret generic backup-notifications \
  --from-literal=slack-webhook-url=YOUR_WEBHOOK_URL \
  -n dharma --dry-run=client -o yaml | kubectl apply -f -
```

### 4. Manual Backup Trigger

```bash
# Trigger backup immediately
kubectl create job --from=cronjob/database-backup \
  manual-backup-$(date +%s) -n dharma

# Watch job progress
kubectl logs -f job/manual-backup-XXXXX -n dharma
```

## Monitoring

### Prometheus Metrics

Add to `prometheus.yml`:
```yaml
- job_name: 'backup-jobs'
  kubernetes_sd_configs:
    - role: pod
      namespaces:
        names:
          - dharma
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      regex: database-backup
      action: keep
```

### Grafana Dashboard

Create dashboard with panels:
- **Backup Status**: Last successful backup timestamp
- **Backup Size**: Trend over time
- **Backup Duration**: Execution time tracking
- **Failure Rate**: Failed backup percentage
- **Storage Usage**: S3 bucket size

### Alert Rules

Add to `prometheus-rules.yml`:
```yaml
groups:
  - name: backup_alerts
    rules:
      - alert: BackupFailed
        expr: time() - backup_last_success_timestamp > 86400
        for: 1h
        severity: critical
        annotations:
          summary: "Database backup has not completed in 24 hours"
          
      - alert: BackupOld
        expr: time() - backup_last_success_timestamp > 172800
        severity: critical
        annotations:
          summary: "Database backup is over 48 hours old"
```

## Testing

### 1. Backup Verification (Automated)

```bash
# Run verification script
kubectl create job --from=cronjob/backup-verification \
  manual-verify-$(date +%s) -n dharma

# Check results
kubectl logs -f job/manual-verify-XXXXX -n dharma
```

**Expected Output**:
```
[2025-11-16 04:00:00] Starting backup verification
[2025-11-16 04:00:01] ✓ S3 bucket accessible
[2025-11-16 04:00:02] ✓ Latest backup found: dharma_dharma_20251116_020000.sql.gz.enc
[2025-11-16 04:00:03] ✓ Backup is fresh (2 hours old)
[2025-11-16 04:00:05] ✓ Checksum verification passed
[2025-11-16 04:00:07] ✓ Decryption test passed
[2025-11-16 04:00:08] Tests passed: 5, Tests failed: 0
[2025-11-16 04:00:08] ✓ All verification tests passed
```

### 2. Restoration Test (Monthly)

```bash
# Create test database
kubectl exec -it postgres-0 -n dharma -- createdb dharma_test

# Restore to test database
export DB_NAME=dharma_test
./scripts/restore-database.sh --interactive

# Verify restoration
kubectl exec -it postgres-0 -n dharma -- \
  psql -d dharma_test -c "SELECT COUNT(*) FROM users"

# Cleanup
kubectl exec -it postgres-0 -n dharma -- dropdb dharma_test
```

### 3. DR Drill (Quarterly)

Follow complete DR drill procedure from `DISASTER-RECOVERY-PLAN.md`:
1. Provision temporary test environment
2. Restore latest production backup
3. Verify all services functional
4. Run smoke tests
5. Document issues and timing
6. Destroy test environment

## Backup Format

### File Naming Convention
```
dharma_<database>_<YYYYMMDD>_<HHMMSS>.sql.gz.enc
dharma_<database>_<YYYYMMDD>_<HHMMSS>.sql.gz.enc.sha256
dharma_<database>_<YYYYMMDD>_<HHMMSS>.sql.gz.enc.meta
```

### Example
```
dharma_dharma_20251116_020000.sql.gz.enc       # Encrypted backup
dharma_dharma_20251116_020000.sql.gz.enc.sha256 # SHA-256 checksum
dharma_dharma_20251116_020000.sql.gz.enc.meta   # Metadata JSON
```

### Metadata Format
```json
{
  "timestamp": "2025-11-16T02:00:00Z",
  "database": "dharma",
  "size_bytes": 12345678,
  "compressed_size": 2345678,
  "encrypted": true,
  "encryption_algorithm": "aes-256-cbc",
  "retention_days": 30,
  "backup_type": "full"
}
```

## Troubleshooting

### Backup Fails

**Symptom**: CronJob shows failed status
```bash
kubectl get cronjobs -n dharma
kubectl logs -f cronjob/database-backup -n dharma
```

**Common Issues**:
1. **Database connection failed**:
   ```bash
   # Check database pod
   kubectl get pods -n dharma -l app=postgres
   
   # Test connectivity
   kubectl exec -it postgres-0 -n dharma -- pg_isready
   ```

2. **S3 upload failed**:
   ```bash
   # Check AWS credentials
   kubectl get secret aws-credentials -n dharma -o yaml
   
   # Test S3 access
   kubectl run -it --rm aws-cli --image=amazon/aws-cli \
     --env AWS_ACCESS_KEY_ID=XXX \
     --env AWS_SECRET_ACCESS_KEY=YYY \
     -- s3 ls s3://dharma-backups/
   ```

3. **Encryption key missing**:
   ```bash
   # Check encryption key secret
   kubectl get secret backup-encryption-key -n dharma
   
   # Recreate if missing
   openssl rand -base64 32 > encryption.key
   kubectl create secret generic backup-encryption-key \
     --from-file=encryption.key -n dharma
   ```

### Restoration Fails

**Symptom**: Restoration script errors
```bash
./scripts/restore-database.sh --list
```

**Common Issues**:
1. **Cannot download from S3**:
   ```bash
   # Check S3 bucket and credentials
   aws s3 ls s3://dharma-backups/database/
   ```

2. **Decryption fails**:
   ```bash
   # Verify encryption key
   cat /etc/backup/encryption.key
   
   # Test decryption manually
   openssl enc -d -aes-256-cbc -pbkdf2 \
     -in backup.sql.gz.enc \
     -pass file:/etc/backup/encryption.key \
     | head -c 100
   ```

3. **Database connection during restore**:
   ```bash
   # Check for active connections
   psql -h postgres.dharma -U postgres -d dharma -c \
     "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='dharma'"
   
   # Terminate connections
   psql -h postgres.dharma -U postgres -d postgres -c \
     "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='dharma'"
   ```

## Performance Considerations

### Backup Duration
- **Small databases (< 1 GB)**: 2-5 minutes
- **Medium databases (1-10 GB)**: 10-30 minutes
- **Large databases (> 10 GB)**: 1-2 hours

### Storage Costs
- **S3 STANDARD_IA**: $0.0125 per GB/month
- **30-day retention (10 GB database)**: ~$3.75/month
- **Cross-region replication**: Additional $0.02 per GB

### Network Bandwidth
- **Backup upload**: ~50-100 Mbps
- **Restoration download**: ~100-200 Mbps

## Security

### Encryption
- **Algorithm**: AES-256-CBC with PBKDF2 key derivation
- **Key Storage**: Kubernetes Secret with 600 permissions
- **Key Rotation**: Manual (recommended every 90 days)

### Access Control
- **S3 Bucket**: Private with IAM-based access only
- **Encryption Key**: Accessible only to backup ServiceAccount
- **Database Credentials**: Stored in Kubernetes Secrets

### Audit Logging
- All backup operations logged to `/var/log/database-backup.log`
- S3 access logged via CloudTrail
- Kubernetes events tracked

## Future Enhancements

- [ ] Point-in-time recovery (PITR) with WAL archiving
- [ ] Incremental backups for large databases
- [ ] Multi-database backup support
- [ ] Automated DR failover with Route53
- [ ] Backup compression improvements (zstd)
- [ ] Backup encryption key rotation automation
- [ ] Web UI for backup management
- [ ] Backup performance metrics dashboard

## References

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Backup Best Practices](https://aws.amazon.com/s3/backup/)
- [Kubernetes CronJob Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
- [Disaster Recovery Plan Template](DISASTER-RECOVERY-PLAN.md)

## Support

For issues or questions:
- **DevOps Team**: devops-team@dharma.example.com
- **On-Call**: ops-oncall@dharma.example.com
- **Documentation**: [Internal Wiki](https://wiki.dharma.internal/backup-dr)
