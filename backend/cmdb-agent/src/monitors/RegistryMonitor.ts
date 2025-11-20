/**
 * Windows Registry Monitor
 * Tracks changes to critical Windows Registry keys (Windows only)
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface RegistryKey {
  path: string;
  name: string;
  value: string;
  type: string;
  timestamp: Date;
}

export interface RegistryEvent {
  type: 'registry_added' | 'registry_modified' | 'registry_deleted';
  key: RegistryKey;
  previousValue?: string;
  timestamp: Date;
}

export class RegistryMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private knownKeys: Map<string, RegistryKey> = new Map();
  private readonly POLL_INTERVAL_MS = 15000; // Check every 15 seconds

  // Critical registry paths to monitor
  private readonly MONITORED_PATHS = [
    'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
    'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce',
    'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
    'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce',
    'HKLM\\SYSTEM\\CurrentControlSet\\Services',
    'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon',
    'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager',
  ];

  constructor() {
    super();

    // Registry monitoring only works on Windows
    if (os.platform() !== 'win32') {
      logger.info('Registry monitoring is Windows-only - monitor will not start');
    }
  }

  /**
   * Start monitoring registry keys
   */
  async start(): Promise<void> {
    if (os.platform() !== 'win32') {
      logger.warn('Registry monitor cannot start - not on Windows');
      return;
    }

    if (this.isRunning) {
      logger.warn('Registry monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting Windows Registry monitor');

    // Initial scan
    await this.scanRegistryKeys();

    // Start polling
    this.pollInterval = setInterval(() => {
      this.scanRegistryKeys().catch((error) => {
        logger.error('Registry scan error', { error: error.message });
      });
    }, this.POLL_INTERVAL_MS);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    logger.info('Registry monitor stopped');
  }

  /**
   * Scan registry keys and detect changes
   */
  private async scanRegistryKeys(): Promise<void> {
    try {
      const currentKeys = new Map<string, RegistryKey>();

      // Scan each monitored path
      for (const path of this.MONITORED_PATHS) {
        const keys = await this.getRegistryKeys(path);
        for (const key of keys) {
          const keyId = `${key.path}\\${key.name}`;
          currentKeys.set(keyId, key);
        }
      }

      // Detect changes
      for (const [keyId, key] of currentKeys.entries()) {
        const previousKey = this.knownKeys.get(keyId);

        if (!previousKey) {
          // New key added
          const event: RegistryEvent = {
            type: 'registry_added',
            key,
            timestamp: new Date(),
          };

          logger.info('Registry key added', {
            path: key.path,
            name: key.name,
            value: key.value,
          });

          this.emit('registry_event', event);
        } else if (previousKey.value !== key.value) {
          // Key modified
          const event: RegistryEvent = {
            type: 'registry_modified',
            key,
            previousValue: previousKey.value,
            timestamp: new Date(),
          };

          logger.warn('Registry key modified', {
            path: key.path,
            name: key.name,
            oldValue: previousKey.value,
            newValue: key.value,
          });

          this.emit('registry_event', event);
        }
      }

      // Detect deleted keys
      for (const [keyId, key] of this.knownKeys.entries()) {
        if (!currentKeys.has(keyId)) {
          const event: RegistryEvent = {
            type: 'registry_deleted',
            key,
            timestamp: new Date(),
          };

          logger.warn('Registry key deleted', {
            path: key.path,
            name: key.name,
          });

          this.emit('registry_event', event);
        }
      }

      // Update known keys
      this.knownKeys = currentKeys;
    } catch (error: any) {
      logger.error('Failed to scan registry keys', { error: error.message });
    }
  }

  /**
   * Get registry keys from a path using reg query
   */
  private async getRegistryKeys(path: string): Promise<RegistryKey[]> {
    try {
      const { stdout } = await execAsync(`reg query "${path}" /s`, {
        timeout: 10000,
      });

      const keys: RegistryKey[] = [];
      const lines = stdout.split('\n').filter(line => line.trim());

      let currentPath = '';

      for (const line of lines) {
        const trimmed = line.trim();

        // Check if this is a path line (starts with HKEY)
        if (trimmed.startsWith('HKEY')) {
          currentPath = trimmed;
          continue;
        }

        // Parse value lines: "    ValueName    REG_SZ    ValueData"
        const match = trimmed.match(/^\s*(\S+)\s+(REG_\w+)\s+(.*)$/);
        
        if (match && currentPath) {
          const [, name, type, value] = match;

          // Skip (Default) entries
          if (name === '(Default)') continue;

          keys.push({
            path: currentPath,
            name,
            value: value.trim(),
            type,
            timestamp: new Date(),
          });
        }
      }

      return keys;
    } catch (error: any) {
      // Path might not exist or access denied - this is normal
      if (!error.message.includes('The system cannot find') && 
          !error.message.includes('Access is denied')) {
        logger.debug('Registry query error', { path, error: error.message });
      }
      return [];
    }
  }

  /**
   * Get count of monitored keys
   */
  getKeyCount(): number {
    return this.knownKeys.size;
  }

  /**
   * Get all monitored keys
   */
  getKeys(): RegistryKey[] {
    return Array.from(this.knownKeys.values());
  }

  /**
   * Check if a specific key exists
   */
  keyExists(path: string, name: string): boolean {
    const keyId = `${path}\\${name}`;
    return this.knownKeys.has(keyId);
  }

  /**
   * Get monitored paths
   */
  getMonitoredPaths(): string[] {
    return [...this.MONITORED_PATHS];
  }
}
