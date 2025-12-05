import { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import { Activity, Database, Wifi, Server, Clock, Zap, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    websocket: {
      status: 'active' | 'inactive';
      connections: number;
    };
  };
  stats: {
    totalEvents: number;
    last24Hours: number;
    criticalEvents: number;
  };
}

interface PerformanceMetrics {
  avgResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage: number;
}

interface HistoricalData {
  time: string;
  responseTime: number;
  requests: number;
  errors: number;
}

export function SystemHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [history, setHistory] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/health`),
        fetch(`${API_URL}/metrics`)
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);

        // Update historical data
        setHistory(prev => {
          const newEntry: HistoricalData = {
            time: new Date().toLocaleTimeString(),
            responseTime: metricsData.avgResponseTime || 0,
            requests: metricsData.requestsPerMinute || 0,
            errors: metricsData.errorRate || 0
          };
          return [...prev.slice(-19), newEntry]; // Keep last 20 data points
        });
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
      case 'disconnected':
      case 'error':
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800 border-green-300',
      connected: 'bg-green-100 text-green-800 border-green-300',
      active: 'bg-green-100 text-green-800 border-green-300',
      degraded: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      unhealthy: 'bg-red-100 text-red-800 border-red-300',
      disconnected: 'bg-red-100 text-red-800 border-red-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      inactive: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            System Health Check Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Status
              </CardTitle>
              <CardDescription>Real-time system health monitoring</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.status || 'unhealthy')} animate-pulse`} />
              {getStatusBadge(health?.status || 'unknown')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">
                  {health ? formatUptime(health.uptime) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Activity className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-lg font-semibold text-gray-900">
                  {health?.stats.totalEvents.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">24h Events</p>
                <p className="text-lg font-semibold text-gray-900">
                  {health?.stats.last24Hours.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-lg font-semibold text-gray-900">
                  {health?.stats.criticalEvents || '0'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              {getStatusBadge(health?.services.database.status || 'unknown')}
            </div>
            {health?.services.database.responseTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium">
                  {health.services.database.responseTime}ms
                </span>
              </div>
            )}
            {health?.services.database.error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {health.services.database.error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              WebSocket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              {getStatusBadge(health?.services.websocket.status || 'unknown')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Connections</span>
              <span className="text-sm font-medium">
                {health?.services.websocket.connections || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Real-time system performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Requests/Min</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.requestsPerMinute.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.errorRate.toFixed(2)}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(metrics.memoryUsage.heapUsed)}
                </p>
              </div>
            </div>

            {/* Performance Charts */}
            {history.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Response Time (ms)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#666" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Requests Per Minute</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#666" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="requests" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Version</span>
              <span className="font-medium">{health?.version || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Last Check</span>
              <span className="font-medium">
                {health ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            {metrics && (
              <>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Heap Total</span>
                  <span className="font-medium">{formatBytes(metrics.memoryUsage.heapTotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium">{metrics.cpuUsage.toFixed(2)}%</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
