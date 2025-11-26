import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import {
  Server,
  Monitor,
  Database,
  HardDrive,
  Cpu,
  Network,
  Shield,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Package,
  Smartphone,
  Cloud,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'active' | 'inactive' | 'maintenance' | 'critical';
  os: string;
  ip: string;
  location: string;
  owner: string;
  lastScan: string;
  cpu: string;
  ram: string;
  disk: string;
  services: number;
  vulnerabilities: number;
  uptime: string;
}

interface AgentData {
  agentName: string;
  lastSeen: string;
  status: string;
  totalEvents: number;
  eventCounts: {
    process_start: number;
    process_stop: number;
    suspicious_process: number;
    heartbeat: number;
  };
  platform?: string;
  version?: string;
  ipAddress?: string;
  hostname?: string;
  cpu?: string;
  memory?: string;
  disk?: string;
  macAddress?: string;
  domain?: string;
  uptime?: string;
}

export default function CMDBPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents from backend API
  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://192.168.1.9:3000/api/agents');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform agent data to Asset format with REAL data from database
      const transformedAssets: Asset[] = data.agents.map((agent: AgentData) => ({
        id: agent.agentName,
        name: agent.agentName,
        type: agent.platform?.includes('Windows') ? 'Workstation' : 
              agent.platform?.includes('Linux') || agent.platform?.includes('Ubuntu') ? 'Server' : 'Server',
        category: 'Production',
        status: agent.status === 'online' ? 'active' as const : 'inactive' as const,
        os: agent.platform || 'Unknown',
        ip: agent.ipAddress || 'Unknown',  // REAL IP from database
        location: 'Data Center',
        owner: 'IT Operations',
        lastScan: agent.lastSeen,
        cpu: agent.cpu || 'Unknown',       // REAL CPU from database
        ram: agent.memory || 'Unknown',    // REAL RAM from database  
        disk: agent.disk || 'Unknown',     // REAL or Unknown
        services: agent.totalEvents || 0,
        vulnerabilities: 0,
        uptime: agent.uptime || '0s',
      }));
      
      setAssets(transformedAssets);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    'all',
    'Production',
    'Staging',
    'Development',
    'Employee Device',
    'Mobile Device',
    'Infrastructure',
    'Container Platform',
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.ip.includes(searchQuery) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-300',
      inactive: 'bg-gray-100 text-gray-700 border-gray-300',
      maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'Server':
      case 'Build Server':
      case 'Cache Server':
        return <Server className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Workstation':
        return <Monitor className="w-5 h-5" />;
      case 'Mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'Network Device':
        return <Network className="w-5 h-5" />;
      case 'Kubernetes':
      case 'Container Platform':
        return <Cloud className="w-5 h-5" />;
      case 'Storage':
      case 'Load Balancer':
        return <HardDrive className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const stats = {
    total: assets.length,
    active: assets.filter((a) => a.status === 'active').length,
    critical: assets.filter((a) => a.status === 'critical').length,
    vulnerabilities: assets.reduce((sum, a) => sum + a.vulnerabilities, 0),
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Configuration Management Database</h1>
              <p className="text-blue-100 text-lg">
                {loading ? 'Loading real-time data...' : error ? '❌ Connection Error' : `✅ ${stats.total} assets monitored • Live data from agents`}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/agents/downloads"
                className="px-4 py-2 bg-green-500/90 hover:bg-green-600 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 font-semibold"
              >
                <Download className="w-4 h-4" />
                Get Agents
              </a>
              <button 
                onClick={fetchAgents}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 font-semibold">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Assets', value: stats.total, icon: Package, trend: '+12%' },
              { label: 'Active', value: stats.active, icon: CheckCircle, trend: '+5%' },
              { label: 'Critical', value: stats.critical, icon: AlertTriangle, trend: '-2%' },
              {
                label: 'Vulnerabilities',
                value: stats.vulnerabilities,
                icon: Shield,
                trend: '-15%',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5" />
                  <span
                    className={`text-xs flex items-center gap-1 ${
                      stat.trend.startsWith('+') ? 'text-green-300' : 'text-red-300'
                    }`}
                  >
                    {stat.trend.startsWith('+') ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.trend}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Connection Error</h3>
              <p className="text-sm text-red-700 mb-2">{error}</p>
              <div className="flex gap-2">
                <button 
                  onClick={fetchAgents}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Retry Connection
                </button>
                <a
                  href="/agents/downloads"
                  className="px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Download Agents
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, IP, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing <strong>{filteredAssets.length}</strong> of <strong>{assets.length}</strong>{' '}
            assets
          </div>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">{getCategoryIcon(asset.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-500">{asset.id}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(
                        asset.status
                      )}`}
                    >
                      {getStatusIcon(asset.status)}
                      {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{asset.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{asset.location.split('/')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Network className="w-4 h-4 text-gray-400" />
                      <span>{asset.ip}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{asset.owner}</span>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">System Resources</div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-1">
                          <Cpu className="w-3 h-3" />
                          CPU
                        </div>
                        <div className="font-semibold text-gray-900 truncate">{asset.cpu.split('(')[0]}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-1">
                          <Database className="w-3 h-3" />
                          RAM
                        </div>
                        <div className="font-semibold text-gray-900">{asset.ram}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-1">
                          <HardDrive className="w-3 h-3" />
                          Disk
                        </div>
                        <div className="font-semibold text-gray-900">{asset.disk}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {asset.services} services
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield
                          className={`w-3 h-3 ${
                            asset.vulnerabilities > 5 ? 'text-red-500' : 'text-gray-400'
                          }`}
                        />
                        {asset.vulnerabilities} vulnerabilities
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {asset.lastScan}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Database className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assets Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No assets match your search criteria. Try adjusting your filters.'
                  : 'Your CMDB is empty. Install agents on your infrastructure to start discovering assets automatically.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
                <a
                  href="/agents/downloads"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 no-underline"
                >
                  <Download className="w-4 h-4" />
                  Download Agents
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Asset Details Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  {getCategoryIcon(selectedAsset.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAsset.name}</h2>
                  <p className="text-gray-500">{selectedAsset.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">Status</div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border items-center gap-2 ${getStatusColor(
                      selectedAsset.status
                    )}`}
                  >
                    {getStatusIcon(selectedAsset.status)}
                    {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">Category</div>
                  <div className="font-semibold text-gray-900">{selectedAsset.category}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">Uptime</div>
                  <div className="font-semibold text-gray-900">{selectedAsset.uptime}</div>
                </div>
              </div>

              {/* System Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  System Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Operating System</div>
                      <div className="font-semibold text-gray-900">{selectedAsset.os}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">IP Address</div>
                      <div className="font-semibold text-gray-900">{selectedAsset.ip}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">CPU</div>
                      <div className="font-semibold text-gray-900">{selectedAsset.cpu}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Memory</div>
                      <div className="font-semibold text-gray-900">{selectedAsset.ram}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Storage</div>
                      <div className="font-semibold text-gray-900">{selectedAsset.disk}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Last Scan</div>
                      <div className="font-semibold text-gray-900">{selectedAsset.lastScan}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Ownership */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location & Ownership
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Location</div>
                    <div className="font-semibold text-gray-900">{selectedAsset.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Owner</div>
                    <div className="font-semibold text-gray-900">{selectedAsset.owner}</div>
                  </div>
                </div>
              </div>

              {/* Security & Compliance */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Security & Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Running Services</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedAsset.services}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-red-600 mb-2">Vulnerabilities Found</div>
                    <div className="text-2xl font-bold text-red-700">
                      {selectedAsset.vulnerabilities}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Scan Now
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
