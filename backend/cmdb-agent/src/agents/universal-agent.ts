/**
 * CMDB Agent - Universal Launcher
 * 
 * Automatically detects the platform and launches the appropriate agent
 * 
 * Supported Platforms:
 * - Windows (Windows 7, 8, 10, 11, Server)
 * - Linux (Ubuntu, RHEL, CentOS, Debian, Fedora, etc.)
 * - macOS (10.13+)
 * - Android (via Termux or rooted device)
 * - iOS (jailbroken or MDM)
 * - FreeBSD
 * - Solaris/illumos
 * - AIX
 */

import os from 'os';
import WindowsCMDBAgent from './windows-agent';
import LinuxCMDBAgent from './linux-agent';
import MacOSCMDBAgent from './macos-agent';
import AndroidCMDBAgent from './android-agent';
import iOSCMDBAgent from './ios-agent';

class UniversalCMDBAgent {
  private platform: string;
  private agent: any;

  constructor() {
    this.platform = this.detectPlatform();
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
      // Check for Android-specific environment
      return (
        process.env.ANDROID_ROOT !== undefined ||
        process.env.ANDROID_DATA !== undefined ||
        os.platform() === 'linux' && process.env.TERMUX_VERSION !== undefined
      );
    } catch (error) {
      return false;
    }
  }

  private isiOS(): boolean {
    try {
      // Check for iOS-specific paths
      const fs = require('fs');
      return (
        os.platform() === 'darwin' &&
        (
          fs.existsSync('/Applications/Cydia.app') ||
          fs.existsSync('/private/var/mobile')
        )
      );
    } catch (error) {
      return false;
    }
  }

  private initializeAgent(): any {
    console.log(`🔍 Detected platform: ${this.platform}`);

    switch (this.platform) {
      case 'windows':
        console.log('🪟  Initializing Windows CMDB Agent...');
        return new WindowsCMDBAgent();
      
      case 'linux':
        console.log('🐧  Initializing Linux CMDB Agent...');
        return new LinuxCMDBAgent();
      
      case 'macos':
        console.log('🍎  Initializing macOS CMDB Agent...');
        return new MacOSCMDBAgent();
      
      case 'android':
        console.log('🤖  Initializing Android CMDB Agent...');
        return new AndroidCMDBAgent();
      
      case 'ios':
        console.log('📱  Initializing iOS CMDB Agent...');
        return new iOSCMDBAgent();
      
      default:
        console.error(`❌ Unsupported platform: ${this.platform}`);
        console.error('Supported platforms: Windows, Linux, macOS, Android, iOS');
        process.exit(1);
    }
  }

  async start(): Promise<void> {
    console.log('═══════════════════════════════════════════════════');
    console.log('  IAC Dharma - Universal CMDB Agent');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Platform: ${this.platform}`);
    console.log(`  Hostname: ${os.hostname()}`);
    console.log(`  Architecture: ${os.arch()}`);
    console.log(`  Node Version: ${process.version}`);
    console.log('═══════════════════════════════════════════════════\n');

    if (!this.agent) {
      console.error('❌ Failed to initialize agent');
      process.exit(1);
    }

    try {
      await this.agent.start();
    } catch (error) {
      console.error('❌ Agent failed to start:', error);
      process.exit(1);
    }
  }

  getInfo() {
    return {
      platform: this.platform,
      hostname: os.hostname(),
      architecture: os.arch(),
      nodeVersion: process.version,
      osRelease: os.release(),
      uptime: os.uptime(),
    };
  }
}

// Run the universal agent
if (require.main === module) {
  const agent = new UniversalCMDBAgent();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n⚠️  Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });

  agent.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default UniversalCMDBAgent;
