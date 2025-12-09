import express, { Request, Response } from 'express';
import { getAgentRegistryData } from './agents';
import { cacheGet, cacheSet, cacheInvalidateByTag, cacheSetWithTags } from '../utils/cache';
import { shortCache, mediumCache } from '../middleware/httpCache';

const router = express.Router();

// In-memory storage (replace with database in production)
interface ConfigItem {
  id: string;
  name: string;
  type: string;
  environment: string;
  status: string;
  ipAddress?: string;
  hostname?: string;
  os?: string;
  location?: string;
  department?: string;
  owner?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    network?: number;
  };
  lastMetricsUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Agent {
  agentId: string;
  agentName: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  ipAddress: string;
  hostname: string;
  os: string;
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  metadata?: Record<string, any>;
}

interface NetworkDevice {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'firewall' | 'loadbalancer' | 'other';
  ipAddress: string;
  macAddress?: string;
  status: 'online' | 'offline' | 'unknown';
  discoveredBy: string;
  discoveredAt: Date;
}

// NO DEMO DATA - Empty array, will be populated by real agents only
let configItems: ConfigItem[] = [];

let agents: Agent[] = [];
let networkDevices: NetworkDevice[] = [];

// Discovery schedules storage
interface DiscoverySchedule {
  id: string;
  name: string;
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM format for daily
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  agentIds: string[];
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

let discoverySchedules: DiscoverySchedule[] = [];

// Audit log storage
interface AuditLog {
  id: string;
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'discovery' | 'sync';
  entityType: 'ci' | 'agent' | 'schedule' | 'network';
  entityId: string;
  entityName: string;
  userId?: string;
  userName?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
}

let auditLogs: AuditLog[] = [];

// Helper function to log changes
const logAudit = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const auditEntry: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...log
  };
  auditLogs.push(auditEntry);
  // Keep only last 1000 entries
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(-1000);
  }
  return auditEntry;
};

// GET all configuration items (with caching)
router.get('/items', shortCache, async (req: Request, res: Response) => {
  const { type, environment, status, search } = req.query;
  
  // Generate cache key based on query params
  const cacheKey = `cmdb:items:${type || 'all'}:${environment || 'all'}:${status || 'all'}:${search || ''}`;
  
  // Try to get from cache
  const cached = await cacheGet<{ total: number; items: ConfigItem[] }>(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  let filtered = [...configItems];
  
  if (type) {
    filtered = filtered.filter(item => item.type === type);
  }
  
  if (environment) {
    filtered = filtered.filter(item => item.environment === environment);
  }
  
  if (status) {
    filtered = filtered.filter(item => item.status === status);
  }
  
  if (search) {
    const searchLower = (search as string).toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.hostname?.toLowerCase().includes(searchLower) ||
      item.ipAddress?.toLowerCase().includes(searchLower)
    );
  }
  
  const result = {
    total: filtered.length,
    items: filtered
  };
  
  // Cache the result for 5 minutes
  await cacheSet(cacheKey, result, 300);
  
  res.json(result);
});

// GET single configuration item
router.get('/items/:id', (req: Request, res: Response) => {
  const item = configItems.find(ci => ci.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({ error: 'Configuration item not found' });
  }
  
  res.json(item);
});

// CREATE configuration item
router.post('/items', async (req: Request, res: Response) => {
  const newItem: ConfigItem = {
    id: `ci-${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  configItems.push(newItem);
  
  logAudit({
    action: 'create',
    entityType: 'ci',
    entityId: newItem.id,
    entityName: newItem.name,
    metadata: { type: newItem.type, environment: newItem.environment }
  });
  
  // Invalidate cache after creating item
  await cacheInvalidateByTag('cmdb:items');
  
  res.status(201).json(newItem);
});

// UPDATE configuration item
router.put('/items/:id', async (req: Request, res: Response) => {
  const index = configItems.findIndex(ci => ci.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Configuration item not found' });
  }
  
  const oldItem = { ...configItems[index] };
  
  configItems[index] = {
    ...configItems[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date()
  };
  
  const changes = Object.keys(req.body).map(field => ({
    field,
    oldValue: oldItem[field as keyof ConfigItem],
    newValue: req.body[field]
  }));
  
  logAudit({
    action: 'update',
    entityType: 'ci',
    entityId: req.params.id,
    entityName: configItems[index].name,
    changes
  });
  
  // Invalidate cache after update
  await cacheInvalidateByTag('cmdb:items');
  
  res.json(configItems[index]);
});

// DELETE configuration item
router.delete('/items/:id', async (req: Request, res: Response) => {
  const index = configItems.findIndex(ci => ci.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Configuration item not found' });
  }
  
  const item = configItems[index];
  
  logAudit({
    action: 'delete',
    entityType: 'ci',
    entityId: item.id,
    entityName: item.name,
    metadata: { type: item.type }
  });
  
  configItems.splice(index, 1);
  
  // Invalidate cache after delete
  await cacheInvalidateByTag('cmdb:items');
  
  res.status(204).send();
});

// POST /ci - Register a configuration item (CI) from agent
router.post('/ci', async (req: Request, res: Response) => {
  const ciData = req.body;
  
  if (!ciData.id || !ciData.name) {
    return res.status(400).json({ error: 'CI id and name are required' });
  }
  const existingCI = configItems.find(ci => ci.id === ciData.id);
  
  if (existingCI) {
    // Update existing CI
    Object.assign(existingCI, {
      ...ciData,
      updatedAt: new Date()
    });
    
    return res.json({
      message: 'CI updated',
      ci: existingCI
    });
  }
  
  // Create new CI
  const newCI: ConfigItem = {
    ...ciData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  configItems.push(newCI);
  
  res.status(201).json({
    message: 'CI registered',
    ci: newCI
  });
});

// PUT /ci/:id - Update a configuration item (CI) from agent
router.put('/ci/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const ciData = req.body;
  
  const existingCI = configItems.find(ci => ci.id === id);
  
  if (!existingCI) {
    return res.status(404).json({ error: 'CI not found' });
  }
  
  // Update existing CI
  Object.assign(existingCI, {
    ...ciData,
    id, // Ensure ID doesn't change
    updatedAt: new Date()
  });
  
  res.json({
    message: 'CI updated',
    ci: existingCI
  });
});

// POST /ci/:id/metrics - Send metrics for a CI from agent
router.post('/ci/:id/metrics', (req: Request, res: Response) => {
  const { id } = req.params;
  const metrics = req.body;
  
  const existingCI = configItems.find(ci => ci.id === id);
  
  if (!existingCI) {
    return res.status(404).json({ error: 'CI not found' });
  }
  
  // Store metrics (in a real system, this would go to a time-series database)
  // For now, just update the CI with latest metrics
  Object.assign(existingCI, {
    metrics,
    lastMetricsUpdate: new Date(),
    updatedAt: new Date()
  });
  
  res.json({
    message: 'Metrics received',
    ciId: id
  });
});

// GET statistics
router.get('/stats', (req: Request, res: Response) => {
  const stats = {
    totalItems: configItems.length,
    byType: {} as Record<string, number>,
    byEnvironment: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalAgents: agents.length,
    networkDevices: networkDevices.length
  };
  
  configItems.forEach(item => {
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byEnvironment[item.environment] = (stats.byEnvironment[item.environment] || 0) + 1;
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
  });
  
  res.json(stats);
});

// GET /cis - Get all configuration items (for frontend display)
router.get('/cis', (req: Request, res: Response) => {
  try {
    // Return all CIs registered by agents
    res.json(configItems);
  } catch (error: any) {
    logger.error('Error fetching CIs:', error.message);
    res.status(500).json({ error: 'Failed to fetch configuration items' });
  }
});

// GET /agents/status - Get all agent statuses for frontend display
router.get('/agents/status', (req: Request, res: Response) => {
  try {
    // Update agent status based on last sync time
    const now = new Date();
    agents.forEach(agent => {
      const timeSinceSync = now.getTime() - agent.lastSync.getTime();
      if (timeSinceSync > 300000) { // 5 minutes
        agent.status = 'inactive';
      } else if (timeSinceSync > 120000) { // 2 minutes
        agent.status = 'error';
      } else {
        agent.status = 'active';
      }
    });
    
    // Format agents for frontend display
    const agentStatuses = agents.map(agent => {
      const timeDiff = now.getTime() - agent.lastSync.getTime();
      
      // Calculate health score based on status
      let healthScore = 100;
      if (agent.status === 'error') healthScore = 50;
      else if (agent.status === 'inactive') healthScore = 0;
      
      // Count CIs registered by this agent
      const ciCount = configItems.filter(ci => ci.metadata?.agentId === agent.agentId).length;
      
      return {
        id: agent.agentId,
        hostname: agent.agentName,
        status: agent.status === 'active' ? 'online' : agent.status === 'error' ? 'warning' : 'offline',
        lastSeen: agent.lastSync.toISOString(),
        ciCount,
        healthScore,
        metrics: agent.metrics || {
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0
        }
      };
    });
    
    res.json(agentStatuses);
  } catch (error: any) {
    logger.error('Error fetching agents:', error.message);
    res.json([]); // Return empty array on error
  }
});

// Agent registration endpoint
router.post('/agents/register', (req: Request, res: Response) => {
  const { agentId, agentName, ipAddress, hostname, os, metadata } = req.body;
  
  if (!agentId || !agentName) {
    return res.status(400).json({ error: 'agentId and agentName are required' });
  }
  
  const existingAgent = agents.find(a => a.agentId === agentId);
  
  if (existingAgent) {
    // Update existing agent
    existingAgent.agentName = agentName;
    existingAgent.status = 'active';
    existingAgent.lastSync = new Date();
    existingAgent.ipAddress = ipAddress || existingAgent.ipAddress;
    existingAgent.hostname = hostname || existingAgent.hostname;
    existingAgent.os = os || existingAgent.os;
    existingAgent.metadata = metadata || existingAgent.metadata;
    
    return res.json({ 
      message: 'Agent updated',
      agent: existingAgent 
    });
  }
  
  // Create new agent
  const newAgent: Agent = {
    agentId,
    agentName,
    status: 'active',
    lastSync: new Date(),
    ipAddress: ipAddress || 'unknown',
    hostname: hostname || 'unknown',
    os: os || 'unknown',
    metadata
  };
  
  agents.push(newAgent);
  
  res.status(201).json({ 
    message: 'Agent registered',
    agent: newAgent 
  });
});

// Agent heartbeat endpoint
router.post('/agents/:agentId/heartbeat', (req: Request, res: Response) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  agent.status = 'active';
  agent.lastSync = new Date();
  
  if (req.body.metrics) {
    agent.metrics = req.body.metrics;
  }
  
  res.json({ 
    message: 'Heartbeat received',
    agent 
  });
});

// GET all agents
router.get('/agents', (req: Request, res: Response) => {
  // Update agent status based on last sync time
  const now = new Date();
  agents.forEach(agent => {
    const timeSinceSync = now.getTime() - agent.lastSync.getTime();
    if (timeSinceSync > 300000) { // 5 minutes
      agent.status = 'inactive';
    }
  });
  
  res.json({
    total: agents.length,
    agents
  });
});

// GET single agent
router.get('/agents/:agentId', (req: Request, res: Response) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  res.json(agent);
});

// Agent metrics endpoint
router.post('/agents/:agentId/metrics', (req: Request, res: Response) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  agent.metrics = req.body;
  agent.lastSync = new Date();
  
  res.json({ 
    message: 'Metrics received',
    agent 
  });
});

// Network discovery endpoint
router.post('/agents/:agentId/discovery', (req: Request, res: Response) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  const { devices } = req.body;
  
  if (!Array.isArray(devices)) {
    return res.status(400).json({ error: 'devices must be an array' });
  }
  
  devices.forEach((device: any) => {
    const existingDevice = networkDevices.find(d => 
      d.ipAddress === device.ipAddress || 
      (device.macAddress && d.macAddress === device.macAddress)
    );
    
    if (existingDevice) {
      // Update existing device
      existingDevice.name = device.name || existingDevice.name;
      existingDevice.type = device.type || existingDevice.type;
      existingDevice.status = device.status || existingDevice.status;
      existingDevice.macAddress = device.macAddress || existingDevice.macAddress;
      existingDevice.discoveredAt = new Date();
    } else {
      // Add new device
      networkDevices.push({
        id: `nd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: device.name || `Device-${device.ipAddress}`,
        type: device.type || 'other',
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
        status: device.status || 'unknown',
        discoveredBy: req.params.agentId,
        discoveredAt: new Date()
      });
    }
  });
  
  res.json({ 
    message: 'Discovery data received',
    devicesProcessed: devices.length 
  });
});

// GET network devices
router.get('/network-devices', (req: Request, res: Response) => {
  res.json({
    total: networkDevices.length,
    devices: networkDevices
  });
});

// Trigger agent sync
router.post('/agents/:agentId/sync', (req: Request, res: Response) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  // In a real implementation, this would trigger the agent to sync
  res.json({ 
    message: 'Sync triggered',
    agentId: req.params.agentId 
  });
});

// Trigger network discovery
router.post('/agents/:agentId/discover', (req: Request, res: Response) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  // In a real implementation, this would trigger the agent to perform discovery
  res.json({ 
    message: 'Discovery triggered',
    agentId: req.params.agentId 
  });
});

// Network discovery - scan network for devices
router.post('/network-discovery', async (req: Request, res: Response) => {
  try {
    console.log('Network discovery triggered');
    
    // In a real implementation, this would:
    // 1. Trigger all active agents to scan their networks
    // 2. Aggregate results from multiple agents
    // 3. Deduplicate discovered devices
    
    // For now, simulate discovery by checking if we have active agents
    const activeAgents = agents.filter(a => a.status === 'active');
    
    if (activeAgents.length === 0) {
      return res.json({
        message: 'No active agents available for network discovery',
        devicesFound: 0,
        devices: []
      });
    }
    
    // Simulate discovery - trigger discovery on all active agents
    const discoveryPromises = activeAgents.map(agent => {
      // In production, this would make HTTP request to agent
      // For now, just simulate with mock data
      return Promise.resolve({
        agentId: agent.agentId,
        devicesFound: 0
      });
    });
    
    await Promise.all(discoveryPromises);
    
    // Return current network devices
    res.json({
      message: `Network discovery completed. Scanned via ${activeAgents.length} agent(s).`,
      devicesFound: networkDevices.length,
      devices: networkDevices,
      agentsUsed: activeAgents.length
    });
    
  } catch (error) {
    logger.error('Network discovery error:', { error });
    res.status(500).json({ 
      error: 'Network discovery failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== DISCOVERY SCHEDULING ENDPOINTS ====================

// GET all discovery schedules
router.get('/schedules', (req: Request, res: Response) => {
  res.json(discoverySchedules);
});

// CREATE discovery schedule
router.post('/schedules', (req: Request, res: Response) => {
  const { name, frequency, time, dayOfWeek, dayOfMonth, agentIds } = req.body;
  
  const schedule: DiscoverySchedule = {
    id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    enabled: true,
    frequency,
    time,
    dayOfWeek,
    dayOfMonth,
    agentIds: agentIds || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  discoverySchedules.push(schedule);
  
  logAudit({
    action: 'create',
    entityType: 'schedule',
    entityId: schedule.id,
    entityName: schedule.name,
    metadata: { frequency: schedule.frequency }
  });
  
  res.status(201).json(schedule);
});

// UPDATE discovery schedule
router.put('/schedules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = discoverySchedules.findIndex(s => s.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  
  const oldSchedule = { ...discoverySchedules[index] };
  discoverySchedules[index] = {
    ...discoverySchedules[index],
    ...req.body,
    updatedAt: new Date()
  };
  
  const changes = Object.keys(req.body).map(field => ({
    field,
    oldValue: oldSchedule[field as keyof DiscoverySchedule],
    newValue: req.body[field]
  }));
  
  logAudit({
    action: 'update',
    entityType: 'schedule',
    entityId: id,
    entityName: discoverySchedules[index].name,
    changes
  });
  
  res.json(discoverySchedules[index]);
});

// DELETE discovery schedule
router.delete('/schedules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = discoverySchedules.findIndex(s => s.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  
  const schedule = discoverySchedules[index];
  discoverySchedules.splice(index, 1);
  
  logAudit({
    action: 'delete',
    entityType: 'schedule',
    entityId: schedule.id,
    entityName: schedule.name
  });
  
  res.json({ message: 'Schedule deleted successfully' });
});

// TOGGLE schedule enabled/disabled
router.patch('/schedules/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule = discoverySchedules.find(s => s.id === id);
  
  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  
  schedule.enabled = !schedule.enabled;
  schedule.updatedAt = new Date();
  
  logAudit({
    action: 'update',
    entityType: 'schedule',
    entityId: schedule.id,
    entityName: schedule.name,
    changes: [{ field: 'enabled', oldValue: !schedule.enabled, newValue: schedule.enabled }]
  });
  
  res.json(schedule);
});

// ==================== AUDIT LOG ENDPOINTS ====================

// GET audit logs with filtering
router.get('/audit', (req: Request, res: Response) => {
  const { action, entityType, entityId, limit = 100 } = req.query;
  
  let filtered = [...auditLogs].reverse(); // Most recent first
  
  if (action) {
    filtered = filtered.filter(log => log.action === action);
  }
  
  if (entityType) {
    filtered = filtered.filter(log => log.entityType === entityType);
  }
  
  if (entityId) {
    filtered = filtered.filter(log => log.entityId === entityId);
  }
  
  const limitNum = parseInt(limit as string);
  filtered = filtered.slice(0, limitNum);
  
  res.json({
    total: auditLogs.length,
    filtered: filtered.length,
    logs: filtered
  });
});

// GET audit history for specific CI item
router.get('/cis/:id/history', (req: Request, res: Response) => {
  const { id } = req.params;
  const history = auditLogs
    .filter(log => log.entityId === id && log.entityType === 'ci')
    .reverse();
  
  res.json(history);
});

// ==================== HEALTH MONITORING ENDPOINTS ====================

// GET health metrics
router.get('/health', (req: Request, res: Response) => {
  const total = configItems.length;
  const operational = configItems.filter(ci => ci.status === 'operational').length;
  const degraded = configItems.filter(ci => ci.status === 'degraded').length;
  const down = configItems.filter(ci => ci.status === 'down').length;
  const maintenance = configItems.filter(ci => ci.status === 'maintenance').length;
  
  const overallHealth = total > 0 ? Math.round((operational / total) * 100) : 0;
  
  // Group by environment
  const environments = ['production', 'staging', 'development'];
  const byEnvironment = environments.map(env => {
    const items = configItems.filter(ci => ci.environment === env);
    const healthyItems = items.filter(ci => ci.status === 'operational').length;
    return {
      name: env,
      total: items.length,
      health: items.length > 0 ? Math.round((healthyItems / items.length) * 100) : 0
    };
  });
  
  // Group by type
  const types = ['server', 'database', 'network', 'application', 'service', 'container'];
  const byType = types.map(type => ({
    name: type,
    count: configItems.filter(ci => ci.type === type).length
  })).filter(t => t.count > 0);
  
  // Recent issues (last 24 hours)
  const recentIssues = configItems
    .filter(ci => ci.status === 'degraded' || ci.status === 'down')
    .slice(0, 5)
    .map(ci => ({
      ciId: ci.id,
      ciName: ci.name,
      message: `${ci.type} is ${ci.status}`,
      severity: ci.status === 'down' ? 'critical' : 'warning',
      timestamp: new Date().toISOString()
    }));
  
  res.json({
    total,
    operational,
    degraded,
    down,
    maintenance,
    overallHealth,
    byEnvironment,
    byType,
    recentIssues
  });
});

// ==================== NOTIFICATION ENDPOINTS ====================

// In-memory notifications store
interface Notification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  ciId?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'High CPU Usage Detected',
    message: 'Server "prod-web-01" CPU usage exceeded 85% threshold',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    ciId: 'ci-1'
  },
  {
    id: '2',
    type: 'error',
    title: 'Database Connection Failed',
    message: 'Unable to connect to "prod-db-primary" - connection timeout',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    ciId: 'ci-2'
  },
  {
    id: '3',
    type: 'success',
    title: 'Discovery Complete',
    message: 'Network discovery found 12 new devices',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    read: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for tonight at 2:00 AM',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    read: true
  }
];

// GET all notifications
router.get('/notifications', (req: Request, res: Response) => {
  res.json(notifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ));
});

// PATCH mark notification as read
router.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id === id);
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  notification.read = true;
  res.json(notification);
});

export default router;
