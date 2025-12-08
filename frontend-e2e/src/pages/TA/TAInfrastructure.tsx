import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CpuChipIcon,
  CircleStackIcon,
  CloudIcon,
  CubeIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface InfrastructureComponent {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'network' | 'database' | 'security';
  environment: 'production' | 'staging' | 'development';
  status: 'active' | 'degraded' | 'inactive';
  capacity: {
    current: number;
    total: number;
    unit: string;
  };
  metrics: {
    uptime: number;
    performance: number;
    reliability: number;
  };
  location: string;
  provider: string;
  cost: number;
}

const TAInfrastructure: React.FC = () => {
  const [components, setComponents] = useState<InfrastructureComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');

  useEffect(() => {
    loadInfrastructureComponents();
  }, []);

  const loadInfrastructureComponents = () => {
    const sampleComponents: InfrastructureComponent[] = [
      {
        id: '1',
        name: 'Production Kubernetes Cluster',
        type: 'compute',
        environment: 'production',
        status: 'active',
        capacity: { current: 42, total: 64, unit: 'nodes' },
        metrics: { uptime: 99.98, performance: 94, reliability: 98 },
        location: 'us-east-1',
        provider: 'AWS',
        cost: 12500
      },
      {
        id: '2',
        name: 'Primary PostgreSQL Database',
        type: 'database',
        environment: 'production',
        status: 'active',
        capacity: { current: 2.4, total: 5.0, unit: 'TB' },
        metrics: { uptime: 99.99, performance: 96, reliability: 99 },
        location: 'us-east-1',
        provider: 'AWS RDS',
        cost: 3200
      },
      {
        id: '3',
        name: 'Redis Cache Cluster',
        type: 'database',
        environment: 'production',
        status: 'active',
        capacity: { current: 48, total: 64, unit: 'GB' },
        metrics: { uptime: 99.95, performance: 98, reliability: 97 },
        location: 'us-east-1',
        provider: 'AWS ElastiCache',
        cost: 1800
      },
      {
        id: '4',
        name: 'S3 Object Storage',
        type: 'storage',
        environment: 'production',
        status: 'active',
        capacity: { current: 18.5, total: 0, unit: 'TB' },
        metrics: { uptime: 99.99, performance: 95, reliability: 99 },
        location: 'Multi-region',
        provider: 'AWS S3',
        cost: 850
      },
      {
        id: '5',
        name: 'Application Load Balancer',
        type: 'network',
        environment: 'production',
        status: 'active',
        capacity: { current: 1250, total: 5000, unit: 'req/s' },
        metrics: { uptime: 99.99, performance: 97, reliability: 99 },
        location: 'us-east-1',
        provider: 'AWS ALB',
        cost: 950
      },
      {
        id: '6',
        name: 'WAF & DDoS Protection',
        type: 'security',
        environment: 'production',
        status: 'active',
        capacity: { current: 0, total: 0, unit: 'rules' },
        metrics: { uptime: 99.99, performance: 99, reliability: 99 },
        location: 'Global',
        provider: 'Cloudflare',
        cost: 2400
      },
      {
        id: '7',
        name: 'Staging Environment',
        type: 'compute',
        environment: 'staging',
        status: 'active',
        capacity: { current: 8, total: 12, unit: 'nodes' },
        metrics: { uptime: 99.5, performance: 88, reliability: 92 },
        location: 'us-west-2',
        provider: 'AWS',
        cost: 2100
      },
      {
        id: '8',
        name: 'Development Cluster',
        type: 'compute',
        environment: 'development',
        status: 'active',
        capacity: { current: 4, total: 8, unit: 'nodes' },
        metrics: { uptime: 98.8, performance: 85, reliability: 89 },
        location: 'us-west-2',
        provider: 'AWS',
        cost: 980
      }
    ];

    setComponents(sampleComponents);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compute':
        return <CpuChipIcon className="w-6 h-6 text-blue-400" />;
      case 'storage':
        return <CircleStackIcon className="w-6 h-6 text-purple-400" />;
      case 'network':
        return <SignalIcon className="w-6 h-6 text-green-400" />;
      case 'database':
        return <CubeIcon className="w-6 h-6 text-cyan-400" />;
      case 'security':
        return <CheckCircleIcon className="w-6 h-6 text-orange-400" />;
      default:
        return <ServerIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'degraded':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'inactive':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const types = ['all', 'compute', 'storage', 'network', 'database', 'security'];
  const environments = ['all', 'production', 'staging', 'development'];

  const filteredComponents = components.filter(c => {
    const typeMatch = selectedType === 'all' || c.type === selectedType;
    const envMatch = selectedEnv === 'all' || c.environment === selectedEnv;
    return typeMatch && envMatch;
  });

  const totalCost = components.reduce((sum, c) => sum + c.cost, 0);
  const avgUptime = components.reduce((sum, c) => sum + c.metrics.uptime, 0) / components.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading infrastructure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Infrastructure Design
          </h1>
          <p className="text-gray-300">Technical infrastructure components and architecture</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <div className="flex gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {environments.map((env) => (
              <button
                key={env}
                onClick={() => setSelectedEnv(env)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedEnv === env
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{components.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Components</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{avgUptime.toFixed(2)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Uptime</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CloudIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">
                {components.filter(c => c.status === 'active').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Active</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CubeIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">${(totalCost / 1000).toFixed(1)}K</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Monthly Cost</h3>
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getTypeIcon(component.type)}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{component.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(component.status)}`}>
                        {component.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-white/10 text-gray-300 capitalize">
                        {component.environment}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-400/20 text-blue-400 capitalize">
                        {component.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {component.capacity.total > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Capacity</span>
                      <span className="text-white font-semibold">
                        {component.capacity.current} / {component.capacity.total} {component.capacity.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${(component.capacity.current / component.capacity.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Uptime</p>
                    <p className="text-lg font-bold text-white">{component.metrics.uptime}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Performance</p>
                    <p className="text-lg font-bold text-white">{component.metrics.performance}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Reliability</p>
                    <p className="text-lg font-bold text-white">{component.metrics.reliability}%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400">Provider</p>
                    <p className="text-sm font-semibold text-white">{component.provider}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-semibold text-white">{component.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cost/Month</p>
                    <p className="text-sm font-semibold text-white">${component.cost}</p>
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

export default TAInfrastructure;
