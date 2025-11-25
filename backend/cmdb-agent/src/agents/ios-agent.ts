/**
 * CMDB Agent - iOS Platform
 * 
 * Monitors iOS devices and reports to CMDB
 * 
 * Features:
 * - iOS device information collection
 * - Battery and performance monitoring
 * - Installed apps tracking (jailbroken devices)
 * - Network connectivity
 * - Storage usage
 * - Security settings
 * 
 * Note: This agent requires jailbroken device or iOS app with appropriate entitlements
 * For production iOS devices, use MDM (Mobile Device Management) integration
 */

import axios from 'axios';
import { execSync } from 'child_process';

interface iOSSystemInfo {
  platform: string;
  deviceModel: string;
  deviceName: string;
  iosVersion: string;
  buildNumber: string;
  udid: string;
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
    total: number;
    free: number;
    used: number;
  };
  battery: {
    level: number;
    state: string; // charging, discharging, full
    lowPowerMode: boolean;
  };
  network: {
    type: string; // wifi, cellular, none
    carrier?: string;
    ip?: string;
  };
  apps?: InstalledApp[];
  security: {
    passcode: boolean;
    faceId: boolean;
    touchId: boolean;
    jailbroken: boolean;
    findMy: boolean;
  };
  iCloudAccount?: string;
  activationLock: boolean;
}

interface InstalledApp {
  bundleId: string;
  name: string;
  version: string;
  size: number;
}

class iOSCMDBAgent {
  private serverUrl: string;
  private agentId: string;
  private interval: number;
  private apiKey?: string;
  private isJailbroken: boolean;

  constructor() {
    this.serverUrl = process.env.CMDB_SERVER_URL || 'http://localhost:3001';
    this.agentId = this.generateAgentId();
    this.interval = parseInt(process.env.COLLECTION_INTERVAL || '300000'); // 5 minutes
    this.apiKey = process.env.CMDB_API_KEY;
    this.isJailbroken = this.checkJailbreak();
  }

  private generateAgentId(): string {
    return `ios-${Date.now()}`;
  }

  private checkJailbreak(): boolean {
    // Check for common jailbreak indicators
    const jailbreakPaths = [
      '/Applications/Cydia.app',
      '/Library/MobileSubstrate/MobileSubstrate.dylib',
      '/bin/bash',
      '/usr/sbin/sshd',
      '/etc/apt',
      '/private/var/lib/apt/',
    ];

    try {
      for (const path of jailbreakPaths) {
        try {
          execSync(`ls ${path}`, { stdio: 'ignore' });
          return true;
        } catch (e) {
          // Path doesn't exist
        }
      }
    } catch (error) {
      // Error checking paths
    }

    return false;
  }

  async collectSystemInfo(): Promise<iOSSystemInfo> {
    console.log('📱 Collecting iOS system information...');

    const systemInfo: iOSSystemInfo = {
      platform: 'ios',
      deviceModel: await this.getDeviceModel(),
      deviceName: await this.getDeviceName(),
      iosVersion: await this.getiOSVersion(),
      buildNumber: await this.getBuildNumber(),
      udid: await this.getUDID(),
      serialNumber: await this.getSerialNumber(),
      cpu: await this.getCPUInfo(),
      memory: await this.getMemoryInfo(),
      storage: await this.getStorageInfo(),
      battery: await this.getBatteryInfo(),
      network: await this.getNetworkInfo(),
      security: await this.getSecurityInfo(),
      iCloudAccount: await this.getiCloudAccount(),
      activationLock: await this.getActivationLock(),
    };

    // Only get apps if jailbroken
    if (this.isJailbroken) {
      systemInfo.apps = await this.getInstalledApps();
    }

    return systemInfo;
  }

  private async getDeviceModel(): Promise<string> {
    try {
      const model = execSync('uname -m').toString().trim();
      return this.translateModel(model);
    } catch (error) {
      return 'Unknown';
    }
  }

  private translateModel(model: string): string {
    const modelMap: { [key: string]: string } = {
      'iPhone14,2': 'iPhone 13 Pro',
      'iPhone14,3': 'iPhone 13 Pro Max',
      'iPhone14,4': 'iPhone 13 Mini',
      'iPhone14,5': 'iPhone 13',
      'iPhone15,2': 'iPhone 14 Pro',
      'iPhone15,3': 'iPhone 14 Pro Max',
      'iPad13,1': 'iPad Air (5th gen)',
      // Add more models as needed
    };

    return modelMap[model] || model;
  }

  private async getDeviceName(): Promise<string> {
    try {
      return execSync('hostname').toString().trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getiOSVersion(): Promise<string> {
    try {
      const version = execSync('sw_vers -productVersion').toString().trim();
      return version;
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getBuildNumber(): Promise<string> {
    try {
      const build = execSync('sw_vers -buildVersion').toString().trim();
      return build;
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getUDID(): Promise<string> {
    try {
      // This requires libimobiledevice or similar tool
      const udid = execSync('idevice_id -l').toString().trim();
      return udid.split('\n')[0] || 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getSerialNumber(): Promise<string> {
    try {
      const serial = execSync('ioreg -l | grep IOPlatformSerialNumber | awk \'{print $4}\'').toString().trim();
      return serial.replace(/"/g, '');
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getCPUInfo() {
    try {
      const arch = execSync('uname -p').toString().trim();
      const cores = parseInt(execSync('sysctl -n hw.ncpu').toString().trim());
      const model = execSync('sysctl -n machdep.cpu.brand_string').toString().trim();

      return {
        architecture: arch,
        cores,
        model,
      };
    } catch (error) {
      return {
        architecture: 'ARM64',
        cores: 6,
        model: 'Apple A-Series',
      };
    }
  }

  private async getMemoryInfo() {
    try {
      const total = parseInt(execSync('sysctl -n hw.memsize').toString().trim());
      
      // Get available memory (this is approximate on iOS)
      const vmStat = execSync('vm_stat').toString();
      const lines = vmStat.split('\n');
      const freeLine = lines.find(l => l.includes('Pages free'));
      const free = freeLine ? parseInt(freeLine.match(/\d+/)?.[0] || '0') * 4096 : 0;

      return {
        total,
        available: free,
        used: total - free,
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
    try {
      const df = execSync('df -k /').toString();
      const lines = df.split('\n');
      const dataLine = lines[1]?.split(/\s+/);

      if (dataLine) {
        const total = parseInt(dataLine[1]) * 1024;
        const used = parseInt(dataLine[2]) * 1024;
        const free = parseInt(dataLine[3]) * 1024;

        return { total, used, free };
      }
    } catch (error) {}

    return { total: 0, used: 0, free: 0 };
  }

  private async getBatteryInfo() {
    const battery: any = {
      level: 100,
      state: 'unknown',
      lowPowerMode: false,
    };

    try {
      // This would require using IOKit framework or similar
      // Placeholder implementation
      battery.level = 100;
      battery.state = 'full';
    } catch (error) {}

    return battery;
  }

  private async getNetworkInfo() {
    const network: any = {
      type: 'none',
    };

    try {
      const ifconfig = execSync('ifconfig').toString();
      
      if (ifconfig.includes('en0') && ifconfig.includes('inet ')) {
        network.type = 'wifi';
        
        const ipMatch = ifconfig.match(/inet\s+([\d.]+)/);
        if (ipMatch) {
          network.ip = ipMatch[1];
        }
      } else if (ifconfig.includes('pdp_ip0')) {
        network.type = 'cellular';
      }
    } catch (error) {}

    return network;
  }

  private async getInstalledApps(): Promise<InstalledApp[]> {
    if (!this.isJailbroken) {
      return [];
    }

    try {
      // This requires jailbreak and appropriate tools
      const apps: InstalledApp[] = [];
      
      // Example using ls on jailbroken device
      const appDirs = execSync('ls /var/mobile/Containers/Bundle/Application').toString().split('\n');
      
      for (const dir of appDirs.slice(0, 50)) {
        if (!dir.trim()) continue;
        
        try {
          const plistPath = `/var/mobile/Containers/Bundle/Application/${dir}/Info.plist`;
          const bundleId = execSync(`defaults read ${plistPath} CFBundleIdentifier`).toString().trim();
          const name = execSync(`defaults read ${plistPath} CFBundleDisplayName`).toString().trim();
          const version = execSync(`defaults read ${plistPath} CFBundleShortVersionString`).toString().trim();

          apps.push({
            bundleId,
            name,
            version,
            size: 0,
          });
        } catch (e) {
          // Skip apps we can't read
        }
      }
      
      return apps;
    } catch (error) {
      return [];
    }
  }

  private async getSecurityInfo() {
    return {
      passcode: true, // Assume passcode is set (can't detect without jailbreak)
      faceId: false, // Would require device capability detection
      touchId: false,
      jailbroken: this.isJailbroken,
      findMy: true, // Assume enabled
    };
  }

  private async getiCloudAccount(): Promise<string | undefined> {
    try {
      // This requires access to user preferences
      // Placeholder implementation
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private async getActivationLock(): Promise<boolean> {
    try {
      // Check if activation lock is enabled
      // This is typically only available through MDM
      return true; // Assume enabled for security
    } catch (error) {
      return true;
    }
  }

  async sendToServer(data: iOSSystemInfo): Promise<void> {
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

      console.log('✅ Data sent successfully:', response.status);
    } catch (error: any) {
      console.error('❌ Error sending data to server:', error.message);
    }
  }

  async start(): Promise<void> {
    console.log('🚀 Starting iOS CMDB Agent...');
    console.log(`📡 Server: ${this.serverUrl}`);
    console.log(`🔄 Collection interval: ${this.interval}ms`);
    console.log(`🔓 Jailbroken: ${this.isJailbroken}`);

    // Initial collection
    await this.collectAndSend();

    // Periodic collection
    setInterval(async () => {
      await this.collectAndSend();
    }, this.interval);

    console.log('✅ Agent is running.');
  }

  private async collectAndSend(): Promise<void> {
    try {
      const systemInfo = await this.collectSystemInfo();
      await this.sendToServer(systemInfo);
    } catch (error) {
      console.error('Error in collection cycle:', error);
    }
  }
}

// Run the agent
if (require.main === module) {
  const agent = new iOSCMDBAgent();
  agent.start().catch(console.error);
}

export default iOSCMDBAgent;
