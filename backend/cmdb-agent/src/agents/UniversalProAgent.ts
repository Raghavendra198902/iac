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
    console.log('🌍 Universal Pro Agent Launcher v2.0');
    console.log('=====================================');
    
    this.platform = this.detectPlatform();
    console.log(`📱 Detected Platform: ${this.platform.toUpperCase()}`);
    
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
        console.log('🪟 Initializing Pro Windows Agent...');
        this.agentName = 'Pro Windows Agent';
        return new ProWindowsAgent();

      case 'macos':
        console.log('🍎 Initializing Pro macOS Agent...');
        this.agentName = 'Pro macOS Agent';
        return new ProMacOSAgent();

      case 'linux':
        console.log('🐧 Initializing Pro Linux Agent...');
        this.agentName = 'Pro Linux Agent';
        // For now, use macOS agent (similar Unix commands)
        return new ProMacOSAgent();

      case 'android':
        console.log('📱 Initializing Pro Android Agent...');
        this.agentName = 'Pro Android Agent';
        return new ProAndroidAgent();

      case 'ios':
        console.log('📱 Initializing Pro iOS Agent...');
        this.agentName = 'Pro iOS Agent';
        // iOS agent would be similar to Android
        console.log('⚠️  iOS Pro Agent coming soon! Using basic monitoring...');
        return new ProAndroidAgent();

      default:
        console.error(`❌ Unsupported platform: ${this.platform}`);
        console.error('Supported platforms: Windows, macOS, Linux, Android, iOS');
        process.exit(1);
    }
  }

  async start(): Promise<void> {
    console.log('');
    console.log(`🚀 Starting ${this.agentName}...`);
    console.log('=====================================');
    
    // Display system info
    this.displaySystemInfo();
    
    // Display configuration
    this.displayConfiguration();
    
    console.log('');
    
    // Start the agent
    try {
      await this.agent.start();
    } catch (error: any) {
      console.error(`❌ Failed to start agent: ${error.message}`);
      process.exit(1);
    }
  }

  private displaySystemInfo(): void {
    console.log('');
    console.log('📊 System Information:');
    console.log(`   Platform: ${this.platform}`);
    console.log(`   Hostname: ${os.hostname()}`);
    console.log(`   Architecture: ${os.arch()}`);
    console.log(`   CPUs: ${os.cpus().length} cores`);
    console.log(`   Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Free Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Uptime: ${(os.uptime() / 3600).toFixed(2)} hours`);
    console.log(`   Node.js: ${process.version}`);

    // Platform-specific info
    if (this.platform === 'windows') {
      try {
        const version = execSync('ver', { encoding: 'utf-8' });
        console.log(`   Windows Version: ${version.trim()}`);
      } catch (error) {}
    } else if (this.platform === 'macos') {
      try {
        const version = execSync('sw_vers -productVersion', { encoding: 'utf-8' });
        console.log(`   macOS Version: ${version.trim()}`);
      } catch (error) {}
    } else if (this.platform === 'linux') {
      try {
        const version = execSync('cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d \'"\'', { encoding: 'utf-8' });
        console.log(`   Linux Distribution: ${version.trim()}`);
      } catch (error) {}
    } else if (this.platform === 'android') {
      try {
        const version = execSync('getprop ro.build.version.release', { encoding: 'utf-8' });
        console.log(`   Android Version: ${version.trim()}`);
      } catch (error) {}
    }
  }

  private displayConfiguration(): void {
    console.log('');
    console.log('⚙️  Configuration:');
    console.log(`   Server URL: ${process.env.CMDB_SERVER_URL || 'http://localhost:3001'}`);
    console.log(`   API Key: ${process.env.CMDB_API_KEY ? '✓ Set' : '✗ Not Set'}`);
    console.log(`   Collection Interval: ${process.env.COLLECTION_INTERVAL || '60000'}ms`);
    console.log(`   AI Analytics: ${process.env.ENABLE_AI_ANALYTICS !== 'false' ? '✓ Enabled' : '✗ Disabled'}`);
    console.log(`   Auto-Remediation: ${process.env.ENABLE_AUTO_REMEDIATION !== 'false' ? '✓ Enabled' : '✗ Disabled'}`);
    console.log(`   Log Level: ${process.env.LOG_LEVEL || 'info'}`);
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
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    console.log('\n');
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    
    try {
      if (agent['agent'] && typeof agent['agent'].stop === 'function') {
        await agent['agent'].stop();
      }
      console.log('✅ Agent stopped successfully');
      process.exit(0);
    } catch (error: any) {
      console.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    console.log('\n');
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    
    try {
      if (agent['agent'] && typeof agent['agent'].stop === 'function') {
        await agent['agent'].stop();
      }
      console.log('✅ Agent stopped successfully');
      process.exit(0);
    } catch (error: any) {
      console.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

export default UniversalProAgent;
