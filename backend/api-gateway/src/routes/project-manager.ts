/**
 * Project Manager API Routes
 * Manages architecture projects, milestones, and dependencies
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dharma_admin:dharma_secure_2024@localhost:5432/iac_dharma'
});

// ============================================================================
// Architecture Projects
// ============================================================================

/**
 * POST /api/pm/projects
 * Create architecture project
 */
router.post('/projects', async (req: Request, res: Response) => {
  try {
    const {
      project_name, project_type, business_objective, success_metrics,
      stakeholders, solution_design_id, start_date, planned_end_date,
      total_budget, team_composition
    } = req.body;

    const result = await pool.query(`
      INSERT INTO pm_architecture_projects (
        project_code, project_name, project_type, business_objective,
        success_metrics, stakeholders, solution_design_id, start_date,
        planned_end_date, total_budget, team_composition,
        current_phase, project_manager_id, created_by
      ) VALUES (
        CONCAT('PROJ-', LPAD(CAST(COALESCE((
          SELECT MAX(CAST(SUBSTRING(project_code FROM 6) AS INTEGER))
          FROM pm_architecture_projects
        ), 0) + 1 AS TEXT), 5, '0')),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'planning', $11, $12
      )
      RETURNING *
    `, [
      project_name, project_type, business_objective, success_metrics,
      stakeholders, solution_design_id, start_date, planned_end_date,
      total_budget, team_composition,
      req.body.project_manager_id || req.body.user_id || '00000000-0000-0000-0000-000000000000',
      req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create project', message: error.message });
  }
});

/**
 * GET /api/pm/projects
 * List architecture projects
 */
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const { status, health_status, pm_id } = req.query;

    let query = 'SELECT * FROM pm_architecture_projects WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (health_status) {
      query += ` AND health_status = $${paramIndex++}`;
      params.push(health_status);
    }

    if (pm_id) {
      query += ` AND project_manager_id = $${paramIndex++}`;
      params.push(pm_id);
    }

    query += ' ORDER BY start_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch projects', message: error.message });
  }
});

/**
 * GET /api/pm/projects/:projectCode
 * Get specific project
 */
router.get('/projects/:projectCode', async (req: Request, res: Response) => {
  try {
    const { projectCode } = req.params;

    const projectResult = await pool.query(
      'SELECT * FROM pm_architecture_projects WHERE project_code = $1',
      [projectCode]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get milestones
    const milestonesResult = await pool.query(
      'SELECT * FROM pm_architecture_milestones WHERE project_id = $1 ORDER BY planned_date',
      [projectResult.rows[0].id]
    );

    // Get dependencies
    const dependenciesResult = await pool.query(
      'SELECT * FROM pm_architecture_dependencies WHERE project_id = $1 ORDER BY required_by_date',
      [projectResult.rows[0].id]
    );

    res.json({
      ...projectResult.rows[0],
      milestones: milestonesResult.rows,
      dependencies: dependenciesResult.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch project', message: error.message });
  }
});

/**
 * PUT /api/pm/projects/:projectCode/status
 * Update project status
 */
router.put('/projects/:projectCode/status', async (req: Request, res: Response) => {
  try {
    const { projectCode } = req.params;
    const { status, health_status, current_phase } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (health_status) {
      updates.push(`health_status = $${paramIndex++}`);
      values.push(health_status);
    }

    if (current_phase) {
      updates.push(`current_phase = $${paramIndex++}`);
      values.push(current_phase);
    }

    values.push(projectCode);

    const result = await pool.query(
      `UPDATE pm_architecture_projects SET ${updates.join(', ')} 
       WHERE project_code = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update project', message: error.message });
  }
});

// ============================================================================
// Milestones
// ============================================================================

/**
 * POST /api/pm/milestones
 * Create project milestone
 */
router.post('/milestones', async (req: Request, res: Response) => {
  try {
    const {
      project_id, milestone_name, milestone_type, description,
      success_criteria, deliverables, planned_date
    } = req.body;

    const result = await pool.query(`
      INSERT INTO pm_architecture_milestones (
        project_id, milestone_name, milestone_type, description,
        success_criteria, deliverables, planned_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      project_id, milestone_name, milestone_type, description,
      success_criteria, deliverables, planned_date
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create milestone', message: error.message });
  }
});

/**
 * PUT /api/pm/milestones/:milestoneId/complete
 * Mark milestone as completed
 */
router.put('/milestones/:milestoneId/complete', async (req: Request, res: Response) => {
  try {
    const { milestoneId } = req.params;
    const { approved_by, lessons_learned } = req.body;

    const result = await pool.query(
      `UPDATE pm_architecture_milestones 
       SET status = 'completed', actual_date = CURRENT_DATE,
           completion_percentage = 100, approved_by = $1,
           approved_at = CURRENT_TIMESTAMP, lessons_learned = $2
       WHERE id = $3 RETURNING *`,
      [approved_by, lessons_learned, milestoneId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json({ message: 'Milestone completed', milestone: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to complete milestone', message: error.message });
  }
});

/**
 * GET /api/pm/milestones/upcoming
 * Get upcoming milestones across all projects
 */
router.get('/milestones/upcoming', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT m.*, p.project_name, p.project_code
      FROM pm_architecture_milestones m
      JOIN pm_architecture_projects p ON m.project_id = p.id
      WHERE m.status IN ('planned', 'in_progress')
        AND m.planned_date <= CURRENT_DATE + INTERVAL '${days} days'
      ORDER BY m.planned_date
    `);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch upcoming milestones', message: error.message });
  }
});

// ============================================================================
// Dependencies
// ============================================================================

/**
 * POST /api/pm/dependencies
 * Create project dependency
 */
router.post('/dependencies', async (req: Request, res: Response) => {
  try {
    const {
      project_id, dependency_type, description, dependent_on,
      contact_person, contact_email, required_by_date,
      expected_delivery_date, criticality, mitigation_plan
    } = req.body;

    const result = await pool.query(`
      INSERT INTO pm_architecture_dependencies (
        project_id, dependency_type, description, dependent_on,
        contact_person, contact_email, required_by_date,
        expected_delivery_date, criticality, mitigation_plan, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      project_id, dependency_type, description, dependent_on,
      contact_person, contact_email, required_by_date,
      expected_delivery_date, criticality, mitigation_plan,
      req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create dependency', message: error.message });
  }
});

/**
 * GET /api/pm/dependencies/blocked
 * Get all blocked dependencies
 */
router.get('/dependencies/blocked', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT d.*, p.project_name, p.project_code
      FROM pm_architecture_dependencies d
      JOIN pm_architecture_projects p ON d.project_id = p.id
      WHERE d.status = 'blocked'
      ORDER BY d.criticality DESC, d.required_by_date
    `);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch blocked dependencies', message: error.message });
  }
});

/**
 * PUT /api/pm/dependencies/:depId/fulfill
 * Mark dependency as fulfilled
 */
router.put('/dependencies/:depId/fulfill', async (req: Request, res: Response) => {
  try {
    const { depId } = req.params;
    const { resolution_notes } = req.body;

    const result = await pool.query(
      `UPDATE pm_architecture_dependencies 
       SET status = 'fulfilled', actual_delivery_date = CURRENT_DATE,
           resolution_notes = $1
       WHERE id = $2 RETURNING *`,
      [resolution_notes, depId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependency not found' });
    }

    res.json({ message: 'Dependency fulfilled', dependency: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fulfill dependency', message: error.message });
  }
});

/**
 * GET /api/pm/dashboard
 * Project Manager dashboard metrics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM pm_dashboard');
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard', message: error.message });
  }
});

/**
 * GET /api/pm/portfolio-health
 * Get overall portfolio health
 */
router.get('/portfolio-health', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status IN ('design', 'development', 'testing') THEN 1 END) as active_projects,
        COUNT(CASE WHEN health_status = 'green' THEN 1 END) as green_projects,
        COUNT(CASE WHEN health_status = 'yellow' THEN 1 END) as yellow_projects,
        COUNT(CASE WHEN health_status = 'red' THEN 1 END) as red_projects,
        SUM(total_budget) as total_budget,
        SUM(spent_to_date) as total_spent,
        AVG(completion_percentage) as avg_completion
      FROM pm_architecture_projects
      WHERE status NOT IN ('completed', 'cancelled')
    `);

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch portfolio health', message: error.message });
  }
});

export default router;
