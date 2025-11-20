import { Code2, Server, Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/ui/PageTransition';
import FadeIn from '../../components/ui/FadeIn';
import ChartCard from '../../components/ui/ChartCard';

/**
 * Technical Architect (TA) Dashboard
 * 
 * Responsibilities:
 * - IaC code generation & review
 * - Infrastructure deep-dive design
 * - Guardrails configuration & overrides
 * - Deployment planning
 * - Technical implementation details
 */
export default function TADashboard() {
  const technicalMetrics = [
    {
      name: 'IaC Generated',
      value: '127',
      change: '+23',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Code2,
    },
    {
      name: 'Deployments Planned',
      value: '34',
      change: '+8',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Server,
    },
    {
      name: 'Guardrail Pass Rate',
      value: '96%',
      change: '+4%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Shield,
    },
    {
      name: 'Code Quality Score',
      value: '9.2/10',
      change: '+0.3',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: CheckCircle2,
    },
  ];

  const iacQueue = [
    {
      id: '1',
      blueprint: 'Multi-Region E-Commerce',
      status: 'In Progress',
      provider: 'Terraform',
      cloud: 'AWS',
      resources: 67,
      completeness: 75,
      linesOfCode: 2340,
      lastGenerated: '30 mins ago',
    },
    {
      id: '2',
      blueprint: 'Kubernetes Cluster - AKS',
      status: 'Ready for Review',
      provider: 'Terraform',
      cloud: 'Azure',
      resources: 45,
      completeness: 95,
      linesOfCode: 1890,
      lastGenerated: '2 hours ago',
    },
    {
      id: '3',
      blueprint: 'Serverless API Gateway',
      status: 'Pending',
      provider: 'CloudFormation',
      cloud: 'AWS',
      resources: 28,
      completeness: 0,
      linesOfCode: 0,
      lastGenerated: '-',
    },
  ];

  const guardrailViolations = [
    {
      id: '1',
      severity: 'High',
      rule: 'Encryption at Rest Required',
      blueprint: 'E-Commerce Platform',
      resource: 'RDS Database Instance',
      recommendation: 'Enable encryption for rds_instance.main',
      autoFixable: true,
    },
    {
      id: '2',
      severity: 'Medium',
      rule: 'Public S3 Bucket Detected',
      blueprint: 'Data Analytics Pipeline',
      resource: 'S3 Bucket - logs-bucket',
      recommendation: 'Add bucket ACL and block public access',
      autoFixable: true,
    },
    {
      id: '3',
      severity: 'Low',
      rule: 'Naming Convention Violation',
      blueprint: 'IoT Backend',
      resource: 'EC2 Instance',
      recommendation: 'Rename to follow pattern: {env}-{service}-{region}',
      autoFixable: false,
    },
    {
      id: '4',
      severity: 'High',
      rule: 'No Backup Policy Configured',
      blueprint: 'E-Commerce Platform',
      resource: 'DynamoDB Table',
      recommendation: 'Enable point-in-time recovery',
      autoFixable: true,
    },
  ];

  const deploymentReadiness = [
    {
      name: 'E-Commerce Platform',
      status: 'Ready',
      preChecks: 12,
      passed: 12,
      warnings: 0,
      errors: 0,
      estimatedDuration: '45 mins',
    },
    {
      name: 'Data Analytics Pipeline',
      status: 'Warning',
      preChecks: 10,
      passed: 8,
      warnings: 2,
      errors: 0,
      estimatedDuration: '30 mins',
    },
    {
      name: 'IoT Backend',
      status: 'Blocked',
      preChecks: 15,
      passed: 10,
      warnings: 3,
      errors: 2,
      estimatedDuration: '1 hour',
    },
  ];

  const iacGenerationData = [
    { name: 'Week 1', value: 89 },
    { name: 'Week 2', value: 102 },
    { name: 'Week 3', value: 115 },
    { name: 'Week 4', value: 127 },
  ];

  const codeQualityData = [
    { name: 'Jan', value: 8.5 },
    { name: 'Feb', value: 8.7 },
    { name: 'Mar', value: 8.9 },
    { name: 'Apr', value: 9.0 },
    { name: 'May', value: 9.1 },
    { name: 'Jun', value: 9.2 },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Technical Architect Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                IaC Generation, Guardrails & Deployment Planning
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/iac"
                className="btn-primary flex items-center gap-2"
              >
                <Code2 className="w-4 h-4" />
                Generate IaC
              </Link>
              <Link
                to="/guardrails"
                className="btn-secondary flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Guardrails
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Technical Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technicalMetrics.map((metric, idx) => (
            <FadeIn key={metric.name} delay={idx * 100}>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {metric.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <metric.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="IaC Generation Trend"
            data={iacGenerationData}
            dataKey="value"
            color="#8b5cf6"
          />
          <ChartCard
            title="Code Quality Score"
            data={codeQualityData}
            dataKey="value"
            color="#10b981"
          />
        </div>

        {/* IaC Generation Queue */}
        <FadeIn delay={200}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  IaC Generation Queue
                </h2>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded-full text-sm font-medium">
                  {iacQueue.filter(i => i.status !== 'Ready for Review').length} Active
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {iacQueue.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {item.blueprint}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'Ready for Review'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : item.status === 'In Progress'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {item.status}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded text-xs font-medium">
                          {item.provider}
                        </span>
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded text-xs font-medium">
                          {item.cloud}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="block text-xs text-gray-500">Resources</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.resources}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Lines of Code</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {item.linesOfCode > 0 ? item.linesOfCode.toLocaleString() : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Completeness</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.completeness}%</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Last Generated</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.lastGenerated}</span>
                        </div>
                      </div>
                      {item.completeness > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${item.completeness}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {item.status === 'Pending' ? (
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Generate
                        </button>
                      ) : (
                        <>
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                            View Code
                          </button>
                          <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Guardrail Violations */}
        <FadeIn delay={300}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Guardrail Violations
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full text-sm font-medium">
                    {guardrailViolations.filter(v => v.severity === 'High').length} High
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                    {guardrailViolations.filter(v => v.severity === 'Medium').length} Medium
                  </span>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {guardrailViolations.map((violation) => (
                <div key={violation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          violation.severity === 'High'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : violation.severity === 'Medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                        }`}>
                          {violation.severity}
                        </span>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {violation.rule}
                        </h3>
                        {violation.autoFixable && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Auto-fixable
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <div><strong>Blueprint:</strong> {violation.blueprint}</div>
                        <div><strong>Resource:</strong> {violation.resource}</div>
                        <div className="mt-1 text-blue-600 dark:text-blue-400">
                          <strong>Recommendation:</strong> {violation.recommendation}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {violation.autoFixable ? (
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Auto-Fix
                        </button>
                      ) : (
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Override
                        </button>
                      )}
                      <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Deployment Readiness */}
        <FadeIn delay={400}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Deployment Readiness
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {deploymentReadiness.map((deployment) => (
                  <div key={deployment.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{deployment.name}</h3>
                      <div className="flex items-center gap-2">
                        {deployment.status === 'Ready' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : deployment.status === 'Warning' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          deployment.status === 'Ready'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : deployment.status === 'Warning'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        }`}>
                          {deployment.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="block text-xs text-gray-500">Pre-checks</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{deployment.preChecks}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Passed</span>
                        <span className="font-medium text-green-600">{deployment.passed}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Warnings</span>
                        <span className="font-medium text-yellow-600">{deployment.warnings}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Errors</span>
                        <span className="font-medium text-red-600">{deployment.errors}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Est. Duration</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{deployment.estimatedDuration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
