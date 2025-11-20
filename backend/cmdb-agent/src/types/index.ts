export interface CIData {
  id: string;
  name: string;
  type: 'server' | 'database' | 'network' | 'storage' | 'application' | 'service' | 'container';
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  environment: string;
  owner: string;
  location: string;
  provider: string;
  ipAddress?: string;
  version?: string;
  dependencies: string[];
  tags: string[];
  metadata: Record<string, unknown>;
  agentId: string;
  lastSeen: string;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      ip4: string;
      mac: string;
      speed: number;
    }>;
  };
  uptime: number;
  timestamp: string;
}

export interface DiscoveredResource {
  type: string;
  name: string;
  details: Record<string, unknown>;
}

export interface AgentConfig {
  agentId: string;
  agentName: string;
  environment: string;
  cmdbApiUrl: string;
  cmdbApiKey: string;
  scanInterval: number;
  autoDiscovery: boolean;
  thresholds: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  lastCheck: string;
  uptime: number;
  version: string;
  metrics: {
    ciCount: number;
    lastSync: string;
    errors: number;
  };
}
