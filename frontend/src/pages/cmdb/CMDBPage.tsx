import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart3,
  Layers,
  Zap,
  Eye,
  Settings,
  Plus,
  FileText,
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-xl p-8 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Database className="w-8 h-8" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    Configuration Management Database
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs px-3 py-1 bg-white/25 rounded-full font-normal flex items-center gap-1.5"
                    >
                      <Activity className="w-3 h-3" />
                      {loading ? 'Syncing...' : error ? 'Offline' : 'Live'}
                    </motion.span>
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {loading ? 'Loading real-time data from agents...' : error ? '❌ Connection Error - Check backend status' : `✅ ${stats.total} assets monitored • Real-time data from agents`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="/agents/downloads"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2 font-semibold no-underline text-white"
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
                  <FileText className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Assets', value: stats.total, icon: Package, color: 'bg-blue-500', trend: '+12%' },
                { label: 'Active', value: stats.active, icon: CheckCircle, color: 'bg-green-500', trend: '+5%' },
                { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'bg-red-500', trend: '-2%' },
                { label: 'Vulnerabilities', value: stats.vulnerabilities, icon: Shield, color: 'bg-yellow-500', trend: '-15%' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/25"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 ${stat.color} rounded-lg`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-blue-100">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <span className={`text-xs flex items-center gap-1 ${
                      stat.trend.startsWith('+') ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {stat.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.trend}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Connection Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">{error}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={fetchAgents}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Retry Connection
                  </button>
                  <a
                    href="/agents/downloads"
                    className="px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium no-underline"
                  >
                    Download Agents
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, IP, hostname, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <strong className="text-gray-900 dark:text-gray-100">{filteredAssets.length}</strong> of <strong className="text-gray-900 dark:text-gray-100">{assets.length}</strong> assets
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  {showFilters ? 'Hide' : 'Show'} Advanced Filters
                </button>
              </div>
            </div>
          </div>

          {/* Assets Grid/List */}
          {filteredAssets.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}
            >
              {filteredAssets.map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {/* Colored Header Strip */}
                  <div className={`h-1 ${
                    asset.status === 'active' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    asset.status === 'critical' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                    asset.status === 'maintenance' ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                    'bg-gradient-to-r from-gray-300 to-gray-400'
                  }`} />
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`p-3 rounded-lg ${
                            asset.status === 'active' ? 'bg-green-50 dark:bg-green-900/20' :
                            asset.status === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                            asset.status === 'maintenance' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                            'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          {getCategoryIcon(asset.type)}
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{asset.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{asset.id}</p>
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
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{asset.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{asset.location.split('/')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Network className="w-4 h-4 text-gray-400" />
                        <span>{asset.ip}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{asset.owner}</span>
                      </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 mb-4">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        System Resources
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <Cpu className="w-3 h-3" />
                            CPU
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {asset.cpu && typeof asset.cpu === 'string' ? asset.cpu.split('(')[0] : asset.cpu || 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <Database className="w-3 h-3" />
                            RAM
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{asset.ram || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <HardDrive className="w-3 h-3" />
                            Disk
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{asset.disk || 'Unknown'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
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
                          {asset.vulnerabilities} vulns
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {asset.lastScan}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 mb-4"
                >
                  <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Assets Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
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
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <a
                    href="/agents/downloads"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors flex items-center gap-2 no-underline shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download Agents
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Asset Details Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-lg"
                  >
                    {getCategoryIcon(selectedAsset.type)}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAsset.name}</h2>
                    <p className="text-blue-100">{selectedAsset.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status & Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4"
                  >
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border items-center gap-2 ${getStatusColor(
                        selectedAsset.status
                      )}`}
                    >
                      {getStatusIcon(selectedAsset.status)}
                      {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                    </span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4"
                  >
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Category</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.category}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4"
                  >
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Uptime</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.uptime}</div>
                  </motion.div>
                </div>

                {/* System Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    System Information
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Operating System</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.os}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">IP Address</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.ip || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">CPU</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.cpu || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Memory</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.ram || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Storage</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.disk || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Scan</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.lastScan || 'Unknown'}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Location & Ownership */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Location & Ownership
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owner</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.owner}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Security & Compliance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Security & Compliance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Running Services
                      </div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedAsset.services}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Vulnerabilities Found
                      </div>
                      <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {selectedAsset.vulnerabilities}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3 pt-4"
                >
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors flex items-center justify-center gap-2 font-semibold shadow-lg">
                    <RefreshCw className="w-4 h-4" />
                    Scan Now
                  </button>
                  <button className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold">
                    <Eye className="w-4 h-4" />
                    View Logs
                  </button>
                  <button className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
