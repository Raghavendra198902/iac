import { useState, useEffect } from 'react';
import { Activity, Server, Database, Cloud, Zap, CheckCircle, AlertTriangle, XCircle, Network, HardDrive, Cpu, MemoryStick } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import FadeIn from '../components/ui/FadeIn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface HealthScore {
  overall: number;
  availability: number;
  performance: number;
  security: number;
  reliability: number;
}

interface ServiceDependency {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  dependencies: string[];
  healthScore: number;
}

interface InfrastructureMetric {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  threshold: number;
  unit: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  affectedServices: string[];
  startTime: string;
  resolvedTime?: string;
}

export default function SystemHealth() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [healthScore, setHealthScore] = useState<HealthScore>({
    overall: 0,
    availability: 0,
    performance: 0,
    security: 0,
    reliability: 0,
  });
  const [services, setServices] = useState<ServiceDependency[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureMetric[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [healthRes, servicesRes, infraRes, incidentsRes, historyRes] = await Promise.all([
          fetch('/api/system-health/score'),
          fetch('/api/system-health/services'),
          fetch('/api/system-health/infrastructure'),
          fetch('/api/system-health/incidents'),
          fetch('/api/system-health/history')
        ]);
        if (healthRes.ok) setHealthScore(await healthRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (infraRes.ok) setInfrastructure(await infraRes.json());
        if (incidentsRes.ok) setIncidents(await incidentsRes.json());
        if (historyRes.ok) setHistoricalData(await historyRes.json());
      } catch (error) {
        console.error('Failed to load system health data:', error);
      }
    };
    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'down':
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const openIncidents = incidents.filter(i => i.status !== 'resolved');
  const healthyServices = services.filter(s => s.status === 'healthy').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getHealthBg(healthScore.overall)} flex items-center justify-center`}>
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Health</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive infrastructure health overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={openIncidents.length > 0 ? 'error' : 'success'}>
            {openIncidents.length} Active Incident{openIncidents.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Overall Health Score */}
      <FadeIn delay={0.1}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Overall System Health</h2>
            <span className={`text-5xl font-bold ${getHealthColor(healthScore.overall)}`}>
              {healthScore.overall}%
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                <span className={`text-lg font-bold ${getHealthColor(healthScore.availability)}`}>
                  {healthScore.availability}%
                </span>
              </div>
              <Progress value={healthScore.availability} variant={healthScore.availability >= 90 ? 'success' : 'warning'} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                <span className={`text-lg font-bold ${getHealthColor(healthScore.performance)}`}>
                  {healthScore.performance}%
                </span>
              </div>
              <Progress value={healthScore.performance} variant={healthScore.performance >= 90 ? 'success' : 'warning'} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Security</span>
                <span className={`text-lg font-bold ${getHealthColor(healthScore.security)}`}>
                  {healthScore.security}%
                </span>
              </div>
              <Progress value={healthScore.security} variant={healthScore.security >= 90 ? 'success' : 'warning'} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reliability</span>
                <span className={`text-lg font-bold ${getHealthColor(healthScore.reliability)}`}>
                  {healthScore.reliability}%
                </span>
              </div>
              <Progress value={healthScore.reliability} variant={healthScore.reliability >= 90 ? 'success' : 'warning'} />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Health Trend */}
      <FadeIn delay={0.2}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Health Score Trend (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#fff', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Health Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Dependencies */}
        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-600" />
                Service Dependencies
              </h2>
              <Badge variant="default">
                {healthyServices}/{services.length} Healthy
              </Badge>
            </div>

            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="font-semibold text-gray-900 dark:text-white">{service.name}</span>
                    </div>
                    <Badge variant={service.status === 'healthy' ? 'success' : service.status === 'degraded' ? 'warning' : 'error'}>
                      {service.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {service.dependencies.length} Dependencies
                    </span>
                    <span className={`font-bold ${getHealthColor(service.healthScore)}`}>
                      {service.healthScore}% Health
                    </span>
                  </div>

                  {service.dependencies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {service.dependencies.map((dep, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {dep}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Infrastructure Metrics */}
        <FadeIn delay={0.4}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              Infrastructure Status
            </h2>

            <div className="space-y-4">
              {infrastructure.map((metric, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {metric.component === 'CPU' && <Cpu className="w-4 h-4 text-blue-600" />}
                      {metric.component === 'Memory' && <MemoryStick className="w-4 h-4 text-purple-600" />}
                      {metric.component === 'Disk' && <HardDrive className="w-4 h-4 text-green-600" />}
                      {metric.component === 'Network' && <Network className="w-4 h-4 text-orange-600" />}
                      <span className="font-semibold text-gray-900 dark:text-white">{metric.component}</span>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Current: {metric.value}{metric.unit}</span>
                    <span className="text-gray-600 dark:text-gray-400">Threshold: {metric.threshold}{metric.unit}</span>
                  </div>

                  <Progress 
                    value={(metric.value / metric.threshold) * 100} 
                    variant={metric.status === 'healthy' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'} 
                  />
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Active Incidents */}
      <FadeIn delay={0.5}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Active Incidents
            </h2>
            <Badge variant={openIncidents.length > 0 ? 'error' : 'success'}>
              {openIncidents.length} Open
            </Badge>
          </div>

          {openIncidents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600 opacity-50" />
              <p className="text-lg font-semibold">All systems operational</p>
              <p className="text-sm mt-2">No active incidents at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openIncidents.map((incident) => (
                <div key={incident.id} className={`p-4 rounded-lg border ${getSeverityColor(incident.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          incident.severity === 'critical' ? 'error' :
                          incident.severity === 'high' ? 'warning' :
                          'default'
                        }>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={incident.status === 'investigating' ? 'warning' : 'default'}>
                          {incident.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{incident.startTime}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {incident.affectedServices.map((service, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
