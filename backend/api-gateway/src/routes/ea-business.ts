import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma_admin',
  password: process.env.DB_PASSWORD || 'dharma_pass_dev'
});

/**
 * GET /api/business/capabilities
 * Get all business capabilities
 */
router.get('/capabilities', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ea_business_capabilities 
       WHERE deleted_at IS NULL 
       ORDER BY category, name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching capabilities:', error);
    res.status(500).json({ error: 'Failed to fetch capabilities' });
  }
});

/**
 * GET /api/business/capabilities/:id
 * Get a single capability with details
 */
router.get('/capabilities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [capability, apps, processes] = await Promise.all([
      pool.query(
        'SELECT * FROM ea_business_capabilities WHERE id = $1 AND deleted_at IS NULL',
        [id]
      ),
      pool.query(
        'SELECT * FROM ea_capability_applications WHERE capability_id = $1',
        [id]
      ),
      pool.query(
        'SELECT * FROM ea_business_processes WHERE capability_id = $1 AND deleted_at IS NULL',
        [id]
      )
    ]);

    if (capability.rows.length === 0) {
      return res.status(404).json({ error: 'Capability not found' });
    }

    res.json({
      ...capability.rows[0],
      applications: apps.rows,
      processes: processes.rows
    });
  } catch (error) {
    console.error('Error fetching capability:', error);
    res.status(500).json({ error: 'Failed to fetch capability' });
  }
});

/**
 * POST /api/business/capabilities
 * Create a new capability
 */
router.post('/capabilities', async (req: Request, res: Response) => {
  try {
    const { name, description, category, level, parent_id, maturity_level, criticality, investment_priority } = req.body;
    
    const result = await pool.query(
      `INSERT INTO ea_business_capabilities 
       (name, description, category, level, parent_id, maturity_level, criticality, investment_priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, category, level || 1, parent_id || null, maturity_level, criticality, investment_priority]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating capability:', error);
    res.status(500).json({ error: 'Failed to create capability' });
  }
});

/**
 * GET /api/business/processes
 * Get all business processes
 */
router.get('/processes', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.*,
        c.name as capability_name
       FROM ea_business_processes p
       LEFT JOIN ea_business_capabilities c ON p.capability_id = c.id
       WHERE p.deleted_at IS NULL 
       ORDER BY p.efficiency_score DESC, p.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching processes:', error);
    res.status(500).json({ error: 'Failed to fetch processes' });
  }
});

/**
 * GET /api/business/processes/:id
 * Get a single process with metrics
 */
router.get('/processes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [process, metrics] = await Promise.all([
      pool.query(
        `SELECT p.*, c.name as capability_name
         FROM ea_business_processes p
         LEFT JOIN ea_business_capabilities c ON p.capability_id = c.id
         WHERE p.id = $1 AND p.deleted_at IS NULL`,
        [id]
      ),
      pool.query(
        `SELECT * FROM ea_process_metrics 
         WHERE process_id = $1 
         ORDER BY measurement_date DESC 
         LIMIT 10`,
        [id]
      )
    ]);

    if (process.rows.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    res.json({
      ...process.rows[0],
      metrics: metrics.rows
    });
  } catch (error) {
    console.error('Error fetching process:', error);
    res.status(500).json({ error: 'Failed to fetch process' });
  }
});

/**
 * POST /api/business/processes
 * Create a new process
 */
router.post('/processes', async (req: Request, res: Response) => {
  try {
    const {
      name, description, capability_id, process_type, owner,
      automation_level, efficiency_score, complexity, frequency,
      cycle_time, cost_per_execution
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO ea_business_processes 
       (name, description, capability_id, process_type, owner, automation_level, 
        efficiency_score, complexity, frequency, cycle_time, cost_per_execution)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, description, capability_id, process_type, owner, automation_level || 0,
       efficiency_score || 50, complexity, frequency, cycle_time, cost_per_execution]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating process:', error);
    res.status(500).json({ error: 'Failed to create process' });
  }
});

/**
 * GET /api/business/services
 * Get all business services
 */
router.get('/services', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.*,
        c.name as capability_name
       FROM ea_business_services s
       LEFT JOIN ea_business_capabilities c ON s.capability_id = c.id
       WHERE s.deleted_at IS NULL 
       ORDER BY s.service_type, s.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

/**
 * GET /api/business/services/:id
 * Get a single service with details
 */
router.get('/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, c.name as capability_name
       FROM ea_business_services s
       LEFT JOIN ea_business_capabilities c ON s.capability_id = c.id
       WHERE s.id = $1 AND s.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

/**
 * POST /api/business/services
 * Create a new service
 */
router.post('/services', async (req: Request, res: Response) => {
  try {
    const {
      name, description, service_type, capability_id, owner, consumers,
      sla_target, availability, usage_volume, revenue_impact
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO ea_business_services 
       (name, description, service_type, capability_id, owner, consumers,
        sla_target, availability, usage_volume, revenue_impact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, description, service_type, capability_id, owner, consumers,
       sla_target, availability, usage_volume, revenue_impact]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

/**
 * GET /api/business/value-streams
 * Get all value streams
 */
router.get('/value-streams', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ea_value_streams 
       WHERE deleted_at IS NULL 
       ORDER BY category, name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching value streams:', error);
    res.status(500).json({ error: 'Failed to fetch value streams' });
  }
});

/**
 * GET /api/business/value-streams/:id
 * Get a single value stream with details
 */
router.get('/value-streams/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_value_streams WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Value stream not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching value stream:', error);
    res.status(500).json({ error: 'Failed to fetch value stream' });
  }
});

/**
 * POST /api/business/value-streams
 * Create a new value stream
 */
router.post('/value-streams', async (req: Request, res: Response) => {
  try {
    const {
      name, description, category, stages, lead_time, throughput,
      quality_score, customer_satisfaction, annual_value
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO ea_value_streams 
       (name, description, category, stages, lead_time, throughput,
        quality_score, customer_satisfaction, annual_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, description, category, stages, lead_time, throughput,
       quality_score || 75, customer_satisfaction || 80, annual_value]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating value stream:', error);
    res.status(500).json({ error: 'Failed to create value stream' });
  }
});

export default router;
