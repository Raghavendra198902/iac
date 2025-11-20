/**
 * SE Deployment Routes
 * Endpoints for Software Engineers to execute and manage deployments
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
 * @route POST /api/se/deployments/:id/execute
 * @desc Execute an approved deployment
 * @access SE (project scope)
 */
router.post(
  '/:id/execute',
  requirePermission('deployment', 'execute', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { environment, deploymentWindow, preChecksPassed } = req.body;

      if (!environment) {
        return res.status(400).json({
          success: false,
          error: 'Environment is required',
        });
      }

      // Validate deployment exists and is approved
      const approvalResult = await query(
        `SELECT da.*, p.name as project_name
         FROM deployment_approvals da
         JOIN projects p ON da.project_id = p.id
         WHERE da.id = $1 AND da.tenant_id = $2 AND da.status = 'approved'`,
        [id, req.user!.tenantId]
      );

      if (approvalResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Deployment not found or not approved',
        });
      }

      const deployment = approvalResult.rows[0];

      // Create deployment execution record
      const executionResult = await query(
        `INSERT INTO deployment_executions 
         (deployment_id, environment_id, status, started_by, started_at, tenant_id, project_id)
         VALUES ($1, $2, 'in-progress', $3, NOW(), $4, $5)
         RETURNING *`,
        [id, environment, req.user!.email, req.user!.tenantId, deployment.project_id]
      );

      const execution = executionResult.rows[0];

      // Log the execution start
      await query(
        `INSERT INTO deployment_logs 
         (execution_id, message, level, timestamp, tenant_id)
         VALUES ($1, $2, 'info', NOW(), $3)`,
        [execution.id, `Deployment execution started by ${req.user!.email}`, req.user!.tenantId]
      );

      logger.info('Deployment execution started', { 
        executionId: execution.id, 
        deploymentId: id,
        environment,
        user: req.user!.email 
      });

      res.json({
        success: true,
        message: 'Deployment execution started',
        data: {
          id: execution.id,
          deploymentId: id,
          environment,
          status: execution.status,
          startedBy: execution.started_by,
          startedAt: execution.started_at,
          projectId: execution.project_id,
        },
      });
    } catch (error: any) {
      logger.error('Failed to execute deployment', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to execute deployment',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/se/deployments/:id/rollback
 * @desc Rollback a deployment to previous version
 * @access SE (project scope)
 */
router.post(
  '/:id/rollback',
  requirePermission('deployment', 'execute', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { reason, targetVersion } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Rollback reason is required',
        });
      }

      // Validate deployment execution exists
      const executionResult = await query(
        `SELECT * FROM deployment_executions
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (executionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Deployment execution not found',
        });
      }

      const execution = executionResult.rows[0];

      // Update execution status to rollback
      await query(
        `UPDATE deployment_executions
         SET status = 'rolling-back', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      // Create rollback log entry
      await query(
        `INSERT INTO deployment_logs 
         (execution_id, message, level, timestamp, tenant_id)
         VALUES ($1, $2, 'warning', NOW(), $3)`,
        [id, `Rollback initiated: ${reason}`, req.user!.tenantId]
      );

      logger.warn('Deployment rollback initiated', { 
        executionId: id,
        reason,
        targetVersion: targetVersion || 'previous',
        user: req.user!.email 
      });

      res.json({
        success: true,
        message: 'Rollback initiated',
        data: {
          executionId: id,
          deploymentId: execution.deployment_id,
          targetVersion: targetVersion || 'previous',
          reason,
          initiatedBy: req.user!.email,
          initiatedAt: new Date().toISOString(),
          status: 'rolling-back',
        },
      });
    } catch (error: any) {
      logger.error('Failed to initiate rollback', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to initiate rollback',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/deployments/:id/status
 * @desc Get real-time deployment execution status
 * @access SE (project scope)
 */
router.get(
  '/:id/status',
  requirePermission('deployment', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Query deployment execution status
      const executionResult = await query(
        `SELECT de.*, da.blueprint_name, e.name as environment_name
         FROM deployment_executions de
         LEFT JOIN deployment_approvals da ON de.deployment_id = da.id
         LEFT JOIN environments e ON de.environment_id = e.id
         WHERE de.id = $1 AND de.tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (executionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Deployment execution not found',
        });
      }

      const execution = executionResult.rows[0];

      // Get recent logs for this execution
      const logsResult = await query(
        `SELECT message, level, timestamp
         FROM deployment_logs
         WHERE execution_id = $1 AND tenant_id = $2
         ORDER BY timestamp DESC
         LIMIT 10`,
        [id, req.user!.tenantId]
      );

      // Calculate progress based on status
      let progress = 0;
      if (execution.status === 'in-progress') progress = 50;
      else if (execution.status === 'success') progress = 100;
      else if (execution.status === 'failed') progress = execution.progress || 0;

      const status = {
        executionId: execution.id,
        deploymentId: execution.deployment_id,
        blueprintName: execution.blueprint_name,
        environment: execution.environment_name,
        status: execution.status,
        progress,
        startedAt: execution.started_at,
        startedBy: execution.started_by,
        completedAt: execution.completed_at,
        duration: execution.duration,
        recentLogs: logsResult.rows,
      };

      logger.info('Fetched deployment status', { 
        executionId: id,
        status: execution.status,
        user: req.user!.email 
      });

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      logger.error('Failed to fetch deployment status', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch deployment status',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/deployments/active
 * @desc Get all active deployments in scope
 * @access SE (project scope)
 */
router.get(
  '/active',
  requirePermission('deployment', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { environment } = req.query;

      // Query active deployments
      let queryText = `
        SELECT 
          de.id,
          de.deployment_id,
          da.blueprint_name,
          e.name as environment,
          de.status,
          de.started_at,
          de.started_by,
          p.name as project_name,
          p.id as project_id
        FROM deployment_executions de
        JOIN deployment_approvals da ON de.deployment_id = da.id
        LEFT JOIN environments e ON de.environment_id = e.id
        JOIN projects p ON de.project_id = p.id
        WHERE de.tenant_id = $1
          AND de.status IN ('in-progress', 'rolling-back')
      `;
      
      const params: any[] = [req.user!.tenantId];

      if (environment) {
        queryText += ` AND de.environment_id = $${params.length + 1}`;
        params.push(environment);
      }

      queryText += ` ORDER BY de.started_at DESC LIMIT 50`;

      const result = await query(queryText, params);

      const activeDeployments = result.rows.map((row: any) => ({
        id: row.id,
        deploymentId: row.deployment_id,
        blueprintName: row.blueprint_name,
        environment: row.environment,
        status: row.status,
        startedAt: row.started_at,
        startedBy: row.started_by,
        projectId: row.project_id,
        projectName: row.project_name,
      }));

      logger.info('Fetched active deployments', { 
        count: activeDeployments.length,
        environment,
        user: req.user!.email 
      });

      res.json({
        success: true,
        data: activeDeployments,
        count: activeDeployments.length,
      });
    } catch (error: any) {
      logger.error('Failed to fetch active deployments', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active deployments',
        details: error.message,
      });
    }
  }
);

export default router;
