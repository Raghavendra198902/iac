import { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, CheckCircle, Activity,
  RefreshCw, Download, Search, TrendingUp, TrendingDown,
  Minus, Target, AlertCircle, XCircle, Info, Zap
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import type {
  SecurityThreat,
  ComplianceCheck,
  SecurityMetric,
  VulnerabilityScan,
  SecurityEvent,
  SecurityStats,
  SecurityLevel,
  ThreatCategory
} from '../types/security';

export default function SecurityCenter() {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [compliance, setCompliance] = useState<ComplianceCheck[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [scans, setScans] = useState<VulnerabilityScan[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats] = useState<SecurityStats>({
    totalThreats: 23,
    activeIncidents: 5,
    complianceScore: 87,
    vulnerabilitiesPatched: 156,
    lastScanTime: new Date().toISOString(),
    securityScore: 92
  });
  const [selectedSeverity, setSelectedSeverity] = useState<SecurityLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ThreatCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, [selectedSeverity, selectedCategory]);

  const loadSecurityData = () => {
    // Security Threats
    const mockThreats: SecurityThreat[] = [
      {
        id: '1',
        title: 'Unencrypted S3 Bucket Detected',
        description: 'S3 bucket "prod-customer-data" lacks server-side encryption',
        severity: 'critical',
        category: 'data-exposure',
        affectedResources: ['s3://prod-customer-data'],
        detectedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: 'open',
        estimatedImpact: 'High - 2.3M records at risk',
        remediation: 'Enable AES-256 encryption on bucket'
      },
      {
        id: '2',
        title: 'Security Group with Unrestricted SSH Access',
        description: 'Security group allows SSH (port 22) from 0.0.0.0/0',
        severity: 'high',
        category: 'misconfiguration',
        affectedResources: ['sg-0abc123def456', 'sg-0xyz789ghi012'],
        detectedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        status: 'in-progress',
        estimatedImpact: 'Medium - 12 EC2 instances exposed',
        remediation: 'Restrict SSH access to corporate IP ranges'
      },
      {
        id: '3',
        title: 'Critical CVE in Docker Image',
        description: 'Container image contains CVE-2024-1234 (Log4Shell variant)',
        severity: 'critical',
        category: 'vulnerability',
        affectedResources: ['nginx:1.19', 'app-backend:v2.3.1'],
        detectedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        status: 'open',
        cveId: 'CVE-2024-1234',
        cvssScore: 9.8,
        estimatedImpact: 'Critical - Remote code execution possible',
        remediation: 'Update to patched version 1.20 or higher'
      },
      {
        id: '4',
        title: 'Weak IAM Policy Detected',
        description: 'IAM policy grants * permissions on all resources',
        severity: 'high',
        category: 'access-control',
        affectedResources: ['iam-policy-admin-legacy'],
        detectedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        status: 'open',
        estimatedImpact: 'High - Excessive privileges',
        remediation: 'Implement least-privilege policies'
      },
      {
        id: '5',
        title: 'Outdated TLS Version',
        description: 'Load balancer supports TLS 1.0/1.1',
        severity: 'medium',
        category: 'misconfiguration',
        affectedResources: ['alb-prod-web'],
        detectedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        status: 'resolved',
        estimatedImpact: 'Low - Compliance issue',
        remediation: 'Update to TLS 1.2+ only'
      }
    ];

    // Compliance Checks
    const mockCompliance: ComplianceCheck[] = [
      {
        id: '1',
        framework: 'SOC2',
        controlId: 'CC6.1',
        title: 'Logical Access Controls',
        description: 'System implements logical access security measures',
        status: 'passed',
        severity: 'high',
        lastChecked: new Date().toISOString(),
        resources: 45,
        passed: 45,
        failed: 0
      },
      {
        id: '2',
        framework: 'ISO27001',
        controlId: 'A.9.2.3',
        title: 'Management of Privileged Access Rights',
        description: 'Privileged access rights are properly managed',
        status: 'warning',
        severity: 'high',
        lastChecked: new Date().toISOString(),
        resources: 23,
        passed: 20,
        failed: 3
      },
      {
        id: '3',
        framework: 'PCI-DSS',
        controlId: '3.4',
        title: 'Render PAN Unreadable',
        description: 'Primary Account Numbers must be encrypted',
        status: 'failed',
        severity: 'critical',
        lastChecked: new Date().toISOString(),
        resources: 8,
        passed: 5,
        failed: 3
      },
      {
        id: '4',
        framework: 'GDPR',
        controlId: 'Art.32',
        title: 'Security of Processing',
        description: 'Appropriate technical measures for data security',
        status: 'passed',
        severity: 'high',
        lastChecked: new Date().toISOString(),
        resources: 67,
        passed: 67,
        failed: 0
      },
      {
        id: '5',
        framework: 'CIS',
        controlId: '4.1',
        title: 'Enable Multi-Factor Authentication',
        description: 'MFA enabled for all privileged users',
        status: 'warning',
        severity: 'high',
        lastChecked: new Date().toISOString(),
        resources: 34,
        passed: 30,
        failed: 4
      }
    ];

    // Security Metrics
    const mockMetrics: SecurityMetric[] = [
      {
        id: '1',
        name: 'Mean Time to Detect',
        value: 2.3,
        unit: 'hours',
        trend: 'down',
        change: -15,
        status: 'good',
        threshold: 4
      },
      {
        id: '2',
        name: 'Mean Time to Respond',
        value: 4.7,
        unit: 'hours',
        trend: 'down',
        change: -22,
        status: 'good',
        threshold: 8
      },
      {
        id: '3',
        name: 'Active Vulnerabilities',
        value: 23,
        unit: 'findings',
        trend: 'up',
        change: 8,
        status: 'warning',
        threshold: 15
      },
      {
        id: '4',
        name: 'Patch Compliance',
        value: 94,
        unit: '%',
        trend: 'up',
        change: 3,
        status: 'good',
        threshold: 90
      }
    ];

    // Vulnerability Scans
    const mockScans: VulnerabilityScan[] = [
      {
        id: '1',
        target: 'Production Infrastructure',
        scanType: 'infrastructure',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed',
        findings: { critical: 2, high: 5, medium: 12, low: 23, info: 45 }
      },
      {
        id: '2',
        target: 'Container Registry',
        scanType: 'container',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 3600000).toISOString(),
        status: 'completed',
        findings: { critical: 1, high: 3, medium: 8, low: 15, info: 22 }
      },
      {
        id: '3',
        target: 'Network Perimeter',
        scanType: 'network',
        startTime: new Date().toISOString(),
        status: 'running',
        findings: { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
      }
    ];

    // Recent Events
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        eventType: 'alert',
        severity: 'critical',
        resource: 's3://prod-customer-data',
        action: 'Unencrypted bucket detected',
        result: 'blocked',
        ipAddress: '10.0.1.45'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        eventType: 'login',
        severity: 'medium',
        user: 'admin@company.com',
        resource: 'AWS Console',
        action: 'Console login',
        result: 'success',
        ipAddress: '203.45.67.89'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        eventType: 'access',
        severity: 'high',
        user: 'service-account',
        resource: 'iam-policy-admin-legacy',
        action: 'Policy attachment',
        result: 'blocked',
        ipAddress: '10.0.2.12'
      }
    ];

    setThreats(mockThreats);
    setCompliance(mockCompliance);
    setMetrics(mockMetrics);
    setScans(mockScans);
    setEvents(mockEvents);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadSecurityData();
    setIsRefreshing(false);
  };

  const getSeverityColor = (severity: SecurityLevel) => {
    const colors = {
      critical: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      high: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
      medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      low: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      info: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    };
    return colors[severity];
  };

  const getSeverityIcon = (severity: SecurityLevel) => {
    const icons = {
      critical: XCircle,
      high: AlertTriangle,
      medium: AlertCircle,
      low: Info,
      info: Info
    };
    return icons[severity];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'error' | 'warning' | 'success' | 'gray' | 'info'> = {
      open: 'error',
      'in-progress': 'warning',
      resolved: 'success',
      'accepted-risk': 'gray',
      passed: 'success',
      failed: 'error',
      warning: 'warning',
      running: 'info',
      completed: 'success'
    };
    return variants[status] || 'gray';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSeverity = selectedSeverity === 'all' || threat.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'all' || threat.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-600" />
                Security Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time security monitoring and threat detection
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Stats Overview */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.securityScore}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Security Score</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalThreats}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Threats</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeIncidents}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Incidents</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.complianceScore}%</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Compliance</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.vulnerabilitiesPatched}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Patched</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Live</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Monitoring</p>
            </div>
          </div>
        </FadeIn>

        {/* Security Metrics */}
        <FadeIn delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Security Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric) => {
                const TrendIcon = getTrendIcon(metric.trend);
                return (
                  <div key={metric.id} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{metric.name}</h3>
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        metric.status === 'good' ? 'text-green-600 dark:text-green-400' : 
                        metric.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-red-600 dark:text-red-400'
                      }`}>
                        <TrendIcon className="w-3 h-3" />
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value} {metric.unit}
                    </p>
                    {metric.threshold && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Target: {metric.threshold} {metric.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vulnerability Scans */}
          <FadeIn delay={0.3}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Scans</h2>
              <div className="space-y-4">
                {scans.map((scan) => (
                  <div key={scan.id} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{scan.target}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{scan.scanType}</p>
                      </div>
                      <Badge variant={getStatusBadge(scan.status)}>{scan.status}</Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{scan.findings.critical}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{scan.findings.high}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">High</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{scan.findings.medium}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Medium</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{scan.findings.low}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Low</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{scan.findings.info}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Info</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Compliance Status */}
          <FadeIn delay={0.3}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Compliance Status</h2>
              <div className="space-y-3">
                {compliance.map((check) => (
                  <div key={check.id} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" size="sm">{check.framework}</Badge>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{check.controlId}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{check.title}</h3>
                      </div>
                      <Badge variant={getStatusBadge(check.status)}>{check.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{check.passed}/{check.resources} passed</span>
                      {check.failed > 0 && <span className="text-red-600 dark:text-red-400">• {check.failed} failed</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Threats List */}
        <FadeIn delay={0.4}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Threats</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search threats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as SecurityLevel | 'all')}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredThreats.map((threat) => {
                const SeverityIcon = getSeverityIcon(threat.severity);
                return (
                  <div key={threat.id} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(threat.severity)}`}>
                        <SeverityIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{threat.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{threat.description}</p>
                          </div>
                          <Badge variant={getStatusBadge(threat.status)}>{threat.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <span className={`font-medium ${getSeverityColor(threat.severity)}`}>
                            {threat.severity.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>{threat.category}</span>
                          <span>•</span>
                          <span>{threat.affectedResources.length} resources</span>
                          {threat.cvssScore && (
                            <>
                              <span>•</span>
                              <span>CVSS {threat.cvssScore}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Impact:</strong> {threat.estimatedImpact}
                        </div>
                        {threat.remediation && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            <strong>Remediation:</strong> {threat.remediation}
                          </div>
                        )}
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Remediate Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Recent Security Events */}
        <FadeIn delay={0.5}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Events</h2>
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">{event.action}</span>
                      <span className="text-gray-600 dark:text-gray-400">on</span>
                      <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{event.resource}</span>
                      {event.user && (
                        <>
                          <span className="text-gray-600 dark:text-gray-400">by</span>
                          <span className="text-gray-900 dark:text-white">{event.user}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      {event.ipAddress && (
                        <>
                          <span>•</span>
                          <span>{event.ipAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(event.result)}>{event.result}</Badge>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
    </MainLayout>
  );
}
