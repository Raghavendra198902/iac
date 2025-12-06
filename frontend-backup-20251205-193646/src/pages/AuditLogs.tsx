import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Eye, User, Calendar, Activity, AlertCircle, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import FadeIn from '../components/ui/FadeIn';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceType: 'infrastructure' | 'security' | 'cost' | 'deployment' | 'user' | 'system';
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  details?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  complianceFlag?: boolean;
}

interface AuditStats {
  totalLogs: number;
  successRate: number;
  failureCount: number;
  criticalEvents: number;
  uniqueUsers: number;
  complianceViolations: number;
}

interface ActivityTrend {
  time: string;
  actions: number;
  failures: number;
}

export default function AuditLogs() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    successRate: 0,
    failureCount: 0,
    criticalEvents: 0,
    uniqueUsers: 0,
    complianceViolations: 0,
  });
  const [activityTrend, setActivityTrend] = useState<ActivityTrend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('24h');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [logsRes, statsRes, trendRes] = await Promise.all([
          fetch(`/api/audit-logs?range=${dateRange}&status=${statusFilter}&resource=${resourceFilter}&severity=${severityFilter}`),
          fetch(`/api/audit-logs/stats?range=${dateRange}`),
          fetch(`/api/audit-logs/trend?range=${dateRange}`)
        ]);
        if (logsRes.ok) setLogs(await logsRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (trendRes.ok) setActivityTrend(await trendRes.json());
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      }
    };
    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [dateRange, statusFilter, resourceFilter, severityFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failure':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'failure':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="error">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="warning">HIGH</Badge>;
      case 'medium':
        return <Badge variant="warning">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="default">LOW</Badge>;
      default:
        return <Badge variant="default">{severity}</Badge>;
    }
  };

  const exportLogs = (format: 'json' | 'csv') => {
    const dataStr = format === 'json' 
      ? JSON.stringify(filteredLogs, null, 2)
      : convertToCSV(filteredLogs);
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString()}.${format}`;
    link.click();
  };

  const convertToCSV = (data: AuditLog[]) => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address', 'Severity'];
    const rows = data.map(log => [
      log.timestamp,
      log.userName,
      log.action,
      log.resource,
      log.status,
      log.ipAddress,
      log.severity
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const filteredLogs = logs
    .filter(log => 
      searchQuery === '' || 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(log => statusFilter === 'all' || log.status === statusFilter)
    .filter(log => resourceFilter === 'all' || log.resourceType === resourceFilter)
    .filter(log => severityFilter === 'all' || log.severity === severityFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive activity tracking and compliance monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportLogs('json')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button 
            onClick={() => exportLogs('csv')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <FadeIn delay={0.1}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Events</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLogs.toLocaleString()}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 shadow-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-300 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.successRate}%</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-900 dark:text-red-300 mb-1">Failures</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.failureCount}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-900 dark:text-orange-300 mb-1">Critical Events</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.criticalEvents}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.5}>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300 mb-1">Unique Users</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.uniqueUsers}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.6}>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-900 dark:text-purple-300 mb-1">Compliance Issues</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{stats.complianceViolations}</p>
          </div>
        </FadeIn>
      </div>

      {/* Activity Trend Chart */}
      <FadeIn delay={0.7}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Activity Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityTrend}>
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
              <Line type="monotone" dataKey="actions" stroke="#3b82f6" strokeWidth={2} name="Total Actions" />
              <Line type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={2} name="Failures" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </select>

          {/* Resource Type Filter */}
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Resources</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="security">Security</option>
            <option value="cost">Cost</option>
            <option value="deployment">Deployment</option>
            <option value="user">User</option>
            <option value="system">System</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <p className="text-gray-600 dark:text-gray-400">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${log.complianceFlag ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{log.userName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{log.userRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{log.action}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{log.resource}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{log.resourceType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge variant={log.status === 'success' ? 'success' : log.status === 'failure' ? 'error' : 'warning'}>
                          {log.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                      {log.complianceFlag && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
                          <Shield className="w-3 h-3" />
                          Compliance
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Log Details</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Timestamp</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.userName} ({selectedLog.userRole})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Action</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resource</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.resource}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resource Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.resourceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedLog.status)}
                    {getSeverityBadge(selectedLog.severity)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User Agent</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedLog.userAgent}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Additional Details</p>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.complianceFlag && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Compliance Violation Detected</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    This action has been flagged as a potential compliance violation and requires review.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
