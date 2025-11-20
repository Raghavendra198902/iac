import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface USBWriteEvent {
  id: string;
  timestamp: string;
  hostname: string;
  username: string;
  deviceId: string;
  volumeLabel: string;
  driveLetter: string;
  targetPath: string;
  fileSize: number;
  fileName: string;
  action: 'write' | 'copy' | 'move';
  blocked: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface FileAccessEvent {
  id: string;
  timestamp: string;
  hostname: string;
  username: string;
  processName: string;
  pid: number;
  filePath: string;
  accessType: 'read' | 'write' | 'delete' | 'rename';
  isSensitiveFolder: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface NetworkExfiltrationEvent {
  id: string;
  timestamp: string;
  hostname: string;
  processName: string;
  pid: number;
  localAddress: string;
  remoteAddress: string;
  remotePort: number;
  protocol: string;
  bytesTransferred: number;
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
}

export class DataLeakageMonitor {
  private usbDeviceCache: Map<string, any> = new Map();
  private sensitiveFolders = [
    'C:\\Users\\*\\Documents',
    'C:\\Users\\*\\Desktop',
    'C:\\Users\\*\\Downloads',
    'C:\\ProgramData',
    'C:\\Windows\\System32\\config',
  ];
  private suspiciousRemotePorts = [21, 22, 23, 3389, 4444, 5900, 8080, 8888, 9001];
  private networkBaseline: Map<string, number> = new Map();

  /**
   * Monitor USB write operations
   */
  async monitorUSBWrites(): Promise<USBWriteEvent[]> {
    if (process.platform !== 'win32') {
      return [];
    }

    try {
      // Get USB devices
      const { stdout } = await execAsync(
        'powershell.exe "Get-WmiObject Win32_LogicalDisk | Where-Object {$_.DriveType -eq 2} | Select-Object DeviceID, VolumeName, Size, FreeSpace | ConvertTo-Json"',
        { timeout: 5000 }
      );

      if (!stdout.trim()) {
        return [];
      }

      const devices = JSON.parse(stdout);
      const deviceList = Array.isArray(devices) ? devices : [devices];
      const events: USBWriteEvent[] = [];

      for (const device of deviceList) {
        const deviceId = device.DeviceID;
        const cached = this.usbDeviceCache.get(deviceId);

        if (cached) {
          // Check for changes in free space (indicates write operation)
          const freeSpaceDelta = cached.FreeSpace - device.FreeSpace;
          if (freeSpaceDelta > 1024 * 1024) { // > 1MB written
            const event: USBWriteEvent = {
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              hostname: require('os').hostname(),
              username: process.env.USERNAME || 'unknown',
              deviceId,
              volumeLabel: device.VolumeName || 'Unknown',
              driveLetter: deviceId,
              targetPath: `${deviceId}\\`,
              fileSize: freeSpaceDelta,
              fileName: 'unknown',
              action: 'write',
              blocked: false,
              severity: freeSpaceDelta > 100 * 1024 * 1024 ? 'high' : 'medium',
            };

            logger.warn('USB write operation detected', {
              eventId: event.id,
              deviceId,
              sizeMB: (freeSpaceDelta / (1024 * 1024)).toFixed(2),
            });

            events.push(event);
          }
        }

        this.usbDeviceCache.set(deviceId, device);
      }

      return events;
    } catch (error) {
      logger.error('USB write monitoring error', { error });
      return [];
    }
  }

  /**
   * Monitor sensitive file access
   */
  async monitorFileAccess(): Promise<FileAccessEvent[]> {
    if (process.platform !== 'win32') {
      return [];
    }

    try {
      // Query Security Event Log for file access (Event ID 4663)
      const { stdout } = await execAsync(
        `powershell.exe "Get-WinEvent -FilterHashtable @{LogName='Security';ID=4663} -MaxEvents 10 -ErrorAction SilentlyContinue | Select-Object TimeCreated, Message | ConvertTo-Json"`,
        { timeout: 5000 }
      );

      if (!stdout.trim()) {
        return [];
      }

      const events = JSON.parse(stdout);
      const eventList = Array.isArray(events) ? events : [events];
      const fileAccessEvents: FileAccessEvent[] = [];

      for (const evt of eventList) {
        // Parse event message for file path
        const message = evt.Message;
        const filePathMatch = message.match(/Object Name:\s+(.+)/);
        if (!filePathMatch) continue;

        const filePath = filePathMatch[1].trim();
        const isSensitive = this.sensitiveFolders.some(folder => 
          filePath.toLowerCase().includes(folder.toLowerCase().replace('*', ''))
        );

        if (isSensitive) {
          const event: FileAccessEvent = {
            id: uuidv4(),
            timestamp: new Date(evt.TimeCreated).toISOString(),
            hostname: require('os').hostname(),
            username: process.env.USERNAME || 'unknown',
            processName: 'unknown',
            pid: 0,
            filePath,
            accessType: 'read',
            isSensitiveFolder: true,
            severity: 'medium',
          };

          fileAccessEvents.push(event);
        }
      }

      return fileAccessEvents;
    } catch (error) {
      logger.debug('File access monitoring unavailable (requires audit policy)', { error });
      return [];
    }
  }

  /**
   * Monitor network exfiltration attempts
   */
  async monitorNetworkExfiltration(): Promise<NetworkExfiltrationEvent[]> {
    if (process.platform !== 'win32') {
      return [];
    }

    try {
      // Get active network connections with process info
      const { stdout } = await execAsync(
        'powershell.exe "Get-NetTCPConnection -State Established | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, OwningProcess | ConvertTo-Json"',
        { timeout: 5000 }
      );

      if (!stdout.trim()) {
        return [];
      }

      const connections = JSON.parse(stdout);
      const connectionList = Array.isArray(connections) ? connections : [connections];
      const events: NetworkExfiltrationEvent[] = [];

      for (const conn of connectionList) {
        const remotePort = conn.RemotePort;
        const remoteAddress = conn.RemoteAddress;

        // Skip local connections
        if (remoteAddress.startsWith('127.') || remoteAddress.startsWith('::1')) {
          continue;
        }

        // Check for suspicious ports
        const isSuspicious = this.suspiciousRemotePorts.includes(remotePort);

        // Get process name
        let processName = 'unknown';
        try {
          const { stdout: procOutput } = await execAsync(
            `powershell.exe "Get-Process -Id ${conn.OwningProcess} | Select-Object Name | ConvertTo-Json"`,
            { timeout: 2000 }
          );
          const procData = JSON.parse(procOutput);
          processName = procData.Name || 'unknown';
        } catch {}

        // Check baseline for anomalies
        const connKey = `${processName}:${remotePort}`;
        const baselineCount = this.networkBaseline.get(connKey) || 0;
        const isAnomaly = baselineCount === 0 && isSuspicious;

        this.networkBaseline.set(connKey, baselineCount + 1);

        if (isAnomaly || isSuspicious) {
          const event: NetworkExfiltrationEvent = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            hostname: require('os').hostname(),
            processName,
            pid: conn.OwningProcess,
            localAddress: conn.LocalAddress,
            remoteAddress: conn.RemoteAddress,
            remotePort,
            protocol: 'TCP',
            bytesTransferred: 0,
            isAnomaly,
            severity: isSuspicious ? 'high' : 'medium',
          };

          logger.warn('Suspicious network connection detected', {
            eventId: event.id,
            process: processName,
            remoteAddress,
            remotePort,
          });

          events.push(event);
        }
      }

      return events;
    } catch (error) {
      logger.error('Network exfiltration monitoring error', { error });
      return [];
    }
  }

  /**
   * Block USB write operations
   */
  async blockUSBWrite(deviceId: string): Promise<boolean> {
    if (process.platform !== 'win32') {
      return false;
    }

    try {
      // Set drive to read-only via registry (requires admin)
      await execAsync(
        `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\StorageDevicePolicies" /v WriteProtect /t REG_DWORD /d 1 /f`,
        { timeout: 3000 }
      );

      logger.info('USB write protection enabled', { deviceId });
      return true;
    } catch (error) {
      logger.error('Failed to block USB write', { error, deviceId });
      return false;
    }
  }

  /**
   * Block process network access
   */
  async blockProcessNetwork(pid: number, processName: string): Promise<boolean> {
    if (process.platform !== 'win32') {
      return false;
    }

    try {
      // Terminate suspicious process
      await execAsync(`taskkill /PID ${pid} /F`, { timeout: 3000 });
      logger.info('Suspicious process terminated', { pid, processName });
      return true;
    } catch (error) {
      logger.error('Failed to terminate process', { error, pid, processName });
      return false;
    }
  }

  /**
   * Add sensitive folder to monitoring list
   */
  addSensitiveFolder(folderPath: string): void {
    if (!this.sensitiveFolders.includes(folderPath)) {
      this.sensitiveFolders.push(folderPath);
      logger.info('Sensitive folder added to monitoring', { folderPath });
    }
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    usbDevices: number;
    sensitiveFolders: number;
    networkConnections: number;
    enabled: boolean;
  } {
    return {
      usbDevices: this.usbDeviceCache.size,
      sensitiveFolders: this.sensitiveFolders.length,
      networkConnections: this.networkBaseline.size,
      enabled: process.platform === 'win32',
    };
  }

  /**
   * Clear monitoring cache
   */
  clearCache(): void {
    this.usbDeviceCache.clear();
    this.networkBaseline.clear();
    logger.info('Data leakage monitor cache cleared');
  }
}
