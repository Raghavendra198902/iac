import { Pool, PoolClient, QueryResult } from 'pg';
import { logger, logPerformance } from './logger';

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

// Connection pool configuration with optimization
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma_admin',
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'dharma_pass_dev'),
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN || '5'), // Minimum number of clients
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'), // Return error after 10 seconds
  // statement_timeout removed - not supported by PgBouncer in transaction mode
  // statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // Query timeout 30s
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Disable SSL cert validation for internal services
  } : false
};

// Create connection pool
const pool = new Pool(poolConfig);

// Pool event handlers for monitoring
pool.on('connect', (client) => {
  logger.debug('New database client connected');
});

pool.on('acquire', (client) => {
  logger.debug('Database client acquired from pool');
});

pool.on('remove', (client) => {
  logger.debug('Database client removed from pool');
});

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
    
    logPerformance('database_query', start, {
      query: text.substring(0, 100),
      rowCount: result.rowCount,
      params: params?.length || 0,
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

// Batch insert helper (optimized)
export async function batchInsert(
  table: string,
  columns: string[],
  values: any[][],
  batchSize: number = 1000
): Promise<number> {
  if (values.length === 0) return 0;
  
  const startTime = Date.now();
  let totalInserted = 0;
  
  // Process in batches
  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    
    // Generate placeholders
    const placeholders = batch
      .map((_, rowIndex) => {
        const rowPlaceholders = columns
          .map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
          .join(', ');
        return `(${rowPlaceholders})`;
      })
      .join(', ');
    
    const flatValues = batch.flat();
    const queryText = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
    
    const result = await pool.query(queryText, flatValues);
    totalInserted += result.rowCount || 0;
  }
  
  logPerformance('batch_insert', startTime, {
    table,
    rows: values.length,
    batches: Math.ceil(values.length / batchSize),
  });
  
  return totalInserted;
}

// Paginated query helper
export async function paginatedQuery<T = any>(
  baseQuery: string,
  params: any[],
  page: number = 1,
  limit: number = 50,
  orderBy: string = 'created_at DESC'
): Promise<{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const offset = (page - 1) * limit;
  
  // Get total count
  const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS count_query`;
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);
  
  // Get paginated data
  const paginatedQueryText = `
    SELECT * FROM (${baseQuery}) AS paginated_query 
    ORDER BY ${orderBy} 
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  const dataResult = await query<T>(paginatedQueryText, [...params, limit, offset]);
  
  const totalPages = Math.ceil(total / limit);
  
  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Upsert helper (insert or update)
export async function upsert(
  table: string,
  data: Record<string, any>,
  conflictColumns: string[],
  updateColumns?: string[]
): Promise<QueryResult> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const conflictClause = conflictColumns.join(', ');
  
  // If updateColumns not specified, update all columns except conflict columns
  const updateCols = updateColumns || columns.filter(c => !conflictColumns.includes(c));
  const updateClause = updateCols
    .map(col => `${col} = EXCLUDED.${col}`)
    .join(', ');
  
  const queryText = `
    INSERT INTO ${table} (${columns.join(', ')}) 
    VALUES (${placeholders})
    ON CONFLICT (${conflictClause}) 
    DO UPDATE SET ${updateClause}
    RETURNING *
  `;
  
  return pool.query(queryText, values);
}

// Get slow queries
export async function getSlowQueries(minDurationMs: number = 100) {
  const result = await query(`
    SELECT * FROM analyze_slow_queries($1)
  `, [minDurationMs]);
  
  return result.rows;
}

// Get missing indexes
export async function getMissingIndexes() {
  const result = await query(`
    SELECT * FROM find_missing_indexes()
  `);
  
  return result.rows;
}

// Check database health
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency: number;
  poolStats: ReturnType<typeof getPoolStats>;
  activeConnections?: number;
}> {
  const startTime = Date.now();
  
  try {
    const result = await query('SELECT 1 as health, count(*) as connections FROM pg_stat_activity');
    const latency = Date.now() - startTime;
    
    return {
      status: 'healthy',
      latency,
      poolStats: getPoolStats(),
      activeConnections: parseInt(result.rows[0].connections),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      poolStats: getPoolStats(),
    };
  }
}

// Export pool for advanced usage
export { pool };

// Initialize connection test on module load
testConnection().catch((err) => {
  logger.error('Initial database connection test failed', { error: err });
});
