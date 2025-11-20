/**
 * Process Monitor
 * Monitors process creation, termination, and suspicious behavior
 */

import { EventEmitter } from 'events';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: number;
  ppid: number;
  name: string;
  path: string;
  commandLine: string;
  user: string;
  startTime: Date;
  hash?: string;
  signature?: string;
}

export interface ProcessEvent {
  type: 'process_start' | 'process_stop' | 'suspicious_process';
  timestamp: Date;
  process: ProcessInfo;
  riskScore?: number;
  reason?: string;
}

export class ProcessMonitor extends EventEmitter {
  private isMonitoring: boolean = false;
  private processes: Map<number, ProcessInfo> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL_MS = 2000;

  /**
   * Start process monitoring
   */
  async start(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Process monitor already running');
      return;
    }

    logger.info('Starting process monitor');
    this.isMonitoring = true;

    // Initial snapshot
    await this.snapshotProcesses();

    // Start polling
    this.pollInterval = setInterval(() => {
      this.pollProcesses().catch((error) => {
        logger.error('Error polling processes', { error: error.message });
      });
    }, this.POLL_INTERVAL_MS);

    logger.info('Process monitor started');
  }

  /**
   * Stop process monitoring
   */
  async stop(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    logger.info('Stopping process monitor');
    this.isMonitoring = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.processes.clear();
    logger.info('Process monitor stopped');
  }

  /**
   * Take initial snapshot of running processes
   */
  private async snapshotProcesses(): Promise<void> {
    try {
      const currentProcesses = await this.getRunningProcesses();
      
      for (const proc of currentProcesses) {
        this.processes.set(proc.pid, proc);
      }

      logger.info('Process snapshot completed', { count: currentProcesses.length });
    } catch (error: any) {
      logger.error('Failed to snapshot processes', { error: error.message });
    }
  }

  /**
   * Poll for process changes
   */
  private async pollProcesses(): Promise<void> {
    try {
      const currentProcesses = await this.getRunningProcesses();
      const currentPids = new Set(currentProcesses.map(p => p.pid));
      const previousPids = new Set(this.processes.keys());

      // Detect new processes
      for (const proc of currentProcesses) {
        if (!previousPids.has(proc.pid)) {
          this.processes.set(proc.pid, proc);
          await this.handleProcessStart(proc);
        }
      }

      // Detect terminated processes
      for (const pid of previousPids) {
        if (!currentPids.has(pid)) {
          const proc = this.processes.get(pid);
          if (proc) {
            this.processes.delete(pid);
            this.handleProcessStop(proc);
          }
        }
      }
    } catch (error: any) {
      logger.error('Error polling processes', { error: error.message });
    }
  }

  /**
   * Get list of running processes (platform-specific)
   */
  private async getRunningProcesses(): Promise<ProcessInfo[]> {
    const platform = os.platform();

    // Log platform detection for debugging
    if (this.processes.size === 0) {
      logger.info('Process monitor detecting platform', { platform });
    }

    if (platform === 'win32') {
      return this.getWindowsProcesses();
    } else if (platform === 'linux' || platform === 'darwin') {
      return this.getUnixProcesses();
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  /**
   * Get Windows processes using Get-CimInstance/wmic
   */
  private async getWindowsProcesses(): Promise<ProcessInfo[]> {
    try {
      // Try PowerShell Get-CimInstance first (works in modern Windows and provides full info)
      try {
        const { stdout } = await execAsync(
          'powershell.exe "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine | ConvertTo-Json -Compress"',
          { timeout: 5000 }
        );

        const processData = JSON.parse(stdout);
        const processes: ProcessInfo[] = [];

        // Handle both single object and array responses
        const processList = Array.isArray(processData) ? processData : [processData];

        for (const proc of processList) {
          if (!proc.ProcessId) continue;

          processes.push({
            pid: proc.ProcessId,
            ppid: proc.ParentProcessId || 0,
            name: proc.Name || 'unknown',
            path: proc.ExecutablePath || '',
            commandLine: proc.CommandLine || '',
            user: 'unknown',
            startTime: new Date(),
          });
        }

        if (processes.length > 0) {
          return processes;
        }
      } catch (psError) {
        // PowerShell failed, try wmic
      }

      // Fallback to wmic (native Windows only)
      const { stdout } = await execAsync(
        'wmic process get ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine,Caption /format:csv',
        { timeout: 5000 }
      );

      const lines = stdout.split('\n').filter(line => line.trim());
      const processes: ProcessInfo[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length < 5) continue;

        const pid = parseInt(parts[4], 10);
        if (isNaN(pid)) continue;

        processes.push({
          pid,
          ppid: parseInt(parts[3], 10) || 0,
          name: parts[1] || parts[5] || 'unknown',
          path: parts[2] || '',
          commandLine: parts[0] || '',
          user: 'unknown',
          startTime: new Date(),
        });
      }

      return processes;
    } catch (error: any) {
      // Silently fail if running in incompatible environment (e.g., WSL without Windows interop)
      if (this.processes.size === 0) {
        logger.warn('Windows process monitoring unavailable - this is normal in WSL/Docker environments', { 
          error: error.message 
        });
      }
      return [];
    }
  }

  /**
   * Get Unix processes using ps
   */
  private async getUnixProcesses(): Promise<ProcessInfo[]> {
    try {
      const { stdout } = await execAsync('ps -eo pid,ppid,user,comm,args');
      
      const lines = stdout.split('\n').filter(line => line.trim());
      const processes: ProcessInfo[] = [];

      for (let i = 1; i < lines.length; i++) {
        const match = lines[i].trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(.*)$/);
        if (!match) continue;

        const [, pidStr, ppidStr, user, comm, args] = match;
        const pid = parseInt(pidStr, 10);
        const ppid = parseInt(ppidStr, 10);

        processes.push({
          pid,
          ppid,
          name: comm,
          path: comm,
          commandLine: args,
          user,
          startTime: new Date(),
        });
      }

      return processes;
    } catch (error: any) {
      logger.error('Failed to get Unix processes', { error: error.message });
      return [];
    }
  }

  /**
   * Handle process start event
   */
  private async handleProcessStart(proc: ProcessInfo): Promise<void> {
    logger.debug('Process started', { pid: proc.pid, name: proc.name });

    // Analyze process for suspicious behavior
    const riskScore = this.analyzeProcess(proc);

    const event: ProcessEvent = {
      type: riskScore > 50 ? 'suspicious_process' : 'process_start',
      timestamp: new Date(),
      process: proc,
      riskScore,
    };

    this.emit('process_event', event);
  }

  /**
   * Handle process termination
   */
  private handleProcessStop(proc: ProcessInfo): void {
    logger.debug('Process stopped', { pid: proc.pid, name: proc.name });

    const event: ProcessEvent = {
      type: 'process_stop',
      timestamp: new Date(),
      process: proc,
    };

    this.emit('process_event', event);
  }

  /**
   * Analyze process for suspicious behavior
   */
  private analyzeProcess(proc: ProcessInfo): number {
    let riskScore = 0;

    // Check for suspicious process names
    const suspiciousNames = ['powershell', 'cmd', 'bash', 'python', 'perl', 'ruby'];
    if (suspiciousNames.some(name => proc.name.toLowerCase().includes(name))) {
      riskScore += 20;
    }

    // Check for suspicious command-line patterns
    const suspiciousPatterns = [
      /iex\s+\(/i,                    // PowerShell Invoke-Expression
      /downloadstring/i,               // Download from internet
      /frombase64/i,                   // Base64 encoded commands
      /-encodedcommand/i,              // PowerShell encoded command
      /wget.*\|.*bash/i,               // Wget pipe to bash
      /curl.*\|.*sh/i,                 // Curl pipe to shell
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(proc.commandLine)) {
        riskScore += 30;
        break;
      }
    }

    // Check for rapid process spawning (same parent)
    const siblingCount = Array.from(this.processes.values())
      .filter(p => p.ppid === proc.ppid)
      .length;
    
    if (siblingCount > 10) {
      riskScore += 25;
    }

    return Math.min(riskScore, 100);
  }

  /**
   * Get current process snapshot
   */
  getSnapshot(): ProcessInfo[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get process count
   */
  getProcessCount(): number {
    return this.processes.size;
  }
}
