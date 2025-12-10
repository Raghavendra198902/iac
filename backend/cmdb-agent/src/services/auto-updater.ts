/**
 * Auto-Update Service
 * 
 * Checks for updates from the CMDB server and automatically updates the agent
 * Supports all platforms with platform-specific update mechanisms
 */

import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as crypto from 'crypto';
import * as os from 'os';
import logger from '../utils/logger';

const execAsync = promisify(exec);

interface UpdateInfo {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  checksum: string;
  checksumAlgorithm: string;
  releaseNotes: string;
  mandatory: boolean;
  platform: string;
  architecture: string;
}

interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateInfo?: UpdateInfo;
}

export class AutoUpdater {
  private serverUrl: string;
  private currentVersion: string;
  private updateCheckInterval: number;
  private platform: string;
  private architecture: string;
  private updateInProgress: boolean = false;
  private apiKey?: string;

  constructor(
    serverUrl: string,
    currentVersion: string = '1.0.0',
    updateCheckInterval: number = 3600000, // 1 hour
    apiKey?: string
  ) {
    this.serverUrl = serverUrl;
    this.currentVersion = currentVersion;
    this.updateCheckInterval = updateCheckInterval;
    this.platform = this.detectPlatform();
    this.architecture = os.arch();
    this.apiKey = apiKey;
  }

  private detectPlatform(): string {
    const platform = os.platform();
    switch (platform) {
      case 'win32': return 'windows';
      case 'darwin': return 'macos';
      case 'linux': return 'linux';
      case 'android': return 'android';
      default: return platform;
    }
  }

  /**
   * Start automatic update checking
   */
  start(): void {
    logger.info('🔄 Auto-updater started');
    logger.info(`   Current version: ${this.currentVersion}`);
    logger.info(`   Check interval: ${this.updateCheckInterval}ms`);
    logger.info(`   Platform: ${this.platform} ${this.architecture}`);

    // Initial check
    this.checkForUpdates();

    // Periodic checks
    setInterval(() => {
      this.checkForUpdates();
    }, this.updateCheckInterval);
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      logger.info('🔍 Checking for updates...');

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.get(
        `${this.serverUrl}/api/updates/check`,
        {
          params: {
            version: this.currentVersion,
            platform: this.platform,
            architecture: this.architecture,
          },
          headers,
          timeout: 10000,
        }
      );

      const result: UpdateCheckResult = {
        updateAvailable: response.data.updateAvailable,
        currentVersion: this.currentVersion,
        latestVersion: response.data.latestVersion,
        updateInfo: response.data.updateInfo,
      };

      if (result.updateAvailable) {
        logger.info(`✨ Update available: ${result.latestVersion}`);
        
        // Auto-install if enabled and not in progress
        if (process.env.AUTO_UPDATE === 'true' && !this.updateInProgress) {
          await this.downloadAndInstall(result.updateInfo!);
        } else {
          logger.info('ℹ️  Auto-update is disabled. Update available but not installing.');
        }
      } else {
        logger.info('✅ Agent is up to date');
      }

      return result;
    } catch (error: any) {
      logger.error('❌ Update check failed:', error.message);
      return {
        updateAvailable: false,
        currentVersion: this.currentVersion,
      };
    }
  }

  /**
   * Download and install update
   */
  private async downloadAndInstall(updateInfo: UpdateInfo): Promise<void> {
    if (this.updateInProgress) {
      logger.info('⚠️  Update already in progress');
      return;
    }

    this.updateInProgress = true;

    try {
      logger.info(`📥 Downloading update ${updateInfo.version}...`);

      // Download update
      const updateFile = await this.downloadUpdate(updateInfo);

      // Verify checksum
      logger.info('🔐 Verifying checksum...');
      const isValid = await this.verifyChecksum(updateFile, updateInfo.checksum, updateInfo.checksumAlgorithm);
      
      if (!isValid) {
        throw new Error('Checksum verification failed');
      }

      logger.info('✅ Checksum verified');

      // Install update based on platform
      await this.installUpdate(updateFile, updateInfo);

      logger.info('✅ Update installed successfully');
      logger.info('🔄 Restarting agent...');

      // Restart agent
      await this.restartAgent();
    } catch (error: any) {
      logger.error('❌ Update installation failed:', error.message);
    } finally {
      this.updateInProgress = false;
    }
  }

  /**
   * Download update file
   */
  private async downloadUpdate(updateInfo: UpdateInfo): Promise<string> {
    const headers: any = {};
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await axios.get(updateInfo.downloadUrl, {
      responseType: 'arraybuffer',
      headers,
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        process.stdout.write(`\r📥 Downloading: ${percentCompleted}%`);
      },
    });

    logger.info(''); // New line after progress

    const tempDir = os.tmpdir();
    const extension = this.getUpdateFileExtension();
    const updateFile = path.join(tempDir, `cmdb-agent-update-${updateInfo.version}${extension}`);

    await fs.writeFile(updateFile, response.data);

    return updateFile;
  }

  /**
   * Get file extension based on platform
   */
  private getUpdateFileExtension(): string {
    switch (this.platform) {
      case 'windows': return '.msi';
      case 'macos': return '.pkg';
      case 'linux': return '.deb'; // or .rpm
      case 'android': return '.apk';
      case 'ios': return '.ipa';
      default: return '.bin';
    }
  }

  /**
   * Verify file checksum
   */
  private async verifyChecksum(filePath: string, expectedChecksum: string, algorithm: string): Promise<boolean> {
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash(algorithm);
    hash.update(fileBuffer);
    const actualChecksum = hash.digest('hex');

    return actualChecksum === expectedChecksum;
  }

  /**
   * Install update based on platform
   */
  private async installUpdate(updateFile: string, updateInfo: UpdateInfo): Promise<void> {
    logger.info(`🔧 Installing update for ${this.platform}...`);

    switch (this.platform) {
      case 'windows':
        await this.installWindowsUpdate(updateFile);
        break;
      
      case 'macos':
        await this.installMacOSUpdate(updateFile);
        break;
      
      case 'linux':
        await this.installLinuxUpdate(updateFile);
        break;
      
      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  /**
   * Install Windows MSI update
   */
  private async installWindowsUpdate(msiFile: string): Promise<void> {
    // Silent install with logging
    const logFile = path.join(os.tmpdir(), 'cmdb-agent-update.log');
    const command = `msiexec /i "${msiFile}" /qn /l*v "${logFile}" REINSTALL=ALL REINSTALLMODE=vomus`;
    
    await execAsync(command);
  }

  /**
   * Install macOS PKG update
   */
  private async installMacOSUpdate(pkgFile: string): Promise<void> {
    // Install package (requires sudo)
    const command = `sudo installer -pkg "${pkgFile}" -target /`;
    
    await execAsync(command);
  }

  /**
   * Install Linux update
   */
  private async installLinuxUpdate(packageFile: string): Promise<void> {
    // Detect package manager
    const extension = path.extname(packageFile);
    
    if (extension === '.deb') {
      // Debian/Ubuntu
      await execAsync(`sudo dpkg -i "${packageFile}"`);
    } else if (extension === '.rpm') {
      // RHEL/CentOS/Fedora
      await execAsync(`sudo rpm -Uvh "${packageFile}"`);
    } else {
      throw new Error(`Unsupported package format: ${extension}`);
    }
  }

  /**
   * Restart the agent
   */
  private async restartAgent(): Promise<void> {
    switch (this.platform) {
      case 'windows':
        // Restart Windows service
        await execAsync('net stop "IAC Dharma CMDB Agent" && net start "IAC Dharma CMDB Agent"');
        break;
      
      case 'linux':
        // Restart systemd service
        await execAsync('sudo systemctl restart cmdb-agent');
        break;
      
      case 'macos':
        // Restart launchd service
        await execAsync('sudo launchctl stop com.iacdharma.cmdb-agent && sudo launchctl start com.iacdharma.cmdb-agent');
        break;
      
      default:
        // Fallback: exit process (should be managed by process manager)
        process.exit(0);
    }
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Manually trigger update check
   */
  async triggerUpdate(): Promise<UpdateCheckResult> {
    return await this.checkForUpdates();
  }
}

export default AutoUpdater;
