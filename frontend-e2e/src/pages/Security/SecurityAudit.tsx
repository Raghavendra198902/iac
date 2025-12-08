import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  trust_score: number;
  device_compliant: boolean;
  mfa_verified: boolean;
  details: {
    method?: string;
    path?: string;
    status_code?: number;
    response_time?: number;
    error?: string;
  };
}

interface AuditStats {
  total_events: number;
  success_rate: number;
  failure_count: number;
  warning_count: number;
  unique_users: number;
  unique_ips: number;
  mfa_verified_rate: number;
  device_compliance_rate: number;
}

const SecurityAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setError(null);
      const response = await fetch('/security/audit/logs?limit=50');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      
      // Calculate statistics
      const totalEvents = data.logs?.length || 0;
      const successCount = data.logs?.filter((log: AuditLog) => log.status === 'SUCCESS').length || 0;
      const failureCount = data.logs?.filter((log: AuditLog) => log.status === 'FAILURE').length || 0;
      const warningCount = data.logs?.filter((log: AuditLog) => log.status === 'WARNING').length || 0;
      const uniqueUsers = new Set(data.logs?.map((log: AuditLog) => log.user_id)).size;
      const uniqueIps = new Set(data.logs?.map((log: AuditLog) => log.ip_address)).size;
      const mfaVerified = data.logs?.filter((log: AuditLog) => log.mfa_verified).length || 0;
      const deviceCompliant = data.logs?.filter((log: AuditLog) => log.device_compliant).length || 0;

      setStats({
        total_events: totalEvents,
        success_rate: totalEvents > 0 ? (successCount / totalEvents) * 100 : 0,
        failure_count: failureCount,
        warning_count: warningCount,
        unique_users: uniqueUsers,
        unique_ips: uniqueIps,
        mfa_verified_rate: totalEvents > 0 ? (mfaVerified / totalEvents) * 100 : 0,
        device_compliance_rate: totalEvents > 0 ? (deviceCompliant / totalEvents) * 100 : 0
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAuditLogs, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'FAILURE':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'FAILURE':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'WARNING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesStatus && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        ></div>
      ))}

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              Security Audit Logs
            </h1>
            <p className="text-gray-300">Real-time security event monitoring and analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border backdrop-blur-xl transition-all duration-300 ${
                autoRefresh 
                  ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                  : 'bg-white/10 border-white/20 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowPathIcon className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span>{autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}</span>
              </div>
            </button>
            <button
              onClick={fetchAuditLogs}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 text-white"
            >
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5" />
                <span>Refresh Now</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-red-300 font-semibold">Error Loading Audit Logs</p>
                <p className="text-red-400/80 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchAuditLogs}
                className="ml-auto px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <ShieldCheckIcon className="w-10 h-10 text-blue-400" />
                <span className="text-3xl font-bold text-white">{stats.total_events}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Total Events</h3>
              <p className="text-sm text-gray-300">Success Rate: {stats.success_rate.toFixed(1)}%</p>
            </div>

            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <XCircleIcon className="w-10 h-10 text-red-400" />
                <span className="text-3xl font-bold text-white">{stats.failure_count}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Failures</h3>
              <p className="text-sm text-gray-300">Warnings: {stats.warning_count}</p>
            </div>

            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <UserIcon className="w-10 h-10 text-purple-400" />
                <span className="text-3xl font-bold text-white">{stats.unique_users}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Active Users</h3>
              <p className="text-sm text-gray-300">From {stats.unique_ips} IPs</p>
            </div>

            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <ComputerDesktopIcon className="w-10 h-10 text-green-400" />
                <span className="text-3xl font-bold text-white">{stats.device_compliance_rate.toFixed(0)}%</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Device Compliance</h3>
              <p className="text-sm text-gray-300">MFA: {stats.mfa_verified_rate.toFixed(0)}%</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username, action, IP address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="WARNING">Warning</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-300">
              Showing {filteredLogs.length} of {logs.length} events
            </span>
            {(searchTerm || filterStatus !== 'all' || filterAction !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterAction('all');
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <InformationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">No audit logs found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || filterStatus !== 'all' || filterAction !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Logs will appear here as security events occur'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="hover:bg-white/5 transition-colors">
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(log.status)}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white">{log.username}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(log.status)}`}>
                                {log.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <ClockIcon className="w-4 h-4" />
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-white font-medium">{log.action}</p>
                            <p className="text-sm text-gray-400">{log.resource_type}</p>
                          </div>

                          <div>
                            <p className="text-white">{log.ip_address}</p>
                            <p className="text-sm text-gray-400">Trust: <span className={getTrustScoreColor(log.trust_score)}>{log.trust_score}%</span></p>
                          </div>

                          <div className="flex gap-2">
                            {log.mfa_verified ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs">
                                MFA ✓
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs">
                                No MFA
                              </span>
                            )}
                            {log.device_compliant ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs">
                                Device ✓
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded text-xs">
                                Non-Compliant
                              </span>
                            )}
                          </div>

                          <div className="flex justify-end">
                            {expandedLog === log.id ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedLog === log.id && (
                        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-white font-semibold mb-2">Request Details</h4>
                            <div className="text-sm">
                              <span className="text-gray-400">Resource ID:</span>
                              <span className="text-white ml-2">{log.resource_id}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">User ID:</span>
                              <span className="text-white ml-2">{log.user_id}</span>
                            </div>
                            {log.details.method && (
                              <div className="text-sm">
                                <span className="text-gray-400">Method:</span>
                                <span className="text-white ml-2">{log.details.method}</span>
                              </div>
                            )}
                            {log.details.path && (
                              <div className="text-sm">
                                <span className="text-gray-400">Path:</span>
                                <span className="text-white ml-2">{log.details.path}</span>
                              </div>
                            )}
                            {log.details.status_code && (
                              <div className="text-sm">
                                <span className="text-gray-400">Status Code:</span>
                                <span className="text-white ml-2">{log.details.status_code}</span>
                              </div>
                            )}
                            {log.details.response_time && (
                              <div className="text-sm">
                                <span className="text-gray-400">Response Time:</span>
                                <span className="text-white ml-2">{log.details.response_time}ms</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-white font-semibold mb-2">Client Details</h4>
                            <div className="text-sm">
                              <span className="text-gray-400">User Agent:</span>
                              <p className="text-white mt-1 break-all">{log.user_agent}</p>
                            </div>
                            {log.details.error && (
                              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                <span className="text-red-400 text-sm font-semibold">Error:</span>
                                <p className="text-red-300 text-sm mt-1">{log.details.error}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-3">Status Legend</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Success - Operation completed successfully</span>
            </div>
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Warning - Operation completed with warnings</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-400" />
              <span className="text-gray-300">Failure - Operation failed or was denied</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default SecurityAudit;
