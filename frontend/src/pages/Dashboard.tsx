import { FileText, AlertTriangle, DollarSign, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import FadeIn, { StaggerChildren, FadeInStagger } from '../components/ui/FadeIn';

export default function Dashboard() {
  const stats = [
    {
      name: 'Active Blueprints',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      href: '/blueprints',
    },
    {
      name: 'Deployments',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: Activity,
      href: '/deployments',
    },
    {
      name: 'Risk Score',
      value: '32',
      change: '-5%',
      changeType: 'positive',
      icon: AlertTriangle,
      href: '/risk',
    },
    {
      name: 'Monthly Cost',
      value: '$12.4K',
      change: '-15%',
      changeType: 'positive',
      icon: DollarSign,
      href: '/cost',
    },
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
          className="card bg-white dark:bg-gray-800 border dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Blueprint Designer</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate infrastructure from natural language</p>
            </div>
          </div>
        </Link>

        <Link
          to="/blueprints"
          className="card bg-white dark:bg-gray-800 border dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Browse Blueprints</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your infrastructure designs</p>
            </div>
          </div>
        </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="card bg-white dark:bg-gray-800 border dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <Icon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
            </Link>
          );
        })}
        </div>

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
                  <p className="font-medium text-gray-900 dark:text-gray-100">{blueprint.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{blueprint.cloud} • {blueprint.updatedAt}</p>
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
                  <p className="font-medium text-gray-900 dark:text-gray-100">{deployment.blueprint}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{deployment.time}</p>
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
