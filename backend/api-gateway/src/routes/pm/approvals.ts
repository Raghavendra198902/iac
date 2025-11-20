/**
 * PM Approval Routes
 * Endpoints for Project Managers to approve/reject deployments and review approval history
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
 * @route POST /api/pm/approvals/deployments/:id/approve
 * @desc Approve a pending deployment
 * @access PM (project scope)
 */
router.post(
  '/deployments/:id/approve',
  requirePermission('deployment', 'approve', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { comments, conditions } = req.body;

      // Check if deployment exists and is pending
      const deploymentCheck = await query(
        'SELECT id, status, tenant_id FROM deployment_approvals WHERE id = $1 AND tenant_id = $2',
        [id, req.user!.tenantId]
      );

      if (deploymentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Deployment not found or access denied',
        });
      }

      const deployment = deploymentCheck.rows[0];
      
      if (deployment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: `Deployment is already ${deployment.status}`,
        });
      }

      // Update deployment approval status
      await query(
        `UPDATE deployment_approvals 
         SET status = $1, approved_by = $2, approved_at = NOW(), 
             approval_comments = $3, approval_conditions = $4, updated_at = NOW()
         WHERE id = $5`,
        ['approved', req.user!.email, comments || null, JSON.stringify(conditions || []), id]
      );

      // Record in approval history
      await query(
        `INSERT INTO approval_history 
         (approval_id, action, performed_by, performed_at, comments, tenant_id)
         VALUES ($1, $2, $3, NOW(), $4, $5)`,
        [id, 'approved', req.user!.email, comments || null, req.user!.tenantId]
      );

      // Fetch updated approval
      const result = await query(
        'SELECT * FROM deployment_approvals WHERE id = $1',
        [id]
      );

      logger.info('Deployment approved', { deploymentId: id, approvedBy: req.user!.email });

      res.json({
        success: true,
        message: 'Deployment approved successfully',
        data: result.rows[0],
      });
    } catch (error: any) {
      logger.error('Failed to approve deployment', { error: error.message, deploymentId: req.params.id });
      res.status(500).json({
        success: false,
        error: 'Failed to approve deployment',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/pm/approvals/deployments/:id/reject
 * @desc Reject a pending deployment
 * @access PM (project scope)
 */
router.post(
  '/deployments/:id/reject',
  requirePermission('deployment', 'approve', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Check if deployment exists and is pending
      const deploymentCheck = await query(
        'SELECT id, status, tenant_id FROM deployment_approvals WHERE id = $1 AND tenant_id = $2',
        [id, req.user!.tenantId]
      );

      if (deploymentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Deployment not found or access denied',
        });
      }

      const deployment = deploymentCheck.rows[0];
      
      if (deployment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: `Deployment is already ${deployment.status}`,
        });
      }

      // Update deployment approval status to rejected
      await query(
        `UPDATE deployment_approvals 
         SET status = $1, rejected_by = $2, rejected_at = NOW(), 
             rejection_reason = $3, updated_at = NOW()
         WHERE id = $4`,
        ['rejected', req.user!.email, reason || 'No reason provided', id]
      );

      // Record in approval history
      await query(
        `INSERT INTO approval_history 
         (approval_id, action, performed_by, performed_at, comments, tenant_id)
         VALUES ($1, $2, $3, NOW(), $4, $5)`,
        [id, 'rejected', req.user!.email, reason || 'No reason provided', req.user!.tenantId]
      );

      // Fetch updated approval
      const result = await query(
        'SELECT * FROM deployment_approvals WHERE id = $1',
        [id]
      );

      logger.info('Deployment rejected', { deploymentId: id, rejectedBy: req.user!.email });

      res.json({
        success: true,
        message: 'Deployment rejected',
        data: result.rows[0],
      });
    } catch (error: any) {
      logger.error('Failed to reject deployment', { error: error.message, deploymentId: req.params.id });
      res.status(500).json({
        success: false,
        error: 'Failed to reject deployment',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/pm/approvals/pending
 * @desc Get all pending approvals for the PM's scope
 * @access PM (project scope)
 */
router.get(
  '/pending',
  requirePermission('deployment', 'approve', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { status, priority, submittedAfter, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build scope filter based on user's permissions
      const scopeFilter = buildScopeFilter(req, 'project');

      // Query database for pending deployments with filters
      let queryText = `
        SELECT da.*, 
               p.name as project_name,
               e.name as environment_name,
               u.email as requested_by_email
        FROM deployment_approvals da
        LEFT JOIN projects p ON da.project_id = p.id
        LEFT JOIN environments e ON da.environment_id = e.id
        LEFT JOIN users u ON da.requested_by = u.id
        WHERE da.tenant_id = $1 AND da.status = 'pending'
      `;
      const params: any[] = [req.user!.tenantId];

      // Add priority filter if specified
      if (priority) {
        queryText += ` AND da.priority = $${params.length + 1}`;
        params.push(priority);
      }

      // Add date filter if specified
      if (submittedAfter) {
        queryText += ` AND da.created_at > $${params.length + 1}`;
        params.push(new Date(submittedAfter as string));
      }

      queryText += ` ORDER BY 
        CASE da.priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        da.created_at DESC 
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string), offset);

      const result = await query(queryText, params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM deployment_approvals WHERE tenant_id = $1 AND status = $2';
      const countParams: any[] = [req.user!.tenantId, 'pending'];
      if (priority) {
        countQuery += ` AND priority = $${countParams.length + 1}`;
        countParams.push(priority);
      }
      if (submittedAfter) {
        countQuery += ` AND created_at > $${countParams.length + 1}`;
        countParams.push(new Date(submittedAfter as string));
      }
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      logger.info('Fetched pending approvals', { 
        count: result.rows.length, 
        user: req.user!.email,
        filters: { status, priority, submittedAfter }
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
        filter: { status, priority, submittedAfter },
      });
    } catch (error: any) {
      logger.error('Failed to fetch pending approvals', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending approvals',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/pm/approvals/history
 * @desc Get approval history for the PM's scope
 * @access PM (project scope)
 */
router.get(
  '/history',
  requirePermission('deployment', 'approve', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate, status, limit = '50', offset = '0' } = req.query;

      // Build scope filter
      const scopeFilter = buildScopeFilter(req, 'project');

      // Query database for approval history with filters
      let queryText = `
        SELECT ah.*, 
               da.deployment_name,
               da.environment_id,
               e.name as environment_name,
               p.name as project_name
        FROM approval_history ah
        LEFT JOIN deployment_approvals da ON ah.approval_id = da.id
        LEFT JOIN environments e ON da.environment_id = e.id
        LEFT JOIN projects p ON da.project_id = p.id
        WHERE ah.tenant_id = $1
      `;
      const params: any[] = [req.user!.tenantId];

      // Add date range filters
      if (startDate) {
        queryText += ` AND ah.performed_at >= $${params.length + 1}`;
        params.push(new Date(startDate as string));
      }
      if (endDate) {
        queryText += ` AND ah.performed_at <= $${params.length + 1}`;
        params.push(new Date(endDate as string));
      }

      // Add status filter
      if (status) {
        queryText += ` AND ah.action = $${params.length + 1}`;
        params.push(status);
      }

      queryText += ` ORDER BY ah.performed_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await query(queryText, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM approval_history WHERE tenant_id = $1';
      const countParams: any[] = [req.user!.tenantId];
      if (startDate) {
        countQuery += ` AND performed_at >= $${countParams.length + 1}`;
        countParams.push(new Date(startDate as string));
      }
      if (endDate) {
        countQuery += ` AND performed_at <= $${countParams.length + 1}`;
        countParams.push(new Date(endDate as string));
      }
      if (status) {
        countQuery += ` AND action = $${countParams.length + 1}`;
        countParams.push(status);
      }
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      logger.info('Fetched approval history', { 
        count: result.rows.length, 
        user: req.user!.email,
        filters: { startDate, endDate, status }
      });

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total,
        },
        filter: { startDate, endDate, status },
      });
    } catch (error: any) {
      logger.error('Failed to fetch approval history', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch approval history',
        details: error.message,
      });
    }
  }
);

export default router;
