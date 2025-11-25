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

// Get all stakeholders
router.get('/stakeholders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_stakeholders 
      WHERE deleted_at IS NULL 
      ORDER BY influence_level DESC, name
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching stakeholders:', error);
    res.status(500).json({ error: 'Failed to fetch stakeholders', details: error.message });
  }
});

// Get stakeholder by ID
router.get('/stakeholders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_stakeholders WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stakeholder not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching stakeholder:', error);
    res.status(500).json({ error: 'Failed to fetch stakeholder', details: error.message });
  }
});

// Get all engagements
router.get('/engagements', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        s.name as stakeholder_name
      FROM ea_stakeholder_engagements e
      LEFT JOIN ea_stakeholders s ON e.stakeholder_id = s.id
      WHERE e.deleted_at IS NULL
      ORDER BY e.engagement_date DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching engagements:', error);
    res.status(500).json({ error: 'Failed to fetch engagements', details: error.message });
  }
});

// Get engagement by ID
router.get('/engagements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        e.*,
        s.name as stakeholder_name
      FROM ea_stakeholder_engagements e
      LEFT JOIN ea_stakeholders s ON e.stakeholder_id = s.id
      WHERE e.id = $1 AND e.deleted_at IS NULL
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Engagement not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching engagement:', error);
    res.status(500).json({ error: 'Failed to fetch engagement', details: error.message });
  }
});

export default router;
