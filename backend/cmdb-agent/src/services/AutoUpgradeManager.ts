/**
 * Auto-Upgrade Manager
 * Handles automatic updates and version management
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface VersionInfo {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  sha256: string;
  size: number;
  changelog: string[];
  critical: boolean;
}

export interface UpdateConfig {
  apiBaseUrl: string;
  currentVersion: string;
  installPath: string;
  checkIntervalHours: number;
  autoInstall: boolean;
}

export class AutoUpgradeManager extends EventEmitter {
  private config: UpdateConfig;
  private checkTimer: NodeJS.Timeout | null = null;
  private isUpdating: boolean = false;

  constructor(config: UpdateConfig) {
    super();
    this.config = config;
  }

  /**
   * Start automatic update checking
   */
  start(): void {
    if (this.checkTimer) {
      logger.warn('Auto-upgrade manager already started');
      return;
    }

    logger.info('Starting auto-upgrade manager', {
      currentVersion: this.config.currentVersion,
      checkInterval: `${this.config.checkIntervalHours}h`,
    });

    // Initial check after 5 minutes
    setTimeout(() => this.checkForUpdates(), 5 * 60 * 1000);

    // Schedule periodic checks
    const intervalMs = this.config.checkIntervalHours * 60 * 60 * 1000;
    this.checkTimer = setInterval(() => {
      this.checkForUpdates().catch((error) => {
        logger.error('Update check failed', { error: error.message });
      });
    }, intervalMs);
  }

  /**
   * Stop automatic update checking
   */
  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
      logger.info('Auto-upgrade manager stopped');
    }
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<VersionInfo | null> {
    try {
      logger.info('Checking for updates...', { currentVersion: this.config.currentVersion });

      const versionInfo = await this.fetchLatestVersion();

      if (!versionInfo) {
        logger.info('No update information available');
        return null;
      }

      // Compare versions
      if (this.compareVersions(versionInfo.version, this.config.currentVersion) <= 0) {
        logger.info('Already on latest version', { version: this.config.currentVersion });
        this.emit('up_to_date', { version: this.config.currentVersion });
        return null;
      }

      logger.info('Update available', {
        currentVersion: this.config.currentVersion,
        newVersion: versionInfo.version,
        critical: versionInfo.critical,
      });

      this.emit('update_available', versionInfo);

      // Auto-install if enabled
      if (this.config.autoInstall || versionInfo.critical) {
        logger.info('Auto-installing update', { version: versionInfo.version });
        await this.downloadAndInstall(versionInfo);
      }

      return versionInfo;
    } catch (error: any) {
      logger.error('Failed to check for updates', { error: error.message });
      this.emit('check_error', error);
      throw error;
    }
  }

  /**
   * Fetch latest version information from API
   */
  private async fetchLatestVersion(): Promise<VersionInfo | null> {
    const url = `${this.config.apiBaseUrl}/api/downloads/agent-info`;

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, { timeout: 30000 }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            
            // Extract version info from response
            const versionInfo: VersionInfo = {
              version: json.version,
              releaseDate: json.releaseDate,
              downloadUrl: this.getDownloadUrl(json),
              sha256: this.getSha256(json),
              size: this.getSize(json),
              changelog: json.changelog || [],
              critical: json.critical || false,
            };

            resolve(versionInfo);
          } catch (error: any) {
            reject(new Error(`Failed to parse version info: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get platform-specific download URL
   */
  private getDownloadUrl(info: any): string {
    const platform = process.platform;
    
    if (platform === 'win32') {
      return info.downloads?.standalone?.windows?.url || '';
    } else if (platform === 'linux') {
      return info.downloads?.standalone?.linux?.url || '';
    }
    
    throw new Error(`Unsupported platform: ${platform}`);
  }

  /**
   * Get platform-specific SHA256
   */
  private getSha256(info: any): string {
    const platform = process.platform;
    
    if (platform === 'win32') {
      return info.downloads?.standalone?.windows?.sha256 || '';
    } else if (platform === 'linux') {
      return info.downloads?.standalone?.linux?.sha256 || '';
    }
    
    return '';
  }

  /**
   * Get platform-specific file size
   */
  private getSize(info: any): number {
    const platform = process.platform;
    
    if (platform === 'win32') {
      const size = info.downloads?.standalone?.windows?.size || '0';
      return this.parseSizeString(size);
    } else if (platform === 'linux') {
      const size = info.downloads?.standalone?.linux?.size || '0';
      return this.parseSizeString(size);
    }
    
    return 0;
  }

  /**
   * Parse size string (e.g., "42.3 MB") to bytes
   */
  private parseSizeString(sizeStr: string): number {
    const match = sizeStr.match(/([\d.]+)\s*([KMGT]?B)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    const multipliers: Record<string, number> = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024,
    };

    return Math.floor(value * (multipliers[unit] || 1));
  }

  /**
   * Download and install update
   */
  async downloadAndInstall(versionInfo: VersionInfo): Promise<void> {
    if (this.isUpdating) {
      logger.warn('Update already in progress');
      return;
    }

    this.isUpdating = true;

    try {
      logger.info('Starting update download', { version: versionInfo.version });
      this.emit('download_start', versionInfo);

      // Download update file
      const downloadPath = await this.downloadFile(versionInfo);

      // Verify integrity
      logger.info('Verifying download integrity');
      const isValid = await this.verifyChecksum(downloadPath, versionInfo.sha256);
      
      if (!isValid) {
        throw new Error('Download integrity check failed');
      }

      this.emit('download_complete', { path: downloadPath });

      // Install update
      logger.info('Installing update', { version: versionInfo.version });
      await this.installUpdate(downloadPath, versionInfo);

      logger.info('Update installed successfully', { version: versionInfo.version });
      this.emit('install_complete', versionInfo);

    } catch (error: any) {
      logger.error('Update failed', { error: error.message });
      this.emit('update_error', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Download file with progress tracking
   */
  private async downloadFile(versionInfo: VersionInfo): Promise<string> {
    const fullUrl = versionInfo.downloadUrl.startsWith('http')
      ? versionInfo.downloadUrl
      : `${this.config.apiBaseUrl}${versionInfo.downloadUrl}`;

    const fileName = path.basename(versionInfo.downloadUrl);
    const downloadPath = path.join(this.config.installPath, 'updates', fileName);

    // Ensure updates directory exists
    const updateDir = path.dirname(downloadPath);
    await fs.promises.mkdir(updateDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const protocol = fullUrl.startsWith('https') ? https : http;
      
      protocol.get(fullUrl, (res) => {
        const fileStream = fs.createWriteStream(downloadPath);
        const totalSize = parseInt(res.headers['content-length'] || '0', 10);
        let downloadedSize = 0;

        res.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = totalSize > 0 ? (downloadedSize / totalSize) * 100 : 0;
          
          this.emit('download_progress', {
            downloaded: downloadedSize,
            total: totalSize,
            progress: progress.toFixed(2),
          });
        });

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(downloadPath);
        });

        fileStream.on('error', (error) => {
          fs.unlink(downloadPath, () => {});
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Verify file checksum
   */
  private async verifyChecksum(filePath: string, expectedSha256: string): Promise<boolean> {
    if (!expectedSha256) {
      logger.warn('No checksum provided, skipping verification');
      return true;
    }

    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => {
        const actualSha256 = hash.digest('hex');
        const isValid = actualSha256.toLowerCase() === expectedSha256.toLowerCase();
        
        if (!isValid) {
          logger.error('Checksum mismatch', { expected: expectedSha256, actual: actualSha256 });
        }
        
        resolve(isValid);
      });
      stream.on('error', reject);
    });
  }

  /**
   * Install downloaded update
   */
  private async installUpdate(downloadPath: string, versionInfo: VersionInfo): Promise<void> {
    const platform = process.platform;

    if (platform === 'win32') {
      await this.installWindowsUpdate(downloadPath, versionInfo);
    } else if (platform === 'linux') {
      await this.installLinuxUpdate(downloadPath, versionInfo);
    } else {
      throw new Error(`Update installation not supported on ${platform}`);
    }
  }

  /**
   * Install Windows update
   */
  private async installWindowsUpdate(downloadPath: string, versionInfo: VersionInfo): Promise<void> {
    // Create update script
    const scriptPath = path.join(path.dirname(downloadPath), 'update.bat');
    const script = `
@echo off
echo Stopping CMDB Agent service...
sc stop cmdb-agent
timeout /t 5 /nobreak

echo Backing up current version...
move /Y "${this.config.installPath}\\cmdb-agent.exe" "${this.config.installPath}\\cmdb-agent.exe.backup"

echo Installing new version...
copy /Y "${downloadPath}" "${this.config.installPath}\\cmdb-agent.exe"

echo Starting CMDB Agent service...
sc start cmdb-agent

echo Update completed successfully!
del "%~f0"
`;

    await fs.promises.writeFile(scriptPath, script);

    // Schedule update script to run
    logger.info('Scheduling update installation');
    await execAsync(`start /MIN cmd.exe /c "${scriptPath}"`);
  }

  /**
   * Install Linux update
   */
  private async installLinuxUpdate(downloadPath: string, versionInfo: VersionInfo): Promise<void> {
    // Create update script
    const scriptPath = path.join(path.dirname(downloadPath), 'update.sh');
    const script = `#!/bin/bash
echo "Stopping CMDB Agent service..."
systemctl stop cmdb-agent

echo "Backing up current version..."
mv "${this.config.installPath}/cmdb-agent" "${this.config.installPath}/cmdb-agent.backup"

echo "Installing new version..."
cp "${downloadPath}" "${this.config.installPath}/cmdb-agent"
chmod +x "${this.config.installPath}/cmdb-agent"

echo "Starting CMDB Agent service..."
systemctl start cmdb-agent

echo "Update completed successfully!"
rm -f "$0"
`;

    await fs.promises.writeFile(scriptPath, script);
    await fs.promises.chmod(scriptPath, 0o755);

    // Schedule update script to run
    logger.info('Scheduling update installation');
    await execAsync(`nohup bash "${scriptPath}" > /dev/null 2>&1 &`);
  }

  /**
   * Compare semantic versions
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(p => parseInt(p, 10));
    const parts2 = v2.split('.').map(p => parseInt(p, 10));

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }
}
