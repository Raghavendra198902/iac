import React, { useState, useEffect } from 'react';
import {
  CubeIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ServerIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'restarting' | 'error';
  uptime: string;
  cpu: number;
  memory: number;
  network: {
    rx: string;
    tx: string;
  };
  ports: string[];
}

const DevOpsContainers: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'stopped'>('all');

  useEffect(() => {
    loadContainers();
    const interval = setInterval(loadContainers, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadContainers = () => {
    const sampleContainers: Container[] = [
      {
        id: '1',
        name: 'iac-api-gateway-v3',
        image: 'iac-api-gateway:v3.0',
        status: 'running',
        uptime: '2d 14h',
        cpu: 12.5,
        memory: 45.2,
        network: { rx: '2.3 GB', tx: '1.8 GB' },
        ports: ['4000:4000']
      },
      {
        id: '2',
        name: 'iac-zero-trust-security-v3',
        image: 'zero-trust-security:latest',
        status: 'running',
        uptime: '2d 14h',
        cpu: 8.3,
        memory: 32.1,
        network: { rx: '1.1 GB', tx: '890 MB' },
        ports: ['8500:8500']
      },
      {
        id: '3',
        name: 'iac-frontend-e2e',
        image: 'iac-frontend-e2e:latest',
        status: 'running',
        uptime: '12m',
        cpu: 2.1,
        memory: 18.5,
        network: { rx: '45 MB', tx: '128 MB' },
        ports: ['3100:80', '3543:443']
      },
      {
        id: '4',
        name: 'iac-postgres-v3',
        image: 'postgres:15-alpine',
        status: 'running',
        uptime: '5d 8h',
        cpu: 15.8,
        memory: 67.4,
        network: { rx: '5.2 GB', tx: '4.8 GB' },
        ports: ['5432:5432']
      },
      {
        id: '5',
        name: 'iac-redis-v3',
        image: 'redis:7-alpine',
        status: 'running',
        uptime: '5d 8h',
        cpu: 3.2,
        memory: 12.8,
        network: { rx: '890 MB', tx: '1.2 GB' },
        ports: ['6379:6379']
      },
      {
        id: '6',
        name: 'iac-prometheus-v3',
        image: 'prom/prometheus:latest',
        status: 'running',
        uptime: '3d 6h',
        cpu: 6.5,
        memory: 28.3,
        network: { rx: '680 MB', tx: '1.5 GB' },
        ports: ['9091:9090']
      },
      {
        id: '7',
        name: 'iac-grafana-v3',
        image: 'grafana/grafana:latest',
        status: 'running',
        uptime: '3d 6h',
        cpu: 4.2,
        memory: 22.1,
        network: { rx: '320 MB', tx: '890 MB' },
        ports: ['3020:3000']
      },
      {
        id: '8',
        name: 'iac-mlflow-v3',
        image: 'mlflow-server:latest',
        status: 'stopped',
        uptime: '0h',
        cpu: 0,
        memory: 0,
        network: { rx: '0 B', tx: '0 B' },
        ports: ['5555:5000']
      }
    ];

    setContainers(sampleContainers);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-400/20';
      case 'stopped':
        return 'text-gray-400 bg-gray-400/20';
      case 'restarting':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'stopped':
        return <StopIcon className="w-5 h-5 text-gray-400" />;
      case 'restarting':
        return <ArrowPathIcon className="w-5 h-5 text-yellow-400 animate-spin" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const filteredContainers = filter === 'all' 
    ? containers 
    : containers.filter(c => c.status === filter);

  const runningCount = containers.filter(c => c.status === 'running').length;
  const stoppedCount = containers.filter(c => c.status === 'stopped').length;
  const totalCpu = containers.filter(c => c.status === 'running').reduce((sum, c) => sum + c.cpu, 0);
  const totalMemory = containers.filter(c => c.status === 'running').reduce((sum, c) => sum + c.memory, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading containers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
              Container Management
            </h1>
            <p className="text-gray-300">Monitor and manage Docker containers</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All ({containers.length})
            </button>
            <button
              onClick={() => setFilter('running')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'running' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Running ({runningCount})
            </button>
            <button
              onClick={() => setFilter('stopped')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'stopped' ? 'bg-gray-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Stopped ({stoppedCount})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CubeIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{containers.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Containers</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{runningCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Running</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{totalCpu.toFixed(1)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total CPU Usage</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">{totalMemory.toFixed(1)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Memory Usage</h3>
          </div>
        </div>

        {/* Containers List */}
        <div className="space-y-4">
          {filteredContainers.map((container) => (
            <div
              key={container.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(container.status)}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{container.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{container.image}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-300">
                        <ClockIcon className="w-4 h-4" />
                        Uptime: {container.uptime}
                      </span>
                      <span className="text-gray-300">Ports: {container.ports.join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(container.status)}`}>
                    {container.status.toUpperCase()}
                  </span>
                  {container.status === 'running' ? (
                    <button className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                      <StopIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                      <PlayIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Resource Usage */}
              {container.status === 'running' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">CPU Usage</p>
                    <p className="text-lg font-bold text-white">{container.cpu}%</p>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${container.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Memory Usage</p>
                    <p className="text-lg font-bold text-white">{container.memory}%</p>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-400 h-2 rounded-full transition-all"
                        style={{ width: `${container.memory}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Network RX</p>
                    <p className="text-lg font-bold text-white">{container.network.rx}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Network TX</p>
                    <p className="text-lg font-bold text-white">{container.network.tx}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default DevOpsContainers;
