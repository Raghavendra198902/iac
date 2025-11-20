/**
 * PM Budget Routes
 * Endpoints for Project Managers to track and manage project budgets
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
 * @route GET /api/pm/budget/projects/:id/summary
 * @desc Get budget summary for a specific project
 * @access PM (project scope)
 */
router.get(
  '/projects/:id/summary',
  requirePermission('budget', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Validate project exists and user has access
      const projectCheck = await query(
        'SELECT id, name, tenant_id FROM projects WHERE id = $1 AND tenant_id = $2',
        [id, req.user!.tenantId]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found or access denied',
        });
      }

      const project = projectCheck.rows[0];

      // Get budget allocations
      const allocations = await query(
        `SELECT category, SUM(amount) as allocated 
         FROM budget_allocations 
         WHERE project_id = $1 AND tenant_id = $2 AND status = 'active'
         GROUP BY category`,
        [id, req.user!.tenantId]
      );

      // Get spending data
      const spending = await query(
        `SELECT category, SUM(amount) as spent 
         FROM budget_spending 
         WHERE project_id = $1 AND tenant_id = $2
         GROUP BY category`,
        [id, req.user!.tenantId]
      );

      // Calculate totals
      const totalAllocated = allocations.rows.reduce((sum, row) => sum + parseFloat(row.allocated), 0);
      const totalSpent = spending.rows.reduce((sum, row) => sum + parseFloat(row.spent), 0);
      const utilizationPercent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

      // Build breakdown by category
      const breakdown: any = {};
      allocations.rows.forEach((alloc: any) => {
        const spent = spending.rows.find((s: any) => s.category === alloc.category);
        const spentAmount = spent ? parseFloat(spent.spent) : 0;
        const allocAmount = parseFloat(alloc.allocated);
        breakdown[alloc.category] = {
          allocated: allocAmount,
          spent: spentAmount,
          percent: allocAmount > 0 ? (spentAmount / allocAmount) * 100 : 0,
        };
      });

      // Get active alerts
      const alertsResult = await query(
        `SELECT severity, message, category, current_spend, threshold 
         FROM budget_alerts 
         WHERE project_id = $1 AND tenant_id = $2 AND alert_status = 'active'
         ORDER BY 
           CASE severity 
             WHEN 'critical' THEN 1 
             WHEN 'warning' THEN 2 
             ELSE 3 
           END`,
        [id, req.user!.tenantId]
      );

      const summary = {
        projectId: id,
        projectName: project.name,
        currency: 'USD',
        fiscalYear: new Date().getFullYear(),
        allocated: totalAllocated,
        spent: totalSpent,
        committed: 0,
        available: totalAllocated - totalSpent,
        utilizationPercent: parseFloat(utilizationPercent.toFixed(2)),
        breakdown,
        alerts: alertsResult.rows,
        tenantId: req.user!.tenantId,
      };

      logger.info('Fetched budget summary', { projectId: id, user: req.user!.email });

      res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      logger.error('Failed to fetch budget summary', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch budget summary',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/pm/budget/projects/:id/allocate
 * @desc Allocate budget to a project or category
 * @access PM (project scope)
 */
router.post(
  '/projects/:id/allocate',
  requirePermission('budget', 'manage', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { category, amount, description, effectiveDate } = req.body;

      if (!category || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid category and positive amount are required',
        });
      }

      // Validate project exists and user has access
      const projectCheck = await query(
        'SELECT id, name FROM projects WHERE id = $1 AND tenant_id = $2',
        [id, req.user!.tenantId]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found or access denied',
        });
      }

      // Create budget allocation record
      const allocationResult = await query(
        `INSERT INTO budget_allocations 
         (project_id, category, amount, description, effective_date, allocated_by, status, tenant_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id,
          category,
          amount,
          description || '',
          effectiveDate || new Date(),
          req.user!.email,
          'active',
          req.user!.tenantId,
        ]
      );

      const allocation = allocationResult.rows[0];

      logger.info('Budget allocated', { 
        projectId: id, 
        category, 
        amount, 
        user: req.user!.email 
      });

      res.json({
        success: true,
        message: 'Budget allocated successfully',
        data: allocation,
      });
    } catch (error: any) {
      logger.error('Failed to allocate budget', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to allocate budget',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/pm/budget/projects/:id/forecast
 * @desc Get budget forecast and burn rate analysis
 * @access PM (project scope)
 */
router.get(
  '/projects/:id/forecast',
  requirePermission('budget', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { months = '6' } = req.query;

      // Validate project exists
      const projectCheck = await query(
        'SELECT id, name FROM projects WHERE id = $1 AND tenant_id = $2',
        [id, req.user!.tenantId]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found or access denied',
        });
      }

      const project = projectCheck.rows[0];

      // Get historical spending for the last 3 months to calculate burn rate
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const historicalSpending = await query(
        `SELECT 
           DATE_TRUNC('month', spending_date) as month,
           SUM(amount) as monthly_spend
         FROM budget_spending
         WHERE project_id = $1 AND tenant_id = $2 AND spending_date >= $3
         GROUP BY DATE_TRUNC('month', spending_date)
         ORDER BY month DESC`,
        [id, req.user!.tenantId, threeMonthsAgo]
      );

      // Calculate average burn rate
      const avgBurnRate = historicalSpending.rows.length > 0
        ? historicalSpending.rows.reduce((sum: number, row: any) => sum + parseFloat(row.monthly_spend), 0) / historicalSpending.rows.length
        : 0;

      // Get total allocated and spent
      const totals = await query(
        `SELECT 
           COALESCE(SUM(ba.amount), 0) as total_allocated,
           COALESCE((SELECT SUM(amount) FROM budget_spending WHERE project_id = $1 AND tenant_id = $2), 0) as total_spent
         FROM budget_allocations ba
         WHERE ba.project_id = $1 AND ba.tenant_id = $2 AND ba.status = 'active'`,
        [id, req.user!.tenantId]
      );

      const totalAllocated = parseFloat(totals.rows[0].total_allocated);
      const totalSpent = parseFloat(totals.rows[0].total_spent);
      const remaining = totalAllocated - totalSpent;
      const projectedRunway = avgBurnRate > 0 ? remaining / avgBurnRate : 0;

      // Generate monthly projections
      const monthlyProjections = [];
      const projectedMonths = parseInt(months as string);
      for (let i = 1; i <= projectedMonths; i++) {
        const projectedDate = new Date();
        projectedDate.setMonth(projectedDate.getMonth() + i);
        monthlyProjections.push({
          month: projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          projected: avgBurnRate,
          confidence: Math.max(50, 95 - i * 5),
        });
      }

      // Determine budget risk
      const utilizationPercent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
      let budgetRisk = 'low';
      if (utilizationPercent >= 90) budgetRisk = 'critical';
      else if (utilizationPercent >= 75) budgetRisk = 'high';
      else if (utilizationPercent >= 60) budgetRisk = 'medium';

      const forecast = {
        projectId: id,
        projectName: project.name,
        currentBurnRate: parseFloat(avgBurnRate.toFixed(2)),
        projectedRunway: parseFloat(projectedRunway.toFixed(2)),
        projectedCompletion: projectedRunway > 0 
          ? new Date(Date.now() + projectedRunway * 30 * 86400000).toISOString()
          : null,
        budgetRisk,
        monthlyProjections,
        recommendations: [],
        tenantId: req.user!.tenantId,
      };

      logger.info('Generated budget forecast', { projectId: id, user: req.user!.email });

      res.json({
        success: true,
        data: forecast,
      });
    } catch (error: any) {
      logger.error('Failed to generate budget forecast', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to generate budget forecast',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/pm/budget/alerts
 * @desc Get budget alerts and warnings across all projects
 * @access PM (project scope)
 */
router.get(
  '/alerts',
  requirePermission('budget', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { severity, projectId, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build scope filter
      const scopeFilter = buildScopeFilter(req, 'project');

      // Query budget alerts across projects
      let queryText = `
        SELECT ba.*, 
               p.name as project_name
        FROM budget_alerts ba
        LEFT JOIN projects p ON ba.project_id = p.id
        WHERE ba.tenant_id = $1 AND ba.alert_status = 'active'
      `;
      const params: any[] = [req.user!.tenantId];

      // Add severity filter
      if (severity) {
        queryText += ` AND ba.severity = $${params.length + 1}`;
        params.push(severity);
      }

      // Add project filter
      if (projectId) {
        queryText += ` AND ba.project_id = $${params.length + 1}`;
        params.push(projectId);
      }

      queryText += ` ORDER BY 
        CASE ba.severity 
          WHEN 'critical' THEN 1 
          WHEN 'warning' THEN 2 
          ELSE 3 
        END,
        ba.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string), offset);

      const result = await query(queryText, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM budget_alerts WHERE tenant_id = $1 AND alert_status = $2';
      const countParams: any[] = [req.user!.tenantId, 'active'];
      if (severity) {
        countQuery += ` AND severity = $${countParams.length + 1}`;
        countParams.push(severity);
      }
      if (projectId) {
        countQuery += ` AND project_id = $${countParams.length + 1}`;
        countParams.push(projectId);
      }
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      logger.info('Fetched budget alerts', { 
        count: result.rows.length, 
        user: req.user!.email,
        filters: { severity, projectId }
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
      logger.error('Failed to fetch budget alerts', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch budget alerts',
        details: error.message,
      });
    }
  }
);

export default router;
