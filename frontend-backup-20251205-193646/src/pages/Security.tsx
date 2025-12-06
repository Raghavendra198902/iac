import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Shield, Activity, Database, RefreshCw, 
  Eye, Lock, Unlock, FileSearch, Network, Usb, Clipboard,
  CheckCircle, XCircle, Clock, TrendingUp
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import { API_URL } from '../config/api';

interface SecurityEvent {
  id: string;
  ciId: string;
  eventType: 'clipboard' | 'usb-write' | 'file-access' | 'network-exfiltration';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  eventId: string;
  details: any;
}

interface SecurityAnalytics {
  timeRange: string;
  totalEvents: number;
  statistics: {
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    topThreats: Array<{ ciId: string; count: number }>;
  };
  recentHighSeverity: SecurityEvent[];
}

const SecurityDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SecurityAnalytics | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSecurityData();
    
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, autoRefresh]);

  const fetchSecurityData = async () => {
    setIsRefreshing(true);
    try {
      const [analyticsRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/security/analytics?timeRange=${timeRange}`),
        fetch(`${API_URL}/security/events?limit=20`),
      ]);

      if (analyticsRes.ok && eventsRes.ok) {
        const analyticsData = await analyticsRes.json();
        const eventsData = await eventsRes.json();
        setAnalytics(analyticsData);
        setEvents(eventsData.events);
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'clipboard':
        return Clipboard;
      case 'usb-write':
        return Usb;
      case 'file-access':
        return FileSearch;
      case 'network-exfiltration':
        return Network;
      default:
        return AlertTriangle;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 -left-4 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-0 right-4 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  Security Monitoring & Threat Detection
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs sm:text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-normal flex items-center gap-1.5"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Live
                  </motion.span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Real-time security event monitoring and threat analysis
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Auto Refresh Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm ${
                    autoRefresh
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">{autoRefresh ? 'Auto' : 'Manual'}</span>
                </motion.button>

                {/* Time Range Selector */}
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </motion.select>

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: 180 }}
                  onClick={fetchSecurityData}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"
                    >
                      <Activity className="w-6 h-6 text-white" />
                    </motion.div>
                    <Badge variant="info">Total</Badge>
                  </div>
                  <motion.h3
                    key={`total-${analytics.totalEvents}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                  >
                    {analytics.totalEvents}
                  </motion.h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Events</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg"
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </motion.div>
                    <Badge variant="error">Critical</Badge>
                  </div>
                  <motion.h3
                    key={`high-${analytics.statistics.bySeverity.high}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                  >
                    {analytics.statistics.bySeverity.high || 0}
                  </motion.h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">High Severity</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg"
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </motion.div>
                    <Badge variant="warning">Moderate</Badge>
                  </div>
                  <motion.h3
                    key={`medium-${analytics.statistics.bySeverity.medium}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
                  >
                    {analytics.statistics.bySeverity.medium || 0}
                  </motion.h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Medium Severity</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg"
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </motion.div>
                    <Badge variant="success">Safe</Badge>
                  </div>
                  <motion.h3
                    key={`low-${analytics.statistics.bySeverity.low}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                  >
                    {analytics.statistics.bySeverity.low || 0}
                  </motion.h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Low Severity</p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Event Type Distribution */}
          {analytics && Object.keys(analytics.statistics.byType).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Event Distribution by Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.statistics.byType).map(([type, count], index) => {
                  const IconComponent = getEventTypeIcon(type);
                  return (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + (index * 0.1) }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-750/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg"
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{formatEventType(type)}</p>
                        <motion.p
                          key={`type-${type}-${count}`}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl font-bold text-gray-900 dark:text-white"
                        >
                          {count}
                        </motion.p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Top Threats */}
          {analytics && analytics.statistics.topThreats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-red-600" />
                Top Threats by Agent
              </h2>
              <div className="space-y-3">
                {analytics.statistics.topThreats.map((threat, index) => (
                  <motion.div
                    key={threat.ciId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-750/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        whileHover={{ scale: 1.2 }}
                        className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                      >
                        #{index + 1}
                      </motion.span>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg"
                      >
                        <Database className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="font-medium text-gray-900 dark:text-white">{threat.ciId}</span>
                    </div>
                    <Badge variant="error">
                      {threat.count} events
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Recent Security Events
            </h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <Shield className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No security events detected</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">System is secure and monitoring</p>
                </motion.div>
              ) : (
                events.map((event, index) => {
                  const IconComponent = getEventTypeIcon(event.eventType);
                  return (
                    <motion.div
                      key={event.eventId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (index * 0.05) }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className={`p-4 rounded-lg border-2 backdrop-blur-sm ${getSeverityColor(event.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <IconComponent className="w-5 h-5" />
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {formatEventType(event.eventType)}
                              </h3>
                              <Badge
                                variant={event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warning' : 'success'}
                              >
                                {event.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <strong>Agent:</strong> {event.ciId}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {event.details && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 p-2 bg-white/50 dark:bg-gray-900/50 rounded"
                              >
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {JSON.stringify(event.details, null, 2)}
                                </pre>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{event.eventId}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* High Severity Alerts */}
          {analytics && analytics.recentHighSeverity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-red-50/80 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl shadow-lg p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </motion.div>
                <h2 className="text-xl font-bold text-red-900 dark:text-red-300">Critical Alerts</h2>
              </div>
              <div className="space-y-3">
                {analytics.recentHighSeverity.map((event, index) => (
                  <motion.div
                    key={event.eventId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + (index * 0.1) }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-300 dark:border-red-700 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-red-900 dark:text-red-300">{formatEventType(event.eventType)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.ciId}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SecurityDashboard;
