import React, { useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  SignalIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Webhook {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'failing';
  events: string[];
  deliveries: number;
  successRate: number;
  lastDelivery: string;
  avgLatency: number;
  secret: string;
  retryPolicy: string;
  created: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  timestamp: string;
  responseTime: number;
  statusCode: number;
  attempt: number;
}

const IntegrationsWebhooks: React.FC = () => {
  const [webhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'CI/CD Pipeline Notifications',
      url: 'https://api.example.com/webhooks/cicd',
      status: 'active',
      events: ['deployment.started', 'deployment.completed', 'deployment.failed'],
      deliveries: 1543,
      successRate: 99.8,
      lastDelivery: '2 minutes ago',
      avgLatency: 234,
      secret: 'whsec_*********************',
      retryPolicy: 'exponential',
      created: '2024-01-15'
    },
    {
      id: '2',
      name: 'Security Alerts',
      url: 'https://security.example.com/webhooks/alerts',
      status: 'active',
      events: ['security.vulnerability', 'security.breach', 'security.scan'],
      deliveries: 234,
      successRate: 100,
      lastDelivery: '5 minutes ago',
      avgLatency: 156,
      secret: 'whsec_*********************',
      retryPolicy: 'exponential',
      created: '2024-02-01'
    },
    {
      id: '3',
      name: 'Cost Alerts',
      url: 'https://finance.example.com/webhooks/costs',
      status: 'failing',
      events: ['cost.threshold', 'cost.anomaly', 'cost.optimization'],
      deliveries: 89,
      successRate: 67.4,
      lastDelivery: '1 hour ago',
      avgLatency: 890,
      secret: 'whsec_*********************',
      retryPolicy: 'linear',
      created: '2024-03-10'
    },
    {
      id: '4',
      name: 'Infrastructure Changes',
      url: 'https://infra.example.com/webhooks/changes',
      status: 'active',
      events: ['resource.created', 'resource.updated', 'resource.deleted'],
      deliveries: 3456,
      successRate: 98.9,
      lastDelivery: '30 seconds ago',
      avgLatency: 123,
      secret: 'whsec_*********************',
      retryPolicy: 'exponential',
      created: '2023-12-05'
    },
    {
      id: '5',
      name: 'Monitoring Events',
      url: 'https://monitor.example.com/webhooks/events',
      status: 'inactive',
      events: ['alert.triggered', 'alert.resolved', 'metric.threshold'],
      deliveries: 892,
      successRate: 99.2,
      lastDelivery: '2 days ago',
      avgLatency: 201,
      secret: 'whsec_*********************',
      retryPolicy: 'exponential',
      created: '2024-04-20'
    }
  ]);

  const [deliveries] = useState<WebhookDelivery[]>([
    {
      id: '1',
      webhookId: '1',
      event: 'deployment.completed',
      status: 'success',
      timestamp: '2 minutes ago',
      responseTime: 234,
      statusCode: 200,
      attempt: 1
    },
    {
      id: '2',
      webhookId: '4',
      event: 'resource.created',
      status: 'success',
      timestamp: '5 minutes ago',
      responseTime: 123,
      statusCode: 200,
      attempt: 1
    },
    {
      id: '3',
      webhookId: '2',
      event: 'security.scan',
      status: 'success',
      timestamp: '10 minutes ago',
      responseTime: 156,
      statusCode: 200,
      attempt: 1
    },
    {
      id: '4',
      webhookId: '3',
      event: 'cost.threshold',
      status: 'failed',
      timestamp: '1 hour ago',
      responseTime: 890,
      statusCode: 503,
      attempt: 3
    },
    {
      id: '5',
      webhookId: '1',
      event: 'deployment.started',
      status: 'success',
      timestamp: '1 hour ago',
      responseTime: 234,
      statusCode: 200,
      attempt: 1
    },
    {
      id: '6',
      webhookId: '4',
      event: 'resource.updated',
      status: 'success',
      timestamp: '2 hours ago',
      responseTime: 145,
      statusCode: 200,
      attempt: 1
    },
    {
      id: '7',
      webhookId: '3',
      event: 'cost.anomaly',
      status: 'retrying',
      timestamp: '3 hours ago',
      responseTime: 0,
      statusCode: 0,
      attempt: 2
    },
    {
      id: '8',
      webhookId: '2',
      event: 'security.vulnerability',
      status: 'success',
      timestamp: '5 hours ago',
      responseTime: 178,
      statusCode: 200,
      attempt: 1
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'failing':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'pending':
        return 'text-gray-400';
      case 'retrying':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDeliveryIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'retrying':
        return <ArrowPathIcon className="w-5 h-5 text-yellow-400 animate-spin" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const totalDeliveries = webhooks.reduce((sum, wh) => sum + wh.deliveries, 0);
  const activeWebhooks = webhooks.filter(wh => wh.status === 'active').length;
  const avgSuccessRate = webhooks.reduce((sum, wh) => sum + wh.successRate, 0) / webhooks.length;
  const failedDeliveries = deliveries.filter(d => d.status === 'failed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BellIcon className="w-8 h-8 text-purple-400" />
            Webhooks
          </h1>
          <p className="text-gray-400 mt-1">
            Configure and monitor webhook endpoints
          </p>
        </div>
        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Create Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Webhooks</span>
            <BellIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{webhooks.length}</div>
          <div className="text-sm text-green-400 mt-1">{activeWebhooks} active</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Deliveries</span>
            <SignalIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{(totalDeliveries / 1000).toFixed(1)}K</div>
          <div className="text-sm text-gray-400 mt-1">This month</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Success Rate</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{avgSuccessRate.toFixed(1)}%</div>
          <div className="text-sm text-green-400 mt-1">↑ 2.3%</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Failed Deliveries</span>
            <XCircleIcon className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white">{failedDeliveries}</div>
          <div className="text-sm text-gray-400 mt-1">Last 24 hours</div>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BellIcon className="w-6 h-6 text-purple-400" />
          Configured Webhooks
        </h2>
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{webhook.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(webhook.status)}`}>
                      {webhook.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="px-3 py-1 rounded-lg bg-black/30 text-gray-300 text-xs font-mono">
                      {webhook.url}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map((event, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg" title="Test webhook">
                    <SignalIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg" title="View logs">
                    <CodeBracketIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 pt-3 border-t border-white/10">
                <div>
                  <span className="text-xs text-gray-400 block">Deliveries</span>
                  <span className="text-sm text-white font-semibold">{webhook.deliveries}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Success Rate</span>
                  <span className={`text-sm font-semibold ${webhook.successRate >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {webhook.successRate}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Last Delivery</span>
                  <span className="text-sm text-white font-semibold">{webhook.lastDelivery}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Avg Latency</span>
                  <span className="text-sm text-white font-semibold">{webhook.avgLatency}ms</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Retry Policy</span>
                  <span className="text-sm text-white font-semibold capitalize">{webhook.retryPolicy}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Created</span>
                  <span className="text-sm text-white font-semibold">{webhook.created}</span>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">
                  Secured with HMAC signature: <code className="text-gray-300 font-mono">{webhook.secret}</code>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <SignalIcon className="w-6 h-6 text-blue-400" />
          Recent Deliveries
        </h2>
        <div className="space-y-2">
          {deliveries.map((delivery) => {
            const webhook = webhooks.find(w => w.id === delivery.webhookId);
            return (
              <div
                key={delivery.id}
                className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getDeliveryIcon(delivery.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{webhook?.name}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <code className="text-xs text-gray-300 font-mono">{delivery.event}</code>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-400">{delivery.timestamp}</span>
                        {delivery.statusCode > 0 && (
                          <span className={`text-xs ${delivery.statusCode === 200 ? 'text-green-400' : 'text-red-400'}`}>
                            HTTP {delivery.statusCode}
                          </span>
                        )}
                        {delivery.responseTime > 0 && (
                          <span className="text-xs text-gray-400">{delivery.responseTime}ms</span>
                        )}
                        {delivery.attempt > 1 && (
                          <span className="text-xs text-yellow-400">Attempt {delivery.attempt}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${getDeliveryStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Guide */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Webhook Configuration</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-green-400" />
              Security
            </h3>
            <p className="text-xs text-gray-400 mb-2">All webhooks are secured with HMAC signatures</p>
            <code className="text-xs text-gray-300 font-mono block bg-black/30 p-2 rounded">
              X-Webhook-Signature
            </code>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <ArrowPathIcon className="w-4 h-4 text-yellow-400" />
              Retry Policy
            </h3>
            <p className="text-xs text-gray-400 mb-2">Failed deliveries are automatically retried</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Exponential backoff (default)</li>
              <li>• Up to 3 retry attempts</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <CodeBracketIcon className="w-4 h-4 text-blue-400" />
              Payload Format
            </h3>
            <p className="text-xs text-gray-400 mb-2">JSON payload with event metadata</p>
            <code className="text-xs text-gray-300 font-mono block bg-black/30 p-2 rounded">
              Content-Type: application/json
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsWebhooks;
