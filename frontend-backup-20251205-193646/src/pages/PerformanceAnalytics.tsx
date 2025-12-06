import { useState } from 'react';
import { Gauge, Clock, TrendingUp, Zap, Server, Database } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Progress from '../components/ui/Progress';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: number;
}

interface ServicePerformance {
  id: string;
  name: string;
  p50: number;
  p95: number;
  p99: number;
  throughput: number;
  errorRate: number;
}

const PerformanceAnalytics = () => {
  const [metrics] = useState<PerformanceMetric[]>([
    {
      id: '1',
      name: 'API Response Time (p95)',
      value: 145,
      unit: 'ms',
      target: 200,
      status: 'excellent',
      trend: -12,
    },
    {
      id: '2',
      name: 'Database Query Time (avg)',
      value: 38,
      unit: 'ms',
      target: 50,
      status: 'excellent',
      trend: -8,
    },
    {
      id: '3',
      name: 'Page Load Time',
      value: 1.2,
      unit: 's',
      target: 2.0,
      status: 'good',
      trend: -15,
    },
    {
      id: '4',
      name: 'Throughput',
      value: 1450,
      unit: 'req/s',
      target: 1000,
      status: 'excellent',
      trend: 22,
    },
  ]);

  const [services] = useState<ServicePerformance[]>([
    {
      id: '1',
      name: 'API Gateway',
      p50: 42,
      p95: 145,
      p99: 320,
      throughput: 580,
      errorRate: 0.02,
    },
    {
      id: '2',
      name: 'Blueprint Service',
      p50: 85,
      p95: 280,
      p99: 450,
      throughput: 240,
      errorRate: 0.05,
    },
    {
      id: '3',
      name: 'IAC Generator',
      p50: 210,
      p95: 680,
      p99: 1200,
      throughput: 120,
      errorRate: 0.12,
    },
    {
      id: '4',
      name: 'Guardrails Engine',
      p50: 65,
      p95: 190,
      p99: 380,
      throughput: 320,
      errorRate: 0.01,
    },
  ]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'fair':
        return 'text-orange-600 dark:text-orange-400';
      case 'poor':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend < 0) return 'text-green-600 dark:text-green-400';
    if (trend > 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const avgResponseTime = metrics.find((m) => m.name.includes('API'))?.value || 0;
  const totalThroughput = metrics.find((m) => m.name === 'Throughput')?.value || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time performance metrics and analysis
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Run Benchmark
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {avgResponseTime}ms
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Throughput</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalThroughput}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">req/s</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {services.length}
              </p>
            </div>
            <Server className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">DB Queries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">38ms</p>
            </div>
            <Database className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Key Performance Indicators
        </h3>
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.name}
                  </span>
                  <Badge variant={getStatusVariant(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </span>
                  <span className={`text-sm ${getTrendColor(metric.trend)}`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend}%
                  </span>
                </div>
              </div>
              <Progress
                value={(metric.value / metric.target) * 100}
                variant={
                  metric.status === 'excellent'
                    ? 'success'
                    : metric.status === 'good'
                    ? 'info'
                    : 'warning'
                }
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Target: {metric.target}{metric.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="services">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <TabsList>
              <TabsTrigger value="services">Service Performance</TabsTrigger>
              <TabsTrigger value="latency">Latency</TabsTrigger>
              <TabsTrigger value="throughput">Throughput</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {service.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">p50 Latency</p>
                        <p className="text-gray-900 dark:text-white font-bold mt-1">
                          {service.p50}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">p95 Latency</p>
                        <p className="text-gray-900 dark:text-white font-bold mt-1">
                          {service.p95}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">p99 Latency</p>
                        <p className="text-gray-900 dark:text-white font-bold mt-1">
                          {service.p99}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Throughput</p>
                        <p className="text-gray-900 dark:text-white font-bold mt-1">
                          {service.throughput} req/s
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Error Rate</p>
                        <p className={`font-bold mt-1 ${service.errorRate < 0.1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {service.errorRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="latency">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Latency Analysis</p>
                <p className="text-sm mt-2">Detailed latency breakdown and trends</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="throughput">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Throughput Metrics</p>
                <p className="text-sm mt-2">Request rates and capacity analysis</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="errors">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Gauge className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Error Analysis</p>
                <p className="text-sm mt-2">Error rates and failure patterns</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
