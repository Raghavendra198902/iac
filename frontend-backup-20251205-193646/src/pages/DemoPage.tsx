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

export default function DemoPage() {
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

  return (
    <MainLayout user={demoUser}>
      {/* Header with Real-time Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time monitoring and analytics for all your infrastructure projects</p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Buttons Section */}
      <div className="mb-8 animate-slideUp">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          Buttons & Actions
          <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-normal">Interactive</span>
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Buttons */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover-lift transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Primary Buttons
            </h4>
            <div className="space-y-3 relative z-10">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95 relative overflow-hidden group/btn">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Primary Button</span>
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg active:scale-95 group/icon">
                <Plus className="w-4 h-4 group-hover/icon:rotate-90 transition-transform duration-300" />
                <span>With Icon</span>
              </button>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 active:scale-95 animate-gradient bg-[length:200%_auto]">
                Gradient Button
              </button>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover-lift">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
              Secondary & Outlined
            </h4>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                Secondary
              </button>
              <button className="w-full px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden group">
                <span className="absolute inset-0 bg-blue-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <span className="relative">Outlined</span>
              </button>
              <button className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-md">
                Text Button
              </button>
            </div>
          </div>

          {/* Icon Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover-lift">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Icon Buttons
            </h4>
            <div className="flex flex-wrap gap-2">
              <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12 hover:shadow-lg active:scale-95">
                <Bell className="w-5 h-5 animate-bounce-subtle" />
              </button>
              <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg active:scale-95 group">
                <Search className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg active:scale-95 group">
                <Settings className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button className="p-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg active:scale-95 group">
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
              </button>
              <button className="p-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg active:scale-95 group">
                <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
              </button>
              <button className="p-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg active:scale-95 group">
                <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cards & Stat Widgets</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/50">
                  <Activity className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 transform group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-4 h-4 animate-bounce-subtle" />
                  +12.5%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transform group-hover:scale-105 transition-transform duration-300">248</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Projects</div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/50">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 transform group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-4 h-4 animate-bounce-subtle" />
                  +8.2%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transform group-hover:scale-105 transition-transform duration-300">1,234</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                <TrendingDown className="w-4 h-4" />
                -5.3%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$45.2K</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</div>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <TrendingUp className="w-4 h-4" />
                +2.1%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">94%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Security Score</div>
          </div>
        </div>
      </div>

      {/* Forms & Inputs */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Forms & Inputs</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Inputs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Input Fields</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Option
                </label>
                <select className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-colors">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Checkboxes & Radios */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Checkboxes & Radios</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">Enable notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Auto-save changes</span>
                </label>
              </div>
              <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="plan" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">Basic Plan</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="plan" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Pro Plan</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="plan" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Enterprise</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Tags */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Badges & Tags</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">Primary</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">Light</span>
            <span className="px-3 py-1 border-2 border-blue-600 text-blue-600 rounded-full text-sm font-medium">Outlined</span>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">Success</span>
            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">Error</span>
            <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-medium">Warning</span>
            <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm font-medium">Neutral</span>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-medium">Gradient</span>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Alerts & Messages</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-900 dark:text-blue-300">Information</h5>
                <p className="text-sm text-blue-700 dark:text-blue-400">This is an informational message with theme colors.</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-green-900 dark:text-green-300">Success</h5>
                <p className="text-sm text-green-700 dark:text-green-400">Operation completed successfully!</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-red-900 dark:text-red-300">Error</h5>
                <p className="text-sm text-red-700 dark:text-red-400">Something went wrong. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List & Table Preview */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lists & Tables</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Project</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">Infrastructure Setup</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">Active</span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">Security Audit</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded text-xs font-medium">Pending</span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">Database Migration</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium">In Progress</span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress & Loading */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          Progress & Loading States
          <span className="text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full font-normal">Animated</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Animated Progress Bars
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">CPU Usage</span>
                  <span className="text-blue-600 font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Memory</span>
                  <span className="text-purple-600 font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer [animation-delay:0.5s]"></div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" style={{width: '45%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Storage</span>
                  <span className="text-green-600 font-medium">90%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer [animation-delay:1s]"></div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" style={{width: '90%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
              Loading Spinners
            </h4>
            <div className="space-y-6">
              {/* Ring Spinners */}
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 shadow-lg"></div>
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 shadow-lg"></div>
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-green-600 shadow-lg"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Ring Spinners</span>
              </div>
              
              {/* Dot Pulse */}
              <div className="flex items-center gap-4">
                <div className="flex space-x-1">
                  <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Bouncing Dots</span>
              </div>
              
              {/* Bar Pulse */}
              <div className="flex items-center gap-4">
                <div className="flex space-x-1">
                  <div className="w-1 h-8 bg-purple-600 rounded-full animate-pulse [animation-delay:-0.4s]"></div>
                  <div className="w-1 h-8 bg-purple-600 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-8 bg-purple-600 rounded-full animate-pulse [animation-delay:-0.2s]"></div>
                  <div className="w-1 h-8 bg-purple-600 rounded-full animate-pulse [animation-delay:-0.1s]"></div>
                  <div className="w-1 h-8 bg-purple-600 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Wave Bars</span>
              </div>
              
              {/* Ping Effect */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-4 w-4 rounded-full bg-green-600 animate-ping absolute"></div>
                  <div className="h-4 w-4 rounded-full bg-green-600 relative"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Ping Effect</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </MainLayout>
  );
}
