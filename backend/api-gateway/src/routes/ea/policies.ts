/**
 * EA Governance Policy Routes
 * Endpoints for Enterprise Architects to manage governance policies
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
 * @route POST /api/ea/policies
 * @desc Create a new governance policy
 * @access EA (tenant scope)
 */
router.post(
  '/',
  requirePermission('policy', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const {
        name,
        description,
        policyType,
        category,
        severity,
        policyRules,
        enforcementLevel,
        effectiveFrom,
      } = req.body;

      if (!name || !policyType || !policyRules || !enforcementLevel) {
        return res.status(400).json({
          success: false,
          error: 'Name, policy type, rules, and enforcement level are required',
        });
      }

      // Validate enforcement level
      const validEnforcement = ['advisory', 'soft-fail', 'hard-fail'];
      if (!validEnforcement.includes(enforcementLevel)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid enforcement level',
        });
      }

      // Create policy
      const policyResult = await query(
        `INSERT INTO governance_policies 
          (name, description, policy_type, category, severity, policy_rules, 
           enforcement_level, status, version, created_by, effective_from, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', '1.0', $8, $9, $10)
        RETURNING *`,
        [
          name,
          description || '',
          policyType,
          category || 'general',
          severity || 'warning',
          JSON.stringify(policyRules),
          enforcementLevel,
          req.user!.email,
          effectiveFrom || new Date().toISOString(),
          req.user!.tenantId,
        ]
      );

      const policy = policyResult.rows[0];

      logger.info(`Policy ${policy.id} created by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Policy created successfully',
        data: policy,
      });
    } catch (error: any) {
      logger.error('Error creating policy:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create policy',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ea/policies
 * @desc Get all governance policies in scope
 * @access EA (tenant scope)
 */
router.get(
  '/',
  requirePermission('policy', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { status, policyType, category, severity } = req.query;

      // Build query with filters
      let queryText = `
        SELECT 
          p.*,
          COUNT(DISTINCT pv.id) as violation_count,
          MAX(pv.detected_at) as last_violation
        FROM governance_policies p
        LEFT JOIN policy_violations pv ON p.id = pv.policy_id AND pv.status != 'remediated'
        WHERE p.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      // Filter by status
      if (status) {
        queryText += ` AND p.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      // Filter by policy type
      if (policyType) {
        queryText += ` AND p.policy_type = $${paramIndex}`;
        queryParams.push(policyType);
        paramIndex++;
      }

      // Filter by category
      if (category) {
        queryText += ` AND p.category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }

      // Filter by severity
      if (severity) {
        queryText += ` AND p.severity = $${paramIndex}`;
        queryParams.push(severity);
        paramIndex++;
      }

      queryText += ` GROUP BY p.id ORDER BY 
        CASE p.severity 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        p.name ASC`;

      const result = await query(queryText, queryParams);

      // Format results
      const policies = result.rows.map(row => ({
        ...row,
        policy_rules: typeof row.policy_rules === 'string' 
          ? JSON.parse(row.policy_rules) 
          : row.policy_rules,
        violation_count: parseInt(row.violation_count) || 0,
      }));

      logger.info(`Fetched ${policies.length} policies`);

      res.json({
        success: true,
        data: policies,
        count: policies.length,
      });
    } catch (error: any) {
      logger.error('Error fetching policies:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policies',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ea/policies/:id/violations
 * @desc Get violations for a specific policy
 * @access EA (tenant scope)
 */
router.get(
  '/:id/violations',
  requirePermission('policy', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, resourceType, limit = 50 } = req.query;

      // Verify policy exists
      const policyCheck = await query(
        `SELECT id FROM governance_policies 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (policyCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found',
        });
      }

      // Build violations query
      let queryText = `
        SELECT 
          pv.*,
          p.name as policy_name
        FROM policy_violations pv
        JOIN governance_policies p ON pv.policy_id = p.id
        WHERE pv.policy_id = $1 AND pv.tenant_id = $2
      `;
      const queryParams: any[] = [id, req.user!.tenantId];
      let paramIndex = 3;

      // Filter by status
      if (status) {
        queryText += ` AND pv.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      // Filter by resource type
      if (resourceType) {
        queryText += ` AND pv.resource_type = $${paramIndex}`;
        queryParams.push(resourceType);
        paramIndex++;
      }

      queryText += ` ORDER BY pv.detected_at DESC LIMIT $${paramIndex}`;
      queryParams.push(Number(limit));

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} violations for policy ${id}`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Error fetching violations:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch violations',
        details: error.message,
      });
    }
  }
);

/**
 * @route PATCH /api/ea/policies/:id
 * @desc Update a governance policy
 * @access EA (tenant scope)
 */
router.patch(
  '/:id',
  requirePermission('policy', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, policyRules, enforcementLevel, description } = req.body;

      // Get current policy
      const currentResult = await query(
        `SELECT * FROM governance_policies 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found',
        });
      }

      const current = currentResult.rows[0];

      // Check if deprecated
      if (current.status === 'deprecated') {
        return res.status(400).json({
          success: false,
          error: 'Cannot update deprecated policy',
        });
      }

      // Build update query
      const updates: string[] = [];
      const updateParams: any[] = [];
      let paramIndex = 1;
      let versionBump = false;

      if (status) {
        updates.push(`status = $${paramIndex}`);
        updateParams.push(status);
        paramIndex++;
      }

      if (policyRules) {
        updates.push(`policy_rules = $${paramIndex}`);
        updateParams.push(JSON.stringify(policyRules));
        paramIndex++;
        versionBump = true; // Rules change = version bump
      }

      if (enforcementLevel) {
        updates.push(`enforcement_level = $${paramIndex}`);
        updateParams.push(enforcementLevel);
        paramIndex++;
        versionBump = true;
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

      // Version bump if rules changed
      if (versionBump) {
        const [major, minor] = current.version.split('.');
        const newVersion = `${major}.${parseInt(minor) + 1}`;
        updates.push(`version = $${paramIndex}`);
        updateParams.push(newVersion);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);

      // Add tenant_id and id to params
      updateParams.push(req.user!.tenantId, id);

      // Update policy
      const updateQuery = `
        UPDATE governance_policies 
        SET ${updates.join(', ')}
        WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1}
        RETURNING *
      `;

      const updateResult = await query(updateQuery, updateParams);
      const updated = updateResult.rows[0];

      logger.info(`Policy ${id} updated by ${req.user!.email}`);

      // If rules changed and policy is active, trigger re-evaluation
      if (versionBump && updated.status === 'active') {
        logger.info(`Triggering re-evaluation for policy ${id} after rule changes`);
        // TODO: Trigger async re-evaluation workflow
      }

      res.json({
        success: true,
        message: 'Policy updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Error updating policy:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to update policy',
        details: error.message,
      });
    }
  }
);

export default router;
