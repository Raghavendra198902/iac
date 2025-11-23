import React, { useState } from 'react';
import {
  Key, Plus, Eye, EyeOff, Copy, RefreshCw, Trash2, Activity, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Code, BarChart3, Shield, Zap,
  Globe, Lock, Webhook, FileText, Settings, ExternalLink, Search, Filter
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import FadeIn from '../components/FadeIn';
import Badge from '../components/Badge';
import Tabs from '../components/Tabs';
import { TabsContent } from '../components/Tabs';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: 'production' | 'staging' | 'development';
  permissions: string[];
  rateLimit: number;
  usage: APIUsage;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
}

interface APIUsage {
  totalRequests: number;
  requestsToday: number;
  successRate: number;
  avgResponseTime: number;
  errorCount: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  secret: string;
  lastTriggered?: string;
  deliveryRate: number;
  retryPolicy: 'none' | 'exponential' | 'linear';
}

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  authentication: 'required' | 'optional' | 'none';
  rateLimit: number;
  avgResponseTime: number;
  requests24h: number;
  errorRate: number;
}

const APIManagement: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_51J...XYZ',
      environment: 'production',
      permissions: ['read', 'write', 'deploy'],
      rateLimit: 10000,
      usage: {
        totalRequests: 45678,
        requestsToday: 1234,
        successRate: 99.8,
        avgResponseTime: 145,
        errorCount: 23
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-15T10:30:00Z',
      expiresAt: '2025-01-01T00:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Staging API Key',
      key: 'pk_test_51J...ABC',
      environment: 'staging',
      permissions: ['read', 'write'],
      rateLimit: 5000,
      usage: {
        totalRequests: 8934,
        requestsToday: 234,
        successRate: 98.2,
        avgResponseTime: 189,
        errorCount: 56
      },
      createdAt: '2024-01-05T00:00:00Z',
      lastUsed: '2024-01-15T09:15:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Development API Key',
      key: 'pk_dev_51J...DEF',
      environment: 'development',
      permissions: ['read'],
      rateLimit: 1000,
      usage: {
        totalRequests: 2341,
        requestsToday: 89,
        successRate: 96.5,
        avgResponseTime: 234,
        errorCount: 124
      },
      createdAt: '2024-01-10T00:00:00Z',
      lastUsed: '2024-01-14T16:20:00Z',
      status: 'active'
    }
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: 'w1',
      name: 'Deployment Notifications',
      url: 'https://hooks.company.com/deployments',
      events: ['deployment.started', 'deployment.completed', 'deployment.failed'],
      status: 'active',
      secret: 'whsec_***************',
      lastTriggered: '2024-01-15T10:25:00Z',
      deliveryRate: 99.2,
      retryPolicy: 'exponential'
    },
    {
      id: 'w2',
      name: 'Security Alerts',
      url: 'https://hooks.company.com/security',
      events: ['security.vulnerability', 'security.breach', 'security.scan_completed'],
      status: 'active',
      secret: 'whsec_***************',
      lastTriggered: '2024-01-15T09:45:00Z',
      deliveryRate: 100,
      retryPolicy: 'exponential'
    },
    {
      id: 'w3',
      name: 'Cost Alerts',
      url: 'https://hooks.company.com/cost',
      events: ['cost.threshold_exceeded', 'cost.anomaly_detected'],
      status: 'failed',
      secret: 'whsec_***************',
      lastTriggered: '2024-01-14T18:30:00Z',
      deliveryRate: 67.8,
      retryPolicy: 'linear'
    }
  ]);

  const [endpoints] = useState<APIEndpoint[]>([
    {
      id: 'e1',
      method: 'GET',
      path: '/api/v1/blueprints',
      description: 'List all infrastructure blueprints',
      category: 'Blueprints',
      authentication: 'required',
      rateLimit: 1000,
      avgResponseTime: 120,
      requests24h: 2345,
      errorRate: 0.2
    },
    {
      id: 'e2',
      method: 'POST',
      path: '/api/v1/deployments',
      description: 'Create a new deployment',
      category: 'Deployments',
      authentication: 'required',
      rateLimit: 100,
      avgResponseTime: 3450,
      requests24h: 156,
      errorRate: 1.3
    },
    {
      id: 'e3',
      method: 'GET',
      path: '/api/v1/monitoring/metrics',
      description: 'Retrieve monitoring metrics',
      category: 'Monitoring',
      authentication: 'required',
      rateLimit: 5000,
      avgResponseTime: 89,
      requests24h: 12340,
      errorRate: 0.1
    },
    {
      id: 'e4',
      method: 'POST',
      path: '/api/v1/ai/recommendations',
      description: 'Get AI-powered recommendations',
      category: 'AI',
      authentication: 'required',
      rateLimit: 500,
      avgResponseTime: 2100,
      requests24h: 567,
      errorRate: 0.8
    },
    {
      id: 'e5',
      method: 'DELETE',
      path: '/api/v1/resources/:id',
      description: 'Delete a resource',
      category: 'Resources',
      authentication: 'required',
      rateLimit: 100,
      avgResponseTime: 450,
      requests24h: 89,
      errorRate: 2.1
    }
  ]);

  const usageData = [
    { time: '00:00', requests: 1200, errors: 12 },
    { time: '04:00', requests: 800, errors: 8 },
    { time: '08:00', requests: 3500, errors: 35 },
    { time: '12:00', requests: 5200, errors: 42 },
    { time: '16:00', requests: 4800, errors: 38 },
    { time: '20:00', requests: 2100, errors: 18 }
  ];

  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
  };

  const revokeKey = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: 'revoked' as const } : key
    ));
  };

  const regenerateKey = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, key: `pk_${key.environment}_${Math.random().toString(36).substring(7)}` } : key
    ));
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(wh => wh.id !== id));
  };

  const testWebhook = async (id: string) => {
    // Simulate webhook test
    await new Promise(resolve => setTimeout(resolve, 1000));
    setWebhooks(webhooks.map(wh => 
      wh.id === id ? { ...wh, status: 'active' as const, lastTriggered: new Date().toISOString() } : wh
    ));
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'red';
      case 'staging': return 'orange';
      case 'development': return 'blue';
      default: return 'gray';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'green';
      case 'POST': return 'blue';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      case 'PATCH': return 'purple';
      default: return 'gray';
    }
  };

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.usage.totalRequests, 0);
  const avgSuccessRate = apiKeys.reduce((sum, key) => sum + key.usage.successRate, 0) / apiKeys.length;
  const totalErrors = apiKeys.reduce((sum, key) => sum + key.usage.errorCount, 0);
  const activeKeys = apiKeys.filter(key => key.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage API keys, monitor usage, and configure webhooks
              </p>
            </div>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Generate API Key
            </button>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalRequests.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Keys</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{activeKeys}</p>
                </div>
                <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{totalErrors}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* API Usage Chart */}
        <FadeIn delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Usage (Last 24 Hours)</h2>
              <Badge variant="default">Real-time</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="time" tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
                <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Main Content */}
        <FadeIn delay={0.3}>
          <Tabs defaultValue="keys">
            <div className="mb-4">
              <div role="tablist" className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  role="tab"
                  data-value="keys"
                  className="px-4 py-2 text-sm font-medium transition-colors border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                >
                  <Key className="w-4 h-4 inline-block mr-2" />
                  API Keys ({apiKeys.length})
                </button>
                <button
                  role="tab"
                  data-value="webhooks"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Webhook className="w-4 h-4 inline-block mr-2" />
                  Webhooks ({webhooks.length})
                </button>
                <button
                  role="tab"
                  data-value="endpoints"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4 inline-block mr-2" />
                  Endpoints ({endpoints.length})
                </button>
                <button
                  role="tab"
                  data-value="docs"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <FileText className="w-4 h-4 inline-block mr-2" />
                  Documentation
                </button>
              </div>
            </div>

            <TabsContent value="keys">
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{apiKey.name}</h3>
                          <Badge variant={getEnvironmentColor(apiKey.environment) as any}>
                            {apiKey.environment}
                          </Badge>
                          {apiKey.status === 'active' && <Badge variant="success">Active</Badge>}
                          {apiKey.status === 'revoked' && <Badge variant="error">Revoked</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded">
                            {showKey[apiKey.id] ? apiKey.key : '•'.repeat(16)}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Requests</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apiKey.usage.totalRequests.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Today</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apiKey.usage.requestsToday.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">{apiKey.usage.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Avg Response</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apiKey.usage.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rate Limit</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apiKey.rateLimit.toLocaleString()}/hr</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {apiKey.permissions.map((perm) => (
                        <Badge key={perm} variant="default" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                      </span>
                      {apiKey.lastUsed && (
                        <span>Last used: {new Date(apiKey.lastUsed).toLocaleString()}</span>
                      )}
                      {apiKey.expiresAt && (
                        <span>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedKey(apiKey)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <BarChart3 className="w-3 h-3" />
                        View Analytics
                      </button>
                      <button
                        onClick={() => regenerateKey(apiKey.id)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                      <button
                        onClick={() => revokeKey(apiKey.id)}
                        disabled={apiKey.status === 'revoked'}
                        className="btn btn-secondary btn-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Lock className="w-3 h-3" />
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="webhooks">
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{webhook.name}</h3>
                          {webhook.status === 'active' && <Badge variant="success">Active</Badge>}
                          {webhook.status === 'inactive' && <Badge variant="default">Inactive</Badge>}
                          {webhook.status === 'failed' && <Badge variant="error">Failed</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">{webhook.url}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Delivery Rate</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{webhook.deliveryRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Retry Policy</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{webhook.retryPolicy}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Events</p>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="default" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {webhook.lastTriggered && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <Clock className="w-3 h-3" />
                        <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedWebhook(webhook)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Configure
                      </button>
                      <button
                        onClick={() => testWebhook(webhook.id)}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        Test
                      </button>
                      <button
                        onClick={() => deleteWebhook(webhook.id)}
                        className="btn btn-secondary btn-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="endpoints">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search endpoints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {endpoints
                    .filter(ep => ep.path.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  ep.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((endpoint) => (
                      <div key={endpoint.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={getMethodColor(endpoint.method) as any}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono text-gray-900 dark:text-white">{endpoint.path}</code>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{endpoint.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Category: {endpoint.category}</span>
                              <span>Auth: {endpoint.authentication}</span>
                              <span>Rate Limit: {endpoint.rateLimit}/hr</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex flex-col gap-2">
                              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <p className="text-xs text-blue-900 dark:text-blue-300">Requests (24h)</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{endpoint.requests24h.toLocaleString()}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <p className="text-xs text-purple-900 dark:text-purple-300">Avg Response</p>
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{endpoint.avgResponseTime}ms</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="docs">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Documentation</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Getting Started</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Our REST API provides programmatic access to all platform features. Use API keys for authentication and follow rate limits.
                    </p>
                    <a href="#" className="btn btn-primary flex items-center gap-2 w-fit">
                      <ExternalLink className="w-4 h-4" />
                      View Full Documentation
                    </a>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Authentication</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      Include your API key in the Authorization header:
                    </p>
                    <code className="block p-3 rounded bg-gray-900 text-green-400 text-sm font-mono">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Rate Limits</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      API keys have different rate limits based on environment. Production keys have higher limits.
                      Rate limit information is included in response headers.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Example Request</h4>
                    <code className="block p-3 rounded bg-gray-900 text-green-400 text-sm font-mono whitespace-pre">
{`curl -X GET \\
  https://api.platform.com/v1/blueprints \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`}
                    </code>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* API Key Details Modal */}
        {selectedKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedKey(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedKey.name} - Analytics</h2>
                <button onClick={() => setSelectedKey(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-900 dark:text-blue-300">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{selectedKey.usage.totalRequests.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-green-900 dark:text-green-300">Success Rate</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{selectedKey.usage.successRate}%</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-sm text-purple-900 dark:text-purple-300">Avg Response</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{selectedKey.usage.avgResponseTime}ms</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm text-red-900 dark:text-red-300">Errors</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{selectedKey.usage.errorCount}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setSelectedKey(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIManagement;
