/**
 * Example: How to use the standardized database pool in a service
 * 
 * This file demonstrates best practices for using the database pool
 * configuration in backend services.
 */

import express from 'express';
import { 
  createDatabasePool, 
  connectWithRetry, 
  closeDatabasePool,
  checkDatabaseHealth,
  getPoolStats,
  executeQuery,
  executeTransaction
} from '../shared/database/pool.config';

const app = express();
const PORT = process.env.PORT || 3001;

// Create database pool with service-specific configuration
export const pool = createDatabasePool({
  application_name: 'blueprint-service', // Service-specific name for monitoring
  // Add any service-specific overrides here if needed
});

/**
 * Initialize database connection with retry logic
 */
export const initDatabase = async (): Promise<void> => {
  try {
    await connectWithRetry(pool, 5, 1000);
    console.log('✅ Database initialized successfully');
    
    // Optional: Run migrations or setup tasks here
    // await runMigrations(pool);
  } catch (error: any) {
    console.error('❌ Failed to initialize database:', error.message);
    throw error;
  }
};

/**
 * Example: Simple query execution
 */
async function getBlueprint(id: string) {
  try {
    const result = await executeQuery(
      pool,
      'SELECT * FROM blueprints WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } catch (error: any) {
    console.error('Error fetching blueprint:', error);
    throw error;
  }
}

/**
 * Example: Transaction execution (multiple related queries)
 */
async function createBlueprintWithResources(blueprintData: any, resources: any[]) {
  try {
    const queries = [
      {
        query: 'INSERT INTO blueprints (name, description, cloud_provider) VALUES ($1, $2, $3) RETURNING id',
        values: [blueprintData.name, blueprintData.description, blueprintData.cloudProvider]
      },
      ...resources.map(resource => ({
        query: 'INSERT INTO resources (blueprint_id, type, name, config) VALUES ($1, $2, $3, $4)',
        values: [blueprintData.id, resource.type, resource.name, JSON.stringify(resource.config)]
      }))
    ];
    
    const results = await executeTransaction(pool, queries);
    return results[0].rows[0]; // Return the created blueprint
  } catch (error: any) {
    console.error('Error creating blueprint with resources:', error);
    throw error;
  }
}

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  const isDbHealthy = await checkDatabaseHealth(pool);
  const stats = getPoolStats(pool);
  
  if (isDbHealthy) {
    res.status(200).json({
      status: 'healthy',
      service: 'blueprint-service',
      database: {
        healthy: true,
        ...stats
      }
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      service: 'blueprint-service',
      database: {
        healthy: false,
        ...stats
      }
    });
  }
});

/**
 * Pool statistics endpoint (useful for monitoring)
 */
app.get('/pool-stats', (req, res) => {
  const stats = getPoolStats(pool);
  res.json(stats);
});

/**
 * Application startup
 */
async function startServer() {
  try {
    // Initialize database connection
    await initDatabase();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅ Blueprint Service running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handlers
 */
const shutdown = async (signal: string) => {
  console.log(`${signal} received, closing database connections...`);
  
  try {
    await closeDatabasePool(pool);
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server if this file is executed directly
if (require.main === module) {
  startServer();
}

export { startServer };
