import logger from '../utils/logger';

/**
 * CMDB Agent - Android Platform
 * 
 * Monitors Android devices and reports to CMDB
 * 
 * Features:
 * - Android device information collection
 * - Battery and performance monitoring
 * - Installed apps tracking
 * - Network connectivity
 * - Storage usage
 * - Security settings
 * 
 * Note: This agent requires Android SDK or termux environment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execAsync = promisify(exec);

interface AndroidSystemInfo {
  platform: string;
  deviceModel: string;
  manufacturer: string;
  androidVersion: string;
  apiLevel: number;
  buildNumber: string;
  serialNumber: string;
  cpu: {
    architecture: string;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    available: number;
    used: number;
  };
  storage: {
    internal: StorageInfo;
    external?: StorageInfo;
  };
  battery: {
    level: number;
    status: string;
    temperature: number;
    health: string;
  };
  network: {
    type: string; // wifi, mobile, none
    carrier?: string;
    signalStrength?: number;
    ip?: string;
  };
  apps: InstalledApp[];
  security: {
    screenLock: boolean;
    encryption: boolean;
    playProtect: boolean;
  };
  location?: {
    enabled: boolean;
  };
}

interface StorageInfo {
  total: number;
  free: number;
  used: number;
}

interface InstalledApp {
  packageName: string;
  versionName: string;
  versionCode: number;
  installDate: string;
  system: boolean;
}

class AndroidCMDBAgent {
  private serverUrl: string;
  private agentId: string;
  private interval: number;
  private apiKey?: string;

  constructor() {
    this.serverUrl = process.env.CMDB_SERVER_URL || 'http://localhost:3001';
    this.agentId = this.generateAgentId();
    this.interval = parseInt(process.env.COLLECTION_INTERVAL || '300000'); // 5 minutes
    this.apiKey = process.env.CMDB_API_KEY;
  }

  private generateAgentId(): string {
    return `android-${Date.now()}`;
  }

  async collectSystemInfo(): Promise<AndroidSystemInfo> {
    logger.info('📱 Collecting Android system information...');

    const systemInfo: AndroidSystemInfo = {
      platform: 'android',
      deviceModel: await this.getDeviceModel(),
      manufacturer: await this.getManufacturer(),
      androidVersion: await this.getAndroidVersion(),
      apiLevel: await this.getAPILevel(),
      buildNumber: await this.getBuildNumber(),
      serialNumber: await this.getSerialNumber(),
      cpu: await this.getCPUInfo(),
      memory: await this.getMemoryInfo(),
      storage: await this.getStorageInfo(),
      battery: await this.getBatteryInfo(),
      network: await this.getNetworkInfo(),
      apps: await this.getInstalledApps(),
      security: await this.getSecurityInfo(),
      location: await this.getLocationInfo(),
    };

    return systemInfo;
  }

  private async getDeviceModel(): Promise<string> {
    try {
      const { stdout } = await execAsync('getprop ro.product.model');
      return stdout.trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getManufacturer(): Promise<string> {
    try {
      const { stdout } = await execAsync('getprop ro.product.manufacturer');
      return stdout.trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getAndroidVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('getprop ro.build.version.release');
      return stdout.trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getAPILevel(): Promise<number> {
    try {
      const { stdout } = await execAsync('getprop ro.build.version.sdk');
      return parseInt(stdout.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getBuildNumber(): Promise<string> {
    try {
      const { stdout } = await execAsync('getprop ro.build.display.id');
      return stdout.trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getSerialNumber(): Promise<string> {
    try {
      const { stdout } = await execAsync('getprop ro.serialno');
      return stdout.trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getCPUInfo() {
    try {
      const { stdout } = await execAsync('cat /proc/cpuinfo');
      const lines = stdout.split('\n');
      
      const modelLine = lines.find(l => l.includes('Hardware'));
      const model = modelLine?.split(':')[1]?.trim() || 'Unknown';
      
      const coreCount = lines.filter(l => l.includes('processor')).length;
      
      const archLine = lines.find(l => l.includes('CPU architecture'));
      const architecture = archLine?.split(':')[1]?.trim() || 'Unknown';

      return {
        model,
        cores: coreCount,
        architecture,
      };
    } catch (error) {
      return {
        model: 'Unknown',
        cores: 0,
        architecture: 'Unknown',
      };
    }
  }

  private async getMemoryInfo() {
    try {
      const { stdout } = await execAsync('cat /proc/meminfo');
      const lines = stdout.split('\n');
      
      const totalLine = lines.find(l => l.startsWith('MemTotal'));
      const availableLine = lines.find(l => l.startsWith('MemAvailable'));
      
      const total = parseInt(totalLine?.match(/\d+/)?.[0] || '0') * 1024;
      const available = parseInt(availableLine?.match(/\d+/)?.[0] || '0') * 1024;

      return {
        total,
        available,
        used: total - available,
      };
    } catch (error) {
      return {
        total: 0,
        available: 0,
        used: 0,
      };
    }
  }

  private async getStorageInfo() {
    const storage: any = {
      internal: { total: 0, free: 0, used: 0 },
    };

    try {
      const { stdout } = await execAsync('df /data');
      const lines = stdout.split('\n');
      const dataLine = lines[1]?.split(/\s+/);
      
      if (dataLine) {
        const total = parseInt(dataLine[1]) * 1024;
        const used = parseInt(dataLine[2]) * 1024;
        const free = parseInt(dataLine[3]) * 1024;
        
        storage.internal = { total, used, free };
      }
    } catch (error) {
      logger.error('Error getting storage info:', error);
    }

    return storage;
  }

  private async getBatteryInfo() {
    const battery: any = {
      level: 0,
      status: 'unknown',
      temperature: 0,
      health: 'unknown',
    };

    try {
      const { stdout } = await execAsync('dumpsys battery');
      const lines = stdout.split('\n');
      
      const levelLine = lines.find(l => l.includes('level:'));
      battery.level = parseInt(levelLine?.split(':')[1]?.trim() || '0');
      
      const statusLine = lines.find(l => l.includes('status:'));
      battery.status = statusLine?.split(':')[1]?.trim() || 'unknown';
      
      const tempLine = lines.find(l => l.includes('temperature:'));
      battery.temperature = parseInt(tempLine?.split(':')[1]?.trim() || '0') / 10;
      
      const healthLine = lines.find(l => l.includes('health:'));
      battery.health = healthLine?.split(':')[1]?.trim() || 'unknown';
    } catch (error) {
      logger.error('Error getting battery info:', error);
    }

    return battery;
  }

  private async getNetworkInfo() {
    const network: any = {
      type: 'none',
    };

    try {
      const { stdout } = await execAsync('dumpsys connectivity');
      
      if (stdout.includes('WIFI')) {
        network.type = 'wifi';
      } else if (stdout.includes('MOBILE')) {
        network.type = 'mobile';
      }

      // Get IP address
      try {
        const { stdout: ipOut } = await execAsync('ip addr show wlan0 | grep "inet " | awk \'{print $2}\' | cut -d/ -f1');
        network.ip = ipOut.trim();
      } catch (e) {}
    } catch (error) {
      logger.error('Error getting network info:', error);
    }

    return network;
  }

  private async getInstalledApps(): Promise<InstalledApp[]> {
    try {
      const { stdout } = await execAsync('pm list packages -f');
      const packages = stdout.split('\n').filter(l => l.trim()).slice(0, 50);
      
      return packages.map(pkg => {
        const match = pkg.match(/package:(.*?)=(.*)/);
        if (!match) return null;
        
        return {
          packageName: match[2],
          versionName: '1.0',
          versionCode: 1,
          installDate: new Date().toISOString(),
          system: match[1].includes('/system/'),
        };
      }).filter((app): app is InstalledApp => app !== null);
    } catch (error) {
      logger.error('Error getting installed apps:', error);
      return [];
    }
  }

  private async getSecurityInfo() {
    const security: any = {
      screenLock: false,
      encryption: false,
      playProtect: false,
    };

    try {
      const { stdout } = await execAsync('dumpsys devicelock');
      security.screenLock = stdout.includes('Screen Lock:');
    } catch (error) {}

    try {
      const { stdout } = await execAsync('getprop ro.crypto.state');
      security.encryption = stdout.trim() === 'encrypted';
    } catch (error) {}

    return security;
  }

  private async getLocationInfo() {
    try {
      const { stdout } = await execAsync('settings get secure location_providers_allowed');
      return {
        enabled: stdout.trim().length > 0,
      };
    } catch (error) {
      return { enabled: false };
    }
  }

  async sendToServer(data: AndroidSystemInfo): Promise<void> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.post(
        `${this.serverUrl}/api/cmdb/register`,
        {
          agentId: this.agentId,
          timestamp: new Date().toISOString(),
          data,
        },
        { headers }
      );

      logger.info('✅ Data sent successfully:', response.status);
    } catch (error: any) {
      logger.error('❌ Error sending data to server:', error.message);
    }
  }

  async start(): Promise<void> {
    logger.info('🚀 Starting Android CMDB Agent...');
    logger.info(`📡 Server: ${this.serverUrl}`);
    logger.info(`🔄 Collection interval: ${this.interval}ms`);

    // Initial collection
    await this.collectAndSend();

    // Periodic collection
    setInterval(async () => {
      await this.collectAndSend();
    }, this.interval);

    logger.info('✅ Agent is running.');
  }

  private async collectAndSend(): Promise<void> {
    try {
      const systemInfo = await this.collectSystemInfo();
      await this.sendToServer(systemInfo);
    } catch (error) {
      logger.error('Error in collection cycle:', error);
    }
  }
}

// Run the agent
if (require.main === module) {
  const agent = new AndroidCMDBAgent();
  agent.start().catch((err) => logger.error('Agent error', { error: err }));
}

export default AndroidCMDBAgent;
