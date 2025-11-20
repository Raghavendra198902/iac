export interface ElectronAPI {
  getConfig: () => Promise<AgentConfig>;
  saveConfig: (config: Partial<AgentConfig>) => Promise<{ success: boolean }>;
  startAgent: () => Promise<{ success: boolean }>;
  stopAgent: () => Promise<{ success: boolean }>;
  getAgentStatus: () => Promise<{ running: boolean; pid?: number }>;
  getMetrics: () => Promise<AgentMetrics | null>;
  onAgentStatus: (callback: (data: { status: string; message: string }) => void) => void;
  onAgentLog: (callback: (data: { type: string; message: string }) => void) => void;
}

export interface AgentConfig {
  apiUrl: string;
  apiKey: string;
  agentId: string;
  agentName: string;
  autoStart: boolean;
  startMinimized: boolean;
}

export interface AgentMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  lastSync: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
