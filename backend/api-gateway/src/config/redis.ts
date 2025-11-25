import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Create Redis client with optional connection
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis max retries reached, stopping reconnection attempts');
        return false;
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Handle Redis connection errors gracefully
redisClient.on('error', (err) => {
  logger.error('Redis client error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

// Connect to Redis (non-blocking)
redisClient.connect().catch((err) => {
  logger.warn('Redis connection failed, continuing without cache', { error: err.message });
});

export { redisClient };
