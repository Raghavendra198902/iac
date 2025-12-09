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

// Get all metrics
router.get('/metrics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_analytics_metrics 
      WHERE deleted_at IS NULL 
      ORDER BY category, metric_name
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching metrics:', { error });
    res.status(500).json({ error: 'Failed to fetch metrics', details: error.message });
  }
});

// Get metric by ID
router.get('/metrics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_analytics_metrics WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching metric:', { error });
    res.status(500).json({ error: 'Failed to fetch metric', details: error.message });
  }
});

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_analytics_reports 
      WHERE deleted_at IS NULL 
      ORDER BY generated_date DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching reports:', { error });
    res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
  }
});

// Get report by ID
router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_analytics_reports WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching report:', { error });
    res.status(500).json({ error: 'Failed to fetch report', details: error.message });
  }
});

export default router;
