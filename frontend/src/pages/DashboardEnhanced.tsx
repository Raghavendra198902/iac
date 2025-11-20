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

  // Mock data for charts
  const deploymentData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 22 },
    { name: 'Sat', value: 18 },
    { name: 'Sun', value: 20 },
  ];

  const costData = [
    { name: 'Week 1', value: 3200 },
    { name: 'Week 2', value: 2800 },
    { name: 'Week 3', value: 3500 },
    { name: 'Week 4', value: 3100 },
  ];

  const resourceData = [
    { name: 'Jan', compute: 45, storage: 30, network: 15 },
    { name: 'Feb', compute: 52, storage: 35, network: 18 },
    { name: 'Mar', compute: 48, storage: 38, network: 20 },
    { name: 'Apr', compute: 61, storage: 42, network: 22 },
    { name: 'May', compute: 55, storage: 45, network: 25 },
    { name: 'Jun', compute: 67, storage: 48, network: 28 },
  ];

  const recentBlueprints = [
    { id: '1', name: 'Production Web App', cloud: 'Azure', status: 'Active', updatedAt: '2 hours ago' },
    { id: '2', name: 'Microservices Stack', cloud: 'AWS', status: 'Active', updatedAt: '5 hours ago' },
    { id: '3', name: 'Data Analytics Pipeline', cloud: 'GCP', status: 'Draft', updatedAt: '1 day ago' },
  ];

  const recentDeployments = [
    { id: '1', blueprint: 'Production Web App', status: 'completed', time: '1 hour ago' },
    { id: '2', blueprint: 'Dev Environment', status: 'in_progress', time: '30 mins ago' },
    { id: '3', blueprint: 'Staging Database', status: 'completed', time: '3 hours ago' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome to IAC DHARMA Platform</p>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/designer"
            className="card hover:shadow-lg transition-shadow cursor-pointer group bg-white dark:bg-gray-800 border dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Blueprint Designer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Generate infrastructure from natural language</p>
              </div>
            </div>
          </Link>

          <Link
            to="/blueprints"
            className="card hover:shadow-lg transition-shadow cursor-pointer group bg-white dark:bg-gray-800 border dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Browse Blueprints</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">View and manage your infrastructure designs</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            
            return (
              <Link
                key={stat.name}
                to={stat.href}
                className="card hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-8 w-8 text-gray-400 dark:text-gray-400" />
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <TrendIcon className="h-4 w-4" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </Link>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Deployment Activity (Last 7 Days)"
            data={deploymentData}
            type="area"
            color="#3b82f6"
          />
          
          <ChartCard
            title="Weekly Cost Trend"
            data={costData}
            type="bar"
            color="#10b981"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <MultiLineChart
            title="Resource Usage Over Time"
            data={resourceData}
            lines={[
              { dataKey: 'compute', color: '#3b82f6', name: 'Compute' },
              { dataKey: 'storage', color: '#10b981', name: 'Storage' },
              { dataKey: 'network', color: '#f59e0b', name: 'Network' },
            ]}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Blueprints */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Blueprints</h2>
              <Link to="/blueprints" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentBlueprints.map((blueprint) => (
                <Link
                  key={blueprint.id}
                  to={`/blueprints/${blueprint.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{blueprint.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{blueprint.cloud} • {blueprint.updatedAt}</p>
                  </div>
                  <span className={`badge ${
                    blueprint.status === 'Active' ? 'badge-success' : 'badge-gray'
                  }`}>
                    {blueprint.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Deployments */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Deployments</h2>
              <Link to="/deployments" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentDeployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{deployment.blueprint}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{deployment.time}</p>
                  </div>
                  <span className={`badge ${
                    deployment.status === 'completed' ? 'badge-success' :
                    deployment.status === 'in_progress' ? 'badge-primary' :
                    'badge-danger'
                  }`}>
                    {deployment.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
