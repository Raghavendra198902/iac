import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma_admin',
  password: process.env.DB_PASSWORD || 'dharma_pass_dev'
});

// ==================== ARCHITECTURE PRINCIPLES ====================

/**
 * GET /api/ea/principles
 * Get all architecture principles
 */
router.get('/principles', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ea_principles 
       WHERE deleted_at IS NULL 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching principles:', { error });
    res.status(500).json({ error: 'Failed to fetch principles' });
  }
});

/**
 * GET /api/ea/principles/:id
 * Get a single principle by ID
 */
router.get('/principles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM ea_principles WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Principle not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching principle:', { error });
    res.status(500).json({ error: 'Failed to fetch principle' });
  }
});

/**
 * POST /api/ea/principles
 * Create a new architecture principle
 */
router.post('/principles', async (req: Request, res: Response) => {
  try {
    const { name, description, category, status, impact, compliance, created_by } = req.body;
    
    if (!name || !description || !category || !impact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await pool.query(
      `INSERT INTO ea_principles (name, description, category, status, impact, compliance, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, category, status || 'active', impact, compliance || 90, created_by || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating principle:', { error });
    res.status(500).json({ error: 'Failed to create principle' });
  }
});

/**
 * PUT /api/ea/principles/:id
 * Update an architecture principle
 */
router.put('/principles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, status, impact, compliance } = req.body;
    
    const result = await pool.query(
      `UPDATE ea_principles 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           status = COALESCE($4, status),
           impact = COALESCE($5, impact),
           compliance = COALESCE($6, compliance)
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [name, description, category, status, impact, compliance, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Principle not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating principle:', { error });
    res.status(500).json({ error: 'Failed to update principle' });
  }
});

/**
 * DELETE /api/ea/principles/:id
 * Soft delete a principle
 */
router.delete('/principles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE ea_principles SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Principle not found' });
    }
    
    res.json({ message: 'Principle deleted successfully' });
  } catch (error) {
    logger.error('Error deleting principle:', { error });
    res.status(500).json({ error: 'Failed to delete principle' });
  }
});

// ==================== STRATEGIC GOALS ====================

/**
 * GET /api/ea/goals
 * Get all strategic goals
 */
router.get('/goals', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ea_strategic_goals 
       WHERE deleted_at IS NULL 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching goals:', { error });
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

/**
 * POST /api/ea/goals
 * Create a new strategic goal
 */
router.post('/goals', async (req: Request, res: Response) => {
  try {
    const { title, description, progress, timeline, initiatives, budget, status, created_by } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO ea_strategic_goals (title, description, progress, timeline, initiatives, budget, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, progress || 0, timeline, initiatives || 0, budget, status || 'planning', created_by || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating goal:', { error });
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

/**
 * PUT /api/ea/goals/:id
 * Update a strategic goal
 */
router.put('/goals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, progress, timeline, initiatives, budget, status } = req.body;
    
    const result = await pool.query(
      `UPDATE ea_strategic_goals 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           progress = COALESCE($3, progress),
           timeline = COALESCE($4, timeline),
           initiatives = COALESCE($5, initiatives),
           budget = COALESCE($6, budget),
           status = COALESCE($7, status)
       WHERE id = $8 AND deleted_at IS NULL
       RETURNING *`,
      [title, description, progress, timeline, initiatives, budget, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating goal:', { error });
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

/**
 * DELETE /api/ea/goals/:id
 * Soft delete a goal
 */
router.delete('/goals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE ea_strategic_goals SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    logger.error('Error deleting goal:', { error });
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// ==================== GOVERNANCE COMMITTEES ====================

/**
 * GET /api/ea/committees
 * Get all governance committees with details
 */
router.get('/committees', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.*,
        (SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'role', m.role, 'status', m.status))
         FROM ea_committee_members m WHERE m.committee_id = c.id) as members_list,
        (SELECT json_agg(sub.data ORDER BY sub.decision_date DESC)
         FROM (SELECT json_build_object('id', d.id, 'title', d.title, 'description', d.description, 'status', d.status, 'decision_date', d.decision_date) as data, d.decision_date
               FROM ea_committee_decisions d WHERE d.committee_id = c.id ORDER BY d.decision_date DESC LIMIT 5) sub) as recent_decisions,
        (SELECT json_agg(sub.data ORDER BY sub.meeting_date ASC)
         FROM (SELECT json_build_object('id', mt.id, 'title', mt.title, 'meeting_date', mt.meeting_date, 'status', mt.status) as data, mt.meeting_date
               FROM ea_committee_meetings mt WHERE mt.committee_id = c.id AND mt.meeting_date > CURRENT_TIMESTAMP ORDER BY mt.meeting_date ASC LIMIT 5) sub) as upcoming_meetings
       FROM ea_governance_committees c
       WHERE c.deleted_at IS NULL 
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching committees:', { error });
    res.status(500).json({ error: 'Failed to fetch committees' });
  }
});

/**
 * GET /api/ea/committees/:id
 * Get a single committee with full details
 */
router.get('/committees/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        c.*,
        (SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'role', m.role, 'status', m.status))
         FROM ea_committee_members m WHERE m.committee_id = c.id) as members_list,
        (SELECT json_agg(sub.data ORDER BY sub.decision_date DESC)
         FROM (SELECT json_build_object('id', d.id, 'title', d.title, 'description', d.description, 'status', d.status, 'decision_date', d.decision_date) as data, d.decision_date
               FROM ea_committee_decisions d WHERE d.committee_id = c.id ORDER BY d.decision_date DESC) sub) as recent_decisions,
        (SELECT json_agg(sub.data ORDER BY sub.meeting_date DESC)
         FROM (SELECT json_build_object('id', mt.id, 'title', mt.title, 'meeting_date', mt.meeting_date, 'status', mt.status) as data, mt.meeting_date
               FROM ea_committee_meetings mt WHERE mt.committee_id = c.id ORDER BY mt.meeting_date DESC) sub) as all_meetings
       FROM ea_governance_committees c
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Committee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching committee:', { error });
    res.status(500).json({ error: 'Failed to fetch committee' });
  }
});

/**
 * POST /api/ea/committees
 * Create a new governance committee
 */
router.post('/committees', async (req: Request, res: Response) => {
  try {
    const { name, description, members, frequency, last_meeting, chair_name, created_by } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO ea_governance_committees (name, description, members, frequency, last_meeting, chair_name, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, members || 0, frequency, last_meeting, chair_name, created_by || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating committee:', { error });
    res.status(500).json({ error: 'Failed to create committee' });
  }
});

/**
 * PUT /api/ea/committees/:id
 * Update a governance committee
 */
router.put('/committees/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, members, frequency, last_meeting, chair_name } = req.body;
    
    const result = await pool.query(
      `UPDATE ea_governance_committees 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           members = COALESCE($3, members),
           frequency = COALESCE($4, frequency),
           last_meeting = COALESCE($5, last_meeting),
           chair_name = COALESCE($6, chair_name)
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [name, description, members, frequency, last_meeting, chair_name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Committee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating committee:', { error });
    res.status(500).json({ error: 'Failed to update committee' });
  }
});

/**
 * DELETE /api/ea/committees/:id
 * Soft delete a committee
 */
router.delete('/committees/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE ea_governance_committees SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Committee not found' });
    }
    
    res.json({ message: 'Committee deleted successfully' });
  } catch (error) {
    logger.error('Error deleting committee:', { error });
    res.status(500).json({ error: 'Failed to delete committee' });
  }
});

export default router;
