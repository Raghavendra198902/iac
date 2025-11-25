import { MainLayout } from '../components/layout';
import { useTheme } from '../contexts/ThemeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Users
} from 'lucide-react';

export default function DemoPage() {
  const { theme } = useTheme();
  const demoUser = {
    name: 'John Enterprise',
    email: 'john.enterprise@iacdharma.com',
    role: 'EA',
    tenantName: 'IAC Dharma Enterprise',
  };

  const stats = [
    {
      label: 'Total Blueprints',
      value: '248',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Deployments',
      value: '156',
      change: '+8.2%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Monthly Cost',
      value: '$45.2K',
      change: '-5.3%',
      trend: 'down' as const,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Compliance Score',
      value: '94%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: Shield,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const alerts = [
    {
      type: 'warning' as const,
      title: 'Policy Violation Detected',
      message: 'Blueprint "prod-db-cluster" has 2 guardrail violations that need attention',
      time: '5 minutes ago',
    },
    {
      type: 'success' as const,
      title: 'Deployment Completed',
      message: 'Infrastructure deployment "web-app-v2" completed successfully',
      time: '15 minutes ago',
    },
    {
      type: 'error' as const,
      title: 'Cost Alert',
      message: 'AWS account exceeded 85% of monthly budget threshold',
      time: '1 hour ago',
    },
  ];

  return (
    <MainLayout user={demoUser}>
      {/* Theme Test Banner */}
      <div className="mb-6 p-4 bg-blue-600 text-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-2">Current Theme: {theme}</h3>
        <p className="text-sm opacity-90">This banner should change color based on the selected theme</p>
        <div className="mt-3 flex gap-2">
          <div className="px-3 py-1 bg-blue-700 rounded">Primary Color</div>
          <div className="px-3 py-1 border-2 border-blue-500 rounded">Border Color</div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {demoUser.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your infrastructure today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Alerts & Activity
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500'
                    : alert.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-500'
                    : 'bg-red-50 dark:bg-red-900/10 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  ) : alert.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {alert.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
              Create New Blueprint
            </button>
            <button className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Generate IaC Code
            </button>
            <button className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Run Compliance Check
            </button>
            <button className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              View Cost Analysis
            </button>
          </div>

          {/* Team Activity */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  SA
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    Sarah Chen
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created new blueprint
                  </p>
                </div>
                <span className="text-xs text-gray-400">2h ago</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  TA
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    Mike Torres
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Deployed to production
                  </p>
                </div>
                <span className="text-xs text-gray-400">4h ago</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  PM
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    Lisa Wang
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Updated project status
                  </p>
                </div>
                <span className="text-xs text-gray-400">6h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            🎉 Advanced Enterprise-Level UI Components
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your new header and sidebar feature modern design, dark mode support, 
            notifications, search functionality, and role-based navigation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✓ Real-time Notifications
              </span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✓ Global Search
              </span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✓ Dark Mode Toggle
              </span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✓ Role-Based Menu
              </span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✓ Responsive Design
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
