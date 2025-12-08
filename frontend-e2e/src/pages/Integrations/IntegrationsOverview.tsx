import React, { useState } from 'react';
import {
  PuzzlePieceIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudIcon,
  BellIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  ServerIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  category: 'cloud' | 'monitoring' | 'communication' | 'security' | 'cicd' | 'database';
  provider: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  enabled: boolean;
  lastSync: string;
  syncInterval: number;
  requests: number;
  successRate: number;
  avgResponseTime: number;
  dataTransferred: string;
  logo: string;
}

const IntegrationsOverview: React.FC = () => {
  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'AWS',
      category: 'cloud',
      provider: 'Amazon Web Services',
      description: 'Cloud infrastructure management and cost tracking',
      status: 'connected',
      enabled: true,
      lastSync: '2 minutes ago',
      syncInterval: 300,
      requests: 15234,
      successRate: 99.2,
      avgResponseTime: 245,
      dataTransferred: '2.4 GB',
      logo: '☁️'
    },
    {
      id: '2',
      name: 'Azure',
      category: 'cloud',
      provider: 'Microsoft',
      description: 'Azure cloud platform integration',
      status: 'connected',
      enabled: true,
      lastSync: '5 minutes ago',
      syncInterval: 300,
      requests: 8943,
      successRate: 98.7,
      avgResponseTime: 312,
      dataTransferred: '1.8 GB',
      logo: '☁️'
    },
    {
      id: '3',
      name: 'Datadog',
      category: 'monitoring',
      provider: 'Datadog Inc',
      description: 'Real-time monitoring and analytics',
      status: 'connected',
      enabled: true,
      lastSync: '1 minute ago',
      syncInterval: 60,
      requests: 45123,
      successRate: 99.8,
      avgResponseTime: 89,
      dataTransferred: '5.2 GB',
      logo: '📊'
    },
    {
      id: '4',
      name: 'Slack',
      category: 'communication',
      provider: 'Slack Technologies',
      description: 'Team communication and alerting',
      status: 'connected',
      enabled: true,
      lastSync: '30 seconds ago',
      syncInterval: 30,
      requests: 1234,
      successRate: 100,
      avgResponseTime: 145,
      dataTransferred: '12 MB',
      logo: '💬'
    },
    {
      id: '5',
      name: 'Jenkins',
      category: 'cicd',
      provider: 'CloudBees',
      description: 'CI/CD pipeline automation',
      status: 'error',
      enabled: false,
      lastSync: '2 hours ago',
      syncInterval: 60,
      requests: 892,
      successRate: 87.3,
      avgResponseTime: 2340,
      dataTransferred: '340 MB',
      logo: '🔧'
    },
    {
      id: '6',
      name: 'Snyk',
      category: 'security',
      provider: 'Snyk Limited',
      description: 'Security vulnerability scanning',
      status: 'connected',
      enabled: true,
      lastSync: '10 minutes ago',
      syncInterval: 3600,
      requests: 567,
      successRate: 99.1,
      avgResponseTime: 4230,
      dataTransferred: '89 MB',
      logo: '🛡️'
    },
    {
      id: '7',
      name: 'PostgreSQL',
      category: 'database',
      provider: 'PostgreSQL',
      description: 'Database management and monitoring',
      status: 'connected',
      enabled: true,
      lastSync: '3 minutes ago',
      syncInterval: 120,
      requests: 23456,
      successRate: 99.9,
      avgResponseTime: 67,
      dataTransferred: '3.1 GB',
      logo: '🐘'
    },
    {
      id: '8',
      name: 'PagerDuty',
      category: 'communication',
      provider: 'PagerDuty Inc',
      description: 'Incident response and on-call management',
      status: 'configuring',
      enabled: false,
      lastSync: 'Never',
      syncInterval: 60,
      requests: 0,
      successRate: 0,
      avgResponseTime: 0,
      dataTransferred: '0 MB',
      logo: '📟'
    }
  ]);

  const [filter, setFilter] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'disconnected':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case 'configuring':
        return <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disconnected':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'configuring':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cloud':
        return <CloudIcon className="w-5 h-5" />;
      case 'monitoring':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'communication':
        return <BellIcon className="w-5 h-5" />;
      case 'security':
        return <ShieldCheckIcon className="w-5 h-5" />;
      case 'cicd':
        return <CodeBracketIcon className="w-5 h-5" />;
      case 'database':
        return <ServerIcon className="w-5 h-5" />;
      default:
        return <PuzzlePieceIcon className="w-5 h-5" />;
    }
  };

  const filteredIntegrations = filter === 'all' 
    ? integrations 
    : integrations.filter(int => int.category === filter);

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalRequests = integrations.reduce((sum, i) => sum + i.requests, 0);
  const avgSuccessRate = integrations.reduce((sum, i) => sum + i.successRate, 0) / integrations.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <PuzzlePieceIcon className="w-8 h-8 text-blue-400" />
            Integrations
          </h1>
          <p className="text-gray-400 mt-1">
            Connect and manage third-party services
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <PuzzlePieceIcon className="w-5 h-5" />
          Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Integrations</span>
            <PuzzlePieceIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{integrations.length}</div>
          <div className="text-sm text-gray-400 mt-1">{connectedCount} connected</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">API Requests</span>
            <ChartBarIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{(totalRequests / 1000).toFixed(1)}K</div>
          <div className="text-sm text-green-400 mt-1">This month</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Success Rate</span>
            <CheckCircleIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{avgSuccessRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-400 mt-1">Across all services</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Data Synced</span>
            <ServerIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">12.9 GB</div>
          <div className="text-sm text-gray-400 mt-1">Last 30 days</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Filter by:</span>
          {['all', 'cloud', 'monitoring', 'communication', 'security', 'cicd', 'database'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="text-4xl">{integration.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                    {getStatusIcon(integration.status)}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{integration.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${getStatusColor(integration.status)} border`}>
                      {integration.status}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 flex items-center gap-1">
                      {getCategoryIcon(integration.category)}
                      {integration.category}
                    </span>
                  </div>
                </div>
              </div>
              <button className={`p-2 rounded-lg transition-colors ${
                integration.enabled 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
              }`}>
                {integration.enabled ? '✓' : '✕'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-white/5">
              <div>
                <span className="text-xs text-gray-400 block">Requests</span>
                <span className="text-sm font-semibold text-white">{integration.requests.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Success Rate</span>
                <span className="text-sm font-semibold text-green-400">{integration.successRate}%</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Avg Response</span>
                <span className="text-sm font-semibold text-white">{integration.avgResponseTime}ms</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Data Transfer</span>
                <span className="text-sm font-semibold text-white">{integration.dataTransferred}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>Last sync: {integration.lastSync}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm">
                  Configure
                </button>
                <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm flex items-center gap-1">
                  <ArrowPathIcon className="w-4 h-4" />
                  Sync
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsOverview;
