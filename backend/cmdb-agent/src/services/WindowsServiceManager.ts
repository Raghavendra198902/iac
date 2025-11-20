/**
 * Windows Service Management
 * Handles Windows service installation, lifecycle, and monitoring
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface ServiceConfig {
  serviceName: string;
  displayName: string;
  description: string;
  execPath: string;
  args?: string[];
  startType: 'auto' | 'manual' | 'disabled';
  dependencies?: string[];
}

export class WindowsServiceManager {
  private config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
  }

  /**
   * Install Windows service using sc.exe
   */
  async install(): Promise<boolean> {
    try {
      logger.info('Installing Windows service...', { serviceName: this.config.serviceName });

      // Check if service already exists
      const exists = await this.isInstalled();
      if (exists) {
        logger.warn('Service already installed', { serviceName: this.config.serviceName });
        return true;
      }

      // Build command
      const binPath = this.config.args 
        ? `"${this.config.execPath}" ${this.config.args.join(' ')}`
        : `"${this.config.execPath}"`;

      const createCmd = [
        'sc.exe create',
        this.config.serviceName,
        `binPath= "${binPath}"`,
        `DisplayName= "${this.config.displayName}"`,
        `start= ${this.config.startType}`,
      ].join(' ');

      await execAsync(createCmd);

      // Set description
      const descCmd = `sc.exe description ${this.config.serviceName} "${this.config.description}"`;
      await execAsync(descCmd);

      // Configure recovery options (restart on failure)
      const recoveryCmd = `sc.exe failure ${this.config.serviceName} reset= 86400 actions= restart/5000/restart/10000/restart/30000`;
      await execAsync(recoveryCmd);

      logger.info('Windows service installed successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to install Windows service', { error: error.message });
      throw error;
    }
  }

  /**
   * Uninstall Windows service
   */
  async uninstall(): Promise<boolean> {
    try {
      logger.info('Uninstalling Windows service...', { serviceName: this.config.serviceName });

      // Stop service first
      await this.stop().catch(() => {}); // Ignore errors if not running

      // Delete service
      await execAsync(`sc.exe delete ${this.config.serviceName}`);

      logger.info('Windows service uninstalled successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to uninstall Windows service', { error: error.message });
      throw error;
    }
  }

  /**
   * Start Windows service
   */
  async start(): Promise<boolean> {
    try {
      logger.info('Starting Windows service...', { serviceName: this.config.serviceName });
      await execAsync(`sc.exe start ${this.config.serviceName}`);
      
      // Wait for service to start
      await this.waitForStatus('RUNNING', 30000);
      
      logger.info('Windows service started successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to start Windows service', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop Windows service
   */
  async stop(): Promise<boolean> {
    try {
      logger.info('Stopping Windows service...', { serviceName: this.config.serviceName });
      await execAsync(`sc.exe stop ${this.config.serviceName}`);
      
      // Wait for service to stop
      await this.waitForStatus('STOPPED', 30000);
      
      logger.info('Windows service stopped successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to stop Windows service', { error: error.message });
      throw error;
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<string> {
    try {
      const { stdout } = await execAsync(`sc.exe query ${this.config.serviceName}`);
      
      // Parse status from output
      const statusMatch = stdout.match(/STATE\s+:\s+\d+\s+(\w+)/);
      if (statusMatch) {
        return statusMatch[1];
      }
      
      return 'UNKNOWN';
    } catch (error) {
      return 'NOT_INSTALLED';
    }
  }

  /**
   * Check if service is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      await execAsync(`sc.exe query ${this.config.serviceName}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if service is running
   */
  async isRunning(): Promise<boolean> {
    const status = await this.getStatus();
    return status === 'RUNNING';
  }

  /**
   * Wait for specific service status
   */
  private async waitForStatus(expectedStatus: string, timeoutMs: number): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getStatus();
      if (status === expectedStatus) {
        return;
      }
      
      // Wait 500ms before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    throw new Error(`Timeout waiting for service status: ${expectedStatus}`);
  }

  /**
   * Configure service to run as specific user
   */
  async setServiceAccount(username: string, password: string): Promise<boolean> {
    try {
      const cmd = `sc.exe config ${this.config.serviceName} obj= "${username}" password= "${password}"`;
      await execAsync(cmd);
      logger.info('Service account configured', { serviceName: this.config.serviceName, username });
      return true;
    } catch (error: any) {
      logger.error('Failed to configure service account', { error: error.message });
      throw error;
    }
  }

  /**
   * Enable service auto-start on boot
   */
  async enableAutoStart(): Promise<boolean> {
    try {
      await execAsync(`sc.exe config ${this.config.serviceName} start= auto`);
      logger.info('Auto-start enabled', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to enable auto-start', { error: error.message });
      throw error;
    }
  }
}
