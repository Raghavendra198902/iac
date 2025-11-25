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

// Get all security controls
router.get('/controls', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_security_controls 
      WHERE deleted_at IS NULL 
      ORDER BY priority DESC, name
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching security controls:', error);
    res.status(500).json({ error: 'Failed to fetch security controls', details: error.message });
  }
});

// Get security control by ID
router.get('/controls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_security_controls WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Security control not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching security control:', error);
    res.status(500).json({ error: 'Failed to fetch security control', details: error.message });
  }
});

// Create new security control
router.post('/controls', async (req, res) => {
  try {
    const {
      name, description, control_type, category, framework, control_id,
      implementation_status, effectiveness_score, owner, priority,
      last_review_date, next_review_date, notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ea_security_controls (
        name, description, control_type, category, framework, control_id,
        implementation_status, effectiveness_score, owner, priority,
        last_review_date, next_review_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      name, description, control_type, category, framework, control_id,
      implementation_status, effectiveness_score, owner, priority,
      last_review_date, next_review_date, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating security control:', error);
    res.status(500).json({ error: 'Failed to create security control', details: error.message });
  }
});

// Get all security threats
router.get('/threats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_security_threats 
      WHERE deleted_at IS NULL 
      ORDER BY risk_score DESC, severity DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching security threats:', error);
    res.status(500).json({ error: 'Failed to fetch security threats', details: error.message });
  }
});

// Get security threat by ID
router.get('/threats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_security_threats WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Security threat not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching security threat:', error);
    res.status(500).json({ error: 'Failed to fetch security threat', details: error.message });
  }
});

// Create new security threat
router.post('/threats', async (req, res) => {
  try {
    const {
      name, description, threat_category, severity, likelihood, impact,
      risk_score, mitigation_controls, residual_risk, owner, last_assessment, notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ea_security_threats (
        name, description, threat_category, severity, likelihood, impact,
        risk_score, mitigation_controls, residual_risk, owner, last_assessment, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      name, description, threat_category, severity, likelihood, impact,
      risk_score, mitigation_controls, residual_risk, owner, last_assessment, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating security threat:', error);
    res.status(500).json({ error: 'Failed to create security threat', details: error.message });
  }
});

export default router;
