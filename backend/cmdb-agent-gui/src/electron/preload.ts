import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: any) => ipcRenderer.invoke('save-config', config),
  startAgent: () => ipcRenderer.invoke('start-agent'),
  stopAgent: () => ipcRenderer.invoke('stop-agent'),
  getAgentStatus: () => ipcRenderer.invoke('get-agent-status'),
  getMetrics: () => ipcRenderer.invoke('get-metrics'),
  
  // Event listeners
  onAgentStatus: (callback: (data: any) => void) => {
    ipcRenderer.on('agent-status', (_, data) => callback(data));
  },
  onAgentLog: (callback: (data: any) => void) => {
    ipcRenderer.on('agent-log', (_, data) => callback(data));
  },
});
