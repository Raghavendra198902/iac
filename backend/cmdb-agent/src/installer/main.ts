/**
 * CMDB Agent GUI Installer - Main Process
 * Cross-platform Electron-based installer with configuration wizard
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface InstallConfig {
  installPath: string;
  apiServerUrl: string;
  autoStart: boolean;
  autoUpdate: boolean;
  createShortcuts: boolean;
  agentName: string;
  organizationId?: string;
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    center: true,
    title: 'CMDB Agent Installer',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, '../installer-ui/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

/**
 * Get system information
 */
ipcMain.handle('get-system-info', async () => {
  const platform = os.platform();
  const defaultPath = platform === 'win32'
    ? 'C:\\Program Files\\CMDB Agent'
    : '/opt/cmdb-agent';

  return {
    platform: platform,
    platformName: getPlatformName(platform),
    arch: os.arch(),
    hostname: os.hostname(),
    defaultInstallPath: defaultPath,
    isAdmin: await checkAdmin(),
  };
});

/**
 * Validate installation path
 */
ipcMain.handle('validate-path', async (_event, installPath: string) => {
  try {
    // Check if path is writable
    const testFile = path.join(installPath, '.write-test');
    await fs.mkdir(installPath, { recursive: true });
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
});

/**
 * Test API server connectivity
 */
ipcMain.handle('test-connection', async (_event, apiUrl: string) => {
  try {
    const https = apiUrl.startsWith('https:') ? require('https') : require('http');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Connection timeout' });
      }, 10000);

      https.get(`${apiUrl}/api/health`, (res: any) => {
        clearTimeout(timeout);
        if (res.statusCode === 200) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}` });
        }
      }).on('error', (error: Error) => {
        clearTimeout(timeout);
        resolve({ success: false, error: error.message });
      });
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

/**
 * Perform installation
 */
ipcMain.handle('install', async (_event, config: InstallConfig) => {
  try {
    sendProgress('Starting installation...', 0);

    // Step 1: Create installation directory
    sendProgress('Creating installation directory...', 10);
    await fs.mkdir(config.installPath, { recursive: true });

    // Step 2: Copy agent files
    sendProgress('Copying agent files...', 20);
    await copyAgentFiles(config.installPath);

    // Step 3: Create configuration
    sendProgress('Creating configuration...', 40);
    await createConfiguration(config);

    // Step 4: Install as service
    sendProgress('Installing service...', 60);
    await installService(config);

    // Step 5: Create shortcuts
    if (config.createShortcuts) {
      sendProgress('Creating shortcuts...', 80);
      await createShortcuts(config);
    }

    // Step 6: Start service
    if (config.autoStart) {
      sendProgress('Starting service...', 90);
      await startService();
    }

    sendProgress('Installation completed successfully!', 100);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

/**
 * Uninstall agent
 */
ipcMain.handle('uninstall', async (_event, installPath: string) => {
  try {
    sendProgress('Starting uninstallation...', 0);

    // Stop service
    sendProgress('Stopping service...', 20);
    await stopService();

    // Uninstall service
    sendProgress('Uninstalling service...', 40);
    await uninstallService();

    // Remove files
    sendProgress('Removing files...', 60);
    await fs.rm(installPath, { recursive: true, force: true });

    // Remove shortcuts
    sendProgress('Removing shortcuts...', 80);
    await removeShortcuts();

    sendProgress('Uninstallation completed!', 100);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Helper Functions

function getPlatformName(platform: string): string {
  switch (platform) {
    case 'win32': return 'Windows';
    case 'linux': return 'Linux';
    case 'darwin': return 'macOS';
    default: return platform;
  }
}

async function checkAdmin(): Promise<boolean> {
  const platform = os.platform();
  
  if (platform === 'win32') {
    try {
      await execAsync('net session');
      return true;
    } catch {
      return false;
    }
  } else {
    return process.getuid?.() === 0;
  }
}

async function copyAgentFiles(installPath: string): Promise<void> {
  const platform = os.platform();
  const sourceFile = platform === 'win32' ? 'cmdb-agent.exe' : 'cmdb-agent';
  const sourcePath = path.join(__dirname, '../../dist', sourceFile);
  const destPath = path.join(installPath, sourceFile);

  await fs.copyFile(sourcePath, destPath);
  
  if (platform !== 'win32') {
    await fs.chmod(destPath, 0o755);
  }
}

async function createConfiguration(config: InstallConfig): Promise<void> {
  const configPath = path.join(config.installPath, 'config.json');
  
  const agentConfig = {
    version: '1.0.0',
    agentName: config.agentName,
    organizationId: config.organizationId,
    apiServerUrl: config.apiServerUrl,
    autoUpdate: config.autoUpdate,
    updateCheckIntervalHours: 24,
    monitoring: {
      processes: true,
      registry: true,
      usb: true,
      network: true,
      filesystem: true,
    },
    telemetry: {
      batchSize: 100,
      flushIntervalSeconds: 60,
    },
  };

  await fs.writeFile(configPath, JSON.stringify(agentConfig, null, 2));
}

async function installService(config: InstallConfig): Promise<void> {
  const platform = os.platform();

  if (platform === 'win32') {
    await installWindowsService(config);
  } else if (platform === 'linux') {
    await installLinuxService(config);
  }
}

async function installWindowsService(config: InstallConfig): Promise<void> {
  const execPath = path.join(config.installPath, 'cmdb-agent.exe');
  
  const commands = [
    `sc create cmdb-agent binPath= "\\"${execPath}\\" --service" DisplayName= "CMDB Agent" start= auto`,
    `sc description cmdb-agent "Enterprise endpoint monitoring and enforcement agent"`,
    `sc failure cmdb-agent reset= 86400 actions= restart/5000/restart/10000/restart/30000`,
  ];

  for (const cmd of commands) {
    await execAsync(cmd);
  }
}

async function installLinuxService(config: InstallConfig): Promise<void> {
  const execPath = path.join(config.installPath, 'cmdb-agent');
  
  const serviceContent = `[Unit]
Description=CMDB Agent
After=network.target

[Service]
Type=simple
ExecStart=${execPath} --service
WorkingDirectory=${config.installPath}
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
`;

  await fs.writeFile('/etc/systemd/system/cmdb-agent.service', serviceContent);
  await execAsync('systemctl daemon-reload');
  await execAsync('systemctl enable cmdb-agent');
}

async function startService(): Promise<void> {
  const platform = os.platform();
  
  if (platform === 'win32') {
    await execAsync('sc start cmdb-agent');
  } else if (platform === 'linux') {
    await execAsync('systemctl start cmdb-agent');
  }
}

async function stopService(): Promise<void> {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      await execAsync('sc stop cmdb-agent');
    } else if (platform === 'linux') {
      await execAsync('systemctl stop cmdb-agent');
    }
  } catch (error) {
    // Service might not be running
  }
}

async function uninstallService(): Promise<void> {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      await execAsync('sc delete cmdb-agent');
    } else if (platform === 'linux') {
      await execAsync('systemctl disable cmdb-agent');
      await fs.unlink('/etc/systemd/system/cmdb-agent.service');
      await execAsync('systemctl daemon-reload');
    }
  } catch (error) {
    // Service might not exist
  }
}

async function createShortcuts(config: InstallConfig): Promise<void> {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Create Start Menu shortcut
    const shell = require('os').homedir();
    const startMenuPath = path.join(shell, 'AppData/Roaming/Microsoft/Windows/Start Menu/Programs/CMDB Agent.lnk');
    // Would use windows-shortcuts package in production
  }
}

async function removeShortcuts(): Promise<void> {
  const platform = os.platform();
  
  if (platform === 'win32') {
    const shell = require('os').homedir();
    const startMenuPath = path.join(shell, 'AppData/Roaming/Microsoft/Windows/Start Menu/Programs/CMDB Agent.lnk');
    await fs.unlink(startMenuPath).catch(() => {});
  }
}

function sendProgress(message: string, progress: number): void {
  if (mainWindow) {
    mainWindow.webContents.send('install-progress', { message, progress });
  }
}
