# Rate Limiting Configuration Guide

## Current Issue

During load testing, **64% of requests were blocked** with HTTP 429 (Too Many Requests). This indicates the rate limiting configuration is too restrictive for production use.

## Current Configuration

```typescript
// File: backend/api-gateway/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Math:**
- 100 requests per 15 minutes
- = 6.67 requests per minute
- = **0.11 requests per second per IP**

**Problem:** Modern web applications make many more requests than this!

---

## Recommended Solutions

### Solution 1: Adjust Global Rate Limit (RECOMMENDED - Quickest)

**Implementation Time:** 5 minutes  
**Complexity:** Low  
**Impact:** Solves 90% of the problem

```typescript
// File: backend/api-gateway/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute (changed from 15 minutes)
  max: process.env.NODE_ENV === 'production' ? 60 : 1000,  // 60/min in prod
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export default globalLimiter;
```

**New Limits:**
- 60 requests per minute = **1 request per second per IP**
- 36x increase from current limit
- Industry standard for APIs

**Trade-offs:**
- ✅ Simple to implement
- ✅ Still protects against DDoS
- ✅ Allows realistic user activity
- ⚠️ May still affect users behind NAT (shared IPs)

---

### Solution 2: Per-Endpoint Rate Limiting (RECOMMENDED - Best)

**Implementation Time:** 30 minutes  
**Complexity:** Medium  
**Impact:** Optimal protection + usability

```typescript
// File: backend/api-gateway/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Different limits for different endpoint types

// Strict limits for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,  // Don't count successful logins
});

// Moderate limits for write operations
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 20,  // 20 writes per minute
  message: 'Too many requests, please slow down.',
});

// Generous limits for read operations
export const readLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,  // 100 reads per minute
  message: 'Too many requests, please slow down.',
});

// Lenient for health checks
export const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,  // Allow monitoring tools
});

export default readLimiter;  // Default to read limiter
```

**Apply to Routes:**

```typescript
// File: backend/api-gateway/src/app.ts
import express from 'express';
import { authLimiter, readLimiter, writeLimiter, healthLimiter } from './middleware/rateLimiter';

const app = express();

// Health endpoints - lenient
app.use('/health', healthLimiter);

// Auth endpoints - strict
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Apply read/write limiters based on method
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return readLimiter(req, res, next);
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});
```

**Benefits:**
- ✅ Strict protection where needed (auth)
- ✅ Allows high read traffic
- ✅ Prevents write abuse
- ✅ Monitoring-friendly

---

### Solution 3: User-Based Rate Limiting (RECOMMENDED - Advanced)

**Implementation Time:** 1 hour  
**Complexity:** High  
**Impact:** Best user experience

```typescript
// File: backend/api-gateway/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Dynamic limits based on authentication
export const userBasedLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  
  // Dynamic limit based on user
  max: async (req) => {
    if (req.user) {
      // Authenticated users get higher limits
      switch (req.user.role) {
        case 'admin':
        case 'SA':
          return 1000;  // Admins: 1000/min
        case 'TA':
        case 'EA':
          return 500;   // Technical roles: 500/min
        default:
          return 100;   // Regular users: 100/min
      }
    }
    // Anonymous users: low limit
    return 20;  // 20/min
  },
  
  // Use user ID for authenticated, IP for anonymous
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    return `ip:${req.ip}`;
  },
  
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Apply After Authentication:**

```typescript
// File: backend/api-gateway/src/app.ts
import { authenticate } from './middleware/auth';
import { userBasedLimiter } from './middleware/rateLimiter';

// Apply authentication first
app.use('/api', authenticate);

// Then apply user-based rate limiting
app.use('/api', userBasedLimiter);
```

**Benefits:**
- ✅ Rewards authenticated users
- ✅ Higher limits for trusted roles
- ✅ Maintains protection against anonymous abuse
- ✅ Scales with user growth

**Trade-offs:**
- ⚠️ Requires authentication integration
- ⚠️ More complex to test
- ⚠️ Need monitoring per user

---

### Solution 4: Redis-Based Distributed Limiting (Production)

**Implementation Time:** 2-4 hours  
**Complexity:** High  
**Impact:** Required for horizontal scaling

**When Needed:**
- Multiple API gateway instances
- Kubernetes deployment
- Load balancer with round-robin
- Need accurate global limits

```typescript
// File: backend/api-gateway/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Redis connection
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1,  // Use separate DB for rate limiting
});

// Distributed rate limiter
export const distributedLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',  // Rate limit key prefix
  }),
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Docker Compose Setup:**

```yaml
# Add to docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    container_name: dharma-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - dharma-network

volumes:
  redis_data:
```

**Environment Variables:**

```bash
# .env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
```

**Install Dependencies:**

```bash
cd backend/api-gateway
npm install ioredis rate-limit-redis
```

**Benefits:**
- ✅ Accurate limits across multiple instances
- ✅ Required for Kubernetes/cloud deployment
- ✅ Centralized rate limit storage
- ✅ Supports millions of users

**Trade-offs:**
- ⚠️ Requires Redis infrastructure
- ⚠️ Adds operational complexity
- ⚠️ Slight performance overhead (~2-5ms)
- ⚠️ Redis becomes critical dependency

---

## Implementation Plan

### Phase 1: Immediate Fix (Before Production)

**Goal:** Resolve rate limiting blocking issue

**Steps:**
1. Implement Solution 1 (Adjust Global Rate Limit)
2. Test with load testing tool
3. Verify success rate >95%

**Timeline:** 15 minutes

```bash
# 1. Edit the file
nano backend/api-gateway/src/middleware/rateLimiter.ts

# 2. Change configuration as shown in Solution 1

# 3. Restart API gateway
docker-compose restart api-gateway

# 4. Wait 15 minutes for rate limit to clear

# 5. Test
node tests/load/simple-load-test.js
```

**Success Criteria:**
- Success rate: >95%
- Rate limited requests: <5%
- No authentication blocks

---

### Phase 2: Enhanced Protection (Next Sprint)

**Goal:** Implement per-endpoint rate limiting

**Steps:**
1. Implement Solution 2 (Per-Endpoint Limiting)
2. Apply to auth, read, write endpoints
3. Test each endpoint type
4. Monitor in production

**Timeline:** 2-3 hours

**Files to Modify:**
- `backend/api-gateway/src/middleware/rateLimiter.ts`
- `backend/api-gateway/src/app.ts`

**Testing:**
```bash
# Test auth endpoint (strict)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}'
  sleep 1
done

# Test read endpoint (lenient)
for i in {1..100}; do
  curl http://localhost:3000/api/blueprints
  sleep 0.5
done
```

---

### Phase 3: User-Based Limiting (Future)

**Goal:** Reward authenticated users with higher limits

**Steps:**
1. Implement Solution 3 (User-Based Limiting)
2. Integrate with authentication middleware
3. Test with different user roles
4. Document user limits

**Timeline:** 4-6 hours

**Prerequisites:**
- Solution 2 implemented
- Authentication working
- User roles defined

---

### Phase 4: Distributed Limiting (Production Scale)

**Goal:** Prepare for horizontal scaling

**Steps:**
1. Deploy Redis instance
2. Implement Solution 4 (Redis-Based Limiting)
3. Test with multiple API instances
4. Monitor Redis performance

**Timeline:** 1-2 days

**Prerequisites:**
- Multiple API gateway instances planned
- Redis infrastructure available
- Monitoring setup

---

## Testing Rate Limits

### Manual Testing

```bash
# Test current rate limit
for i in {1..150}; do
  echo "Request $i:"
  curl -s -o /dev/null -w "Status: %{http_code}\n" \
    http://localhost:3000/api/blueprints
  sleep 0.1
done
```

**Expected Output (After Fix):**
```
Request 1: Status: 200
Request 2: Status: 200
...
Request 60: Status: 200
Request 61: Status: 429  # After 1 minute
```

### Automated Testing

```bash
# Use load testing tool
node tests/load/simple-load-test.js

# Check rate limiting metrics
curl http://localhost:3000/api/performance/stats | jq '.rateLimiting'
```

### Monitor Rate Limit Headers

```bash
# Check rate limit headers
curl -I http://localhost:3000/api/blueprints

# Response headers:
# RateLimit-Limit: 60
# RateLimit-Remaining: 59
# RateLimit-Reset: 1234567890
```

---

## Monitoring & Alerts

### Metrics to Track

```yaml
Rate Limiting Metrics:
  - requests_total: Total requests
  - requests_rate_limited: Requests blocked
  - rate_limit_percentage: % of requests limited
  - rate_limit_hits_by_ip: Top IPs being limited
  - rate_limit_hits_by_endpoint: Most limited endpoints

Alerts:
  - name: High Rate Limiting
    condition: rate_limit_percentage > 10%
    severity: warning
    action: Review limits or investigate abuse
    
  - name: Critical Rate Limiting
    condition: rate_limit_percentage > 25%
    severity: critical
    action: Increase limits or block abusive IPs
```

### Grafana Dashboard

```sql
-- Prometheus queries

# Rate limit percentage
(
  sum(rate(http_requests_rate_limited_total[5m]))
  /
  sum(rate(http_requests_total[5m]))
) * 100

# Top rate limited IPs
topk(10, 
  sum by (ip) (rate(http_requests_rate_limited_total[5m]))
)

# Rate limited requests per endpoint
sum by (endpoint) (rate(http_requests_rate_limited_total[5m]))
```

---

## Production Checklist

Before deploying rate limit changes:

- [ ] Rate limit configuration reviewed
- [ ] Load testing completed with new limits
- [ ] Success rate >95% achieved
- [ ] Rate limiting <5% of requests
- [ ] Different endpoint types tested
- [ ] Authentication endpoints protected
- [ ] Monitoring dashboards created
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained on new limits

---

## FAQs

### Q: Why were the original limits so strict?

**A:** Security Audit (Task 10) prioritized DDoS protection. The limits were appropriate for blocking automated attacks but too restrictive for normal usage.

### Q: Will increasing limits expose us to DDoS?

**A:** No. The new limits (60/min = 1 RPS) still protect against DDoS while allowing normal user activity. Legitimate users rarely exceed 1 request/second sustained.

### Q: What if users share an IP (office/NAT)?

**A:** 
- **Option 1:** Implement user-based limiting (Solution 3)
- **Option 2:** Increase limits for authenticated requests
- **Option 3:** IP whitelist for known offices

### Q: How do I whitelist specific IPs?

**A:**
```typescript
const limiter = rateLimit({
  skip: (req) => {
    const whitelist = ['10.0.0.1', '192.168.1.1'];
    return whitelist.includes(req.ip);
  },
  // ... rest of config
});
```

### Q: Should I use Redis for rate limiting?

**A:**
- **Single instance:** No, in-memory is fine
- **2-3 instances:** Optional, nice to have
- **5+ instances:** Yes, required for accuracy
- **Kubernetes:** Yes, definitely

### Q: How do I test rate limits without waiting?

**A:**
```typescript
// In test environment, use shorter windows
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'test' ? 1000 : 60000,
  max: process.env.NODE_ENV === 'test' ? 5 : 60,
});
```

---

## Conclusion

**Immediate Action Required:**
1. Implement Solution 1 (15 minutes)
2. Test with load tool (5 minutes)
3. Verify success rate >95%

**Next Sprint:**
- Implement Solution 2 for better protection
- Add monitoring dashboards
- Document for team

**Future:**
- Implement Solution 3 for user-based limits
- Deploy Redis for horizontal scaling (Solution 4)
- Add API keys for external integrations

**Current Status:** ⚠️ **Blocker for production**  
**After Fix:** ✅ **Production ready**

---

**Last Updated:** November 16, 2024  
**Next Review:** After implementing Solution 1
