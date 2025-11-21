# Feature Flags

Advanced feature flag management for gradual rollouts, A/B testing, and canary deployments.

---

## Overview

IAC Dharma's feature flag system provides fine-grained control over feature releases, enabling:
- **Gradual Rollouts**: Release features to subsets of users
- **A/B Testing**: Compare different implementations
- **Canary Deployments**: Test in production safely
- **Kill Switches**: Instantly disable problematic features
- **User Targeting**: Enable features for specific users/groups
- **Environment Control**: Different flags per environment

### Architecture

```
┌─────────────────────────────────────────────────┐
│              API Gateway / Services              │
│  ┌───────────────────────────────────────────┐  │
│  │    Feature Flag Client Middleware         │  │
│  │  - Cache feature flags locally (1 min)    │  │
│  │  - Fallback to default values             │  │
│  │  - Log flag evaluations                   │  │
│  └───────────┬───────────────────────────────┘  │
└──────────────┼──────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│            Redis Feature Flag Store              │
│  ┌────────────────────────────────────────────┐  │
│  │  Key: feature:{featureName}                │  │
│  │  Value: {                                  │  │
│  │    enabled: boolean                        │  │
│  │    rolloutPercentage: number (0-100)       │  │
│  │    targetUsers: string[]                   │  │
│  │    targetGroups: string[]                  │  │
│  │    environments: string[]                  │  │
│  │    createdAt: timestamp                    │  │
│  │    updatedAt: timestamp                    │  │
│  │  }                                         │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Core Concepts

### Flag Types

#### 1. Boolean Flags
Simple on/off toggles for features.

```javascript
// Check if feature is enabled
const isEnabled = await featureFlags.isEnabled('new-blueprint-designer');

if (isEnabled) {
  // Use new blueprint designer
  return renderNewDesigner();
} else {
  // Use legacy designer
  return renderLegacyDesigner();
}
```

#### 2. Percentage Rollouts
Gradually release features to a percentage of users.

```javascript
// Enable for 20% of users
await featureFlags.set('ai-cost-optimizer', {
  enabled: true,
  rolloutPercentage: 20  // 20% of users
});
```

#### 3. User Targeting
Enable features for specific users or groups.

```javascript
// Enable for beta users
await featureFlags.set('advanced-analytics', {
  enabled: true,
  targetGroups: ['beta-testers', 'internal-team'],
  targetUsers: ['user-123', 'user-456']
});
```

#### 4. Environment-Specific
Different flag states per environment.

```javascript
// Enable only in development and staging
await featureFlags.set('debug-mode', {
  enabled: true,
  environments: ['development', 'staging']
});
```

---

## API Reference

### REST API Endpoints

#### Create/Update Feature Flag
```http
POST /api/feature-flags
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "name": "new-iac-generator",
  "enabled": true,
  "rolloutPercentage": 25,
  "targetUsers": [],
  "targetGroups": ["premium-users"],
  "environments": ["production"],
  "description": "New IAC generation engine with improved performance"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "flag-123",
    "name": "new-iac-generator",
    "enabled": true,
    "rolloutPercentage": 25,
    "targetUsers": [],
    "targetGroups": ["premium-users"],
    "environments": ["production"],
    "description": "New IAC generation engine with improved performance",
    "createdAt": "2025-11-21T10:00:00Z",
    "updatedAt": "2025-11-21T10:00:00Z"
  }
}
```

#### List All Feature Flags
```http
GET /api/feature-flags
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "new-iac-generator",
      "enabled": true,
      "rolloutPercentage": 25,
      "targetGroups": ["premium-users"],
      "environments": ["production"]
    },
    {
      "name": "ai-cost-optimizer",
      "enabled": true,
      "rolloutPercentage": 50,
      "environments": ["production"]
    }
  ],
  "total": 2
}
```

#### Get Feature Flag Status
```http
GET /api/feature-flags/:flagName
Authorization: Bearer <jwt-token>
```

#### Delete Feature Flag
```http
DELETE /api/feature-flags/:flagName
Authorization: Bearer <jwt-token>
```

#### Check Flag for Current User
```http
GET /api/feature-flags/:flagName/check
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "flagName": "new-iac-generator",
    "enabled": true,
    "reason": "user-in-target-group"
  }
}
```

---

## Usage Examples

### Backend (Node.js/TypeScript)

#### Initialization
```typescript
import { FeatureFlagService } from './services/feature-flags';

// Initialize feature flag service
const featureFlags = new FeatureFlagService({
  redis: redisClient,
  cacheTTL: 60000, // 1 minute cache
  defaultValue: false // Default when flag doesn't exist
});
```

#### Checking Flags
```typescript
// Simple boolean check
const isEnabled = await featureFlags.isEnabled('new-blueprint-designer');

// Check with user context
const isEnabledForUser = await featureFlags.isEnabledForUser(
  'ai-cost-optimizer',
  {
    userId: 'user-123',
    groups: ['premium-users'],
    environment: process.env.NODE_ENV
  }
);

if (isEnabledForUser) {
  // Use AI cost optimizer
  const optimization = await aiCostOptimizer.optimize(blueprint);
  return optimization;
}
```

#### Creating Flags
```typescript
// Create a new feature flag
await featureFlags.create({
  name: 'multi-cloud-sync',
  enabled: true,
  rolloutPercentage: 10, // 10% rollout
  description: 'Synchronize resources across multiple clouds'
});

// Update existing flag
await featureFlags.update('multi-cloud-sync', {
  rolloutPercentage: 25 // Increase to 25%
});
```

#### Gradual Rollout Strategy
```typescript
// Day 1: 10% rollout
await featureFlags.update('new-feature', { rolloutPercentage: 10 });

// Day 3: 25% rollout (if no issues)
await featureFlags.update('new-feature', { rolloutPercentage: 25 });

// Day 7: 50% rollout
await featureFlags.update('new-feature', { rolloutPercentage: 50 });

// Day 14: 100% rollout
await featureFlags.update('new-feature', { rolloutPercentage: 100 });

// Remove flag after full rollout
await featureFlags.delete('new-feature');
```

### Frontend (React/TypeScript)

#### React Hook
```typescript
import { useFeatureFlag } from './hooks/useFeatureFlag';

function BlueprintDesigner() {
  const { isEnabled, loading } = useFeatureFlag('new-blueprint-designer');

  if (loading) {
    return <LoadingSpinner />;
  }

  return isEnabled ? <NewBlueprintDesigner /> : <LegacyBlueprintDesigner />;
}
```

#### Context Provider
```typescript
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';

function App() {
  return (
    <FeatureFlagsProvider>
      <Router>
        <Routes />
      </Router>
    </FeatureFlagsProvider>
  );
}
```

#### Multiple Flags
```typescript
import { useFeatureFlags } from './hooks/useFeatureFlags';

function Dashboard() {
  const flags = useFeatureFlags([
    'new-dashboard',
    'advanced-analytics',
    'ai-recommendations'
  ]);

  return (
    <div>
      {flags['new-dashboard'] && <NewDashboard />}
      {flags['advanced-analytics'] && <AnalyticsPanel />}
      {flags['ai-recommendations'] && <AIRecommendations />}
    </div>
  );
}
```

---

## A/B Testing

### Setting Up A/B Tests

```typescript
// Create variant flags
await featureFlags.create({
  name: 'checkout-flow-variant-a',
  enabled: true,
  rolloutPercentage: 50,
  description: 'Original checkout flow'
});

await featureFlags.create({
  name: 'checkout-flow-variant-b',
  enabled: true,
  rolloutPercentage: 50,
  description: 'New simplified checkout flow'
});
```

### Tracking Metrics

```typescript
// Record conversion for variant A
if (await featureFlags.isEnabled('checkout-flow-variant-a')) {
  await metrics.record('checkout-conversion', {
    variant: 'A',
    userId: user.id,
    timestamp: Date.now()
  });
}

// Record conversion for variant B
if (await featureFlags.isEnabled('checkout-flow-variant-b')) {
  await metrics.record('checkout-conversion', {
    variant: 'B',
    userId: user.id,
    timestamp: Date.now()
  });
}
```

### Analyzing Results

```sql
-- Compare conversion rates
SELECT 
  variant,
  COUNT(DISTINCT user_id) as users,
  COUNT(*) as conversions,
  (COUNT(*) * 100.0 / COUNT(DISTINCT user_id)) as conversion_rate
FROM checkout_metrics
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY variant;
```

---

## Canary Deployments

### Step-by-Step Canary Release

```typescript
// Step 1: Deploy new version with feature flag disabled
await deployService('blueprint-service', 'v2.0.0');

// Step 2: Enable for internal team only
await featureFlags.update('blueprint-v2', {
  enabled: true,
  targetGroups: ['internal-team']
});

// Step 3: Monitor metrics for 24 hours
await monitorMetrics('blueprint-v2', {
  errorRate: { threshold: 1.0 },  // < 1% error rate
  latency: { p95: 200 }            // p95 < 200ms
});

// Step 4: Gradually increase rollout
await featureFlags.update('blueprint-v2', { rolloutPercentage: 5 });
await sleep(24 * 60 * 60 * 1000); // Wait 24 hours

await featureFlags.update('blueprint-v2', { rolloutPercentage: 25 });
await sleep(24 * 60 * 60 * 1000);

await featureFlags.update('blueprint-v2', { rolloutPercentage: 50 });
await sleep(24 * 60 * 60 * 1000);

// Step 5: Full rollout
await featureFlags.update('blueprint-v2', { rolloutPercentage: 100 });

// Step 6: Remove flag after stabilization
await sleep(7 * 24 * 60 * 60 * 1000); // Wait 7 days
await featureFlags.delete('blueprint-v2');
```

### Automated Rollback

```typescript
// Monitor for issues and auto-rollback
async function monitorAndRollback(flagName: string, thresholds: Thresholds) {
  const metrics = await getMetrics(flagName);
  
  if (metrics.errorRate > thresholds.errorRate) {
    console.error(`Error rate ${metrics.errorRate}% exceeds threshold ${thresholds.errorRate}%`);
    
    // Automatic rollback
    await featureFlags.update(flagName, { enabled: false });
    await sendAlert(`Feature ${flagName} automatically disabled due to high error rate`);
    
    return false;
  }
  
  return true;
}
```

---

## Admin Dashboard

### Feature Flag Management UI

Access the admin dashboard at: **http://localhost:3000/admin/feature-flags**

#### Features:
- **Create/Edit/Delete** feature flags
- **Real-time status** of all flags
- **Rollout percentage** slider
- **Target users/groups** management
- **Audit log** of flag changes
- **Metrics visualization** for A/B tests

#### Dashboard Sections:

1. **Active Flags** - Currently enabled features
2. **Scheduled Rollouts** - Planned gradual releases
3. **A/B Tests** - Running experiments with metrics
4. **Flag History** - Audit trail of changes
5. **User Overrides** - Manual flag overrides for specific users

---

## Best Practices

### 1. Naming Conventions

```
✅ Good:
- new-blueprint-designer
- ai-cost-optimizer-v2
- multi-cloud-sync

❌ Bad:
- feature1
- test
- newThing
```

### 2. Lifecycle Management

```typescript
// 1. Create flag before deployment
await featureFlags.create({ name: 'new-feature', enabled: false });

// 2. Deploy code with flag check
if (await featureFlags.isEnabled('new-feature')) {
  // New code path
}

// 3. Enable gradually
// 10% → 25% → 50% → 100%

// 4. Remove flag after stabilization (2-4 weeks)
await featureFlags.delete('new-feature');
```

### 3. Default Values

Always provide safe defaults:

```typescript
// ✅ Safe: Defaults to false if flag doesn't exist
const isEnabled = await featureFlags.isEnabled('new-feature') ?? false;

// ❌ Unsafe: Could throw error
const isEnabled = await featureFlags.isEnabled('new-feature');
```

### 4. Cache Strategy

```typescript
// Configure appropriate cache TTL
const featureFlags = new FeatureFlagService({
  cacheTTL: 60000, // 1 minute for fast-changing flags
  // OR
  cacheTTL: 300000 // 5 minutes for stable flags
});
```

### 5. Monitoring

Track flag usage and impact:

```typescript
// Log flag evaluations
logger.info('Feature flag evaluated', {
  flagName: 'new-feature',
  enabled: true,
  userId: user.id,
  reason: 'user-in-target-group'
});

// Track metrics
metrics.increment('feature_flag.evaluation', {
  flag: 'new-feature',
  result: 'enabled'
});
```

---

## Troubleshooting

### Flag Not Working

**Problem**: Feature flag not taking effect

**Solutions**:
```bash
# Check Redis connection
docker exec -it redis redis-cli PING

# View flag value in Redis
docker exec -it redis redis-cli GET "feature:new-feature"

# Check cache expiration
# Flags are cached for 1 minute by default

# Force cache refresh
curl -X POST http://localhost:3000/api/feature-flags/refresh \
  -H "Authorization: Bearer <token>"
```

### Inconsistent Behavior

**Problem**: Flag behaves differently for same user

**Cause**: Hash-based percentage rollout

**Solution**:
```typescript
// Ensure consistent user ID hashing
const hash = crypto.createHash('md5')
  .update(userId + flagName)
  .digest('hex');
const percentage = parseInt(hash.substring(0, 8), 16) % 100;

// User always gets same result for same flag
```

### Flag Lag

**Problem**: Flag changes take time to propagate

**Cause**: Client-side caching

**Solution**:
```typescript
// Reduce cache TTL for time-sensitive flags
await featureFlags.create({
  name: 'urgent-fix',
  enabled: true,
  cacheTTL: 10000 // 10 seconds
});

// OR use Redis pub/sub for instant updates
redisClient.subscribe('feature-flag-updates');
```

---

## Performance Considerations

### Caching Strategy

```typescript
// Local cache with Redis fallback
class FeatureFlagService {
  private cache = new Map<string, CacheEntry>();
  
  async isEnabled(flagName: string): Promise<boolean> {
    // Check local cache first (fastest)
    const cached = this.cache.get(flagName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
    
    // Check Redis (fast)
    const value = await this.redis.get(`feature:${flagName}`);
    
    // Cache locally for 1 minute
    this.cache.set(flagName, {
      value: value === 'true',
      expiresAt: Date.now() + 60000
    });
    
    return value === 'true';
  }
}
```

### Batch Evaluation

```typescript
// ✅ Efficient: Batch fetch multiple flags
const flags = await featureFlags.getMultiple([
  'feature-a',
  'feature-b',
  'feature-c'
]);

// ❌ Inefficient: Multiple round-trips
const flagA = await featureFlags.isEnabled('feature-a');
const flagB = await featureFlags.isEnabled('feature-b');
const flagC = await featureFlags.isEnabled('feature-c');
```

---

## Configuration

### Environment Variables

```bash
# Feature Flags Configuration
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_CACHE_TTL=60000          # 1 minute
FEATURE_FLAGS_DEFAULT_VALUE=false      # Default when flag missing
REDIS_FEATURE_FLAGS_KEY_PREFIX=feature:

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Service Configuration

```typescript
// config/feature-flags.ts
export const featureFlagsConfig = {
  enabled: process.env.FEATURE_FLAGS_ENABLED === 'true',
  cacheTTL: parseInt(process.env.FEATURE_FLAGS_CACHE_TTL || '60000'),
  defaultValue: process.env.FEATURE_FLAGS_DEFAULT_VALUE === 'true',
  keyPrefix: process.env.REDIS_FEATURE_FLAGS_KEY_PREFIX || 'feature:',
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  }
};
```

---

## Next Steps

- **[Admin Dashboard](Admin-Dashboard)** - Visual feature flag management
- **[API Reference](API-Reference)** - Complete API documentation
- **[Caching Strategy](Caching-Strategy)** - Multi-layer caching implementation
- **[Monitoring Setup](Monitoring-Setup)** - Track flag usage and metrics
- **[CI/CD Pipeline](CI-CD-Pipeline)** - Automated feature deployments

---

**Questions or issues?** [Open a GitHub Issue](https://github.com/Raghavendra198902/iac/issues)

---

Last Updated: November 21, 2025 | [Back to Home](Home)
