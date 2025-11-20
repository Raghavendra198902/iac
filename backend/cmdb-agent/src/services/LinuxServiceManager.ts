/**
 * Linux Service Management (systemd)
 * Handles Linux systemd service installation, lifecycle, and monitoring
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface SystemdServiceConfig {
  serviceName: string;
  description: string;
  execPath: string;
  args?: string[];
  workingDirectory: string;
  user?: string;
  group?: string;
  environment?: Record<string, string>;
  restartPolicy: 'always' | 'on-failure' | 'no';
}

export class LinuxServiceManager {
  private config: SystemdServiceConfig;
  private serviceFilePath: string;

  constructor(config: SystemdServiceConfig) {
    this.config = config;
    this.serviceFilePath = `/etc/systemd/system/${config.serviceName}.service`;
  }

  /**
   * Generate systemd service unit file content
   */
  private generateServiceFile(): string {
    const execStart = this.config.args
      ? `${this.config.execPath} ${this.config.args.join(' ')}`
      : this.config.execPath;

    const envVars = this.config.environment
      ? Object.entries(this.config.environment)
          .map(([key, value]) => `Environment="${key}=${value}"`)
          .join('\n')
      : '';

    return `[Unit]
Description=${this.config.description}
After=network.target
Documentation=https://cmdb-agent.example.com

[Service]
Type=simple
ExecStart=${execStart}
WorkingDirectory=${this.config.workingDirectory}
${this.config.user ? `User=${this.config.user}` : ''}
${this.config.group ? `Group=${this.config.group}` : ''}
${envVars}

# Restart configuration
Restart=${this.config.restartPolicy}
RestartSec=10
StartLimitInterval=60
StartLimitBurst=3

# Security hardening
PrivateTmp=true
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=${this.config.workingDirectory}

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${this.config.serviceName}

[Install]
WantedBy=multi-user.target
`;
  }

  /**
   * Install systemd service
   */
  async install(): Promise<boolean> {
    try {
      logger.info('Installing systemd service...', { serviceName: this.config.serviceName });

      // Check if service already exists
      const exists = await this.isInstalled();
      if (exists) {
        logger.warn('Service already installed', { serviceName: this.config.serviceName });
        return true;
      }

      // Ensure working directory exists with proper permissions
      try {
        await fs.access(this.config.workingDirectory);
        logger.info('Working directory exists', { path: this.config.workingDirectory });
      } catch {
        logger.warn('Working directory does not exist - service may fail to start', { 
          path: this.config.workingDirectory 
        });
      }

      // Ensure executable exists and is executable
      try {
        await fs.access(this.config.execPath, fs.constants.X_OK);
        logger.info('Executable is accessible', { path: this.config.execPath });
      } catch {
        throw new Error(`Executable not found or not executable: ${this.config.execPath}`);
      }

      // Generate and write service file
      const serviceContent = this.generateServiceFile();
      await fs.writeFile(this.serviceFilePath, serviceContent, { mode: 0o644 });

      // Reload systemd daemon
      await execAsync('systemctl daemon-reload');

      // Enable service to start on boot
      await execAsync(`systemctl enable ${this.config.serviceName}`);

      logger.info('Systemd service installed successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to install systemd service', { error: error.message });
      throw error;
    }
  }

  /**
   * Uninstall systemd service
   */
  async uninstall(): Promise<boolean> {
    try {
      logger.info('Uninstalling systemd service...', { serviceName: this.config.serviceName });

      // Stop service first
      await this.stop().catch(() => {}); // Ignore errors if not running

      // Disable service
      await execAsync(`systemctl disable ${this.config.serviceName}`).catch(() => {});

      // Remove service file
      await fs.unlink(this.serviceFilePath).catch(() => {});

      // Reload systemd daemon
      await execAsync('systemctl daemon-reload');

      // Reset failed state
      await execAsync(`systemctl reset-failed ${this.config.serviceName}`).catch(() => {});

      logger.info('Systemd service uninstalled successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to uninstall systemd service', { error: error.message });
      throw error;
    }
  }

  /**
   * Start systemd service
   */
  async start(): Promise<boolean> {
    try {
      logger.info('Starting systemd service...', { serviceName: this.config.serviceName });
      await execAsync(`systemctl start ${this.config.serviceName}`);

      // Wait for service to start
      await this.waitForStatus('active', 30000);

      logger.info('Systemd service started successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to start systemd service', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop systemd service
   */
  async stop(): Promise<boolean> {
    try {
      logger.info('Stopping systemd service...', { serviceName: this.config.serviceName });
      await execAsync(`systemctl stop ${this.config.serviceName}`);

      // Wait for service to stop
      await this.waitForStatus('inactive', 30000);

      logger.info('Systemd service stopped successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to stop systemd service', { error: error.message });
      throw error;
    }
  }

  /**
   * Restart systemd service
   */
  async restart(): Promise<boolean> {
    try {
      logger.info('Restarting systemd service...', { serviceName: this.config.serviceName });
      await execAsync(`systemctl restart ${this.config.serviceName}`);
      
      await this.waitForStatus('active', 30000);
      
      logger.info('Systemd service restarted successfully', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to restart systemd service', { error: error.message });
      throw error;
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<string> {
    try {
      const { stdout } = await execAsync(`systemctl is-active ${this.config.serviceName}`);
      return stdout.trim();
    } catch (error: any) {
      // Service might not be installed or inactive
      return error.stdout?.trim() || 'unknown';
    }
  }

  /**
   * Check if service is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      await fs.access(this.serviceFilePath);
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
    return status === 'active';
  }

  /**
   * Get service logs
   */
  async getLogs(lines: number = 100): Promise<string> {
    try {
      const { stdout } = await execAsync(`journalctl -u ${this.config.serviceName} -n ${lines} --no-pager`);
      return stdout;
    } catch (error: any) {
      logger.error('Failed to get service logs', { error: error.message });
      return '';
    }
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
   * Enable service to start on boot
   */
  async enableAutoStart(): Promise<boolean> {
    try {
      await execAsync(`systemctl enable ${this.config.serviceName}`);
      logger.info('Auto-start enabled', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to enable auto-start', { error: error.message });
      throw error;
    }
  }

  /**
   * Disable service from starting on boot
   */
  async disableAutoStart(): Promise<boolean> {
    try {
      await execAsync(`systemctl disable ${this.config.serviceName}`);
      logger.info('Auto-start disabled', { serviceName: this.config.serviceName });
      return true;
    } catch (error: any) {
      logger.error('Failed to disable auto-start', { error: error.message });
      throw error;
    }
  }
}
