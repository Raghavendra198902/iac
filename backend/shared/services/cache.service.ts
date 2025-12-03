import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

class CacheService {
  private client: Redis;
  private defaultTTL: number = 300; // 5 minutes
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
      this.isConnected = true;
    });

    this.client.on('close', () => {
      logger.warn('Redis client connection closed');
      this.isConnected = false;
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache get');
      return null;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const value = await this.client.get(fullKey);
      
      if (!value) {
        logger.debug(`Cache miss: ${fullKey}`);
        return null;
      }

      logger.debug(`Cache hit: ${fullKey}`);
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache set');
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const ttl = options?.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);

      await this.client.setex(fullKey, ttl, serialized);
      logger.debug(`Cache set: ${fullKey} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.client.del(fullKey);
      logger.debug(`Cache delete: ${fullKey}`);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async deleteByPattern(pattern: string, options?: CacheOptions): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const fullPattern = this.buildKey(pattern, options?.prefix);
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(...keys);
      logger.debug(`Cache deleted ${result} keys matching: ${fullPattern}`);
      return result;
    } catch (error) {
      logger.error('Cache delete by pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.client.exists(fullKey);
      return result > 0;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - execute function
    const value = await fetchFunction();
    
    // Store in cache (fire and forget)
    this.set(key, value, options).catch(err => {
      logger.error('Failed to cache value:', err);
    });

    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, options?: CacheOptions): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.client.incr(fullKey);
      
      // Set expiry if specified
      if (options?.ttl) {
        await this.client.expire(fullKey, options.ttl);
      }
      
      return result;
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Get TTL for key
   */
  async getTTL(key: string, options?: CacheOptions): Promise<number> {
    if (!this.isConnected) {
      return -1;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      return await this.client.ttl(fullKey);
    } catch (error) {
      logger.error('Cache getTTL error:', error);
      return -1;
    }
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.flushdb();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    keys: number;
    memory: string;
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    if (!this.isConnected) {
      return {
        keys: 0,
        memory: '0',
        hits: 0,
        misses: 0,
        hitRate: 0,
      };
    }

    try {
      const info = await this.client.info('stats');
      const dbsize = await this.client.dbsize();
      
      // Parse stats from info string
      const hits = this.parseInfoValue(info, 'keyspace_hits') || 0;
      const misses = this.parseInfoValue(info, 'keyspace_misses') || 0;
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;

      const memoryInfo = await this.client.info('memory');
      const memory = this.parseInfoValue(memoryInfo, 'used_memory_human') || '0';

      return {
        keys: dbsize,
        memory,
        hits,
        misses,
        hitRate: Math.round(hitRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Cache getStats error:', error);
      return {
        keys: 0,
        memory: '0',
        hits: 0,
        misses: 0,
        hitRate: 0,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Cache health check error:', error);
      return false;
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      logger.info('Redis client disconnected');
    }
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const defaultPrefix = process.env.CACHE_KEY_PREFIX || 'iac';
    const finalPrefix = prefix || defaultPrefix;
    return `${finalPrefix}:${key}`;
  }

  /**
   * Parse value from Redis INFO string
   */
  private parseInfoValue(info: string, key: string): string | number | null {
    const regex = new RegExp(`${key}:(.+)`);
    const match = info.match(regex);
    if (!match) return null;

    const value = match[1].trim();
    const numValue = Number(value);
    return isNaN(numValue) ? value : numValue;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
