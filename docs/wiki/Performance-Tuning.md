# Performance Tuning

Optimize IAC Dharma for maximum performance and efficiency.

---

## Database Optimization

### PostgreSQL Configuration

```sql
-- Increase shared buffers (25% of RAM)
ALTER SYSTEM SET shared_buffers = '2GB';

-- Set effective cache size (50-75% of RAM)
ALTER SYSTEM SET effective_cache_size = '6GB';

-- Optimize work memory
ALTER SYSTEM SET work_mem = '50MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Connection pooling
ALTER SYSTEM SET max_connections = '200';

-- Write ahead log
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';

-- Reload configuration
SELECT pg_reload_conf();
```

### Query Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX idx_blueprints_created_at ON blueprints(created_at DESC);
CREATE INDEX idx_blueprints_provider ON blueprints(provider);

-- Composite indexes
CREATE INDEX idx_blueprints_user_provider ON blueprints(user_id, provider);

-- Partial indexes
CREATE INDEX idx_active_blueprints ON blueprints(id) WHERE status = 'active';

-- Analyze tables regularly
ANALYZE blueprints;
ANALYZE deployments;
```

### Connection Pooling

```typescript
// pg-pool configuration
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                    // Maximum pool size
  min: 2,                     // Minimum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000,
  maxUses: 7500,              // Close connections after 7500 queries
});
```

---

## Redis Optimization

### Configuration

```bash
# redis.conf optimizations
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence tuning
save 900 1
save 300 10
save 60 10000

# AOF for durability
appendonly yes
appendfsync everysec

# Connection limits
maxclients 10000
```

### Caching Strategy

```typescript
// Multi-layer caching
class CacheService {
  private memoryCache: Map<string, any> = new Map();
  private redis: Redis;

  async get(key: string): Promise<any> {
    // L1: Memory cache
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // L2: Redis cache
    const value = await this.redis.get(key);
    if (value) {
      this.memoryCache.set(key, value);
      return value;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    this.memoryCache.set(key, value);
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

---

## Application Performance

### Node.js Optimization

```javascript
// Enable clustering
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  // Start application
  startServer();
}
```

### Response Compression

```typescript
import compression from 'compression';

// Enable gzip compression
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### Request Optimization

```typescript
// Pagination
app.get('/api/blueprints', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    db.query('SELECT * FROM blueprints LIMIT $1 OFFSET $2', [limit, offset]),
    db.query('SELECT COUNT(*) FROM blueprints')
  ]);

  res.json({
    data: data.rows,
    pagination: {
      page,
      limit,
      total: total.rows[0].count,
      pages: Math.ceil(total.rows[0].count / limit)
    }
  });
});
```

### Async Processing

```typescript
// Use queues for heavy operations
import Bull from 'bull';

const deploymentQueue = new Bull('deployments', {
  redis: { host: 'redis', port: 6379 }
});

// Producer
app.post('/api/deploy', async (req, res) => {
  const job = await deploymentQueue.add({
    blueprintId: req.body.blueprintId,
    userId: req.user.id
  });

  res.json({
    jobId: job.id,
    status: 'queued'
  });
});

// Consumer
deploymentQueue.process(async (job) => {
  return await deployInfrastructure(job.data);
});
```

---

## Frontend Optimization

### React Performance

```typescript
// Code splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Blueprints = lazy(() => import('./pages/Blueprints'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blueprints" element={<Blueprints />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

const BlueprintCard = memo(({ blueprint }) => {
  const formattedDate = useMemo(() => 
    new Date(blueprint.createdAt).toLocaleDateString(),
    [blueprint.createdAt]
  );

  const handleClick = useCallback(() => {
    console.log('Clicked:', blueprint.id);
  }, [blueprint.id]);

  return <div onClick={handleClick}>{blueprint.name}</div>;
});
```

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@mui/material', '@mui/icons-material'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
});
```

---

## Network Optimization

### HTTP/2

```nginx
server {
    listen 443 ssl http2;
    server_name iac.yourdomain.com;

    # HTTP/2 push
    location = /index.html {
        http2_push /static/css/main.css;
        http2_push /static/js/main.js;
    }
}
```

### CDN Configuration

```nginx
# Set cache headers
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### Load Balancing

```nginx
upstream api_backend {
    least_conn;
    server api-gateway-1:3000 weight=3;
    server api-gateway-2:3000 weight=3;
    server api-gateway-3:3000 weight=2;
    keepalive 32;
}

server {
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

---

## Docker Optimization

### Multi-stage Builds

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
```

### Layer Caching

```dockerfile
# Optimize layer caching
COPY package*.json ./
RUN npm ci

# This layer only rebuilds when source changes
COPY . .
RUN npm run build
```

---

## Monitoring & Profiling

### Application Profiling

```typescript
// CPU profiling
import v8Profiler from 'v8-profiler-next';

app.get('/admin/profile/start', (req, res) => {
  v8Profiler.startProfiling('CPU profile');
  res.json({ status: 'Profiling started' });
});

app.get('/admin/profile/stop', (req, res) => {
  const profile = v8Profiler.stopProfiling();
  profile.export((error, result) => {
    res.json(JSON.parse(result));
    profile.delete();
  });
});
```

### Memory Monitoring

```typescript
app.get('/metrics/memory', (req, res) => {
  const usage = process.memoryUsage();
  res.json({
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`,
  });
});
```

---

## Performance Benchmarks

### Target Metrics

```yaml
API Response Times:
  P50: < 50ms
  P95: < 200ms
  P99: < 500ms

Throughput:
  Requests/sec: 1000+
  Concurrent users: 500+

Database:
  Query time P95: < 10ms
  Connection pool usage: < 80%

Cache:
  Hit rate: > 90%
  Redis latency: < 1ms

Frontend:
  FCP (First Contentful Paint): < 1.5s
  LCP (Largest Contentful Paint): < 2.5s
  TTI (Time to Interactive): < 3.5s
```

### Load Testing

```bash
# Using Apache Bench
ab -n 10000 -c 100 http://localhost:3000/api/blueprints

# Using k6
k6 run --vus 100 --duration 60s loadtest.js

# Using Artillery
artillery quick --count 10 --num 1000 http://localhost:3000/api/health
```

---

## Optimization Checklist

### Database
- [ ] Indexes created for frequently queried columns
- [ ] Query execution plans analyzed
- [ ] Connection pooling configured
- [ ] Regular VACUUM and ANALYZE scheduled
- [ ] Slow query log enabled and monitored

### Application
- [ ] Clustering enabled for multi-core utilization
- [ ] Response compression enabled
- [ ] Proper caching strategy implemented
- [ ] Async processing for heavy operations
- [ ] Memory leaks monitored

### Frontend
- [ ] Code splitting implemented
- [ ] Bundle size optimized (< 200KB gzipped)
- [ ] Images optimized and lazy-loaded
- [ ] Service worker for offline capability
- [ ] Component memoization applied

### Infrastructure
- [ ] HTTP/2 enabled
- [ ] CDN configured
- [ ] Load balancer in place
- [ ] Auto-scaling rules defined
- [ ] Monitoring and alerting active

---

Last Updated: November 21, 2025 | [Back to Home](Home)
