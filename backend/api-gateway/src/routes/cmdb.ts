import express, { Request, Response } from 'express';
import { getAgentRegistryData } from './agents';

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

// GET all configuration items
router.get('/items', (req: Request, res: Response) => {
  const { type, environment, status, search } = req.query;
  
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
  
  res.json({
    total: filtered.length,
    items: filtered
  });
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
router.post('/items', (req: Request, res: Response) => {
  const newItem: ConfigItem = {
    id: `ci-${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  configItems.push(newItem);
  res.status(201).json(newItem);
});

// UPDATE configuration item
router.put('/items/:id', (req: Request, res: Response) => {
  const index = configItems.findIndex(ci => ci.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Configuration item not found' });
  }
  
  configItems[index] = {
    ...configItems[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date()
  };
  
  res.json(configItems[index]);
});

// DELETE configuration item
router.delete('/items/:id', (req: Request, res: Response) => {
  const index = configItems.findIndex(ci => ci.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Configuration item not found' });
  }
  
  configItems.splice(index, 1);
  res.status(204).send();
});

// POST /ci - Register a configuration item (CI) from agent
router.post('/ci', (req: Request, res: Response) => {
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

// GET /agents/status - Get all agent statuses for frontend display
// ONLY returns REAL agents from the agent registry - NO MOCK DATA
router.get('/agents/status', (req: Request, res: Response) => {
  try {
    // Get real agent data directly from agent registry
    const agents = getAgentRegistryData();
    
    if (!agents || agents.length === 0) {
      return res.json([]); // No real agents
    }
    
    // Transform real agent data to CMDB format
    const agentStatuses = agents.map((agent: any) => {
      const timeDiff = Date.now() - new Date(agent.lastSeen).getTime();
      
      // Calculate health score based on status
      let healthScore = 100;
      if (agent.status === 'warning') healthScore = 75;
      else if (agent.status === 'offline') healthScore = 0;
      
      return {
        id: `agent-${agent.agentName.replace(/[^a-zA-Z0-9-]/g, '-')}`,
        hostname: agent.agentName,
        status: agent.status,
        lastSeen: agent.lastSeen.toISOString(),
        ciCount: 0, // Real agents don't track CIs yet
        healthScore,
        metrics: {
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0
        }
      };
    });
    
    res.json(agentStatuses);
  } catch (error: any) {
    console.error('Error fetching real agents:', error.message);
    res.json([]); // Return empty array on error - NO MOCK DATA
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

export default router;
