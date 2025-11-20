import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { CMDBClient } from './cmdbClient';
import { SystemMonitor } from './systemMonitor';
import { CIData, AgentConfig } from '../types';
import { ClipboardMonitor } from '../monitors/ClipboardMonitor';
import { DataLeakageMonitor } from '../monitors/DataLeakageMonitor';

export class CMDBAgent {
  private cmdbClient: CMDBClient;
  private systemMonitor: SystemMonitor;
  private clipboardMonitor: ClipboardMonitor;
  private dataLeakageMonitor: DataLeakageMonitor;
  private config: AgentConfig;
  private ciId: string;
  private registrationComplete: boolean = false;
  private errorCount: number = 0;
  private lastSync: string = '';
  private securityEventCount: number = 0;

  constructor(config: AgentConfig) {
    this.config = config;
    this.cmdbClient = new CMDBClient(
      config.cmdbApiUrl,
      config.cmdbApiKey,
      process.env.CMDB_TENANT_ID || 'default'
    );
    this.systemMonitor = new SystemMonitor();
    this.clipboardMonitor = new ClipboardMonitor();
    this.dataLeakageMonitor = new DataLeakageMonitor();
    this.ciId = `ci-${config.agentId}`;

    logger.info('CMDB Agent initialized with Data Leakage Control', {
      agentId: config.agentId,
      environment: config.environment,
      dlpEnabled: true,
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

  /**
   * Monitor for data leakage attempts
   */
  async monitorDataLeakage(): Promise<void> {
    try {
      logger.debug('Starting data leakage monitoring cycle...');

      // Monitor clipboard for sensitive data
      const clipboardEvent = await this.clipboardMonitor.monitorClipboard();
      if (clipboardEvent && clipboardEvent.severity !== 'low') {
        logger.warn('Clipboard security event', {
          eventId: clipboardEvent.id,
          severity: clipboardEvent.severity,
          patterns: clipboardEvent.sensitivePatterns.length,
        });

        // Send security event to CMDB
        await this.sendSecurityEvent('clipboard', clipboardEvent);
        this.securityEventCount++;

        // Auto-block if high severity
        if (clipboardEvent.severity === 'high') {
          await this.clipboardMonitor.blockClipboard();
          logger.info('High-severity clipboard threat blocked');
        }
      }

      // Monitor USB write operations
      const usbEvents = await this.dataLeakageMonitor.monitorUSBWrites();
      for (const usbEvent of usbEvents) {
        logger.warn('USB write operation detected', {
          eventId: usbEvent.id,
          deviceId: usbEvent.deviceId,
          sizeMB: (usbEvent.fileSize / (1024 * 1024)).toFixed(2),
          severity: usbEvent.severity,
        });

        await this.sendSecurityEvent('usb-write', usbEvent);
        this.securityEventCount++;

        // Block high-severity USB writes
        if (usbEvent.severity === 'high') {
          await this.dataLeakageMonitor.blockUSBWrite(usbEvent.deviceId);
          logger.info('High-severity USB write blocked', { deviceId: usbEvent.deviceId });
        }
      }

      // Monitor sensitive file access
      const fileAccessEvents = await this.dataLeakageMonitor.monitorFileAccess();
      for (const fileEvent of fileAccessEvents) {
        if (fileEvent.severity !== 'low') {
          logger.info('Sensitive file access detected', {
            eventId: fileEvent.id,
            filePath: fileEvent.filePath,
            severity: fileEvent.severity,
          });

          await this.sendSecurityEvent('file-access', fileEvent);
          this.securityEventCount++;
        }
      }

      // Monitor network exfiltration attempts
      const networkEvents = await this.dataLeakageMonitor.monitorNetworkExfiltration();
      for (const netEvent of networkEvents) {
        logger.warn('Suspicious network activity detected', {
          eventId: netEvent.id,
          process: netEvent.processName,
          remoteAddress: netEvent.remoteAddress,
          remotePort: netEvent.remotePort,
          severity: netEvent.severity,
        });

        await this.sendSecurityEvent('network-exfiltration', netEvent);
        this.securityEventCount++;

        // Block high-severity network threats
        if (netEvent.severity === 'high' && netEvent.isAnomaly) {
          await this.dataLeakageMonitor.blockProcessNetwork(netEvent.pid, netEvent.processName);
          logger.info('High-severity network threat blocked', { 
            process: netEvent.processName,
            pid: netEvent.pid,
          });
        }
      }

      logger.debug('Data leakage monitoring cycle complete', {
        clipboardEvents: clipboardEvent ? 1 : 0,
        usbEvents: usbEvents.length,
        fileEvents: fileAccessEvents.length,
        networkEvents: networkEvents.length,
      });
    } catch (error) {
      logger.error('Data leakage monitoring failed', { error });
      this.errorCount++;
    }
  }

  /**
   * Send security event to CMDB
   */
  private async sendSecurityEvent(eventType: string, eventData: any): Promise<void> {
    try {
      const securityPayload = {
        ciId: this.ciId,
        eventType,
        severity: eventData.severity,
        timestamp: eventData.timestamp,
        eventId: eventData.id,
        details: eventData,
      };

      // Send to CMDB API
      await this.cmdbClient.sendSecurityEvent(securityPayload);
      logger.debug('Security event sent to CMDB', { eventType, eventId: eventData.id });
    } catch (error) {
      logger.error('Failed to send security event', { error, eventType });
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
    const clipboardStatus = this.clipboardMonitor.getStatus();
    const dlpStatus = this.dataLeakageMonitor.getStatus();

    return {
      registered: this.registrationComplete,
      ciId: this.ciId,
      errors: this.errorCount,
      lastSync: this.lastSync,
      agentId: this.config.agentId,
      environment: this.config.environment,
      security: {
        totalEvents: this.securityEventCount,
        clipboardMonitoring: clipboardStatus.enabled,
        usbDevicesMonitored: dlpStatus.usbDevices,
        sensitiveFolders: dlpStatus.sensitiveFolders,
        networkConnections: dlpStatus.networkConnections,
      },
    };
  }

  isHealthy(): boolean {
    return this.registrationComplete && this.errorCount < 10;
  }

  /**
   * Get data leakage monitoring statistics
   */
  getSecurityStats() {
    return {
      totalSecurityEvents: this.securityEventCount,
      clipboardMonitor: this.clipboardMonitor.getStatus(),
      dataLeakageMonitor: this.dataLeakageMonitor.getStatus(),
    };
  }
}

