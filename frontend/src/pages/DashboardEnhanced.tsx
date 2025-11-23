import { useState, useEffect } from 'react';
import { 
  FileText, AlertTriangle, DollarSign, Activity, Sparkles, TrendingUp, TrendingDown, 
  Cloud, Zap, Shield, Brain, Server, Database, Cpu, HardDrive, Network, 
  CheckCircle2, AlertCircle, Clock, ArrowUpRight, ArrowDownRight, BarChart3,
  Layers, Globe, Lock, Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import FadeIn from '../components/ui/FadeIn';
import { useRoleAccess } from '../contexts/AuthContext';
import EADashboard from './dashboards/EADashboard';
import SADashboard from './dashboards/SADashboard';
import TADashboard from './dashboards/TADashboard';
import PMDashboard from './dashboards/PMDashboard';
import SEDashboard from './dashboards/SEDashboard';

export default function EnhancedDashboard() {
  const { isEA, isSA, isTA, isPM, isSE } = useRoleAccess();

  // Route to role-specific dashboard
  if (isEA) return <EADashboard />;
  if (isSA) return <SADashboard />;
  if (isTA) return <TADashboard />;
  if (isPM) return <PMDashboard />;
  if (isSE) return <SEDashboard />;

  // Real-time metrics state
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    infrastructure: {
      totalResources: 1847,
      activeServices: 18,
      healthyServices: 17,
      cpu: 45,
      memory: 68,
      storage: 52,
      network: 'healthy',
    },
    deployments: {
      total: 156,
      today: 12,
      success: 148,
      failed: 3,
      inProgress: 5,
      avgTime: 8.4,
    },
    cost: {
      monthly: 12400,
      daily: 415,
      trend: -15,
      forecast: 11890,
      savings: 3200,
      efficiency: 87,
    },
    security: {
      score: 94,
      alerts: 2,
      critical: 0,
      high: 2,
      medium: 8,
      compliant: 98,
    },
    blueprints: {
      total: 47,
      active: 24,
      draft: 8,
      archived: 15,
      aiGenerated: 18,
    },
    performance: {
      uptime: 99.97,
      responseTime: 142,
      throughput: 2847,
      errorRate: 0.03,
    },
  });

  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        infrastructure: {
          ...prev.infrastructure,
          cpu: Math.max(20, Math.min(95, prev.infrastructure.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(30, Math.min(90, prev.infrastructure.memory + (Math.random() - 0.5) * 8)),
        },
        performance: {
          ...prev.performance,
          responseTime: Math.max(50, Math.min(500, prev.performance.responseTime + (Math.random() - 0.5) * 30)),
          throughput: Math.max(2000, Math.min(5000, prev.performance.throughput + (Math.random() - 0.5) * 200)),
        },
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load real metrics from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsRes, activityRes, healthRes] = await Promise.all([
          fetch('/api/metrics/realtime'),
          fetch('/api/activity/recent?limit=10'),
          fetch('/api/health/services')
        ]);
        
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setRealTimeMetrics(prev => ({ ...prev, ...data }));
        }
        if (activityRes.ok) setLiveActivity(await activityRes.json());
        if (healthRes.ok) setSystemHealth(await healthRes.json());
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Use simulated data on error
        setLiveActivity([
          { id: 1, type: 'deployment', message: 'Production deployment completed', time: '2 min ago', status: 'success' },
          { id: 2, type: 'security', message: 'Security scan passed', time: '5 min ago', status: 'success' },
          { id: 3, type: 'cost', message: 'Cost optimization applied', time: '12 min ago', status: 'info' },
          { id: 4, type: 'blueprint', message: 'New blueprint created', time: '18 min ago', status: 'info' },
        ]);
        setSystemHealth([
          { name: 'API Gateway', status: 'healthy', uptime: 99.98, responseTime: 45 },
          { name: 'Database', status: 'healthy', uptime: 99.99, responseTime: 12 },
          { name: 'Auth Service', status: 'warning', uptime: 99.87, responseTime: 89 },
          { name: 'Analytics', status: 'healthy', uptime: 99.95, responseTime: 156 },
        ]);
      }
    };
    loadData();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Modern Hero Header */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">Infrastructure Command Center</h1>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full text-white text-sm font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
                <p className="text-white/90 text-lg">Real-time monitoring and control across {realTimeMetrics.infrastructure.totalResources.toLocaleString()} resources</p>
              </div>
              <Link
                to="/designer"
                className="flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Sparkles className="h-5 w-5" />
                AI Designer
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Real-Time Infrastructure Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FadeIn delay={0.1}>
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <Server className="h-8 w-8 opacity-80" />
                <span className="text-xs bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-sm opacity-90 mb-1">Active Services</p>
              <p className="text-4xl font-bold">{realTimeMetrics.infrastructure.activeServices}</p>
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle2 className="h-4 w-4 text-green-300" />
                <span className="text-sm">{realTimeMetrics.infrastructure.healthyServices} Healthy</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <Rocket className="h-8 w-8 opacity-80" />
                <ArrowUpRight className="h-5 w-5 text-green-200" />
              </div>
              <p className="text-sm opacity-90 mb-1">Deployments</p>
              <p className="text-4xl font-bold">{realTimeMetrics.deployments.total}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm">+{realTimeMetrics.deployments.today} Today</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">↑ {((realTimeMetrics.deployments.success / realTimeMetrics.deployments.total) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <Shield className="h-8 w-8 opacity-80" />
                <Lock className="h-5 w-5 text-purple-200" />
              </div>
              <p className="text-sm opacity-90 mb-1">Security Score</p>
              <p className="text-4xl font-bold">{realTimeMetrics.security.score}/100</p>
              <div className="flex items-center gap-2 mt-3">
                <AlertCircle className="h-4 w-4 text-yellow-300" />
                <span className="text-sm">{realTimeMetrics.security.alerts} Active Alerts</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 opacity-80" />
                <ArrowDownRight className="h-5 w-5 text-orange-200" />
              </div>
              <p className="text-sm opacity-90 mb-1">Monthly Cost</p>
              <p className="text-4xl font-bold">${(realTimeMetrics.cost.monthly / 1000).toFixed(1)}K</p>
              <div className="flex items-center gap-2 mt-3">
                <TrendingDown className="h-4 w-4 text-green-300" />
                <span className="text-sm">{Math.abs(realTimeMetrics.cost.trend)}% vs last month</span>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* System Health & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Health Monitor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Real-time service status</p>
                </div>
              </div>
              <Link to="/advanced" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Advanced View
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {systemHealth.length > 0 ? systemHealth.map((service) => (
                <div key={service.name} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500 animate-pulse' :
                        service.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="font-semibold text-gray-900 dark:text-white">{service.name}</span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{service.responseTime}ms</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uptime: {service.uptime}%</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${service.status === 'healthy' ? 'bg-green-500' : service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${service.uptime}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">Loading system health data...</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="h-6 w-6 text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white">CPU Usage</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{Math.round(realTimeMetrics.infrastructure.cpu)}%</div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300" style={{ width: `${realTimeMetrics.infrastructure.cpu}%` }}></div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="h-6 w-6 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Memory</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{Math.round(realTimeMetrics.infrastructure.memory)}%</div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300" style={{ width: `${realTimeMetrics.infrastructure.memory}%` }}></div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Response Time</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{Math.round(realTimeMetrics.performance.responseTime)}ms</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg: {realTimeMetrics.performance.responseTime.toFixed(1)}ms</div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Activity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent system events</p>
              </div>
            </div>
            <div className="space-y-3">
              {liveActivity.length > 0 ? liveActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">No recent activity</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Frequently used operations</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/designer" className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-lg transition-shadow border border-blue-200 dark:border-blue-800">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Designer</p>
              </Link>
              <Link to="/blueprints" className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-lg transition-shadow border border-green-200 dark:border-green-800">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Blueprints</p>
              </Link>
              <Link to="/deployments" className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-lg transition-shadow border border-purple-200 dark:border-purple-800">
                <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Deploy</p>
              </Link>
              <Link to="/monitoring" className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:shadow-lg transition-shadow border border-orange-200 dark:border-orange-800">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Analytics</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Enterprise Vision */}
        <FadeIn delay={0.6}>
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Enterprise Vision & Strategy</h2>
                    <p className="text-white/90">Transforming infrastructure management with AI-powered automation</p>
                  </div>
                </div>
                <Link
                  to="/roadmap"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white font-semibold rounded-xl transition-all"
                >
                  View Roadmap
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">AI-First Approach</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Leveraging machine learning for predictive scaling, cost optimization, and intelligent resource allocation
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-white font-semibold text-sm">78%</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Multi-Cloud Excellence</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Unified management across AWS, Azure, GCP with seamless workload migration and hybrid cloud support
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-white font-semibold text-sm">92%</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Security & Compliance</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Enterprise-grade security with automated compliance checks, audit trails, and zero-trust architecture
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-white font-semibold text-sm">94%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Rocket className="h-4 w-4" />
                      2025 Q1 Goals
                    </h4>
                    <span className="text-xs px-2 py-1 bg-green-500/30 text-green-100 rounded-full">On Track</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-300" />
                      Launch AI Blueprint Generator
                    </li>
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-300" />
                      Multi-region disaster recovery
                    </li>
                    <li className="flex items-center gap-2 text-white/80 text-sm">
                      <Clock className="h-4 w-4 text-yellow-300" />
                      Advanced cost analytics dashboard
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Key Metrics
                    </h4>
                    <span className="text-xs px-2 py-1 bg-blue-500/30 text-blue-100 rounded-full">Growing</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-2xl font-bold text-white">99.99%</p>
                      <p className="text-xs text-white/70">Uptime SLA</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">45%</p>
                      <p className="text-xs text-white/70">Cost Reduction</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">3.2x</p>
                      <p className="text-xs text-white/70">Faster Deploy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Advanced Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 opacity-80" />
              <span className="text-xs bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full">AI</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Cost Optimization</p>
            <p className="text-3xl font-bold mb-2">${realTimeMetrics.cost.savings.toLocaleString()}</p>
            <p className="text-sm opacity-80">Saved this month with AI recommendations</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 opacity-80" />
              <span className="text-xs bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full">Auto</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Automation Efficiency</p>
            <p className="text-3xl font-bold mb-2">{realTimeMetrics.cost.efficiency}%</p>
            <p className="text-sm opacity-80">of tasks fully automated</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Globe className="h-8 w-8 opacity-80" />
              <span className="text-xs bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full">Multi</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Cloud Coverage</p>
            <p className="text-3xl font-bold mb-2">{realTimeMetrics.infrastructure.totalResources.toLocaleString()}</p>
            <p className="text-sm opacity-80">resources across AWS, Azure, GCP</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

