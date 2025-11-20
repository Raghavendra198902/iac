import { useState, useEffect } from 'react';
import { Activity, Server, Settings, PlayCircle, StopCircle, Cpu, HardDrive, Network, MemoryStick } from 'lucide-react';

interface AgentConfig {
  apiUrl: string;
  apiKey: string;
  agentId: string;
  agentName: string;
  autoStart: boolean;
  startMinimized: boolean;
}

interface AgentStatus {
  running: boolean;
  pid?: number;
}

interface Metrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'logs'>('dashboard');
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({ running: false });
  const [metrics, setMetrics] = useState<Metrics>({ cpu: 0, memory: 0, disk: 0, network: 0 });
  const [logs, setLogs] = useState<Array<{ type: string; message: string; timestamp: Date }>>([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadConfig();
    checkStatus();
    
    const statusInterval = setInterval(checkStatus, 5000);
    const metricsInterval = setInterval(loadMetrics, 10000);

    // Listen for agent status updates
    if (window.electronAPI) {
      window.electronAPI.onAgentStatus((data: any) => {
        setStatusMessage(data.message);
        checkStatus();
      });

      window.electronAPI.onAgentLog((data: any) => {
        setLogs(prev => [...prev.slice(-99), {
          type: data.type,
          message: data.message,
          timestamp: new Date()
        }]);
      });
    }

    return () => {
      clearInterval(statusInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const loadConfig = async () => {
    if (window.electronAPI) {
      const cfg = await window.electronAPI.getConfig();
      setConfig(cfg);
    }
  };

  const saveConfig = async () => {
    if (window.electronAPI && config) {
      await window.electronAPI.saveConfig(config);
      setStatusMessage('Configuration saved');
    }
  };

  const checkStatus = async () => {
    if (window.electronAPI) {
      const status = await window.electronAPI.getAgentStatus();
      setAgentStatus(status);
    }
  };

  const loadMetrics = async () => {
    if (window.electronAPI) {
      const metricsData = await window.electronAPI.getMetrics();
      if (metricsData) {
        setMetrics(metricsData);
      }
    }
  };

  const startAgent = async () => {
    if (window.electronAPI) {
      await window.electronAPI.startAgent();
      setStatusMessage('Starting agent...');
    }
  };

  const stopAgent = async () => {
    if (window.electronAPI) {
      await window.electronAPI.stopAgent();
      setStatusMessage('Stopping agent...');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CMDB Agent</h1>
              <p className="text-sm text-gray-400">Configuration Management Database Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              agentStatus.running ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              <div className={`h-2 w-2 rounded-full ${agentStatus.running ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-sm font-medium">
                {agentStatus.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            {agentStatus.running ? (
              <button
                onClick={stopAgent}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <StopCircle className="h-4 w-4" />
                Stop Agent
              </button>
            ) : (
              <button
                onClick={startAgent}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <PlayCircle className="h-4 w-4" />
                Start Agent
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </div>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Logs
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {statusMessage && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-300">
            {statusMessage}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">CPU Usage</span>
                  <Cpu className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold">{metrics.cpu}%</div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${metrics.cpu}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Memory</span>
                  <MemoryStick className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold">{metrics.memory}%</div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${metrics.memory}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Disk Usage</span>
                  <HardDrive className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold">{metrics.disk}%</div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{ width: `${metrics.disk}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Network</span>
                  <Network className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold">{metrics.network}%</div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${metrics.network}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Agent Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Agent Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Agent ID</span>
                  <p className="font-mono text-sm">{config?.agentId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Agent Name</span>
                  <p className="font-mono text-sm">{config?.agentName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Process ID</span>
                  <p className="font-mono text-sm">{agentStatus.pid || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">API URL</span>
                  <p className="font-mono text-sm truncate">{config?.apiUrl || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && config && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">API URL</label>
                <input
                  type="text"
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Agent ID</label>
                <input
                  type="text"
                  value={config.agentId}
                  onChange={(e) => setConfig({ ...config, agentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={config.agentName}
                  onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.autoStart}
                  onChange={(e) => setConfig({ ...config, autoStart: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-300">Auto-start agent on application launch</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.startMinimized}
                  onChange={(e) => setConfig({ ...config, startMinimized: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-300">Start minimized to system tray</label>
              </div>
              <button
                onClick={saveConfig}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Agent Logs</h3>
              <button
                onClick={() => setLogs([])}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                Clear Logs
              </button>
            </div>
            <div className="h-96 overflow-y-auto font-mono text-sm space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No logs yet</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`p-2 rounded ${
                    log.type === 'error' ? 'bg-red-900/20 text-red-300' : 'bg-gray-700/50 text-gray-300'
                  }`}>
                    <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span>{' '}
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
