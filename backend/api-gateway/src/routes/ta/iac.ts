/**
 * TA IaC Generation Routes
 * Endpoints for Technical Architects to generate and manage Infrastructure-as-Code
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
 * @route POST /api/ta/iac/generate
 * @desc Generate IaC code from a blueprint
 * @access TA (tenant scope)
 */
router.post(
  '/generate',
  requirePermission('iac', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId, provider, outputFormat } = req.body;

      if (!blueprintId || !provider) {
        return res.status(400).json({
          success: false,
          error: 'Blueprint ID and provider are required',
        });
      }

      // Get blueprint
      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [blueprintId, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      const blueprint = blueprintResult.rows[0];

      // Mock generated files (in production, this would call IaC generation engine)
      const generatedFiles = {
        'main.tf': `# Generated Terraform for ${blueprint.name}\nterraform {\n  required_version = ">= 1.0"\n}\n`,
        'variables.tf': '# Input variables\n',
        'outputs.tf': '# Output values\n',
      };

      // Store generation
      const generationResult = await query(
        `INSERT INTO iac_generations 
          (blueprint_id, provider, output_format, generated_files, status, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, 'completed', $5, $6)
        RETURNING *`,
        [
          blueprintId,
          provider,
          outputFormat || 'terraform',
          JSON.stringify(generatedFiles),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      const generation = generationResult.rows[0];

      logger.info(`IaC generated for blueprint ${blueprintId} by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'IaC generated successfully',
        data: {
          ...generation,
          generated_files: generatedFiles,
        },
      });
    } catch (error: any) {
      logger.error('Error generating IaC:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate IaC',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ta/iac/validate
 * @desc Validate IaC code
 * @access TA (tenant scope)
 */
router.post(
  '/validate',
  requirePermission('iac', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { generationId, code, provider } = req.body;

      if ((!generationId && !code) || !provider) {
        return res.status(400).json({
          success: false,
          error: 'Generation ID or code, and provider are required',
        });
      }

      // Mock validation (in production, this would run terraform validate, etc.)
      const validationErrors: any[] = [];
      const validationWarnings: string[] = [];

      const validationStatus = validationErrors.length === 0 ? 'passed' : 'failed';

      // Store validation result
      const validationResult = await query(
        `INSERT INTO iac_validation_results 
          (generation_id, validation_status, errors, warnings, validated_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          generationId || null,
          validationStatus,
          JSON.stringify(validationErrors),
          JSON.stringify(validationWarnings),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`IaC validation completed with status: ${validationStatus}`);

      res.json({
        success: true,
        data: {
          ...validationResult.rows[0],
          errors: validationErrors,
          warnings: validationWarnings,
        },
      });
    } catch (error: any) {
      logger.error('Error validating IaC:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to validate IaC',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ta/iac/templates
 * @desc Get all IaC templates
 * @access TA (tenant scope)
 */
router.get(
  '/templates',
  requirePermission('iac', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { provider, category } = req.query;

      let queryText = `
        SELECT 
          t.*,
          COUNT(DISTINCT ig.id) as usage_count
        FROM iac_templates t
        LEFT JOIN iac_generations ig ON t.id = ig.template_id
        WHERE t.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (provider) {
        queryText += ` AND t.provider = $${paramIndex}`;
        queryParams.push(provider);
        paramIndex++;
      }

      if (category) {
        queryText += ` AND t.category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }

      queryText += ` GROUP BY t.id ORDER BY t.name ASC`;

      const result = await query(queryText, queryParams);

      const templates = result.rows.map(row => ({
        ...row,
        template_content: typeof row.template_content === 'string' 
          ? JSON.parse(row.template_content) 
          : row.template_content,
        usage_count: parseInt(row.usage_count) || 0,
      }));

      logger.info(`Fetched ${templates.length} IaC templates`);

      res.json({
        success: true,
        data: templates,
        count: templates.length,
      });
    } catch (error: any) {
      logger.error('Error fetching templates:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ta/iac/generations
 * @desc Get IaC generation history
 * @access TA (tenant scope)
 */
router.get(
  '/generations',
  requirePermission('iac', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId, status, limit = 50 } = req.query;

      let queryText = `
        SELECT 
          ig.*,
          b.name as blueprint_name,
          t.name as template_name
        FROM iac_generations ig
        LEFT JOIN blueprints b ON ig.blueprint_id = b.id
        LEFT JOIN iac_templates t ON ig.template_id = t.id
        WHERE ig.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (blueprintId) {
        queryText += ` AND ig.blueprint_id = $${paramIndex}`;
        queryParams.push(blueprintId);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND ig.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      queryText += ` ORDER BY ig.created_at DESC LIMIT $${paramIndex}`;
      queryParams.push(Number(limit));

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} IaC generations`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Error fetching generations:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch generations',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ta/iac/generations/:id/files
 * @desc Get generated files for a specific generation
 * @access TA (tenant scope)
 */
router.get(
  '/generations/:id/files',
  requirePermission('iac', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT 
          ig.*,
          b.name as blueprint_name
        FROM iac_generations ig
        LEFT JOIN blueprints b ON ig.blueprint_id = b.id
        WHERE ig.id = $1 AND ig.tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Generation not found',
        });
      }

      const generation = result.rows[0];
      const generatedFiles = typeof generation.generated_files === 'string'
        ? JSON.parse(generation.generated_files)
        : generation.generated_files;

      logger.info(`Fetched files for generation ${id}`);

      res.json({
        success: true,
        data: {
          generation_id: id,
          blueprint_id: generation.blueprint_id,
          blueprint_name: generation.blueprint_name,
          provider: generation.provider,
          created_at: generation.created_at,
          files: generatedFiles,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching generation files:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch generation files',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ta/iac/templates
 * @desc Create a new IaC template
 * @access TA (tenant scope)
 */
router.post(
  '/templates',
  requirePermission('iac', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const {
        name,
        description,
        provider,
        category,
        templateContent,
        tags,
      } = req.body;

      if (!name || !provider || !templateContent) {
        return res.status(400).json({
          success: false,
          error: 'Name, provider, and template content are required',
        });
      }

      const templateResult = await query(
        `INSERT INTO iac_templates 
          (name, description, provider, category, template_content, tags, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          name,
          description || '',
          provider,
          category || 'general',
          JSON.stringify(templateContent),
          JSON.stringify(tags || []),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      const template = templateResult.rows[0];

      logger.info(`IaC template ${template.id} created by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: template,
      });
    } catch (error: any) {
      logger.error('Error creating template:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create template',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/ta/iac/standards
 * @desc Get IaC coding standards
 * @access TA (tenant scope)
 */
router.get(
  '/standards',
  requirePermission('iac', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { provider } = req.query;

      let queryText = `
        SELECT * FROM iac_standards
        WHERE tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];

      if (provider) {
        queryText += ` AND provider = $2`;
        queryParams.push(provider);
      }

      queryText += ` ORDER BY provider, category`;

      const result = await query(queryText, queryParams);

      const standards = result.rows.map(row => ({
        ...row,
        rules: typeof row.rules === 'string' ? JSON.parse(row.rules) : row.rules,
      }));

      logger.info(`Fetched ${standards.length} IaC coding standards`);

      res.json({
        success: true,
        data: standards,
        count: standards.length,
      });
    } catch (error: any) {
      logger.error('Error fetching standards:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch standards',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ta/iac/estimate-cost
 * @desc Estimate infrastructure cost from IaC
 * @access TA (tenant scope)
 */
router.post(
  '/estimate-cost',
  requirePermission('iac', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId, generationId, provider, region } = req.body;

      if ((!blueprintId && !generationId) || !provider) {
        return res.status(400).json({
          success: false,
          error: 'Blueprint ID or Generation ID, and provider are required',
        });
      }

      // Mock cost estimation (in production, this would call cost estimation engine)
      const costEstimate = {
        provider,
        region: region || 'us-east-1',
        monthly_estimate: 847.50,
        breakdown: {
          compute: 450.00,
          storage: 120.00,
          networking: 150.50,
          database: 127.00,
        },
        currency: 'USD',
      };

      // Store cost estimate
      const estimateResult = await query(
        `INSERT INTO iac_cost_estimates 
          (blueprint_id, generation_id, provider, region, monthly_estimate, breakdown, estimated_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          blueprintId || null,
          generationId || null,
          provider,
          region || 'us-east-1',
          costEstimate.monthly_estimate,
          JSON.stringify(costEstimate.breakdown),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`Cost estimate created for ${blueprintId || generationId}`);

      res.json({
        success: true,
        data: {
          ...estimateResult.rows[0],
          breakdown: costEstimate.breakdown,
        },
      });
    } catch (error: any) {
      logger.error('Error estimating cost:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to estimate cost',
        details: error.message,
      });
    }
  }
);

export default router;
