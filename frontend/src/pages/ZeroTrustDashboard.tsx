import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import {
  Shield, Lock, Activity, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, TrendingUp, Users, Server, Eye, Key, Clock,
  Target, Fingerprint, Smartphone, Globe, BarChart3, Zap
} from 'lucide-react';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';

interface ComplianceMetric {
  score: number;
  total_policies: number;
  enforced_policies: number;
  status: string;
}

interface ComplianceData {
  overall_compliance_score: number;
  compliance_status: string;
  compliance_level: string;
  timestamp: string;
  metrics: {
    policy_compliance: ComplianceMetric;
    session_compliance: ComplianceMetric & { active_sessions: number; verified_sessions: number };
    trust_score_compliance: ComplianceMetric & { total_users: number; high_trust_users: number };
    mfa_compliance: ComplianceMetric & { mfa_required_policies: number };
    device_compliance: ComplianceMetric & { high_compliance_policies: number };
  };
  recommendations: string[];
  zero_trust_principles: {
    never_trust_always_verify: boolean;
    least_privilege_access: boolean;
    assume_breach: boolean;
    continuous_monitoring: boolean;
  };
}

interface TrustScoreData {
  user_id: string;
  username: string;
  trust_level: string;
  trust_score: number;
  device_trust: number;
  behavior_trust: number;
  mfa_enabled: boolean;
  last_verified: string;
}

export default function ZeroTrustDashboard() {
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [trustScores] = useState<TrustScoreData[]>([
    {
      user_id: '1',
      username: 'admin@iac.com',
      trust_level: 'HIGH',
      trust_score: 92,
      device_trust: 95,
      behavior_trust: 88,
      mfa_enabled: true,
      last_verified: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      user_id: '2',
      username: 'developer@iac.com',
      trust_level: 'MEDIUM',
      trust_score: 75,
      device_trust: 80,
      behavior_trust: 70,
      mfa_enabled: true,
      last_verified: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      user_id: '3',
      username: 'analyst@iac.com',
      trust_level: 'LOW',
      trust_score: 58,
      device_trust: 60,
      behavior_trust: 55,
      mfa_enabled: false,
      last_verified: new Date(Date.now() - 120 * 60000).toISOString()
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadComplianceData();
    const interval = setInterval(loadComplianceData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      setRefreshing(true);
      const protocol = window.location.protocol === 'https:' ? 'http:' : 'http:';
      const hostname = window.location.hostname;
      const response = await fetch(`${protocol}//${hostname}:8500/security/compliance`);
      
      if (response.ok) {
        const data = await response.json();
        setCompliance(data);
        setLastUpdate(new Date());
      } else {
        console.error('Failed to fetch compliance data:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getComplianceLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'LOW': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'CRITICAL': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'success';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'needs_attention': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading Zero Trust Security...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <FadeIn>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-500" />
                Zero Trust Security
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Never Trust, Always Verify - Continuous Security Monitoring
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button
                onClick={loadComplianceData}
                disabled={refreshing}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {compliance && (
            <>
              {/* Overall Compliance Score */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500 rounded-lg">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Overall Compliance Score
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Security posture assessment
                          </p>
                        </div>
                      </div>
                      <div className="flex items-end gap-4">
                        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                          {compliance.overall_compliance_score.toFixed(1)}%
                        </div>
                        <div className="mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getComplianceLevelColor(compliance.compliance_level)}`}>
                            {compliance.compliance_status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={compliance.overall_compliance_score} 
                        className="mt-4 h-3"
                        variant={
                          compliance.overall_compliance_score >= 90 ? 'success' :
                          compliance.overall_compliance_score >= 75 ? 'warning' : 'error'
                        }
                      />
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-2xl font-bold">+5.2%</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        vs last week
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Zero Trust Principles */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(compliance.zero_trust_principles).map(([key, value]) => (
                  <Card key={key} className={value ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        {value ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <Badge variant={value ? 'success' : 'error'}>
                          {value ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </h3>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Compliance Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Policy Compliance */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Policy Compliance
                        </h3>
                      </div>
                      {getStatusIcon(compliance.metrics.policy_compliance.status)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {compliance.metrics.policy_compliance.score.toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {compliance.metrics.policy_compliance.enforced_policies}/{compliance.metrics.policy_compliance.total_policies} policies
                        </span>
                      </div>
                      <Progress value={compliance.metrics.policy_compliance.score} />
                    </div>
                  </div>
                </Card>

                {/* Session Compliance */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Session Compliance
                        </h3>
                      </div>
                      {getStatusIcon(compliance.metrics.session_compliance.status)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {compliance.metrics.session_compliance.score.toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {compliance.metrics.session_compliance.verified_sessions}/{compliance.metrics.session_compliance.active_sessions} sessions
                        </span>
                      </div>
                      <Progress value={compliance.metrics.session_compliance.score} />
                    </div>
                  </div>
                </Card>

                {/* Trust Score Compliance */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Trust Scores
                        </h3>
                      </div>
                      {getStatusIcon(compliance.metrics.trust_score_compliance.status)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {compliance.metrics.trust_score_compliance.score.toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {compliance.metrics.trust_score_compliance.high_trust_users}/{compliance.metrics.trust_score_compliance.total_users} users
                        </span>
                      </div>
                      <Progress value={compliance.metrics.trust_score_compliance.score} />
                    </div>
                  </div>
                </Card>

                {/* MFA Compliance */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          MFA Coverage
                        </h3>
                      </div>
                      {getStatusIcon(compliance.metrics.mfa_compliance.status)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {compliance.metrics.mfa_compliance.score.toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {compliance.metrics.mfa_compliance.mfa_required_policies}/{compliance.metrics.mfa_compliance.total_policies} policies
                        </span>
                      </div>
                      <Progress value={compliance.metrics.mfa_compliance.score} />
                    </div>
                  </div>
                </Card>

                {/* Device Compliance */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Device Compliance
                        </h3>
                      </div>
                      {getStatusIcon(compliance.metrics.device_compliance.status)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {compliance.metrics.device_compliance.score.toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {compliance.metrics.device_compliance.high_compliance_policies}/{compliance.metrics.device_compliance.total_policies} policies
                        </span>
                      </div>
                      <Progress value={compliance.metrics.device_compliance.score} />
                    </div>
                  </div>
                </Card>

                {/* Compliance Status Summary */}
                <Card className="md:col-span-2 lg:col-span-1">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Status Overview
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(compliance.metrics).map(([key, metric]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {key.replace('_compliance', '').replace('_', ' ')}
                          </span>
                          <Badge variant={metric.status === 'compliant' ? 'success' : 'warning'}>
                            {metric.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* User Trust Scores */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Fingerprint className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      User Trust Scores
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {trustScores.map((user) => (
                      <div key={user.user_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {user.username}
                              </span>
                              <Badge variant={getTrustLevelColor(user.trust_level)}>
                                {user.trust_level}
                              </Badge>
                              {user.mfa_enabled && (
                                <Badge variant="info" className="text-xs">
                                  <Key className="w-3 h-3 mr-1" />
                                  MFA
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Trust: {user.trust_score}%</span>
                              <span>Device: {user.device_trust}%</span>
                              <span>Behavior: {user.behavior_trust}%</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(user.last_verified)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-32">
                          <Progress value={user.trust_score} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Recommendations */}
              {compliance.recommendations && compliance.recommendations.length > 0 && (
                <Card className="border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Security Recommendations
                      </h2>
                    </div>
                    <ul className="space-y-3">
                      {compliance.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </FadeIn>
    </MainLayout>
  );
}
