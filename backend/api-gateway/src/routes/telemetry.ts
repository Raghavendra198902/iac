/**
 * Telemetry Routes
 * Receives telemetry data from CMDB agents
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { updateAgentFromTelemetry } from './agents';

const router = Router();

/**
 * POST /api/telemetry
 * Receive telemetry batch from agent
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { agentName, organizationId, timestamp, events } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Events array is required' 
      });
    }

    logger.info('Received telemetry', {
      agentName,
      organizationId,
      timestamp,
      eventCount: events.length,
      eventTypes: events.map(e => e.type),
    });

    // Update agent registry
    updateAgentFromTelemetry(req.body);

    // TODO: Store telemetry in database/time-series DB
    // For now, just log and acknowledge
    
    res.json({ 
      success: true, 
      message: 'Telemetry received',
      eventsProcessed: events.length 
    });
  } catch (error: any) {
    logger.error('Error processing telemetry', { error: error.message });
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to process telemetry' 
    });
  }
});

/**
 * GET /api/telemetry/health
 * Health check for telemetry endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', endpoint: 'telemetry' });
});

export default router;
