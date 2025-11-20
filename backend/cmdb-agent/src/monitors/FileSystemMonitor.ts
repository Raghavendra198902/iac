/**
 * Filesystem Monitor
 * Watches critical files and directories for changes
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from '../utils/logger';

export interface FileChange {
  path: string;
  type: 'file' | 'directory';
  changeType: 'created' | 'modified' | 'deleted';
  size?: number;
  modifiedTime?: Date;
  timestamp: Date;
}

export interface FileSystemEvent {
  type: 'file_created' | 'file_modified' | 'file_deleted' | 'directory_created' | 'directory_deleted';
  change: FileChange;
  timestamp: Date;
}

export class FileSystemMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private fileStates: Map<string, { size: number; mtime: Date }> = new Map();

  // Critical paths to monitor (platform-specific)
  private monitoredPaths: string[] = [];

  constructor() {
    super();
    this.initializeMonitoredPaths();
  }

  /**
   * Initialize platform-specific critical paths
   */
  private initializeMonitoredPaths(): void {
    const platform = os.platform();

    switch (platform) {
      case 'linux':
        this.monitoredPaths = [
          '/etc/passwd',
          '/etc/shadow',
          '/etc/sudoers',
          '/etc/ssh/sshd_config',
          '/etc/hosts',
          '/etc/crontab',
          '/var/spool/cron',
          '/etc/systemd/system',
          '/root/.ssh',
        ];
        break;

      case 'win32':
        this.monitoredPaths = [
          'C:\\Windows\\System32\\drivers\\etc\\hosts',
          'C:\\Windows\\System32\\config',
          'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup',
          'C:\\Users\\Public\\Desktop',
        ];
        break;

      case 'darwin':
        this.monitoredPaths = [
          '/etc/passwd',
          '/etc/hosts',
          '/private/etc/ssh/sshd_config',
          '/Library/LaunchDaemons',
          '/Library/LaunchAgents',
        ];
        break;

      default:
        logger.warn('Filesystem monitoring paths not configured for platform', { platform });
    }

    // Filter out paths that don't exist
    this.monitoredPaths = this.monitoredPaths.filter((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });

    logger.info('Filesystem monitor initialized', {
      platform,
      pathCount: this.monitoredPaths.length,
    });
  }

  /**
   * Start monitoring filesystem
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Filesystem monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting filesystem monitor', {
      paths: this.monitoredPaths.length,
    });

    // Initialize file states
    for (const monitorPath of this.monitoredPaths) {
      try {
        const stats = fs.statSync(monitorPath);
        
        if (stats.isFile()) {
          this.fileStates.set(monitorPath, {
            size: stats.size,
            mtime: stats.mtime,
          });
        }

        // Set up watcher
        this.setupWatcher(monitorPath);
      } catch (error: any) {
        logger.error('Failed to setup filesystem watch', {
          path: monitorPath,
          error: error.message,
        });
      }
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Close all watchers
    for (const [path, watcher] of this.watchers.entries()) {
      try {
        watcher.close();
      } catch (error) {
        logger.error('Failed to close watcher', { path });
      }
    }

    this.watchers.clear();
    this.fileStates.clear();

    logger.info('Filesystem monitor stopped');
  }

  /**
   * Setup watcher for a path
   */
  private setupWatcher(watchPath: string): void {
    try {
      const watcher = fs.watch(watchPath, { recursive: false }, (eventType, filename) => {
        this.handleFileSystemChange(watchPath, eventType, filename);
      });

      this.watchers.set(watchPath, watcher);

      logger.debug('Filesystem watcher created', { path: watchPath });
    } catch (error: any) {
      logger.error('Failed to create filesystem watcher', {
        path: watchPath,
        error: error.message,
      });
    }
  }

  /**
   * Handle filesystem change event
   */
  private handleFileSystemChange(watchPath: string, eventType: string, filename: string | null): void {
    try {
      const fullPath = filename ? path.join(watchPath, filename) : watchPath;

      // Check if path exists
      let stats: fs.Stats | null = null;
      let exists = false;

      try {
        stats = fs.statSync(fullPath);
        exists = true;
      } catch {
        exists = false;
      }

      const previousState = this.fileStates.get(fullPath);

      if (exists && stats) {
        const isFile = stats.isFile();
        const isDirectory = stats.isDirectory();

        if (isFile) {
          const currentState = {
            size: stats.size,
            mtime: stats.mtime,
          };

          if (!previousState) {
            // File created
            this.fileStates.set(fullPath, currentState);

            const change: FileChange = {
              path: fullPath,
              type: 'file',
              changeType: 'created',
              size: stats.size,
              modifiedTime: stats.mtime,
              timestamp: new Date(),
            };

            const event: FileSystemEvent = {
              type: 'file_created',
              change,
              timestamp: new Date(),
            };

            logger.info('File created', { path: fullPath });
            this.emit('filesystem_event', event);
          } else if (
            currentState.size !== previousState.size ||
            currentState.mtime.getTime() !== previousState.mtime.getTime()
          ) {
            // File modified
            this.fileStates.set(fullPath, currentState);

            const change: FileChange = {
              path: fullPath,
              type: 'file',
              changeType: 'modified',
              size: stats.size,
              modifiedTime: stats.mtime,
              timestamp: new Date(),
            };

            const event: FileSystemEvent = {
              type: 'file_modified',
              change,
              timestamp: new Date(),
            };

            logger.warn('Critical file modified', { path: fullPath });
            this.emit('filesystem_event', event);
          }
        } else if (isDirectory && !previousState) {
          // Directory created
          const change: FileChange = {
            path: fullPath,
            type: 'directory',
            changeType: 'created',
            timestamp: new Date(),
          };

          const event: FileSystemEvent = {
            type: 'directory_created',
            change,
            timestamp: new Date(),
          };

          logger.info('Directory created', { path: fullPath });
          this.emit('filesystem_event', event);
        }
      } else if (!exists && previousState) {
        // File deleted
        this.fileStates.delete(fullPath);

        const change: FileChange = {
          path: fullPath,
          type: 'file',
          changeType: 'deleted',
          timestamp: new Date(),
        };

        const event: FileSystemEvent = {
          type: 'file_deleted',
          change,
          timestamp: new Date(),
        };

        logger.warn('Critical file deleted', { path: fullPath });
        this.emit('filesystem_event', event);
      }
    } catch (error: any) {
      logger.error('Error handling filesystem change', {
        watchPath,
        error: error.message,
      });
    }
  }

  /**
   * Add custom path to monitor
   */
  addPath(customPath: string): boolean {
    try {
      if (!fs.existsSync(customPath)) {
        logger.warn('Cannot monitor non-existent path', { path: customPath });
        return false;
      }

      if (this.watchers.has(customPath)) {
        logger.warn('Path already being monitored', { path: customPath });
        return false;
      }

      this.monitoredPaths.push(customPath);

      if (this.isRunning) {
        const stats = fs.statSync(customPath);
        
        if (stats.isFile()) {
          this.fileStates.set(customPath, {
            size: stats.size,
            mtime: stats.mtime,
          });
        }

        this.setupWatcher(customPath);
      }

      logger.info('Added custom path to filesystem monitor', { path: customPath });
      return true;
    } catch (error: any) {
      logger.error('Failed to add custom path', {
        path: customPath,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Remove path from monitoring
   */
  removePath(customPath: string): boolean {
    try {
      const watcher = this.watchers.get(customPath);
      
      if (watcher) {
        watcher.close();
        this.watchers.delete(customPath);
      }

      this.fileStates.delete(customPath);
      this.monitoredPaths = this.monitoredPaths.filter((p) => p !== customPath);

      logger.info('Removed path from filesystem monitor', { path: customPath });
      return true;
    } catch (error: any) {
      logger.error('Failed to remove path', {
        path: customPath,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get monitored paths
   */
  getMonitoredPaths(): string[] {
    return [...this.monitoredPaths];
  }

  /**
   * Get count of monitored items
   */
  getMonitoredCount(): number {
    return this.monitoredPaths.length;
  }

  /**
   * Check if path is being monitored
   */
  isMonitoring(customPath: string): boolean {
    return this.watchers.has(customPath);
  }
}
