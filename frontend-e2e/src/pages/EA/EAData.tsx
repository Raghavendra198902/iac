import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  ArrowPathIcon,
  CircleStackIcon,
  TableCellsIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DataEntity {
  id: string;
  name: string;
  type: 'master' | 'transactional' | 'reference' | 'analytics';
  domain: string;
  records: number;
  quality: number;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  owner: string;
  sources: number;
}

interface DataFlow {
  id: string;
  source: string;
  target: string;
  frequency: string;
  volume: string;
  latency: string;
  status: 'active' | 'inactive' | 'error';
}

const EAData: React.FC = () => {
  const [entities, setEntities] = useState<DataEntity[]>([]);
  const [flows, setFlows] = useState<DataFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    loadDataArchitecture();
  }, []);

  const loadDataArchitecture = () => {
    const sampleEntities: DataEntity[] = [
      {
        id: '1',
        name: 'Customer Master Data',
        type: 'master',
        domain: 'Customer',
        records: 125000,
        quality: 95,
        sensitivity: 'confidential',
        owner: 'CRM Team',
        sources: 3
      },
      {
        id: '2',
        name: 'Order Transactions',
        type: 'transactional',
        domain: 'Sales',
        records: 2450000,
        quality: 88,
        sensitivity: 'internal',
        owner: 'Sales Team',
        sources: 5
      },
      {
        id: '3',
        name: 'Product Catalog',
        type: 'reference',
        domain: 'Product',
        records: 45000,
        quality: 98,
        sensitivity: 'public',
        owner: 'Product Team',
        sources: 2
      },
      {
        id: '4',
        name: 'Financial Analytics',
        type: 'analytics',
        domain: 'Finance',
        records: 850000,
        quality: 92,
        sensitivity: 'restricted',
        owner: 'Finance Team',
        sources: 8
      },
      {
        id: '5',
        name: 'Employee Records',
        type: 'master',
        domain: 'HR',
        records: 8500,
        quality: 96,
        sensitivity: 'restricted',
        owner: 'HR Team',
        sources: 2
      },
      {
        id: '6',
        name: 'Infrastructure Metrics',
        type: 'analytics',
        domain: 'Operations',
        records: 15000000,
        quality: 85,
        sensitivity: 'internal',
        owner: 'DevOps Team',
        sources: 12
      }
    ];

    const sampleFlows: DataFlow[] = [
      {
        id: '1',
        source: 'CRM System',
        target: 'Data Warehouse',
        frequency: 'Real-time',
        volume: '50 GB/day',
        latency: '< 2 sec',
        status: 'active'
      },
      {
        id: '2',
        source: 'Order Management',
        target: 'Analytics Platform',
        frequency: 'Every 15 min',
        volume: '120 GB/day',
        latency: '< 5 min',
        status: 'active'
      },
      {
        id: '3',
        source: 'Product Database',
        target: 'E-commerce Portal',
        frequency: 'Real-time',
        volume: '10 GB/day',
        latency: '< 1 sec',
        status: 'active'
      },
      {
        id: '4',
        source: 'Legacy ERP',
        target: 'Modern ERP',
        frequency: 'Daily',
        volume: '200 GB/day',
        latency: '< 4 hours',
        status: 'error'
      }
    ];

    setEntities(sampleEntities);
    setFlows(sampleFlows);
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'master':
        return 'text-blue-400 bg-blue-400/20';
      case 'transactional':
        return 'text-green-400 bg-green-400/20';
      case 'reference':
        return 'text-purple-400 bg-purple-400/20';
      case 'analytics':
        return 'text-orange-400 bg-orange-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'public':
        return 'text-green-400 bg-green-400/20';
      case 'internal':
        return 'text-blue-400 bg-blue-400/20';
      case 'confidential':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'restricted':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getFlowStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const domains = ['all', ...Array.from(new Set(entities.map(e => e.domain)))];
  const filteredEntities = selectedDomain === 'all' 
    ? entities 
    : entities.filter(e => e.domain === selectedDomain);

  const totalRecords = entities.reduce((sum, e) => sum + e.records, 0);
  const avgQuality = entities.reduce((sum, e) => sum + e.quality, 0) / entities.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading data architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Data Architecture
            </h1>
            <p className="text-gray-300">Data entities, flows, and governance</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedDomain === domain
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CircleStackIcon className="w-8 h-8 text-indigo-400" />
              <span className="text-3xl font-bold text-white">{entities.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Data Entities</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <TableCellsIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{(totalRecords / 1000000).toFixed(1)}M</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Records</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{avgQuality.toFixed(1)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Quality</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ArrowsRightLeftIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{flows.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Data Flows</h3>
          </div>
        </div>

        {/* Data Entities */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Data Entities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntities.map((entity) => (
              <div
                key={entity.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <CircleStackIcon className="w-6 h-6 text-indigo-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{entity.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{entity.domain} Domain</p>
                      <div className="flex gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(entity.type)}`}>
                          {entity.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSensitivityColor(entity.sensitivity)}`}>
                          {entity.sensitivity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Records</p>
                      <p className="text-lg font-bold text-white">{entity.records.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Sources</p>
                      <p className="text-lg font-bold text-white">{entity.sources}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Data Quality</span>
                      <span className="text-sm font-bold text-white">{entity.quality}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          entity.quality >= 90 ? 'bg-green-400' : entity.quality >= 80 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${entity.quality}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Owner</p>
                    <p className="text-sm text-white">{entity.owner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Flows */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Data Flows</h2>
          <div className="space-y-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <ArrowsRightLeftIcon className="w-6 h-6 text-indigo-400" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <p className="text-sm font-semibold text-white">{flow.source}</p>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-white/30"></div>
                      <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <p className="text-sm font-semibold text-white">{flow.target}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-4 ${getFlowStatusColor(flow.status)}`}>
                    {flow.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Frequency</p>
                    <p className="text-sm font-semibold text-white">{flow.frequency}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Volume</p>
                    <p className="text-sm font-semibold text-white">{flow.volume}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Latency</p>
                    <p className="text-sm font-semibold text-white">{flow.latency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default EAData;
