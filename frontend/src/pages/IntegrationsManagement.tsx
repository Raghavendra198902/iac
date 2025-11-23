import React, { useState } from 'react';
import {
  Plus, Settings, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Plug, ExternalLink, Activity, Clock, Shield, Code, Zap, Database,
  Cloud, GitBranch, Bell, MessageSquare, Mail, Slack as SlackIcon,
  Search, Filter, Eye, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import FadeIn from '../components/FadeIn';
import Badge from '../components/Badge';
import Tabs from '../components/Tabs';
import { TabsContent } from '../components/Tabs';

interface Integration {
  id: string;
  name: string;
  category: 'cloud' | 'monitoring' | 'communication' | 'cicd' | 'security' | 'itsm' | 'database';
  description: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  enabled: boolean;
  lastSync?: string;
  config: IntegrationConfig;
  metrics: IntegrationMetrics;
  logo: string;
}

interface IntegrationConfig {
  apiKey?: string;
  endpoint?: string;
  webhookUrl?: string;
  syncInterval?: number;
  autoSync?: boolean;
  settings: Record<string, any>;
}

interface IntegrationMetrics {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  lastError?: string;
  dataTransferred: string;
}

interface MarketplaceIntegration {
  id: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  rating: number;
  installs: number;
  isPremium: boolean;
  tags: string[];
}

const IntegrationsManagement: React.FC = () => {
  const { theme } = useTheme();
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'AWS',
      category: 'cloud',
      description: 'Amazon Web Services cloud integration for resource management and cost tracking',
      provider: 'Amazon',
      status: 'connected',
      enabled: true,
      lastSync: '2024-01-15T10:30:00Z',
      config: {
        endpoint: 'https://aws.amazon.com',
        syncInterval: 300,
        autoSync: true,
        settings: { regions: ['us-east-1', 'us-west-2'], services: ['EC2', 'S3', 'RDS'] }
      },
      metrics: {
        totalRequests: 15234,
        successRate: 99.2,
        avgResponseTime: 245,
        dataTransferred: '2.4 GB'
      },
      logo: '☁️'
    },
    {
      id: '2',
      name: 'Azure',
      category: 'cloud',
      description: 'Microsoft Azure cloud platform integration',
      provider: 'Microsoft',
      status: 'connected',
      enabled: true,
      lastSync: '2024-01-15T10:25:00Z',
      config: {
        syncInterval: 300,
        autoSync: true,
        settings: { subscriptions: ['prod', 'dev'], resources: ['VMs', 'Storage', 'SQL'] }
      },
      metrics: {
        totalRequests: 8943,
        successRate: 98.7,
        avgResponseTime: 312,
        dataTransferred: '1.8 GB'
      },
      logo: '☁️'
    },
    {
      id: '3',
      name: 'Datadog',
      category: 'monitoring',
      description: 'Real-time monitoring and analytics platform integration',
      provider: 'Datadog',
      status: 'connected',
      enabled: true,
      lastSync: '2024-01-15T10:32:00Z',
      config: {
        apiKey: 'dd_***************',
        endpoint: 'https://api.datadoghq.com',
        syncInterval: 60,
        autoSync: true,
        settings: { metrics: ['cpu', 'memory', 'disk'], dashboards: ['infra', 'apps'] }
      },
      metrics: {
        totalRequests: 45123,
        successRate: 99.8,
        avgResponseTime: 89,
        dataTransferred: '5.2 GB'
      },
      logo: '📊'
    },
    {
      id: '4',
      name: 'Slack',
      category: 'communication',
      description: 'Team communication and alerting integration',
      provider: 'Slack',
      status: 'connected',
      enabled: true,
      lastSync: '2024-01-15T10:35:00Z',
      config: {
        webhookUrl: 'https://hooks.slack.com/services/***',
        settings: { channels: ['#alerts', '#deployments', '#security'], notifyOn: ['critical', 'error'] }
      },
      metrics: {
        totalRequests: 1234,
        successRate: 100,
        avgResponseTime: 145,
        dataTransferred: '12 MB'
      },
      logo: '💬'
    },
    {
      id: '5',
      name: 'Jenkins',
      category: 'cicd',
      description: 'CI/CD pipeline integration for automated deployments',
      provider: 'CloudBees',
      status: 'error',
      enabled: false,
      lastSync: '2024-01-14T18:20:00Z',
      config: {
        endpoint: 'https://jenkins.company.com',
        settings: { jobs: ['build-prod', 'deploy-staging'], triggerOn: ['push', 'pull_request'] }
      },
      metrics: {
        totalRequests: 892,
        successRate: 87.3,
        avgResponseTime: 2340,
        lastError: 'Authentication failed: Invalid API token',
        dataTransferred: '340 MB'
      },
      logo: '🔧'
    },
    {
      id: '6',
      name: 'Snyk',
      category: 'security',
      description: 'Security vulnerability scanning and dependency checking',
      provider: 'Snyk',
      status: 'connected',
      enabled: true,
      lastSync: '2024-01-15T09:00:00Z',
      config: {
        apiKey: 'snyk_***************',
        syncInterval: 3600,
        autoSync: true,
        settings: { scanTypes: ['dependencies', 'containers', 'iac'], severity: ['high', 'critical'] }
      },
      metrics: {
        totalRequests: 567,
        successRate: 99.1,
        avgResponseTime: 4230,
        dataTransferred: '89 MB'
      },
      logo: '🛡️'
    }
  ]);

  const [marketplaceIntegrations] = useState<MarketplaceIntegration[]>([
    {
      id: 'm1',
      name: 'PagerDuty',
      category: 'communication',
      provider: 'PagerDuty',
      description: 'Incident response and on-call management',
      rating: 4.8,
      installs: 12430,
      isPremium: false,
      tags: ['alerting', 'incident', 'oncall']
    },
    {
      id: 'm2',
      name: 'Terraform Cloud',
      category: 'cicd',
      provider: 'HashiCorp',
      description: 'Infrastructure as code collaboration and automation',
      rating: 4.9,
      installs: 18920,
      isPremium: true,
      tags: ['iac', 'terraform', 'automation']
    },
    {
      id: 'm3',
      name: 'ServiceNow',
      category: 'itsm',
      provider: 'ServiceNow',
      description: 'IT service management and workflow automation',
      rating: 4.6,
      installs: 8234,
      isPremium: true,
      tags: ['itsm', 'ticketing', 'workflow']
    },
    {
      id: 'm4',
      name: 'Splunk',
      category: 'monitoring',
      provider: 'Splunk',
      description: 'Log analysis and security information management',
      rating: 4.7,
      installs: 15670,
      isPremium: true,
      tags: ['logs', 'siem', 'analytics']
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cloud': return <Cloud className="w-5 h-5" />;
      case 'monitoring': return <Activity className="w-5 h-5" />;
      case 'communication': return <MessageSquare className="w-5 h-5" />;
      case 'cicd': return <GitBranch className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'itsm': return <Settings className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      default: return <Plug className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cloud': return 'blue';
      case 'monitoring': return 'purple';
      case 'communication': return 'green';
      case 'cicd': return 'orange';
      case 'security': return 'red';
      case 'itsm': return 'indigo';
      case 'database': return 'cyan';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'disconnected': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'configuring': return <Settings className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, enabled: !int.enabled } : int
    ));
  };

  const testConnection = async (id: string) => {
    setTestingConnection(id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingConnection(null);
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, status: 'connected', lastSync: new Date().toISOString() } : int
    ));
  };

  const syncIntegration = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, lastSync: new Date().toISOString() } : int
    ));
  };

  const deleteIntegration = (id: string) => {
    setIntegrations(integrations.filter(int => int.id !== id));
  };

  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         int.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || int.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const enabledCount = integrations.filter(i => i.enabled).length;
  const errorCount = integrations.filter(i => i.status === 'error').length;
  const totalRequests = integrations.reduce((sum, i) => sum + i.metrics.totalRequests, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Connect and manage third-party service integrations
              </p>
            </div>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Integrations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{integrations.length}</p>
                </div>
                <Plug className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{connectedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{enabledCount}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{errorCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Search and Filter */}
        <FadeIn delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="cloud">Cloud</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="communication">Communication</option>
                  <option value="cicd">CI/CD</option>
                  <option value="security">Security</option>
                  <option value="itsm">ITSM</option>
                  <option value="database">Database</option>
                </select>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main Content */}
        <FadeIn delay={0.3}>
          <Tabs defaultValue="active">
            <div className="mb-4">
              <div role="tablist" className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  role="tab"
                  data-value="active"
                  className="px-4 py-2 text-sm font-medium transition-colors border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                >
                  <Plug className="w-4 h-4 inline-block mr-2" />
                  Active Integrations ({integrations.length})
                </button>
                <button
                  role="tab"
                  data-value="marketplace"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Zap className="w-4 h-4 inline-block mr-2" />
                  Marketplace ({marketplaceIntegrations.length})
                </button>
                <button
                  role="tab"
                  data-value="logs"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Activity className="w-4 h-4 inline-block mr-2" />
                  Activity Logs
                </button>
              </div>
            </div>

            <TabsContent value="active">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{integration.logo}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                            {getStatusIcon(integration.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{integration.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getCategoryColor(integration.category) as any}>
                              {integration.category}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">by {integration.provider}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleIntegration(integration.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {integration.enabled ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Requests</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{integration.metrics.totalRequests.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{integration.metrics.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Avg Response</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{integration.metrics.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Data Transfer</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{integration.metrics.dataTransferred}</p>
                      </div>
                    </div>

                    {integration.status === 'error' && integration.metrics.lastError && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-800 dark:text-red-200">{integration.metrics.lastError}</p>
                        </div>
                      </div>
                    )}

                    {integration.lastSync && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <Clock className="w-3 h-3" />
                        <span>Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedIntegration(integration)}
                        className="flex-1 btn btn-secondary btn-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                      <button
                        onClick={() => testConnection(integration.id)}
                        disabled={testingConnection === integration.id}
                        className="btn btn-secondary btn-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${testingConnection === integration.id ? 'animate-spin' : ''}`} />
                        {testingConnection === integration.id ? 'Testing...' : 'Test'}
                      </button>
                      <button
                        onClick={() => syncIntegration(integration.id)}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Sync
                      </button>
                      <button
                        onClick={() => deleteIntegration(integration.id)}
                        className="btn btn-secondary btn-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="marketplace">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {marketplaceIntegrations.map((marketplace) => (
                  <div
                    key={marketplace.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{marketplace.name}</h3>
                          {marketplace.isPremium && <Badge variant="warning">Premium</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{marketplace.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {marketplace.provider}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{marketplace.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {marketplace.installs.toLocaleString()} installs
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {marketplace.tags.map((tag) => (
                        <Badge key={tag} variant="default" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 btn btn-primary btn-sm flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" />
                        Install
                      </button>
                      <button className="btn btn-secondary btn-sm flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Integration Activity</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total API Requests: <span className="font-bold text-gray-900 dark:text-white">{totalRequests.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {integrations.slice(0, 10).map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.logo}</div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {integration.metrics.totalRequests.toLocaleString()} requests · {integration.metrics.successRate}% success
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {integration.lastSync && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(integration.lastSync).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* Integration Details Modal */}
        {selectedIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedIntegration(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedIntegration.logo}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedIntegration.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">by {selectedIntegration.provider}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedIntegration(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  ×
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedIntegration.description}</p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Configuration</h3>
                  <div className="space-y-3">
                    {selectedIntegration.config.endpoint && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Endpoint</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedIntegration.config.endpoint}</p>
                      </div>
                    )}
                    {selectedIntegration.config.apiKey && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">API Key</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedIntegration.config.apiKey}</p>
                      </div>
                    )}
                    {selectedIntegration.config.syncInterval && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sync Interval</p>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedIntegration.config.syncInterval} seconds</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-sm text-blue-900 dark:text-blue-300">Total Requests</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{selectedIntegration.metrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm text-green-900 dark:text-green-300">Success Rate</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">{selectedIntegration.metrics.successRate}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <p className="text-sm text-purple-900 dark:text-purple-300">Avg Response Time</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{selectedIntegration.metrics.avgResponseTime}ms</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <p className="text-sm text-orange-900 dark:text-orange-300">Data Transferred</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{selectedIntegration.metrics.dataTransferred}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setSelectedIntegration(null)} className="btn btn-secondary">
                  Close
                </button>
                <button className="btn btn-primary flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsManagement;
