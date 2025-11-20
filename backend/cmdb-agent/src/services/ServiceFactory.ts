/**
 * Cross-Platform Service Factory
 * Creates appropriate service manager based on platform
 */

import os from 'os';
import path from 'path';
import { WindowsServiceManager, ServiceConfig } from './WindowsServiceManager';
import { LinuxServiceManager, SystemdServiceConfig } from './LinuxServiceManager';
import logger from '../utils/logger';

export interface AgentServiceConfig {
  serviceName: string;
  displayName: string;
  description: string;
  version: string;
  installPath: string;
}

export type ServiceManager = WindowsServiceManager | LinuxServiceManager;

export class ServiceFactory {
  /**
   * Create platform-specific service manager
   */
  static createServiceManager(config: AgentServiceConfig): ServiceManager {
    const platform = os.platform();
    
    logger.info('Creating service manager', { platform, serviceName: config.serviceName });

    switch (platform) {
      case 'win32':
        return ServiceFactory.createWindowsService(config);
      
      case 'linux':
        return ServiceFactory.createLinuxService(config);
      
      case 'darwin':
        // macOS support can be added later with launchd
        throw new Error('macOS service management not yet implemented');
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Create Windows service manager
   */
  private static createWindowsService(config: AgentServiceConfig): WindowsServiceManager {
    const execPath = path.join(config.installPath, 'cmdb-agent.exe');
    
    const serviceConfig: ServiceConfig = {
      serviceName: config.serviceName,
      displayName: config.displayName,
      description: `${config.description} (v${config.version})`,
      execPath,
      args: ['--service'],
      startType: 'auto',
      dependencies: ['Tcpip', 'Dnscache'],
    };

    return new WindowsServiceManager(serviceConfig);
  }

  /**
   * Create Linux systemd service manager
   */
  private static createLinuxService(config: AgentServiceConfig): LinuxServiceManager {
    const execPath = path.join(config.installPath, 'cmdb-agent');
    
    const serviceConfig: SystemdServiceConfig = {
      serviceName: config.serviceName,
      description: `${config.description} (v${config.version})`,
      execPath,
      args: ['--service'],
      workingDirectory: config.installPath,
      user: 'root', // Required for system monitoring
      group: 'root',
      environment: {
        NODE_ENV: 'production',
        AGENT_VERSION: config.version,
      },
      restartPolicy: 'always',
    };

    return new LinuxServiceManager(serviceConfig);
  }

  /**
   * Check if current platform supports service management
   */
  static isServiceSupported(): boolean {
    const platform = os.platform();
    return platform === 'win32' || platform === 'linux';
  }

  /**
   * Get platform name
   */
  static getPlatformName(): string {
    const platform = os.platform();
    
    switch (platform) {
      case 'win32':
        return 'Windows';
      case 'linux':
        return 'Linux';
      case 'darwin':
        return 'macOS';
      default:
        return platform;
    }
  }

  /**
   * Check if running as administrator/root
   */
  static isElevated(): boolean {
    if (os.platform() === 'win32') {
      // On Windows, check if running as admin
      try {
        require('child_process').execSync('net session', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    } else {
      // On Unix-like systems, check if running as root
      return process.getuid?.() === 0;
    }
  }
}
