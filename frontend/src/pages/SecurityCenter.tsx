import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import {
  Shield, AlertTriangle, CheckCircle, Activity, RefreshCw, Download,
  Search, TrendingUp, TrendingDown, Target, AlertCircle, XCircle, Info,
  Zap, Lock, Eye, Brain, BarChart3, Clock, Server, Database, Cloud,
  FileWarning, Users, Key, Globe, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

interface SecurityThreat {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'data-exposure' | 'misconfiguration' | 'vulnerability' | 'access-control' | 'compliance';
  affectedResources: string[];
  detectedAt: string;
  status: 'open' | 'in-progress' | 'resolved';
  estimatedImpact?: string;
  remediation?: string;
  cveId?: string;
  cvssScore?: number;
}

interface ComplianceCheck {
  id: string;
  framework: string;
  control: string;
  status: 'passed' | 'failed' | 'warning';
  lastChecked: string;
  score: number;
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
}

interface VulnerabilityScan {
  id: string;
  target: string;
  scanType: 'infrastructure' | 'container' | 'network' | 'application';
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export default function SecurityCenter() {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [compliance, setCompliance] = useState<ComplianceCheck[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [scans, setScans] = useState<VulnerabilityScan[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('threats');
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 60000);
    return () => clearInterval(interval);
  }, [selectedSeverity, selectedCategory]);

  const loadSecurityData = async () => {
    setIsRefreshing(true);
    
    // Mock data - In production, fetch from real API
    const mockThreats: SecurityThreat[] = [
      {
        id: '1',
        title: 'Unencrypted S3 Bucket Detected',
        description: 'S3 bucket "prod-customer-data" lacks server-side encryption, exposing sensitive customer information.',
        severity: 'critical',
        category: 'data-exposure',
        affectedResources: ['s3://prod-customer-data', 's3://backup-customer-data'],
        detectedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: 'open',
        estimatedImpact: 'High - 2.3M customer records at risk of unauthorized access',
        remediation: 'Enable AES-256 encryption on bucket and enforce encryption policy via bucket policy'
      },
      {
        id: '2',
        title: 'Security Group with Unrestricted SSH Access',
        description: 'Multiple security groups allow SSH (port 22) access from 0.0.0.0/0, creating potential entry points.',
        severity: 'high',
        category: 'misconfiguration',
        affectedResources: ['sg-0abc123def456', 'sg-0xyz789ghi012', 'sg-0mno345pqr678'],
        detectedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        status: 'in-progress',
        estimatedImpact: 'Medium - 12 EC2 instances exposed to potential brute force attacks',
        remediation: 'Restrict SSH access to corporate IP ranges only (10.0.0.0/8) or use AWS Systems Manager Session Manager'
      },
      {
        id: '3',
        title: 'Critical CVE in Container Images',
        description: 'Container images contain CVE-2024-1234 (Log4Shell variant) with remote code execution capability.',
        severity: 'critical',
        category: 'vulnerability',
        affectedResources: ['nginx:1.19', 'app-backend:v2.3.1', 'app-frontend:v1.8.5'],
        detectedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        status: 'open',
        cveId: 'CVE-2024-1234',
        cvssScore: 9.8,
        estimatedImpact: 'Critical - Remote code execution vulnerability affecting production workloads',
        remediation: 'Update all affected images to patched versions: nginx:1.20+, app-backend:v2.4.0+, app-frontend:v1.9.0+'
      },
      {
        id: '4',
        title: 'Overly Permissive IAM Policy',
        description: 'IAM policy "admin-legacy" grants wildcard (*) permissions on all AWS resources.',
        severity: 'high',
        category: 'access-control',
        affectedResources: ['iam-policy-admin-legacy', 'iam-role-developer-full'],
        detectedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        status: 'open',
        estimatedImpact: 'High - Excessive privileges that violate principle of least privilege',
        remediation: 'Implement least-privilege policies with specific resource ARNs and required actions only'
      },
      {
        id: '5',
        title: 'Outdated TLS Version on Load Balancer',
        description: 'Application Load Balancer supports deprecated TLS 1.0 and 1.1 protocols.',
        severity: 'medium',
        category: 'compliance',
        affectedResources: ['alb-prod-api', 'alb-staging-web'],
        detectedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        status: 'resolved',
        estimatedImpact: 'Medium - Non-compliance with PCI DSS 3.2.1 and security best practices',
        remediation: 'Update ALB security policy to ELBSecurityPolicy-TLS-1-2-2017-01 or higher'
      },
      {
        id: '6',
        title: 'Missing MFA on Privileged Accounts',
        description: '5 administrator accounts lack multi-factor authentication protection.',
        severity: 'high',
        category: 'access-control',
        affectedResources: ['admin1@company.com', 'admin2@company.com', 'devops@company.com'],
        detectedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        status: 'open',
        estimatedImpact: 'High - Increased risk of account compromise and unauthorized access',
        remediation: 'Enforce MFA for all privileged accounts via IAM policy and user education'
      },
      {
        id: '7',
        title: 'Database Without Encryption at Rest',
        description: 'RDS instance lacks encryption at rest for sensitive data protection.',
        severity: 'critical',
        category: 'data-exposure',
        affectedResources: ['rds-prod-mysql-01', 'rds-analytics-postgres'],
        detectedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
        status: 'in-progress',
        estimatedImpact: 'Critical - Financial and customer data stored unencrypted',
        remediation: 'Create encrypted snapshot, restore to new encrypted instance, and migrate applications'
      }
    ];

    const mockCompliance: ComplianceCheck[] = [
      { id: '1', framework: 'PCI DSS 3.2.1', control: 'Requirement 2.3 - Encrypt admin access', status: 'passed', lastChecked: new Date().toISOString(), score: 100 },
      { id: '2', framework: 'PCI DSS 3.2.1', control: 'Requirement 8.3 - MFA for admin', status: 'failed', lastChecked: new Date().toISOString(), score: 60 },
      { id: '3', framework: 'SOC 2 Type II', control: 'CC6.1 - Logical access controls', status: 'passed', lastChecked: new Date().toISOString(), score: 95 },
      { id: '4', framework: 'SOC 2 Type II', control: 'CC6.7 - Transmission encryption', status: 'warning', lastChecked: new Date().toISOString(), score: 80 },
      { id: '5', framework: 'HIPAA', control: '164.312(a)(1) - Access controls', status: 'passed', lastChecked: new Date().toISOString(), score: 92 },
      { id: '6', framework: 'HIPAA', control: '164.312(e)(1) - Transmission security', status: 'passed', lastChecked: new Date().toISOString(), score: 98 },
      { id: '7', framework: 'GDPR', control: 'Art. 32 - Security of processing', status: 'warning', lastChecked: new Date().toISOString(), score: 75 },
      { id: '8', framework: 'ISO 27001', control: 'A.9.2.1 - User registration', status: 'passed', lastChecked: new Date().toISOString(), score: 100 }
    ];

    const mockMetrics: SecurityMetric[] = [
      { id: '1', name: 'Security Score', value: 87, unit: '%', trend: 'up', change: 5, status: 'good' },
      { id: '2', name: 'Active Incidents', value: 5, unit: 'events', trend: 'down', change: -3, status: 'warning' },
      { id: '3', name: 'Open Vulnerabilities', value: 23, unit: 'findings', trend: 'down', change: -8, status: 'warning' },
      { id: '4', name: 'Patch Compliance', value: 94, unit: '%', trend: 'up', change: 3, status: 'good' },
      { id: '5', name: 'Compliance Score', value: 89, unit: '%', trend: 'stable', change: 0, status: 'good' },
      { id: '6', name: 'Mean Time to Detect', value: 12, unit: 'min', trend: 'down', change: -5, status: 'good' }
    ];

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
      },
      {
        id: '4',
        target: 'Web Applications',
        scanType: 'application',
        startTime: new Date(Date.now() - 10800000).toISOString(),
        endTime: new Date(Date.now() - 7200000).toISOString(),
        status: 'completed',
        findings: { critical: 0, high: 2, medium: 7, low: 11, info: 18 }
      }
    ];

    setThreats(mockThreats);
    setCompliance(mockCompliance);
    setMetrics(mockMetrics);
    setScans(mockScans);
    setIsRefreshing(false);
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSeverity = selectedSeverity === 'all' || threat.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'all' || threat.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="error">Open</Badge>;
      case 'in-progress': return <Badge variant="warning">In Progress</Badge>;
      case 'resolved': return <Badge variant="success">Resolved</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data-exposure': return <Database className="w-4 h-4" />;
      case 'misconfiguration': return <Server className="w-4 h-4" />;
      case 'vulnerability': return <FileWarning className="w-4 h-4" />;
      case 'access-control': return <Key className="w-4 h-4" />;
      case 'compliance': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const criticalThreats = threats.filter(t => t.severity === 'critical' && t.status !== 'resolved').length;
  const highThreats = threats.filter(t => t.severity === 'high' && t.status !== 'resolved').length;
  const complianceScore = Math.round((compliance.filter(c => c.status === 'passed').length / compliance.length) * 100);

  return (
    <MainLayout>
      <FadeIn>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-500" />
                Security Center
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive security monitoring and threat management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={loadSecurityData}
                disabled={isRefreshing}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="primary" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.slice(0, 4).map((metric) => (
              <Card key={metric.id} className={
                metric.status === 'critical' ? 'border-red-300 dark:border-red-700' :
                metric.status === 'warning' ? 'border-yellow-300 dark:border-yellow-700' :
                'border-green-300 dark:border-green-700'
              }>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.name}
                    </span>
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.trend === 'up' && metric.change > 0 ? 'text-green-600 dark:text-green-400' :
                      metric.trend === 'down' && metric.change < 0 ? 'text-green-600 dark:text-green-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {getTrendIcon(metric.trend)}
                      <span>{Math.abs(metric.change)}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {metric.value}{metric.unit}
                  </div>
                  <Progress 
                    value={metric.unit === '%' ? metric.value : (metric.value / 100) * 100} 
                    className="h-2"
                    variant={
                      metric.status === 'good' ? 'success' :
                      metric.status === 'warning' ? 'warning' : 'error'
                    }
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Alert Banner */}
          {(criticalThreats > 0 || highThreats > 0) && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Immediate Action Required
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {criticalThreats} critical and {highThreats} high severity threats detected
                    </p>
                  </div>
                </div>
                <Button variant="error" size="sm">
                  View Threats
                </Button>
              </div>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="threats">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Threats ({threats.filter(t => t.status !== 'resolved').length})
              </TabsTrigger>
              <TabsTrigger value="compliance">
                <CheckCircle className="w-4 h-4 mr-2" />
                Compliance ({complianceScore}%)
              </TabsTrigger>
              <TabsTrigger value="scans">
                <Eye className="w-4 h-4 mr-2" />
                Scans ({scans.length})
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Threats Tab */}
            <TabsContent value="threats">
              <div className="space-y-4">
                {/* Filters */}
                <Card>
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search threats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Categories</option>
                        <option value="data-exposure">Data Exposure</option>
                        <option value="misconfiguration">Misconfiguration</option>
                        <option value="vulnerability">Vulnerability</option>
                        <option value="access-control">Access Control</option>
                        <option value="compliance">Compliance</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Threats List */}
                <div className="space-y-3">
                  {filteredThreats.map((threat) => (
                    <Card key={threat.id} className="hover:shadow-lg transition-shadow">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${
                              threat.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                              threat.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                              threat.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                              'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                              {getSeverityIcon(threat.severity)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {threat.title}
                                </h3>
                                <Badge variant={getSeverityColor(threat.severity)}>
                                  {threat.severity.toUpperCase()}
                                </Badge>
                                {getStatusBadge(threat.status)}
                                {threat.cveId && (
                                  <Badge variant="info" className="text-xs">
                                    {threat.cveId}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {threat.description}
                              </p>
                              
                              {expandedThreat === threat.id && (
                                <div className="mt-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                  {threat.estimatedImpact && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Estimated Impact
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {threat.estimatedImpact}
                                      </p>
                                    </div>
                                  )}
                                  {threat.remediation && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        Remediation Steps
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {threat.remediation}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                      <Server className="w-4 h-4" />
                                      Affected Resources ({threat.affectedResources.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {threat.affectedResources.map((resource, idx) => (
                                        <Badge key={idx} variant="default" className="text-xs font-mono">
                                          {resource}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  {getCategoryIcon(threat.category)}
                                  {threat.category.replace('-', ' ')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(threat.detectedAt).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Server className="w-4 h-4" />
                                  {threat.affectedResources.length} resources
                                </span>
                                {threat.cvssScore && (
                                  <span className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                                    CVSS {threat.cvssScore}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedThreat(expandedThreat === threat.id ? null : threat.id)}
                          >
                            {expandedThreat === threat.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance">
              <div className="space-y-4">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Compliance Overview
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Framework compliance status across your infrastructure
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                          {complianceScore}%
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Overall Score</p>
                      </div>
                    </div>
                    <Progress value={complianceScore} className="h-3 mb-6" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['PCI DSS 3.2.1', 'SOC 2 Type II', 'HIPAA', 'GDPR', 'ISO 27001'].map((framework) => {
                        const frameworkChecks = compliance.filter(c => c.framework === framework);
                        const passed = frameworkChecks.filter(c => c.status === 'passed').length;
                        const score = frameworkChecks.length > 0 ? Math.round((passed / frameworkChecks.length) * 100) : 0;
                        
                        return (
                          <div key={framework} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{framework}</h3>
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}%</span>
                            </div>
                            <Progress value={score} className="h-2 mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {passed}/{frameworkChecks.length} controls passed
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Control Status Details
                    </h3>
                    <div className="space-y-2">
                      {compliance.map((check) => (
                        <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {check.status === 'passed' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : check.status === 'warning' ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {check.control}
                                </span>
                                <Badge variant="default" className="text-xs">
                                  {check.framework}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Last checked: {new Date(check.lastChecked).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {check.score}%
                            </span>
                            <Badge variant={
                              check.status === 'passed' ? 'success' :
                              check.status === 'warning' ? 'warning' : 'error'
                            }>
                              {check.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Scans Tab */}
            <TabsContent value="scans">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {scans.map((scan) => (
                  <Card key={scan.id}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{scan.target}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{scan.scanType} scan</p>
                          </div>
                        </div>
                        <Badge variant={
                          scan.status === 'completed' ? 'success' :
                          scan.status === 'running' ? 'warning' : 'error'
                        }>
                          {scan.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Started:</span>
                          <span className="text-gray-900 dark:text-white">{new Date(scan.startTime).toLocaleString()}</span>
                        </div>
                        {scan.endTime && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                            <span className="text-gray-900 dark:text-white">{new Date(scan.endTime).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Findings</h4>
                        {Object.entries(scan.findings).map(([severity, count]) => (
                          <div key={severity} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                severity === 'critical' ? 'bg-red-500' :
                                severity === 'high' ? 'bg-orange-500' :
                                severity === 'medium' ? 'bg-yellow-500' :
                                severity === 'low' ? 'bg-blue-500' : 'bg-gray-500'
                              }`} />
                              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{severity}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                  <Card key={metric.id}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {metric.name}
                        </h3>
                        <div className={`flex items-center gap-1 text-sm ${
                          metric.trend === 'up' && metric.change > 0 ? 'text-green-600 dark:text-green-400' :
                          metric.trend === 'down' && metric.change < 0 ? 'text-green-600 dark:text-green-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {getTrendIcon(metric.trend)}
                          <span>{Math.abs(metric.change)}</span>
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {metric.value}{metric.unit}
                      </div>
                      <Progress 
                        value={metric.unit === '%' ? metric.value : (metric.value / 100) * 100} 
                        className="h-2"
                        variant={
                          metric.status === 'good' ? 'success' :
                          metric.status === 'warning' ? 'warning' : 'error'
                        }
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </FadeIn>
    </MainLayout>
  );
}
