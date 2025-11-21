import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, DollarSign, Activity, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import FadeIn from '../components/ui/FadeIn';
import ChartCard, { MultiLineChart } from '../components/ui/ChartCard';
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

  // Fallback: Generic dashboard for Consultant/Admin or users without specific roles
  const stats = [
    {
      name: 'Active Blueprints',
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: FileText,
      href: '/blueprints',
    },
    {
      name: 'Deployments',
      value: '156',
      change: '+8%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Activity,
      href: '/deployments',
    },
    {
      name: 'Risk Score',
      value: '32',
      change: '-5%',
      changeType: 'positive' as const,
      trend: 'down' as const,
      icon: AlertTriangle,
      href: '/risk',
    },
    {
      name: 'Monthly Cost',
      value: '$12.4K',
      change: '-15%',
      changeType: 'positive' as const,
      trend: 'down' as const,
      icon: DollarSign,
      href: '/cost',
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
      <div className="space-y-8">
        {/* Hero Header with Gradient */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Welcome Back! 👋</h1>
                  <p className="text-white/80 text-lg">Here's what's happening with your infrastructure today</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <FadeIn key={stat.name} delay={index * 0.1}>
                <Link
                  to={stat.href}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${
                        index === 0 ? 'from-blue-500 to-blue-600' :
                        index === 1 ? 'from-green-500 to-green-600' :
                        index === 2 ? 'from-orange-500 to-orange-600' :
                        'from-purple-500 to-purple-600'
                      } shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        stat.changeType === 'positive' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <TrendIcon className="h-3 w-3" />
                        {stat.change}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
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
