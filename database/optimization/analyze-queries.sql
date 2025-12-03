-- Slow Query Analysis Script
-- Purpose: Identify slow queries and provide optimization recommendations
-- Run: psql -h localhost -p 5432 -U postgres -d iac_db -f database/optimization/analyze-queries.sql

\timing on
\echo '🔍 Analyzing Database Performance...'
\echo ''

-- =====================================================
-- PART 1: TOP 20 SLOWEST QUERIES
-- =====================================================

\echo '📊 Top 20 Slowest Queries (by mean execution time):'
\echo ''

SELECT
    calls,
    ROUND(mean_exec_time::numeric, 2) as "Avg Time (ms)",
    ROUND(total_exec_time::numeric, 2) as "Total Time (ms)",
    ROUND((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) as "% Total Time",
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

\echo ''

-- =====================================================
-- PART 2: MOST FREQUENTLY CALLED QUERIES
-- =====================================================

\echo '📊 Top 20 Most Frequently Called Queries:'
\echo ''

SELECT
    calls,
    ROUND(mean_exec_time::numeric, 2) as "Avg Time (ms)",
    ROUND(total_exec_time::numeric, 2) as "Total Time (ms)",
    query
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;

\echo ''

-- =====================================================
-- PART 3: QUERIES WITH HIGHEST I/O
-- =====================================================

\echo '📊 Top 20 Queries by I/O (disk reads):'
\echo ''

SELECT
    calls,
    ROUND(mean_exec_time::numeric, 2) as "Avg Time (ms)",
    shared_blks_hit as "Cache Hits",
    shared_blks_read as "Disk Reads",
    ROUND((100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0))::numeric, 2) as "Cache Hit %",
    query
FROM pg_stat_statements
WHERE shared_blks_read > 0
ORDER BY shared_blks_read DESC
LIMIT 20;

\echo ''

-- =====================================================
-- PART 4: MISSING INDEXES (Sequential Scans)
-- =====================================================

\echo '📊 Tables with High Sequential Scan Count:'
\echo ''

SELECT
    schemaname,
    tablename,
    seq_scan as "Seq Scans",
    seq_tup_read as "Rows Read",
    idx_scan as "Index Scans",
    CASE 
        WHEN seq_scan > 0 THEN ROUND((100.0 * idx_scan / (seq_scan + idx_scan))::numeric, 2)
        ELSE 100.0
    END as "Index Usage %",
    n_live_tup as "Rows"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 1000
ORDER BY seq_scan DESC
LIMIT 20;

\echo ''
\echo '💡 Recommendation: Tables with high sequential scans may benefit from indexes'
\echo ''

-- =====================================================
-- PART 5: UNUSED INDEXES
-- =====================================================

\echo '📊 Potentially Unused Indexes:'
\echo ''

SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as "Times Used",
    pg_size_pretty(pg_relation_size(indexrelid)) as "Index Size"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan < 50
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

\echo ''
\echo '💡 Recommendation: Consider dropping indexes that are rarely used'
\echo ''

-- =====================================================
-- PART 6: TABLE SIZES AND BLOAT
-- =====================================================

\echo '📊 Table Sizes and Bloat:'
\echo ''

SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Total Size",
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "Table Size",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as "Indexes Size",
    n_live_tup as "Live Rows",
    n_dead_tup as "Dead Rows",
    ROUND((100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0))::numeric, 2) as "Dead Rows %"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''
\echo '💡 Recommendation: Run VACUUM on tables with high dead row percentage'
\echo ''

-- =====================================================
-- PART 7: CACHE HIT RATIO
-- =====================================================

\echo '📊 Database Cache Hit Ratio:'
\echo ''

SELECT
    'Cache Hit Ratio' as "Metric",
    ROUND((100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0))::numeric, 2) as "Percentage"
FROM pg_stat_database
WHERE datname = current_database();

\echo ''
\echo '💡 Target: >90% cache hit ratio (increase shared_buffers if lower)'
\echo ''

-- =====================================================
-- PART 8: CONNECTION POOLING STATISTICS
-- =====================================================

\echo '📊 Active Database Connections:'
\echo ''

SELECT
    state,
    COUNT(*) as "Count",
    MAX(EXTRACT(EPOCH FROM (NOW() - query_start))) as "Max Duration (sec)"
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY COUNT(*) DESC;

\echo ''

SELECT
    'Total Connections' as "Metric",
    COUNT(*) as "Value"
FROM pg_stat_activity
WHERE datname = current_database();

\echo ''
\echo '💡 Recommendation: Use PgBouncer to pool connections (target: <25 active connections)'
\echo ''

-- =====================================================
-- PART 9: LOCK CONTENTION
-- =====================================================

\echo '📊 Lock Contention:'
\echo ''

SELECT
    pg_stat_activity.pid,
    pg_class.relname as "Table",
    pg_locks.mode as "Lock Mode",
    pg_locks.granted as "Granted",
    pg_stat_activity.query,
    EXTRACT(EPOCH FROM (NOW() - pg_stat_activity.query_start)) as "Duration (sec)"
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
WHERE pg_locks.mode IS NOT NULL
  AND pg_stat_activity.datname = current_database()
ORDER BY pg_stat_activity.query_start
LIMIT 20;

\echo ''
\echo '💡 Recommendation: Minimize long-running transactions and exclusive locks'
\echo ''

-- =====================================================
-- PART 10: RECOMMENDATIONS SUMMARY
-- =====================================================

\echo ''
\echo '✅ Analysis Complete!'
\echo ''
\echo '📋 Optimization Checklist:'
\echo '   □ Review slow queries (>100ms avg)'
\echo '   □ Add indexes for high sequential scan tables'
\echo '   □ Drop unused indexes'
\echo '   □ Run VACUUM on tables with >10% dead rows'
\echo '   □ Optimize queries with low cache hit ratio'
\echo '   □ Monitor connection pool usage'
\echo '   □ Review lock contention'
\echo ''
\echo '📚 Query Optimization Tips:'
\echo '   1. Use EXPLAIN ANALYZE to understand query plans'
\echo '   2. Add covering indexes for common WHERE/JOIN clauses'
\echo '   3. Use partial indexes for filtered queries'
\echo '   4. Avoid N+1 queries (use JOIN or batch fetching)'
\echo '   5. Cache expensive queries in Redis'
\echo '   6. Use pagination for large result sets'
\echo '   7. Keep transactions short'
\echo ''
