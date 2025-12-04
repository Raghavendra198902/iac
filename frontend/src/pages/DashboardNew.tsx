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
  LineChart
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
      {/* Header with Real-time Controls */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time monitoring and analytics for all your infrastructure projects</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-blue-600' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/50">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Rocket className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{metrics.activeProjects}</div>
            <div className="text-blue-100">Active Projects</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+0.8%</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{metrics.successRate}%</div>
            <div className="text-green-100">Success Rate</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+284</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{metrics.totalDeployments}</div>
            <div className="text-purple-100">Total Deployments</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>-0.4m</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{metrics.avgDeployTime}m</div>
            <div className="text-orange-100">Avg Deploy Time</div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Projects List - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Projects</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.health)}`}>
                          {project.health}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.team} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Rocket className="w-4 h-4" />
                          <span>{project.deployments} deployments</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{project.lastDeploy}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {activity.type === 'deployment' ? 'Deployment' : activity.type === 'alert' ? 'Alert' : 'Commit'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {activity.type === 'alert' ? activity.message : `${activity.user} • ${activity.project}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  New Deployment
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deployment Trends</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">142</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+18% from last week</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Score</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Overall</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">98.2%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Excellent security posture</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Usage</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Capacity</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">72%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Circle className="w-4 h-4" />
              <span>Optimal utilization</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
