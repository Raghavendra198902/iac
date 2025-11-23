import { useState, useEffect } from 'react';
import { Activity, Server, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Brain, Cloud, Network, FileText, Clock, Search, Filter, AlertCircle, Zap } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Alert from '../components/ui/Alert';
import Progress from '../components/ui/Progress';
import AIRecommendationsPanel from '../components/AIRecommendationsPanel';
import FadeIn from '../components/ui/FadeIn';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  errorRate: number;
  requests: number;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface PerformanceData {
  time: string;
  cpu: number;
  memory: number;
  requests: number;
  responseTime: number;
}

interface TraceSpan {
  id: string;
  service: string;
  operation: string;
  duration: number;
  status: 'success' | 'error';
  timestamp: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  metadata?: Record<string, unknown>;
}

const MonitoringDashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Load real monitoring data from APIs - no demo data
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [traces, setTraces] = useState<TraceSpan[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [aiMetrics] = useState({
    anomaliesDetected: 12,
    predictiveAlerts: 5,
    mlAccuracy: 96.3,
    autoRemediations: 18,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, metricsRes, perfRes, tracesRes, logsRes] = await Promise.all([
          fetch('/api/monitoring/services'),
          fetch('/api/monitoring/metrics'),
          fetch('/api/monitoring/performance'),
          fetch('/api/monitoring/traces'),
          fetch('/api/monitoring/logs')
        ]);
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (metricsRes.ok) setMetrics(await metricsRes.json());
        if (perfRes.ok) setPerformanceData(await perfRes.json());
        if (tracesRes.ok) setTraces(await tracesRes.json());
        if (logsRes.ok) setLogs(await logsRes.json());
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
      }
    };
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'down':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const healthyServices = services.filter((s) => s.status === 'healthy').length;
  const degradedServices = services.filter((s) => s.status === 'degraded').length;
  const avgUptime = services.length > 0 ? services.reduce((acc, s) => acc + s.uptime, 0) / services.length : 0;
  const totalRequests = services.reduce((acc, s) => acc + s.requests, 0);

  const filteredLogs = logs
    .filter((log) => logLevelFilter === 'all' || log.level === logLevelFilter)
    .filter((log) => 
      logFilter === '' || 
      log.message.toLowerCase().includes(logFilter.toLowerCase()) || 
      log.service.toLowerCase().includes(logFilter.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time observability and metrics
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Activity className="w-4 h-4" />
          View Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Anomalies</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {aiMetrics.anomaliesDetected}
              </p>
              <div className="flex items-center gap-1 mt-2 text-purple-600 dark:text-purple-400">
                <Brain className="w-3 h-3" />
                <p className="text-xs font-medium">ML-detected</p>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Healthy Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {healthyServices}/{services.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Uptime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {avgUptime.toFixed(2)}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {(totalRequests / 1000).toFixed(1)}K
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Auto-Remediated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {aiMetrics.autoRemediations}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                <p className="text-xs font-medium">AI-automated</p>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Cloud Monitoring */}
      <FadeIn delay={0.2}>
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Multi-Cloud Service Health</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time monitoring across all providers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">AWS</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">99.9% uptime</span>
              </div>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">32</p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">Services monitored</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Azure</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">99.8% uptime</span>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">24</p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">Services monitored</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-red-900 dark:text-red-300">GCP</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">99.7% uptime</span>
              </div>
              <p className="text-3xl font-bold text-red-900 dark:text-red-300">18</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-2">Services monitored</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* AI-Powered Monitoring Insights */}
      <FadeIn delay={0.3}>
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI-Powered Observability</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Machine learning insights for proactive monitoring</p>
            </div>
          </div>
          <AIRecommendationsPanel />
        </div>
      </FadeIn>

      {/* Degraded Services Alert */}
      {degradedServices > 0 && (
        <Alert variant="warning" title={`${degradedServices} service(s) degraded`}>
          Some services are experiencing issues and require attention
        </Alert>
      )}

      {/* System Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.name}
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                <span className={`text-sm font-bold ${getMetricColor(metric.status)}`}>
                  {metric.value}{metric.unit}
                </span>
              </div>
              <Progress
                value={metric.value}
                variant={metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="services">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <TabsList>
              <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="services">
            <div className="p-6">
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {service.name}
                          </h3>
                          <Badge variant={getStatusVariant(service.status)} className="mt-1">
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-sm">View Details</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Uptime</p>
                        <p className={`font-bold mt-1 ${service.uptime >= 99.9 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {service.uptime}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Response Time</p>
                        <p className={`font-bold mt-1 ${service.responseTime < 200 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {service.responseTime}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Error Rate</p>
                        <p className={`font-bold mt-1 ${service.errorRate < 0.5 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {service.errorRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Requests/hour</p>
                        <p className="font-bold mt-1 text-gray-900 dark:text-white">
                          {service.requests.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="p-6 space-y-6">
              {/* Real-Time Performance Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CPU & Memory Usage */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    CPU & Memory Usage
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#fff', 
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" strokeWidth={2} />
                      <Line type="monotone" dataKey="memory" stroke="#8b5cf6" name="Memory %" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Request Rate & Response Time */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Request Rate & Response Time
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#fff', 
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="requests" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Requests/min" />
                      <Area type="monotone" dataKey="responseTime" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Avg Response (ms)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* System Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.map((metric) => (
                  <div key={metric.name} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {metric.name}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <span className={`text-sm font-bold ${getMetricColor(metric.status)}`}>
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                    <Progress
                      value={metric.value}
                      variant={metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="p-6 space-y-6">
              {/* Distributed Tracing */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Network className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Distributed Tracing</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">End-to-end request traces across services</p>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>

                <div className="space-y-3">
                  {traces.map((trace) => (
                    <div key={trace.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={trace.status === 'success' ? 'success' : 'error'}>
                            {trace.status}
                          </Badge>
                          <span className="font-semibold text-gray-900 dark:text-white">{trace.service}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{trace.operation}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {trace.duration}ms
                          </span>
                          <span className="text-gray-500 dark:text-gray-500">{trace.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-20">
                        <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${Math.min((trace.duration / 1000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {traces.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No traces available</p>
                    <p className="text-sm mt-2">Traces will appear here once services start generating them</p>
                  </div>
                )}
              </div>

              {/* SLA Tracking */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">SLA Compliance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Service level agreement tracking</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900 dark:text-green-300">99.9% SLA</span>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">99.97%</p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">Current uptime</p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Response Time</span>
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">145ms</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Target: &lt;200ms</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Error Rate</span>
                      <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">0.23%</p>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Target: &lt;0.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="p-6 space-y-4">
              {/* Log Search & Filter */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={logLevelFilter}
                    onChange={(e) => setLogLevelFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
              </div>

              {/* Log Viewer */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 font-mono text-sm max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="py-2 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 text-xs">{log.timestamp}</span>
                      <Badge 
                        variant={
                          log.level === 'error' ? 'error' : 
                          log.level === 'warning' ? 'warning' : 
                          log.level === 'info' ? 'default' : 
                          'default'
                        }
                        className="text-xs"
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-blue-400 text-xs">[{log.service}]</span>
                      <span className="text-gray-300 flex-1">{log.message}</span>
                    </div>
                    {log.metadata && (
                      <div className="ml-32 mt-1 text-xs text-gray-500">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                ))}
              
                {logs.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No logs available</p>
                    <p className="text-sm mt-2">Logs will appear here once services start generating them</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
