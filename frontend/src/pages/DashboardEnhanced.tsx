import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, DollarSign, Activity, Sparkles, TrendingUp, TrendingDown, Cloud, Zap, Shield, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import FadeIn from '../components/ui/FadeIn';
import ChartCard, { MultiLineChart } from '../components/ui/ChartCard';
import { useRoleAccess } from '../contexts/AuthContext';
import AIRecommendationsPanel from '../components/AIRecommendationsPanel';
import { CloudProviderSelector } from '../components/CloudProviderSelector';
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

  // Fallback: Generic dashboard for Consultant/Admin or users without specific roles
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeBlueprints: 24,
    deployments: 156,
    riskScore: 32,
    monthlyCost: 12400,
    cloudProviders: 3,
    aiSavings: 262,
    securityAlerts: 2,
    automationRate: 87,
    multiCloudResources: {
      aws: 52,
      azure: 38,
      gcp: 24,
    },
  });

  const stats = [
    {
      name: 'Active Blueprints',
      value: realTimeMetrics.activeBlueprints.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: FileText,
      href: '/blueprints',
    },
    {
      name: 'Multi-Cloud Resources',
      value: realTimeMetrics.deployments.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Cloud,
      href: '/deployments',
    },
    {
      name: 'AI-Powered Savings',
      value: `$${realTimeMetrics.aiSavings}`,
      change: 'Monthly',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Brain,
      href: '/analytics',
    },
    {
      name: 'Security Score',
      value: `${100 - realTimeMetrics.riskScore}/100`,
      change: '+5%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Shield,
      href: '/security',
    },
    {
      name: 'Monthly Cost',
      value: `$${(realTimeMetrics.monthlyCost / 1000).toFixed(1)}K`,
      change: '-15%',
      changeType: 'positive' as const,
      trend: 'down' as const,
      icon: DollarSign,
      href: '/cost',
    },
    {
      name: 'Automation Rate',
      value: `${realTimeMetrics.automationRate}%`,
      change: '+7%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Zap,
      href: '/automation',
    },
  ];

  // Load real metrics from APIs - no demo data
  const [deploymentData, setDeploymentData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [recentBlueprints, setRecentBlueprints] = useState<any[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deploymentRes, costRes, resourceRes, blueprintsRes, deploymentsRes] = await Promise.all([
          fetch('/api/metrics/deployments'),
          fetch('/api/metrics/costs'),
          fetch('/api/metrics/resources'),
          fetch('/api/blueprints?limit=3'),
          fetch('/api/deployments?limit=3')
        ]);
        if (deploymentRes.ok) setDeploymentData(await deploymentRes.json());
        if (costRes.ok) setCostData(await costRes.json());
        if (resourceRes.ok) setResourceData(await resourceRes.json());
        if (blueprintsRes.ok) setRecentBlueprints(await blueprintsRes.json());
        if (deploymentsRes.ok) setRecentDeployments(await deploymentsRes.json());
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Hero Header with Gradient */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Welcome Back! 👋</h1>
                  <p className="text-white/80">Here's what's happening with your infrastructure today</p>
                </div>
                <Link
                  to="/designer"
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="h-5 w-5" />
                  Create Blueprint
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Grid with Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <FadeIn key={stat.name} delay={index * 0.1}>
                <Link
                  to={stat.href}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                        index === 0 ? 'from-blue-500 to-blue-600' :
                        index === 1 ? 'from-green-500 to-green-600' :
                        index === 2 ? 'from-orange-500 to-orange-600' :
                        'from-purple-500 to-purple-600'
                      } shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          stat.changeType === 'positive' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          <TrendIcon className="h-3 w-3" />
                          {stat.change}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>

        {/* Quick Actions with Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/designer"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">AI Designer</h3>
                  <p className="text-sm text-white/80">Generate blueprints</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/blueprints"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Blueprints</h3>
                  <p className="text-sm text-white/80">View designs</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/monitoring"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Monitoring</h3>
                  <p className="text-sm text-white/80">System health</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Charts with Modern Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deployment Activity</h3>
            {deploymentData.length > 0 ? (
              <ChartCard
                title=""
                data={deploymentData}
                type="area"
                color="#3b82f6"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No deployment data available</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Trends</h3>
            {costData.length > 0 ? (
              <ChartCard
                title=""
                data={costData}
                type="bar"
                color="#10b981"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No cost data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {resourceData.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Usage Over Time</h3>
            <MultiLineChart
              title=""
              data={resourceData}
              lines={[
                { dataKey: 'compute', color: '#3b82f6', name: 'Compute' },
                { dataKey: 'storage', color: '#10b981', name: 'Storage' },
                { dataKey: 'network', color: '#f59e0b', name: 'Network' },
              ]}
            />
          </div>
        )}

        {/* Enterprise Features Section */}
        <div className="space-y-6">
          {/* AI-Powered Recommendations */}
          <FadeIn delay={0.6}>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI-Powered Recommendations</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Machine learning insights for cost optimization</p>
                </div>
              </div>
              <AIRecommendationsPanel />
            </div>
          </FadeIn>

          {/* Multi-Cloud Status */}
          <FadeIn delay={0.7}>
            <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Multi-Cloud Status</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resources across AWS, Azure, and GCP</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">AWS</span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">{realTimeMetrics.multiCloudResources.aws}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">Resources</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Azure</span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{realTimeMetrics.multiCloudResources.azure}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Resources</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-900 dark:text-red-300">GCP</span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">{realTimeMetrics.multiCloudResources.gcp}</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">Resources</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link to="/analytics" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View detailed multi-cloud analytics</span>
                  <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Recent Activity with Modern Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Blueprints */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Blueprints</h2>
              </div>
              <Link 
                to="/blueprints" 
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group"
              >
                View all
                <TrendingUp className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentBlueprints.length > 0 ? (
                recentBlueprints.map((blueprint, index) => (
                  <Link
                    key={blueprint.id}
                    to={`/blueprints/${blueprint.id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent dark:hover:from-primary-900/20 dark:hover:to-transparent transition-all duration-200 border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{blueprint.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{blueprint.cloud} • {blueprint.updatedAt}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      blueprint.status === 'Active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {blueprint.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No blueprints yet</p>
                  <Link to="/designer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
                    Create your first blueprint
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Deployments */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Deployments</h2>
              </div>
              <Link 
                to="/deployments" 
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group"
              >
                View all
                <TrendingUp className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentDeployments.length > 0 ? (
                recentDeployments.map((deployment, index) => (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent dark:hover:from-green-900/20 dark:hover:to-transparent transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{deployment.blueprint}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{deployment.time}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      deployment.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      deployment.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {deployment.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No deployments yet</p>
                  <Link to="/deployments" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
                    View deployment history
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
