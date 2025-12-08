import React, { useState } from 'react';
import {
  CodeBracketIcon,
  KeyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'expired' | 'revoked';
  permissions: string[];
  created: string;
  lastUsed: string;
  expires: string;
  requests: number;
  rateLimit: string;
}

interface APIEndpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  requests: number;
  avgLatency: number;
  errorRate: number;
  rateLimit: string;
}

const IntegrationsAPI: React.FC = () => {
  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_51H*********************',
      status: 'active',
      permissions: ['read', 'write', 'delete'],
      created: '2024-01-01',
      lastUsed: '5 minutes ago',
      expires: '2025-01-01',
      requests: 15234,
      rateLimit: '1000/hour'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'pk_test_51H*********************',
      status: 'active',
      permissions: ['read', 'write'],
      created: '2024-06-15',
      lastUsed: '2 hours ago',
      expires: '2024-12-31',
      requests: 892,
      rateLimit: '100/hour'
    },
    {
      id: '3',
      name: 'Legacy CI/CD Key',
      key: 'pk_live_49F*********************',
      status: 'expired',
      permissions: ['read'],
      created: '2023-03-20',
      lastUsed: '30 days ago',
      expires: '2024-03-20',
      requests: 45623,
      rateLimit: '500/hour'
    },
    {
      id: '4',
      name: 'Monitoring Service',
      key: 'pk_live_52J*********************',
      status: 'active',
      permissions: ['read'],
      created: '2024-08-10',
      lastUsed: '1 minute ago',
      expires: '2026-08-10',
      requests: 234567,
      rateLimit: '5000/hour'
    }
  ]);

  const [endpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      method: 'GET',
      path: '/api/v1/resources',
      description: 'List all resources',
      requests: 45678,
      avgLatency: 89,
      errorRate: 0.2,
      rateLimit: '1000/hour'
    },
    {
      id: '2',
      method: 'POST',
      path: '/api/v1/resources',
      description: 'Create new resource',
      requests: 12345,
      avgLatency: 234,
      errorRate: 1.5,
      rateLimit: '100/hour'
    },
    {
      id: '3',
      method: 'GET',
      path: '/api/v1/metrics',
      description: 'Fetch metrics data',
      requests: 98765,
      avgLatency: 45,
      errorRate: 0.1,
      rateLimit: '5000/hour'
    },
    {
      id: '4',
      method: 'PUT',
      path: '/api/v1/resources/:id',
      description: 'Update resource',
      requests: 8923,
      avgLatency: 178,
      errorRate: 2.3,
      rateLimit: '200/hour'
    },
    {
      id: '5',
      method: 'DELETE',
      path: '/api/v1/resources/:id',
      description: 'Delete resource',
      requests: 3456,
      avgLatency: 123,
      errorRate: 0.8,
      rateLimit: '50/hour'
    },
    {
      id: '6',
      method: 'GET',
      path: '/api/v1/health',
      description: 'Health check endpoint',
      requests: 456789,
      avgLatency: 12,
      errorRate: 0.0,
      rateLimit: '10000/hour'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'revoked':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/20 text-blue-400';
      case 'POST':
        return 'bg-green-500/20 text-green-400';
      case 'PUT':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests, 0);
  const activeKeys = apiKeys.filter(k => k.status === 'active').length;
  const totalEndpointRequests = endpoints.reduce((sum, ep) => sum + ep.requests, 0);
  const avgEndpointLatency = endpoints.reduce((sum, ep) => sum + ep.avgLatency, 0) / endpoints.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CodeBracketIcon className="w-8 h-8 text-blue-400" />
            API Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage API keys and monitor endpoint usage
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <KeyIcon className="w-5 h-5" />
          Generate API Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">API Keys</span>
            <KeyIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{apiKeys.length}</div>
          <div className="text-sm text-green-400 mt-1">{activeKeys} active</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Requests</span>
            <ChartBarIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{(totalRequests / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-400 mt-1">This month</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Endpoints</span>
            <CodeBracketIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{endpoints.length}</div>
          <div className="text-sm text-gray-400 mt-1">{(totalEndpointRequests / 1000).toFixed(0)}K requests</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Latency</span>
            <ClockIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">{avgEndpointLatency.toFixed(0)}ms</div>
          <div className="text-sm text-green-400 mt-1">↓ 15ms</div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <KeyIcon className="w-6 h-6 text-blue-400" />
          API Keys
        </h2>
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(key.status)}`}>
                      {key.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="px-3 py-1 rounded-lg bg-black/30 text-gray-300 text-sm font-mono">
                      {key.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Copy to clipboard"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {key.permissions.map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-4 pt-3 border-t border-white/10">
                <div>
                  <span className="text-xs text-gray-400 block">Created</span>
                  <span className="text-sm text-white font-semibold">{key.created}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Last Used</span>
                  <span className="text-sm text-white font-semibold">{key.lastUsed}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Expires</span>
                  <span className="text-sm text-white font-semibold">{key.expires}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Requests</span>
                  <span className="text-sm text-white font-semibold">{key.requests.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Rate Limit</span>
                  <span className="text-sm text-white font-semibold">{key.rateLimit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CodeBracketIcon className="w-6 h-6 text-purple-400" />
          API Endpoints
        </h2>
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-gray-300 font-mono">{endpoint.path}</code>
                </div>
                <span className="text-xs text-gray-400">{endpoint.description}</span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-400 block">Requests</span>
                  <span className="text-sm text-white font-semibold">{endpoint.requests.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Avg Latency</span>
                  <span className="text-sm text-white font-semibold">{endpoint.avgLatency}ms</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Error Rate</span>
                  <span className={`text-sm font-semibold ${endpoint.errorRate < 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {endpoint.errorRate}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Rate Limit</span>
                  <span className="text-sm text-white font-semibold">{endpoint.rateLimit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Start Guide</h2>
        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">cURL Example:</p>
            <code className="text-sm text-gray-300 font-mono block">
              curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
              &nbsp;&nbsp;https://api.example.com/v1/resources
            </code>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Authentication</h3>
              <p className="text-xs text-gray-400">Use Bearer token in Authorization header</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Rate Limiting</h3>
              <p className="text-xs text-gray-400">Limits vary by endpoint and key type</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Documentation</h3>
              <p className="text-xs text-gray-400">
                <a href="#" className="text-blue-400 hover:underline">View full API docs →</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsAPI;
