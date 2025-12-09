/**
 * Architecture Decision Records (ADR) API
 * Manages architectural decisions and their lifecycle
 */

import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createLogger } from '../../../../packages/logger/src/index';

const router = Router();
const logger = createLogger({ serviceName: 'api-gateway-architecture-decisions' });

interface ADRCreateRequest {
  title: string;
  context: string;
  problem_statement: string;
  decision_drivers: string[];
  constraints?: string[];
  assumptions?: string[];
  considered_options: Array<{
    option: string;
    pros: string[];
    cons: string[];
  }>;
  decision_outcome: string;
  decision_rationale: string;
  positive_consequences?: string[];
  negative_consequences?: string[];
  risks?: string[];
  deciders: string[];
  stakeholders?: string[];
  related_adrs?: number[];
  implementation_link?: string;
  documentation_link?: string;
  architecture_domain: 'business' | 'application' | 'data' | 'technology' | 'security' | 'integration';
  technology_area?: string;
  tags?: Record<string, string>;
}

interface ADRUpdateRequest extends Partial<ADRCreateRequest> {
  status?: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  supersedes_adr_id?: string;
}

/**
 * Create new ADR
 * POST /api/adr
 */
router.post('/api/adr', 
  authenticate, 
  authorize(['architect', 'lead', 'admin']), 
  async (req: Request, res: Response) => {
    try {
      const adrData: ADRCreateRequest = req.body;
      
      // Get next ADR number
      const nextNumber = await getNextADRNumber();
      
      // Create ADR
      const result = await req.db.query(
        `INSERT INTO architecture_decisions (
          adr_number,
          title,
          status,
          context,
          problem_statement,
          decision_drivers,
          constraints,
          assumptions,
          considered_options,
          decision_outcome,
          decision_rationale,
          positive_consequences,
          negative_consequences,
          risks,
          deciders,
          stakeholders,
          related_adrs,
          implementation_link,
          documentation_link,
          architecture_domain,
          technology_area,
          tags,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *`,
        [
          nextNumber,
          adrData.title,
          'proposed',
          adrData.context,
          adrData.problem_statement,
          JSON.stringify(adrData.decision_drivers),
          JSON.stringify(adrData.constraints || []),
          JSON.stringify(adrData.assumptions || []),
          JSON.stringify(adrData.considered_options),
          adrData.decision_outcome,
          adrData.decision_rationale,
          JSON.stringify(adrData.positive_consequences || []),
          JSON.stringify(adrData.negative_consequences || []),
          JSON.stringify(adrData.risks || []),
          JSON.stringify(adrData.deciders),
          JSON.stringify(adrData.stakeholders || []),
          JSON.stringify(adrData.related_adrs || []),
          adrData.implementation_link,
          adrData.documentation_link,
          adrData.architecture_domain,
          adrData.technology_area,
          JSON.stringify(adrData.tags || {}),
          req.user.id
        ]
      );
      
      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error creating ADR:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create ADR'
      });
    }
});

/**
 * Get all ADRs with filtering
 * GET /api/adr
 */
router.get('/api/adr', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, domain, technology_area, search, page = 1, limit = 20 } = req.query;
    
    let query = 'SELECT * FROM architecture_decisions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (domain) {
      query += ` AND architecture_domain = $${paramIndex}`;
      params.push(domain);
      paramIndex++;
    }
    
    if (technology_area) {
      query += ` AND technology_area = $${paramIndex}`;
      params.push(technology_area);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR context ILIKE $${paramIndex} OR decision_outcome ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY adr_number DESC';
    
    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);
    
    const result = await req.db.query(query, params);
    
    // Get total count
    const countQuery = query.split('ORDER BY')[0].replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await req.db.query(countQuery, params.slice(0, -2));
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    logger.error('Error fetching ADRs:', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ADRs'
    });
  }
});

/**
 * Get ADR by ID
 * GET /api/adr/:id
 */
router.get('/api/adr/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM architecture_decisions WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ADR not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching ADR:', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ADR'
    });
  }
});

/**
 * Get ADR by number
 * GET /api/adr/number/:number
 */
router.get('/api/adr/number/:number', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM architecture_decisions WHERE adr_number = $1',
      [req.params.number]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ADR not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching ADR:', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ADR'
    });
  }
});

/**
 * Update ADR
 * PUT /api/adr/:id
 */
router.put('/api/adr/:id', 
  authenticate, 
  authorize(['architect', 'lead', 'admin']), 
  async (req: Request, res: Response) => {
    try {
      const updates: ADRUpdateRequest = req.body;
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      // Build dynamic update query
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            updateFields.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
          } else if (Array.isArray(value)) {
            updateFields.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = $${paramIndex}`);
            params.push(value);
          }
          paramIndex++;
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }
      
      updateFields.push(`updated_by = $${paramIndex}`);
      params.push(req.user.id);
      paramIndex++;
      
      updateFields.push(`updated_at = NOW()`);
      
      params.push(req.params.id);
      
      const result = await req.db.query(
        `UPDATE architecture_decisions 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex}
         RETURNING *`,
        params
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'ADR not found'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error updating ADR:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to update ADR'
      });
    }
});

/**
 * Accept ADR (change status to accepted)
 * POST /api/adr/:id/accept
 */
router.post('/api/adr/:id/accept', 
  authenticate, 
  authorize(['architect', 'lead', 'admin']), 
  async (req: Request, res: Response) => {
    try {
      const result = await req.db.query(
        `UPDATE architecture_decisions 
         SET status = 'accepted', decision_date = NOW(), updated_by = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [req.user.id, req.params.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'ADR not found'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error accepting ADR:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to accept ADR'
      });
    }
});

/**
 * Deprecate ADR
 * POST /api/adr/:id/deprecate
 */
router.post('/api/adr/:id/deprecate', 
  authenticate, 
  authorize(['architect', 'lead', 'admin']), 
  async (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      
      const result = await req.db.query(
        `UPDATE architecture_decisions 
         SET status = 'deprecated', updated_by = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [req.user.id, req.params.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'ADR not found'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0],
        message: `ADR deprecated${reason ? `: ${reason}` : ''}`
      });
    } catch (error) {
      logger.error('Error deprecating ADR:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to deprecate ADR'
      });
    }
});

/**
 * Supersede ADR with new one
 * POST /api/adr/:id/supersede
 */
router.post('/api/adr/:id/supersede', 
  authenticate, 
  authorize(['architect', 'lead', 'admin']), 
  async (req: Request, res: Response) => {
    try {
      const { new_adr_id } = req.body;
      
      if (!new_adr_id) {
        return res.status(400).json({
          success: false,
          error: 'new_adr_id is required'
        });
      }
      
      // Update old ADR
      const oldResult = await req.db.query(
        `UPDATE architecture_decisions 
         SET status = 'superseded', updated_by = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [req.user.id, req.params.id]
      );
      
      // Update new ADR to reference old one
      await req.db.query(
        `UPDATE architecture_decisions 
         SET supersedes_adr_id = $1, updated_by = $2, updated_at = NOW()
         WHERE id = $3`,
        [req.params.id, req.user.id, new_adr_id]
      );
      
      res.json({
        success: true,
        data: oldResult.rows[0],
        message: 'ADR superseded successfully'
      });
    } catch (error) {
      logger.error('Error superseding ADR:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to supersede ADR'
      });
    }
});

/**
 * Link ADR to blueprint
 * POST /api/blueprints/:blueprintId/adr/:adrId
 */
router.post('/api/blueprints/:blueprintId/adr/:adrId', 
  authenticate, 
  authorize(['architect', 'developer', 'lead']), 
  async (req: Request, res: Response) => {
    try {
      const { applies_to_component, implementation_notes, compliance_status } = req.body;
      
      await req.db.query(
        `INSERT INTO blueprint_architecture_decisions (
          blueprint_id, adr_id, applies_to_component, implementation_notes, compliance_status
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (blueprint_id, adr_id) DO UPDATE
        SET applies_to_component = $3, implementation_notes = $4, compliance_status = $5`,
        [
          req.params.blueprintId,
          req.params.adrId,
          applies_to_component,
          implementation_notes,
          compliance_status || 'compliant'
        ]
      );
      
      res.json({
        success: true,
        message: 'ADR linked to blueprint successfully'
      });
    } catch (error) {
      logger.error('Error linking ADR to blueprint:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to link ADR to blueprint'
      });
    }
});

/**
 * Get ADRs for a blueprint
 * GET /api/blueprints/:blueprintId/adr
 */
router.get('/api/blueprints/:blueprintId/adr', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await req.db.query(
      `SELECT ad.*, bad.applies_to_component, bad.implementation_notes, bad.compliance_status
       FROM architecture_decisions ad
       JOIN blueprint_architecture_decisions bad ON ad.id = bad.adr_id
       WHERE bad.blueprint_id = $1
       ORDER BY ad.adr_number DESC`,
      [req.params.blueprintId]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching blueprint ADRs:', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blueprint ADRs'
    });
  }
});

/**
 * Get ADR statistics
 * GET /api/adr/stats
 */
router.get('/api/adr/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await req.db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'proposed') as proposed,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'deprecated') as deprecated,
        COUNT(*) FILTER (WHERE status = 'superseded') as superseded,
        COUNT(*) FILTER (WHERE architecture_domain = 'business') as business,
        COUNT(*) FILTER (WHERE architecture_domain = 'application') as application,
        COUNT(*) FILTER (WHERE architecture_domain = 'data') as data,
        COUNT(*) FILTER (WHERE architecture_domain = 'technology') as technology,
        COUNT(*) FILTER (WHERE architecture_domain = 'security') as security,
        COUNT(*) FILTER (WHERE architecture_domain = 'integration') as integration
      FROM architecture_decisions
    `);
    
    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching ADR stats:', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ADR statistics'
    });
  }
});

// Helper function
async function getNextADRNumber(): Promise<number> {
  const result = await global.db.query(
    'SELECT COALESCE(MAX(adr_number), 0) + 1 as next_number FROM architecture_decisions'
  );
  return result.rows[0].next_number;
}

export default router;
