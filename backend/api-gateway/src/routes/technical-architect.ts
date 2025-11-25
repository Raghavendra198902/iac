/**
 * Technical Architect API Routes
 * Manages technical specifications, technology evaluations, and architecture debt
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dharma_admin:dharma_secure_2024@localhost:5432/iac_dharma'
});

// ============================================================================
// Technical Specifications
// ============================================================================

/**
 * POST /api/ta/specs
 * Create technical specification
 */
router.post('/specs', async (req: Request, res: Response) => {
  try {
    const {
      title, solution_design_id, component_name, component_type,
      technology_stack, implementation_approach, infrastructure_requirements,
      performance_targets, authentication_method, monitoring_requirements
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ta_technical_specifications (
        spec_number, title, status, solution_design_id, component_name,
        component_type, technology_stack, implementation_approach,
        infrastructure_requirements, performance_targets,
        authentication_method, monitoring_requirements, created_by
      ) VALUES (
        CONCAT('TS-', LPAD(CAST(COALESCE((
          SELECT MAX(CAST(SUBSTRING(spec_number FROM 4) AS INTEGER))
          FROM ta_technical_specifications
        ), 0) + 1 AS TEXT), 5, '0')),
        $1, 'draft', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *
    `, [
      title, solution_design_id, component_name, component_type,
      technology_stack, implementation_approach, infrastructure_requirements,
      performance_targets, authentication_method, monitoring_requirements,
      req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create technical specification', message: error.message });
  }
});

/**
 * GET /api/ta/specs
 * List technical specifications
 */
router.get('/specs', async (req: Request, res: Response) => {
  try {
    const { status, solution_design_id, offset = 0, limit = 20 } = req.query;

    let query = 'SELECT * FROM ta_technical_specifications WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (solution_design_id) {
      query += ` AND solution_design_id = $${paramIndex++}`;
      params.push(solution_design_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM ta_technical_specifications');

    res.json({
      total: parseInt(countResult.rows[0].count),
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
      specifications: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch specifications', message: error.message });
  }
});

/**
 * GET /api/ta/specs/:specNumber
 * Get specific technical specification
 */
router.get('/specs/:specNumber', async (req: Request, res: Response) => {
  try {
    const { specNumber } = req.params;

    const result = await pool.query(
      'SELECT * FROM ta_technical_specifications WHERE spec_number = $1',
      [specNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technical specification not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch specification', message: error.message });
  }
});

// ============================================================================
// Technology Evaluations
// ============================================================================

/**
 * POST /api/ta/evaluations
 * Create technology evaluation
 */
router.post('/evaluations', async (req: Request, res: Response) => {
  try {
    const {
      technology_name, technology_category, evaluation_purpose,
      use_case, evaluation_criteria, functional_capabilities,
      technical_capabilities, strengths, weaknesses, recommendation,
      recommendation_rationale
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ta_technology_evaluations (
        evaluation_number, technology_name, technology_category,
        evaluation_purpose, use_case, evaluation_criteria,
        functional_capabilities, technical_capabilities,
        strengths, weaknesses, recommendation,
        recommendation_rationale, evaluated_by
      ) VALUES (
        CONCAT('TE-', LPAD(CAST(COALESCE((
          SELECT MAX(CAST(SUBSTRING(evaluation_number FROM 4) AS INTEGER))
          FROM ta_technology_evaluations
        ), 0) + 1 AS TEXT), 5, '0')),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
      RETURNING *
    `, [
      technology_name, technology_category, evaluation_purpose,
      use_case, evaluation_criteria, functional_capabilities,
      technical_capabilities, strengths, weaknesses, recommendation,
      recommendation_rationale, req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create evaluation', message: error.message });
  }
});

/**
 * GET /api/ta/evaluations
 * List technology evaluations
 */
router.get('/evaluations', async (req: Request, res: Response) => {
  try {
    const { category, recommendation } = req.query;

    let query = 'SELECT * FROM ta_technology_evaluations WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND technology_category = $${paramIndex++}`;
      params.push(category);
    }

    if (recommendation) {
      query += ` AND recommendation = $${paramIndex++}`;
      params.push(recommendation);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch evaluations', message: error.message });
  }
});

/**
 * POST /api/ta/evaluations/:evalNumber/approve
 * Approve technology
 */
router.post('/evaluations/:evalNumber/approve', async (req: Request, res: Response) => {
  try {
    const { evalNumber } = req.params;
    const { decision_by } = req.body;

    const result = await pool.query(
      `UPDATE ta_technology_evaluations 
       SET decision = 'approved', decision_date = CURRENT_DATE, decision_by = $1
       WHERE evaluation_number = $2 RETURNING *`,
      [decision_by, evalNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ message: 'Technology approved', evaluation: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve technology', message: error.message });
  }
});

// ============================================================================
// Architecture Debt
// ============================================================================

/**
 * POST /api/ta/debt
 * Create architecture debt item
 */
router.post('/debt', async (req: Request, res: Response) => {
  try {
    const {
      debt_title, debt_type, severity, description, root_cause,
      affected_components, business_impact, technical_impact,
      maintenance_cost_monthly, proposed_solution, estimated_effort_hours,
      priority_score
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ta_architecture_debt (
        debt_title, debt_type, severity, description, root_cause,
        affected_components, business_impact, technical_impact,
        maintenance_cost_monthly, proposed_solution, estimated_effort_hours,
        priority_score, status, identified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'identified', $13)
      RETURNING *
    `, [
      debt_title, debt_type, severity, description, root_cause,
      affected_components, business_impact, technical_impact,
      maintenance_cost_monthly, proposed_solution, estimated_effort_hours,
      priority_score, req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create debt item', message: error.message });
  }
});

/**
 * GET /api/ta/debt
 * List architecture debt
 */
router.get('/debt', async (req: Request, res: Response) => {
  try {
    const { severity, status, assigned_to } = req.query;

    let query = 'SELECT * FROM ta_architecture_debt WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (severity) {
      query += ` AND severity = $${paramIndex++}`;
      params.push(severity);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (assigned_to) {
      query += ` AND assigned_to = $${paramIndex++}`;
      params.push(assigned_to);
    }

    query += ' ORDER BY priority_score DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch debt items', message: error.message });
  }
});

/**
 * PUT /api/ta/debt/:debtId/assign
 * Assign debt to engineer
 */
router.put('/debt/:debtId/assign', async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const { assigned_to, project_id } = req.body;

    const result = await pool.query(
      `UPDATE ta_architecture_debt 
       SET assigned_to = $1, project_id = $2, status = 'planned'
       WHERE id = $3 RETURNING *`,
      [assigned_to, project_id, debtId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Debt item not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign debt', message: error.message });
  }
});

/**
 * PUT /api/ta/debt/:debtId/resolve
 * Mark debt as resolved
 */
router.put('/debt/:debtId/resolve', async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;

    const result = await pool.query(
      `UPDATE ta_architecture_debt 
       SET status = 'resolved', resolution_date = CURRENT_DATE
       WHERE id = $1 RETURNING *`,
      [debtId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Debt item not found' });
    }

    res.json({ message: 'Debt resolved', debt: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to resolve debt', message: error.message });
  }
});

/**
 * GET /api/ta/debt/summary
 * Get debt summary metrics
 */
router.get('/debt/summary', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_debt,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_count,
        COUNT(CASE WHEN status IN ('identified', 'analyzed') THEN 1 END) as unresolved_count,
        SUM(maintenance_cost_monthly) as total_monthly_cost,
        AVG(priority_score) as avg_priority
      FROM ta_architecture_debt
      WHERE status NOT IN ('resolved', 'accepted')
    `);

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch debt summary', message: error.message });
  }
});

/**
 * GET /api/ta/dashboard
 * Technical Architect dashboard metrics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM ta_dashboard');
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard', message: error.message });
  }
});

export default router;
