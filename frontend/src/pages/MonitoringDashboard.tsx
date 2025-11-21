import { useState, useEffect } from 'react';
import { Activity, Server, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Alert from '../components/ui/Alert';
import Progress from '../components/ui/Progress';

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

const MonitoringDashboard = () => {
  // Load real monitoring data from APIs - no demo data
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, metricsRes] = await Promise.all([
          fetch('/api/monitoring/services'),
          fetch('/api/monitoring/metrics')
        ]);
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (metricsRes.ok) setMetrics(await metricsRes.json());
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
  const avgUptime = services.reduce((acc, s) => acc + s.uptime, 0) / services.length;
  const totalRequests = services.reduce((acc, s) => acc + s.requests, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Incidents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {degradedServices}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

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
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Detailed Metrics</p>
                <p className="text-sm mt-2">Time-series data and performance graphs</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Alert Configuration</p>
                <p className="text-sm mt-2">Set up and manage monitoring alerts</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Server className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">System Logs</p>
                <p className="text-sm mt-2">View and search application logs</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
