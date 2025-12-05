import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

interface TenantQuota {
  tenantId: string;
  maxProjects: number;
  maxBlueprints: number;
  maxDeployments: number;
  maxUsers: number;
  maxStorage: number; // in GB
  maxApiCalls: number; // per day
}

/**
 * Tenant Management Routes
 */
export function createTenantRoutes(pool: Pool): Router {
  
  // Get tenant quotas
  router.get('/:tenantId/quotas', async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM tenant_quotas WHERE tenant_id = $1',
        [tenantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching tenant quotas:', error);
      res.status(500).json({ error: 'Failed to fetch tenant quotas' });
    }
  });

  // Update tenant quotas
  router.put('/:tenantId/quotas', async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { maxProjects, maxBlueprints, maxDeployments, maxUsers, maxStorage, maxApiCalls } = req.body;

      await pool.query(
        `UPDATE tenant_quotas SET 
          max_projects = $2,
          max_blueprints = $3,
          max_deployments = $4,
          max_users = $5,
          max_storage_gb = $6,
          max_api_calls_per_day = $7,
          updated_at = NOW()
        WHERE tenant_id = $1`,
        [tenantId, maxProjects, maxBlueprints, maxDeployments, maxUsers, maxStorage, maxApiCalls]
      );

      res.json({ success: true, message: 'Tenant quotas updated' });
    } catch (error) {
      console.error('Error updating tenant quotas:', error);
      res.status(500).json({ error: 'Failed to update tenant quotas' });
    }
  });

  // Get tenant usage
  router.get('/:tenantId/usage', async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;

      const [projects, blueprints, deployments, users, apiCalls] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM projects WHERE tenant_id = $1', [tenantId]),
        pool.query('SELECT COUNT(*) as count FROM blueprints WHERE tenant_id = $1', [tenantId]),
        pool.query('SELECT COUNT(*) as count FROM deployments WHERE tenant_id = $1', [tenantId]),
        pool.query('SELECT COUNT(*) as count FROM users WHERE tenant_id = $1', [tenantId]),
        pool.query(
          `SELECT COUNT(*) as count FROM api_logs 
           WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '1 day'`,
          [tenantId]
        ),
      ]);

      res.json({
        tenantId,
        usage: {
          projects: parseInt(projects.rows[0].count),
          blueprints: parseInt(blueprints.rows[0].count),
          deployments: parseInt(deployments.rows[0].count),
          users: parseInt(users.rows[0].count),
          apiCallsToday: parseInt(apiCalls.rows[0].count),
        },
      });
    } catch (error) {
      console.error('Error fetching tenant usage:', error);
      res.status(500).json({ error: 'Failed to fetch tenant usage' });
    }
  });

  // Get tenant analytics
  router.get('/:tenantId/analytics', async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await pool.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE resource_type = 'blueprint') as blueprints_created,
          COUNT(*) FILTER (WHERE resource_type = 'deployment') as deployments_created,
          COUNT(*) FILTER (WHERE resource_type = 'iac_generation') as iac_generations,
          AVG(duration_ms) as avg_duration_ms
        FROM activity_logs
        WHERE tenant_id = $1
          AND created_at BETWEEN $2 AND $3
        GROUP BY DATE(created_at)
        ORDER BY date`,
        [tenantId, startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]
      );

      res.json(analytics.rows);
    } catch (error) {
      console.error('Error fetching tenant analytics:', error);
      res.status(500).json({ error: 'Failed to fetch tenant analytics' });
    }
  });

  // Export tenant data
  router.post('/:tenantId/export', async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;

      const [projects, blueprints, deployments] = await Promise.all([
        pool.query('SELECT * FROM projects WHERE tenant_id = $1', [tenantId]),
        pool.query('SELECT * FROM blueprints WHERE tenant_id = $1', [tenantId]),
        pool.query('SELECT * FROM deployments WHERE tenant_id = $1', [tenantId]),
      ]);

      const exportData = {
        tenantId,
        exportedAt: new Date().toISOString(),
        data: {
          projects: projects.rows,
          blueprints: blueprints.rows,
          deployments: deployments.rows,
        },
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=tenant-${tenantId}-export.json`);
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting tenant data:', error);
      res.status(500).json({ error: 'Failed to export tenant data' });
    }
  });

  // Import tenant data
  router.post('/:tenantId/import', async (req: Request, res: Response) => {
    const client = await pool.connect();
    
    try {
      const { tenantId } = req.params;
      const { data } = req.body;

      await client.query('BEGIN');

      // Import projects
      for (const project of data.projects || []) {
        await client.query(
          `INSERT INTO projects (id, name, description, tenant_id, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [project.id, project.name, project.description, tenantId, project.created_at]
        );
      }

      // Import blueprints
      for (const blueprint of data.blueprints || []) {
        await client.query(
          `INSERT INTO blueprints (id, name, config, tenant_id, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [blueprint.id, blueprint.name, blueprint.config, tenantId, blueprint.created_at]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Tenant data imported successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error importing tenant data:', error);
      res.status(500).json({ error: 'Failed to import tenant data' });
    } finally {
      client.release();
    }
  });

  return router;
}

/**
 * Middleware to enforce tenant quotas
 */
export const enforceQuota = (resourceType: string) => {
  return async (req: Request, res: Response, next: any) => {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      // Get tenant quotas and usage
      const pool = (req as any).pool;
      const quotas = await pool.query('SELECT * FROM tenant_quotas WHERE tenant_id = $1', [tenantId]);
      
      if (quotas.rows.length === 0) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const quota = quotas.rows[0];
      const usage = await pool.query(
        `SELECT COUNT(*) as count FROM ${resourceType} WHERE tenant_id = $1`,
        [tenantId]
      );

      const currentUsage = parseInt(usage.rows[0].count);
      const maxAllowed = quota[`max_${resourceType}`];

      if (currentUsage >= maxAllowed) {
        return res.status(429).json({
          error: 'Quota Exceeded',
          message: `Maximum ${resourceType} limit (${maxAllowed}) reached for this tenant`,
          current: currentUsage,
          max: maxAllowed,
        });
      }

      next();
    } catch (error) {
      console.error('Error enforcing quota:', error);
      res.status(500).json({ error: 'Failed to check quota' });
    }
  };
};
