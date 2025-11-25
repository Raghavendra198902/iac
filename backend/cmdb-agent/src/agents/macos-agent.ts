#!/usr/bin/env node

/**
 * CMDB Agent - macOS Platform
 * 
 * Monitors macOS systems and reports to CMDB
 * 
 * Features:
 * - macOS-specific system information collection
 * - Launch Services monitoring
 * - Homebrew package tracking
 * - macOS system profiler integration
 * - Security & Privacy settings
 * - Time Machine backup status
 */

import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

interface MacSystemInfo {
  platform: string;
  hostname: string;
  osVersion: string;
  buildVersion: string;
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
    wired: number;
    compressed: number;
  };
  disks: DiskInfo[];
  network: NetworkInfo[];
  launchAgents: LaunchAgent[];
  homebrew: HomebrewInfo;
  applications: InstalledApp[];
  systemProfiler: {
    hardware: any;
    software: any;
  };
  security: {
    firewall: string;
    gatekeeper: string;
    sip: string;
    fileVault: string;
  };
  timeMachine?: TimeMachineInfo;
  lastBootTime: string;
}

interface DiskInfo {
  name: string;
  mountpoint: string;
  total: number;
  free: number;
  used: number;
  filesystem: string;
}

interface NetworkInfo {
  interface: string;
  ip: string;
  mac: string;
  status: string;
  speed?: string;
}

interface LaunchAgent {
  name: string;
  status: string;
  type: string; // agent, daemon
}

interface HomebrewInfo {
  version: string;
  formulas: number;
  casks: number;
  taps: string[];
}

interface InstalledApp {
  name: string;
  version: string;
  path: string;
  bundleId?: string;
}

interface TimeMachineInfo {
  enabled: boolean;
  destination?: string;
  lastBackup?: string;
}

class MacOSCMDBAgent {
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
    return `macos-${os.hostname()}-${Date.now()}`;
  }

  async collectSystemInfo(): Promise<MacSystemInfo> {
    console.log('📊 Collecting macOS system information...');

    const systemInfo: MacSystemInfo = {
      platform: 'darwin',
      hostname: os.hostname(),
      osVersion: await this.getMacOSVersion(),
      buildVersion: await this.getBuildVersion(),
      architecture: os.arch(),
      cpu: this.getCPUInfo(),
      memory: await this.getMemoryInfo(),
      disks: await this.getDiskInfo(),
      network: await this.getNetworkInfo(),
      launchAgents: await this.getLaunchAgents(),
      homebrew: await this.getHomebrewInfo(),
      applications: await this.getInstalledApplications(),
      systemProfiler: await this.getSystemProfiler(),
      security: await this.getSecurityInfo(),
      timeMachine: await this.getTimeMachineInfo(),
      lastBootTime: await this.getLastBootTime(),
    };

    return systemInfo;
  }

  private async getMacOSVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('sw_vers -productVersion');
      return stdout.trim();
    } catch (error) {
      return os.release();
    }
  }

  private async getBuildVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('sw_vers -buildVersion');
      return stdout.trim();
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

  private async getMemoryInfo() {
    try {
      const { stdout } = await execAsync('vm_stat');
      const lines = stdout.split('\n');
      
      const pageSize = 4096; // macOS page size
      const extractValue = (pattern: string) => {
        const line = lines.find(l => l.includes(pattern));
        const match = line?.match(/:\s+(\d+)/);
        return match ? parseInt(match[1]) * pageSize : 0;
      };

      const total = os.totalmem();
      const free = extractValue('Pages free');
      const wired = extractValue('Pages wired down');
      const compressed = extractValue('Pages stored in compressor');

      return {
        total,
        free,
        used: total - free,
        wired,
        compressed,
      };
    } catch (error) {
      const total = os.totalmem();
      const free = os.freemem();
      return {
        total,
        free,
        used: total - free,
        wired: 0,
        compressed: 0,
      };
    }
  }

  private async getDiskInfo(): Promise<DiskInfo[]> {
    try {
      const { stdout } = await execAsync('df -Hl');
      const lines = stdout.split('\n').slice(1).filter(line => line.trim());
      
      return lines.map(line => {
        const parts = line.split(/\s+/);
        const total = parseInt(parts[1]) * 512; // 512-byte blocks
        const used = parseInt(parts[2]) * 512;
        const free = parseInt(parts[3]) * 512;
        
        return {
          name: parts[0],
          filesystem: parts[0],
          total,
          used,
          free,
          mountpoint: parts[8] || parts[5],
        };
      });
    } catch (error) {
      console.error('Error getting disk info:', error);
      return [];
    }
  }

  private async getNetworkInfo(): Promise<NetworkInfo[]> {
    try {
      const { stdout } = await execAsync('ifconfig');
      const interfaces: NetworkInfo[] = [];
      
      const blocks = stdout.split('\n\n');
      for (const block of blocks) {
        const lines = block.split('\n');
        if (!lines[0]) continue;
        
        const ifaceName = lines[0].split(':')[0];
        let iface: Partial<NetworkInfo> = {
          interface: ifaceName,
          status: 'unknown',
        };
        
        for (const line of lines) {
          if (line.includes('inet ') && !line.includes('inet6')) {
            const match = line.match(/inet\s+([\d.]+)/);
            if (match) iface.ip = match[1];
          } else if (line.includes('ether')) {
            const match = line.match(/ether\s+([\w:]+)/);
            if (match) iface.mac = match[1];
          } else if (line.includes('status:')) {
            const match = line.match(/status:\s+(\w+)/);
            if (match) iface.status = match[1];
          }
        }
        
        if (iface.ip && ifaceName !== 'lo0') {
          interfaces.push(iface as NetworkInfo);
        }
      }
      
      return interfaces;
    } catch (error) {
      console.error('Error getting network info:', error);
      return [];
    }
  }

  private async getLaunchAgents(): Promise<LaunchAgent[]> {
    try {
      const agents: LaunchAgent[] = [];
      
      // User agents
      try {
        const { stdout } = await execAsync('launchctl list');
        const lines = stdout.split('\n').slice(1).filter(line => line.trim());
        
        for (const line of lines.slice(0, 50)) {
          const parts = line.split(/\s+/);
          agents.push({
            name: parts[2] || '',
            status: parts[0] === '-' ? 'inactive' : 'active',
            type: 'agent',
          });
        }
      } catch (e) {
        // Ignore errors
      }
      
      return agents.filter(a => a.name);
    } catch (error) {
      console.error('Error getting launch agents:', error);
      return [];
    }
  }

  private async getHomebrewInfo(): Promise<HomebrewInfo> {
    try {
      const { stdout: version } = await execAsync('brew --version 2>/dev/null || echo "not installed"');
      
      if (version.includes('not installed')) {
        return {
          version: 'not installed',
          formulas: 0,
          casks: 0,
          taps: [],
        };
      }

      const { stdout: formulasOut } = await execAsync('brew list --formula 2>/dev/null | wc -l');
      const { stdout: casksOut } = await execAsync('brew list --cask 2>/dev/null | wc -l');
      const { stdout: tapsOut } = await execAsync('brew tap 2>/dev/null');

      return {
        version: version.split('\n')[0].replace('Homebrew ', ''),
        formulas: parseInt(formulasOut.trim()) || 0,
        casks: parseInt(casksOut.trim()) || 0,
        taps: tapsOut.split('\n').filter(t => t.trim()),
      };
    } catch (error) {
      return {
        version: 'error',
        formulas: 0,
        casks: 0,
        taps: [],
      };
    }
  }

  private async getInstalledApplications(): Promise<InstalledApp[]> {
    try {
      const { stdout } = await execAsync('mdfind "kMDItemKind == Application" | head -50');
      const appPaths = stdout.split('\n').filter(p => p.trim());
      
      const apps: InstalledApp[] = [];
      for (const appPath of appPaths.slice(0, 30)) {
        try {
          const plistPath = `${appPath}/Contents/Info.plist`;
          const { stdout: version } = await execAsync(`defaults read "${plistPath}" CFBundleShortVersionString 2>/dev/null || echo "unknown"`);
          const { stdout: bundleId } = await execAsync(`defaults read "${plistPath}" CFBundleIdentifier 2>/dev/null || echo ""`);
          
          apps.push({
            name: appPath.split('/').pop()?.replace('.app', '') || '',
            version: version.trim(),
            path: appPath,
            bundleId: bundleId.trim() || undefined,
          });
        } catch (e) {
          // Skip apps we can't read
        }
      }
      
      return apps;
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  }

  private async getSystemProfiler() {
    try {
      const { stdout: hardware } = await execAsync('system_profiler SPHardwareDataType -json');
      const { stdout: software } = await execAsync('system_profiler SPSoftwareDataType -json');
      
      return {
        hardware: JSON.parse(hardware),
        software: JSON.parse(software),
      };
    } catch (error) {
      return {
        hardware: {},
        software: {},
      };
    }
  }

  private async getSecurityInfo() {
    const security: any = {
      firewall: 'unknown',
      gatekeeper: 'unknown',
      sip: 'unknown',
      fileVault: 'unknown',
    };

    try {
      const { stdout: firewall } = await execAsync('sudo defaults read /Library/Preferences/com.apple.alf globalstate 2>/dev/null || echo "unknown"');
      security.firewall = firewall.trim() === '1' ? 'enabled' : 'disabled';
    } catch (e) {}

    try {
      const { stdout: gatekeeper } = await execAsync('spctl --status 2>/dev/null || echo "unknown"');
      security.gatekeeper = gatekeeper.trim();
    } catch (e) {}

    try {
      const { stdout: sip } = await execAsync('csrutil status 2>/dev/null || echo "unknown"');
      security.sip = sip.includes('enabled') ? 'enabled' : 'disabled';
    } catch (e) {}

    try {
      const { stdout: fileVault } = await execAsync('fdesetup status 2>/dev/null || echo "unknown"');
      security.fileVault = fileVault.includes('On') ? 'enabled' : 'disabled';
    } catch (e) {}

    return security;
  }

  private async getTimeMachineInfo(): Promise<TimeMachineInfo | undefined> {
    try {
      const { stdout } = await execAsync('tmutil status 2>/dev/null');
      const enabled = !stdout.includes('not enabled');
      
      if (!enabled) {
        return { enabled: false };
      }

      const { stdout: dest } = await execAsync('tmutil destinationinfo 2>/dev/null');
      const { stdout: lastBackup } = await execAsync('tmutil latestbackup 2>/dev/null');

      return {
        enabled,
        destination: dest.split('\n')[0],
        lastBackup: lastBackup.trim(),
      };
    } catch (error) {
      return undefined;
    }
  }

  private async getLastBootTime(): Promise<string> {
    try {
      const { stdout } = await execAsync('sysctl -n kern.boottime');
      const match = stdout.match(/sec = (\d+)/);
      if (match) {
        return new Date(parseInt(match[1]) * 1000).toISOString();
      }
    } catch (error) {}
    return new Date().toISOString();
  }

  async sendToServer(data: MacSystemInfo): Promise<void> {
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
    console.log('🚀 Starting macOS CMDB Agent...');
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
  const agent = new MacOSCMDBAgent();
  agent.start().catch(console.error);
}

export default MacOSCMDBAgent;
