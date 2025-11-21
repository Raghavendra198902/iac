# Feature Flags System - User Guide

## Overview

The Feature Flags system provides dynamic control over feature availability without requiring code deployments. It enables gradual rollouts, A/B testing, user targeting, and emergency kill switches.

## Table of Contents

1. [Key Concepts](#key-concepts)
2. [Flag Configuration](#flag-configuration)
3. [API Reference](#api-reference)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Key Concepts

### Flag Types

**Boolean Flags**
- Simple on/off switches
- Applied to all users when enabled
- Example: Enable/disable a feature globally

**Percentage Rollouts**
- Gradual deployment to a percentage of users (0-100%)
- Uses consistent hashing for stable user experience
- Same user always gets the same experience
- Example: Roll out to 25% → 50% → 100% of users

**User Targeting**
- Target specific users by ID or email
- Perfect for beta testing with select users
- Example: Enable for internal team members

**Subscription Targeting**
- Target users by subscription tier
- Tiers: `free`, `basic`, `pro`, `enterprise`, `admin`
- Example: Premium features for pro/enterprise users

**Environment-Based**
- Different flags for different environments
- Environments: `development`, `staging`, `production`
- Example: Enable in staging but not production

### Flag Structure

```typescript
interface FeatureFlag {
  name: string;                        // Unique flag identifier
  enabled: boolean;                    // Global enable/disable
  description: string;                 // Human-readable description
  rolloutPercentage?: number;          // 0-100, if not set = 100%
  targetUsers?: string[];              // User IDs or emails
  targetSubscriptions?: string[];      // Subscription tiers
  environment?: string[];              // Environments where flag is active
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
  createdBy: string;                   // User who created the flag
}
```

---

## Flag Configuration

### Default Flags

The system initializes with 7 default flags:

| Flag Name | Enabled | Rollout | Target | Description |
|-----------|---------|---------|--------|-------------|
| `ai_recommendations` | ✅ Yes | 100% | All | AI-powered infrastructure recommendations |
| `advanced_caching` | ✅ Yes | 100% | All | Multi-layer caching with Redis |
| `circuit_breakers` | ✅ Yes | 100% | All | Service resilience with circuit breakers |
| `distributed_tracing` | ✅ Yes | 50% | All | OpenTelemetry distributed tracing |
| `beta_features` | ✅ Yes | - | Pro/Enterprise | Beta features for premium users |
| `cost_optimization` | ✅ Yes | 75% | All | Advanced cost optimization algorithms |
| `multi_cloud_deployment` | ❌ No | - | Enterprise | Multi-cloud deployment support |

### Creating a Flag

**Admin-only operation**. Use the API or admin dashboard.

```bash
curl -X PUT http://localhost:3000/api/feature-flags/new_feature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "enabled": true,
    "description": "New experimental feature",
    "rolloutPercentage": 10,
    "targetSubscriptions": ["pro", "enterprise"],
    "environment": ["staging", "production"]
  }'
```

---

## API Reference

### Public Endpoints

#### List All Flags
```http
GET /api/feature-flags
```

**Response:**
```json
{
  "success": true,
  "flags": [
    {
      "name": "ai_recommendations",
      "enabled": true,
      "description": "AI-powered recommendations",
      "rolloutPercentage": 100,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Specific Flag
```http
GET /api/feature-flags/:name
```

**Response:**
```json
{
  "success": true,
  "flag": {
    "name": "distributed_tracing",
    "enabled": true,
    "description": "Distributed tracing with OpenTelemetry",
    "rolloutPercentage": 50,
    "environment": ["development", "staging", "production"]
  }
}
```

### Authenticated Endpoints

#### Evaluate Flag for Current User
```http
POST /api/feature-flags/:name/evaluate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "reason": "enabled_rollout",
  "details": {
    "flagName": "distributed_tracing",
    "userId": "user123",
    "subscription": "pro",
    "environment": "production",
    "rolloutPercentage": 50,
    "userHash": 42
  }
}
```

**Reason Codes:**
- `disabled_globally` - Flag is disabled
- `disabled_environment` - Not active in current environment
- `disabled_subscription` - User's subscription not targeted
- `disabled_user` - User not in target list
- `disabled_rollout` - User not in rollout percentage
- `enabled_subscription` - Enabled via subscription targeting
- `enabled_user` - Enabled via user targeting
- `enabled_rollout` - Enabled via percentage rollout

#### Bulk Evaluate
```http
POST /api/feature-flags/bulk-evaluate
Authorization: Bearer <token>
Content-Type: application/json

{
  "flags": ["ai_recommendations", "beta_features", "cost_optimization"]
}
```

**Response:**
```json
{
  "success": true,
  "evaluations": {
    "ai_recommendations": { "enabled": true, "reason": "enabled_rollout" },
    "beta_features": { "enabled": true, "reason": "enabled_subscription" },
    "cost_optimization": { "enabled": false, "reason": "disabled_rollout" }
  }
}
```

### Admin Endpoints

#### Create/Update Flag
```http
PUT /api/feature-flags/:name
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "enabled": true,
  "description": "Feature description",
  "rolloutPercentage": 50,
  "targetUsers": ["user1@example.com", "user2@example.com"],
  "targetSubscriptions": ["pro", "enterprise"],
  "environment": ["staging", "production"]
}
```

#### Delete Flag
```http
DELETE /api/feature-flags/:name
Authorization: Bearer <admin_token>
```

#### Get Change History
```http
GET /api/feature-flags/:name/history
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "update",
      "user": "admin@example.com",
      "changes": {
        "rolloutPercentage": { "from": 25, "to": 50 }
      }
    }
  ]
}
```

---

## Usage Examples

### In Backend Code

**Method 1: Using Request Object (After Middleware)**
```typescript
// Feature flags middleware adds isEnabled() to req.featureFlags
app.get('/api/recommendations', authMiddleware, async (req, res) => {
  if (req.featureFlags.isEnabled('ai_recommendations')) {
    // Use AI-powered recommendations
    const recommendations = await getAIRecommendations(req.user.id);
    return res.json({ recommendations });
  } else {
    // Use basic recommendations
    const recommendations = await getBasicRecommendations(req.user.id);
    return res.json({ recommendations });
  }
});
```

**Method 2: Direct Evaluation**
```typescript
import { isFeatureEnabled, evaluateFeatureFlag } from './utils/featureFlags';

// Simple boolean check
const enabled = await isFeatureEnabled('beta_features', {
  userId: user.id,
  email: user.email,
  subscription: user.subscription,
  environment: process.env.NODE_ENV
});

// Detailed evaluation with reason
const evaluation = await evaluateFeatureFlag('cost_optimization', context);
console.log(evaluation);
// {
//   enabled: true,
//   reason: 'enabled_rollout',
//   details: { ... }
// }
```

### In Frontend Code

**Method 1: API Call**
```typescript
// Evaluate single flag
const response = await fetch('/api/feature-flags/ai_recommendations/evaluate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const { enabled } = await response.json();

if (enabled) {
  // Show AI recommendations UI
}
```

**Method 2: Bulk Evaluation (More Efficient)**
```typescript
// Evaluate multiple flags at once
const response = await fetch('/api/feature-flags/bulk-evaluate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    flags: ['ai_recommendations', 'beta_features', 'cost_optimization']
  })
});
const { evaluations } = await response.json();

if (evaluations.ai_recommendations.enabled) {
  // Show AI features
}
if (evaluations.beta_features.enabled) {
  // Show beta features
}
```

### React Hook Example

```typescript
// hooks/useFeatureFlag.ts
import { useEffect, useState } from 'react';

export function useFeatureFlag(flagName: string) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/feature-flags/${flagName}/evaluate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        setEnabled(data.enabled);
        setLoading(false);
      });
  }, [flagName]);

  return { enabled, loading };
}

// Usage in component
function AIRecommendations() {
  const { enabled, loading } = useFeatureFlag('ai_recommendations');

  if (loading) return <Spinner />;
  if (!enabled) return null;

  return <AIRecommendationsPanel />;
}
```

---

## Best Practices

### Naming Conventions

**Use snake_case for flag names:**
```
✅ Good: ai_recommendations, beta_features, cost_optimization
❌ Bad: aiRecommendations, Beta-Features, CostOpt
```

**Be descriptive:**
```
✅ Good: multi_cloud_deployment, advanced_analytics
❌ Bad: feature1, new_stuff, test
```

### Gradual Rollout Strategy

**Recommended rollout schedule:**

1. **Internal Testing (0%)**: Deploy code with flag disabled
2. **Canary (1-5%)**: Enable for 1-5% of users, monitor closely
3. **Early Adopters (10-25%)**: Gradually increase if stable
4. **Majority (50-75%)**: Roll out to majority if no issues
5. **Full Release (100%)**: Enable for all users
6. **Code Cleanup**: Remove flag after stable for 2+ weeks

**Example:**
```typescript
// Week 1: Deploy code with flag at 0%
await setFeatureFlag('new_feature', {
  enabled: true,
  rolloutPercentage: 0
});

// Week 2: Internal testing complete, enable 5%
await setFeatureFlag('new_feature', {
  enabled: true,
  rolloutPercentage: 5
});

// Week 3: No issues, ramp to 25%
await setFeatureFlag('new_feature', {
  enabled: true,
  rolloutPercentage: 25
});

// Week 4: Stable, go to 100%
await setFeatureFlag('new_feature', {
  enabled: true,
  rolloutPercentage: 100
});

// Week 6: Remove flag from code
```

### Emergency Kill Switch

**Quickly disable a problematic feature:**
```bash
# Via API
curl -X PUT http://localhost:3000/api/feature-flags/problematic_feature \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Via Admin Dashboard
# Navigate to Feature Flags → Toggle switch to OFF
```

### A/B Testing

**Test two implementations:**
```typescript
// 50% of users get new algorithm, 50% get old
if (req.featureFlags.isEnabled('new_algorithm')) {
  // New implementation
  return newAlgorithm(data);
} else {
  // Old implementation
  return oldAlgorithm(data);
}

// Track metrics for both groups
trackMetric('algorithm_version', req.featureFlags.isEnabled('new_algorithm') ? 'new' : 'old');
trackMetric('processing_time', duration);
trackMetric('user_satisfaction', rating);
```

### Premium Features

**Gate features by subscription:**
```typescript
// Create flag targeting premium tiers
await setFeatureFlag('premium_analytics', {
  enabled: true,
  description: 'Advanced analytics dashboard',
  targetSubscriptions: ['pro', 'enterprise']
});

// In code
if (req.featureFlags.isEnabled('premium_analytics')) {
  return res.json({ analytics: premiumAnalytics });
} else {
  return res.status(403).json({
    error: 'Upgrade to Pro or Enterprise for advanced analytics'
  });
}
```

### Environment-Specific Features

**Enable only in certain environments:**
```typescript
// Debug features only in dev/staging
await setFeatureFlag('debug_panel', {
  enabled: true,
  description: 'Developer debug panel',
  environment: ['development', 'staging']
});

// Beta features in staging before production
await setFeatureFlag('beta_export', {
  enabled: true,
  description: 'New export functionality',
  environment: ['staging']
});
```

---

## Troubleshooting

### Flag Not Taking Effect

**Check evaluation reason:**
```typescript
const evaluation = await evaluateFeatureFlag('my_flag', context);
console.log('Enabled:', evaluation.enabled);
console.log('Reason:', evaluation.reason);
console.log('Details:', evaluation.details);
```

**Common reasons:**
- `disabled_globally`: Flag's `enabled` property is `false`
- `disabled_environment`: Current environment not in `environment` array
- `disabled_subscription`: User's subscription not in `targetSubscriptions`
- `disabled_rollout`: User's hash is above rollout percentage

### Inconsistent User Experience

**Problem**: User sometimes sees feature, sometimes doesn't

**Solution**: Check rollout percentage and user hashing
```typescript
// Verify consistent hashing
const context = {
  userId: 'user123',
  email: 'user@example.com',
  subscription: 'pro'
};

const eval1 = await evaluateFeatureFlag('my_flag', context);
const eval2 = await evaluateFeatureFlag('my_flag', context);

// Should always be the same
console.assert(eval1.enabled === eval2.enabled);
console.assert(eval1.details.userHash === eval2.details.userHash);
```

### Cache Synchronization Issues

**Problem**: Flag changes not reflecting immediately

**Solution**: Redis cache auto-syncs, but you can force refresh:
```typescript
import { initializeFeatureFlags } from './utils/featureFlags';

// Force reload all flags from Redis
await initializeFeatureFlags();
```

**Cache invalidation on update**: The system automatically invalidates cache when flags are updated via API.

### Audit Trail Not Recording

**Problem**: Changes not appearing in history

**Solution**: Ensure user context is provided:
```typescript
// When updating via API, include user in token
// When updating programmatically, provide user:
await setFeatureFlag('my_flag', {
  enabled: true,
  rolloutPercentage: 50
}, 'admin@example.com'); // <-- User parameter
```

### Performance Impact

**Problem**: Feature flag checks slowing down requests

**Solution**: Use bulk evaluation or cache results:
```typescript
// Instead of multiple API calls
const ai = await fetch('/api/feature-flags/ai/evaluate');
const beta = await fetch('/api/feature-flags/beta/evaluate');
const cost = await fetch('/api/feature-flags/cost/evaluate');

// Use bulk evaluation (single API call)
const response = await fetch('/api/feature-flags/bulk-evaluate', {
  method: 'POST',
  body: JSON.stringify({ flags: ['ai', 'beta', 'cost'] })
});
```

**Backend optimization**: Use in-memory cache (already implemented)
```typescript
// Fast: Uses in-memory cache (microseconds)
const enabled = await isFeatureEnabled('my_flag', context);

// Slow: Queries Redis directly (milliseconds)
const flag = await redisClient.get(`feature_flag:${name}`);
```

---

## Monitoring & Observability

### Flag Evaluation Tracking

All flag evaluations are traced in OpenTelemetry:

```typescript
// Automatic span event for every evaluation
{
  name: 'feature_flag_evaluated',
  attributes: {
    flag_name: 'ai_recommendations',
    enabled: true,
    reason: 'enabled_rollout',
    user_id: 'user123',
    subscription: 'pro'
  }
}
```

View in Jaeger UI: http://localhost:16686

### Change Audit Trail

Every flag change is logged:
```typescript
{
  timestamp: '2024-01-15T10:30:00Z',
  action: 'update',
  user: 'admin@example.com',
  flagName: 'beta_features',
  changes: {
    rolloutPercentage: { from: 25, to: 50 }
  }
}
```

Access via API: `GET /api/feature-flags/:name/history`

### Admin Dashboard

Real-time monitoring at: http://localhost:3000/admin

**Features:**
- Live flag status
- Toggle flags on/off
- Adjust rollout percentages
- View targeting rules
- Change history
- Usage statistics

---

## Migration Guide

### Removing a Flag

Once a feature is stable and rolled out to 100%, remove the flag:

1. **Verify 100% rollout for 2+ weeks**
2. **Remove flag checks from code:**
   ```typescript
   // Before
   if (req.featureFlags.isEnabled('stable_feature')) {
     return newImplementation();
   } else {
     return oldImplementation();
   }
   
   // After
   return newImplementation();
   ```
3. **Delete flag via API:**
   ```bash
   curl -X DELETE http://localhost:3000/api/feature-flags/stable_feature \
     -H "Authorization: Bearer <admin_token>"
   ```
4. **Deploy code without flag**

### Renaming a Flag

1. **Create new flag with new name**
2. **Update code to check new flag**
3. **Copy rollout percentage from old flag**
4. **Deploy code**
5. **Delete old flag**

---

## Support

- **Documentation**: `/docs/features/FEATURE_FLAGS.md`
- **Admin Dashboard**: http://localhost:3000/admin
- **API Endpoint**: `GET /api/feature-flags`
- **Jaeger Tracing**: http://localhost:16686
- **Grafana Dashboards**: http://localhost:3030

For issues or questions, contact the platform team or check the troubleshooting section above.
