import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma_admin',
  password: process.env.DB_PASSWORD || 'dharma_pass_dev',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Get all initiatives
router.get('/initiatives', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_roadmap_initiatives 
      WHERE deleted_at IS NULL 
      ORDER BY priority DESC, start_date
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching initiatives:', { error });
    res.status(500).json({ error: 'Failed to fetch initiatives', details: error.message });
  }
});

// Get initiative by ID
router.get('/initiatives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_roadmap_initiatives WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching initiative:', { error });
    res.status(500).json({ error: 'Failed to fetch initiative', details: error.message });
  }
});

// Get all milestones
router.get('/milestones', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        i.name as initiative_name
      FROM ea_roadmap_milestones m
      LEFT JOIN ea_roadmap_initiatives i ON m.initiative_id = i.id
      WHERE m.deleted_at IS NULL
      ORDER BY m.due_date
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching milestones:', { error });
    res.status(500).json({ error: 'Failed to fetch milestones', details: error.message });
  }
});

// Get milestone by ID
router.get('/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.*,
        i.name as initiative_name
      FROM ea_roadmap_milestones m
      LEFT JOIN ea_roadmap_initiatives i ON m.initiative_id = i.id
      WHERE m.id = $1 AND m.deleted_at IS NULL
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching milestone:', { error });
    res.status(500).json({ error: 'Failed to fetch milestone', details: error.message });
  }
});

export default router;
