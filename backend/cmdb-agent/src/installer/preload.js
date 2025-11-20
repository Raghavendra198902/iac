/**
 * Electron Preload Script
 * Exposes safe APIs to renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  validatePath: (path) => ipcRenderer.invoke('validate-path', path),
  testConnection: (apiUrl) => ipcRenderer.invoke('test-connection', apiUrl),
  install: (config) => ipcRenderer.invoke('install', config),
  uninstall: (installPath) => ipcRenderer.invoke('uninstall', installPath),
  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', (_event, data) => callback(data));
  },
});
