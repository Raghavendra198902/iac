# Phase 1 Completion & Phase 2 Readiness Plan
## Integrated Roadmap - December 3, 2025

**Status**: Phase 1 at 85% - Infrastructure deployed, application integration and Phase 2 prep needed  
**Branch**: `v2.0-development`

---

## 🎯 Integrated Strategy: A + B + C

We'll complete Phase 1 testing (A), integrate the v1.0 application (B), and prepare for Phase 2 (C) in a structured sequence that maximizes efficiency.

---

## 📋 Path A: Complete Infrastructure Testing (2-3 hours)

### Priority: HIGH - Foundation for everything else

### A1. Create Grafana Dashboards ⏳
**Goal**: Monitor infrastructure performance in real-time

#### Dashboard 1: PgBouncer Monitoring
```yaml
Metrics:
  - Pool utilization (active/waiting/idle connections)
  - Client connections (total, waiting, active)
  - Server connections (used, tested, login)
  - Transaction rate (per second)
  - Query duration (avg, p95, p99)
  - Connection acquisition time
  - Pool saturation percentage

Panels:
  1. Connection Pool Overview (gauge)
  2. Client vs Server Connections (graph)
  3. Transaction Rate (graph)
  4. Query Performance (heatmap)
  5. Pool Efficiency (stat)
  6. Error Rate (graph)

Data Source: Prometheus (pgbouncer_exporter)
Refresh: 5s
```

#### Dashboard 2: Redis Cache Performance
```yaml
Metrics:
  - Cache hit rate (%)
  - Cache miss rate (%)
  - Keys in cache (count)
  - Memory usage (current/max)
  - Operations per second (GET/SET/DEL)
  - Eviction count
  - Expired keys
  - Network I/O (bytes in/out)

Panels:
  1. Cache Hit/Miss Rate (gauge + graph)
  2. Memory Usage (gauge + graph)
  3. Operations per Second (graph)
  4. Key Count (stat)
  5. Eviction Rate (graph)
  6. Network Traffic (graph)

Data Source: Prometheus (redis_exporter)
Refresh: 5s
```

#### Dashboard 3: API Performance
```yaml
Metrics:
  - Request rate (req/sec)
  - Response time (p50, p95, p99)
  - Error rate (%)
  - Response status codes (200, 4xx, 5xx)
  - Endpoint latency breakdown
  - Cache efficiency per endpoint

Panels:
  1. Request Rate (graph)
  2. Response Time Percentiles (graph)
  3. Error Rate (stat + graph)
  4. Status Code Distribution (pie chart)
  5. Slowest Endpoints (table)
  6. Cache Hit by Endpoint (heatmap)

Data Source: Prometheus
Refresh: 5s
```

#### Dashboard 4: Database Performance
```yaml
Metrics:
  - Active connections
  - Query execution time (avg, p95, p99)
  - Transaction rate
  - Cache hit ratio (database)
  - Disk I/O
  - Table sizes
  - Slow queries (>100ms)
  - Lock waits

Panels:
  1. Connection Count (graph)
  2. Query Performance (heatmap)
  3. Transaction Rate (graph)
  4. Cache Hit Ratio (gauge)
  5. Top Slow Queries (table)
  6. Disk I/O (graph)

Data Source: Prometheus + PostgreSQL
Refresh: 10s
```

**Files to Create**:
- `deployment/monitoring/grafana/dashboards/pgbouncer.json`
- `deployment/monitoring/grafana/dashboards/redis.json`
- `deployment/monitoring/grafana/dashboards/api-performance.json`
- `deployment/monitoring/grafana/dashboards/database.json`
- `deployment/monitoring/grafana/provisioning/dashboards.yml`
- `deployment/monitoring/grafana/provisioning/datasources.yml`

**Commands**:
```bash
# Access Grafana
open http://localhost:3030
# Login: admin/admin

# Import dashboards via UI or provisioning
# Add Prometheus datasource: http://prometheus:9090
# Add PostgreSQL datasource: host=postgres port=5432
```

**Time Estimate**: 1.5 hours

---

### A2. Test Redis Caching Thoroughly ⏳
**Goal**: Validate Redis performance and caching patterns

#### Test Script 1: Basic Operations
```bash
#!/bin/bash
# tests/redis/basic-operations.sh

echo "=== Redis Basic Operations Test ==="

# Test 1: SET/GET
echo "Test 1: SET/GET operations"
docker exec iac-redis redis-cli SET test:key1 "value1"
docker exec iac-redis redis-cli GET test:key1

# Test 2: TTL
echo "Test 2: TTL (Time To Live)"
docker exec iac-redis redis-cli SET test:key2 "value2" EX 10
docker exec iac-redis redis-cli TTL test:key2

# Test 3: Multiple Keys
echo "Test 3: Multiple keys"
for i in {1..100}; do
  docker exec iac-redis redis-cli SET test:bulk:$i "value$i" > /dev/null
done
docker exec iac-redis redis-cli DBSIZE

# Test 4: Pattern Delete
echo "Test 4: Pattern delete"
docker exec iac-redis redis-cli --scan --pattern "test:bulk:*" | xargs docker exec -i iac-redis redis-cli DEL

# Test 5: Hash Operations
echo "Test 5: Hash operations"
docker exec iac-redis redis-cli HSET user:1 name "John" age 30
docker exec iac-redis redis-cli HGETALL user:1

echo "✅ Basic operations test complete"
```

#### Test Script 2: Performance Benchmark
```bash
#!/bin/bash
# tests/redis/performance-benchmark.sh

echo "=== Redis Performance Benchmark ==="

# Benchmark SET operations
echo "Benchmarking SET operations..."
docker exec iac-redis redis-benchmark -t set -n 100000 -q

# Benchmark GET operations
echo "Benchmarking GET operations..."
docker exec iac-redis redis-benchmark -t get -n 100000 -q

# Benchmark with pipeline
echo "Benchmarking with pipeline..."
docker exec iac-redis redis-benchmark -t set,get -n 100000 -P 16 -q

# Show statistics
echo ""
echo "=== Redis Statistics ==="
docker exec iac-redis redis-cli INFO stats | grep -E "(keyspace|instantaneous|ops)"

echo ""
echo "=== Memory Usage ==="
docker exec iac-redis redis-cli INFO memory | grep -E "(used_memory|maxmemory)"

echo ""
echo "✅ Performance benchmark complete"
```

#### Test Script 3: Cache Patterns
```typescript
// tests/redis/cache-patterns.test.ts
import { cacheService } from '@/shared/services/cache.service';

describe('Redis Cache Patterns', () => {
  beforeEach(async () => {
    await cacheService.flush();
  });

  test('Cache-Aside Pattern', async () => {
    const key = 'user:123';
    
    // Cache miss
    let cached = await cacheService.get(key);
    expect(cached).toBeNull();
    
    // Fetch and cache
    const data = { id: 123, name: 'John' };
    await cacheService.set(key, data, { ttl: 300 });
    
    // Cache hit
    cached = await cacheService.get(key);
    expect(cached).toEqual(data);
  });

  test('Write-Through Pattern', async () => {
    const key = 'user:456';
    const data = { id: 456, name: 'Jane' };
    
    // Write to cache and database simultaneously
    await Promise.all([
      cacheService.set(key, data),
      // database.save(data)
    ]);
    
    const cached = await cacheService.get(key);
    expect(cached).toEqual(data);
  });

  test('Cache Invalidation', async () => {
    // Set multiple keys
    await cacheService.set('blueprint:1', { id: 1 });
    await cacheService.set('blueprint:2', { id: 2 });
    await cacheService.set('infrastructure:1', { id: 1 });
    
    // Invalidate by pattern
    await cacheService.deleteByPattern('blueprint:*');
    
    const bp1 = await cacheService.get('blueprint:1');
    const infra1 = await cacheService.get('infrastructure:1');
    
    expect(bp1).toBeNull();
    expect(infra1).not.toBeNull();
  });

  test('Get-or-Set Pattern', async () => {
    let callCount = 0;
    const fetchFn = async () => {
      callCount++;
      return { data: 'expensive-computation' };
    };

    // First call - miss
    const result1 = await cacheService.getOrSet('expensive:1', fetchFn);
    expect(callCount).toBe(1);

    // Second call - hit (fetchFn not called)
    const result2 = await cacheService.getOrSet('expensive:1', fetchFn);
    expect(callCount).toBe(1);
    expect(result2).toEqual(result1);
  });

  test('Counter Pattern', async () => {
    const key = 'counter:views';
    
    await cacheService.increment(key);
    await cacheService.increment(key);
    await cacheService.increment(key);
    
    const count = await cacheService.get(key);
    expect(count).toBe('3');
  });

  test('TTL and Expiration', async () => {
    await cacheService.set('temp:key', 'value', { ttl: 2 });
    
    let value = await cacheService.get('temp:key');
    expect(value).not.toBeNull();
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    value = await cacheService.get('temp:key');
    expect(value).toBeNull();
  });

  test('Cache Stats', async () => {
    await cacheService.set('key1', 'value1');
    await cacheService.set('key2', 'value2');
    await cacheService.get('key1');
    await cacheService.get('key1');
    await cacheService.get('key3'); // miss
    
    const stats = await cacheService.getStats();
    expect(stats.keys).toBeGreaterThan(0);
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
  });
});
```

**Files to Create**:
- `tests/redis/basic-operations.sh`
- `tests/redis/performance-benchmark.sh`
- `tests/redis/cache-patterns.test.ts`
- `tests/redis/README.md`

**Time Estimate**: 1 hour

---

### A3. Fix/Document PgBouncer DNS Issue ⏳
**Goal**: Resolve or provide workaround for DNS resolution

#### Option 1: Use IP Address
```yaml
# docker-compose.v2.yml
environment:
  DATABASES_HOST: 172.28.0.2  # Use IP instead of hostname
```

#### Option 2: Add Custom DNS
```yaml
# docker-compose.v2.yml
pgbouncer:
  dns:
    - 172.28.0.2
  extra_hosts:
    - "postgres:172.28.0.2"
```

#### Option 3: Wait and Monitor
- PgBouncer DNS issues often self-resolve
- Monitor logs for resolution
- Document workaround in deployment guide

**File to Update**:
- `docker-compose.v2.yml` (if applying fix)
- `docs/TROUBLESHOOTING.md` (document issue)

**Time Estimate**: 30 minutes

---

### A4. Baseline Infrastructure Metrics ⏳
**Goal**: Establish baseline performance before load testing

```bash
#!/bin/bash
# tests/infrastructure/baseline-metrics.sh

echo "=== Infrastructure Baseline Metrics ==="
echo "Date: $(date)"
echo ""

echo "=== PostgreSQL ==="
docker exec iac-postgres psql -U postgres -d iac_dharma -c "
  SELECT 
    'Active Connections' as metric,
    count(*) as value
  FROM pg_stat_activity
  WHERE datname = 'iac_dharma';
"

echo ""
echo "=== PgBouncer ==="
docker logs iac-pgbouncer 2>&1 | grep "stats:" | tail -1

echo ""
echo "=== Redis ==="
docker exec iac-redis redis-cli INFO stats | grep -E "(keyspace|ops|hit)"
docker exec iac-redis redis-cli INFO memory | grep -E "(used|max)"

echo ""
echo "=== System Resources ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "✅ Baseline metrics captured"
```

**File to Create**:
- `tests/infrastructure/baseline-metrics.sh`
- `docs/BASELINE_METRICS.md`

**Time Estimate**: 30 minutes

---

## 📋 Path B: Integrate v1.0 Application (4-6 hours)

### Priority: HIGH - Required for full testing

### B1. Update docker-compose.v2.yml ⏳
**Goal**: Add all v1.0 backend services to v2.0 stack

```yaml
# Add to docker-compose.v2.yml

services:
  # ... existing services (postgres, pgbouncer, redis, etc.) ...

  # Backend Services
  api-gateway:
    build: ./backend/api-gateway
    container_name: dharma-api-gateway
    environment:
      # Update to use PgBouncer
      DATABASE_URL: postgres://postgres:postgres@pgbouncer:6432/iac_dharma
      # Add Redis
      REDIS_URL: redis://redis:6379
      REDIS_CACHE_ENABLED: "true"
      REDIS_CACHE_TTL: "300"
    depends_on:
      pgbouncer:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "3000:3000"

  blueprint-service:
    build: ./backend/blueprint-service
    environment:
      DATABASE_URL: postgres://postgres:postgres@pgbouncer:6432/iac_dharma
      REDIS_URL: redis://redis:6379
    depends_on:
      - pgbouncer
      - redis

  # Add remaining 10 services...
  # iac-generator, guardrails-engine, costing-service, 
  # orchestrator-service, automation-engine, monitoring-service,
  # cloud-provider-service, ai-recommendations-service, sso-service
```

**Time Estimate**: 2 hours

---

### B2. Run Database Migrations ⏳
**Goal**: Create tables and apply schema

```bash
#!/bin/bash
# scripts/migrate-database.sh

echo "=== Running Database Migrations ==="

# Apply core schema
docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/schemas/V001__core_schema.sql

# Apply blueprint schema
docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/schemas/V002__blueprint_schema.sql

# Apply additional schemas
docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/schemas/V004__approvals_schema.sql
docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/schemas/V005__incidents_schema.sql
docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/schemas/V006__deployment_logs_schema.sql
docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/schemas/V007__governance_schema.sql

# Apply indexes
docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/optimization/add-indexes.sql

# Seed data (optional)
# docker exec -i iac-postgres psql -U postgres -d iac_dharma < database/schemas/sample_ea_data_simple.sql

echo "✅ Database migrations complete"
```

**Time Estimate**: 30 minutes

---

### B3. Configure Services for v2.0 ⏳
**Goal**: Update services to use PgBouncer and Redis

Update each service's configuration:
- Change `DATABASE_URL` from `postgres:5432` to `pgbouncer:6432`
- Add `REDIS_URL` configuration
- Enable cache middleware
- Update health checks

**Time Estimate**: 1.5 hours

---

### B4. Start Full Stack ⏳
**Goal**: Run complete v2.0 application

```bash
# Start everything
docker-compose -f docker-compose.v2.yml up -d

# Wait for health checks
sleep 60

# Verify all services
docker-compose -f docker-compose.v2.yml ps

# Check logs
docker-compose -f docker-compose.v2.yml logs --tail=50
```

**Time Estimate**: 30 minutes

---

### B5. Execute Load Tests ⏳
**Goal**: Validate v2.0 performance targets

```bash
# Run tests sequentially
npm run load:baseline    # 100 users, 5 min
npm run load:stress      # 1,000 users, 10 min  
npm run load:spike       # 10,000 users, 15 min

# Collect results
mkdir -p test-results
mv *.json test-results/

# Analyze
node scripts/analyze-load-tests.js
```

**Time Estimate**: 1.5 hours (including test execution)

---

## 📋 Path C: Prepare for Phase 2 (2-3 hours planning)

### Priority: MEDIUM - Plan while testing Phase 1

### C1. SAML SSO Design ⏳
**Goal**: Architecture and implementation plan

```markdown
# SAML SSO Implementation Plan

## Architecture
- Service Provider (SP): IAC Platform
- Identity Providers (IdP): Okta, Azure AD, Auth0
- Protocol: SAML 2.0

## Components
1. SAML Service (`backend/sso-service`)
   - passport-saml integration
   - SP metadata generation
   - Assertion validation
   - Session management

2. SAML Middleware
   - Authentication check
   - User provisioning
   - Attribute mapping
   - Role synchronization

3. Database Schema
   - saml_configurations table
   - saml_sessions table
   - identity_provider_mappings table

## Implementation Steps
1. Install dependencies (passport-saml, @node-saml/node-saml)
2. Create SAML service
3. Generate SP metadata
4. Configure IdP connection
5. Implement assertion consumer service (ACS)
6. Add single logout (SLO)
7. Test with multiple IdPs

## Timeline: Week 5-6 (2 weeks)
```

**File to Create**:
- `docs/phase2/SAML_SSO_DESIGN.md`

---

### C2. OIDC Implementation Plan ⏳
**Goal**: OpenID Connect authentication design

```markdown
# OIDC Authentication Implementation Plan

## Architecture
- OpenID Connect protocol
- Support: Google, Microsoft, GitHub
- OAuth 2.0 + ID Token

## Components
1. OIDC Service
   - passport-openidconnect
   - Token validation
   - Userinfo endpoint
   - Refresh token handling

2. Provider Configuration
   - Google OAuth
   - Microsoft Azure AD
   - GitHub OAuth
   - Generic OIDC

## Implementation Steps
1. Install dependencies
2. Create OIDC strategy
3. Configure providers
4. Token management
5. Refresh token rotation
6. Logout handling

## Timeline: Week 6-7 (1-2 weeks)
```

**File to Create**:
- `docs/phase2/OIDC_DESIGN.md`

---

### C3. Multi-Tenancy Architecture ⏳
**Goal**: Design tenant isolation strategy

```markdown
# Multi-Tenancy Architecture Design

## Approach: Hybrid (Schema-based + Row-level)

### Tenant Isolation Strategies

#### Option 1: Database per Tenant (Rejected)
- Pros: Complete isolation
- Cons: Management overhead, cost

#### Option 2: Schema per Tenant (Selected for enterprise)
- Pros: Good isolation, manageable
- Cons: Schema limits
- Use case: Enterprise customers

#### Option 3: Row-level Security (Selected for standard)
- Pros: Simple, efficient
- Cons: Careful queries required
- Use case: Standard customers

### Database Schema
```sql
-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50), -- 'standard', 'enterprise'
  schema_name VARCHAR(63), -- for enterprise
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add tenant_id to all tables
ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE blueprints ADD COLUMN tenant_id UUID REFERENCES tenants(id);
-- ... repeat for all tables

-- Row-level security
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON blueprints
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Middleware
```typescript
// Tenant context middleware
app.use(async (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
  req.tenantId = tenantId;
  
  // Set session variable for RLS
  await db.query(`SET app.current_tenant = '${tenantId}'`);
  
  next();
});
```

### Timeline: Week 7-8 (2 weeks)
```

**File to Create**:
- `docs/phase2/MULTI_TENANCY_DESIGN.md`

---

### C4. Enhanced RBAC Design ⏳
**Goal**: Fine-grained permission system

```markdown
# Enhanced RBAC Design

## Permission Model
- Resource-based permissions
- Action-based permissions
- Tenant-scoped roles

### Schema
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(100),
  description TEXT
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  resource VARCHAR(100), -- 'blueprint', 'infrastructure'
  action VARCHAR(50),    -- 'create', 'read', 'update', 'delete'
  scope VARCHAR(50)      -- 'own', 'team', 'tenant', 'global'
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  tenant_id UUID REFERENCES tenants(id),
  PRIMARY KEY (user_id, role_id, tenant_id)
);
```

### Permission Check
```typescript
async function checkPermission(
  userId: string,
  resource: string,
  action: string,
  resourceId?: string
): Promise<boolean> {
  // 1. Get user roles
  // 2. Get role permissions
  // 3. Check scope (own/team/tenant)
  // 4. Validate resource access
}
```

### Timeline: Week 8-9 (1-2 weeks)
```

**File to Create**:
- `docs/phase2/RBAC_DESIGN.md`

---

### C5. Phase 2 Task Breakdown ⏳
**Goal**: Detailed implementation plan

```markdown
# Phase 2 Implementation Plan (Weeks 5-9)

## Week 5: SSO Foundation
- [ ] SAML service implementation
- [ ] SP metadata generation
- [ ] ACS endpoint
- [ ] Basic IdP integration

## Week 6: SSO Completion + OIDC
- [ ] SAML multi-IdP support
- [ ] Single logout (SLO)
- [ ] OIDC service implementation
- [ ] Provider configurations

## Week 7: Multi-Tenancy Foundation
- [ ] Tenant management service
- [ ] Database schema updates
- [ ] Tenant middleware
- [ ] Row-level security policies

## Week 8: Multi-Tenancy + RBAC
- [ ] Schema-based isolation (enterprise)
- [ ] Tenant provisioning
- [ ] Enhanced RBAC schema
- [ ] Permission service

## Week 9: Integration + Testing
- [ ] SSO integration with RBAC
- [ ] Multi-tenant data isolation tests
- [ ] Permission enforcement tests
- [ ] Documentation
- [ ] Phase 2 sign-off
```

**File to Create**:
- `docs/phase2/IMPLEMENTATION_PLAN.md`

---

## 📊 Timeline Summary

### Week 1 (Current): Phase 1 Completion
- **Day 1 (Today)**: Infrastructure testing (Path A) - 2-3 hours
- **Day 2-3**: Application integration (Path B) - 4-6 hours
- **Day 4**: Load testing and validation
- **Day 5**: Documentation and Phase 1 sign-off

### Week 2-4: Phase 1 Optimization
- Performance tuning based on test results
- Grafana dashboard refinement
- Database query optimization
- Cache strategy optimization

### Week 5-9: Phase 2 Implementation
- Week 5: SAML SSO
- Week 6: OIDC + SSO completion
- Week 7: Multi-tenancy foundation
- Week 8: Multi-tenancy + RBAC
- Week 9: Integration & testing

---

## 🎯 Success Criteria

### Phase 1 Complete ✓
- [ ] All infrastructure services healthy
- [ ] Grafana dashboards operational
- [ ] Redis caching validated (>80% hit rate)
- [ ] PgBouncer pool efficiency >90%
- [ ] Load tests passing (baseline, stress, spike)
- [ ] Performance targets met:
  - 10,000 concurrent users
  - API response <100ms (p95)
  - Throughput >5,000 req/sec

### Phase 2 Ready ✓
- [ ] Design documents complete
- [ ] Database schemas designed
- [ ] Architecture decisions documented
- [ ] Implementation plan with timeline
- [ ] Team aligned on approach

---

## 📝 Files to Create

### Path A (Infrastructure Testing)
- `deployment/monitoring/grafana/dashboards/*.json` (4 dashboards)
- `deployment/monitoring/grafana/provisioning/*.yml` (2 files)
- `tests/redis/basic-operations.sh`
- `tests/redis/performance-benchmark.sh`
- `tests/redis/cache-patterns.test.ts`
- `tests/redis/README.md`
- `tests/infrastructure/baseline-metrics.sh`
- `docs/BASELINE_METRICS.md`
- `docs/TROUBLESHOOTING.md`

### Path B (Application Integration)
- `scripts/migrate-database.sh`
- `scripts/analyze-load-tests.js`
- `docs/PERFORMANCE_RESULTS.md`
- Updated: `docker-compose.v2.yml`
- Updated: All backend service configs

### Path C (Phase 2 Prep)
- `docs/phase2/SAML_SSO_DESIGN.md`
- `docs/phase2/OIDC_DESIGN.md`
- `docs/phase2/MULTI_TENANCY_DESIGN.md`
- `docs/phase2/RBAC_DESIGN.md`
- `docs/phase2/IMPLEMENTATION_PLAN.md`

**Total**: ~30 files to create/update

---

## 🚀 Getting Started

### Immediate Actions (Today)
1. ✅ Review this integrated plan
2. ⏳ Start Path A: Create Grafana dashboards
3. ⏳ Test Redis caching thoroughly
4. ⏳ Document PgBouncer DNS workaround

### Tomorrow
1. ⏳ Start Path B: Update docker-compose.v2.yml
2. ⏳ Run database migrations
3. ⏳ Configure services for v2.0

### This Week
1. ⏳ Complete application integration
2. ⏳ Execute all load tests
3. ⏳ Document performance results
4. ⏳ Phase 1 sign-off

### Next Week
1. ⏳ Start Phase 2 design documentation
2. ⏳ Begin SAML SSO implementation
3. ⏳ Parallel: Optimize Phase 1 based on results

---

**Status**: Plan ready for execution  
**Next Step**: Begin Path A (Grafana dashboards) or choose different priority  
**Branch**: v2.0-development  
**Date**: December 3, 2025
