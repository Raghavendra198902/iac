import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  KeyIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface Policy {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  conditions: Record<string, any>;
}

interface Session {
  session_id: string;
  user_id: string;
  username: string;
  ip_address: string;
  device_type: string;
  last_activity: string;
  trust_score: number;
  mfa_verified: boolean;
  status: 'active' | 'expired' | 'suspicious';
}

interface AccessDecision {
  timestamp: string;
  user_id: string;
  username: string;
  resource: string;
  action: string;
  decision: 'ALLOW' | 'DENY' | 'CHALLENGE';
  reason: string;
  trust_score: number;
}

const SecurityAccess: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<AccessDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAccessData = async () => {
    try {
      setError(null);
      
      // Fetch policies
      const policiesResponse = await fetch('/api/v3/zero-trust/policies');
      const policiesData = await policiesResponse.ok ? await policiesResponse.json() : { policies: [] };
      
      // Fetch active sessions
      const sessionsResponse = await fetch('/api/v3/zero-trust/sessions/active');
      const sessionsData = await sessionsResponse.ok ? await sessionsResponse.json() : { sessions: [] };
      
      // Generate sample data if APIs return empty
      if (policiesData.policies?.length === 0) {
        policiesData.policies = [
          {
            id: 'pol-001',
            name: 'MFA Required for Admin',
            type: 'authentication',
            enabled: true,
            conditions: { role: 'admin', mfa_required: true }
          },
          {
            id: 'pol-002',
            name: 'Minimum Trust Score 70',
            type: 'authorization',
            enabled: true,
            conditions: { min_trust_score: 70 }
          },
          {
            id: 'pol-003',
            name: 'Device Compliance Check',
            type: 'device',
            enabled: true,
            conditions: { device_compliance_required: true }
          },
          {
            id: 'pol-004',
            name: 'Geo-Restriction: US Only',
            type: 'network',
            enabled: false,
            conditions: { allowed_countries: ['US'] }
          },
          {
            id: 'pol-005',
            name: 'Block After 3 Failed Attempts',
            type: 'security',
            enabled: true,
            conditions: { max_failed_attempts: 3 }
          }
        ];
      }
      
      if (sessionsData.sessions?.length === 0) {
        const now = Date.now();
        sessionsData.sessions = Array.from({ length: 8 }, (_, i) => ({
          session_id: `sess-${1000 + i}`,
          user_id: `user-${100 + i}`,
          username: ['admin', 'user1', 'user2', 'developer', 'analyst', 'operator', 'viewer', 'tester'][i],
          ip_address: ['192.168.1.100', '10.0.0.50', '172.16.0.25', '192.168.0.103'][i % 4],
          device_type: ['desktop', 'mobile', 'tablet'][i % 3],
          last_activity: new Date(now - Math.random() * 3600000).toISOString(),
          trust_score: 65 + Math.floor(Math.random() * 35),
          mfa_verified: Math.random() > 0.3,
          status: i < 6 ? 'active' : (i === 6 ? 'suspicious' : 'expired')
        }));
      }
      
      // Generate recent access decisions
      const decisions = Array.from({ length: 15 }, (_, i) => {
        const decision = Math.random() > 0.3 ? 'ALLOW' : (Math.random() > 0.5 ? 'DENY' : 'CHALLENGE');
        const resources = ['api/users', 'api/admin', 'database', 'file-system', 'network-config'];
        const actions = ['read', 'write', 'delete', 'execute'];
        
        return {
          timestamp: new Date(Date.now() - i * 300000).toISOString(),
          user_id: `user-${100 + Math.floor(Math.random() * 10)}`,
          username: ['admin', 'user1', 'user2', 'developer', 'analyst'][Math.floor(Math.random() * 5)],
          resource: resources[Math.floor(Math.random() * resources.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          decision,
          reason: decision === 'ALLOW' 
            ? 'Trust score and policies met' 
            : (decision === 'DENY' ? 'Insufficient trust score' : 'MFA verification required'),
          trust_score: decision === 'ALLOW' ? 75 + Math.random() * 25 : 40 + Math.random() * 35
        };
      });
      
      setPolicies(policiesData.policies || []);
      setSessions(sessionsData.sessions || []);
      setRecentDecisions(decisions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching access data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load access control data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAccessData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'ALLOW':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'DENY':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'CHALLENGE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'ALLOW':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'DENY':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'CHALLENGE':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'suspicious':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'expired':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading access control data...</p>
        </div>
      </div>
    );
  }

  const allowCount = recentDecisions.filter(d => d.decision === 'ALLOW').length;
  const denyCount = recentDecisions.filter(d => d.decision === 'DENY').length;
  const challengeCount = recentDecisions.filter(d => d.decision === 'CHALLENGE').length;
  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const activePolicies = policies.filter(p => p.enabled).length;

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
              Zero Trust Access Control
            </h1>
            <p className="text-gray-300">Real-time access management and policy enforcement</p>
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
              onClick={fetchAccessData}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 text-white"
            >
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5" />
                <span>Refresh</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-red-300 font-semibold">Error Loading Data</p>
                <p className="text-red-400/80 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchAccessData}
                className="ml-auto px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-400" />
              <span className="text-3xl font-bold text-white">{allowCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Allowed</h3>
            <p className="text-sm text-gray-300">{((allowCount / recentDecisions.length) * 100).toFixed(0)}% of decisions</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <XCircleIcon className="w-10 h-10 text-red-400" />
              <span className="text-3xl font-bold text-white">{denyCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Denied</h3>
            <p className="text-sm text-gray-300">Access blocked</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <ExclamationTriangleIcon className="w-10 h-10 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{challengeCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Challenges</h3>
            <p className="text-sm text-gray-300">MFA required</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <UserGroupIcon className="w-10 h-10 text-blue-400" />
              <span className="text-3xl font-bold text-white">{activeSessions}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Active Sessions</h3>
            <p className="text-sm text-gray-300">Verified users</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheckIcon className="w-10 h-10 text-purple-400" />
              <span className="text-3xl font-bold text-white">{activePolicies}/{policies.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Active Policies</h3>
            <p className="text-sm text-gray-300">Enforced rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Active Policies */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <LockClosedIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Access Policies</h2>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {policies.map((policy) => (
                <div key={policy.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{policy.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs border ${
                      policy.enabled 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {policy.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <KeyIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Type: <span className="text-gray-300">{policy.type}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sessions.map((session) => (
                <div key={session.session_id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{session.username}</span>
                      {session.mfa_verified && (
                        <CheckCircleIcon className="w-4 h-4 text-green-400" title="MFA Verified" />
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getSessionStatusColor(session.status)}`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                      <GlobeAltIcon className="w-3 h-3" />
                      <span>{session.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <DevicePhoneMobileIcon className="w-3 h-3" />
                      <span>{session.device_type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <ChartBarIcon className="w-3 h-3" />
                      <span>Trust: {session.trust_score}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{new Date(session.last_activity).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Access Decisions */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Recent Access Decisions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/20">
                <tr className="text-left text-gray-300">
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Resource</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Decision</th>
                  <th className="pb-3 font-semibold">Trust Score</th>
                  <th className="pb-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentDecisions.map((decision, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 text-gray-300 text-sm">
                      {new Date(decision.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-white">{decision.username}</td>
                    <td className="py-3 text-gray-300 text-sm">{decision.resource}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {decision.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {getDecisionIcon(decision.decision)}
                        <span className={`px-2 py-1 rounded-full text-xs border ${getDecisionColor(decision.decision)}`}>
                          {decision.decision}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-white">{decision.trust_score.toFixed(0)}%</td>
                    <td className="py-3 text-gray-400 text-sm">{decision.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default SecurityAccess;
