/**
 * Enforcement Engine API Routes
 * Manages security policies, enforcement events, and quarantine operations
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { query } from '../utils/database';

const router = Router();

// WebSocket instance will be injected
let io: any = null;
export const setSocketIO = (socketIO: any) => {
  io = socketIO;
};

// Database storage for enforcement data
interface EnforcementEvent {
  id: string;
  agentName: string;
  timestamp: Date;
  type: 'policy_triggered' | 'action_executed' | 'action_failed';
  policyId: string;
  policyName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  event: any; // Original event that triggered policy
  actions: Array<{
    type: string;
    success: boolean;
    error?: string;
  }>;
  metadata?: any;
}

interface QuarantinedFile {
  id: string;
  agentName: string;
  filePath: string;
  quarantinedAt: Date;
  policyId: string;
  policyName: string;
  reason: string;
  size?: number;
  hash?: string;
  restored: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'process' | 'network' | 'usb' | 'registry' | 'filesystem' | 'general';
  conditions: any[];
  actions: any[];
  createdAt: Date;
  updatedAt: Date;
  triggeredCount: number;
}

const enforcementEvents = new Map<string, EnforcementEvent>();
const quarantinedFiles = new Map<string, QuarantinedFile>();
const policies = new Map<string, SecurityPolicy>();

// Initialize with default policy summaries (agents send full policies)
function initializeDefaultPolicies(): void {
  const defaultPolicies: SecurityPolicy[] = [
    {
      id: 'proc-001',
      name: 'Suspicious Process Names',
      description: 'Detect and kill processes with suspicious names',
      enabled: true,
      severity: 'high',
      category: 'process',
      conditions: [],
      actions: [{ type: 'kill_process' }, { type: 'alert' }],
      createdAt: new Date(),
      updatedAt: new Date(),
      triggeredCount: 0,
    },
    {
      id: 'net-001',
      name: 'Suspicious Port Connection',
      description: 'Block connections to suspicious ports',
      enabled: true,
      severity: 'high',
      category: 'network',
      conditions: [],
      actions: [{ type: 'block_network' }, { type: 'alert' }],
      createdAt: new Date(),
      updatedAt: new Date(),
      triggeredCount: 0,
    },
    {
      id: 'usb-001',
      name: 'Unknown USB Device',
      description: 'Alert on USB devices from unknown vendors',
      enabled: true,
      severity: 'medium',
      category: 'usb',
      conditions: [],
      actions: [{ type: 'alert' }, { type: 'log' }],
      createdAt: new Date(),
      updatedAt: new Date(),
      triggeredCount: 0,
    },
  ];

  defaultPolicies.forEach(policy => policies.set(policy.id, policy));
  logger.info('Initialized default policies', { count: policies.size });
}

initializeDefaultPolicies();

/**
 * @route   POST /api/enforcement/events
 * @desc    Receive enforcement events from agents
 * @access  Public (add auth in production)
 */
router.post('/events', async (req: Request, res: Response) => {
  try {
    const agentName = req.body.agentName || req.headers['x-agent-name'] as string || 'unknown';
    const incomingEvents = req.body.events;

    if (!incomingEvents || !Array.isArray(incomingEvents)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Events array is required',
      });
    }

    const processedEvents: string[] = [];

    for (const event of incomingEvents) {
      const eventId = `${agentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const enforcementEvent: EnforcementEvent = {
        id: eventId,
        agentName,
        timestamp: new Date(event.timestamp || Date.now()),
        type: event.type || 'policy_triggered',
        policyId: event.policyId,
        policyName: event.policyName,
        severity: event.severity,
        event: event.event,
        actions: event.results?.map((r: any) => ({
          type: r.actionType,
          success: r.success,
          error: r.error,
        })) || [],
        metadata: event.metadata,
      };

      // Store in database
      await query(`
        INSERT INTO enforcement_events (
          id, agent_name, timestamp, type, policy_id, policy_name, 
          severity, event, actions, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        enforcementEvent.id,
        enforcementEvent.agentName,
        enforcementEvent.timestamp,
        enforcementEvent.type,
        enforcementEvent.policyId,
        enforcementEvent.policyName,
        enforcementEvent.severity,
        JSON.stringify(enforcementEvent.event),
        JSON.stringify(enforcementEvent.actions),
        JSON.stringify(enforcementEvent.metadata || {})
      ]);

      processedEvents.push(eventId);

      // Emit real-time event via WebSocket
      if (io) {
        io.emit('enforcement:event', enforcementEvent);
      }

      logger.warn('Enforcement event recorded', {
        eventId,
        agentName,
        policyId: event.policyId,
        policyName: event.policyName,
        severity: event.severity,
      });
    }

    res.json({
      success: true,
      message: 'Enforcement events received',
      eventsProcessed: processedEvents.length,
      eventIds: processedEvents,
    });
  } catch (error: any) {
    logger.error('Error processing enforcement events', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process enforcement events',
    });
  }
});

/**
 * @route   GET /api/enforcement/events
 * @desc    Get enforcement events with filtering
 * @access  Public (add auth in production)
 * @query   agentName, severity, policyId, limit, offset
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { agentName, severity, policyId, limit = '100', offset = '0' } = req.query;
    
    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (agentName) {
      conditions.push(`agent_name = $${paramIndex++}`);
      params.push(agentName);
    }

    if (severity) {
      conditions.push(`severity = $${paramIndex++}`);
      params.push(severity);
    }

    if (policyId) {
      conditions.push(`policy_id = $${paramIndex++}`);
      params.push(policyId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM enforcement_events ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    // Get paginated events
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    
    const eventsResult = await query(`
      SELECT * FROM enforcement_events 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limitNum, offsetNum]);

    const events = eventsResult.rows.map(row => ({
      id: row.id,
      agentName: row.agent_name,
      timestamp: row.timestamp,
      type: row.type,
      policyId: row.policy_id,
      policyName: row.policy_name,
      severity: row.severity,
      event: row.event,
      actions: row.actions,
      metadata: row.metadata
    }));

    res.json({
      success: true,
      total,
      count: events.length,
      limit: limitNum,
      offset: offsetNum,
      events,
    });
  } catch (error: any) {
    logger.error('Error fetching enforcement events', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch enforcement events',
    });
  }
});

/**
 * @route   GET /api/enforcement/events/stats
 * @desc    Get enforcement event statistics
 * @access  Public (add auth in production)
 */
router.get('/events/stats', (req: Request, res: Response) => {
  try {
    const events = Array.from(enforcementEvents.values());
    
    const stats = {
      total: events.length,
      bySeverity: {
        low: events.filter(e => e.severity === 'low').length,
        medium: events.filter(e => e.severity === 'medium').length,
        high: events.filter(e => e.severity === 'high').length,
        critical: events.filter(e => e.severity === 'critical').length,
      },
      byType: {
        policy_triggered: events.filter(e => e.type === 'policy_triggered').length,
        action_executed: events.filter(e => e.type === 'action_executed').length,
        action_failed: events.filter(e => e.type === 'action_failed').length,
      },
      topPolicies: getTopPolicies(events, 5),
      recentEvents: events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map(e => ({
          id: e.id,
          policyName: e.policyName,
          severity: e.severity,
          timestamp: e.timestamp.toISOString(),
        })),
    };

    res.json({ success: true, stats });
  } catch (error: any) {
    logger.error('Error fetching enforcement stats', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch enforcement stats',
    });
  }
});

function getTopPolicies(events: EnforcementEvent[], limit: number) {
  const policyCount = new Map<string, { name: string; count: number; severity: string }>();
  
  events.forEach(e => {
    const existing = policyCount.get(e.policyId);
    if (existing) {
      existing.count++;
    } else {
      policyCount.set(e.policyId, {
        name: e.policyName,
        count: 1,
        severity: e.severity,
      });
    }
  });

  return Array.from(policyCount.entries())
    .map(([id, data]) => ({ policyId: id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * @route   GET /api/enforcement/policies
 * @desc    Get all security policies
 * @access  Public (add auth in production)
 */
router.get('/policies', (req: Request, res: Response) => {
  try {
    const { enabled, severity, category } = req.query;
    
    let policyList = Array.from(policies.values());

    // Filter by enabled status
    if (enabled !== undefined) {
      const isEnabled = enabled === 'true';
      policyList = policyList.filter(p => p.enabled === isEnabled);
    }

    // Filter by severity
    if (severity) {
      policyList = policyList.filter(p => p.severity === severity);
    }

    // Filter by category
    if (category) {
      policyList = policyList.filter(p => p.category === category);
    }

    res.json({
      success: true,
      count: policyList.length,
      policies: policyList.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    logger.error('Error fetching policies', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch policies',
    });
  }
});

/**
 * @route   GET /api/enforcement/policies/:id
 * @desc    Get a specific policy by ID
 * @access  Public (add auth in production)
 */
router.get('/policies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policy = policies.get(id);

    if (!policy) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Policy ${id} not found`,
      });
    }

    res.json({
      success: true,
      policy: {
        ...policy,
        createdAt: policy.createdAt.toISOString(),
        updatedAt: policy.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching policy', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch policy',
    });
  }
});

/**
 * @route   PUT /api/enforcement/policies/:id
 * @desc    Update a policy (enable/disable, modify)
 * @access  Public (add auth in production)
 */
router.put('/policies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policy = policies.get(id);

    if (!policy) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Policy ${id} not found`,
      });
    }

    const { enabled, severity, description } = req.body;

    // Update policy fields
    if (enabled !== undefined) {
      policy.enabled = enabled;
    }
    if (severity) {
      policy.severity = severity;
    }
    if (description) {
      policy.description = description;
    }

    policy.updatedAt = new Date();
    policies.set(id, policy);

    logger.info('Policy updated', { policyId: id, enabled: policy.enabled });

    res.json({
      success: true,
      message: 'Policy updated successfully',
      policy: {
        ...policy,
        createdAt: policy.createdAt.toISOString(),
        updatedAt: policy.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Error updating policy', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update policy',
    });
  }
});

/**
 * @route   POST /api/enforcement/quarantine
 * @desc    Register quarantined file from agent
 * @access  Public (add auth in production)
 */
router.post('/quarantine', (req: Request, res: Response) => {
  try {
    const { agentName, filePath, policyId, policyName, reason, size, hash } = req.body;

    if (!filePath || !policyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'filePath and policyId are required',
      });
    }

    const fileId = `${agentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const quarantinedFile: QuarantinedFile = {
      id: fileId,
      agentName: agentName || 'unknown',
      filePath,
      quarantinedAt: new Date(),
      policyId,
      policyName: policyName || 'Unknown Policy',
      reason: reason || 'Security policy violation',
      size,
      hash,
      restored: false,
    };

    quarantinedFiles.set(fileId, quarantinedFile);

    logger.warn('File quarantined', {
      fileId,
      agentName,
      filePath,
      policyId,
    });

    res.json({
      success: true,
      message: 'File quarantined successfully',
      fileId,
    });
  } catch (error: any) {
    logger.error('Error quarantining file', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to quarantine file',
    });
  }
});

/**
 * @route   GET /api/enforcement/quarantine
 * @desc    Get quarantined files
 * @access  Public (add auth in production)
 * @query   agentName, restored, limit, offset
 */
router.get('/quarantine', (req: Request, res: Response) => {
  try {
    const { agentName, restored, limit = '100', offset = '0' } = req.query;
    
    let files = Array.from(quarantinedFiles.values());

    // Filter by agent name
    if (agentName) {
      files = files.filter(f => f.agentName === agentName);
    }

    // Filter by restored status
    if (restored !== undefined) {
      const isRestored = restored === 'true';
      files = files.filter(f => f.restored === isRestored);
    }

    // Sort by quarantine date (newest first)
    files.sort((a, b) => b.quarantinedAt.getTime() - a.quarantinedAt.getTime());

    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedFiles = files.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      total: files.length,
      count: paginatedFiles.length,
      limit: limitNum,
      offset: offsetNum,
      files: paginatedFiles.map(f => ({
        ...f,
        quarantinedAt: f.quarantinedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    logger.error('Error fetching quarantined files', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch quarantined files',
    });
  }
});

/**
 * @route   PUT /api/enforcement/quarantine/:id/restore
 * @desc    Mark a file as restored
 * @access  Public (add auth in production)
 */
router.put('/quarantine/:id/restore', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = quarantinedFiles.get(id);

    if (!file) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Quarantined file ${id} not found`,
      });
    }

    file.restored = true;
    quarantinedFiles.set(id, file);

    logger.info('File restored from quarantine', { fileId: id, filePath: file.filePath });

    res.json({
      success: true,
      message: 'File marked as restored',
      file: {
        ...file,
        quarantinedAt: file.quarantinedAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Error restoring file', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to restore file',
    });
  }
});

export default router;
