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

// Get all data entities
router.get('/entities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_data_entities 
      WHERE deleted_at IS NULL 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching data entities:', error);
    res.status(500).json({ error: 'Failed to fetch data entities', details: error.message });
  }
});

// Get data entity by ID
router.get('/entities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_data_entities WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data entity not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching data entity:', error);
    res.status(500).json({ error: 'Failed to fetch data entity', details: error.message });
  }
});

// Create new data entity
router.post('/entities', async (req, res) => {
  try {
    const {
      name, description, category, domain, owner, sensitivity,
      retention_period, record_count, data_quality_score, steward, notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ea_data_entities (
        name, description, category, domain, owner, sensitivity,
        retention_period, record_count, data_quality_score, steward, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      name, description, category, domain, owner, sensitivity,
      retention_period, record_count, data_quality_score, steward, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating data entity:', error);
    res.status(500).json({ error: 'Failed to create data entity', details: error.message });
  }
});

// Get all data stores
router.get('/stores', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_data_stores 
      WHERE deleted_at IS NULL 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching data stores:', error);
    res.status(500).json({ error: 'Failed to fetch data stores', details: error.message });
  }
});

// Get data store by ID
router.get('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_data_stores WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching data store:', error);
    res.status(500).json({ error: 'Failed to fetch data store', details: error.message });
  }
});

// Create new data store
router.post('/stores', async (req, res) => {
  try {
    const {
      name, description, store_type, technology, hosting, size_gb,
      backup_frequency, owner, encryption_enabled, compliance_certifications, notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO ea_data_stores (
        name, description, store_type, technology, hosting, size_gb,
        backup_frequency, owner, encryption_enabled, compliance_certifications, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      name, description, store_type, technology, hosting, size_gb,
      backup_frequency, owner, encryption_enabled, compliance_certifications, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating data store:', error);
    res.status(500).json({ error: 'Failed to create data store', details: error.message });
  }
});

export default router;
