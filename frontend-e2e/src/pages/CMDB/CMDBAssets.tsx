import { useState } from 'react';

export default function CMDBAssets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample asset data
  const assets = [
    {
      id: 'ASSET-001',
      name: 'web-server-01',
      type: 'Server',
      category: 'Compute',
      status: 'active',
      os: 'Ubuntu 22.04 LTS',
      ip: '10.0.1.15',
      location: 'AWS us-east-1',
      owner: 'DevOps Team',
      lastScan: '2025-12-08T10:30:00Z',
      cpu: 'Intel Xeon E5-2686 v4 (8 cores)',
      memory: '32 GB',
      disk: '500 GB SSD',
      uptime: '45 days',
      services: 12,
      vulnerabilities: 2,
      compliance: 95,
    },
    {
      id: 'ASSET-002',
      name: 'db-primary-01',
      type: 'Database',
      category: 'Database',
      status: 'active',
      os: 'PostgreSQL 15.3',
      ip: '10.0.2.20',
      location: 'AWS us-east-1',
      owner: 'Database Team',
      lastScan: '2025-12-08T09:45:00Z',
      cpu: 'Intel Xeon Platinum 8175M (16 cores)',
      memory: '64 GB',
      disk: '2 TB NVMe',
      uptime: '120 days',
      services: 8,
      vulnerabilities: 0,
      compliance: 100,
    },
    {
      id: 'ASSET-003',
      name: 'app-server-03',
      type: 'Server',
      category: 'Compute',
      status: 'maintenance',
      os: 'CentOS 8',
      ip: '10.0.1.32',
      location: 'Azure East US',
      owner: 'Application Team',
      lastScan: '2025-12-08T08:15:00Z',
      cpu: 'AMD EPYC 7551 (8 cores)',
      memory: '16 GB',
      disk: '250 GB SSD',
      uptime: '12 days',
      services: 6,
      vulnerabilities: 5,
      compliance: 78,
    },
    {
      id: 'ASSET-004',
      name: 'cache-redis-01',
      type: 'Cache',
      category: 'Storage',
      status: 'active',
      os: 'Redis 7.0.12',
      ip: '10.0.3.45',
      location: 'AWS us-west-2',
      owner: 'Platform Team',
      lastScan: '2025-12-08T11:00:00Z',
      cpu: 'Intel Xeon E5-2686 v4 (4 cores)',
      memory: '16 GB',
      disk: '100 GB SSD',
      uptime: '88 days',
      services: 3,
      vulnerabilities: 1,
      compliance: 92,
    },
    {
      id: 'ASSET-005',
      name: 'lb-nginx-01',
      type: 'Load Balancer',
      category: 'Network',
      status: 'active',
      os: 'NGINX 1.24.0',
      ip: '10.0.0.10',
      location: 'GCP us-central1',
      owner: 'Network Team',
      lastScan: '2025-12-08T10:50:00Z',
      cpu: 'Intel Xeon (4 cores)',
      memory: '8 GB',
      disk: '50 GB SSD',
      uptime: '200 days',
      services: 4,
      vulnerabilities: 0,
      compliance: 100,
    },
    {
      id: 'ASSET-006',
      name: 'monitor-prometheus',
      type: 'Monitoring',
      category: 'Observability',
      status: 'active',
      os: 'Prometheus 2.45.0',
      ip: '10.0.4.80',
      location: 'AWS us-east-1',
      owner: 'SRE Team',
      lastScan: '2025-12-08T10:35:00Z',
      cpu: 'Intel Xeon E5-2686 v4 (8 cores)',
      memory: '32 GB',
      disk: '1 TB SSD',
      uptime: '65 days',
      services: 5,
      vulnerabilities: 1,
      compliance: 96,
    },
  ];

  const categories = ['all', 'Compute', 'Database', 'Storage', 'Network', 'Observability'];
  const statuses = ['all', 'active', 'maintenance', 'inactive', 'critical'];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.ip.includes(searchQuery) ||
                         asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.category === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const stats = [
    { label: 'Total Assets', value: assets.length, trend: '+12%', up: true },
    { label: 'Active', value: assets.filter(a => a.status === 'active').length, trend: '+5%', up: true },
    { label: 'Maintenance', value: assets.filter(a => a.status === 'maintenance').length, trend: '-3%', up: false },
    { label: 'Avg Compliance', value: `${Math.round(assets.reduce((sum, a) => sum + a.compliance, 0) / assets.length)}%`, trend: '+2%', up: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            CMDB Assets
          </h1>
          <p className="text-gray-400">Configuration items and infrastructure assets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{stat.label}</span>
                <span className={`text-xs flex items-center gap-1 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? '↑' : '↓'} {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800">{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status} className="bg-gray-800">{status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
                  <p className="text-sm text-gray-400">{asset.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
              </div>

              {/* Type & Category */}
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{asset.type}</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{asset.category}</span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <span className="text-gray-400">OS:</span>
                  <p className="text-white truncate">{asset.os}</p>
                </div>
                <div>
                  <span className="text-gray-400">IP:</span>
                  <p className="text-white">{asset.ip}</p>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <p className="text-white truncate">{asset.location}</p>
                </div>
                <div>
                  <span className="text-gray-400">Owner:</span>
                  <p className="text-white truncate">{asset.owner}</p>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>CPU:</span>
                  <span className="text-white">{asset.cpu}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Memory:</span>
                  <span className="text-white">{asset.memory}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Disk:</span>
                  <span className="text-white">{asset.disk}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{asset.services}</div>
                  <div className="text-xs text-gray-400">Services</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${asset.vulnerabilities > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {asset.vulnerabilities}
                  </div>
                  <div className="text-xs text-gray-400">Vulns</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getComplianceColor(asset.compliance)}`}>
                    {asset.compliance}%
                  </div>
                  <div className="text-xs text-gray-400">Compliance</div>
                </div>
              </div>

              {/* Uptime */}
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
                <span>Uptime: {asset.uptime}</span>
                <span>Last scan: {new Date(asset.lastScan).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No assets found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
