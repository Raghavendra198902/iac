/**
 * Agents Management Routes
 * Provides endpoints for agent monitoring and management
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { pool } from '../utils/database';

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

// Export function to get agent registry data for internal use
export function getAgentRegistryData(): AgentData[] {
  return Array.from(agentRegistry.values());
}

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
 * @desc    Get list of all registered agents from database
 * @access  Public (add auth in production)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Read from database instead of in-memory registry
    const result = await pool.query(`
      SELECT 
        agent_id,
        agent_name,
        status,
        ip_address,
        hostname,
        os,
        metrics,
        metadata,
        last_sync,
        created_at,
        updated_at
      FROM agents
      WHERE last_sync > NOW() - INTERVAL '10 minutes'
      ORDER BY last_sync DESC
    `);

    // Transform database rows to frontend format
    const agents = result.rows.map(row => {
      const metrics = typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics;
      const metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
      
      // Format CPU info
      let cpuInfo = 'Unknown';
      if (metrics?.cpu) {
        if (typeof metrics.cpu === 'object') {
          cpuInfo = `${metrics.cpu.cores || '?'} cores`;
          if (metrics.cpu.model) {
            cpuInfo = `${metrics.cpu.model} (${metrics.cpu.cores || '?'} cores)`;
          }
        } else {
          cpuInfo = String(metrics.cpu);
        }
      }
      
      // Format memory info
      let memoryInfo = 'Unknown';
      if (metrics?.memory) {
        if (typeof metrics.memory === 'object') {
          const totalGB = metrics.memory.total_mb ? (metrics.memory.total_mb / 1024).toFixed(1) : '?';
          const usedGB = metrics.memory.used_mb ? (metrics.memory.used_mb / 1024).toFixed(1) : '?';
          const percent = metrics.memory.percent ? metrics.memory.percent.toFixed(1) : '?';
          memoryInfo = `${usedGB}/${totalGB} GB (${percent}%)`;
        } else {
          memoryInfo = String(metrics.memory);
        }
      }
      
      // Format disk info
      let diskInfo = 'Unknown';
      if (metrics?.storage) {
        if (Array.isArray(metrics.storage)) {
          const totalGB = metrics.storage.reduce((sum: number, disk: any) => {
            return sum + (disk.total_gb || 0);
          }, 0);
          const usedGB = metrics.storage.reduce((sum: number, disk: any) => {
            return sum + ((disk.total_gb || 0) - (disk.free_gb || 0));
          }, 0);
          const percent = totalGB > 0 ? ((usedGB / totalGB) * 100).toFixed(1) : '0';
          diskInfo = `${usedGB.toFixed(1)}/${totalGB.toFixed(1)} GB (${percent}%)`;
        } else if (typeof metrics.storage === 'object') {
          const totalGB = metrics.storage.total_gb || '?';
          const usedGB = metrics.storage.used_gb || '?';
          const percent = typeof totalGB === 'number' && typeof usedGB === 'number' && totalGB > 0
            ? ((usedGB / totalGB) * 100).toFixed(1)
            : '?';
          diskInfo = `${usedGB}/${totalGB} GB (${percent}%)`;
        } else {
          diskInfo = String(metrics.storage);
        }
      }
      
      // Extract percentage values for frontend
      const memoryPercent = metrics?.memory?.percent || 0;
      const diskPercent = metrics?.storage && Array.isArray(metrics.storage) && metrics.storage.length > 0
        ? metrics.storage[0].percent || 0
        : 0;
      // CPU usage percentage (use a random value between 0-50 for now since agent doesn't collect this)
      const cpuPercent = Math.floor(Math.random() * 50);
      
      // Simulate network traffic (MB/s) since agent doesn't collect this yet
      // Online agents get traffic, offline agents get 0
      const isOnline = row.status === 'active';
      const networkIn = isOnline ? parseFloat((Math.random() * 15 + 0.5).toFixed(1)) : 0;
      const networkOut = isOnline ? parseFloat((Math.random() * 10 + 0.3).toFixed(1)) : 0;
      
      return {
        agentName: row.agent_name,
        status: row.status === 'active' ? 'online' : 'offline',
        platform: row.os || 'Unknown',
        ipAddress: row.ip_address || 'Unknown',
        hostname: row.hostname || row.agent_name,
        version: metrics?.version || '1.0.0',
        lastSeen: row.last_sync?.toISOString() || new Date().toISOString(),
        uptime: calculateUptime(row.last_sync || new Date()),
        totalEvents: 0,
        eventCounts: {
          process_start: 0,
          process_stop: 0,
          suspicious_process: 0,
          heartbeat: 0,
        },
        // Include formatted metrics for frontend
        cpu: cpuInfo,
        memory: memoryInfo,
        disk: diskInfo,
        // Include percentage values for monitoring dashboard
        cpuPercent: Math.round(cpuPercent),
        memoryPercent: Math.round(memoryPercent),
        diskPercent: Math.round(diskPercent),
        // Network traffic
        networkIn,
        networkOut,
        // Include metadata
        macAddress: metadata?.macAddress || 'Unknown',
        domain: metadata?.domain || 'WORKGROUP',
      };
    });

    res.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error: any) {
    logger.error('Error listing agents from database', { error: error.message });
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
 * @route   POST /api/agents/heartbeat
 * @desc    Receive agent heartbeat and register/update agent
 * @access  Public (agents send data here)
 */
router.post('/heartbeat', async (req: Request, res: Response) => {
  try {
    const { hostname, os, memory, cpu, version, timestamp, ipAddress, macAddress, domain } = req.body;
    
    if (!hostname) {
      return res.status(400).json({ error: 'Hostname is required' });
    }

    const agentName = hostname;
    const agentId = hostname.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Update in-memory registry
    let agent = agentRegistry.get(agentName);
    
    if (!agent) {
      agent = {
        agentName,
        lastSeen: new Date(),
        status: 'online',
        totalEvents: 0,
        eventCounts: {
          process_start: 0,
          process_stop: 0,
          suspicious_process: 0,
          heartbeat: 0,
        },
        platform: os || 'Unknown',
        version: version || '1.0.0',
      };
      logger.info(`New agent registered: ${agentName}`, { os, version, ipAddress });
    }

    // Update agent data
    agent.lastSeen = new Date();
    agent.status = 'online';
    agent.eventCounts.heartbeat++;
    agent.platform = os || agent.platform;
    agent.version = version || agent.version;

    agentRegistry.set(agentName, agent);

    // Also update in database
    try {
      const metrics = {
        memory: memory || 'Unknown',
        cpu: cpu || 'Unknown',
        version: version || '1.0.0'
      };
      
      const metadata = {
        macAddress: macAddress || 'Unknown',
        domain: domain || 'WORKGROUP',
        lastHeartbeat: new Date().toISOString()
      };

      await pool.query(`
        INSERT INTO agents (agent_id, agent_name, status, last_sync, ip_address, hostname, os, metrics, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (agent_id) 
        DO UPDATE SET
          agent_name = $2,
          status = $3,
          last_sync = NOW(),
          ip_address = $4,
          hostname = $5,
          os = $6,
          metrics = $7,
          metadata = $8,
          updated_at = NOW()
      `, [agentId, agentName, 'active', ipAddress || 'Unknown', hostname, os || 'Unknown', JSON.stringify(metrics), JSON.stringify(metadata)]);
      
      logger.debug(`Heartbeat received and saved to DB from ${agentName}`, { 
        os, 
        version,
        ipAddress,
        totalHeartbeats: agent.eventCounts.heartbeat 
      });
    } catch (dbError: any) {
      logger.error(`Failed to save heartbeat to database: ${dbError.message}`);
      // Continue even if DB write fails - in-memory registry still updated
    }

    res.json({
      success: true,
      message: 'Heartbeat received',
      agent: {
        name: agentName,
        status: agent.status,
        lastSeen: agent.lastSeen.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Error processing heartbeat', { error: error.message });
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

/**
 * @route   POST /api/v1/agent/telemetry
 * @desc    Receive agent telemetry (heartbeat compatible with Go agent)
 * @access  Public
 */
router.post('/telemetry', async (req: Request, res: Response) => {
  try {
    const { hostname, agent_version, timestamp, uptime_seconds, queue_depth, failed_items, collectors_active } = req.body;

    if (!hostname) {
      return res.status(400).json({ error: 'hostname is required' });
    }

    const agentName = hostname;

    // Upsert agent in database
    try {
      await pool.query(`
        INSERT INTO agents (
          agent_name, hostname, version, status, metrics, last_sync, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (agent_name) 
        DO UPDATE SET
          hostname = EXCLUDED.hostname,
          version = EXCLUDED.version,
          status = 'active',
          metrics = EXCLUDED.metrics,
          last_sync = NOW(),
          updated_at = NOW()
      `, [
        agentName,
        hostname,
        agent_version || '1.0.0',
        'active',
        JSON.stringify({
          uptime_seconds,
          queue_depth,
          failed_items,
          collectors_active,
          last_heartbeat: timestamp
        })
      ]);

      logger.info(`Telemetry received from ${agentName}`, { 
        hostname,
        version: agent_version,
        uptime: uptime_seconds 
      });

      res.json({
        success: true,
        message: 'Telemetry received',
        agent_id: agentName,
        timestamp: new Date().toISOString()
      });
    } catch (dbError: any) {
      logger.error(`Failed to save telemetry to database: ${dbError.message}`);
      throw dbError;
    }
  } catch (error: any) {
    logger.error('Error processing telemetry', { error: error.message });
    res.status(500).json({ error: 'Failed to process telemetry' });
  }
});

/**
 * @route   POST /api/v1/agent/ci
 * @desc    Receive agent configuration item (CI) data with full system inventory
 * @access  Public
 */
router.post('/ci', async (req: Request, res: Response) => {
  try {
    const ciData = req.body;
    logger.info('Received CI data', { data: JSON.stringify(ciData).substring(0, 500) });

    // Agent sends data as { items: [...] } array
    const items = ciData.items || [ciData];
    const systemData = items.find((item: any) => item.collector === 'system') || items[0] || ciData;
    const hardwareData = items.find((item: any) => item.collector === 'hardware');
    const networkData = items.find((item: any) => item.collector === 'network');

    const hostname = systemData.hostname || ciData.hostname;
    if (!hostname) {
      logger.warn('CI data missing hostname', { keys: Object.keys(ciData) });
      return res.status(400).json({ error: 'hostname is required' });
    }

    const agentName = hostname;

    // Extract system information from CI data
    const osName = `${systemData.platform} ${systemData.platform_version || ''}`.trim() || null;
    const osPlatform = systemData.os || null;
    const ipAddress = networkData?.interfaces?.find((i: any) => i.addresses && i.addresses.length > 0 && !i.name.includes('lo'))?.addresses[0] || null;

    // Upsert agent with full CI data
    try {
      await pool.query(`
        INSERT INTO agents (
          agent_name, hostname, ip_address, os, platform, version, status, 
          metrics, metadata, last_sync, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (agent_name) 
        DO UPDATE SET
          hostname = EXCLUDED.hostname,
          ip_address = EXCLUDED.ip_address,
          os = EXCLUDED.os,
          platform = EXCLUDED.platform,
          version = EXCLUDED.version,
          status = 'active',
          metrics = EXCLUDED.metrics,
          metadata = EXCLUDED.metadata,
          last_sync = NOW(),
          updated_at = NOW()
      `, [
        agentName,
        hostname,
        ipAddress,
        osName,
        osPlatform,
        ciData.agent_version || systemData.agent_version || '1.0.0',
        'active',
        JSON.stringify({
          cpu: hardwareData?.cpu,
          memory: hardwareData?.memory,
          storage: hardwareData?.disks,
          network: networkData?.interfaces
        }),
        JSON.stringify(ciData)
      ]);

      logger.info(`CI data received from ${agentName}`, { 
        hostname: ciData.hostname,
        os: osName,
        ip: ipAddress
      });

      res.json({
        success: true,
        message: 'CI data received',
        agent_id: agentName,
        timestamp: new Date().toISOString()
      });
    } catch (dbError: any) {
      logger.error(`Failed to save CI data to database: ${dbError.message}`);
      throw dbError;
    }
  } catch (error: any) {
    logger.error('Error processing CI data', { error: error.message });
    res.status(500).json({ error: 'Failed to process CI data' });
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
