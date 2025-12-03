# Database Optimization Guide

## Overview
This directory contains SQL scripts and tools for optimizing database performance in the IAC Platform v2.0.

## Performance Targets
- Query response time: <50ms (p95)
- Cache hit ratio: >90%
- Index scan ratio: >95%
- Connection pool efficiency: >90%
- Dead row ratio: <5%

## Optimization Scripts

### 1. Add Indexes (`add-indexes.sql`)
Creates missing indexes to improve query performance.

**What it does:**
- Creates indexes on frequently queried columns
- Adds composite indexes for common query patterns
- Creates partial indexes for filtered queries
- Updates table statistics with ANALYZE

**When to run:**
- After initial database setup
- When slow query analysis shows missing indexes
- After adding new tables or columns
- Monthly as part of maintenance

**Usage:**
```bash
# Via psql
psql -h localhost -p 5432 -U postgres -d iac_db -f database/optimization/add-indexes.sql

# Via PgBouncer (recommended for production)
psql -h localhost -p 6432 -U postgres -d iac_db -f database/optimization/add-indexes.sql

# Via Docker Compose
docker-compose -f docker-compose.v2.yml exec postgres psql -U postgres -d iac_db -f /docker-entrypoint-initdb.d/optimization/add-indexes.sql
```

### 2. Analyze Queries (`analyze-queries.sql`)
Identifies slow queries and provides optimization recommendations.

**What it analyzes:**
- Top 20 slowest queries by average execution time
- Most frequently called queries
- Queries with highest I/O (disk reads)
- Tables with high sequential scan counts
- Unused indexes that can be dropped
- Table sizes and bloat
- Database cache hit ratio
- Active connections and pooling statistics
- Lock contention

**Prerequisites:**
Enable `pg_stat_statements` extension:
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

Add to `postgresql.conf`:
```
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000
```

**Usage:**
```bash
# Run analysis
psql -h localhost -p 5432 -U postgres -d iac_db -f database/optimization/analyze-queries.sql

# Save output to file
psql -h localhost -p 5432 -U postgres -d iac_db -f database/optimization/analyze-queries.sql > optimization-report.txt
```

### 3. Vacuum Tables (`vacuum-tables.sql`)
Cleans up dead rows and optimizes table storage.

**What it does:**
- Reclaims storage from dead rows
- Updates table statistics
- Optimizes table layout
- Prevents transaction ID wraparound

**When to run:**
- Tables with >10% dead rows
- After bulk DELETE/UPDATE operations
- Weekly as part of maintenance
- Before major releases

**Usage:**
```bash
# Vacuum all tables
psql -h localhost -p 5432 -U postgres -d iac_db -c "VACUUM ANALYZE;"

# Vacuum specific table
psql -h localhost -p 5432 -U postgres -d iac_db -c "VACUUM ANALYZE blueprints;"

# Full vacuum (locks table, use during maintenance window)
psql -h localhost -p 5432 -U postgres -d iac_db -c "VACUUM FULL ANALYZE blueprints;"
```

## Query Optimization Workflow

### Step 1: Identify Slow Queries
```bash
# Run query analysis
psql -h localhost -p 5432 -U postgres -d iac_db -f database/optimization/analyze-queries.sql
```

### Step 2: Explain Query Plan
```sql
-- Get query execution plan
EXPLAIN ANALYZE
SELECT * FROM blueprints WHERE user_id = 123 AND status = 'active';

-- Look for:
-- - Sequential Scans (Seq Scan) → Need index
-- - High cost values → Need optimization
-- - Many rows processed → Need better filtering
```

### Step 3: Add Missing Indexes
```sql
-- Example: Add index for common filter
CREATE INDEX idx_blueprints_user_status ON blueprints(user_id, status);

-- Verify improvement
ANALYZE blueprints;
EXPLAIN ANALYZE
SELECT * FROM blueprints WHERE user_id = 123 AND status = 'active';
```

### Step 4: Cache Expensive Queries
```typescript
// Example: Cache blueprint list in Redis
const cacheKey = `blueprints:user:${userId}:status:${status}`;
const cached = await cacheService.get(cacheKey);

if (cached) {
  return cached; // <10ms response
}

const blueprints = await db.query('SELECT * FROM blueprints WHERE ...');
await cacheService.set(cacheKey, blueprints, { ttl: 300 }); // 5 min cache

return blueprints;
```

### Step 5: Monitor Performance
```bash
# Check index usage
psql -h localhost -p 5432 -U postgres -d iac_db -c "
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;"

# Check cache hit ratio
psql -h localhost -p 5432 -U postgres -d iac_db -c "
SELECT
  'Cache Hit Ratio' as metric,
  ROUND((100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0))::numeric, 2) as percentage
FROM pg_stat_database
WHERE datname = current_database();"
```

## Common Optimization Patterns

### N+1 Query Problem
**Bad:**
```typescript
// N+1 queries: 1 query + N queries for each blueprint
const blueprints = await db.query('SELECT * FROM blueprints');
for (const bp of blueprints) {
  bp.resources = await db.query('SELECT * FROM resources WHERE blueprint_id = ?', bp.id);
}
```

**Good:**
```typescript
// Single JOIN query
const blueprints = await db.query(`
  SELECT b.*, json_agg(r.*) as resources
  FROM blueprints b
  LEFT JOIN resources r ON r.blueprint_id = b.id
  GROUP BY b.id
`);
```

### Pagination
**Bad:**
```typescript
// Loads all rows into memory
const blueprints = await db.query('SELECT * FROM blueprints');
return blueprints.slice(offset, offset + limit);
```

**Good:**
```typescript
// Uses LIMIT/OFFSET in database
const blueprints = await db.query(`
  SELECT * FROM blueprints
  ORDER BY created_at DESC
  LIMIT ? OFFSET ?
`, [limit, offset]);
```

### Full-Text Search
**Bad:**
```sql
-- Case-insensitive LIKE is slow on large tables
SELECT * FROM blueprints WHERE LOWER(name) LIKE '%search%';
```

**Good:**
```sql
-- Use full-text search with GIN index
CREATE INDEX idx_blueprints_name_search ON blueprints USING gin(to_tsvector('english', name));

SELECT * FROM blueprints 
WHERE to_tsvector('english', name) @@ to_tsquery('english', 'search');
```

## Maintenance Schedule

### Daily
- Monitor slow query log
- Check connection pool utilization
- Review cache hit rates

### Weekly
- Run VACUUM on high-churn tables
- Review unused indexes
- Check table bloat

### Monthly
- Run full query analysis
- Optimize slow queries
- Update table statistics
- Review index usage

### Quarterly
- Major database optimization
- Rebuild heavily fragmented indexes
- Review and adjust autovacuum settings
- Performance testing with load tests

## Monitoring Queries

### Check PgBouncer Pool Stats
```sql
-- Connect to PgBouncer
psql -h localhost -p 6432 -U postgres pgbouncer

-- Show pool statistics
SHOW POOLS;
SHOW STATS;
SHOW SERVERS;
SHOW CLIENTS;
```

### Check PostgreSQL Stats
```sql
-- Connection count
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'iac_db';

-- Active queries
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE datname = 'iac_db' AND state != 'idle'
ORDER BY query_start;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Redis Cache Stats
```bash
# Via redis-cli
redis-cli INFO stats

# Via API
curl http://localhost:3000/api/cache/stats
```

## Troubleshooting

### High Sequential Scans
**Symptom:** `seq_scan` count high in `pg_stat_user_tables`

**Solution:**
1. Run analyze-queries.sql to identify tables
2. Add indexes for WHERE/JOIN clauses
3. Use EXPLAIN ANALYZE to verify improvement

### Low Cache Hit Ratio (<90%)
**Symptom:** High disk I/O, slow queries

**Solution:**
1. Increase `shared_buffers` in postgresql.conf
2. Add Redis caching for expensive queries
3. Optimize queries to reduce data scanning

### High Dead Row Percentage (>10%)
**Symptom:** Table bloat, slow queries

**Solution:**
1. Run VACUUM ANALYZE on affected tables
2. Adjust autovacuum settings
3. Consider VACUUM FULL during maintenance window

### Connection Pool Exhaustion
**Symptom:** "Too many connections" errors

**Solution:**
1. Check PgBouncer stats: `SHOW POOLS`
2. Increase `pool_size` in pgbouncer.ini
3. Fix connection leaks in application code
4. Use shorter transaction timeouts

## Best Practices

1. **Always use prepared statements** to prevent SQL injection and improve performance
2. **Create indexes thoughtfully** - too many indexes slow down writes
3. **Keep transactions short** - long transactions hold locks
4. **Use connection pooling** - via PgBouncer for efficiency
5. **Cache aggressively** - use Redis for expensive queries
6. **Monitor continuously** - set up alerts for slow queries
7. **Test with realistic data** - use load tests to validate
8. **Document slow queries** - keep a log of optimization efforts

## Resources

- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [PgBouncer Documentation](https://www.pgbouncer.org/usage.html)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/caching/)
- [k6 Load Testing](https://k6.io/docs/)
