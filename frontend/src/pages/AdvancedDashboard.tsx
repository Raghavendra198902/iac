import { useState, useEffect } from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Activity, Database, Server, AlertTriangle, TrendingUp, TrendingDown, Zap, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { realtimeService, type RealTimeMetrics, type ServiceStatus, type SystemMetrics } from '../services/realtimeService';
import { databaseService, type DatabaseStats } from '../services/databaseService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ECG Monitor Component for sine wave visualization
const ECGMonitor = ({ data, color = 'blue', height = 60, width = 100, showGrid = true }: { 
  data: number[], 
  color?: string, 
  height?: number, 
  width?: number,
  showGrid?: boolean 
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  // Generate ECG-style sine wave with sharp peaks
  const ecgPoints: number[] = [];
  const samplesPerBeat = 20;
  const totalBeats = 8;
  
  for (let beat = 0; beat < totalBeats; beat++) {
    for (let i = 0; i < samplesPerBeat; i++) {
      const t = i / samplesPerBeat;
      const dataIndex = Math.floor((beat / totalBeats) * data.length);
      const baseValue = data[Math.min(dataIndex, data.length - 1)];
      
      let ecgValue;
      if (t < 0.15) {
        ecgValue = baseValue + range * 0.15 * Math.sin(t * Math.PI / 0.15);
      } else if (t >= 0.15 && t < 0.2) {
        ecgValue = baseValue;
      } else if (t >= 0.2 && t < 0.35) {
        const qrsT = (t - 0.2) / 0.15;
        if (qrsT < 0.3) {
          ecgValue = baseValue - range * 0.2 * Math.sin(qrsT * Math.PI / 0.3);
        } else if (qrsT < 0.6) {
          ecgValue = baseValue + range * 0.8 * Math.sin((qrsT - 0.3) * Math.PI / 0.3);
        } else {
          ecgValue = baseValue - range * 0.15 * Math.sin((qrsT - 0.6) * Math.PI / 0.4);
        }
      } else if (t >= 0.35 && t < 0.45) {
        ecgValue = baseValue;
      } else if (t >= 0.45 && t < 0.65) {
        ecgValue = baseValue + range * 0.25 * Math.sin((t - 0.45) * Math.PI / 0.2);
      } else {
        ecgValue = baseValue;
      }
      
      ecgPoints.push(ecgValue);
    }
  }
  
  const step = width / (ecgPoints.length - 1);
  const points = ecgPoints.map((value, i) => {
    const x = i * step;
    const y = height - ((value - min) / range) * height * 0.9 - height * 0.05;
    return `${x},${y}`;
  }).join(' ');
  
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f59e0b',
    purple: '#8b5cf6',
    red: '#ef4444',
  };
  
  const strokeColor = colorMap[color] || colorMap.blue;
  
  return (
    <svg width={width} height={height} className="inline-block">
      {showGrid && (
        <>
          <defs>
            <pattern id={`grid-${color}-adv`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 5" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill={`url(#grid-${color}-adv)`} />
        </>
      )}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse"
      />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        className="blur-sm"
      />
    </svg>
  );
};

export default function AdvancedDashboard() {
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<RealTimeMetrics[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fetch initial data
    loadSystemMetrics();
    loadDatabaseStats();

    // Subscribe to real-time metrics
    const unsubscribeMetrics = realtimeService.subscribeToMetrics((metrics) => {
      setRealTimeMetrics(metrics);
      setMetricsHistory((prev) => [...prev.slice(-59), metrics]); // Keep last 60 data points
      setIsConnected(true);
    });

    // Subscribe to alerts
    const unsubscribeAlerts = realtimeService.subscribeToAlerts((alert) => {
      console.log('Alert received:', alert);
      // Display alert notification
      if (alert.severity === 'critical' || alert.severity === 'error') {
        console.error(`${alert.severity.toUpperCase()}: ${alert.service} - ${alert.message}`);
      }
    });

    // Periodic refresh for system metrics
    const interval = setInterval(() => {
      loadSystemMetrics();
      loadDatabaseStats();
    }, 30000); // Refresh every 30 seconds

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
      clearInterval(interval);
    };
  }, []);

  const loadSystemMetrics = async () => {
    try {
      const metrics = await realtimeService.getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const stats = await databaseService.getStats();
      setDatabaseStats(stats);
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced System Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring and analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics?.requestsPerSecond.toFixed(1) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {realTimeMetrics && realTimeMetrics.requestsPerSecond > 0 ? (
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active traffic
                </span>
              ) : (
                <span className="text-muted-foreground">No traffic</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics?.avgResponseTime.toFixed(0) || '0'}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {realTimeMetrics && realTimeMetrics.avgResponseTime < 200 ? (
                <span className="text-green-500">Excellent</span>
              ) : realTimeMetrics && realTimeMetrics.avgResponseTime < 500 ? (
                <span className="text-yellow-500">Good</span>
              ) : (
                <span className="text-red-500">Needs attention</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics?.errorRate.toFixed(2) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {realTimeMetrics && realTimeMetrics.errorRate < 1 ? (
                <span className="text-green-500">Healthy</span>
              ) : realTimeMetrics && realTimeMetrics.errorRate < 5 ? (
                <span className="text-yellow-500">Warning</span>
              ) : (
                <span className="text-red-500">Critical</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(realTimeMetrics?.activeUsers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Online now
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Real-time Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Metrics (Last 60 seconds)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Requests Per Second</p>
                    <div className="h-24 flex items-end space-x-1">
                      {metricsHistory.slice(-20).map((metric, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-blue-500 rounded-t"
                          style={{
                            height: `${Math.min((metric.requestsPerSecond / 10) * 100, 100)}%`,
                            minHeight: '4px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Response Time (ms)</p>
                    <div className="h-24 flex items-end space-x-1">
                      {metricsHistory.slice(-20).map((metric, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-green-500 rounded-t"
                          style={{
                            height: `${Math.min((metric.avgResponseTime / 500) * 100, 100)}%`,
                            minHeight: '4px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Current RPS</p>
                    <p className="text-2xl font-bold">{realTimeMetrics?.requestsPerSecond.toFixed(1) || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Response</p>
                    <p className="text-2xl font-bold">{realTimeMetrics?.avgResponseTime.toFixed(0) || '0'}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Error Rate</p>
                    <p className="text-2xl font-bold">{realTimeMetrics?.errorRate.toFixed(2) || '0'}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeMetrics?.cpuUsage.toFixed(1) || '0'}%
                </div>
                <div className="mt-2">
                  <ECGMonitor 
                    data={metricsHistory.length > 0 ? metricsHistory.map(m => m.cpuUsage) : [40, 42, 45, 43, 44, 46]} 
                    color="blue" 
                    height={50} 
                    width={100} 
                    showGrid={true} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeMetrics?.memoryUsage.toFixed(1) || '0'}%
                </div>
                <div className="mt-2">
                  <ECGMonitor 
                    data={metricsHistory.length > 0 ? metricsHistory.map(m => m.memoryUsage) : [60, 62, 65, 63, 64, 66]} 
                    color="green" 
                    height={50} 
                    width={100} 
                    showGrid={true} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeMetrics?.diskUsage.toFixed(1) || '0'}%
                </div>
                <div className="mt-2">
                  <ECGMonitor 
                    data={metricsHistory.length > 0 ? metricsHistory.map(m => m.diskUsage) : [70, 72, 74, 73, 75, 76]} 
                    color="orange" 
                    height={50} 
                    width={100} 
                    showGrid={true} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time health monitoring of all microservices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics?.services.map((service) => (
                  <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-muted-foreground">
                          v{service.version} • Uptime: {Math.floor(service.uptime / 3600)}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{service.responseTime}ms</p>
                        <p className="text-xs text-muted-foreground">Response time</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatNumber(service.requestCount)}</p>
                        <p className="text-xs text-muted-foreground">Requests</p>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Connection Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-medium">{databaseStats?.activeConnections || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Idle</span>
                    <span className="font-medium">{databaseStats?.idleConnections || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-medium">{databaseStats?.totalConnections || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max</span>
                    <span className="font-medium">{databaseStats?.maxConnections || 0}</span>
                  </div>
                  <div className="mt-2">
                    <ECGMonitor 
                      data={[40, 45, 50, 48, 52, 55]} 
                      color="blue" 
                      height={40} 
                      width={100} 
                      showGrid={true} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cache Hit Ratio</span>
                    <span className="font-medium">{databaseStats?.cacheHitRatio.toFixed(2) || '0'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TPS</span>
                    <span className="font-medium">{databaseStats?.transactionsPerSecond || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Database Size</span>
                    <span className="font-medium">{databaseStats?.databaseSize || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tables</span>
                    <span className="font-medium">{databaseStats?.tableCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Servers</p>
                  <p className="text-2xl font-bold">{systemMetrics?.infrastructure.totalServers || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Healthy Servers</p>
                  <p className="text-2xl font-bold text-green-500">
                    {systemMetrics?.infrastructure.healthyServers || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold">
                    ${systemMetrics?.infrastructure.totalCost.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Cost Trend</p>
                  <p className={`text-2xl font-bold flex items-center ${
                    (systemMetrics?.infrastructure.costTrend || 0) > 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {(systemMetrics?.infrastructure.costTrend || 0) > 0 ? (
                      <TrendingUp className="h-5 w-5 mr-1" />
                    ) : (
                      <TrendingDown className="h-5 w-5 mr-1" />
                    )}
                    {Math.abs(systemMetrics?.infrastructure.costTrend || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
