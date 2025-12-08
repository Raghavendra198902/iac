import { useState } from 'react';

export default function CMDBConfigItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCI, setSelectedCI] = useState<string | null>(null);

  // Sample configuration items
  const configItems = [
    {
      id: 'CI-001',
      name: 'iac-api-gateway-v3',
      type: 'Application',
      environment: 'Production',
      version: '3.0.8',
      status: 'deployed',
      health: 98,
      dependencies: ['CI-002', 'CI-005', 'CI-008'],
      owner: 'Platform Team',
      criticality: 'high',
      lastChange: '2025-12-07T14:30:00Z',
      changeBy: 'John Doe',
      description: 'Main API Gateway for IAC Dharma v3.0',
      attributes: {
        replicas: 3,
        cpu: '2 cores',
        memory: '4 GB',
        port: 4000,
      },
    },
    {
      id: 'CI-002',
      name: 'iac-postgres-v3',
      type: 'Database',
      environment: 'Production',
      version: '15.3',
      status: 'running',
      health: 100,
      dependencies: [],
      owner: 'Database Team',
      criticality: 'critical',
      lastChange: '2025-11-28T09:15:00Z',
      changeBy: 'Jane Smith',
      description: 'Primary PostgreSQL database',
      attributes: {
        size: '250 GB',
        connections: 150,
        cpu: '8 cores',
        memory: '32 GB',
      },
    },
    {
      id: 'CI-003',
      name: 'iac-zero-trust-security',
      type: 'Security Service',
      environment: 'Production',
      version: '2.1.0',
      status: 'deployed',
      health: 95,
      dependencies: ['CI-002', 'CI-005'],
      owner: 'Security Team',
      criticality: 'critical',
      lastChange: '2025-12-05T16:45:00Z',
      changeBy: 'Security Admin',
      description: 'Zero Trust Security framework',
      attributes: {
        replicas: 2,
        cpu: '4 cores',
        memory: '8 GB',
        port: 8500,
      },
    },
    {
      id: 'CI-004',
      name: 'iac-ai-orchestrator',
      type: 'ML Service',
      environment: 'Production',
      version: '1.5.2',
      status: 'deployed',
      health: 92,
      dependencies: ['CI-002', 'CI-006'],
      owner: 'AI Team',
      criticality: 'high',
      lastChange: '2025-12-06T11:20:00Z',
      changeBy: 'ML Engineer',
      description: 'AI/ML orchestration service',
      attributes: {
        replicas: 2,
        cpu: '8 cores',
        memory: '16 GB',
        gpus: '2x NVIDIA T4',
      },
    },
    {
      id: 'CI-005',
      name: 'iac-redis-v3',
      type: 'Cache',
      environment: 'Production',
      version: '7.0.12',
      status: 'running',
      health: 100,
      dependencies: [],
      owner: 'Platform Team',
      criticality: 'high',
      lastChange: '2025-11-30T13:00:00Z',
      changeBy: 'DevOps Team',
      description: 'Redis cache cluster',
      attributes: {
        nodes: 3,
        memory: '16 GB per node',
        evictionPolicy: 'allkeys-lru',
        port: 6379,
      },
    },
    {
      id: 'CI-006',
      name: 'iac-mlflow-v3',
      type: 'ML Platform',
      environment: 'Production',
      version: '2.7.1',
      status: 'deployed',
      health: 88,
      dependencies: ['CI-002', 'CI-007'],
      owner: 'AI Team',
      criticality: 'medium',
      lastChange: '2025-12-04T10:30:00Z',
      changeBy: 'Data Scientist',
      description: 'MLflow experiment tracking',
      attributes: {
        replicas: 2,
        storage: '500 GB',
        cpu: '4 cores',
        memory: '8 GB',
      },
    },
    {
      id: 'CI-007',
      name: 'minio-storage',
      type: 'Object Storage',
      environment: 'Production',
      version: '2023.11.1',
      status: 'running',
      health: 99,
      dependencies: [],
      owner: 'Platform Team',
      criticality: 'medium',
      lastChange: '2025-11-25T08:00:00Z',
      changeBy: 'Storage Admin',
      description: 'MinIO object storage for artifacts',
      attributes: {
        capacity: '5 TB',
        buckets: 12,
        replicas: 4,
        port: 9000,
      },
    },
    {
      id: 'CI-008',
      name: 'iac-kafka-v3',
      type: 'Message Broker',
      environment: 'Production',
      version: '3.5.1',
      status: 'running',
      health: 97,
      dependencies: [],
      owner: 'Platform Team',
      criticality: 'high',
      lastChange: '2025-12-01T15:20:00Z',
      changeBy: 'Platform Engineer',
      description: 'Apache Kafka message broker',
      attributes: {
        brokers: 3,
        topics: 45,
        partitions: 180,
        replicationFactor: 3,
      },
    },
  ];

  const types = ['all', 'Application', 'Database', 'Security Service', 'ML Service', 'Cache', 'ML Platform', 'Object Storage', 'Message Broker'];

  const filteredItems = configItems.filter(ci => {
    const matchesSearch = ci.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ci.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ci.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || ci.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
      case 'running': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'updating': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'stopped': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-400';
    if (health >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const stats = [
    { label: 'Total CIs', value: configItems.length, color: 'blue' },
    { label: 'Production', value: configItems.filter(ci => ci.environment === 'Production').length, color: 'green' },
    { label: 'Critical', value: configItems.filter(ci => ci.criticality === 'critical').length, color: 'red' },
    { label: 'Avg Health', value: `${Math.round(configItems.reduce((sum, ci) => sum + ci.health, 0) / configItems.length)}%`, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg backdrop-blur-sm">
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Configuration Items
          </h1>
          <p className="text-gray-400">Manage and track all configuration items in your infrastructure</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search configuration items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {types.map(type => (
                <option key={type} value={type} className="bg-gray-800">{type === 'all' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Configuration Items */}
        <div className="space-y-4">
          {filteredItems.map((ci) => (
            <div key={ci.id} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{ci.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ci.status)}`}>
                      {ci.status}
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{ci.type}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{ci.id}</p>
                  <p className="text-sm text-gray-300">{ci.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getHealthColor(ci.health)}`}>{ci.health}%</div>
                  <div className="text-xs text-gray-400">Health</div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-400">Environment</span>
                  <p className="text-white font-medium">{ci.environment}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Version</span>
                  <p className="text-white font-medium">{ci.version}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Owner</span>
                  <p className="text-white font-medium">{ci.owner}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Criticality</span>
                  <p className={`font-medium ${getCriticalityColor(ci.criticality)}`}>
                    {ci.criticality.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Attributes */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Attributes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(ci.attributes).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-400">{key}:</span>
                      <p className="text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependencies & Change Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    Dependencies: <span className="text-white font-medium">{ci.dependencies.length}</span>
                  </span>
                  {ci.dependencies.length > 0 && (
                    <button
                      onClick={() => setSelectedCI(selectedCI === ci.id ? null : ci.id)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {selectedCI === ci.id ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                <div className="text-gray-400">
                  Last change: <span className="text-white">{new Date(ci.lastChange).toLocaleString()}</span> by <span className="text-white">{ci.changeBy}</span>
                </div>
              </div>

              {/* Dependencies List */}
              {selectedCI === ci.id && ci.dependencies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">Dependent Configuration Items:</h5>
                  <div className="flex flex-wrap gap-2">
                    {ci.dependencies.map(dep => {
                      const depCI = configItems.find(item => item.id === dep);
                      return (
                        <span key={dep} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white">
                          {depCI ? depCI.name : dep}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No configuration items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
