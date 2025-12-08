import React, { useState, useEffect } from 'react';
import {
  CloudIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ServerIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface CloudArchitecture {
  id: string;
  name: string;
  provider: 'AWS' | 'Azure' | 'GCP' | 'Multi-Cloud';
  type: 'iaas' | 'paas' | 'saas' | 'hybrid';
  services: CloudService[];
  region: string;
  compliance: string[];
  cost: {
    monthly: number;
    trend: 'up' | 'down' | 'stable';
  };
  metrics: {
    availability: number;
    performance: number;
    scalability: number;
  };
}

interface CloudService {
  name: string;
  category: string;
  status: 'active' | 'provisioning' | 'inactive';
  instances: number;
}

const TACloud: React.FC = () => {
  const [architectures, setArchitectures] = useState<CloudArchitecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  useEffect(() => {
    loadCloudArchitectures();
  }, []);

  const loadCloudArchitectures = () => {
    const sampleArchitectures: CloudArchitecture[] = [
      {
        id: '1',
        name: 'Production Environment',
        provider: 'AWS',
        type: 'iaas',
        region: 'us-east-1',
        compliance: ['SOC 2', 'HIPAA', 'PCI DSS'],
        cost: { monthly: 28500, trend: 'stable' },
        metrics: { availability: 99.98, performance: 95, scalability: 98 },
        services: [
          { name: 'EC2', category: 'Compute', status: 'active', instances: 42 },
          { name: 'RDS', category: 'Database', status: 'active', instances: 8 },
          { name: 'S3', category: 'Storage', status: 'active', instances: 1 },
          { name: 'Lambda', category: 'Serverless', status: 'active', instances: 156 },
          { name: 'CloudFront', category: 'CDN', status: 'active', instances: 3 }
        ]
      },
      {
        id: '2',
        name: 'Analytics Platform',
        provider: 'GCP',
        type: 'paas',
        region: 'us-central1',
        compliance: ['SOC 2', 'ISO 27001'],
        cost: { monthly: 12300, trend: 'up' },
        metrics: { availability: 99.95, performance: 93, scalability: 96 },
        services: [
          { name: 'BigQuery', category: 'Analytics', status: 'active', instances: 1 },
          { name: 'Dataflow', category: 'Processing', status: 'active', instances: 24 },
          { name: 'Cloud Storage', category: 'Storage', status: 'active', instances: 1 },
          { name: 'Cloud Functions', category: 'Serverless', status: 'active', instances: 89 }
        ]
      },
      {
        id: '3',
        name: 'Development Environment',
        provider: 'Azure',
        type: 'iaas',
        region: 'eastus',
        compliance: ['SOC 2'],
        cost: { monthly: 5600, trend: 'down' },
        metrics: { availability: 99.5, performance: 88, scalability: 90 },
        services: [
          { name: 'Virtual Machines', category: 'Compute', status: 'active', instances: 18 },
          { name: 'SQL Database', category: 'Database', status: 'active', instances: 4 },
          { name: 'Blob Storage', category: 'Storage', status: 'active', instances: 1 },
          { name: 'Azure Functions', category: 'Serverless', status: 'active', instances: 42 }
        ]
      },
      {
        id: '4',
        name: 'Disaster Recovery',
        provider: 'Multi-Cloud',
        type: 'hybrid',
        region: 'Multi-region',
        compliance: ['SOC 2', 'HIPAA', 'ISO 27001'],
        cost: { monthly: 8900, trend: 'stable' },
        metrics: { availability: 99.99, performance: 92, scalability: 95 },
        services: [
          { name: 'Backup Services', category: 'Backup', status: 'active', instances: 12 },
          { name: 'Replication', category: 'DR', status: 'active', instances: 8 },
          { name: 'Failover', category: 'HA', status: 'active', instances: 6 }
        ]
      },
      {
        id: '5',
        name: 'SaaS Applications',
        provider: 'Multi-Cloud',
        type: 'saas',
        region: 'Global',
        compliance: ['SOC 2', 'GDPR'],
        cost: { monthly: 3200, trend: 'stable' },
        metrics: { availability: 99.9, performance: 90, scalability: 85 },
        services: [
          { name: 'Auth0', category: 'Identity', status: 'active', instances: 1 },
          { name: 'Datadog', category: 'Monitoring', status: 'active', instances: 1 },
          { name: 'PagerDuty', category: 'Incident', status: 'active', instances: 1 }
        ]
      }
    ];

    setArchitectures(sampleArchitectures);
    setLoading(false);
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'AWS':
        return 'text-orange-400 bg-orange-400/20';
      case 'Azure':
        return 'text-blue-400 bg-blue-400/20';
      case 'GCP':
        return 'text-green-400 bg-green-400/20';
      case 'Multi-Cloud':
        return 'text-purple-400 bg-purple-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  const providers = ['all', 'AWS', 'Azure', 'GCP', 'Multi-Cloud'];
  const filteredArchitectures = selectedProvider === 'all' 
    ? architectures 
    : architectures.filter(a => a.provider === selectedProvider);

  const totalCost = architectures.reduce((sum, a) => sum + a.cost.monthly, 0);
  const avgAvailability = architectures.reduce((sum, a) => sum + a.metrics.availability, 0) / architectures.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading cloud architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-sky-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              Cloud Architecture
            </h1>
            <p className="text-gray-300">Multi-cloud infrastructure and service architecture</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {providers.map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedProvider === provider
                    ? 'bg-sky-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CloudIcon className="w-8 h-8 text-sky-400" />
              <span className="text-3xl font-bold text-white">{architectures.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Environments</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{avgAvailability.toFixed(2)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Availability</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">${(totalCost / 1000).toFixed(1)}K</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Monthly Cost</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <GlobeAltIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">
                {new Set(architectures.flatMap(a => a.compliance)).size}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Compliance</h3>
          </div>
        </div>

        {/* Cloud Architectures */}
        <div className="space-y-6">
          {filteredArchitectures.map((arch) => (
            <div
              key={arch.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <CloudIcon className="w-8 h-8 text-sky-400" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{arch.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getProviderColor(arch.provider)}`}>
                        {arch.provider}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-white/10 text-gray-300 uppercase">
                        {arch.type}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-cyan-400/20 text-cyan-400">
                        {arch.region}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Monthly Cost</p>
                  <p className="text-2xl font-bold text-white">
                    ${(arch.cost.monthly / 1000).toFixed(1)}K {getTrendIcon(arch.cost.trend)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Metrics</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Availability</span>
                        <span className="text-white font-semibold">{arch.metrics.availability}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${arch.metrics.availability}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Performance</span>
                        <span className="text-white font-semibold">{arch.metrics.performance}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${arch.metrics.performance}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Scalability</span>
                        <span className="text-white font-semibold">{arch.metrics.scalability}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${arch.metrics.scalability}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Services</h4>
                  <div className="space-y-2">
                    {arch.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <ServerIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-white font-semibold">{service.name}</span>
                          <span className="text-xs text-gray-400">({service.category})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{service.instances} instances</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            service.status === 'active' 
                              ? 'bg-green-400/20 text-green-400' 
                              : 'bg-yellow-400/20 text-yellow-400'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Compliance Frameworks</h4>
                <div className="flex gap-2 flex-wrap">
                  {arch.compliance.map((framework, index) => (
                    <span key={index} className="px-3 py-1 rounded text-xs font-semibold bg-green-400/20 text-green-400">
                      ✓ {framework}
                    </span>
                  ))}
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

export default TACloud;
