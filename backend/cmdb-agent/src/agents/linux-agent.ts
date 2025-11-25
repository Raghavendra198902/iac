#!/usr/bin/env node

/**
 * CMDB Agent - Linux Platform
 * 
 * Monitors Linux systems and reports to CMDB
 * 
 * Features:
 * - Linux-specific system information collection
 * - systemd service monitoring
 * - Package management integration (apt, yum, dnf)
 * - Process monitoring
 * - Kernel information
 * - Security updates tracking
 */

import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

interface LinuxSystemInfo {
  platform: string;
  hostname: string;
  distribution: string;
  osVersion: string;
  kernel: string;
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
    cached: number;
    buffers: number;
  };
  disks: DiskInfo[];
  network: NetworkInfo[];
  services: SystemdService[];
  packages: InstalledPackage[];
  processes: ProcessInfo[];
  security: {
    selinuxStatus?: string;
    appArmorStatus?: string;
    firewall?: string;
    pendingUpdates: number;
  };
  lastBootTime: string;
  loadAverage: number[];
}

interface DiskInfo {
  filesystem: string;
  mountpoint: string;
  total: number;
  free: number;
  used: number;
  percentUsed: number;
  type: string;
}

interface NetworkInfo {
  interface: string;
  ip: string;
  mac: string;
  status: string;
  speed?: string;
  rx_bytes?: number;
  tx_bytes?: number;
}

interface SystemdService {
  name: string;
  status: string;
  enabled: boolean;
  description?: string;
}

interface InstalledPackage {
  name: string;
  version: string;
  architecture?: string;
}

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  user: string;
}

class LinuxCMDBAgent {
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
    return `linux-${os.hostname()}-${Date.now()}`;
  }

  async collectSystemInfo(): Promise<LinuxSystemInfo> {
    console.log('📊 Collecting Linux system information...');

    const systemInfo: LinuxSystemInfo = {
      platform: 'linux',
      hostname: os.hostname(),
      distribution: await this.getDistribution(),
      osVersion: await this.getOSVersion(),
      kernel: os.release(),
      architecture: os.arch(),
      cpu: this.getCPUInfo(),
      memory: await this.getMemoryInfo(),
      disks: await this.getDiskInfo(),
      network: await this.getNetworkInfo(),
      services: await this.getSystemdServices(),
      packages: await this.getInstalledPackages(),
      processes: await this.getTopProcesses(),
      security: await this.getSecurityInfo(),
      lastBootTime: await this.getLastBootTime(),
      loadAverage: os.loadavg(),
    };

    return systemInfo;
  }

  private async getDistribution(): Promise<string> {
    try {
      const content = await fs.readFile('/etc/os-release', 'utf-8');
      const match = content.match(/PRETTY_NAME="(.*)"/);
      return match ? match[1] : 'Unknown Linux';
    } catch (error) {
      return 'Unknown Linux';
    }
  }

  private async getOSVersion(): Promise<string> {
    try {
      const content = await fs.readFile('/etc/os-release', 'utf-8');
      const match = content.match(/VERSION="(.*)"/);
      return match ? match[1] : os.release();
    } catch (error) {
      return os.release();
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

  private async getMemoryInfo() {
    try {
      const { stdout } = await execAsync('free -b');
      const lines = stdout.split('\n');
      const memLine = lines[1].split(/\s+/);
      
      return {
        total: parseInt(memLine[1]) || os.totalmem(),
        used: parseInt(memLine[2]) || 0,
        free: parseInt(memLine[3]) || os.freemem(),
        cached: parseInt(memLine[5]) || 0,
        buffers: parseInt(memLine[4]) || 0,
      };
    } catch (error) {
      const total = os.totalmem();
      const free = os.freemem();
      return {
        total,
        free,
        used: total - free,
        cached: 0,
        buffers: 0,
      };
    }
  }

  private async getDiskInfo(): Promise<DiskInfo[]> {
    try {
      const { stdout } = await execAsync('df -B1 -T -x tmpfs -x devtmpfs');
      const lines = stdout.split('\n').slice(1).filter(line => line.trim());
      
      return lines.map(line => {
        const parts = line.split(/\s+/);
        const total = parseInt(parts[2]) || 0;
        const used = parseInt(parts[3]) || 0;
        const free = parseInt(parts[4]) || 0;
        
        return {
          filesystem: parts[0],
          type: parts[1],
          total,
          used,
          free,
          percentUsed: parseFloat(parts[5]?.replace('%', '') || '0'),
          mountpoint: parts[6],
        };
      });
    } catch (error) {
      console.error('Error getting disk info:', error);
      return [];
    }
  }

  private async getNetworkInfo(): Promise<NetworkInfo[]> {
    try {
      const { stdout } = await execAsync('ip -j addr');
      const interfaces = JSON.parse(stdout);
      
      return interfaces
        .filter((iface: any) => iface.ifname !== 'lo')
        .map((iface: any) => {
          const ipv4 = iface.addr_info?.find((addr: any) => addr.family === 'inet');
          
          return {
            interface: iface.ifname,
            ip: ipv4?.local || '',
            mac: iface.address || '',
            status: iface.operstate || 'unknown',
          };
        })
        .filter((iface: NetworkInfo) => iface.ip);
    } catch (error) {
      console.error('Error getting network info:', error);
      return [];
    }
  }

  private async getSystemdServices(): Promise<SystemdService[]> {
    try {
      const { stdout } = await execAsync('systemctl list-units --type=service --all --no-pager --plain');
      const lines = stdout.split('\n').slice(1).filter(line => line.trim());
      
      return lines.slice(0, 50).map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          name: parts[0]?.replace('.service', '') || '',
          status: parts[2] || 'unknown',
          enabled: parts[3] === 'enabled',
          description: parts.slice(4).join(' '),
        };
      }).filter(s => s.name);
    } catch (error) {
      console.error('Error getting systemd services:', error);
      return [];
    }
  }

  private async getInstalledPackages(): Promise<InstalledPackage[]> {
    try {
      // Try dpkg (Debian/Ubuntu)
      try {
        const { stdout } = await execAsync('dpkg -l | tail -n +6');
        const lines = stdout.split('\n').filter(line => line.trim());
        
        return lines.slice(0, 100).map(line => {
          const parts = line.split(/\s+/);
          return {
            name: parts[1] || '',
            version: parts[2] || '',
            architecture: parts[3] || '',
          };
        }).filter(p => p.name);
      } catch (e) {
        // Try rpm (RHEL/CentOS/Fedora)
        const { stdout } = await execAsync('rpm -qa --queryformat "%{NAME} %{VERSION} %{ARCH}\n"');
        const lines = stdout.split('\n').filter(line => line.trim());
        
        return lines.slice(0, 100).map(line => {
          const parts = line.split(/\s+/);
          return {
            name: parts[0] || '',
            version: parts[1] || '',
            architecture: parts[2] || '',
          };
        }).filter(p => p.name);
      }
    } catch (error) {
      console.error('Error getting installed packages:', error);
      return [];
    }
  }

  private async getTopProcesses(): Promise<ProcessInfo[]> {
    try {
      const { stdout } = await execAsync('ps aux --sort=-%cpu | head -n 11');
      const lines = stdout.split('\n').slice(1).filter(line => line.trim());
      
      return lines.map(line => {
        const parts = line.split(/\s+/);
        return {
          user: parts[0] || '',
          pid: parseInt(parts[1]) || 0,
          cpu: parseFloat(parts[2]) || 0,
          memory: parseFloat(parts[3]) || 0,
          name: parts[10] || '',
        };
      }).filter(p => p.pid);
    } catch (error) {
      console.error('Error getting processes:', error);
      return [];
    }
  }

  private async getSecurityInfo() {
    const security: any = {
      pendingUpdates: 0,
    };

    // Check SELinux
    try {
      const { stdout } = await execAsync('getenforce 2>/dev/null');
      security.selinuxStatus = stdout.trim();
    } catch (e) {
      // SELinux not available
    }

    // Check AppArmor
    try {
      const { stdout } = await execAsync('aa-status --enabled 2>/dev/null');
      security.appArmorStatus = 'enabled';
    } catch (e) {
      // AppArmor not available
    }

    // Check firewall
    try {
      const { stdout } = await execAsync('systemctl is-active firewalld 2>/dev/null || systemctl is-active ufw 2>/dev/null');
      security.firewall = stdout.trim();
    } catch (e) {
      security.firewall = 'unknown';
    }

    // Check pending updates
    try {
      const { stdout } = await execAsync('apt list --upgradable 2>/dev/null | wc -l');
      security.pendingUpdates = parseInt(stdout.trim()) - 1;
    } catch (e) {
      try {
        const { stdout } = await execAsync('yum check-update 2>/dev/null | grep -v "^$" | wc -l');
        security.pendingUpdates = parseInt(stdout.trim());
      } catch (e2) {
        // Unable to check updates
      }
    }

    return security;
  }

  private async getLastBootTime(): Promise<string> {
    try {
      const { stdout } = await execAsync('uptime -s');
      return new Date(stdout.trim()).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  async sendToServer(data: LinuxSystemInfo): Promise<void> {
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
      if (error.response) {
        console.error('Response:', error.response.status, error.response.data);
      }
    }
  }

  async start(): Promise<void> {
    console.log('🚀 Starting Linux CMDB Agent...');
    console.log(`📡 Server: ${this.serverUrl}`);
    console.log(`🔄 Collection interval: ${this.interval}ms`);
    console.log(`💻 Agent ID: ${this.agentId}`);

    // Initial collection
    await this.collectAndSend();

    // Periodic collection
    setInterval(async () => {
      await this.collectAndSend();
    }, this.interval);

    console.log('✅ Agent is running. Press Ctrl+C to stop.');
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
  const agent = new LinuxCMDBAgent();
  agent.start().catch(console.error);
}

export default LinuxCMDBAgent;
