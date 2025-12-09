/**
 * SA Blueprint Routes
 * Endpoints for Solution Architects to design and manage blueprints
 */

import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissions';
import { query } from '../../utils/database';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authMiddleware);

/**
 * @route POST /api/sa/blueprints
 * @desc Create a new blueprint
 * @access SA (tenant scope)
 */
router.post(
  '/',
  requirePermission('blueprint', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const {
        name,
        description,
        category,
        provider,
        components,
        tags,
      } = req.body;

      if (!name || !category || !provider) {
        return res.status(400).json({
          success: false,
          error: 'Name, category, and provider are required',
        });
      }

      const blueprintResult = await query(
        `INSERT INTO blueprints 
          (name, description, category, provider, components, tags, version, status, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, '1.0.0', 'draft', $7, $8)
        RETURNING *`,
        [
          name,
          description || '',
          category,
          provider,
          JSON.stringify(components || {}),
          JSON.stringify(tags || []),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      const blueprint = blueprintResult.rows[0];

      logger.info(`Blueprint ${blueprint.id} created by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Blueprint created successfully',
        data: blueprint,
      });
    } catch (error: any) {
      logger.error('Error creating blueprint:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create blueprint',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/sa/blueprints
 * @desc Get all blueprints
 * @access SA (tenant scope)
 */
router.get(
  '/',
  requirePermission('blueprint', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { status, category, provider } = req.query;

      let queryText = `
        SELECT 
          b.*,
          COUNT(DISTINCT d.id) as deployment_count,
          COUNT(DISTINCT ig.id) as generation_count
        FROM blueprints b
        LEFT JOIN deployments d ON b.id = d.blueprint_id
        LEFT JOIN iac_generations ig ON b.id = ig.blueprint_id
        WHERE b.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (status) {
        queryText += ` AND b.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      if (category) {
        queryText += ` AND b.category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }

      if (provider) {
        queryText += ` AND b.provider = $${paramIndex}`;
        queryParams.push(provider);
        paramIndex++;
      }

      queryText += ` GROUP BY b.id ORDER BY b.created_at DESC`;

      const result = await query(queryText, queryParams);

      const blueprints = result.rows.map(row => ({
        ...row,
        components: typeof row.components === 'string' 
          ? JSON.parse(row.components) 
          : row.components,
        tags: typeof row.tags === 'string' 
          ? JSON.parse(row.tags) 
          : row.tags,
        deployment_count: parseInt(row.deployment_count) || 0,
        generation_count: parseInt(row.generation_count) || 0,
      }));

      logger.info(`Fetched ${blueprints.length} blueprints`);

      res.json({
        success: true,
        data: blueprints,
        count: blueprints.length,
      });
    } catch (error: any) {
      logger.error('Error fetching blueprints:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch blueprints',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/sa/blueprints/:id
 * @desc Get blueprint details
 * @access SA (tenant scope)
 */
router.get(
  '/:id',
  requirePermission('blueprint', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const blueprintResult = await query(
        `SELECT 
          b.*,
          COUNT(DISTINCT d.id) as deployment_count,
          COUNT(DISTINCT ig.id) as generation_count,
          COUNT(DISTINCT gv.id) as violation_count
        FROM blueprints b
        LEFT JOIN deployments d ON b.id = d.blueprint_id
        LEFT JOIN iac_generations ig ON b.id = ig.blueprint_id
        LEFT JOIN guardrail_violations gv ON b.id = gv.blueprint_id AND gv.status = 'open'
        WHERE b.id = $1 AND b.tenant_id = $2
        GROUP BY b.id`,
        [id, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      const blueprint = blueprintResult.rows[0];

      // Get recent deployments
      const deploymentsResult = await query(
        `SELECT id, status, environment, created_at
        FROM deployments
        WHERE blueprint_id = $1 AND tenant_id = $2
        ORDER BY created_at DESC
        LIMIT 5`,
        [id, req.user!.tenantId]
      );

      // Get recent IaC generations
      const generationsResult = await query(
        `SELECT id, provider, status, created_at
        FROM iac_generations
        WHERE blueprint_id = $1 AND tenant_id = $2
        ORDER BY created_at DESC
        LIMIT 5`,
        [id, req.user!.tenantId]
      );

      const detailedBlueprint = {
        ...blueprint,
        components: typeof blueprint.components === 'string' 
          ? JSON.parse(blueprint.components) 
          : blueprint.components,
        tags: typeof blueprint.tags === 'string' 
          ? JSON.parse(blueprint.tags) 
          : blueprint.tags,
        deployment_count: parseInt(blueprint.deployment_count) || 0,
        generation_count: parseInt(blueprint.generation_count) || 0,
        violation_count: parseInt(blueprint.violation_count) || 0,
        recent_deployments: deploymentsResult.rows,
        recent_generations: generationsResult.rows,
      };

      logger.info(`Fetched blueprint ${id} details`);

      res.json({
        success: true,
        data: detailedBlueprint,
      });
    } catch (error: any) {
      logger.error('Error fetching blueprint details:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch blueprint details',
        details: error.message,
      });
    }
  }
);

/**
 * @route PATCH /api/sa/blueprints/:id
 * @desc Update a blueprint
 * @access SA (tenant scope)
 */
router.patch(
  '/:id',
  requirePermission('blueprint', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, description, components, tags, status } = req.body;

      const blueprintCheck = await query(
        `SELECT id FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (blueprintCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      const updates: string[] = [];
      const updateParams: any[] = [];
      let paramIndex = 1;

      if (name) {
        updates.push(`name = $${paramIndex}`);
        updateParams.push(name);
        paramIndex++;
      }

      if (description) {
        updates.push(`description = $${paramIndex}`);
        updateParams.push(description);
        paramIndex++;
      }

      if (components) {
        updates.push(`components = $${paramIndex}`);
        updateParams.push(JSON.stringify(components));
        paramIndex++;
      }

      if (tags) {
        updates.push(`tags = $${paramIndex}`);
        updateParams.push(JSON.stringify(tags));
        paramIndex++;
      }

      if (status) {
        updates.push(`status = $${paramIndex}`);
        updateParams.push(status);
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
        UPDATE blueprints 
        SET ${updates.join(', ')}
        WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1}
        RETURNING *
      `;

      const updateResult = await query(updateQuery, updateParams);
      const updated = updateResult.rows[0];

      logger.info(`Blueprint ${id} updated by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Blueprint updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Error updating blueprint:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to update blueprint',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/blueprints/:id/version
 * @desc Create a new version of a blueprint
 * @access SA (tenant scope)
 */
router.post(
  '/:id/version',
  requirePermission('blueprint', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { versionNotes } = req.body;

      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      const blueprint = blueprintResult.rows[0];
      
      // Parse current version and increment
      const versionParts = blueprint.version.split('.');
      versionParts[1] = String(parseInt(versionParts[1]) + 1);
      const newVersion = versionParts.join('.');

      // Create version history entry
      await query(
        `INSERT INTO blueprint_versions 
          (blueprint_id, version, components, notes, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          blueprint.version,
          blueprint.components,
          versionNotes || 'Version snapshot',
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      // Update blueprint version
      const versionResult = await query(
        `UPDATE blueprints 
         SET version = $1, updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING *`,
        [newVersion, id, req.user!.tenantId]
      );

      logger.info(`Blueprint ${id} versioned to ${newVersion} by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'New version created successfully',
        data: versionResult.rows[0],
      });
    } catch (error: any) {
      logger.error('Error creating blueprint version:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create version',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/blueprints/:id/validate
 * @desc Validate a blueprint
 * @access SA (tenant scope)
 */
router.post(
  '/:id/validate',
  requirePermission('blueprint', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      // Check for guardrail violations
      const violationsResult = await query(
        `SELECT 
          gv.*,
          gr.name as rule_name
        FROM guardrail_violations gv
        JOIN guardrails_rules gr ON gv.rule_id = gr.id
        WHERE gv.blueprint_id = $1 AND gv.status = 'open' AND gv.tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      const validationStatus = violationsResult.rows.length === 0 ? 'passed' : 'failed';

      // Store validation result
      const validationResult = await query(
        `INSERT INTO blueprint_validations 
          (blueprint_id, validation_status, violations_found, validated_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          id,
          validationStatus,
          violationsResult.rows.length,
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`Blueprint ${id} validated with status: ${validationStatus}`);

      res.json({
        success: true,
        data: {
          ...validationResult.rows[0],
          violations: violationsResult.rows,
        },
      });
    } catch (error: any) {
      logger.error('Error validating blueprint:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to validate blueprint',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/blueprints/:id/clone
 * @desc Clone an existing blueprint
 * @access SA (tenant scope)
 */
router.post(
  '/:id/clone',
  requirePermission('blueprint', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { newName } = req.body;

      const sourceResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (sourceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Source blueprint not found',
        });
      }

      const source = sourceResult.rows[0];

      const cloneResult = await query(
        `INSERT INTO blueprints 
          (name, description, category, provider, components, tags, version, status, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, '1.0.0', 'draft', $7, $8)
        RETURNING *`,
        [
          newName || `${source.name} (Copy)`,
          source.description,
          source.category,
          source.provider,
          source.components,
          source.tags,
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      const clonedBlueprint = cloneResult.rows[0];

      logger.info(`Blueprint ${id} cloned to ${clonedBlueprint.id} by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Blueprint cloned successfully',
        data: clonedBlueprint,
      });
    } catch (error: any) {
      logger.error('Error cloning blueprint:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to clone blueprint',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/sa/blueprints/:id/diagram
 * @desc Get blueprint architecture diagram
 * @access SA (tenant scope)
 */
router.get(
  '/:id/diagram',
  requirePermission('blueprint', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      const blueprint = blueprintResult.rows[0];
      const components = typeof blueprint.components === 'string' 
        ? JSON.parse(blueprint.components) 
        : blueprint.components;

      // Generate diagram data (in production, this would create actual diagrams)
      const diagramData = {
        blueprint_id: id,
        blueprint_name: blueprint.name,
        provider: blueprint.provider,
        nodes: Object.keys(components).map((key, idx) => ({
          id: `node-${idx}`,
          label: key,
          type: components[key].type || 'service',
        })),
        edges: [],
        metadata: {
          generated_at: new Date().toISOString(),
          component_count: Object.keys(components).length,
        },
      };

      logger.info(`Generated diagram for blueprint ${id}`);

      res.json({
        success: true,
        data: diagramData,
      });
    } catch (error: any) {
      logger.error('Error generating diagram:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate diagram',
        details: error.message,
      });
    }
  }
);

export default router;
