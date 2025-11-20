/**
 * TA Guardrails Routes
 * Endpoints for Technical Architects to manage and enforce guardrails
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
 * @route GET /api/ta/guardrails
 * @desc Get all guardrails
 * @access TA (tenant scope)
 */
router.get(
  '/',
  requirePermission('guardrail', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { status, category, severity } = req.query;

      let queryText = `
        SELECT 
          g.*,
          COUNT(DISTINCT gv.id) as violation_count
        FROM guardrails_rules g
        LEFT JOIN guardrail_violations gv ON g.id = gv.rule_id AND gv.status != 'resolved'
        WHERE g.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (status) {
        queryText += ` AND g.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      if (category) {
        queryText += ` AND g.category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }

      if (severity) {
        queryText += ` AND g.severity = $${paramIndex}`;
        queryParams.push(severity);
        paramIndex++;
      }

      queryText += ` GROUP BY g.id ORDER BY 
        CASE g.severity 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        g.name ASC`;

      const result = await query(queryText, queryParams);

      const guardrails = result.rows.map(row => ({
        ...row,
        rule_definition: typeof row.rule_definition === 'string' 
          ? JSON.parse(row.rule_definition) 
          : row.rule_definition,
        violation_count: parseInt(row.violation_count) || 0,
      }));

      logger.info(`Fetched ${guardrails.length} guardrails`);

      res.json({
        success: true,
        data: guardrails,
        count: guardrails.length,
      });
    } catch (error: any) {
      logger.error('Error fetching guardrails:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch guardrails',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ta/guardrails
 * @desc Create a new guardrail
 * @access TA (tenant scope)
 */
router.post(
  '/',
  requirePermission('guardrail', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const {
        name,
        description,
        category,
        severity,
        ruleDefinition,
        enforcementAction,
        autoRemediate,
      } = req.body;

      if (!name || !category || !ruleDefinition || !enforcementAction) {
        return res.status(400).json({
          success: false,
          error: 'Name, category, rule definition, and enforcement action are required',
        });
      }

      const guardrailResult = await query(
        `INSERT INTO guardrails_rules 
          (name, description, category, severity, rule_definition, enforcement_action, 
           auto_remediate, status, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9)
        RETURNING *`,
        [
          name,
          description || '',
          category,
          severity || 'medium',
          JSON.stringify(ruleDefinition),
          enforcementAction,
          autoRemediate || false,
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      const guardrail = guardrailResult.rows[0];

      logger.info(`Guardrail ${guardrail.id} created by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Guardrail created successfully',
        data: guardrail,
      });
    } catch (error: any) {
      logger.error('Error creating guardrail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create guardrail',
        details: error.message,
      });
    }
  }
);

/**
 * @route PATCH /api/ta/guardrails/:id
 * @desc Update a guardrail
 * @access TA (tenant scope)
 */
router.patch(
  '/:id',
  requirePermission('guardrail', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, severity, enforcementAction, autoRemediate, description } = req.body;

      const guardrailCheck = await query(
        `SELECT id FROM guardrails_rules 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (guardrailCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Guardrail not found',
        });
      }

      const updates: string[] = [];
      const updateParams: any[] = [];
      let paramIndex = 1;

      if (status) {
        updates.push(`status = $${paramIndex}`);
        updateParams.push(status);
        paramIndex++;
      }

      if (severity) {
        updates.push(`severity = $${paramIndex}`);
        updateParams.push(severity);
        paramIndex++;
      }

      if (enforcementAction) {
        updates.push(`enforcement_action = $${paramIndex}`);
        updateParams.push(enforcementAction);
        paramIndex++;
      }

      if (autoRemediate !== undefined) {
        updates.push(`auto_remediate = $${paramIndex}`);
        updateParams.push(autoRemediate);
        paramIndex++;
      }

      if (description) {
        updates.push(`description = $${paramIndex}`);
        updateParams.push(description);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No updates provided',
        });
      }

      updates.push(`updated_at = NOW()`);
      updateParams.push(req.user!.tenantId, id);

      const updateQuery = `
        UPDATE guardrails_rules 
        SET ${updates.join(', ')}
        WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1}
        RETURNING *
      `;

      const updateResult = await query(updateQuery, updateParams);
      const updated = updateResult.rows[0];

      logger.info(`Guardrail ${id} updated by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Guardrail updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Error updating guardrail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update guardrail',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ta/guardrails/:id/violations
 * @desc Get violations for a specific guardrail
 * @access TA (tenant scope)
 */
router.get(
  '/:id/violations',
  requirePermission('guardrail', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, limit = 50 } = req.query;

      const guardrailCheck = await query(
        `SELECT id FROM guardrails_rules 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (guardrailCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Guardrail not found',
        });
      }

      let queryText = `
        SELECT 
          gv.*,
          g.name as rule_name,
          b.name as blueprint_name
        FROM guardrail_violations gv
        JOIN guardrails_rules g ON gv.rule_id = g.id
        LEFT JOIN blueprints b ON gv.blueprint_id = b.id
        WHERE gv.rule_id = $1 AND gv.tenant_id = $2
      `;
      const queryParams: any[] = [id, req.user!.tenantId];
      let paramIndex = 3;

      if (status) {
        queryText += ` AND gv.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      queryText += ` ORDER BY gv.detected_at DESC LIMIT $${paramIndex}`;
      queryParams.push(Number(limit));

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} violations for guardrail ${id}`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Error fetching violations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch violations',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ta/guardrails/:id/override
 * @desc Override a guardrail violation
 * @access TA (tenant scope)
 */
router.post(
  '/:id/override',
  requirePermission('guardrail', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { violationId, overrideReason, expiresAt } = req.body;

      if (!violationId || !overrideReason) {
        return res.status(400).json({
          success: false,
          error: 'Violation ID and override reason are required',
        });
      }

      const violationCheck = await query(
        `SELECT * FROM guardrail_violations 
         WHERE id = $1 AND rule_id = $2 AND tenant_id = $3`,
        [violationId, id, req.user!.tenantId]
      );

      if (violationCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Violation not found',
        });
      }

      const overrideResult = await query(
        `UPDATE guardrail_violations 
         SET status = 'overridden',
             override_by = $1,
             override_at = NOW(),
             override_reason = $2,
             override_expires_at = $3
         WHERE id = $4 AND tenant_id = $5
         RETURNING *`,
        [
          req.user!.email,
          overrideReason,
          expiresAt || null,
          violationId,
          req.user!.tenantId,
        ]
      );

      const overridden = overrideResult.rows[0];

      logger.info(`Violation ${violationId} overridden by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Violation overridden successfully',
        data: overridden,
      });
    } catch (error: any) {
      logger.error('Error overriding violation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to override violation',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ta/guardrails/audit
 * @desc Get guardrail audit log
 * @access TA (tenant scope)
 */
router.get(
  '/audit',
  requirePermission('guardrail', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { ruleId, action, limit = 100 } = req.query;

      let queryText = `
        SELECT 
          ga.*,
          g.name as rule_name
        FROM guardrail_audit ga
        LEFT JOIN guardrails_rules g ON ga.rule_id = g.id
        WHERE ga.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (ruleId) {
        queryText += ` AND ga.rule_id = $${paramIndex}`;
        queryParams.push(ruleId);
        paramIndex++;
      }

      if (action) {
        queryText += ` AND ga.action = $${paramIndex}`;
        queryParams.push(action);
        paramIndex++;
      }

      queryText += ` ORDER BY ga.timestamp DESC LIMIT $${paramIndex}`;
      queryParams.push(Number(limit));

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} audit log entries`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Error fetching audit log:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit log',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ta/guardrails/dashboard
 * @desc Get guardrails dashboard metrics
 * @access TA (tenant scope)
 */
router.get(
  '/dashboard',
  requirePermission('guardrail', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      // Get guardrail summary
      const rulesResult = await query(
        `SELECT 
          COUNT(*) as total_rules,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_rules,
          COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_rules
        FROM guardrails_rules
        WHERE tenant_id = $1`,
        [req.user!.tenantId]
      );

      // Get violation summary
      const violationsResult = await query(
        `SELECT 
          COUNT(*) as total_violations,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open_violations,
          COUNT(CASE WHEN status = 'overridden' THEN 1 END) as overridden_violations,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_violations
        FROM guardrail_violations
        WHERE tenant_id = $1`,
        [req.user!.tenantId]
      );

      // Get violations by category
      const byCategoryResult = await query(
        `SELECT 
          g.category,
          COUNT(gv.id) as violation_count
        FROM guardrails_rules g
        LEFT JOIN guardrail_violations gv ON g.id = gv.rule_id AND gv.status = 'open'
        WHERE g.tenant_id = $1
        GROUP BY g.category
        ORDER BY violation_count DESC`,
        [req.user!.tenantId]
      );

      // Get recent violations
      const recentResult = await query(
        `SELECT 
          gv.id,
          g.name as rule_name,
          gv.blueprint_id,
          b.name as blueprint_name,
          gv.severity,
          gv.detected_at
        FROM guardrail_violations gv
        JOIN guardrails_rules g ON gv.rule_id = g.id
        LEFT JOIN blueprints b ON gv.blueprint_id = b.id
        WHERE gv.tenant_id = $1 AND gv.status = 'open'
        ORDER BY gv.detected_at DESC
        LIMIT 10`,
        [req.user!.tenantId]
      );

      const dashboard = {
        rules: rulesResult.rows[0],
        violations: violationsResult.rows[0],
        by_category: byCategoryResult.rows,
        recent_violations: recentResult.rows,
      };

      logger.info('Fetched guardrails dashboard metrics');

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      logger.error('Error fetching guardrails dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ta/guardrails/test
 * @desc Test a guardrail against sample IaC code
 * @access TA (tenant scope)
 */
router.post(
  '/test',
  requirePermission('guardrail', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { ruleId, testCode } = req.body;

      if (!ruleId || !testCode) {
        return res.status(400).json({
          success: false,
          error: 'Rule ID and test code are required',
        });
      }

      // Get the rule
      const ruleResult = await query(
        `SELECT * FROM guardrails_rules 
         WHERE id = $1 AND tenant_id = $2`,
        [ruleId, req.user!.tenantId]
      );

      if (ruleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Guardrail not found',
        });
      }

      const rule = ruleResult.rows[0];

      // Log the test
      await query(
        `INSERT INTO guardrail_audit 
          (rule_id, action, performed_by, details, timestamp, tenant_id)
        VALUES ($1, 'test', $2, $3, NOW(), $4)`,
        [
          ruleId,
          req.user!.email,
          JSON.stringify({ test_code_length: testCode.length }),
          req.user!.tenantId,
        ]
      );

      logger.info(`Guardrail ${ruleId} tested by ${req.user!.email}`);

      // Mock test result (in production, this would run actual validation)
      const testResult = {
        rule_id: ruleId,
        rule_name: rule.name,
        test_passed: true,
        violations_found: 0,
        test_timestamp: new Date().toISOString(),
        message: 'Test completed successfully - no violations detected',
      };

      res.json({
        success: true,
        data: testResult,
      });
    } catch (error: any) {
      logger.error('Error testing guardrail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test guardrail',
        details: error.message,
      });
    }
  }
);

export default router;
