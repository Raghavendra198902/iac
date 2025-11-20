import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Settings, Filter } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Progress from '../components/ui/Progress';
import Alert from '../components/ui/Alert';

interface GuardrailRule {
  id: string;
  name: string;
  category: 'security' | 'compliance' | 'cost' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  violations: number;
}

interface Violation {
  id: string;
  rule: string;
  resource: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  status: 'open' | 'resolved' | 'suppressed';
}

const GuardrailsManagement = () => {
  const [rules] = useState<GuardrailRule[]>([
    {
      id: '1',
      name: 'Require encryption at rest',
      category: 'security',
      severity: 'critical',
      enabled: true,
      violations: 3,
    },
    {
      id: '2',
      name: 'Enforce IAM password policy',
      category: 'security',
      severity: 'high',
      enabled: true,
      violations: 0,
    },
    {
      id: '3',
      name: 'Check PCI DSS compliance',
      category: 'compliance',
      severity: 'critical',
      enabled: true,
      violations: 5,
    },
    {
      id: '4',
      name: 'Limit instance size',
      category: 'cost',
      severity: 'medium',
      enabled: true,
      violations: 2,
    },
    {
      id: '5',
      name: 'Monitor API rate limits',
      category: 'performance',
      severity: 'high',
      enabled: true,
      violations: 1,
    },
  ]);

  const [violations] = useState<Violation[]>([
    {
      id: '1',
      rule: 'Require encryption at rest',
      resource: 'aws_s3_bucket.data',
      severity: 'critical',
      message: 'S3 bucket does not have encryption enabled',
      timestamp: '2025-11-16T10:30:00Z',
      status: 'open',
    },
    {
      id: '2',
      rule: 'Check PCI DSS compliance',
      resource: 'aws_rds_instance.main',
      severity: 'critical',
      message: 'Database does not meet PCI DSS requirements',
      timestamp: '2025-11-16T09:15:00Z',
      status: 'open',
    },
    {
      id: '3',
      rule: 'Limit instance size',
      resource: 'aws_instance.worker',
      severity: 'medium',
      message: 'Instance size exceeds cost optimization threshold',
      timestamp: '2025-11-16T08:45:00Z',
      status: 'open',
    },
  ]);

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'text-red-600 dark:text-red-400';
      case 'compliance':
        return 'text-blue-600 dark:text-blue-400';
      case 'cost':
        return 'text-green-600 dark:text-green-400';
      case 'performance':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suppressed':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const totalViolations = violations.filter((v) => v.status === 'open').length;
  const criticalViolations = violations.filter(
    (v) => v.status === 'open' && v.severity === 'critical'
  ).length;
  const complianceScore = Math.round(
    ((rules.length - rules.reduce((acc, r) => acc + r.violations, 0)) / rules.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Guardrails Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Security, compliance, and governance rules
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure Rules
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {rules.length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open Violations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalViolations}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {criticalViolations}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {complianceScore}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Critical Violations Alert */}
      {criticalViolations > 0 && (
        <Alert variant="error" title={`${criticalViolations} Critical Violations`}>
          Immediate attention required for critical security and compliance issues
        </Alert>
      )}

      {/* Compliance Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Overall Compliance
        </h3>
        <Progress 
          value={complianceScore} 
          variant={complianceScore >= 80 ? 'success' : complianceScore >= 60 ? 'warning' : 'error'}
          showLabel 
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="violations">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <TabsList>
              <TabsTrigger value="violations">Violations ({totalViolations})</TabsTrigger>
              <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="violations">
            <div className="p-6">
              <div className="space-y-4">
                {violations
                  .filter((v) => v.status === 'open')
                  .map((violation) => (
                    <div
                      key={violation.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(violation.status)}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {violation.rule}
                            </h3>
                            <Badge variant={getSeverityVariant(violation.severity)}>
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {violation.message}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Resource: {violation.resource}</span>
                            <span>
                              {new Date(violation.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button className="btn btn-secondary btn-sm">
                            Suppress
                          </button>
                          <button className="btn btn-primary btn-sm">
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <div className="p-6">
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {rule.name}
                          </h3>
                          <Badge variant={getSeverityVariant(rule.severity)}>
                            {rule.severity}
                          </Badge>
                          <span className={`text-sm font-medium uppercase ${getCategoryColor(rule.category)}`}>
                            {rule.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Violations: {rule.violations}
                          </span>
                          <span
                            className={`font-medium ${
                              rule.enabled
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button className="btn btn-secondary btn-sm">
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${
                            rule.enabled ? 'btn-error' : 'btn-success'
                          }`}
                        >
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="p-6">
              <div className="space-y-4">
                {rules
                  .filter((r) => r.category === 'security')
                  .map((rule) => (
                    <div
                      key={rule.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={getSeverityVariant(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {rule.violations} violations
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="p-6">
              <div className="space-y-4">
                {rules
                  .filter((r) => r.category === 'compliance')
                  .map((rule) => (
                    <div
                      key={rule.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={getSeverityVariant(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {rule.violations} violations
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GuardrailsManagement;
