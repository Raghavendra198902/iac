import logger from '../utils/logger';

#!/usr/bin/env node

/**
 * Universal Pro Agent Launcher
 * 
 * Automatically detects platform and launches the appropriate Pro Agent
 * 
 * Supported Platforms:
 * - Windows (10, 11, Server 2016+)
 * - macOS (10.13+, Apple Silicon)
 * - Linux (Ubuntu, RHEL, Debian, etc.)
 * - Android (via Termux or ADB)
 * - iOS (Jailbroken or MDM)
 */

import os from 'os';
import { execSync } from 'child_process';
import ProWindowsAgent from './ProWindowsAgent';
import ProMacOSAgent from './ProMacOSAgent';
import ProAndroidAgent from './ProAndroidAgent';

class UniversalProAgent {
  private platform: string;
  private agent: any;
  private agentName: string = '';

  constructor() {
    logger.info('🌍 Universal Pro Agent Launcher v2.0');
    logger.info('=====================================');
    
    this.platform = this.detectPlatform();
    logger.info(`📱 Detected Platform: ${this.platform.toUpperCase()}`);
    
    this.agent = this.initializeAgent();
  }

  private detectPlatform(): string {
    const platform = os.platform();
    
    // Check for Android
    if (this.isAndroid()) {
      return 'android';
    }
    
    // Check for iOS (jailbroken)
    if (this.isiOS()) {
      return 'ios';
    }

    // Standard platform detection
    switch (platform) {
      case 'win32':
        return 'windows';
      case 'darwin':
        return 'macos';
      case 'linux':
        return 'linux';
      case 'freebsd':
        return 'freebsd';
      case 'sunos':
        return 'solaris';
      case 'aix':
        return 'aix';
      default:
        return 'unknown';
    }
  }

  private isAndroid(): boolean {
    try {
      return (
        process.env.ANDROID_ROOT !== undefined ||
        process.env.ANDROID_DATA !== undefined ||
        (os.platform() === 'linux' && process.env.TERMUX_VERSION !== undefined)
      );
    } catch (error) {
      return false;
    }
  }

  private isiOS(): boolean {
    try {
      const fs = require('fs');
      return (
        os.platform() === 'darwin' &&
        (
          fs.existsSync('/Applications/Cydia.app') ||
          fs.existsSync('/private/var/mobile') ||
          fs.existsSync('/.installed_unc0ver')
        )
      );
    } catch (error) {
      return false;
    }
  }

  private initializeAgent(): any {
    switch (this.platform) {
      case 'windows':
        logger.info('🪟 Initializing Pro Windows Agent...');
        this.agentName = 'Pro Windows Agent';
        return new ProWindowsAgent();

      case 'macos':
        logger.info('🍎 Initializing Pro macOS Agent...');
        this.agentName = 'Pro macOS Agent';
        return new ProMacOSAgent();

      case 'linux':
        logger.info('🐧 Initializing Pro Linux Agent...');
        this.agentName = 'Pro Linux Agent';
        // For now, use macOS agent (similar Unix commands)
        return new ProMacOSAgent();

      case 'android':
        logger.info('📱 Initializing Pro Android Agent...');
        this.agentName = 'Pro Android Agent';
        return new ProAndroidAgent();

      case 'ios':
        logger.info('📱 Initializing Pro iOS Agent...');
        this.agentName = 'Pro iOS Agent';
        // iOS agent would be similar to Android
        logger.info('⚠️  iOS Pro Agent coming soon! Using basic monitoring...');
        return new ProAndroidAgent();

      default:
        logger.error(`❌ Unsupported platform: ${this.platform}`);
        logger.error('Supported platforms: Windows, macOS, Linux, Android, iOS');
        process.exit(1);
    }
  }

  async start(): Promise<void> {
    logger.info('');
    logger.info(`🚀 Starting ${this.agentName}...`);
    logger.info('=====================================');
    
    // Display system info
    this.displaySystemInfo();
    
    // Display configuration
    this.displayConfiguration();
    
    logger.info('');
    
    // Start the agent
    try {
      await this.agent.start();
    } catch (error: any) {
      logger.error(`❌ Failed to start agent: ${error.message}`);
      process.exit(1);
    }
  }

  private displaySystemInfo(): void {
    logger.info('');
    logger.info('📊 System Information:');
    logger.info(`   Platform: ${this.platform}`);
    logger.info(`   Hostname: ${os.hostname()}`);
    logger.info(`   Architecture: ${os.arch()}`);
    logger.info(`   CPUs: ${os.cpus().length} cores`);
    logger.info(`   Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    logger.info(`   Free Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    logger.info(`   Uptime: ${(os.uptime() / 3600).toFixed(2)} hours`);
    logger.info(`   Node.js: ${process.version}`);

    // Platform-specific info
    if (this.platform === 'windows') {
      try {
        const version = execSync('ver', { encoding: 'utf-8' });
        logger.info(`   Windows Version: ${version.trim()}`);
      } catch (error) {}
    } else if (this.platform === 'macos') {
      try {
        const version = execSync('sw_vers -productVersion', { encoding: 'utf-8' });
        logger.info(`   macOS Version: ${version.trim()}`);
      } catch (error) {}
    } else if (this.platform === 'linux') {
      try {
        const version = execSync('cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d \'"\'', { encoding: 'utf-8' });
        logger.info(`   Linux Distribution: ${version.trim()}`);
      } catch (error) {}
    } else if (this.platform === 'android') {
      try {
        const version = execSync('getprop ro.build.version.release', { encoding: 'utf-8' });
        logger.info(`   Android Version: ${version.trim()}`);
      } catch (error) {}
    }
  }

  private displayConfiguration(): void {
    logger.info('');
    logger.info('⚙️  Configuration:');
    logger.info(`   Server URL: ${process.env.CMDB_SERVER_URL || 'http://localhost:3001'}`);
    logger.info(`   API Key: ${process.env.CMDB_API_KEY ? '✓ Set' : '✗ Not Set'}`);
    logger.info(`   Collection Interval: ${process.env.COLLECTION_INTERVAL || '60000'}ms`);
    logger.info(`   AI Analytics: ${process.env.ENABLE_AI_ANALYTICS !== 'false' ? '✓ Enabled' : '✗ Disabled'}`);
    logger.info(`   Auto-Remediation: ${process.env.ENABLE_AUTO_REMEDIATION !== 'false' ? '✓ Enabled' : '✗ Disabled'}`);
    logger.info(`   Log Level: ${process.env.LOG_LEVEL || 'info'}`);
  }

  getInfo() {
    return {
      platform: this.platform,
      agentName: this.agentName,
      hostname: os.hostname(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      nodeVersion: process.version,
      agentStatus: this.agent?.getStatus ? this.agent.getStatus() : null,
    };
  }
}

// CLI runner
if (require.main === module) {
  const agent = new UniversalProAgent();

  // Start agent
  agent.start().catch((error) => {
    logger.error('❌ Fatal error:', error);
    process.exit(1);
  });

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    logger.info('\n');
    logger.info('🛑 Received SIGINT, shutting down gracefully...');
    
    try {
      if (agent['agent'] && typeof agent['agent'].stop === 'function') {
        await agent['agent'].stop();
      }
      logger.info('✅ Agent stopped successfully');
      process.exit(0);
    } catch (error: any) {
      logger.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    logger.info('\n');
    logger.info('🛑 Received SIGTERM, shutting down gracefully...');
    
    try {
      if (agent['agent'] && typeof agent['agent'].stop === 'function') {
        await agent['agent'].stop();
      }
      logger.info('✅ Agent stopped successfully');
      process.exit(0);
    } catch (error: any) {
      logger.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

export default UniversalProAgent;
