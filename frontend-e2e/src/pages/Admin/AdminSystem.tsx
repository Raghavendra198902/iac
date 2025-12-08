import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface Service {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  memory: string;
  cpu: string;
  version: string;
}

const AdminSystem: React.FC = () => {
  const [metrics] = useState<SystemMetric[]>([
    {
      id: '1',
      name: 'CPU Usage',
      value: '45%',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '1 minute ago'
    },
    {
      id: '2',
      name: 'Memory Usage',
      value: '68%',
      status: 'warning',
      trend: 'up',
      lastUpdated: '1 minute ago'
    },
    {
      id: '3',
      name: 'Disk Usage',
      value: '52%',
      status: 'healthy',
      trend: 'up',
      lastUpdated: '1 minute ago'
    },
    {
      id: '4',
      name: 'Network I/O',
      value: '2.4 GB/s',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '1 minute ago'
    },
    {
      id: '5',
      name: 'Active Connections',
      value: '1,234',
      status: 'healthy',
      trend: 'down',
      lastUpdated: '1 minute ago'
    },
    {
      id: '6',
      name: 'Database Connections',
      value: '45/100',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '1 minute ago'
    }
  ]);

  const [services] = useState<Service[]>([
    {
      id: '1',
      name: 'API Gateway',
      status: 'running',
      uptime: '15 days',
      memory: '512 MB',
      cpu: '12%',
      version: 'v3.2.1'
    },
    {
      id: '2',
      name: 'IAC Generator',
      status: 'running',
      uptime: '15 days',
      memory: '384 MB',
      cpu: '8%',
      version: 'v2.8.0'
    },
    {
      id: '3',
      name: 'AI Orchestrator',
      status: 'running',
      uptime: '12 days',
      memory: '1.2 GB',
      cpu: '25%',
      version: 'v1.5.3'
    },
    {
      id: '4',
      name: 'Monitoring Service',
      status: 'running',
      uptime: '15 days',
      memory: '256 MB',
      cpu: '5%',
      version: 'v2.1.0'
    },
    {
      id: '5',
      name: 'Zero Trust Security',
      status: 'running',
      uptime: '15 days',
      memory: '448 MB',
      cpu: '15%',
      version: 'v1.9.2'
    },
    {
      id: '6',
      name: 'Cost Optimizer',
      status: 'running',
      uptime: '10 days',
      memory: '320 MB',
      cpu: '10%',
      version: 'v1.3.1'
    },
    {
      id: '7',
      name: 'CMDB Service',
      status: 'error',
      uptime: '0 minutes',
      memory: '0 MB',
      cpu: '0%',
      version: 'v1.2.0'
    },
    {
      id: '8',
      name: 'Backup Service',
      status: 'stopped',
      uptime: '0 minutes',
      memory: '0 MB',
      cpu: '0%',
      version: 'v1.0.5'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical':
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'stopped':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'critical':
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-red-400">↑</span>;
      case 'down':
        return <span className="text-green-400">↓</span>;
      case 'stable':
        return <span className="text-gray-400">→</span>;
      default:
        return null;
    }
  };

  const runningServices = services.filter(s => s.status === 'running').length;
  const stoppedServices = services.filter(s => s.status === 'stopped').length;
  const errorServices = services.filter(s => s.status === 'error').length;
  const healthyMetrics = metrics.filter(m => m.status === 'healthy').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Cog6ToothIcon className="w-8 h-8 text-blue-400" />
            System Administration
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor and manage system resources and services
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5" />
          Refresh Status
        </button>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Services</span>
            <ServerIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{services.length}</div>
          <div className="text-sm text-green-400 mt-1">{runningServices} running</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">System Health</span>
            <ChartBarIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{((healthyMetrics / metrics.length) * 100).toFixed(0)}%</div>
          <div className="text-sm text-gray-400 mt-1">{healthyMetrics}/{metrics.length} metrics healthy</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Issues</span>
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white">{errorServices + stoppedServices}</div>
          <div className="text-sm text-red-400 mt-1">Require attention</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Uptime</span>
            <ClockIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">99.9%</div>
          <div className="text-sm text-gray-400 mt-1">Last 30 days</div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-400" />
          System Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">{metric.name}</span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                  {metric.status}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">{metric.value}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="text-xs text-gray-400">
                Updated {metric.lastUpdated}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ServerIcon className="w-6 h-6 text-purple-400" />
          Services Status
        </h2>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                      {service.status}
                    </span>
                    <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-xs">
                      {service.version}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-white ml-2 font-semibold">{service.uptime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Memory:</span>
                      <span className="text-white ml-2 font-semibold">{service.memory}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">CPU:</span>
                      <span className="text-white ml-2 font-semibold">{service.cpu}</span>
                    </div>
                    <div className="flex gap-2">
                      {service.status === 'running' && (
                        <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
                          Stop
                        </button>
                      )}
                      {(service.status === 'stopped' || service.status === 'error') && (
                        <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30">
                          Start
                        </button>
                      )}
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30">
                        Restart
                      </button>
                      <button className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-xs hover:bg-gray-500/30">
                        Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Platform:</span>
              <span className="text-white font-semibold">Linux Ubuntu 22.04</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Kernel:</span>
              <span className="text-white font-semibold">5.15.0-91-generic</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Architecture:</span>
              <span className="text-white font-semibold">x86_64</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Hostname:</span>
              <span className="text-white font-semibold">iac-platform-01</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Total Memory:</span>
              <span className="text-white font-semibold">32 GB</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <ArrowPathIcon className="w-5 h-5" />
              Restart All Services
            </button>
            <button className="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5" />
              Run Health Check
            </button>
            <button className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <CpuChipIcon className="w-5 h-5" />
              Clear Cache
            </button>
            <button className="w-full px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <CircleStackIcon className="w-5 h-5" />
              Database Maintenance
            </button>
            <button className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <ServerIcon className="w-5 h-5" />
              System Shutdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;
