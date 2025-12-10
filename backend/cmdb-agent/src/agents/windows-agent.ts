import logger from '../utils/logger';

#!/usr/bin/env node

/**
 * CMDB Agent - Windows Platform
 * 
 * Monitors Windows systems and reports to CMDB
 * 
 * Features:
 * - Windows-specific system information collection
 * - WMI integration for detailed metrics
 * - Windows service monitoring
 * - Registry monitoring
 * - Event log collection
 * - Active Directory integration
 */

import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface WindowsSystemInfo {
  platform: string;
  hostname: string;
  osVersion: string;
  osBuild: string;
  architecture: string;
  cpu: {
    model: string;
    cores: number;
    threads: number;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
  };
  disks: DiskInfo[];
  network: NetworkInfo[];
  services: WindowsService[];
  software: InstalledSoftware[];
  windowsFeatures: string[];
  domainInfo?: {
    domain: string;
    computerName: string;
    isDomainJoined: boolean;
  };
  lastBootTime: string;
  windowsUpdates?: WindowsUpdate[];
}

interface DiskInfo {
  drive: string;
  total: number;
  free: number;
  used: number;
  filesystem: string;
  label?: string;
}

interface NetworkInfo {
  interface: string;
  ip: string;
  mac: string;
  status: string;
  speed?: string;
}

interface WindowsService {
  name: string;
  displayName: string;
  status: string;
  startType: string;
}

interface InstalledSoftware {
  name: string;
  version: string;
  publisher?: string;
  installDate?: string;
}

interface WindowsUpdate {
  title: string;
  installed: boolean;
  date?: string;
}

class WindowsCMDBAgent {
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
    return `windows-${os.hostname()}-${Date.now()}`;
  }

  async collectSystemInfo(): Promise<WindowsSystemInfo> {
    logger.info('📊 Collecting Windows system information...');

    const systemInfo: WindowsSystemInfo = {
      platform: 'windows',
      hostname: os.hostname(),
      osVersion: await this.getWindowsVersion(),
      osBuild: await this.getWindowsBuild(),
      architecture: os.arch(),
      cpu: this.getCPUInfo(),
      memory: this.getMemoryInfo(),
      disks: await this.getDiskInfo(),
      network: await this.getNetworkInfo(),
      services: await this.getWindowsServices(),
      software: await this.getInstalledSoftware(),
      windowsFeatures: await this.getWindowsFeatures(),
      domainInfo: await this.getDomainInfo(),
      lastBootTime: await this.getLastBootTime(),
      windowsUpdates: await this.getWindowsUpdates(),
    };

    return systemInfo;
  }

  private async getWindowsVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('wmic os get Caption /value');
      const match = stdout.match(/Caption=(.*)/);
      return match ? match[1].trim() : os.release();
    } catch (error) {
      return os.release();
    }
  }

  private async getWindowsBuild(): Promise<string> {
    try {
      const { stdout } = await execAsync('wmic os get BuildNumber /value');
      const match = stdout.match(/BuildNumber=(.*)/);
      return match ? match[1].trim() : '';
    } catch (error) {
      return '';
    }
  }

  private getCPUInfo() {
    const cpus = os.cpus();
    return {
      model: cpus[0]?.model || 'Unknown',
      cores: cpus.length,
      threads: cpus.length,
      speed: cpus[0]?.speed || 0,
    };
  }

  private getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    return {
      total,
      free,
      used: total - free,
    };
  }

  private async getDiskInfo(): Promise<DiskInfo[]> {
    try {
      const { stdout } = await execAsync('wmic logicaldisk get DeviceID,Size,FreeSpace,FileSystem,VolumeName /format:csv');
      const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      
      return lines.map(line => {
        const [, deviceId, fileSystem, freeSpace, size, volumeName] = line.split(',');
        const total = parseInt(size) || 0;
        const free = parseInt(freeSpace) || 0;
        
        return {
          drive: deviceId?.trim() || '',
          total,
          free,
          used: total - free,
          filesystem: fileSystem?.trim() || '',
          label: volumeName?.trim() || '',
        };
      }).filter(disk => disk.drive);
    } catch (error) {
      logger.error('Error getting disk info:', error);
      return [];
    }
  }

  private async getNetworkInfo(): Promise<NetworkInfo[]> {
    try {
      const { stdout } = await execAsync('ipconfig /all');
      const interfaces: NetworkInfo[] = [];
      
      // Parse ipconfig output
      const sections = stdout.split('\n\n');
      for (const section of sections) {
        const lines = section.split('\n');
        let iface: Partial<NetworkInfo> = {};
        
        for (const line of lines) {
          if (line.includes('adapter')) {
            iface.interface = line.split('adapter')[1]?.trim() || '';
          } else if (line.includes('IPv4 Address')) {
            const match = line.match(/:\s*([\d.]+)/);
            if (match) iface.ip = match[1];
          } else if (line.includes('Physical Address')) {
            const match = line.match(/:\s*([\w-]+)/);
            if (match) iface.mac = match[1];
          }
        }
        
        if (iface.interface && iface.ip) {
          interfaces.push({
            interface: iface.interface,
            ip: iface.ip || '',
            mac: iface.mac || '',
            status: 'active',
          });
        }
      }
      
      return interfaces;
    } catch (error) {
      logger.error('Error getting network info:', error);
      return [];
    }
  }

  private async getWindowsServices(): Promise<WindowsService[]> {
    try {
      const { stdout } = await execAsync('sc query type= service state= all');
      const services: WindowsService[] = [];
      
      const serviceBlocks = stdout.split('\n\n').filter(block => block.trim());
      
      for (const block of serviceBlocks) {
        const lines = block.split('\n');
        let service: Partial<WindowsService> = {};
        
        for (const line of lines) {
          if (line.includes('SERVICE_NAME:')) {
            service.name = line.split(':')[1]?.trim() || '';
          } else if (line.includes('DISPLAY_NAME:')) {
            service.displayName = line.split(':')[1]?.trim() || '';
          } else if (line.includes('STATE')) {
            const match = line.match(/:\s*\d+\s+(\w+)/);
            if (match) service.status = match[1];
          }
        }
        
        if (service.name) {
          services.push({
            name: service.name,
            displayName: service.displayName || service.name,
            status: service.status || 'unknown',
            startType: 'unknown',
          });
        }
      }
      
      return services.slice(0, 50); // Limit to 50 most important services
    } catch (error) {
      logger.error('Error getting Windows services:', error);
      return [];
    }
  }

  private async getInstalledSoftware(): Promise<InstalledSoftware[]> {
    try {
      const { stdout } = await execAsync('wmic product get Name,Version,Vendor /format:csv');
      const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      
      return lines.map(line => {
        const [, name, vendor, version] = line.split(',');
        return {
          name: name?.trim() || '',
          version: version?.trim() || '',
          publisher: vendor?.trim() || '',
        };
      }).filter(soft => soft.name).slice(0, 100); // Limit to 100 items
    } catch (error) {
      logger.error('Error getting installed software:', error);
      return [];
    }
  }

  private async getWindowsFeatures(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('dism /online /get-features /format:table');
      const lines = stdout.split('\n').filter(line => line.includes('Enabled'));
      
      return lines.map(line => {
        const match = line.match(/^([\w-]+)/);
        return match ? match[1] : '';
      }).filter(f => f).slice(0, 50);
    } catch (error) {
      return [];
    }
  }

  private async getDomainInfo() {
    try {
      const { stdout } = await execAsync('systeminfo | findstr /B /C:"Domain"');
      const domainLine = stdout.split('\n')[0];
      const domain = domainLine?.split(':')[1]?.trim() || '';
      
      return {
        domain,
        computerName: os.hostname(),
        isDomainJoined: domain !== 'WORKGROUP' && domain !== '',
      };
    } catch (error) {
      return undefined;
    }
  }

  private async getLastBootTime(): Promise<string> {
    try {
      const { stdout } = await execAsync('systeminfo | findstr /C:"System Boot Time"');
      const match = stdout.match(/:\s*(.+)/);
      return match ? match[1].trim() : new Date().toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  private async getWindowsUpdates(): Promise<WindowsUpdate[]> {
    try {
      // This requires PowerShell and appropriate permissions
      const { stdout } = await execAsync(
        'powershell "Get-HotFix | Select-Object -First 10 | Format-List"'
      );
      
      const updates: WindowsUpdate[] = [];
      const entries = stdout.split('\n\n');
      
      for (const entry of entries) {
        const lines = entry.split('\n');
        let update: Partial<WindowsUpdate> = { installed: true };
        
        for (const line of lines) {
          if (line.includes('Description')) {
            const desc = line.split(':')[1]?.trim();
            update.title = desc || '';
          } else if (line.includes('InstalledOn')) {
            const date = line.split(':')[1]?.trim();
            update.date = date || '';
          }
        }
        
        if (update.title) {
          updates.push(update as WindowsUpdate);
        }
      }
      
      return updates;
    } catch (error) {
      return [];
    }
  }

  async sendToServer(data: WindowsSystemInfo): Promise<void> {
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
      if (error.response) {
        logger.error('Response:', error.response.status, error.response.data);
      }
    }
  }

  async start(): Promise<void> {
    logger.info('🚀 Starting Windows CMDB Agent...');
    logger.info(`📡 Server: ${this.serverUrl}`);
    logger.info(`🔄 Collection interval: ${this.interval}ms`);
    logger.info(`💻 Agent ID: ${this.agentId}`);

    // Initial collection
    await this.collectAndSend();

    // Periodic collection
    setInterval(async () => {
      await this.collectAndSend();
    }, this.interval);

    logger.info('✅ Agent is running. Press Ctrl+C to stop.');
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
  const agent = new WindowsCMDBAgent();
  agent.start().catch((err) => logger.error('Agent error', { error: err }));
}

export default WindowsCMDBAgent;
