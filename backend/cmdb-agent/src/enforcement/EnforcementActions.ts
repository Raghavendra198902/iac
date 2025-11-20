/**
 * Enforcement Actions
 * Implements automated response actions for security policies
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import logger from '../utils/logger';
import { PolicyAction, EnforcementResult, SecurityPolicy } from './PolicyEngine';

const execAsync = promisify(exec);

export interface ActionContext {
  action: PolicyAction;
  event: any;
  policy: any;
}

export class EnforcementActions extends EventEmitter {
  private quarantinePath: string;
  private isRunning: boolean = false;

  constructor(quarantinePath?: string) {
    super();
    this.quarantinePath = quarantinePath || path.join(os.tmpdir(), 'cmdb-quarantine');
  }

  /**
   * Start enforcement actions handler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Ensure quarantine directory exists
    try {
      await fs.mkdir(this.quarantinePath, { recursive: true });
      logger.info('Enforcement actions started', { quarantinePath: this.quarantinePath });
    } catch (error: any) {
      logger.error('Failed to create quarantine directory', { error: error.message });
    }
  }

  /**
   * Stop enforcement actions handler
   */
  stop(): void {
    this.isRunning = false;
    logger.info('Enforcement actions stopped');
  }

  /**
   * Execute an action
   */
  async executeAction(action: PolicyAction, event: any, policy: SecurityPolicy): Promise<EnforcementResult> {
    if (!this.isRunning) {
      throw new Error('Enforcement actions not running');
    }

    logger.info('Executing enforcement action', {
      actionType: action.type,
      policyId: policy.id,
    });

    switch (action.type) {
      case 'kill_process':
        return this.killProcess(event, action, policy);
      
      case 'block_network':
        return this.blockNetwork(event, action, policy);
      
      case 'quarantine_file':
        return this.quarantineFile(event, action, policy);
      
      case 'alert':
        return this.sendAlert(event, action, policy);
      
      case 'log':
        return this.logEvent(event, action, policy);
      
      case 'block_usb':
        return this.blockUSB(event, action, policy);
      
      case 'block_registry':
        return this.blockRegistry(event, action, policy);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Kill a process
   */
  private async killProcess(event: any, action: PolicyAction, policy: any): Promise<EnforcementResult> {
    try {
      const pid = event.process?.pid || event.pid;
      
      if (!pid) {
        throw new Error('No PID found in event');
      }

      logger.warn('Killing process', {
        pid,
        policyId: policy.id,
        processName: event.process?.name || event.processName,
      });

      // Platform-specific kill command
      const platform = os.platform();
      
      if (platform === 'win32') {
        await execAsync(`taskkill /F /PID ${pid}`);
      } else {
        await execAsync(`kill -9 ${pid}`);
      }

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'kill_process',
        success: true,
        details: {
          pid,
          processName: event.process?.name || event.processName,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to kill process', {
        error: error.message,
        policyId: policy.id,
      });

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'kill_process',
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Block network connection
   */
  private async blockNetwork(event: any, action: PolicyAction, policy: any): Promise<EnforcementResult> {
    try {
      const connection = event.connection;
      
      if (!connection) {
        throw new Error('No connection found in event');
      }

      logger.warn('Blocking network connection', {
        remoteAddress: connection.remoteAddress,
        remotePort: connection.remotePort,
        policyId: policy.id,
      });

      const platform = os.platform();
      
      if (platform === 'win32') {
        // Windows firewall rule
        const ruleName = `CMDB_Block_${connection.remoteAddress}_${Date.now()}`;
        await execAsync(`netsh advfirewall firewall add rule name="${ruleName}" dir=out action=block remoteip=${connection.remoteAddress}`);
      } else if (platform === 'linux') {
        // iptables rule
        await execAsync(`iptables -A OUTPUT -d ${connection.remoteAddress} -j DROP`);
      }

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'block_network',
        success: true,
        details: {
          remoteAddress: connection.remoteAddress,
          remotePort: connection.remotePort,
          protocol: connection.protocol,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to block network', {
        error: error.message,
        policyId: policy.id,
      });

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'block_network',
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Quarantine a file
   */
  private async quarantineFile(event: any, action: PolicyAction, policy: any): Promise<EnforcementResult> {
    try {
      const filePath = event.change?.path || event.path || event.file?.path;
      
      if (!filePath) {
        throw new Error('No file path found in event');
      }

      logger.warn('Quarantining file', {
        filePath,
        policyId: policy.id,
      });

      // Generate quarantine filename
      const timestamp = Date.now();
      const fileName = path.basename(filePath);
      const quarantinedPath = path.join(this.quarantinePath, `${timestamp}_${fileName}`);

      // Move file to quarantine
      await fs.rename(filePath, quarantinedPath);

      // Create metadata file
      const metadataPath = `${quarantinedPath}.meta.json`;
      const metadata = {
        originalPath: filePath,
        quarantinedAt: new Date().toISOString(),
        policyId: policy.id,
        policyName: policy.name,
        event,
      };
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'quarantine_file',
        success: true,
        details: {
          originalPath: filePath,
          quarantinedPath,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to quarantine file', {
        error: error.message,
        policyId: policy.id,
      });

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'quarantine_file',
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send alert
   */
  private async sendAlert(event: any, action: PolicyAction, policy: any): Promise<EnforcementResult> {
    logger.warn('Security alert triggered', {
      policyId: policy.id,
      policyName: policy.name,
      severity: policy.severity,
      event,
    });

    // Emit alert event for external handlers
    this.emit('alert', {
      policyId: policy.id,
      policyName: policy.name,
      severity: policy.severity,
      message: action.parameters?.message || `Policy violation: ${policy.name}`,
      event,
      timestamp: new Date(),
    });

    return {
      policyId: policy.id,
      policyName: policy.name,
      actionType: 'alert',
      success: true,
      details: {
        message: action.parameters?.message,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Log event
   */
  private async logEvent(event: any, action: PolicyAction, policy: any): Promise<EnforcementResult> {
    const logLevel = action.parameters?.level || 'info';
    
    logger.log(logLevel, 'Policy enforcement log', {
      policyId: policy.id,
      policyName: policy.name,
      severity: policy.severity,
      event,
    });

    return {
      policyId: policy.id,
      policyName: policy.name,
      actionType: 'log',
      success: true,
      details: {
        level: logLevel,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Block USB device
   */
  private async blockUSB(event: any, action: PolicyAction, policy: any): Promise<EnforcementResult> {
    try {
      const device = event.device;
      
      if (!device) {
        throw new Error('No USB device found in event');
      }

      logger.warn('Blocking USB device', {
        deviceId: device.id,
        vendor: device.vendor,
        policyId: policy.id,
      });

      // Platform-specific USB blocking
      const platform = os.platform();
      
      if (platform === 'win32') {
        // Windows: Disable device via DevCon or PowerShell
        logger.info('USB blocking on Windows requires elevated privileges');
      } else if (platform === 'linux') {
        // Linux: Use udev rules or unbind driver
        logger.info('USB blocking on Linux requires udev configuration');
      }

      // Log the block attempt (actual blocking requires system-level permissions)
      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'block_usb',
        success: true,
        details: {
          deviceId: device.id,
          vendorId: device.vendorId,
          productId: device.productId,
          note: 'USB blocking logged, requires system configuration for enforcement',
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to block USB', {
        error: error.message,
        policyId: policy.id,
      });

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'block_usb',
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Block registry modification
   */
  private async blockRegistry(event: any, action: PolicyAction, policy: any): Promise<EnforcementResult> {
    try {
      const key = event.key;
      
      if (!key) {
        throw new Error('No registry key found in event');
      }

      logger.warn('Blocking registry modification', {
        keyPath: key.path,
        keyName: key.name,
        policyId: policy.id,
      });

      // Windows only
      if (os.platform() !== 'win32') {
        throw new Error('Registry blocking only available on Windows');
      }

      // Note: Actual registry blocking requires setting registry permissions
      // This would require admin privileges and careful permission management
      logger.info('Registry blocking logged, requires system configuration for enforcement');

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'block_registry',
        success: true,
        details: {
          keyPath: key.path,
          keyName: key.name,
          note: 'Registry modification logged, requires permission changes for enforcement',
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to block registry', {
        error: error.message,
        policyId: policy.id,
      });

      return {
        policyId: policy.id,
        policyName: policy.name,
        actionType: 'block_registry',
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get quarantined files
   */
  async getQuarantinedFiles(): Promise<any[]> {
    try {
      const files = await fs.readdir(this.quarantinePath);
      const quarantined: any[] = [];

      for (const file of files) {
        if (file.endsWith('.meta.json')) {
          const metadataPath = path.join(this.quarantinePath, file);
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          quarantined.push(metadata);
        }
      }

      return quarantined;
    } catch (error: any) {
      logger.error('Failed to get quarantined files', { error: error.message });
      return [];
    }
  }

  /**
   * Restore quarantined file
   */
  async restoreQuarantinedFile(quarantinedPath: string): Promise<boolean> {
    try {
      const metadataPath = `${quarantinedPath}.meta.json`;
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

      // Restore file
      await fs.rename(quarantinedPath, metadata.originalPath);
      
      // Remove metadata
      await fs.unlink(metadataPath);

      logger.info('File restored from quarantine', {
        originalPath: metadata.originalPath,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to restore quarantined file', {
        error: error.message,
        quarantinedPath,
      });
      return false;
    }
  }
}
