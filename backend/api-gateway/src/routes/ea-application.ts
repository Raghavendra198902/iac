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

// Get all applications
router.get('/applications', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_applications 
      WHERE deleted_at IS NULL 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
});

// Get application by ID
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_applications WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application', details: error.message });
  }
});

// Create new application
router.post('/applications', async (req, res) => {
  try {
    const {
      name, description, category, status, criticality, owner, vendor,
      technology_stack, hosting, users, annual_cost, health_score,
      availability, last_audit_date, compliance_frameworks, notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ea_applications (
        name, description, category, status, criticality, owner, vendor,
        technology_stack, hosting, users, annual_cost, health_score,
        availability, last_audit_date, compliance_frameworks, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      name, description, category, status, criticality, owner, vendor,
      technology_stack, hosting, users, annual_cost, health_score,
      availability, last_audit_date, compliance_frameworks, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application', details: error.message });
  }
});

// Get all integrations
router.get('/integrations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        src.name as source_app_name,
        tgt.name as target_app_name
      FROM ea_app_integrations i
      LEFT JOIN ea_applications src ON i.source_app_id = src.id
      LEFT JOIN ea_applications tgt ON i.target_app_id = tgt.id
      WHERE i.deleted_at IS NULL
      ORDER BY src.name, tgt.name
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations', details: error.message });
  }
});

// Get integration by ID
router.get('/integrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        i.*,
        src.name as source_app_name,
        tgt.name as target_app_name
      FROM ea_app_integrations i
      LEFT JOIN ea_applications src ON i.source_app_id = src.id
      LEFT JOIN ea_applications tgt ON i.target_app_id = tgt.id
      WHERE i.id = $1 AND i.deleted_at IS NULL
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ error: 'Failed to fetch integration', details: error.message });
  }
});

export default router;
