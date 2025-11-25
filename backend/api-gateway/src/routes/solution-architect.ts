/**
 * Solution Architect API Routes
 * Manages solution designs, design reviews, and solution patterns
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dharma_admin:dharma_secure_2024@localhost:5432/iac_dharma'
});

// ============================================================================
// Solution Designs
// ============================================================================

/**
 * POST /api/sa/designs
 * Create new solution design
 */
router.post('/designs', async (req: Request, res: Response) => {
  try {
    const {
      title, business_problem, stakeholders, success_criteria,
      proposed_solution, component_breakdown, technologies,
      performance_requirements, security_requirements,
      estimated_cost, timeline_weeks, risks, compliance_frameworks
    } = req.body;

    const result = await pool.query(`
      INSERT INTO sa_solution_designs (
        design_number, title, status, business_problem, stakeholders,
        success_criteria, proposed_solution, component_breakdown,
        technologies, performance_requirements, security_requirements,
        estimated_cost, timeline_weeks, risks, compliance_frameworks,
        created_by
      ) VALUES (
        CONCAT('SD-', LPAD(CAST(COALESCE((
          SELECT MAX(CAST(SUBSTRING(design_number FROM 4) AS INTEGER))
          FROM sa_solution_designs
        ), 0) + 1 AS TEXT), 5, '0')),
        $1, 'draft', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *
    `, [
      title, business_problem, stakeholders, success_criteria,
      proposed_solution, component_breakdown, technologies,
      performance_requirements, security_requirements,
      estimated_cost, timeline_weeks, risks, compliance_frameworks,
      req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create solution design', message: error.message });
  }
});

/**
 * GET /api/sa/designs
 * List solution designs with filtering
 */
router.get('/designs', async (req: Request, res: Response) => {
  try {
    const { status, creator_id, offset = 0, limit = 20 } = req.query;

    let query = 'SELECT * FROM sa_solution_designs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (creator_id) {
      query += ` AND created_by = $${paramIndex++}`;
      params.push(creator_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query('SELECT COUNT(*) FROM sa_solution_designs');

    res.json({
      total: parseInt(countResult.rows[0].count),
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
      designs: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch solution designs', message: error.message });
  }
});

/**
 * GET /api/sa/designs/:designNumber
 * Get specific solution design
 */
router.get('/designs/:designNumber', async (req: Request, res: Response) => {
  try {
    const { designNumber } = req.params;

    const result = await pool.query(
      'SELECT * FROM sa_solution_designs WHERE design_number = $1',
      [designNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solution design not found' });
    }

    // Get related reviews
    const reviews = await pool.query(
      'SELECT * FROM sa_design_reviews WHERE solution_design_id = $1 ORDER BY review_date DESC',
      [result.rows[0].id]
    );

    res.json({
      ...result.rows[0],
      reviews: reviews.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch solution design', message: error.message });
  }
});

/**
 * PUT /api/sa/designs/:designNumber
 * Update solution design
 */
router.put('/designs/:designNumber', async (req: Request, res: Response) => {
  try {
    const { designNumber } = req.params;
    const updateFields = req.body;

    const allowedFields = [
      'title', 'business_problem', 'stakeholders', 'success_criteria',
      'proposed_solution', 'component_breakdown', 'technologies',
      'performance_requirements', 'security_requirements', 'estimated_cost',
      'timeline_weeks', 'risks', 'mitigation_strategies', 'status'
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.keys(updateFields).forEach(field => {
      if (allowedFields.includes(field)) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(updateFields[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_by = $${paramIndex++}`);
    values.push(req.body.user_id || '00000000-0000-0000-0000-000000000000');
    values.push(designNumber);

    const result = await pool.query(
      `UPDATE sa_solution_designs SET ${updates.join(', ')} 
       WHERE design_number = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solution design not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update solution design', message: error.message });
  }
});

/**
 * POST /api/sa/designs/:designNumber/submit-review
 * Submit design for review
 */
router.post('/designs/:designNumber/submit-review', async (req: Request, res: Response) => {
  try {
    const { designNumber } = req.params;

    const result = await pool.query(
      `UPDATE sa_solution_designs SET status = 'in_review'
       WHERE design_number = $1 RETURNING *`,
      [designNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solution design not found' });
    }

    res.json({ message: 'Design submitted for review', design: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit design', message: error.message });
  }
});

/**
 * POST /api/sa/designs/:designNumber/approve
 * Approve solution design
 */
router.post('/designs/:designNumber/approve', async (req: Request, res: Response) => {
  try {
    const { designNumber } = req.params;
    const { approver_id } = req.body;

    const result = await pool.query(
      `UPDATE sa_solution_designs 
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE design_number = $2 RETURNING *`,
      [approver_id, designNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solution design not found' });
    }

    res.json({ message: 'Design approved', design: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve design', message: error.message });
  }
});

// ============================================================================
// Design Reviews
// ============================================================================

/**
 * POST /api/sa/reviews
 * Submit design review
 */
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const {
      solution_design_id, review_type, reviewer_id, overall_rating,
      strengths, concerns, recommendations, decision, conditions
    } = req.body;

    const result = await pool.query(`
      INSERT INTO sa_design_reviews (
        solution_design_id, review_type, reviewer_id, overall_rating,
        strengths, concerns, recommendations, decision, conditions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      solution_design_id, review_type, reviewer_id, overall_rating,
      strengths, concerns, recommendations, decision, conditions
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create review', message: error.message });
  }
});

/**
 * GET /api/sa/reviews/:designId
 * Get all reviews for a design
 */
router.get('/reviews/:designId', async (req: Request, res: Response) => {
  try {
    const { designId } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name 
       FROM sa_design_reviews r
       LEFT JOIN users u ON r.reviewer_id = u.id
       WHERE r.solution_design_id = $1
       ORDER BY r.review_date DESC`,
      [designId]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
  }
});

// ============================================================================
// Solution Patterns
// ============================================================================

/**
 * POST /api/sa/patterns
 * Create solution pattern
 */
router.post('/patterns', async (req: Request, res: Response) => {
  try {
    const {
      pattern_name, pattern_category, problem_description,
      solution_description, when_to_use, when_not_to_use,
      implementation_guide, benefits, drawbacks, complexity_level,
      maturity_level, tags
    } = req.body;

    const result = await pool.query(`
      INSERT INTO sa_solution_patterns (
        pattern_name, pattern_category, problem_description,
        solution_description, when_to_use, when_not_to_use,
        implementation_guide, benefits, drawbacks, complexity_level,
        maturity_level, tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      pattern_name, pattern_category, problem_description,
      solution_description, when_to_use, when_not_to_use,
      implementation_guide, benefits, drawbacks, complexity_level,
      maturity_level, tags, req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create pattern', message: error.message });
  }
});

/**
 * GET /api/sa/patterns
 * List solution patterns
 */
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const { category, complexity, maturity } = req.query;

    let query = 'SELECT * FROM sa_solution_patterns WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND pattern_category = $${paramIndex++}`;
      params.push(category);
    }

    if (complexity) {
      query += ` AND complexity_level = $${paramIndex++}`;
      params.push(complexity);
    }

    if (maturity) {
      query += ` AND maturity_level = $${paramIndex++}`;
      params.push(maturity);
    }

    query += ' ORDER BY usage_count DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch patterns', message: error.message });
  }
});

/**
 * GET /api/sa/patterns/:patternId
 * Get specific pattern
 */
router.get('/patterns/:patternId', async (req: Request, res: Response) => {
  try {
    const { patternId } = req.params;

    const result = await pool.query(
      'SELECT * FROM sa_solution_patterns WHERE id = $1',
      [patternId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pattern not found' });
    }

    // Increment usage count
    await pool.query(
      'UPDATE sa_solution_patterns SET usage_count = usage_count + 1 WHERE id = $1',
      [patternId]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch pattern', message: error.message });
  }
});

/**
 * GET /api/sa/dashboard
 * Solution Architect dashboard metrics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM sa_dashboard');
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard', message: error.message });
  }
});

export default router;
