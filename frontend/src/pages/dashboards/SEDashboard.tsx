import { useState, useEffect } from 'react';
import { Rocket, Activity, AlertTriangle, CheckCircle2, Clock, Server, Terminal, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/ui/PageTransition';
import FadeIn from '../../components/ui/FadeIn';
import ChartCard from '../../components/ui/ChartCard';

/**
 * System Engineer (SE) Dashboard
 * 
 * Responsibilities:
 * - Deployment execution
 * - Infrastructure monitoring
 * - Incident management
 * - Pre/post deployment checks
 * - Operations & maintenance
 */
export default function SEDashboard() {
  const operationalMetrics = [
    {
      name: 'Active Deployments',
      value: '6',
      change: '+2',
      changeType: 'neutral' as const,
      trend: 'up' as const,
      icon: Rocket,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'System Health',
      value: '98.2%',
      change: '+0.5%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Activity,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Open Incidents',
      value: '3',
      change: '-5',
      changeType: 'positive' as const,
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
    },
    {
      name: 'Success Rate',
      value: '97%',
      change: '+2%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const deploymentQueue = [
    {
      id: '1',
      name: 'E-Commerce Platform - Production',
      status: 'Ready to Deploy',
      environment: 'Production',
      cloud: 'AWS',
      region: 'us-east-1',
      approvedBy: 'Jane Smith (PM)',
      approvedAt: '1 hour ago',
      estimatedDuration: '45 mins',
      resources: 47,
      preChecks: { total: 12, passed: 12, failed: 0 },
    },
    {
      id: '2',
      name: 'Data Pipeline - Staging',
      status: 'In Progress',
      environment: 'Staging',
      cloud: 'Azure',
      region: 'eastus',
      approvedBy: 'John Doe (PM)',
      approvedAt: '30 mins ago',
      estimatedDuration: '30 mins',
      resources: 32,
      preChecks: { total: 10, passed: 10, failed: 0 },
      progress: 65,
    },
    {
      id: '3',
      name: 'IoT Backend - Development',
      status: 'Pre-check Failed',
      environment: 'Development',
      cloud: 'GCP',
      region: 'us-central1',
      approvedBy: 'Sarah Lee (PM)',
      approvedAt: '2 hours ago',
      estimatedDuration: '1 hour',
      resources: 28,
      preChecks: { total: 15, passed: 13, failed: 2 },
    },
  ];

  const activeIncidents = [
    {
      id: 'INC-2025-001',
      severity: 'High',
      title: 'API Gateway High Latency',
      service: 'E-Commerce Platform',
      environment: 'Production',
      status: 'Investigating',
      reportedAt: '15 mins ago',
      assignedTo: 'You',
      impact: 'Customer-facing APIs experiencing 2-3s response times',
    },
    {
      id: 'INC-2025-002',
      severity: 'Medium',
      title: 'Database Connection Pool Exhaustion',
      service: 'Data Analytics',
      environment: 'Staging',
      status: 'In Progress',
      reportedAt: '1 hour ago',
      assignedTo: 'Michael Chen',
      impact: 'Background jobs failing intermittently',
    },
    {
      id: 'INC-2025-003',
      severity: 'Low',
      title: 'CloudWatch Log Group Quota Warning',
      service: 'IoT Backend',
      environment: 'Development',
      status: 'Monitoring',
      reportedAt: '3 hours ago',
      assignedTo: 'You',
      impact: 'Approaching 90% of log retention quota',
    },
  ];

  const systemHealth = [
    {
      service: 'E-Commerce Platform',
      environment: 'Production',
      uptime: 99.9,
      cpu: 45,
      memory: 62,
      requests: 12500,
      errors: 8,
      responseTime: 245,
      lastCheck: '2 mins ago',
    },
    {
      service: 'Data Analytics Pipeline',
      environment: 'Production',
      uptime: 99.5,
      cpu: 78,
      memory: 84,
      requests: 4200,
      errors: 12,
      responseTime: 1850,
      lastCheck: '2 mins ago',
    },
    {
      service: 'IoT Backend',
      environment: 'Production',
      uptime: 98.8,
      cpu: 32,
      memory: 48,
      requests: 8900,
      errors: 45,
      responseTime: 180,
      lastCheck: '2 mins ago',
    },
  ];

  const recentDeployments = [
    {
      id: '1',
      name: 'E-Commerce Platform v2.4.1',
      environment: 'Production',
      status: 'Success',
      deployedAt: '2 hours ago',
      duration: '42 mins',
      deployedBy: 'You',
    },
    {
      id: '2',
      name: 'Data Pipeline v1.8.0',
      environment: 'Staging',
      status: 'Success',
      deployedAt: '5 hours ago',
      duration: '28 mins',
      deployedBy: 'Michael Chen',
    },
    {
      id: '3',
      name: 'API Gateway v3.2.0',
      environment: 'Development',
      status: 'Failed',
      deployedAt: '1 day ago',
      duration: '15 mins',
      deployedBy: 'You',
    },
  ];

  // Load real data from APIs - no demo data
  const [deploymentSuccessData, setDeploymentSuccessData] = useState<any[]>([]);
  const [systemUptimeData, setSystemUptimeData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deploymentRes, uptimeRes] = await Promise.all([
          fetch('/api/se/deployment-success'),
          fetch('/api/se/system-uptime')
        ]);
        if (deploymentRes.ok) setDeploymentSuccessData(await deploymentRes.json());
        if (uptimeRes.ok) setSystemUptimeData(await uptimeRes.json());
      } catch (error) {
        console.error('Failed to load SE dashboard data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Hero Section */}
        <FadeIn>
          <div className="rounded-3xl bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    System Engineer Dashboard
                    <Rocket className="w-8 h-8" />
                  </h1>
                  <p className="text-cyan-100 mt-2 text-lg">
                    Deployments, Monitoring & Incident Management
                  </p>
                </div>
                <Link
                  to="/deployments/new"
                  className="bg-white text-cyan-600 hover:bg-cyan-50 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 group shadow-lg"
                >
                  <Rocket className="w-5 h-5" />
                  New Deployment
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {operationalMetrics.map((metric, idx) => (
            <FadeIn key={metric.name} delay={idx * 100}>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="card p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{metric.name}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-1 mt-3">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        <span className={`text-sm font-semibold ${
                          metric.changeType === 'positive' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {metric.change}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                      <metric.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {operationalMetrics.map((metric, idx) => (
            <FadeIn key={metric.name} delay={idx * 100}>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {metric.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                      )}
                      <span className={`text-sm ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    metric.changeType === 'positive' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-orange-100 dark:bg-orange-900/20'
                  }`}>
                    <metric.icon className={`w-6 h-6 ${
                      metric.changeType === 'positive' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`} />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Deployment Success Rate"
            data={deploymentSuccessData}
            dataKey="value"
            color="#10b981"
          />
          <ChartCard
            title="System Uptime (%)"
            data={systemUptimeData}
            dataKey="value"
            color="#3b82f6"
          />
        </div>

        {/* Deployment Queue */}
        <FadeIn delay={200}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Deployment Queue
                </h2>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium">
                  {deploymentQueue.filter(d => d.status !== 'Pre-check Failed').length} Ready
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {deploymentQueue.map((deployment) => (
                <div key={deployment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {deployment.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          deployment.status === 'Ready to Deploy'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : deployment.status === 'In Progress'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        }`}>
                          {deployment.status}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded text-xs font-medium">
                          {deployment.environment}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="block text-xs text-gray-500">Cloud / Region</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {deployment.cloud} / {deployment.region}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Resources</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{deployment.resources}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Est. Duration</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{deployment.estimatedDuration}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Pre-checks</span>
                          <span className={`font-medium ${
                            deployment.preChecks.failed === 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {deployment.preChecks.passed}/{deployment.preChecks.total} passed
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Approved by {deployment.approvedBy} {deployment.approvedAt}
                      </div>
                      {deployment.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${deployment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {deployment.progress}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {deployment.status === 'Ready to Deploy' ? (
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                          <Rocket className="w-4 h-4" />
                          Deploy
                        </button>
                      ) : deployment.status === 'Pre-check Failed' ? (
                        <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Fix Issues
                        </button>
                      ) : (
                        <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                          View Logs
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Active Incidents */}
        <FadeIn delay={300}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Active Incidents
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full text-sm font-medium">
                    {activeIncidents.filter(i => i.severity === 'High').length} High
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                    {activeIncidents.filter(i => i.severity === 'Medium').length} Medium
                  </span>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          incident.severity === 'High'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : incident.severity === 'Medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                        }`}>
                          {incident.severity}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">{incident.id}</span>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {incident.title}
                        </h3>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-4">
                          <span><strong>Service:</strong> {incident.service}</span>
                          <span><strong>Environment:</strong> {incident.environment}</span>
                          <span><strong>Status:</strong> {incident.status}</span>
                        </div>
                        <div className="mt-1">
                          <strong>Impact:</strong> {incident.impact}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Assigned to: <span className="font-medium text-gray-900 dark:text-gray-100">{incident.assignedTo}</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4" />
                          Reported {incident.reportedAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* System Health & Recent Deployments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <FadeIn delay={400}>
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    System Health
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {systemHealth.map((system) => (
                    <div key={system.service} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{system.service}</h3>
                          <span className="text-xs text-gray-600 dark:text-gray-300">{system.environment}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">{system.uptime}% uptime</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="block text-xs text-gray-500">CPU</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  system.cpu > 80 ? 'bg-red-600' : system.cpu > 60 ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${system.cpu}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{system.cpu}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Memory</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  system.memory > 80 ? 'bg-red-600' : system.memory > 60 ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${system.memory}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{system.memory}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Response Time</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{system.responseTime}ms</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-600 dark:text-gray-300">
                        <div>Requests: <span className="font-medium text-gray-900 dark:text-gray-100">{system.requests.toLocaleString()}/hr</span></div>
                        <div>Errors: <span className="font-medium text-red-600">{system.errors}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Recent Deployments */}
          <FadeIn delay={500}>
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Recent Deployments
                  </h2>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentDeployments.map((deployment) => (
                  <div key={deployment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {deployment.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            deployment.status === 'Success'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          }`}>
                            {deployment.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-300">
                          <div>
                            <span className="block text-gray-500">Environment</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{deployment.environment}</span>
                          </div>
                          <div>
                            <span className="block text-gray-500">Duration</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{deployment.duration}</span>
                          </div>
                          <div>
                            <span className="block text-gray-500">Deployed By</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{deployment.deployedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 dark:text-gray-300">
                          <Clock className="w-3 h-3" />
                          {deployment.deployedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
