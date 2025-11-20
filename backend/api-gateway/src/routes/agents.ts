/**
 * Agents Management Routes
 * Provides endpoints for agent monitoring and management
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// In-memory storage for agent data (replace with database in production)
interface AgentData {
  agentName: string;
  organizationId?: string;
  lastSeen: Date;
  status: 'online' | 'offline' | 'warning';
  totalEvents: number;
  eventCounts: {
    process_start: number;
    process_stop: number;
    suspicious_process: number;
    heartbeat: number;
  };
  platform?: string;
  version?: string;
}

const agentRegistry = new Map<string, AgentData>();

// Update agent data from telemetry
export function updateAgentFromTelemetry(data: any): void {
  const agentName = data.agentName || 'unknown';
  const events = data.events || [];
  
  let agent = agentRegistry.get(agentName);
  if (!agent) {
    agent = {
      agentName,
      organizationId: data.organizationId,
      lastSeen: new Date(),
      status: 'online',
      totalEvents: 0,
      eventCounts: {
        process_start: 0,
        process_stop: 0,
        suspicious_process: 0,
        heartbeat: 0,
      },
    };
  }

  agent.lastSeen = new Date();
  agent.status = 'online';
  agent.totalEvents += events.length;

  // Count event types
  events.forEach((event: any) => {
    const type = event.type as keyof typeof agent.eventCounts;
    if (type in agent.eventCounts) {
      agent.eventCounts[type]++;
    }
  });

  agentRegistry.set(agentName, agent);
}

// Mark agents as offline if not seen in 5 minutes
setInterval(() => {
  const now = new Date();
  agentRegistry.forEach((agent, name) => {
    const timeSinceLastSeen = now.getTime() - agent.lastSeen.getTime();
    if (timeSinceLastSeen > 5 * 60 * 1000) {
      agent.status = 'offline';
    } else if (timeSinceLastSeen > 2 * 60 * 1000) {
      agent.status = 'warning';
    }
  });
}, 30000); // Check every 30 seconds

/**
 * @route   GET /api/agents
 * @desc    Get list of all registered agents
 * @access  Public (add auth in production)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const agents = Array.from(agentRegistry.values()).map(agent => ({
      ...agent,
      lastSeen: agent.lastSeen.toISOString(),
      uptime: calculateUptime(agent.lastSeen),
    }));

    res.json({
      success: true,
      count: agents.length,
      agents: agents.sort((a, b) => 
        new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
      ),
    });
  } catch (error: any) {
    logger.error('Error listing agents', { error: error.message });
    res.status(500).json({ error: 'Failed to list agents' });
  }
});

/**
 * @route   GET /api/agents/:name
 * @desc    Get detailed information about a specific agent
 * @access  Public (add auth in production)
 */
router.get('/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agent = agentRegistry.get(name);

    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `No agent registered with name: ${name}`
      });
    }

    res.json({
      success: true,
      agent: {
        ...agent,
        lastSeen: agent.lastSeen.toISOString(),
        uptime: calculateUptime(agent.lastSeen),
      },
    });
  } catch (error: any) {
    logger.error('Error getting agent details', { error: error.message });
    res.status(500).json({ error: 'Failed to get agent details' });
  }
});

/**
 * @route   GET /api/agents/stats/summary
 * @desc    Get summary statistics for all agents
 * @access  Public (add auth in production)
 */
router.get('/stats/summary', (req: Request, res: Response) => {
  try {
    const agents = Array.from(agentRegistry.values());
    
    const summary = {
      totalAgents: agents.length,
      onlineAgents: agents.filter(a => a.status === 'online').length,
      warningAgents: agents.filter(a => a.status === 'warning').length,
      offlineAgents: agents.filter(a => a.status === 'offline').length,
      totalEvents: agents.reduce((sum, a) => sum + a.totalEvents, 0),
      totalProcessStarts: agents.reduce((sum, a) => sum + a.eventCounts.process_start, 0),
      totalProcessStops: agents.reduce((sum, a) => sum + a.eventCounts.process_stop, 0),
      totalSuspicious: agents.reduce((sum, a) => sum + a.eventCounts.suspicious_process, 0),
    };

    res.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error getting agent summary', { error: error.message });
    res.status(500).json({ error: 'Failed to get agent summary' });
  }
});

/**
 * Helper: Calculate uptime string
 */
function calculateUptime(lastSeen: Date): string {
  const now = new Date();
  const diff = now.getTime() - lastSeen.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  return `${minutes}m ago`;
}

export default router;
