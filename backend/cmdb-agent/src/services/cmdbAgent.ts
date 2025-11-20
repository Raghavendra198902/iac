import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { CMDBClient } from './cmdbClient';
import { SystemMonitor } from './systemMonitor';
import { CIData, AgentConfig } from '../types';

export class CMDBAgent {
  private cmdbClient: CMDBClient;
  private systemMonitor: SystemMonitor;
  private config: AgentConfig;
  private ciId: string;
  private registrationComplete: boolean = false;
  private errorCount: number = 0;
  private lastSync: string = '';

  constructor(config: AgentConfig) {
    this.config = config;
    this.cmdbClient = new CMDBClient(
      config.cmdbApiUrl,
      config.cmdbApiKey,
      process.env.CMDB_TENANT_ID || 'default'
    );
    this.systemMonitor = new SystemMonitor();
    this.ciId = `ci-${config.agentId}`;

    logger.info('CMDB Agent initialized', {
      agentId: config.agentId,
      environment: config.environment,
    });
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Starting agent initialization...');

      // Check CMDB connectivity
      const cmdbHealthy = await this.cmdbClient.healthCheck();
      if (!cmdbHealthy) {
        logger.warn('CMDB API is not available, will retry registration later');
      }

      // Get system information
      const systemInfo = await this.systemMonitor.getSystemInfo();
      logger.info('System information collected', { hostname: systemInfo.hostname });

      // Check if already registered
      const existingCI = await this.cmdbClient.getCIById(this.ciId);

      if (existingCI) {
        logger.info('CI already registered, updating...', { ciId: this.ciId });
        await this.updateRegistration(systemInfo);
      } else {
        logger.info('Registering new CI...', { ciId: this.ciId });
        await this.registerSelf(systemInfo);
      }

      this.registrationComplete = true;
      logger.info('Agent initialization complete');
    } catch (error) {
      logger.error('Agent initialization failed', { error });
      throw error;
    }
  }

  private async registerSelf(systemInfo: any): Promise<void> {
    const ciData: CIData = {
      id: this.ciId,
      name: systemInfo.hostname,
      type: 'server',
      status: 'operational',
      environment: this.config.environment,
      owner: process.env.OWNER_TAG || 'Auto-Discovered',
      location: 'Auto-Detected',
      provider: systemInfo.platform,
      ipAddress: systemInfo.primaryIP,
      version: systemInfo.osRelease,
      dependencies: [],
      tags: [
        'monitored',
        'auto-discovered',
        this.config.environment,
        systemInfo.platform,
      ],
      metadata: {
        agentVersion: process.env.AGENT_VERSION || '1.0.0',
        manufacturer: systemInfo.manufacturer,
        model: systemInfo.model,
        osDistro: systemInfo.osDistro,
        cpuModel: systemInfo.cpuModel,
        cpuCores: systemInfo.cpuCores,
        discoveryDate: new Date().toISOString(),
      },
      agentId: this.config.agentId,
      lastSeen: new Date().toISOString(),
    };

    const success = await this.cmdbClient.registerCI(ciData);
    if (!success) {
      throw new Error('Failed to register CI');
    }

    logger.info('Successfully registered in CMDB', { ciId: this.ciId });
  }

  private async updateRegistration(systemInfo: any): Promise<void> {
    const updateData: Partial<CIData> = {
      lastSeen: new Date().toISOString(),
      ipAddress: systemInfo.primaryIP,
      version: systemInfo.osRelease,
      metadata: {
        agentVersion: process.env.AGENT_VERSION || '1.0.0',
        lastUpdate: new Date().toISOString(),
      },
    };

    await this.cmdbClient.updateCI(this.ciId, updateData);
    logger.info('Updated CI registration', { ciId: this.ciId });
  }

  async performHealthCheck(): Promise<void> {
    try {
      const health = await this.systemMonitor.checkSystemHealth(this.config.thresholds);

      if (health.status !== 'operational') {
        logger.warn('System health degraded', {
          status: health.status,
          issues: health.issues,
        });

        // Update CI status
        await this.cmdbClient.updateCI(this.ciId, {
          status: health.status,
          metadata: {
            healthIssues: health.issues,
            lastHealthCheck: new Date().toISOString(),
          },
        });
      } else {
        logger.debug('System health check passed');
      }
    } catch (error) {
      logger.error('Health check failed', { error });
      this.errorCount++;
    }
  }

  async collectAndSendMetrics(): Promise<void> {
    try {
      const metrics = await this.systemMonitor.getSystemMetrics();
      
      const success = await this.cmdbClient.sendMetrics(this.ciId, metrics);
      
      if (success) {
        logger.debug('Metrics sent successfully', {
          cpu: metrics.cpu.usage,
          memory: metrics.memory.usagePercent,
          disk: metrics.disk.usagePercent,
        });
        this.lastSync = new Date().toISOString();
      }
    } catch (error) {
      logger.error('Failed to collect/send metrics', { error });
      this.errorCount++;
    }
  }

  async performDiscovery(): Promise<void> {
    if (!this.config.autoDiscovery) {
      return;
    }

    try {
      logger.info('Starting resource discovery...');

      const [containers, services, fileSystems] = await Promise.all([
        this.systemMonitor.discoverDockerContainers(),
        this.systemMonitor.discoverServices(),
        this.systemMonitor.discoverFileSystems(),
      ]);

      logger.info('Discovery complete', {
        containers: containers.length,
        services: services.length,
        fileSystems: fileSystems.length,
      });

      // Register discovered containers
      for (const container of containers) {
        const containerCI: CIData = {
          id: `ci-container-${container.details.id}`,
          name: container.name,
          type: 'container',
          status: container.details.state === 'running' ? 'operational' : 'down',
          environment: this.config.environment,
          owner: process.env.OWNER_TAG || 'Auto-Discovered',
          location: 'Container Runtime',
          provider: 'Docker',
          dependencies: [this.ciId],
          tags: ['container', 'docker', 'auto-discovered'],
          metadata: container.details,
          agentId: this.config.agentId,
          lastSeen: new Date().toISOString(),
        };

        await this.cmdbClient.registerCI(containerCI);
      }

      // Register discovered file systems
      for (const fs of fileSystems) {
        const fsCI: CIData = {
          id: `ci-storage-${Buffer.from(fs.name).toString('base64').substring(0, 10)}`,
          name: fs.name,
          type: 'storage',
          status: 'operational',
          environment: this.config.environment,
          owner: process.env.OWNER_TAG || 'Auto-Discovered',
          location: 'Local System',
          provider: 'File System',
          dependencies: [this.ciId],
          tags: ['storage', 'filesystem', 'auto-discovered'],
          metadata: fs.details,
          agentId: this.config.agentId,
          lastSeen: new Date().toISOString(),
        };

        await this.cmdbClient.registerCI(fsCI);
      }

      logger.info('Discovery resources registered');
    } catch (error) {
      logger.error('Discovery failed', { error });
      this.errorCount++;
    }
  }

  getStatus() {
    return {
      registered: this.registrationComplete,
      ciId: this.ciId,
      errors: this.errorCount,
      lastSync: this.lastSync,
      agentId: this.config.agentId,
      environment: this.config.environment,
    };
  }

  isHealthy(): boolean {
    return this.registrationComplete && this.errorCount < 10;
  }
}
