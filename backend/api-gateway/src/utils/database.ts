import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from './logger';

/**
 * PostgreSQL Database Connection Pool
 * Provides connection pooling and query execution utilities
 */

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma_admin',
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'dharma_pass_dev'),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection not available
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : false
};

// Create connection pool
const pool = new Pool(poolConfig);

// Pool error handling
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle database client', { error: err.message });
});

/**
 * Execute a query with automatic error handling and logging
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Executed query', {
      text: text.substring(0, 100), // Log first 100 chars
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
    
    return result;
  } catch (error: any) {
    logger.error('Database query error', {
      error: error.message,
      query: text.substring(0, 100),
      params: params?.length || 0,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  
  // Override the query method to add logging
  const originalQuery = client.query.bind(client);
  client.query = async (...args: any[]) => {
    const start = Date.now();
    try {
      const result = await originalQuery(...args);
      const duration = Date.now() - start;
      logger.debug('Transaction query', { duration: `${duration}ms` });
      return result;
    } catch (error: any) {
      logger.error('Transaction query error', { error: error.message });
      throw error;
    }
  };
  
  return client;
}

/**
 * Execute a transaction with automatic commit/rollback
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now, current_database() as db');
    logger.info('Database connection successful', {
      database: result.rows[0].db,
      timestamp: result.rows[0].now,
    });
    return true;
  } catch (error: any) {
    logger.error('Database connection failed', { error: error.message });
    return false;
  }
}

/**
 * Close all connections in the pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
  logger.info('Database connection pool closed');
}

/**
 * Get pool statistics
 */
export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

// Export pool for advanced usage
export { pool };

// Initialize connection test on module load
testConnection().catch((err) => {
  logger.error('Initial database connection test failed', { error: err });
});
