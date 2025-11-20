import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity, Database } from 'lucide-react';

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

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchSecurityData = async () => {
    try {
      const [analyticsRes, eventsRes] = await Promise.all([
        fetch(`/api/security/analytics?timeRange=${timeRange}`),
        fetch('/api/security/events?limit=20'),
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
        return '📋';
      case 'usb-write':
        return '💾';
      case 'file-access':
        return '📁';
      case 'network-exfiltration':
        return '🌐';
      default:
        return '⚠️';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Security Monitoring</h1>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalEvents}</p>
              </div>
              <Activity className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Severity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.statistics.bySeverity.high || 0}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium Severity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.statistics.bySeverity.medium || 0}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Severity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.statistics.bySeverity.low || 0}
                </p>
              </div>
              <Shield className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Event Type Distribution */}
      {analytics && Object.keys(analytics.statistics.byType).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Event Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.statistics.byType).map(([type, count]) => (
              <div key={type} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-3xl">{getEventTypeIcon(type)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">{formatEventType(type)}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Threats */}
      {analytics && analytics.statistics.topThreats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Threats by Agent</h2>
          <div className="space-y-3">
            {analytics.statistics.topThreats.map((threat, index) => (
              <div
                key={threat.ciId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <Database className="h-6 w-6 text-gray-600" />
                  <span className="font-medium text-gray-900">{threat.ciId}</span>
                </div>
                <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-bold">
                  {threat.count} events
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Security Events</h2>
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No security events detected</p>
              <p className="text-sm text-gray-400 mt-2">System is secure and monitoring</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.eventId}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(event.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getEventTypeIcon(event.eventType)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900">
                          {formatEventType(event.eventType)}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${getSeverityColor(
                            event.severity
                          )}`}
                        >
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Agent:</strong> {event.ciId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.details && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{event.eventId}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* High Severity Alerts */}
      {analytics && analytics.recentHighSeverity.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Critical Alerts</h2>
          </div>
          <div className="space-y-3">
            {analytics.recentHighSeverity.map((event) => (
              <div key={event.eventId} className="bg-white p-4 rounded-lg border border-red-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-red-900">{formatEventType(event.eventType)}</h3>
                    <p className="text-sm text-gray-600">{event.ciId}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
