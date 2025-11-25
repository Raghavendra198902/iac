/**
 * Enterprise CMDB Agent - Main Application with Service Support
 * Comprehensive endpoint monitoring, enforcement, and telemetry
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ServiceFactory } from './services/ServiceFactory';
import { ProcessMonitor } from './monitors/ProcessMonitor';
import { USBMonitor } from './monitors/USBMonitor';
import { NetworkMonitor } from './monitors/NetworkMonitor';
import { RegistryMonitor } from './monitors/RegistryMonitor';
import { FileSystemMonitor } from './monitors/FileSystemMonitor';
import { AutoUpgradeManager, UpdateConfig } from './services/AutoUpgradeManager';
import { PolicyEngine, EnforcementEvent, EnforcementResult } from './enforcement/PolicyEngine';
import { EnforcementActions } from './enforcement/EnforcementActions';
import { getDefaultPolicies } from './enforcement/DefaultPolicies';
import { AutoUpdater } from './services/auto-updater';
import logger from './utils/logger';

export interface EnterpriseAgentConfig {
  version: string;
  agentName: string;
  organizationId?: string;
  apiServerUrl: string;
  autoUpdate: boolean;
  updateCheckIntervalHours: number;
  monitoring: {
    processes: boolean;
    registry: boolean;
    usb: boolean;
    network: boolean;
    filesystem: boolean;
  };
  telemetry: {
    batchSize: number;
    flushIntervalSeconds: number;
  };
}

export class EnterpriseAgent extends EventEmitter {
  private config: EnterpriseAgentConfig;
  private installPath: string;
  private isRunning: boolean = false;
  private processMonitor?: ProcessMonitor;
  private usbMonitor?: USBMonitor;
  private networkMonitor?: NetworkMonitor;
  private registryMonitor?: RegistryMonitor;
  private filesystemMonitor?: FileSystemMonitor;
  private policyEngine?: PolicyEngine;
  private enforcementActions?: EnforcementActions;
  private upgradeManager?: AutoUpgradeManager;
  private autoUpdater?: AutoUpdater;
  private telemetryQueue: any[] = [];
  private telemetryTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(installPath: string) {
    super();
    this.installPath = installPath;
    this.config = this.loadDefaultConfig();
  }

  /**
   * Initialize agent
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Enterprise CMDB Agent...', { version: this.config.version });

      // Load configuration
      await this.loadConfiguration();

      // Validate configuration
      this.validateConfiguration();

      // Initialize components
      await this.initializeComponents();

      logger.info('Enterprise CMDB Agent initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize agent', { error: error.message });
      throw error;
    }
  }

  /**
   * Start agent
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Agent already running');
      return;
    }

    try {
      logger.info('Starting Enterprise CMDB Agent...', {
        agentName: this.config.agentName,
        apiServer: this.config.apiServerUrl,
      });

      this.isRunning = true;

      // Start monitoring subsystems
      await this.startMonitoring();

      // Start telemetry collection
      this.startTelemetry();

      // Start heartbeat
      this.startHeartbeat();

      // Start auto-upgrade manager (legacy)
      if (this.config.autoUpdate && this.upgradeManager) {
        this.upgradeManager.start();
      }

      // Start auto-updater (new system)
      if (this.config.autoUpdate && this.autoUpdater) {
        logger.info('Starting auto-updater with monitoring...');
        this.autoUpdater.start();
        
        // Monitor update events
        this.emit('monitoring:update-check', {
          timestamp: new Date().toISOString(),
          enabled: true,
        });
      }

      // Send initial heartbeat
      await this.sendHeartbeat();

      logger.info('Enterprise CMDB Agent started successfully');
      this.emit('started');
    } catch (error: any) {
      this.isRunning = false;
      logger.error('Failed to start agent', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop agent
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      logger.info('Stopping Enterprise CMDB Agent...');

      this.isRunning = false;

      // Stop heartbeat
      this.stopHeartbeat();

      // Stop monitoring
      await this.stopMonitoring();

      // Stop telemetry
      this.stopTelemetry();

      // Stop auto-upgrade manager
      if (this.upgradeManager) {
        this.upgradeManager.stop();
      }

      // Stop auto-updater
      if (this.autoUpdater) {
        logger.info('Stopping auto-updater...');
        // Auto-updater will stop automatically on process exit
      }

      // Flush remaining telemetry
      await this.flushTelemetry();

      logger.info('Enterprise CMDB Agent stopped');
      this.emit('stopped');
    } catch (error: any) {
      logger.error('Error stopping agent', { error: error.message });
      throw error;
    }
  }

  /**
   * Load default configuration
   */
  private loadDefaultConfig(): EnterpriseAgentConfig {
    return {
      version: '1.0.0',
      agentName: os.hostname(),
      apiServerUrl: 'http://localhost:3000',
      autoUpdate: true,
      updateCheckIntervalHours: 24,
      monitoring: {
        processes: true,
        registry: true,
        usb: true,
        network: true,
        filesystem: true,
      },
      telemetry: {
        batchSize: 100,
        flushIntervalSeconds: 60,
      },
    };
  }

  /**
   * Load configuration from file
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const configPath = path.join(this.installPath, 'config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const fileConfig = JSON.parse(configData);

      // Merge with defaults
      this.config = { ...this.config, ...fileConfig };

      logger.info('Configuration loaded', { configPath });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.warn('Configuration file not found, using defaults');
        await this.saveConfiguration();
      } else {
        throw error;
      }
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfiguration(): Promise<void> {
    const configPath = path.join(this.installPath, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
    logger.info('Configuration saved', { configPath });
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    if (!this.config.apiServerUrl) {
      throw new Error('API server URL is required');
    }

    if (!this.config.agentName) {
      throw new Error('Agent name is required');
    }

    logger.info('Configuration validated');
  }

  /**
   * Initialize components
   */
  private async initializeComponents(): Promise<void> {
    // Initialize enforcement components
    this.enforcementActions = new EnforcementActions();
    this.policyEngine = new PolicyEngine();

    // Initialize auto-updater
    this.autoUpdater = new AutoUpdater(
      this.config.apiServerUrl,
      this.config.version,
      this.config.updateCheckIntervalHours * 3600000,
      process.env.CMDB_API_KEY
    );

    // Load default policies
    const defaultPolicies = getDefaultPolicies();
    defaultPolicies.forEach(policy => {
      this.policyEngine!.addPolicy(policy);
    });

    // Connect policy engine to enforcement actions
    this.policyEngine.on('action_requested', async ({ action, event, policy, result }) => {
      const enforcementResult = await this.enforcementActions!.executeAction(action, event, policy);
      logger.info('Enforcement action executed', {
        policyId: policy.id,
        policyName: policy.name,
        actionType: action.type,
        success: enforcementResult.success,
      });
    });

    // Monitor enforcement events and send to API
    this.policyEngine.on('enforcement', (enforcementEvent: EnforcementEvent) => {
      // Queue to telemetry (already has type and timestamp)
      this.queueTelemetry(enforcementEvent);

      // Send enforcement events immediately to API
      this.sendEnforcementEvents([enforcementEvent]).catch(err => {
        logger.error('Failed to send enforcement event', { error: err.message });
      });
    });

    // Monitor enforcement actions
    this.enforcementActions.on('enforcement', (data) => {
      this.queueTelemetry({
        type: 'enforcement',
        timestamp: new Date().toISOString(),
        ...data,
      });
    });

    logger.info('Enforcement engine initialized', {
      totalPolicies: this.policyEngine.getPolicies().length,
      enabledPolicies: this.policyEngine.getPolicies().filter(p => p.enabled).length,
    });

    // Initialize process monitor
    if (this.config.monitoring.processes) {
      this.processMonitor = new ProcessMonitor();
      this.processMonitor.on('process_event', (event) => {
        this.queueTelemetry(event);
        // Evaluate against policies
        this.policyEngine?.evaluateEvent(event, 'process_event');
      });
      logger.info('Process monitor initialized');
    }

    // Initialize USB monitor
    if (this.config.monitoring.usb) {
      this.usbMonitor = new USBMonitor();
      this.usbMonitor.on('usb_event', (event) => {
        this.queueTelemetry(event);
        // Evaluate against policies
        this.policyEngine?.evaluateEvent(event, 'usb_event');
      });
      logger.info('USB monitor initialized');
    }

    // Initialize network monitor
    if (this.config.monitoring.network) {
      this.networkMonitor = new NetworkMonitor();
      this.networkMonitor.on('network_event', (event) => {
        this.queueTelemetry(event);
        // Evaluate against policies
        this.policyEngine?.evaluateEvent(event, 'network_event');
      });
      logger.info('Network monitor initialized');
    }

    // Initialize registry monitor (Windows only)
    if (this.config.monitoring.registry && os.platform() === 'win32') {
      this.registryMonitor = new RegistryMonitor();
      this.registryMonitor.on('registry_event', (event) => {
        this.queueTelemetry(event);
        // Evaluate against policies
        this.policyEngine?.evaluateEvent(event, 'registry_event');
      });
      logger.info('Registry monitor initialized');
    }

    // Initialize filesystem monitor
    if (this.config.monitoring.filesystem) {
      this.filesystemMonitor = new FileSystemMonitor();
      this.filesystemMonitor.on('filesystem_event', (event) => {
        this.queueTelemetry(event);
        // Evaluate against policies
        this.policyEngine?.evaluateEvent(event, 'filesystem_event');
      });
      logger.info('Filesystem monitor initialized');
    }

    // Initialize auto-upgrade manager
    if (this.config.autoUpdate) {
      const updateConfig: UpdateConfig = {
        apiBaseUrl: this.config.apiServerUrl,
        currentVersion: this.config.version,
        installPath: this.installPath,
        checkIntervalHours: this.config.updateCheckIntervalHours,
        autoInstall: true,
      };

      this.upgradeManager = new AutoUpgradeManager(updateConfig);

      // Listen to update events
      this.upgradeManager.on('update_available', (info) => {
        logger.info('Update available', { version: info.version });
        this.emit('update_available', info);
      });

      this.upgradeManager.on('download_progress', (progress) => {
        logger.debug('Download progress', progress);
      });

      this.upgradeManager.on('install_complete', (info) => {
        logger.info('Update installed', { version: info.version });
        this.emit('update_installed', info);
      });
    }
  }

  /**
   * Start monitoring subsystems
   */
  private async startMonitoring(): Promise<void> {
    logger.info('Starting monitoring subsystems...');

    // Start enforcement engine
    if (this.policyEngine) {
      this.policyEngine.start();
      logger.info('Policy engine started');
    }

    if (this.enforcementActions) {
      await this.enforcementActions.start();
      logger.info('Enforcement actions started');
    }

    // Start process monitoring
    if (this.processMonitor && this.config.monitoring.processes) {
      await this.processMonitor.start();
      logger.info('Process monitoring started');
    }

    // Start USB monitoring
    if (this.usbMonitor && this.config.monitoring.usb) {
      this.usbMonitor.start();
      logger.info('USB monitoring started');
    }

    // Start network monitoring
    if (this.networkMonitor && this.config.monitoring.network) {
      await this.networkMonitor.start();
      logger.info('Network monitoring started');
    }

    // Start registry monitoring (Windows only)
    if (this.registryMonitor && this.config.monitoring.registry) {
      await this.registryMonitor.start();
      logger.info('Registry monitoring started');
    }

    // Start filesystem monitoring
    if (this.filesystemMonitor && this.config.monitoring.filesystem) {
      await this.filesystemMonitor.start();
      logger.info('Filesystem monitoring started');
    }

    logger.info('All monitoring subsystems started');
  }

  /**
   * Stop monitoring subsystems
   */
  private async stopMonitoring(): Promise<void> {
    logger.info('Stopping monitoring subsystems...');

    if (this.processMonitor) {
      await this.processMonitor.stop();
    }

    if (this.usbMonitor) {
      this.usbMonitor.stop();
    }

    if (this.networkMonitor) {
      this.networkMonitor.stop();
    }

    if (this.registryMonitor) {
      this.registryMonitor.stop();
    }

    if (this.filesystemMonitor) {
      this.filesystemMonitor.stop();
    }

    if (this.policyEngine) {
      this.policyEngine.stop();
    }

    if (this.enforcementActions) {
      this.enforcementActions.stop();
    }

    logger.info('All monitoring subsystems stopped');
  }

  /**
   * Start telemetry collection
   */
  private startTelemetry(): void {
    const flushIntervalMs = this.config.telemetry.flushIntervalSeconds * 1000;

    this.telemetryTimer = setInterval(() => {
      this.flushTelemetry().catch((error) => {
        logger.error('Failed to flush telemetry', { error: error.message });
      });
    }, flushIntervalMs);

    logger.info('Telemetry collection started', {
      flushInterval: `${this.config.telemetry.flushIntervalSeconds}s`,
    });
  }

  /**
   * Stop telemetry collection
   */
  private stopTelemetry(): void {
    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = undefined;
    }

    logger.info('Telemetry collection stopped');
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    // Send heartbeat every 5 minutes
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat().catch((error) => {
        logger.error('Failed to send heartbeat', { error: error.message });
      });
    }, 5 * 60 * 1000);

    logger.info('Heartbeat started');
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    logger.info('Heartbeat stopped');
  }

  /**
   * Queue telemetry event
   */
  private queueTelemetry(event: any): void {
    this.telemetryQueue.push(event);

    // Auto-flush if batch size reached
    if (this.telemetryQueue.length >= this.config.telemetry.batchSize) {
      this.flushTelemetry().catch((error) => {
        logger.error('Failed to flush telemetry', { error: error.message });
      });
    }
  }

  /**
   * Flush telemetry to API server
   */
  private async flushTelemetry(): Promise<void> {
    if (this.telemetryQueue.length === 0) {
      return;
    }

    const events = [...this.telemetryQueue];
    this.telemetryQueue = [];

    try {
      logger.debug('Flushing telemetry', { count: events.length });

      // Send to API server
      await this.sendTelemetry(events);

      logger.debug('Telemetry flushed successfully');
    } catch (error: any) {
      logger.error('Failed to send telemetry', { error: error.message });

      // Re-queue events (with size limit)
      if (this.telemetryQueue.length < 1000) {
        this.telemetryQueue.unshift(...events);
      }
    }
  }

  /**
   * Send telemetry to API server
   */
  private async sendTelemetry(events: any[]): Promise<void> {
    const url = `${this.config.apiServerUrl}/api/telemetry`;
    const protocol = url.startsWith('https') ? require('https') : require('http');

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        agentName: this.config.agentName,
        organizationId: this.config.organizationId,
        timestamp: new Date().toISOString(),
        events,
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 30000,
      };

      const req = protocol.request(url, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  /**
   * Send heartbeat
   */
  private async sendHeartbeat(): Promise<void> {
    const heartbeat = {
      type: 'heartbeat',
      timestamp: new Date(),
      agentName: this.config.agentName,
      version: this.config.version,
      platform: os.platform(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'unknown',
      },
    };

    this.queueTelemetry(heartbeat);
  }

  /**
   * Send enforcement events to API server
   */
  private async sendEnforcementEvents(events: EnforcementEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      agentName: this.config.agentName,
      organizationId: this.config.organizationId,
      timestamp: new Date().toISOString(),
      events,
    });

    const url = new URL(`${this.config.apiServerUrl}/api/enforcement/events`);
    const protocol = url.protocol === 'https:' ? require('https') : require('http');

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = protocol.request(url, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  /**
   * Get agent status
   */
  getStatus() {
    const policyStats = this.policyEngine?.getStats();
    
    return {
      running: this.isRunning,
      version: this.config.version,
      agentName: this.config.agentName,
      monitoring: {
        processes: this.processMonitor?.getProcessCount() || 0,
      },
      telemetry: {
        queueSize: this.telemetryQueue.length,
      },
      policyStats: policyStats || undefined,
    };
  }
}

/**
 * Main entry point
 */
async function mainEnterprise() {
  const isServiceMode = process.argv.includes('--service');
  const installPath = process.env.AGENT_INSTALL_PATH || process.cwd();

  logger.info('Enterprise CMDB Agent starting', {
    mode: isServiceMode ? 'service' : 'standalone',
    installPath,
    platform: os.platform(),
    node: process.version,
  });

  const agent = new EnterpriseAgent(installPath);

  // Initialize and start agent
  await agent.initialize();
  await agent.start();

  // Handle shutdown signals
  const shutdown = async () => {
    logger.info('Shutdown signal received');
    await agent.stop();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Keep process alive and log status
  setInterval(() => {
    const status = agent.getStatus();
    logger.debug('Agent status', status);
  }, 60000);
}

// Export for use as module
export default EnterpriseAgent;

// Run if executed directly
if (require.main === module) {
  mainEnterprise().catch((error) => {
    logger.error('Fatal error', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}
