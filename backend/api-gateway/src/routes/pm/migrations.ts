/**
 * PM Migration Routes
 * Endpoints for Project Managers to track and manage cloud migration projects
 */

import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissions';
import { buildScopeFilter } from '../../services/scopeResolver';
import { query } from '../../utils/database';
import { logger } from '../../utils/logger';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/pm/migrations
 * @desc Get list of all migrations in scope
 * @access PM (project scope)
 */
router.get(
  '/',
  requirePermission('migration', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { status, phase, priority, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build scope filter
      const scopeFilter = buildScopeFilter(req, 'project');

      // Query migrations from database with filters
      let queryText = `
        SELECT cm.*, 
               p.name as project_name,
               COUNT(mw.id) as total_workloads,
               COUNT(CASE WHEN mw.status = 'completed' THEN 1 END) as migrated_workloads
        FROM cloud_migrations cm
        LEFT JOIN projects p ON cm.project_id = p.id
        LEFT JOIN migration_workloads mw ON cm.id = mw.migration_id
        WHERE cm.tenant_id = $1
      `;
      const params: any[] = [req.user!.tenantId];

      // Add status filter
      if (status) {
        queryText += ` AND cm.status = $${params.length + 1}`;
        params.push(status);
      }

      // Add phase filter
      if (phase) {
        queryText += ` AND cm.phase = $${params.length + 1}`;
        params.push(phase);
      }

      // Add priority filter
      if (priority) {
        queryText += ` AND cm.priority = $${params.length + 1}`;
        params.push(priority);
      }

      queryText += ` 
        GROUP BY cm.id, p.name
        ORDER BY 
          CASE cm.priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END,
          cm.start_date DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string), offset);

      const result = await query(queryText, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM cloud_migrations WHERE tenant_id = $1';
      const countParams: any[] = [req.user!.tenantId];
      if (status) {
        countQuery += ` AND status = $${countParams.length + 1}`;
        countParams.push(status);
      }
      if (phase) {
        countQuery += ` AND phase = $${countParams.length + 1}`;
        countParams.push(phase);
      }
      if (priority) {
        countQuery += ` AND priority = $${countParams.length + 1}`;
        countParams.push(priority);
      }
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      logger.info('Fetched migrations', { 
        count: result.rows.length, 
        user: req.user!.email,
        filters: { status, phase, priority }
      });

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      logger.error('Failed to fetch migrations', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch migrations',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/pm/migrations/:id
 * @desc Get detailed information about a specific migration
 * @access PM (project scope)
 */
router.get(
  '/:id',
  requirePermission('migration', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Query migration details from database
      const migrationResult = await query(
        `SELECT cm.*, 
                p.name as project_name,
                u.email as owner_email
         FROM cloud_migrations cm
         LEFT JOIN projects p ON cm.project_id = p.id
         LEFT JOIN users u ON cm.owner_id = u.id
         WHERE cm.id = $1 AND cm.tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (migrationResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Migration not found or access denied',
        });
      }

      const migration = migrationResult.rows[0];

      // Get workloads for this migration
      const workloadsResult = await query(
        `SELECT id, name, status, migrated_date, expected_date 
         FROM migration_workloads 
         WHERE migration_id = $1 AND tenant_id = $2
         ORDER BY expected_date ASC`,
        [id, req.user!.tenantId]
      );

      // Get risks for this migration
      const risksResult = await query(
        `SELECT id, description, severity, mitigation_strategy, status 
         FROM migration_risks 
         WHERE migration_id = $1 AND tenant_id = $2
         ORDER BY 
           CASE severity 
             WHEN 'critical' THEN 1 
             WHEN 'high' THEN 2 
             WHEN 'medium' THEN 3 
             WHEN 'low' THEN 4 
           END`,
        [id, req.user!.tenantId]
      );

      // Calculate progress based on completed workloads
      const totalWorkloads = workloadsResult.rows.length;
      const completedWorkloads = workloadsResult.rows.filter((w: any) => w.status === 'completed').length;
      const progress = totalWorkloads > 0 ? (completedWorkloads / totalWorkloads) * 100 : 0;

      const response = {
        ...migration,
        progress: parseFloat(progress.toFixed(2)),
        workloads: workloadsResult.rows,
        risks: risksResult.rows,
        workloadStats: {
          total: totalWorkloads,
          completed: completedWorkloads,
          inProgress: workloadsResult.rows.filter((w: any) => w.status === 'in-progress').length,
          pending: workloadsResult.rows.filter((w: any) => w.status === 'pending').length,
        },
      };

      logger.info('Fetched migration details', { migrationId: id, user: req.user!.email });

      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      logger.error('Failed to fetch migration details', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch migration details',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/pm/migrations/:id/update-status
 * @desc Update migration status and progress
 * @access PM (project scope)
 */
router.post(
  '/:id/update-status',
  requirePermission('migration', 'update', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, progress, notes } = req.body;

      if (!status && progress === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Status or progress is required',
        });
      }

      // Validate migration exists and user has access
      const migrationCheck = await query(
        'SELECT id, status, progress FROM cloud_migrations WHERE id = $1 AND tenant_id = $2',
        [id, req.user!.tenantId]
      );

      if (migrationCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Migration not found or access denied',
        });
      }

      const currentMigration = migrationCheck.rows[0];

      // Build update query dynamically
      const updates: string[] = [];
      const updateParams: any[] = [];
      let paramCount = 1;

      if (status) {
        updates.push(`status = $${paramCount}`);
        updateParams.push(status);
        paramCount++;
      }

      if (progress !== undefined) {
        updates.push(`progress = $${paramCount}`);
        updateParams.push(progress);
        paramCount++;
      }

      updates.push(`updated_by = $${paramCount}`);
      updateParams.push(req.user!.email);
      paramCount++;

      updates.push(`updated_at = $${paramCount}`);
      updateParams.push(new Date());
      paramCount++;

      // Add migration id and tenant_id as last params
      updateParams.push(id, req.user!.tenantId);

      // Update migration record
      const updateResult = await query(
        `UPDATE cloud_migrations 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}
         RETURNING *`,
        updateParams
      );

      // Record status change in audit log (if you have an audit table)
      if (status && status !== currentMigration.status) {
        await query(
          `INSERT INTO migration_audit_log 
           (migration_id, previous_status, new_status, notes, changed_by, tenant_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, currentMigration.status, status, notes || '', req.user!.email, req.user!.tenantId]
        );
      }

      logger.info('Migration status updated', { 
        migrationId: id, 
        status, 
        progress, 
        user: req.user!.email 
      });

      res.json({
        success: true,
        message: 'Migration status updated successfully',
        data: updateResult.rows[0],
      });
    } catch (error: any) {
      logger.error('Failed to update migration status', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to update migration status',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/pm/migrations/:id/risks
 * @desc Get risks associated with a migration
 * @access PM (project scope)
 */
router.get(
  '/:id/risks',
  requirePermission('migration', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      // Extract and validate migration ID (UUID format expected)
      const { id } = req.params;
      const { severity, status } = req.query;

      // Validate UUID format to prevent injection attempts
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid migration ID format',
        });
      }

      // Validate severity enum if provided
      const validSeverities = ['low', 'medium', 'high', 'critical'];
      if (severity && !validSeverities.includes(severity as string)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid severity value. Must be one of: low, medium, high, critical',
        });
      }

      // Validate status enum if provided
      const validStatuses = ['open', 'in_progress', 'resolved', 'accepted'];
      if (status && !validStatuses.includes(status as string)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status value. Must be one of: open, in_progress, resolved, accepted',
        });
      }

      // Validate migration exists (using parameterized query)
      const migrationCheck = await query(
        'SELECT id FROM cloud_migrations WHERE id = $1 AND tenant_id = $2',
        [id, req.user!.tenantId]
      );

      if (migrationCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Migration not found or access denied',
        });
      }

      // Query migration risks from database with filters
      const whereClauses = ['mr.migration_id = $1', 'mr.tenant_id = $2'];
      const params: any[] = [id, req.user!.tenantId];

      // Add severity filter (using parameterized query)
      if (severity && typeof severity === 'string') {
        whereClauses.push(`mr.severity = $${params.length + 1}`);
        params.push(severity);
      }

      // Add status filter (using parameterized query)
      if (status && typeof status === 'string') {
        whereClauses.push(`mr.status = $${params.length + 1}`);
        params.push(status);
      }

      const queryText = `
        SELECT mr.*,
               u.email as owner_email
        FROM migration_risks mr
        LEFT JOIN users u ON mr.owner_id = u.id
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY 
          CASE mr.severity 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
          END,
          mr.identified_date DESC
      `;

      const result = await query(queryText, params);

      logger.info('Fetched migration risks', { 
        migrationId: id, 
        count: result.rows.length, 
        user: req.user!.email 
      });

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Failed to fetch migration risks', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch migration risks',
        details: error.message,
      });
    }
  }
);

export default router;
