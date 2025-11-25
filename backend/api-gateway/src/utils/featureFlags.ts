/**
 * Feature Flags System
 * 
 * Provides dynamic feature toggling, gradual rollouts, A/B testing,
 * and environment-based feature control.
 * 
 * Features:
 * - Boolean flags (on/off)
 * - Percentage rollouts (0-100%)
 * - User-based targeting
 * - Environment-based flags
 * - Real-time flag updates (Redis-backed)
 * - Flag change history
 * - Emergency kill switches
 */

import { getRedisClient } from './cache';
import { logger } from './logger';
import { addSpanEvent } from './tracing';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number; // 0-100, for gradual rollouts
  targetUsers?: string[]; // Specific user IDs
  targetSubscriptions?: string[]; // Subscription tiers
  environment?: string[]; // Environments where flag is active
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FlagEvaluationContext {
  userId?: string;
  email?: string;
  subscription?: string;
  environment?: string;
}

// In-memory cache for flags (synced with Redis)
const flagCache = new Map<string, FeatureFlag>();
const REDIS_FLAG_PREFIX = 'feature_flag:';
const REDIS_FLAG_LIST_KEY = 'feature_flags:all';

/**
 * Initialize feature flags from Redis
 */
export async function initializeFeatureFlags(): Promise<void> {
  try {
    const redis = getRedisClient();
    
    // Check if Redis is connected before attempting to fetch
    if (redis.status !== 'ready' && redis.status !== 'connect') {
      logger.warn('Redis not ready, skipping feature flags initialization from Redis');
      return;
    }
    
    const flagNames = await redis.smembers(REDIS_FLAG_LIST_KEY);

    for (const flagName of flagNames) {
      const flagData = await redis.get(`${REDIS_FLAG_PREFIX}${flagName}`);
      if (flagData) {
        const flag = JSON.parse(flagData);
        flag.createdAt = new Date(flag.createdAt);
        flag.updatedAt = new Date(flag.updatedAt);
        flagCache.set(flagName, flag);
      }
    }

    logger.info('Feature flags initialized from Redis', { count: flagCache.size });
  } catch (error) {
    logger.warn('Failed to initialize feature flags from Redis, using defaults only', { error: (error as Error).message });
    // Continue with empty cache - feature flags will work with in-memory defaults
  }
}

/**
 * Create or update a feature flag
 */
export async function setFeatureFlag(
  name: string,
  flag: Partial<FeatureFlag>,
  updatedBy: string
): Promise<FeatureFlag> {
  const existing = flagCache.get(name);

  const featureFlag: FeatureFlag = {
    name,
    enabled: flag.enabled ?? existing?.enabled ?? false,
    description: flag.description ?? existing?.description ?? '',
    rolloutPercentage: flag.rolloutPercentage ?? existing?.rolloutPercentage,
    targetUsers: flag.targetUsers ?? existing?.targetUsers,
    targetSubscriptions: flag.targetSubscriptions ?? existing?.targetSubscriptions,
    environment: flag.environment ?? existing?.environment,
    createdAt: existing?.createdAt ?? new Date(),
    updatedAt: new Date(),
    createdBy: existing?.createdBy ?? updatedBy,
  };

  // Always update in-memory cache first
  flagCache.set(name, featureFlag);

  try {
    const redis = getRedisClient();
    
    // Only persist to Redis if connected
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.set(
        `${REDIS_FLAG_PREFIX}${name}`,
        JSON.stringify(featureFlag),
        'EX',
        86400 * 30 // 30 days TTL
      );
      await redis.sadd(REDIS_FLAG_LIST_KEY, name);

      logger.info('Feature flag updated and persisted to Redis', {
        name,
        enabled: featureFlag.enabled,
        updatedBy,
      });

      // Record audit log
      await recordFlagChange(name, featureFlag, updatedBy);
    } else {
      logger.warn('Feature flag updated in memory only (Redis not available)', {
        name,
        enabled: featureFlag.enabled,
        updatedBy,
      });
    }
  } catch (error) {
    logger.warn('Failed to persist feature flag to Redis, using in-memory only', { name, error: (error as Error).message });
    // Don't throw - flag is still set in memory
  }

  return featureFlag;
}

/**
 * Get a feature flag by name
 */
export function getFeatureFlag(name: string): FeatureFlag | undefined {
  return flagCache.get(name);
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Array.from(flagCache.values());
}

/**
 * Delete a feature flag
 */
export async function deleteFeatureFlag(name: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del(`${REDIS_FLAG_PREFIX}${name}`);
    await redis.srem(REDIS_FLAG_LIST_KEY, name);
    flagCache.delete(name);

    logger.info('Feature flag deleted', { name });
  } catch (error) {
    logger.error('Failed to delete feature flag', { name, error });
    throw error;
  }
}

/**
 * Check if a feature is enabled for a given context
 */
export function isFeatureEnabled(
  flagName: string,
  context: FlagEvaluationContext = {}
): boolean {
  try {
    const flag = flagCache.get(flagName);

    // Flag doesn't exist - default to disabled
    if (!flag) {
      return false;
    }

    // Flag is globally disabled
    if (!flag.enabled) {
      addSpanEvent('feature_flag.evaluated', {
        flag: flagName,
        result: 'disabled_globally',
      });
      return false;
    }

    // Check environment
    if (flag.environment && flag.environment.length > 0) {
      const env = context.environment || process.env.NODE_ENV || 'development';
      if (!flag.environment.includes(env)) {
        addSpanEvent('feature_flag.evaluated', {
          flag: flagName,
          result: 'disabled_environment',
          environment: env,
        });
        return false;
      }
    }

    // Check target users
    if (flag.targetUsers && flag.targetUsers.length > 0) {
      if (context.userId && flag.targetUsers.includes(context.userId)) {
        addSpanEvent('feature_flag.evaluated', {
          flag: flagName,
          result: 'enabled_target_user',
          userId: context.userId,
        });
        return true;
      }
      if (context.email && flag.targetUsers.includes(context.email)) {
        addSpanEvent('feature_flag.evaluated', {
          flag: flagName,
          result: 'enabled_target_email',
        });
        return true;
      }
    }

    // Check subscription tiers
    if (flag.targetSubscriptions && flag.targetSubscriptions.length > 0) {
      if (context.subscription && flag.targetSubscriptions.includes(context.subscription)) {
        addSpanEvent('feature_flag.evaluated', {
          flag: flagName,
          result: 'enabled_subscription',
          subscription: context.subscription,
        });
        return true;
      }
      // If subscription targeting is set but user doesn't match, disable
      if (context.subscription) {
        addSpanEvent('feature_flag.evaluated', {
          flag: flagName,
          result: 'disabled_subscription',
          subscription: context.subscription,
        });
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = hashString(context.userId || context.email || 'anonymous');
      const userPercentile = hash % 100;
      const enabled = userPercentile < flag.rolloutPercentage;

      addSpanEvent('feature_flag.evaluated', {
        flag: flagName,
        result: enabled ? 'enabled_rollout' : 'disabled_rollout',
        rollout_percentage: flag.rolloutPercentage,
        user_percentile: userPercentile,
      });

      return enabled;
    }

    // Default: flag is enabled
    addSpanEvent('feature_flag.evaluated', {
      flag: flagName,
      result: 'enabled_default',
    });
    return true;
  } catch (error) {
    logger.error('Error evaluating feature flag', { flagName, error });
    return false; // Fail closed
  }
}

/**
 * Get flag evaluation details (for debugging)
 */
export function evaluateFeatureFlag(
  flagName: string,
  context: FlagEvaluationContext = {}
): { enabled: boolean; reason: string; details: any } {
  const flag = flagCache.get(flagName);

  if (!flag) {
    return {
      enabled: false,
      reason: 'flag_not_found',
      details: { flagName },
    };
  }

  if (!flag.enabled) {
    return {
      enabled: false,
      reason: 'disabled_globally',
      details: { flag },
    };
  }

  const env = context.environment || process.env.NODE_ENV || 'development';
  if (flag.environment && flag.environment.length > 0 && !flag.environment.includes(env)) {
    return {
      enabled: false,
      reason: 'disabled_environment',
      details: { environment: env, allowedEnvironments: flag.environment },
    };
  }

  if (flag.targetUsers && flag.targetUsers.length > 0) {
    if (context.userId && flag.targetUsers.includes(context.userId)) {
      return {
        enabled: true,
        reason: 'enabled_target_user',
        details: { userId: context.userId },
      };
    }
    if (context.email && flag.targetUsers.includes(context.email)) {
      return {
        enabled: true,
        reason: 'enabled_target_email',
        details: { email: context.email },
      };
    }
  }

  if (flag.targetSubscriptions && flag.targetSubscriptions.length > 0) {
    if (context.subscription && flag.targetSubscriptions.includes(context.subscription)) {
      return {
        enabled: true,
        reason: 'enabled_subscription',
        details: { subscription: context.subscription },
      };
    }
    if (context.subscription) {
      return {
        enabled: false,
        reason: 'disabled_subscription',
        details: { subscription: context.subscription, allowedSubscriptions: flag.targetSubscriptions },
      };
    }
  }

  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    const hash = hashString(context.userId || context.email || 'anonymous');
    const userPercentile = hash % 100;
    const enabled = userPercentile < flag.rolloutPercentage;

    return {
      enabled,
      reason: enabled ? 'enabled_rollout' : 'disabled_rollout',
      details: {
        rolloutPercentage: flag.rolloutPercentage,
        userPercentile,
      },
    };
  }

  return {
    enabled: true,
    reason: 'enabled_default',
    details: { flag },
  };
}

/**
 * Hash function for consistent user bucketing
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Record flag change in audit log
 */
async function recordFlagChange(
  flagName: string,
  flag: FeatureFlag,
  changedBy: string
): Promise<void> {
  try {
    const redis = getRedisClient();
    const auditEntry = {
      flagName,
      flag,
      changedBy,
      timestamp: new Date().toISOString(),
    };

    await redis.lpush(
      `${REDIS_FLAG_PREFIX}${flagName}:history`,
      JSON.stringify(auditEntry)
    );
    await redis.ltrim(`${REDIS_FLAG_PREFIX}${flagName}:history`, 0, 99); // Keep last 100 changes
  } catch (error) {
    logger.error('Failed to record flag change', { flagName, error });
  }
}

/**
 * Get flag change history
 */
export async function getFlagHistory(flagName: string): Promise<any[]> {
  try {
    const redis = getRedisClient();
    const history = await redis.lrange(`${REDIS_FLAG_PREFIX}${flagName}:history`, 0, -1);
    return history.map(entry => JSON.parse(entry));
  } catch (error) {
    logger.error('Failed to get flag history', { flagName, error });
    return [];
  }
}

/**
 * Middleware to inject feature flag context
 */
export function featureFlagMiddleware(req: any, res: any, next: any): void {
  req.featureFlags = {
    isEnabled: (flagName: string) => {
      const context: FlagEvaluationContext = {
        userId: req.user?.id,
        email: req.user?.email,
        subscription: req.user?.subscription,
        environment: process.env.NODE_ENV,
      };
      return isFeatureEnabled(flagName, context);
    },
    evaluate: (flagName: string) => {
      const context: FlagEvaluationContext = {
        userId: req.user?.id,
        email: req.user?.email,
        subscription: req.user?.subscription,
        environment: process.env.NODE_ENV,
      };
      return evaluateFeatureFlag(flagName, context);
    },
  };
  next();
}

/**
 * Initialize default feature flags
 */
export async function initializeDefaultFlags(): Promise<void> {
  const defaults: Array<{ name: string; flag: Partial<FeatureFlag> }> = [
    {
      name: 'ai_recommendations',
      flag: {
        enabled: true,
        description: 'Enable AI-powered infrastructure recommendations',
        rolloutPercentage: 100,
        environment: ['development', 'staging', 'production'],
      },
    },
    {
      name: 'advanced_caching',
      flag: {
        enabled: true,
        description: 'Enable multi-layer caching with Redis',
        rolloutPercentage: 100,
      },
    },
    {
      name: 'circuit_breakers',
      flag: {
        enabled: true,
        description: 'Enable circuit breakers for service resilience',
        rolloutPercentage: 100,
      },
    },
    {
      name: 'distributed_tracing',
      flag: {
        enabled: true,
        description: 'Enable OpenTelemetry distributed tracing',
        rolloutPercentage: 50, // Gradual rollout
      },
    },
    {
      name: 'beta_features',
      flag: {
        enabled: true,
        description: 'Access to beta features',
        targetSubscriptions: ['pro', 'enterprise'],
      },
    },
    {
      name: 'cost_optimization',
      flag: {
        enabled: true,
        description: 'Advanced cost optimization suggestions',
        rolloutPercentage: 75,
      },
    },
    {
      name: 'multi_cloud_deployment',
      flag: {
        enabled: false,
        description: 'Deploy to multiple cloud providers simultaneously',
        targetSubscriptions: ['enterprise'],
      },
    },
  ];

  for (const { name, flag } of defaults) {
    const existing = getFeatureFlag(name);
    if (!existing) {
      await setFeatureFlag(name, flag, 'system');
    }
  }

  logger.info('Default feature flags initialized', { count: defaults.length });
}
