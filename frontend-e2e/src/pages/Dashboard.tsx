import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ServerIcon,
  CpuChipIcon,
  CloudIcon,
  BoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [animatedMetrics, setAnimatedMetrics] = useState({
    resources: 0,
    cpu: 0,
    alerts: 0,
    cost: 0,
  });

  useEffect(() => {
    // Animate counters
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      resources: 2547,
      cpu: 67,
      alerts: 8,
      cost: 12.4,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedMetrics({
        resources: Math.floor(targets.resources * progress),
        cpu: Math.floor(targets.cpu * progress),
        alerts: Math.floor(targets.alerts * progress),
        cost: parseFloat((targets.cost * progress).toFixed(1)),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const metrics = [
    {
      title: 'Total Resources',
      value: '2,547',
      change: '+12.5%',
      trend: 'up',
      icon: ServerIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'CPU Usage',
      value: '67%',
      change: '-3.2%',
      trend: 'down',
      icon: CpuChipIcon,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Active Alerts',
      value: '8',
      change: '+4',
      trend: 'up',
      icon: BoltIcon,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Monthly Cost',
      value: '$12.4K',
      change: '-8.1%',
      trend: 'down',
      icon: CurrencyDollarIcon,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const lineChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'CPU Usage',
        data: [65, 59, 80, 81, 76, 55, 67],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Memory Usage',
        data: [45, 49, 60, 71, 56, 45, 48],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['AWS', 'Azure', 'GCP', 'On-Prem', 'Kubernetes'],
    datasets: [
      {
        label: 'Resources',
        data: [1250, 840, 567, 390, 500],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
      },
    ],
  };

  const doughnutData = {
    labels: ['Compute', 'Storage', 'Network', 'Database', 'Security'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  const recentActivities = [
    { action: 'EC2 instance deployed', resource: 'prod-web-server-01', time: '5 min ago', status: 'success' },
    { action: 'Security scan completed', resource: 'all-resources', time: '15 min ago', status: 'warning' },
    { action: 'Backup created', resource: 'database-cluster', time: '1 hour ago', status: 'success' },
    { action: 'Pipeline executed', resource: 'api-service', time: '2 hours ago', status: 'success' },
    { action: 'Alert triggered', resource: 'monitoring-agent', time: '3 hours ago', status: 'error' },
  ];

  return (
    <div className="space-y-8">
      {/* Particle Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Header with Animated Background */}
      <div className="relative overflow-hidden rounded-2xl glass-effect p-6 border border-white/20 dark:border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 animate-gradient-x"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Real-time overview of your infrastructure
          </p>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {['1h', '6h', '24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              timeRange === range
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'glass-effect hover:shadow-md'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden glass-card hover-lift rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <ServerIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                +12.5%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 gradient-text">{animatedMetrics.resources.toLocaleString()}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Resources</div>
          </div>
        </div>

        <div className="relative overflow-hidden glass-card hover-lift rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-red-600">
                <ArrowTrendingDownIcon className="w-4 h-4" />
                -3.2%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 gradient-text">{animatedMetrics.cpu}%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">CPU Usage</div>
          </div>
        </div>

        <div className="relative overflow-hidden glass-card hover-lift rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                <BoltIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                +4
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 gradient-text">{animatedMetrics.alerts}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Active Alerts</div>
          </div>
        </div>

        <div className="relative overflow-hidden glass-card hover-lift rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-red-600">
                <ArrowTrendingDownIcon className="w-4 h-4" />
                -8.1%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 gradient-text">${animatedMetrics.cost}K</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Monthly Cost</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - System Performance */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 gradient-text">System Performance</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart - Resources by Platform */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 gradient-text">Resources by Platform</h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart - Cost Distribution */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 gradient-text">Cost Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-64 h-64">
              <Doughnut data={doughnutData} options={{ ...chartOptions, scales: undefined }} />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 gradient-text">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{activity.action}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activity.resource}
                  </div>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <CloudIcon className="w-8 h-8 text-blue-500" />
            <h3 className="text-lg font-bold">Cloud Services</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">AWS</span>
              <span className="text-sm font-semibold text-green-600">● Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Azure</span>
              <span className="text-sm font-semibold text-green-600">● Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">GCP</span>
              <span className="text-sm font-semibold text-yellow-600">● Degraded</span>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-500" />
            <h3 className="text-lg font-bold">Security Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Vulnerabilities</span>
              <span className="text-sm font-semibold">3 Low</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Compliance</span>
              <span className="text-sm font-semibold text-green-600">98%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Scan</span>
              <span className="text-sm font-semibold">15 min ago</span>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <BoltIcon className="w-8 h-8 text-yellow-500" />
            <h3 className="text-lg font-bold">Deployments</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Today</span>
              <span className="text-sm font-semibold">134</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Success Rate</span>
              <span className="text-sm font-semibold text-green-600">97.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Duration</span>
              <span className="text-sm font-semibold">4.2 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
