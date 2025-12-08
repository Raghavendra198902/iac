import React, { useState, useEffect } from 'react';
import {
  PuzzlePieceIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  source: string;
  target: string;
  type: 'api' | 'etl' | 'stream' | 'messaging' | 'batch';
  protocol: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  throughput: string;
  latency: string;
  uptime: number;
}

const EAIntegration: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const sampleIntegrations: Integration[] = [
      {
        id: '1',
        name: 'CRM to Data Warehouse Sync',
        source: 'Salesforce CRM',
        target: 'Snowflake DW',
        type: 'etl',
        protocol: 'REST API',
        status: 'active',
        throughput: '50K records/hour',
        latency: '< 2 min',
        uptime: 99.95
      },
      {
        id: '2',
        name: 'Order Processing Stream',
        source: 'E-commerce Platform',
        target: 'Fulfillment System',
        type: 'stream',
        protocol: 'Kafka',
        status: 'active',
        throughput: '1K events/sec',
        latency: '< 500ms',
        uptime: 99.98
      },
      {
        id: '3',
        name: 'Payment Gateway Integration',
        source: 'Order Service',
        target: 'Stripe API',
        type: 'api',
        protocol: 'HTTPS/REST',
        status: 'active',
        throughput: '500 req/min',
        latency: '< 200ms',
        uptime: 99.99
      },
      {
        id: '4',
        name: 'Inventory Update Queue',
        source: 'Warehouse System',
        target: 'Inventory Service',
        type: 'messaging',
        protocol: 'RabbitMQ',
        status: 'active',
        throughput: '2K msg/min',
        latency: '< 1 sec',
        uptime: 99.85
      },
      {
        id: '5',
        name: 'Financial Report Generation',
        source: 'ERP System',
        target: 'BI Platform',
        type: 'batch',
        protocol: 'SFTP',
        status: 'active',
        throughput: '1 GB/day',
        latency: '< 4 hours',
        uptime: 99.5
      },
      {
        id: '6',
        name: 'Legacy System Bridge',
        source: 'Mainframe',
        target: 'Modern API Gateway',
        type: 'api',
        protocol: 'SOAP/XML',
        status: 'error',
        throughput: '100 req/min',
        latency: '< 5 sec',
        uptime: 95.2
      },
      {
        id: '7',
        name: 'Customer Data Platform Sync',
        source: 'CDP',
        target: 'Marketing Automation',
        type: 'stream',
        protocol: 'Webhooks',
        status: 'active',
        throughput: '5K events/min',
        latency: '< 1 sec',
        uptime: 99.7
      },
      {
        id: '8',
        name: 'Infrastructure Metrics Pipeline',
        source: 'Prometheus',
        target: 'Grafana',
        type: 'api',
        protocol: 'HTTP/PromQL',
        status: 'active',
        throughput: '10K metrics/min',
        latency: '< 100ms',
        uptime: 99.92
      }
    ];

    setIntegrations(sampleIntegrations);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      case 'maintenance':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'text-blue-400 bg-blue-400/20';
      case 'etl':
        return 'text-purple-400 bg-purple-400/20';
      case 'stream':
        return 'text-green-400 bg-green-400/20';
      case 'messaging':
        return 'text-orange-400 bg-orange-400/20';
      case 'batch':
        return 'text-cyan-400 bg-cyan-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const types = ['all', 'api', 'etl', 'stream', 'messaging', 'batch'];
  const filteredIntegrations = selectedType === 'all' 
    ? integrations 
    : integrations.filter(i => i.type === selectedType);

  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const avgUptime = integrations.reduce((sum, i) => sum + i.uptime, 0) / integrations.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-green-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Integration Architecture
            </h1>
            <p className="text-gray-300">System integrations and data flows</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors uppercase ${
                  selectedType === type
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <PuzzlePieceIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{integrations.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Integrations</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold text-white">{activeIntegrations}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Active</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-teal-400" />
              <span className="text-3xl font-bold text-white">{avgUptime.toFixed(2)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Uptime</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              <span className="text-3xl font-bold text-white">
                {integrations.filter(i => i.status === 'error').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Errors</h3>
          </div>
        </div>

        {/* Integrations List */}
        <div className="space-y-4">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(integration.status)}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{integration.name}</h3>
                    
                    {/* Integration Flow */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <p className="text-sm font-semibold text-white">{integration.source}</p>
                      </div>
                      <ArrowsRightLeftIcon className="w-5 h-5 text-green-400" />
                      <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <p className="text-sm font-semibold text-white">{integration.target}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(integration.type)}`}>
                        {integration.type.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500/20 text-gray-300">
                        {integration.protocol}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(integration.status)}`}>
                  {integration.status.toUpperCase()}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Throughput</p>
                  <p className="text-lg font-bold text-white">{integration.throughput}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Latency</p>
                  <p className="text-lg font-bold text-white">{integration.latency}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-400">Uptime</p>
                    <p className="text-lg font-bold text-white">{integration.uptime}%</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        integration.uptime >= 99 ? 'bg-green-400' : integration.uptime >= 95 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${integration.uptime}%` }}
                    ></div>
                  </div>
                </div>
              </div>
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

export default EAIntegration;
