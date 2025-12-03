---
**Document Type**: Database Administration Guide  
**Audience**: Database Administrators, DevOps Engineers, SREs  
**Classification**: Technical - Database Operations  
**Version**: 2.0.0  
**Date**: December 3, 2025  
**Reading Time**: 35 minutes  
**Copyright**: © 2025 IAC Dharma. All rights reserved.

---

# Database Management

Comprehensive guide to PostgreSQL database administration, optimization, and management in IAC Dharma.

---

## 📋 Overview

IAC Dharma uses PostgreSQL 15 as the primary database with advanced features:

- **High Availability**: Multi-AZ deployment with automatic failover
- **Replication**: Primary + 2 read replicas + cross-region replica
- **Backup & Recovery**: Automated backups with PITR (Point-in-Time Recovery)
- **Performance Tuning**: Optimized configuration for OLTP workloads
- **Monitoring**: Comprehensive metrics and alerting

---

## 🏗️ Database Architecture

### High Availability Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    Primary Region (us-east-1)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Application Tier                                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │  App 1   │  │  App 2   │  │  App 3   │        │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘        │    │
│  └───────┼─────────────┼─────────────┼──────────────┘    │
│          │             │             │                     │
│          └─────────────┼─────────────┘                     │
│                        │                                    │
│  ┌────────────────────▼────────────────────────────────┐  │
│  │  PgBouncer Connection Pool                          │  │
│  │  Max Connections: 100                               │  │
│  │  Pool Mode: Transaction                             │  │
│  └────────────────────┬────────────────────────────────┘  │
│                        │                                    │
│  ┌────────────────────▼────────────────────────────────┐  │
│  │  RDS PostgreSQL Primary                             │  │
│  │  Instance: db.r6g.xlarge                            │  │
│  │  Storage: 500GB gp3 (3000 IOPS)                     │  │
│  │  Multi-AZ: Enabled (auto-failover)                  │  │
│  └────────────┬────────────┬────────────────────────────┘  │
│               │            │                                │
│               │            └──────────────────┐             │
│               │                               │             │
│  ┌────────────▼────────────────┐  ┌──────────▼──────────┐ │
│  │  Read Replica 1 (AZ-1)      │  │  Read Replica 2     │ │
│  │  db.r6g.large               │  │  (AZ-2)             │ │
│  │  For reporting queries      │  │  db.r6g.large       │ │
│  └─────────────────────────────┘  └─────────────────────┘ │
│                                                              │
│               │ Async Replication                           │
│               ▼                                              │
└─────────────────────────────────────────────────────────────┘
                │
                │ Cross-Region Async Replication
                ▼
┌─────────────────────────────────────────────────────────────┐
│                     DR Region (us-west-2)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cross-Region Read Replica                           │  │
│  │  db.r6g.large                                        │  │
│  │  Can be promoted to primary for DR                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Database Schemas

**Core Schemas**:
```sql
-- Application database
CREATE DATABASE iac_dharma;

-- Schemas
CREATE SCHEMA blueprints;     -- Blueprint definitions
CREATE SCHEMA deployments;    -- Deployment history
CREATE SCHEMA users;          -- User management
CREATE SCHEMA audit;          -- Audit logs
CREATE SCHEMA analytics;      -- Analytics data
CREATE SCHEMA feature_flags;  -- Feature flag state
```

---

## 🔧 Configuration & Tuning

### PostgreSQL Configuration

**Production-Optimized postgresql.conf**:
```ini
# Connection Settings
max_connections = 200
superuser_reserved_connections = 3

# Memory Settings (for 16GB RAM system)
shared_buffers = 4GB                    # 25% of RAM
effective_cache_size = 12GB             # 75% of RAM
maintenance_work_mem = 1GB
work_mem = 32MB                         # Per operation
huge_pages = try

# Checkpoint Settings
checkpoint_timeout = 15min
checkpoint_completion_target = 0.9
max_wal_size = 4GB
min_wal_size = 1GB
wal_buffers = 16MB

# Query Planner
random_page_cost = 1.1                  # For SSD
effective_io_concurrency = 200          # For SSD
default_statistics_target = 100

# Write-Ahead Log
wal_level = replica
wal_compression = on
wal_log_hints = on
max_wal_senders = 10
max_replication_slots = 10

# Logging
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000       # Log queries > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0

# Autovacuum
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = 10s
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.05
autovacuum_analyze_scale_factor = 0.05
autovacuum_vacuum_cost_delay = 2ms
autovacuum_vacuum_cost_limit = 400

# Lock Management
deadlock_timeout = 1s
max_locks_per_transaction = 64

# Performance
shared_preload_libraries = 'pg_stat_statements'
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all
```

### Connection Pooling with PgBouncer

**pgbouncer.ini**:
```ini
[databases]
iac_dharma = host=iac-dharma-primary.123456.us-east-1.rds.amazonaws.com port=5432 dbname=iac_dharma

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
max_user_connections = 100
server_idle_timeout = 600
server_lifetime = 3600
server_connect_timeout = 15
query_timeout = 0
query_wait_timeout = 120
client_idle_timeout = 0
idle_transaction_timeout = 0
pkt_buf = 4096
max_packet_size = 2147483647
listen_backlog = 128
sbuf_loopcnt = 5
suspend_timeout = 10
tcp_defer_accept = 0
tcp_socket_buffer = 0
tcp_keepalive = 1
tcp_keepcnt = 5
tcp_keepidle = 30
tcp_keepintvl = 10

# Logging
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
stats_period = 60

# Admin
admin_users = postgres, admin
```

**Docker Compose Integration**:
```yaml
pgbouncer:
  image: pgbouncer/pgbouncer:1.21
  container_name: pgbouncer
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_DBNAME: iac_dharma
    DATABASES_USER: ${DB_USER}
    DATABASES_PASSWORD: ${DB_PASSWORD}
    PGBOUNCER_POOL_MODE: transaction
    PGBOUNCER_MAX_CLIENT_CONN: 1000
    PGBOUNCER_DEFAULT_POOL_SIZE: 25
  ports:
    - "6432:6432"
  depends_on:
    - postgres
  networks:
    - iac-network
```

---

## 📊 Schema Design

### Core Tables

**Blueprints Table**:
```sql
CREATE TABLE blueprints.blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    resources JSONB NOT NULL DEFAULT '[]'::jsonb,
    variables JSONB DEFAULT '{}'::jsonb,
    created_by UUID NOT NULL REFERENCES users.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT blueprints_name_version_unique UNIQUE (name, version)
);

-- Indexes
CREATE INDEX idx_blueprints_provider ON blueprints.blueprints(provider);
CREATE INDEX idx_blueprints_status ON blueprints.blueprints(status);
CREATE INDEX idx_blueprints_created_by ON blueprints.blueprints(created_by);
CREATE INDEX idx_blueprints_created_at ON blueprints.blueprints(created_at);
CREATE INDEX idx_blueprints_resources_gin ON blueprints.blueprints USING GIN (resources);

-- Trigger for updated_at
CREATE TRIGGER update_blueprints_updated_at
    BEFORE UPDATE ON blueprints.blueprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Deployments Table**:
```sql
CREATE TABLE deployments.deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID NOT NULL REFERENCES blueprints.blueprints(id),
    environment VARCHAR(50) NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'running', 'completed', 'failed', 'rolled_back')),
    terraform_state JSONB,
    outputs JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deployed_by UUID NOT NULL REFERENCES users.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT deployments_duration_check 
        CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- Indexes
CREATE INDEX idx_deployments_blueprint_id ON deployments.deployments(blueprint_id);
CREATE INDEX idx_deployments_status ON deployments.deployments(status);
CREATE INDEX idx_deployments_environment ON deployments.deployments(environment);
CREATE INDEX idx_deployments_created_at ON deployments.deployments(created_at);
CREATE INDEX idx_deployments_deployed_by ON deployments.deployments(deployed_by);

-- Partitioning by month (for high-volume)
CREATE TABLE deployments.deployments_2025_11 PARTITION OF deployments.deployments
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

**Audit Log Table**:
```sql
CREATE TABLE audit.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users.users(id),
    resource_type VARCHAR(100),
    resource_id UUID,
    action VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit.audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit.audit_logs(resource_type, resource_id);

-- Partitioning by month
CREATE TABLE audit.audit_logs_2025_11 PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Retention policy (delete logs older than 7 years)
CREATE OR REPLACE FUNCTION audit.delete_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit.audit_logs
    WHERE created_at < NOW() - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule deletion
SELECT cron.schedule('delete-old-audit-logs', '0 3 1 * *', 'SELECT audit.delete_old_audit_logs()');
```

---

## 🚀 Performance Optimization

### Query Optimization

**Slow Query Analysis**:
```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- Queries taking > 100ms
ORDER BY total_exec_time DESC
LIMIT 20;

-- Find queries with high I/O
SELECT 
    query,
    calls,
    shared_blks_hit,
    shared_blks_read,
    (shared_blks_hit::float / NULLIF(shared_blks_hit + shared_blks_read, 0)) * 100 AS cache_hit_ratio
FROM pg_stat_statements
WHERE shared_blks_read > 1000
ORDER BY shared_blks_read DESC
LIMIT 20;
```

**Index Recommendations**:
```sql
-- Find missing indexes
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
  AND seq_tup_read / seq_scan > 10000
ORDER BY seq_tup_read DESC;

-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Vacuum & Maintenance

**Auto-Vacuum Monitoring**:
```sql
-- Check autovacuum progress
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    vacuum_count,
    autovacuum_count,
    n_dead_tup,
    n_live_tup,
    (n_dead_tup::float / NULLIF(n_live_tup, 0)) * 100 AS dead_tuple_percentage
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Manual vacuum for heavily updated tables
VACUUM ANALYZE blueprints.blueprints;
VACUUM ANALYZE deployments.deployments;
```

**Maintenance Script**:
```bash
#!/bin/bash
# db-maintenance.sh

export PGPASSWORD=$DB_PASSWORD

echo "=== Starting Database Maintenance ==="
echo "Timestamp: $(date)"

# 1. Vacuum and analyze all tables
echo "Step 1: Running VACUUM ANALYZE..."
psql -h $DB_HOST -U $DB_USER -d iac_dharma -c "VACUUM ANALYZE;"

# 2. Reindex tables with bloat
echo "Step 2: Reindexing tables..."
psql -h $DB_HOST -U $DB_USER -d iac_dharma -c "REINDEX TABLE CONCURRENTLY blueprints.blueprints;"
psql -h $DB_HOST -U $DB_USER -d iac_dharma -c "REINDEX TABLE CONCURRENTLY deployments.deployments;"

# 3. Update statistics
echo "Step 3: Updating statistics..."
psql -h $DB_HOST -U $DB_USER -d iac_dharma -c "ANALYZE;"

# 4. Check for bloat
echo "Step 4: Checking for table bloat..."
psql -h $DB_HOST -U $DB_USER -d iac_dharma <<EOF
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
EOF

echo "=== Maintenance Complete ==="
```

---

## 🔄 Replication & Failover

### Streaming Replication Setup

**Configure Primary**:
```sql
-- On primary database
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_replication_slots = 10;
ALTER SYSTEM SET hot_standby = on;

-- Create replication user
CREATE ROLE replicator WITH REPLICATION LOGIN ENCRYPTED PASSWORD 'strong_password';

-- Grant access in pg_hba.conf
-- host replication replicator 10.0.0.0/16 md5
```

**Replication Monitoring**:
```sql
-- Check replication status
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn,
    sync_state,
    pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replication_lag_bytes,
    (EXTRACT(EPOCH FROM (NOW() - backend_start)))::int AS connection_age_seconds
FROM pg_stat_replication;

-- Check replication lag in seconds
SELECT 
    NOW() - pg_last_xact_replay_timestamp() AS replication_lag;
```

**Replication Lag Alert**:
```sql
-- Create monitoring function
CREATE OR REPLACE FUNCTION check_replication_lag()
RETURNS TABLE (
    replica text,
    lag_bytes bigint,
    lag_seconds numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        client_addr::text,
        pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes,
        EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp())) AS lag_seconds
    FROM pg_stat_replication
    WHERE pg_wal_lsn_diff(sent_lsn, replay_lsn) > 10485760  -- 10MB
       OR EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp())) > 60;  -- 60 seconds
END;
$$ LANGUAGE plpgsql;
```

---

## 💾 Backup & Recovery

### Automated Backup Strategy

**AWS RDS Automated Backups**:
```hcl
resource "aws_db_instance" "primary" {
  # ... other config ...

  # Automated backups
  backup_retention_period = 30  # days
  backup_window          = "03:00-04:00"  # UTC
  maintenance_window     = "mon:04:00-mon:05:00"  # UTC
  
  # Enable automated backups
  skip_final_snapshot = false
  final_snapshot_identifier = "iac-dharma-final-snapshot-${timestamp()}"
  
  # Copy backups to another region
  copy_tags_to_snapshot = true
  
  # Point-in-Time Recovery
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
}
```

### Manual Backup

**pg_dump Backup**:
```bash
#!/bin/bash
# manual-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_HOST="localhost"
DB_NAME="iac_dharma"
DB_USER="postgres"

# Full database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --format=custom \
    --compress=9 \
    --verbose \
    --file="$BACKUP_DIR/full_backup_$TIMESTAMP.dump"

# Schema-only backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --schema-only \
    --file="$BACKUP_DIR/schema_backup_$TIMESTAMP.sql"

# Specific schema backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --schema=blueprints \
    --format=custom \
    --file="$BACKUP_DIR/blueprints_backup_$TIMESTAMP.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/full_backup_$TIMESTAMP.dump" \
    s3://iac-dharma-backups/postgresql/manual/ \
    --storage-class STANDARD_IA

echo "Backup completed: full_backup_$TIMESTAMP.dump"
```

### Point-in-Time Recovery (PITR)

**Restore to Specific Time**:
```bash
# Restore RDS to specific point in time
aws rds restore-db-instance-to-point-in-time \
    --source-db-instance-identifier iac-dharma-primary \
    --target-db-instance-identifier iac-dharma-restored \
    --restore-time 2025-11-21T10:30:00Z \
    --db-subnet-group-name default \
    --publicly-accessible false \
    --multi-az true
```

---

## 📈 Monitoring & Alerting

### Key Metrics

**Database Metrics to Monitor**:
```yaml
database_metrics:
  performance:
    - cpu_utilization (target: < 70%)
    - freeable_memory (target: > 2GB)
    - database_connections (target: < 150/200)
    - read_latency (target: < 10ms)
    - write_latency (target: < 20ms)
  
  replication:
    - replica_lag (target: < 30 seconds)
    - replication_bytes_behind (target: < 10MB)
  
  storage:
    - free_storage_space (target: > 50GB)
    - disk_queue_depth (target: < 10)
    - iops_utilization (target: < 80%)
  
  queries:
    - slow_queries (queries > 1 second)
    - deadlocks
    - temp_file_usage
```

**Prometheus Queries**:
```yaml
# Database connections
- name: database_connections
  query: pg_stat_database_numbackends{datname="iac_dharma"}

# Query duration
- name: query_duration_95th_percentile
  query: histogram_quantile(0.95, rate(pg_stat_statements_mean_exec_time_seconds_bucket[5m]))

# Cache hit ratio
- name: cache_hit_ratio
  query: |
    (sum(pg_stat_database_blks_hit{datname="iac_dharma"}) / 
     (sum(pg_stat_database_blks_hit{datname="iac_dharma"}) + 
      sum(pg_stat_database_blks_read{datname="iac_dharma"}))) * 100
```

---

## 🔍 Troubleshooting

### Common Issues

**High Connection Count**:
```sql
-- Check current connections
SELECT 
    datname,
    count(*) AS connections,
    max_connections
FROM pg_stat_activity, 
     (SELECT setting::int AS max_connections FROM pg_settings WHERE name = 'max_connections') s
WHERE datname IS NOT NULL
GROUP BY datname, max_connections;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < NOW() - INTERVAL '10 minutes';
```

**Lock Contention**:
```sql
-- Check for locks
SELECT 
    l.locktype,
    l.database,
    l.relation::regclass,
    l.mode,
    l.granted,
    a.usename,
    a.query,
    a.query_start
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE NOT l.granted
ORDER BY l.relation;

-- Kill blocking query
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid IN (
    SELECT blocking.pid
    FROM pg_locks blocked
    JOIN pg_locks blocking ON blocking.locktype = blocked.locktype
    WHERE NOT blocked.granted
      AND blocking.granted
);
```

---

## 📚 Related Documentation

- [Backup and Recovery](Backup-and-Recovery) - Backup strategies
- [Disaster Recovery](Disaster-Recovery) - DR procedures
- [Performance Tuning](Performance-Tuning) - Performance optimization
- [Observability](Observability) - Database monitoring

---

**Next Steps**: Explore [Performance Tuning](Performance-Tuning) for advanced optimization techniques.
