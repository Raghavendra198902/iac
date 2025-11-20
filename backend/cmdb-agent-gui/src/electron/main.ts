import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let agentProcess: ChildProcess | null = null;

// Agent configuration
let agentConfig = {
  apiUrl: process.env.CMDB_API_URL || 'http://localhost:3000/api/cmdb',
  apiKey: process.env.CMDB_API_KEY || '',
  agentId: process.env.AGENT_ID || `agent-${Date.now()}`,
  agentName: process.env.AGENT_NAME || require('os').hostname(),
  autoStart: true,
  startMinimized: false,
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'CMDB Agent',
  });

  // Load URL based on environment
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (app.isQuitting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow?.show();
      },
    },
    {
      label: 'Agent Status',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('navigate-to', 'status');
      },
    },
    { type: 'separator' },
    {
      label: 'Start Agent',
      click: () => {
        startAgent();
      },
    },
    {
      label: 'Stop Agent',
      click: () => {
        stopAgent();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('CMDB Agent');

  tray.on('click', () => {
    mainWindow?.show();
  });
}

// Start agent process
function startAgent() {
  if (agentProcess) {
    mainWindow?.webContents.send('agent-status', { status: 'running', message: 'Agent already running' });
    return;
  }

  const agentPath = path.join(__dirname, '../../cmdb-agent/dist/index.js');
  
  agentProcess = spawn('node', [agentPath], {
    env: {
      ...process.env,
      CMDB_API_URL: agentConfig.apiUrl,
      CMDB_API_KEY: agentConfig.apiKey,
      AGENT_ID: agentConfig.agentId,
      AGENT_NAME: agentConfig.agentName,
    },
  });

  agentProcess.stdout?.on('data', (data) => {
    mainWindow?.webContents.send('agent-log', { type: 'info', message: data.toString() });
  });

  agentProcess.stderr?.on('data', (data) => {
    mainWindow?.webContents.send('agent-log', { type: 'error', message: data.toString() });
  });

  agentProcess.on('close', (code) => {
    agentProcess = null;
    mainWindow?.webContents.send('agent-status', { 
      status: 'stopped', 
      message: `Agent stopped with code ${code}` 
    });
  });

  mainWindow?.webContents.send('agent-status', { status: 'running', message: 'Agent started' });
}

// Stop agent process
function stopAgent() {
  if (agentProcess) {
    agentProcess.kill();
    agentProcess = null;
    mainWindow?.webContents.send('agent-status', { status: 'stopped', message: 'Agent stopped' });
  }
}

// Get agent metrics
async function getAgentMetrics() {
  try {
    const response = await axios.get(`${agentConfig.apiUrl}/agents/${agentConfig.agentId}/metrics`, {
      headers: {
        'Authorization': `Bearer ${agentConfig.apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

// IPC handlers
ipcMain.handle('get-config', () => {
  return agentConfig;
});

ipcMain.handle('save-config', (event, config) => {
  agentConfig = { ...agentConfig, ...config };
  return { success: true };
});

ipcMain.handle('start-agent', () => {
  startAgent();
  return { success: true };
});

ipcMain.handle('stop-agent', () => {
  stopAgent();
  return { success: true };
});

ipcMain.handle('get-agent-status', () => {
  return {
    running: agentProcess !== null,
    pid: agentProcess?.pid,
  };
});

ipcMain.handle('get-metrics', async () => {
  return await getAgentMetrics();
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  if (agentConfig.autoStart) {
    setTimeout(() => startAgent(), 2000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopAgent();
});
