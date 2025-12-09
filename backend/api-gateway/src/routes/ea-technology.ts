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

// Get all technologies
router.get('/technologies', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_technologies 
      WHERE deleted_at IS NULL 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching technologies:', { error });
    res.status(500).json({ error: 'Failed to fetch technologies', details: error.message });
  }
});

// Get technology by ID
router.get('/technologies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_technologies WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technology not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching technology:', { error });
    res.status(500).json({ error: 'Failed to fetch technology', details: error.message });
  }
});

// Create new technology
router.post('/technologies', async (req, res) => {
  try {
    const {
      name, description, category, vendor, version, lifecycle_phase,
      usage_level, license_type, annual_cost, application_count,
      risk_level, eol_date, notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ea_technologies (
        name, description, category, vendor, version, lifecycle_phase,
        usage_level, license_type, annual_cost, application_count,
        risk_level, eol_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      name, description, category, vendor, version, lifecycle_phase,
      usage_level, license_type, annual_cost, application_count,
      risk_level, eol_date, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error creating technology:', { error });
    res.status(500).json({ error: 'Failed to create technology', details: error.message });
  }
});

// Get all standards
router.get('/standards', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        t.name as technology_name
      FROM ea_tech_standards s
      LEFT JOIN ea_technologies t ON s.technology_id = t.id
      WHERE s.deleted_at IS NULL
      ORDER BY s.name
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching standards:', { error });
    res.status(500).json({ error: 'Failed to fetch standards', details: error.message });
  }
});

// Get standard by ID
router.get('/standards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        s.*,
        t.name as technology_name
      FROM ea_tech_standards s
      LEFT JOIN ea_technologies t ON s.technology_id = t.id
      WHERE s.id = $1 AND s.deleted_at IS NULL
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Standard not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching standard:', { error });
    res.status(500).json({ error: 'Failed to fetch standard', details: error.message });
  }
});

// Create new standard
router.post('/standards', async (req, res) => {
  try {
    const {
      name, description, standard_type, category, technology_id,
      compliance_required, adoption_level, effective_date, owner, notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ea_tech_standards (
        name, description, standard_type, category, technology_id,
        compliance_required, adoption_level, effective_date, owner, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name, description, standard_type, category, technology_id,
      compliance_required, adoption_level, effective_date, owner, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error creating standard:', { error });
    res.status(500).json({ error: 'Failed to create standard', details: error.message });
  }
});

export default router;
