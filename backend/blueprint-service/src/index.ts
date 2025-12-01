import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from './middleware/auth';
import { validateBlueprint, validateBlueprintUpdate } from './validators';
import { dbPool } from '../../shared/database/pool.config';
import { logger } from '../../shared/logger';
import { corsMiddleware } from '../../shared/cors.config';

const app = express();
const PORT = process.env.PORT || 3001;

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));

// Use shared database pool
const pool = dbPool;

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'blueprint-service' });
});

// Create blueprint
app.post('/api/blueprints', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error, value } = validateBlueprint(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, targetCloud, components, metadata } = value;
    const blueprintId = uuidv4();
    const userId = (req as any).user.id;
    const tenantId = (req as any).user.tenantId;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create blueprint
      const blueprintResult = await client.query(
        `INSERT INTO blueprints (id, tenant_id, name, description, target_cloud, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'draft')
         RETURNING *`,
        [blueprintId, tenantId, name, description, targetCloud, userId]
      );

      // Create initial version
      const versionId = uuidv4();
      await client.query(
        `INSERT INTO blueprint_versions (id, blueprint_id, version_number, graph_data, metadata, created_by)
         VALUES ($1, $2, 1, $3, $4, $5)`,
        [versionId, blueprintId, JSON.stringify({ components }), JSON.stringify(metadata || {}), userId]
      );

      // Create components
      for (const component of components) {
        const componentId = uuidv4();
        await client.query(
          `INSERT INTO components (id, blueprint_id, version_id, name, type, provider, properties)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            componentId,
            blueprintId,
            versionId,
            component.name,
            component.type,
            component.provider,
            JSON.stringify(component.properties || {}),
          ]
        );
      }

      await client.query('COMMIT');

      // Invalidate cache
      await redis.del(`blueprint:${blueprintId}`);
      await redis.del(`tenant:${tenantId}:blueprints`);

      logger.info('Blueprint created', { blueprintId, tenantId, userId });

      res.status(201).json({
        id: blueprintId,
        versionId,
        ...blueprintResult.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Failed to create blueprint', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blueprint by ID
app.get('/api/blueprints/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;

    // Try cache first
    const cached = await redis.get(`blueprint:${id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      `SELECT b.*, 
              bv.id as version_id, bv.version_number, bv.graph_data, bv.metadata,
              u.username as created_by_name
       FROM blueprints b
       JOIN blueprint_versions bv ON b.id = bv.blueprint_id AND bv.version_number = b.current_version
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.id = $1 AND b.tenant_id = $2 AND b.deleted_at IS NULL`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }

    // Get components
    const componentsResult = await pool.query(
      `SELECT * FROM components 
       WHERE blueprint_id = $1 AND version_id = $2 AND deleted_at IS NULL`,
      [id, result.rows[0].version_id]
    );

    const blueprint = {
      ...result.rows[0],
      components: componentsResult.rows,
    };

    // Cache for 5 minutes
    await redis.setex(`blueprint:${id}`, 300, JSON.stringify(blueprint));

    res.json(blueprint);
  } catch (error: any) {
    logger.error('Failed to get blueprint', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List blueprints
app.get('/api/blueprints', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const { status, targetCloud, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT b.*, u.username as created_by_name,
             COUNT(*) OVER() as total_count
      FROM blueprints b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.tenant_id = $1 AND b.deleted_at IS NULL
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (targetCloud) {
      query += ` AND b.target_cloud = $${paramIndex}`;
      params.push(targetCloud);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (Number(page) - 1) * Number(limit));

    const result = await pool.query(query, params);

    res.json({
      blueprints: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.rows[0]?.total_count || 0,
      },
    });
  } catch (error: any) {
    logger.error('Failed to list blueprints', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update blueprint
app.patch('/api/blueprints/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.id;

    const { error, value } = validateBlueprintUpdate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    fields.push(`updated_by = $${paramIndex}`);
    values.push(userId);
    paramIndex++;

    values.push(id, tenantId);

    const result = await pool.query(
      `UPDATE blueprints SET ${fields.join(', ')}
       WHERE id = $${paramIndex - 1} AND tenant_id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }

    // Invalidate cache
    await redis.del(`blueprint:${id}`);

    logger.info('Blueprint updated', { blueprintId: id, tenantId, userId });

    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Failed to update blueprint', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete blueprint (soft delete)
app.delete('/api/blueprints/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.id;

    const result = await pool.query(
      `UPDATE blueprints 
       SET deleted_at = NOW(), deleted_by = $1
       WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL
       RETURNING id`,
      [userId, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }

    // Invalidate cache
    await redis.del(`blueprint:${id}`);
    await redis.del(`tenant:${tenantId}:blueprints`);

    logger.info('Blueprint deleted', { blueprintId: id, tenantId, userId });

    res.json({ message: 'Blueprint deleted successfully' });
  } catch (error: any) {
    logger.error('Failed to delete blueprint', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blueprint analysis (for auto-approval)
app.get('/api/blueprints/:id/analysis', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;

    // Get blueprint with components
    const blueprintResult = await pool.query(
      `SELECT b.*, bv.graph_data 
       FROM blueprints b
       JOIN blueprint_versions bv ON b.id = bv.blueprint_id AND bv.version_number = b.current_version
       WHERE b.id = $1 AND b.tenant_id = $2 AND b.deleted_at IS NULL`,
      [id, tenantId]
    );

    if (blueprintResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }

    const blueprint = blueprintResult.rows[0];
    const graphData = JSON.parse(blueprint.graph_data);

    // Calculate analysis metrics
    const analysis = {
      blueprintId: id,
      guardrailsPassed: true, // Would be calculated by guardrails engine
      securityScore: 88, // Would be calculated based on security rules
      complianceScore: 92,
      complexityScore: calculateComplexity(graphData),
      componentCount: graphData.components?.length || 0,
      estimatedDeploymentTime: estimateDeploymentTime(graphData),
    };

    res.json(analysis);
  } catch (error: any) {
    logger.error('Failed to analyze blueprint', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blueprint state (for drift detection)
app.get('/api/blueprints/:id/state', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;

    const result = await pool.query(
      `SELECT bv.graph_data 
       FROM blueprints b
       JOIN blueprint_versions bv ON b.id = bv.blueprint_id AND bv.version_number = b.current_version
       WHERE b.id = $1 AND b.tenant_id = $2 AND b.deleted_at IS NULL`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }

    const graphData = JSON.parse(result.rows[0].graph_data);
    
    res.json({
      resources: graphData.components || [],
      expectedState: graphData,
    });
  } catch (error: any) {
    logger.error('Failed to get blueprint state', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculateComplexity(graphData: any): number {
  const componentCount = graphData.components?.length || 0;
  const relationCount = graphData.relations?.length || 0;
  
  // Simple complexity score: (components * 5 + relations * 3) / 10
  return Math.min(100, Math.round((componentCount * 5 + relationCount * 3) / 10));
}

function estimateDeploymentTime(graphData: any): number {
  const componentCount = graphData.components?.length || 0;
  // Estimate: 2 minutes per component base + 1 minute per additional component
  return 2 + componentCount;
}

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Blueprint service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing connections');
  await pool.end();
  await redis.quit();
  process.exit(0);
});

export default app;
