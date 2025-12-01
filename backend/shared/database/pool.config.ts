import { Pool, PoolConfig } from 'pg';

/**
 * Standardized PostgreSQL connection pool configuration for IAC Dharma services
 * 
 * This module provides a consistent database connection pool setup across all
 * microservices with proper error handling, retry logic, and connection management.
 */

// Standardized PostgreSQL connection pool configuration
export const createDatabasePool = (customConfig?: Partial<PoolConfig>): Pool => {
  const config: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'iac_dharma',
    user: process.env.DB_USER || 'dharma_admin',
    password: process.env.DB_PASSWORD,
    
    // Connection pool settings
    max: parseInt(process.env.DB_POOL_MAX || '20'),           // Maximum pool size
    min: parseInt(process.env.DB_POOL_MIN || '2'),            // Minimum pool size
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),  // 30 seconds
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '5000'), // 5 seconds
    
    // Retry configuration
    maxUses: 7500, // Close connection after 7500 queries to prevent memory leaks
    
    // Keep-alive
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000, // 10 seconds
    
    // Application name for monitoring
    application_name: process.env.SERVICE_NAME || 'dharma-service',
    
    // Custom overrides
    ...customConfig
  };
  
  const pool = new Pool(config);
  
  // Error handling
  pool.on('error', (err, client) => {
    console.error('❌ Unexpected database error:', err);
    // Don't exit process, pool will handle reconnection
  });
  
  pool.on('connect', (client) => {
    console.log(`✅ Database connection established (pool size: ${pool.totalCount}/${config.max})`);
  });
  
  pool.on('remove', (client) => {
    console.log(`⚠️  Database connection removed (pool size: ${pool.totalCount}/${config.max})`);
  });
  
  return pool;
};

/**
 * Connection retry with exponential backoff
 * 
 * Attempts to establish database connection with retry logic to handle
 * temporary network issues or database startup delays.
 * 
 * @param pool - PostgreSQL connection pool
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @param initialDelay - Initial delay in milliseconds (default: 1000)
 */
export const connectWithRetry = async (
  pool: Pool, 
  maxRetries = 5, 
  initialDelay = 1000
): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      console.log('✅ Database connection successful');
      client.release();
      return;
    } catch (error) {
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.error(
        `❌ Database connection attempt ${attempt}/${maxRetries} failed. ` +
        `Retrying in ${delay}ms...`,
        error
      );
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Health check query
 * 
 * Simple query to verify database connectivity and responsiveness.
 * Useful for health check endpoints.
 * 
 * @param pool - PostgreSQL connection pool
 * @returns true if database is healthy, false otherwise
 */
export const checkDatabaseHealth = async (pool: Pool): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

/**
 * Get detailed pool statistics
 * 
 * Returns current connection pool metrics for monitoring.
 * 
 * @param pool - PostgreSQL connection pool
 * @returns Object with pool statistics
 */
export const getPoolStats = (pool: Pool) => {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount
  };
};

/**
 * Graceful shutdown
 * 
 * Closes all connections in the pool gracefully.
 * Should be called during application shutdown.
 * 
 * @param pool - PostgreSQL connection pool
 */
export const closeDatabasePool = async (pool: Pool): Promise<void> => {
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
};

export default createDatabasePool;
