/**
 * EA Compliance Routes
 * Endpoints for Enterprise Architects to manage compliance and assessments
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
 * @route GET /api/ea/compliance/frameworks
 * @desc Get all compliance frameworks
 * @access EA (tenant scope)
 */
router.get(
  '/frameworks',
  requirePermission('governance', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { status } = req.query;

      let queryText = `
        SELECT 
          cf.*,
          COUNT(DISTINCT ca.id) as assessment_count
        FROM compliance_frameworks cf
        LEFT JOIN compliance_assessments ca ON cf.id = ca.framework_id
        WHERE cf.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];

      if (status) {
        queryText += ` AND cf.status = $2`;
        queryParams.push(status);
      }

      queryText += ` GROUP BY cf.id ORDER BY cf.name ASC`;

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} compliance frameworks`);

      res.json({
        success: true,
        data: result.rows.map(row => ({
          ...row,
          assessment_count: parseInt(row.assessment_count) || 0,
        })),
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Error fetching compliance frameworks:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch compliance frameworks',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ea/compliance/assessments
 * @desc Create a new compliance assessment
 * @access EA (tenant scope)
 */
router.post(
  '/assessments',
  requirePermission('governance', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { frameworkId, scope, assessmentDate, auditor } = req.body;

      if (!frameworkId || !scope) {
        return res.status(400).json({
          success: false,
          error: 'Framework ID and scope are required',
        });
      }

      // Verify framework exists
      const frameworkCheck = await query(
        `SELECT id FROM compliance_frameworks 
         WHERE id = $1 AND tenant_id = $2`,
        [frameworkId, req.user!.tenantId]
      );

      if (frameworkCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Compliance framework not found',
        });
      }

      // Create assessment
      const assessmentResult = await query(
        `INSERT INTO compliance_assessments 
          (framework_id, scope, status, assessment_date, auditor, created_by, tenant_id)
        VALUES ($1, $2, 'in-progress', $3, $4, $5, $6)
        RETURNING *`,
        [
          frameworkId,
          scope,
          assessmentDate || new Date().toISOString(),
          auditor || req.user!.email,
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      const assessment = assessmentResult.rows[0];

      logger.info(`Compliance assessment ${assessment.id} created by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Compliance assessment created successfully',
        data: assessment,
      });
    } catch (error: any) {
      logger.error('Error creating compliance assessment:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create assessment',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ea/compliance/assessments
 * @desc Get all compliance assessments
 * @access EA (tenant scope)
 */
router.get(
  '/assessments',
  requirePermission('governance', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { frameworkId, status, limit = 50 } = req.query;

      let queryText = `
        SELECT 
          ca.*,
          cf.name as framework_name,
          cf.framework_version
        FROM compliance_assessments ca
        JOIN compliance_frameworks cf ON ca.framework_id = cf.id
        WHERE ca.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (frameworkId) {
        queryText += ` AND ca.framework_id = $${paramIndex}`;
        queryParams.push(frameworkId);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND ca.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      queryText += ` ORDER BY ca.assessment_date DESC LIMIT $${paramIndex}`;
      queryParams.push(Number(limit));

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} compliance assessments`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Error fetching compliance assessments:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assessments',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ea/compliance/dashboard
 * @desc Get compliance dashboard metrics
 * @access EA (tenant scope)
 */
router.get(
  '/dashboard',
  requirePermission('governance', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      // Get framework summary
      const frameworksResult = await query(
        `SELECT 
          COUNT(*) as total_frameworks,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_frameworks,
          COUNT(CASE WHEN certification_required = true AND certification_expiry < NOW() THEN 1 END) as expired_certifications
        FROM compliance_frameworks
        WHERE tenant_id = $1`,
        [req.user!.tenantId]
      );

      // Get assessment summary
      const assessmentsResult = await query(
        `SELECT 
          COUNT(*) as total_assessments,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          AVG(CASE WHEN status = 'completed' THEN compliance_score END) as avg_compliance_score
        FROM compliance_assessments
        WHERE tenant_id = $1`,
        [req.user!.tenantId]
      );

      // Get recent assessments
      const recentResult = await query(
        `SELECT 
          ca.id,
          ca.framework_id,
          cf.name as framework_name,
          ca.assessment_date,
          ca.status,
          ca.compliance_score
        FROM compliance_assessments ca
        JOIN compliance_frameworks cf ON ca.framework_id = cf.id
        WHERE ca.tenant_id = $1
        ORDER BY ca.assessment_date DESC
        LIMIT 5`,
        [req.user!.tenantId]
      );

      const dashboard = {
        frameworks: frameworksResult.rows[0],
        assessments: {
          ...assessmentsResult.rows[0],
          avg_compliance_score: parseFloat(assessmentsResult.rows[0].avg_compliance_score) || 0,
        },
        recent_assessments: recentResult.rows,
      };

      logger.info('Fetched compliance dashboard metrics');

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      logger.error('Error fetching compliance dashboard:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch compliance dashboard',
        details: error.message,
      });
    }
  }
);

export default router;
