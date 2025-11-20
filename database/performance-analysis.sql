-- Database Performance Analysis for IAC Dharma Platform
-- Run this script to identify slow queries and optimization opportunities

\timing on
\x auto

\echo '======================================'
\echo 'IAC Dharma - Database Performance Analysis'
\echo '======================================'
\echo ''

-- 1. Enable pg_stat_statements if not already enabled
\echo '1. Checking pg_stat_statements extension...'
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. Database size and statistics
\echo ''
\echo '2. Database Size:'
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();

-- 3. Table sizes
\echo ''
\echo '3. Top 10 Largest Tables:'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                   pg_relation_size(schemaname||'.'||tablename)) AS index_size,
    pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC
LIMIT 10;

-- 4. Slowest queries (if pg_stat_statements is enabled)
\echo ''
\echo '4. Top 10 Slowest Queries (by average execution time):'
SELECT 
    ROUND(mean_exec_time::numeric, 2) as avg_ms,
    ROUND(total_exec_time::numeric, 2) as total_ms,
    calls,
    ROUND((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS percentage,
    LEFT(query, 100) as query_preview
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 5. Most frequently executed queries
\echo ''
\echo '5. Top 10 Most Frequently Executed Queries:'
SELECT 
    calls,
    ROUND(mean_exec_time::numeric, 2) as avg_ms,
    ROUND(total_exec_time::numeric, 2) as total_ms,
    LEFT(query, 100) as query_preview
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 10;

-- 6. Index usage statistics
\echo ''
\echo '6. Unused or Rarely Used Indexes (potential candidates for removal):'
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND idx_scan < 100  -- Less than 100 scans
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC
LIMIT 15;

-- 7. Tables without indexes (excluding very small tables)
\echo ''
\echo '7. Tables Without Indexes (size > 1MB):'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.schemaname = i.schemaname AND t.tablename = i.tablename
WHERE t.schemaname = 'public'
    AND i.indexname IS NULL
    AND pg_total_relation_size(t.schemaname||'.'||t.tablename) > 1048576  -- 1MB
ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;

-- 8. Sequential scans on large tables
\echo ''
\echo '8. Tables with High Sequential Scan Ratios (may need indexes):'
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    CASE 
        WHEN seq_scan > 0 THEN 
            ROUND((100.0 * seq_scan / (seq_scan + COALESCE(idx_scan, 0)))::numeric, 2)
        ELSE 0
    END AS seq_scan_percentage,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND seq_scan > 0
    AND pg_total_relation_size(schemaname||'.'||tablename) > 1048576  -- 1MB
ORDER BY seq_scan DESC
LIMIT 10;

-- 9. Missing indexes based on foreign keys
\echo ''
\echo '9. Foreign Keys Without Indexes (should have indexes for JOIN performance):'
SELECT 
    c.conrelid::regclass AS table_name,
    STRING_AGG(a.attname, ', ') AS column_names,
    c.confrelid::regclass AS referenced_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
LEFT JOIN pg_index i ON i.indrelid = c.conrelid 
    AND (c.conkey::int[] <@ i.indkey::int[])
WHERE c.contype = 'f'
    AND c.connamespace = 'public'::regnamespace
    AND i.indexrelid IS NULL
GROUP BY c.conrelid, c.confrelid, c.conname;

-- 10. Table and index bloat estimation
\echo ''
\echo '10. Table Bloat Estimation (tables that may need VACUUM FULL):'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    n_live_tup,
    n_dead_tup,
    CASE 
        WHEN n_live_tup > 0 THEN 
            ROUND((100.0 * n_dead_tup / (n_live_tup + n_dead_tup))::numeric, 2)
        ELSE 0
    END AS dead_tuple_percentage,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_dead_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 10;

-- 11. Connection statistics
\echo ''
\echo '11. Current Database Connections:'
SELECT 
    datname,
    count(*) as connections,
    count(*) FILTER (WHERE state = 'active') as active,
    count(*) FILTER (WHERE state = 'idle') as idle,
    count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY datname;

-- 12. Long-running queries (if any)
\echo ''
\echo '12. Currently Running Queries (>1 second):'
SELECT 
    pid,
    now() - query_start AS duration,
    state,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE state = 'active'
    AND datname = current_database()
    AND query NOT LIKE '%pg_stat_activity%'
    AND now() - query_start > interval '1 second'
ORDER BY duration DESC;

-- 13. Cache hit ratio (should be >99%)
\echo ''
\echo '13. Buffer Cache Hit Ratio (target: >99%):'
SELECT 
    ROUND((sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0))::numeric, 2) as cache_hit_ratio_percentage
FROM pg_stat_database
WHERE datname = current_database();

-- 14. Transaction statistics
\echo ''
\echo '14. Transaction Statistics:'
SELECT 
    datname,
    xact_commit as commits,
    xact_rollback as rollbacks,
    CASE 
        WHEN (xact_commit + xact_rollback) > 0 THEN
            ROUND((100.0 * xact_rollback / (xact_commit + xact_rollback))::numeric, 2)
        ELSE 0
    END as rollback_percentage,
    conflicts,
    deadlocks
FROM pg_stat_database
WHERE datname = current_database();

\echo ''
\echo '======================================'
\echo 'Performance Analysis Complete'
\echo '======================================'
\echo ''
\echo 'Recommendations based on analysis:'
\echo '1. Add indexes for foreign keys without indexes'
\echo '2. Review tables with high sequential scan ratios'
\echo '3. Run VACUUM ANALYZE on tables with high dead tuple percentage'
\echo '4. Consider removing unused indexes to reduce write overhead'
\echo '5. Monitor cache hit ratio and increase shared_buffers if needed'
\echo '6. Review slow queries and optimize with EXPLAIN ANALYZE'
\echo ''
