/**
 * EA Architecture Pattern Routes
 * Endpoints for Enterprise Architects to manage architecture patterns
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
 * @route POST /api/ea/patterns
 * @desc Create a new architecture pattern
 * @access EA (tenant scope)
 */
router.post(
  '/',
  requirePermission('pattern', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const {
        name,
        description,
        patternType,
        category,
        patternDefinition,
        implementationGuide,
        bestPractices,
      } = req.body;

      if (!name || !patternType || !category || !patternDefinition) {
        return res.status(400).json({
          success: false,
          error: 'Name, type, category, and definition are required',
        });
      }

      // Create pattern
      const patternResult = await query(
        `INSERT INTO architecture_patterns 
          (name, description, pattern_type, category, status, pattern_definition, 
           implementation_guide, best_practices, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          name,
          description || '',
          patternType,
          category,
          JSON.stringify(patternDefinition),
          implementationGuide || '',
          bestPractices || '',
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      const pattern = patternResult.rows[0];

      logger.info(`Architecture pattern ${pattern.id} created by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Architecture pattern created successfully',
        data: pattern,
      });
    } catch (error: any) {
      logger.error('Error creating pattern:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create pattern',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ea/patterns
 * @desc Get all architecture patterns
 * @access EA (tenant scope)
 */
router.get(
  '/',
  requirePermission('pattern', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { status, patternType, category } = req.query;

      // Build query with filters
      let queryText = `
        SELECT 
          p.*,
          COUNT(DISTINCT b.id) as usage_count
        FROM architecture_patterns p
        LEFT JOIN blueprints b ON b.pattern_id = p.id
        WHERE p.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (status) {
        queryText += ` AND p.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      if (patternType) {
        queryText += ` AND p.pattern_type = $${paramIndex}`;
        queryParams.push(patternType);
        paramIndex++;
      }

      if (category) {
        queryText += ` AND p.category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }

      queryText += ` GROUP BY p.id ORDER BY p.name ASC`;

      const result = await query(queryText, queryParams);

      // Format results
      const patterns = result.rows.map(row => ({
        ...row,
        pattern_definition: typeof row.pattern_definition === 'string' 
          ? JSON.parse(row.pattern_definition) 
          : row.pattern_definition,
        usage_count: parseInt(row.usage_count) || 0,
      }));

      logger.info(`Fetched ${patterns.length} architecture patterns`);

      res.json({
        success: true,
        data: patterns,
        count: patterns.length,
      });
    } catch (error: any) {
      logger.error('Error fetching patterns:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch patterns',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ea/patterns/:id/approve
 * @desc Approve an architecture pattern
 * @access EA (tenant scope)
 */
router.post(
  '/:id/approve',
  requirePermission('pattern', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { approvalNotes } = req.body;

      // Get current pattern
      const patternResult = await query(
        `SELECT * FROM architecture_patterns 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (patternResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pattern not found',
        });
      }

      const pattern = patternResult.rows[0];

      if (pattern.status !== 'draft') {
        return res.status(400).json({
          success: false,
          error: 'Only draft patterns can be approved',
        });
      }

      // Approve pattern
      const updateResult = await query(
        `UPDATE architecture_patterns 
         SET status = 'approved', 
             approved_by = $1, 
             approved_at = NOW(),
             approval_notes = $2
         WHERE id = $3 AND tenant_id = $4
         RETURNING *`,
        [req.user!.email, approvalNotes || '', id, req.user!.tenantId]
      );

      const approved = updateResult.rows[0];

      logger.info(`Pattern ${id} approved by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Pattern approved successfully',
        data: approved,
      });
    } catch (error: any) {
      logger.error('Error approving pattern:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to approve pattern',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ea/patterns/:id
 * @desc Get detailed pattern information
 * @access EA (tenant scope)
 */
router.get(
  '/:id',
  requirePermission('pattern', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Get pattern with usage examples
      const patternResult = await query(
        `SELECT 
          p.*,
          COUNT(DISTINCT b.id) as usage_count
        FROM architecture_patterns p
        LEFT JOIN blueprints b ON b.pattern_id = p.id
        WHERE p.id = $1 AND p.tenant_id = $2
        GROUP BY p.id`,
        [id, req.user!.tenantId]
      );

      if (patternResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pattern not found',
        });
      }

      const pattern = patternResult.rows[0];

      // Get usage examples (blueprints using this pattern)
      const usageResult = await query(
        `SELECT 
          id,
          name,
          created_at,
          created_by
        FROM blueprints
        WHERE pattern_id = $1 AND tenant_id = $2
        ORDER BY created_at DESC
        LIMIT 10`,
        [id, req.user!.tenantId]
      );

      const detailedPattern = {
        ...pattern,
        pattern_definition: typeof pattern.pattern_definition === 'string' 
          ? JSON.parse(pattern.pattern_definition) 
          : pattern.pattern_definition,
        usage_count: parseInt(pattern.usage_count) || 0,
        usage_examples: usageResult.rows,
      };

      logger.info(`Fetched pattern ${id} details`);

      res.json({
        success: true,
        data: detailedPattern,
      });
    } catch (error: any) {
      logger.error('Error fetching pattern details:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pattern details',
        details: error.message,
      });
    }
  }
);

export default router;
