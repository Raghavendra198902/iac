import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Database,
  Wifi,
  Shield,
  Eye,
  Settings,
  Calendar,
  Download,
  Bell,
  Info,
} from 'lucide-react';

interface Agent {
  id: string;
  hostname: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  os: string;
  version: string;
  uptime: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  lastSeen: string;
  alerts: number;
}

interface Metric {
  timestamp: string;
  value: number;
}

interface Alert {
  id: string;
  hostname: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'service';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export default function Monitoring() {
  const [activeView, setActiveView] = useState<'overview' | 'agents' | 'metrics' | 'alerts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to extract percentage from formatted string like "6.1/30.6 GB (20.0%)"
  const extractPercentage = (formattedString: string | undefined): number => {
    if (!formattedString) return 0;
    const match = formattedString.match(/\((\d+\.?\d*)%\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Helper function to calculate uptime from last_sync timestamp
  const calculateUptime = (lastSync: string | undefined): string => {
    if (!lastSync) return '0d 0h 0m';
    
    const now = new Date();
    const lastSyncDate = new Date(lastSync);
    const diffMs = now.getTime() - lastSyncDate.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Helper function to calculate "last seen" from last_sync timestamp
  const calculateLastSeen = (lastSync: string | undefined): string => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const lastSyncDate = new Date(lastSync);
    const diffMs = now.getTime() - lastSyncDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Helper function to determine agent status
  const getAgentStatus = (lastSeenOrSync: string | undefined): 'online' | 'warning' | 'offline' => {
    if (!lastSeenOrSync) return 'offline';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeenOrSync);
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
    
    if (diffMinutes < 2) return 'online';
    if (diffMinutes < 10) return 'warning';
    return 'offline';
  };

  // Fetch agents from API
  const fetchAgents = async () => {
    try {
      setError(null);
      const response = await fetch('http://192.168.1.9:3000/api/agents');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }
      
      const data = await response.json();
      
      // API returns {success: true, count: X, agents: [...]}
      const agentsData = data.agents || [];
      
      // Transform API response to Agent interface
      const transformedAgents: Agent[] = agentsData.map((agent: any) => {
        // Use percentage values directly from API if available
        const cpuPercent = agent.cpuPercent !== undefined ? agent.cpuPercent : extractPercentage(agent.cpu);
        const memoryPercent = agent.memoryPercent !== undefined ? agent.memoryPercent : extractPercentage(agent.memory);
        const diskPercent = agent.diskPercent !== undefined ? agent.diskPercent : extractPercentage(agent.disk);
        
        return {
          id: agent.id || agent.agent_id || agent.agentName || '',
          hostname: agent.agentName || agent.hostname || 'Unknown',
          ip: agent.ipAddress || agent.ip_address || 'Unknown',
          status: getAgentStatus(agent.lastSeen || agent.last_sync),
          os: agent.platform || agent.os || 'Unknown',
          version: agent.version || '1.0.0',
          uptime: agent.uptime || calculateUptime(agent.lastSeen || agent.last_sync),
          cpu: Math.round(cpuPercent),
          memory: Math.round(memoryPercent),
          disk: Math.round(diskPercent),
          networkIn: agent.networkIn || 0,
          networkOut: agent.networkOut || 0,
          lastSeen: calculateLastSeen(agent.lastSeen || agent.last_sync),
          alerts: 0, // Default to 0, can be enhanced later with real alerts
        };
      });
      
      setAgents(transformedAgents);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
      setLoading(false);
    }
  };

  // Fetch agents on mount and set up polling
  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Generate alerts based on actual agent metrics
  const generateAlerts = (): Alert[] => {
    const generatedAlerts: Alert[] = [];
    let alertId = 1;

    agents.forEach(agent => {
      const now = new Date();
      
      // CPU alerts
      if (agent.cpu >= 85) {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'cpu',
          severity: 'critical',
          message: `CPU usage exceeded 85% (${agent.cpu}%)`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      } else if (agent.cpu >= 70) {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'cpu',
          severity: 'warning',
          message: `CPU usage at ${agent.cpu}%, approaching threshold`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      }

      // Memory alerts
      if (agent.memory >= 90) {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'memory',
          severity: 'critical',
          message: `Memory usage at ${agent.memory}%, critical level`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      } else if (agent.memory >= 75) {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'memory',
          severity: 'warning',
          message: `Memory usage at ${agent.memory}%, approaching threshold`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      }

      // Disk alerts
      if (agent.disk >= 85) {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'disk',
          severity: 'critical',
          message: `Disk space at ${agent.disk}%, critical - immediate cleanup required`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      } else if (agent.disk >= 70) {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'disk',
          severity: 'warning',
          message: `Disk space at ${agent.disk}%, cleanup recommended`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      }

      // Agent offline alerts
      if (agent.status === 'offline') {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'service',
          severity: 'critical',
          message: 'Agent offline - no heartbeat received',
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      }

      // Network alerts (if very high traffic)
      if (agent.networkIn > 50 || agent.networkOut > 50) {
        generatedAlerts.push({
          id: String(alertId++),
          hostname: agent.hostname,
          type: 'network',
          severity: 'warning',
          message: `High network traffic detected (In: ${agent.networkIn} MB/s, Out: ${agent.networkOut} MB/s)`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          acknowledged: false,
        });
      }
    });

    return generatedAlerts;
  };

  const alerts = generateAlerts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'offline': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'info': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAgents();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.ip.includes(searchQuery) ||
                         agent.os.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAgents = agents.length;
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const warningAgents = agents.filter(a => a.status === 'warning').length;
  const offlineAgents = agents.filter(a => a.status === 'offline').length;
  const totalAlerts = alerts.filter(a => !a.acknowledged).length;
  const avgCpu = Math.round(agents.reduce((sum, a) => sum + a.cpu, 0) / agents.length);
  const avgMemory = Math.round(agents.reduce((sum, a) => sum + a.memory, 0) / agents.length);
  const avgDisk = Math.round(agents.reduce((sum, a) => sum + a.disk, 0) / agents.length);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 rounded-xl p-8 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Activity className="w-8 h-8" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    Agent Monitoring
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs px-3 py-1 bg-white/25 rounded-full font-normal flex items-center gap-1.5"
                    >
                      <Eye className="w-3 h-3" />
                      Live
                    </motion.span>
                  </h1>
                  <p className="text-purple-100 text-lg">
                    Real-time monitoring and performance metrics for all managed endpoints
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-purple-100">Loading agents...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-400/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-200" />
                  <span className="text-red-100">Error: {error}</span>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            {!loading && !error && (
              <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Total Agents', value: totalAgents, icon: Server, color: 'bg-blue-500' },
                { label: 'Online', value: onlineAgents, icon: CheckCircle, color: 'bg-green-500' },
                { label: 'Warnings', value: warningAgents, icon: AlertTriangle, color: 'bg-yellow-500' },
                { label: 'Offline', value: offlineAgents, icon: XCircle, color: 'bg-red-500' },
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
                    <span className="text-sm text-purple-100">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Active Alerts', value: totalAlerts, icon: Bell, color: 'bg-red-500', trend: '+3' },
                { label: 'Avg CPU', value: `${avgCpu}%`, icon: Cpu, color: 'bg-purple-500', trend: '+5%' },
                { label: 'Avg Memory', value: `${avgMemory}%`, icon: Database, color: 'bg-pink-500', trend: '-2%' },
                { label: 'Avg Disk', value: `${avgDisk}%`, icon: HardDrive, color: 'bg-indigo-500', trend: '+1%' },
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 ${metric.color} rounded`}>
                        <metric.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-purple-100">{metric.label}</span>
                    </div>
                    <span className="text-xs text-purple-200">{metric.trend}</span>
                  </div>
                  <div className="text-xl font-bold">{metric.value}</div>
                </motion.div>
              ))}
            </div>
            </>
            )}
          </motion.div>

          {/* View Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'agents', label: 'Agents', icon: Server },
                { id: 'metrics', label: 'Metrics', icon: LineChart },
                { id: 'alerts', label: 'Alerts', icon: Bell },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <view.icon className="w-5 h-5" />
                  {view.label}
                  {view.id === 'alerts' && totalAlerts > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {totalAlerts}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agents, IPs, or operating systems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="warning">Warning</option>
                  <option value="offline">Offline</option>
                </select>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeView === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* System Health Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">CPU Usage</h3>
                          <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{avgCpu}%</div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700 dark:text-blue-300">+5% from yesterday</span>
                        </div>
                        <div className="mt-4 h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${avgCpu}%` }}
                            className="h-full bg-blue-600 dark:bg-blue-400"
                          />
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Memory Usage</h3>
                          <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{avgMemory}%</div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingDown className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700 dark:text-purple-300">-2% from yesterday</span>
                        </div>
                        <div className="mt-4 h-2 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${avgMemory}%` }}
                            className="h-full bg-purple-600 dark:bg-purple-400"
                          />
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-6 border border-pink-200 dark:border-pink-800">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-pink-900 dark:text-pink-100">Disk Usage</h3>
                          <HardDrive className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">{avgDisk}%</div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-pink-600" />
                          <span className="text-pink-700 dark:text-pink-300">+1% from yesterday</span>
                        </div>
                        <div className="mt-4 h-2 bg-pink-200 dark:bg-pink-900 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${avgDisk}%` }}
                            className="h-full bg-pink-600 dark:bg-pink-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Top Consumers */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Top Resource Consumers
                      </h3>
                      <div className="space-y-3">
                        {agents
                          .sort((a, b) => (b.cpu + b.memory + b.disk) - (a.cpu + a.memory + a.disk))
                          .slice(0, 5)
                          .map((agent) => (
                            <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{agent.hostname}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{agent.os}</div>
                                </div>
                              </div>
                              <div className="flex gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                                  <span className={`ml-1 font-semibold ${getMetricColor(agent.cpu, { warning: 70, critical: 85 })}`}>
                                    {agent.cpu}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">MEM:</span>
                                  <span className={`ml-1 font-semibold ${getMetricColor(agent.memory, { warning: 80, critical: 90 })}`}>
                                    {agent.memory}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">DISK:</span>
                                  <span className={`ml-1 font-semibold ${getMetricColor(agent.disk, { warning: 80, critical: 90 })}`}>
                                    {agent.disk}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === 'agents' && (
                  <motion.div
                    key="agents"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {filteredAgents.map((agent, idx) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${
                              agent.status === 'online' ? 'bg-green-100 dark:bg-green-900/20' :
                              agent.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                              'bg-red-100 dark:bg-red-900/20'
                            }`}>
                              <Server className={`w-6 h-6 ${
                                agent.status === 'online' ? 'text-green-600 dark:text-green-400' :
                                agent.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{agent.hostname}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>{agent.ip}</span>
                                <span className="text-gray-400">•</span>
                                <span>{agent.os}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                              {agent.status}
                            </span>
                            {agent.alerts > 0 && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                {agent.alerts}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">CPU</div>
                            <div className={`font-semibold ${getMetricColor(agent.cpu, { warning: 70, critical: 85 })}`}>
                              {agent.cpu}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Memory</div>
                            <div className={`font-semibold ${getMetricColor(agent.memory, { warning: 80, critical: 90 })}`}>
                              {agent.memory}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Disk</div>
                            <div className={`font-semibold ${getMetricColor(agent.disk, { warning: 80, critical: 90 })}`}>
                              {agent.disk}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Network In</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{agent.networkIn} MB/s</div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Network Out</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{agent.networkOut} MB/s</div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Uptime</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{agent.uptime}</div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Last seen: {agent.lastSeen}</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            Version {agent.version}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeView === 'metrics' && (
                  <motion.div
                    key="metrics"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Performance Metrics</h3>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                        Detailed time-series metrics and historical performance data for the selected time range: <strong>{timeRange}</strong>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average Response Time</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">45ms</div>
                          <div className="mt-2 text-xs text-green-600 dark:text-green-400">↓ 12% improvement</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Data Collection Rate</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">99.8%</div>
                          <div className="mt-2 text-xs text-green-600 dark:text-green-400">↑ 0.2% from target</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === 'alerts' && (
                  <motion.div
                    key="alerts"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {alerts.map((alert, idx) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        className={`border rounded-lg p-6 ${
                          alert.acknowledged
                            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            : 'bg-white dark:bg-gray-800 border-l-4 border-l-red-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <AlertTriangle className={`w-5 h-5 ${
                                alert.severity === 'critical' ? 'text-red-600' :
                                alert.severity === 'warning' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{alert.message}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <Server className="w-4 h-4" />
                              <span className="font-medium">{alert.hostname}</span>
                              <span className="text-gray-400">•</span>
                              <Calendar className="w-4 h-4" />
                              <span>{alert.timestamp}</span>
                            </div>
                            {!alert.acknowledged && (
                              <div className="flex gap-2">
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                                  Acknowledge
                                </button>
                                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                                  View Details
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedAgent.hostname}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedAgent.ip} • {selectedAgent.os}</p>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Status</h3>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(selectedAgent.status)}`}>
                      {selectedAgent.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Uptime</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedAgent.uptime}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Resource Usage</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">CPU</span>
                        <span className={`font-semibold ${getMetricColor(selectedAgent.cpu, { warning: 70, critical: 85 })}`}>
                          {selectedAgent.cpu}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            selectedAgent.cpu >= 85 ? 'bg-red-600' :
                            selectedAgent.cpu >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${selectedAgent.cpu}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Memory</span>
                        <span className={`font-semibold ${getMetricColor(selectedAgent.memory, { warning: 80, critical: 90 })}`}>
                          {selectedAgent.memory}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            selectedAgent.memory >= 90 ? 'bg-red-600' :
                            selectedAgent.memory >= 80 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${selectedAgent.memory}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Disk</span>
                        <span className={`font-semibold ${getMetricColor(selectedAgent.disk, { warning: 80, critical: 90 })}`}>
                          {selectedAgent.disk}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            selectedAgent.disk >= 90 ? 'bg-red-600' :
                            selectedAgent.disk >= 80 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${selectedAgent.disk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
