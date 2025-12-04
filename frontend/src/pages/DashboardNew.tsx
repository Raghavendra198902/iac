import { MainLayout } from '../components/layout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Calendar,
  Target,
  Zap,
  GitBranch,
  Package,
  Server,
  Cloud,
  Database,
  Code,
  Terminal,
  FileText,
  Folder,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  Play,
  Pause,
  Square,
  Circle,
  XCircle,
  Rocket,
  Shield,
  Lock,
  Globe,
  BarChart3,
  PieChart,
  LineChart,
  Plus
} from 'lucide-react';

export default function DashboardNew() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const demoUser = {
    name: 'John Enterprise',
    email: 'john.enterprise@iacdharma.com',
    role: 'EA',
    tenantName: 'IAC Dharma Enterprise',
  };

  // Real-time metrics simulation
  const [metrics, setMetrics] = useState({
    activeProjects: 24,
    totalDeployments: 1247,
    successRate: 98.4,
    avgDeployTime: 3.2,
  });

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeProjects: prev.activeProjects + Math.floor(Math.random() * 3) - 1,
        totalDeployments: prev.totalDeployments + Math.floor(Math.random() * 5),
        successRate: +(prev.successRate + (Math.random() * 0.2 - 0.1)).toFixed(1),
        avgDeployTime: +(prev.avgDeployTime + (Math.random() * 0.4 - 0.2)).toFixed(1),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const projects = [
    {
      id: 1,
      name: 'Multi-Cloud Infrastructure',
      status: 'active',
      progress: 78,
      team: 8,
      deployments: 45,
      lastDeploy: '2 hours ago',
      health: 'excellent',
      tags: ['AWS', 'Azure', 'Production']
    },
    {
      id: 2,
      name: 'Kubernetes Migration',
      status: 'active',
      progress: 92,
      team: 12,
      deployments: 128,
      lastDeploy: '15 min ago',
      health: 'good',
      tags: ['K8s', 'Migration', 'Critical']
    },
    {
      id: 3,
      name: 'Security Compliance Upgrade',
      status: 'warning',
      progress: 45,
      team: 6,
      deployments: 23,
      lastDeploy: '1 day ago',
      health: 'warning',
      tags: ['Security', 'Compliance', 'SOC2']
    },
    {
      id: 4,
      name: 'CI/CD Pipeline Optimization',
      status: 'active',
      progress: 88,
      team: 5,
      deployments: 312,
      lastDeploy: '30 min ago',
      health: 'excellent',
      tags: ['DevOps', 'Automation', 'Performance']
    },
  ];

  const recentActivity = [
    { type: 'deployment', project: 'Multi-Cloud Infrastructure', user: 'Sarah Chen', time: '5 min ago', status: 'success' },
    { type: 'alert', project: 'Security Compliance', message: 'High CPU usage detected', time: '12 min ago', status: 'warning' },
    { type: 'deployment', project: 'Kubernetes Migration', user: 'Mike Ross', time: '15 min ago', status: 'success' },
    { type: 'commit', project: 'CI/CD Pipeline', user: 'Alex Kumar', message: 'Updated deployment scripts', time: '23 min ago', status: 'info' },
    { type: 'deployment', project: 'Multi-Cloud Infrastructure', user: 'Lisa Wang', time: '45 min ago', status: 'success' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deployment': return <Rocket className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'commit': return <GitBranch className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <MainLayout user={demoUser}>
      {/* Modern Gradient Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header with Real-time Controls */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Project Dashboard
            </h1>
            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg shadow-green-500/30">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Real-time monitoring and analytics for all your infrastructure projects</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-blue-600' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Auto-refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                autoRefresh ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white overflow-hidden hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-1"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Rocket className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            <div className="text-5xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">{metrics.activeProjects}</div>
            <div className="text-blue-100 font-medium">Active Projects</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl p-6 text-white overflow-hidden hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-500 hover:-translate-y-1"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+0.8%</span>
              </div>
            </div>
            <div className="text-5xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">{metrics.successRate}%</div>
            <div className="text-green-100 font-medium">Success Rate</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 rounded-2xl p-6 text-white overflow-hidden hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-1"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Activity className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+284</span>
              </div>
            </div>
            <div className="text-5xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">{metrics.totalDeployments}</div>
            <div className="text-purple-100 font-medium">Total Deployments</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 rounded-2xl p-6 text-white overflow-hidden hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-500 hover:-translate-y-1"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Zap className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>-0.4m</span>
              </div>
            </div>
            <div className="text-5xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">{metrics.avgDeployTime}m</div>
            <div className="text-orange-100 font-medium">Avg Deploy Time</div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Projects List - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Active Projects</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative group border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-5 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm hover:shadow-xl hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.health)} shadow-sm`}>
                            {project.health}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{project.team} members</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Rocket className="w-4 h-4" />
                            <span className="font-medium">{project.deployments} deployments</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{project.lastDeploy}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110">
                        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                        <span className="font-bold text-gray-900 dark:text-white">{project.progress}%</span>
                      </div>
                      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        <div 
                          className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-3 rounded-full transition-all duration-1000 shadow-md"
                          style={{ width: `${project.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-shadow">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sticky top-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Recent Activity</h2>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex gap-3 pb-4 border-b border-gray-200/50 dark:border-gray-700/50 last:border-0 group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 -mx-2 px-2 py-2 rounded-xl transition-all"
                >
                  <div className={`p-2.5 rounded-xl ${getActivityColor(activity.status)} group-hover:scale-110 transition-transform shadow-sm`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {activity.type === 'deployment' ? 'Deployment' : activity.type === 'alert' ? 'Alert' : 'Commit'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {activity.type === 'alert' ? activity.message : `${activity.user} • ${activity.project}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
                  <Play className="w-4 h-4" />
                  New Deployment
                </button>
                <button className="w-full px-4 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deployment Trends</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">142</span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-md" style={{ width: '85%' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+18% from last week</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-purple-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security Score</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">98.2%</span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-md" style={{ width: '98%' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Excellent security posture</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-green-500/30">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resource Usage</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacity</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">72%</span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-md" style={{ width: '72%' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <Circle className="w-4 h-4 fill-current" />
              <span>Optimal utilization</span>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
