/**
 * EA Cost Optimization Routes
 * Endpoints for Enterprise Architects to review cost optimization recommendations
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
 * @route GET /api/ea/cost-optimization/recommendations
 * @desc Get AI-generated cost optimization recommendations
 * @access EA (tenant scope)
 */
router.get(
  '/recommendations',
  requirePermission('cost-optimization', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { priority, status, recommendationType, minSavings } = req.query;

      let queryText = `
        SELECT *
        FROM cost_optimization_recommendations
        WHERE tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (priority) {
        queryText += ` AND priority = $${paramIndex}`;
        queryParams.push(priority);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      if (recommendationType) {
        queryText += ` AND recommendation_type = $${paramIndex}`;
        queryParams.push(recommendationType);
        paramIndex++;
      }

      if (minSavings) {
        queryText += ` AND potential_savings >= $${paramIndex}`;
        queryParams.push(Number(minSavings));
        paramIndex++;
      }

      queryText += ` ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        potential_savings DESC`;

      const result = await query(queryText, queryParams);

      // Calculate total potential savings
      const totalSavings = result.rows.reduce(
        (sum, row) => sum + (parseFloat(row.potential_savings) || 0),
        0
      );

      logger.info(`Fetched ${result.rows.length} cost optimization recommendations`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        totalPotentialSavings: totalSavings,
      });
    } catch (error: any) {
      logger.error('Error fetching cost recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recommendations',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ea/cost-optimization/recommendations/:id/approve
 * @desc Approve a cost optimization recommendation
 * @access EA (tenant scope)
 */
router.post(
  '/recommendations/:id/approve',
  requirePermission('cost-optimization', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { approvalNotes, assignedTo } = req.body;

      // Get current recommendation
      const recoResult = await query(
        `SELECT * FROM cost_optimization_recommendations 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (recoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Recommendation not found',
        });
      }

      // Approve recommendation
      const updateResult = await query(
        `UPDATE cost_optimization_recommendations 
         SET status = 'approved', 
             approved_by = $1, 
             approved_at = NOW(),
             approval_notes = $2,
             assigned_to = $3
         WHERE id = $4 AND tenant_id = $5
         RETURNING *`,
        [
          req.user!.email,
          approvalNotes || '',
          assignedTo || null,
          id,
          req.user!.tenantId,
        ]
      );

      const approved = updateResult.rows[0];

      logger.info(`Cost recommendation ${id} approved by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Recommendation approved successfully',
        data: approved,
      });
    } catch (error: any) {
      logger.error('Error approving recommendation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve recommendation',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ea/cost-optimization/recommendations/:id/dismiss
 * @desc Dismiss a cost optimization recommendation
 * @access EA (tenant scope)
 */
router.post(
  '/recommendations/:id/dismiss',
  requirePermission('cost-optimization', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { dismissalReason } = req.body;

      if (!dismissalReason) {
        return res.status(400).json({
          success: false,
          error: 'Dismissal reason is required',
        });
      }

      // Get current recommendation
      const recoResult = await query(
        `SELECT * FROM cost_optimization_recommendations 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (recoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Recommendation not found',
        });
      }

      // Dismiss recommendation
      const updateResult = await query(
        `UPDATE cost_optimization_recommendations 
         SET status = 'dismissed', 
             dismissed_by = $1, 
             dismissed_at = NOW(),
             dismissal_reason = $2
         WHERE id = $3 AND tenant_id = $4
         RETURNING *`,
        [req.user!.email, dismissalReason, id, req.user!.tenantId]
      );

      const dismissed = updateResult.rows[0];

      logger.info(`Cost recommendation ${id} dismissed by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Recommendation dismissed successfully',
        data: dismissed,
      });
    } catch (error: any) {
      logger.error('Error dismissing recommendation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to dismiss recommendation',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ea/cost-optimization/dashboard
 * @desc Get cost optimization dashboard metrics
 * @access EA (tenant scope)
 */
router.get(
  '/dashboard',
  requirePermission('cost-optimization', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      // Get recommendation summary
      const summaryResult = await query(
        `SELECT 
          COUNT(*) as total_recommendations,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open_recommendations,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_recommendations,
          COUNT(CASE WHEN status = 'implemented' THEN 1 END) as implemented_recommendations,
          SUM(CASE WHEN status != 'dismissed' THEN potential_savings ELSE 0 END) as total_potential_savings,
          SUM(CASE WHEN status = 'implemented' THEN potential_savings ELSE 0 END) as realized_savings
        FROM cost_optimization_recommendations
        WHERE tenant_id = $1`,
        [req.user!.tenantId]
      );

      // Get savings by type
      const byTypeResult = await query(
        `SELECT 
          recommendation_type,
          COUNT(*) as count,
          SUM(potential_savings) as total_savings
        FROM cost_optimization_recommendations
        WHERE tenant_id = $1 AND status != 'dismissed'
        GROUP BY recommendation_type
        ORDER BY total_savings DESC`,
        [req.user!.tenantId]
      );

      // Get top recommendations
      const topRecommendationsResult = await query(
        `SELECT 
          id,
          recommendation_type,
          resource_name,
          potential_savings,
          priority,
          status
        FROM cost_optimization_recommendations
        WHERE tenant_id = $1 AND status IN ('open', 'approved')
        ORDER BY potential_savings DESC
        LIMIT 10`,
        [req.user!.tenantId]
      );

      const dashboard = {
        summary: summaryResult.rows[0],
        by_type: byTypeResult.rows,
        top_recommendations: topRecommendationsResult.rows,
      };

      logger.info('Fetched cost optimization dashboard metrics');

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      logger.error('Error fetching cost optimization dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard',
        details: error.message,
      });
    }
  }
);

export default router;
