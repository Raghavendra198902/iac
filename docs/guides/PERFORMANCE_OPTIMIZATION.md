# Performance Optimization Guide

## PgBouncer Connection Pooling

### What is PgBouncer?
PgBouncer is a lightweight connection pooler for PostgreSQL that significantly reduces database connection overhead and improves performance.

### Benefits
- **90% reduction in connection overhead**
- **Support for 1000+ concurrent clients** with only 25-100 database connections
- **Faster response times** - connection reuse eliminates handshake delays
- **Better resource utilization** - fewer idle connections

### Configuration

PgBouncer is configured in `config/pgbouncer/pgbouncer.ini`:

```ini
[pgbouncer]
pool_mode = transaction        # Most efficient for stateless apps
max_client_conn = 1000         # Maximum client connections
default_pool_size = 25         # Connections per database
max_db_connections = 100       # Total database connections
```

### Usage

**Development:**
```bash
docker-compose up -d pgbouncer
```

**Services connect to PgBouncer** (port 6432) instead of PostgreSQL (port 5432):
```env
DB_HOST=pgbouncer
DB_PORT=6432
```

### Monitoring

Access PgBouncer console:
```bash
docker exec -it dharma-pgbouncer psql -h localhost -p 6432 -U dharma_admin pgbouncer
```

Commands:
- `SHOW POOLS;` - View pool statistics
- `SHOW STATS;` - View request statistics
- `SHOW DATABASES;` - View database connections
- `SHOW CONFIG;` - View configuration

## Redis Caching

### Configuration

Redis is configured with optimal settings for caching:

```bash
maxmemory 512mb                # Memory limit
maxmemory-policy allkeys-lru   # Eviction policy
save 60 1000                   # Persistence
appendonly yes                 # Durability
```

### Cache Middleware Usage

```typescript
import { cacheMiddleware } from '../shared/cache.middleware';

// Cache for 5 minutes (300 seconds)
router.get('/blueprints', cacheMiddleware({ ttl: 300 }), getBluprints);

// Custom cache key
router.get('/projects/:id', 
  cacheMiddleware({ 
    ttl: 600,
    key: (req) => `project:${req.params.id}`
  }), 
  getProject
);

// Conditional caching
router.get('/data', 
  cacheMiddleware({ 
    condition: (req) => req.query.cache !== 'false'
  }), 
  getData
);
```

### Cache Invalidation

```typescript
import { invalidateCache } from '../shared/cache.middleware';

// Invalidate specific pattern
await invalidateCache('cache:blueprints:*');

// Clear all cache
await clearAllCache();
```

### Cache Headers

Responses include cache status:
```
X-Cache: HIT | MISS
X-Cache-Key: cache:/api/blueprints
```

## Load Testing

### Running Tests

```bash
# Run all performance tests
./scripts/testing/run-performance-tests.sh

# Or run individual tests
npm run load:baseline    # Baseline performance
npm run load:stress      # Stress testing
npm run load:spike       # Spike testing
```

### Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| Response Time (P95) | < 500ms | 95% of requests |
| Response Time (P99) | < 1000ms | 99% of requests |
| Throughput | > 5000 req/sec | Sustained load |
| Error Rate | < 1% | Failed requests |
| Database Connections | < 100 | With 1000+ clients |
| Cache Hit Rate | > 80% | Redis efficiency |

### Interpreting Results

**Good Performance:**
```
Total Requests:      50000
Failed Requests:     50
Error Rate:          0.10%
Avg Response Time:   234.56ms
P95 Response Time:   456.78ms
P99 Response Time:   789.12ms
Requests/sec:        5234.56
```

**Performance Issues:**
- P95 > 500ms: Database queries may need optimization
- Error Rate > 1%: Check application logs for errors
- Requests/sec < 1000: May need horizontal scaling

## Performance Monitoring

### Grafana Dashboards

Access Grafana at `http://localhost:3030` (admin/admin)

**Pre-configured Dashboards:**
1. **Platform Overview** - System-wide metrics
2. **Database Performance** - PgBouncer + PostgreSQL
3. **Redis Cache** - Cache hit rates and memory
4. **API Performance** - Response times and throughput

### Prometheus Metrics

Key metrics tracked:
- `http_request_duration_seconds` - API response times
- `http_requests_total` - Request counters
- `pgbouncer_pools` - Connection pool statistics
- `redis_memory_used_bytes` - Cache memory usage
- `nodejs_heap_size_used_bytes` - Application memory

### Alerts

Configured alerts:
- High response times (P95 > 1s)
- High error rates (> 5%)
- Database connection exhaustion
- High memory usage (> 80%)

## Optimization Tips

### 1. Database Optimization
- Add indexes on frequently queried columns
- Use EXPLAIN ANALYZE for slow queries
- Implement prepared statements
- Use connection pooling (PgBouncer)

### 2. API Optimization
- Enable Redis caching for read-heavy endpoints
- Implement pagination for large datasets
- Use compression (gzip/brotli)
- Minimize payload sizes

### 3. Frontend Optimization
- Enable code splitting and lazy loading
- Implement service worker for offline support
- Optimize bundle size (< 500KB)
- Use CDN for static assets

### 4. Infrastructure Optimization
- Use PgBouncer for connection pooling
- Configure Redis for optimal caching
- Enable HTTP/2 and compression
- Implement rate limiting

## Troubleshooting

### High Database Connections

```bash
# Check active connections
docker exec -it dharma-postgres psql -U dharma_admin -d iac_dharma -c "SELECT count(*) FROM pg_stat_activity;"

# Use PgBouncer
DB_HOST=pgbouncer
DB_PORT=6432
```

### Low Cache Hit Rate

```bash
# Check Redis stats
docker exec -it dharma-redis redis-cli INFO stats

# Increase cache TTL or memory
maxmemory 1gb
```

### Slow Response Times

1. Check database query performance
2. Enable caching for read endpoints
3. Review application logs for bottlenecks
4. Use Jaeger for distributed tracing

## Production Recommendations

1. **Always use PgBouncer** - Never connect directly to PostgreSQL
2. **Enable Redis caching** - For all read-heavy endpoints
3. **Set up monitoring** - Prometheus + Grafana alerts
4. **Run load tests** - Before each major release
5. **Monitor metrics** - Track P95/P99 response times
6. **Set resource limits** - Memory and connection limits
7. **Enable auto-scaling** - For Kubernetes deployments
