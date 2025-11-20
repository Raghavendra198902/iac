import { Shield, FileText, Users, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/ui/PageTransition';
import FadeIn from '../../components/ui/FadeIn';
import ChartCard from '../../components/ui/ChartCard';

/**
 * Enterprise Architect (EA) Dashboard
 * 
 * Responsibilities:
 * - Governance & compliance oversight
 * - Pattern adoption & standardization
 * - Policy management (tenant-wide)
 * - Architecture review & approval
 * - Strategic technology decisions
 */
export default function EADashboard() {
  const governanceMetrics = [
    {
      name: 'Policy Compliance',
      value: '94%',
      change: '+3%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Shield,
    },
    {
      name: 'Pattern Adoption',
      value: '78%',
      change: '+12%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: FileText,
    },
    {
      name: 'Active Architects',
      value: '24',
      change: '+2',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Users,
    },
    {
      name: 'Governance Score',
      value: '8.7/10',
      change: '+0.3',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: TrendingUp,
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      type: 'Blueprint',
      name: 'Multi-Region E-Commerce Platform',
      submittedBy: 'Sarah Chen (SA)',
      submittedAt: '2 hours ago',
      complexity: 'High',
      riskLevel: 'Medium',
    },
    {
      id: '2',
      type: 'Policy Exception',
      name: 'Guardrail Override - Custom VPC Config',
      submittedBy: 'James Liu (TA)',
      submittedAt: '5 hours ago',
      complexity: 'Medium',
      riskLevel: 'High',
    },
    {
      id: '3',
      type: 'Pattern',
      name: 'New Serverless Pattern - Event-Driven',
      submittedBy: 'Michael Torres (SA)',
      submittedAt: '1 day ago',
      complexity: 'Medium',
      riskLevel: 'Low',
    },
  ];

  const patternLibrary = [
    { name: 'Microservices', usage: 45, status: 'Approved', version: 'v2.1' },
    { name: 'Serverless API', usage: 32, status: 'Approved', version: 'v1.8' },
    { name: 'Data Lake', usage: 18, status: 'Approved', version: 'v3.0' },
    { name: 'Event-Driven', usage: 12, status: 'Under Review', version: 'v1.0-rc' },
    { name: 'Edge Computing', usage: 8, status: 'Pilot', version: 'v0.9' },
  ];

  const complianceIssues = [
    {
      severity: 'High',
      count: 3,
      category: 'Security - Encryption at Rest',
      projects: ['Project Alpha', 'Project Beta'],
    },
    {
      severity: 'Medium',
      count: 7,
      category: 'Cost - Budget Threshold',
      projects: ['Project Gamma', 'Project Delta', 'Project Epsilon'],
    },
    {
      severity: 'Low',
      count: 12,
      category: 'Naming - Convention Violations',
      projects: ['Various'],
    },
  ];

  const technologyStackHealth = [
    { name: 'Cloud Providers', healthy: 3, total: 3, percentage: 100 },
    { name: 'Database Patterns', healthy: 8, total: 10, percentage: 80 },
    { name: 'Integration Patterns', healthy: 12, total: 15, percentage: 80 },
    { name: 'Security Controls', healthy: 24, total: 25, percentage: 96 },
  ];

  const complianceData = [
    { name: 'Jan', value: 88 },
    { name: 'Feb', value: 90 },
    { name: 'Mar', value: 89 },
    { name: 'Apr', value: 92 },
    { name: 'May', value: 93 },
    { name: 'Jun', value: 94 },
  ];

  const patternAdoptionData = [
    { name: 'Jan', value: 62 },
    { name: 'Feb', value: 65 },
    { name: 'Mar', value: 68 },
    { name: 'Apr', value: 72 },
    { name: 'May', value: 75 },
    { name: 'Jun', value: 78 },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Enterprise Architect Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Governance, Standards & Strategic Architecture
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/governance/policies"
                className="btn-primary"
              >
                Manage Policies
              </Link>
              <Link
                to="/patterns/library"
                className="btn-secondary"
              >
                Pattern Library
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Governance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {governanceMetrics.map((metric, idx) => (
            <FadeIn key={metric.name} delay={idx * 100}>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {metric.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                      )}
                      <span className={`text-sm ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    metric.changeType === 'positive' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <metric.icon className={`w-6 h-6 ${
                      metric.changeType === 'positive' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Policy Compliance Trend"
            data={complianceData}
            dataKey="value"
            color="#10b981"
          />
          <ChartCard
            title="Pattern Adoption Rate"
            data={patternAdoptionData}
            dataKey="value"
            color="#3b82f6"
          />
        </div>

        {/* Pending Approvals */}
        <FadeIn delay={200}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pending Architecture Reviews
                </h2>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                  {pendingApprovals.length} Pending
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs font-medium">
                          {approval.type}
                        </span>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {approval.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {approval.submittedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {approval.submittedAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          approval.complexity === 'High'
                            ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          Complexity: {approval.complexity}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          approval.riskLevel === 'High'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : approval.riskLevel === 'Medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        }`}>
                          Risk: {approval.riskLevel}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Pattern Library Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pattern Adoption */}
          <FadeIn delay={300}>
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pattern Library
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {patternLibrary.map((pattern) => (
                    <div key={pattern.name} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {pattern.name}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            pattern.status === 'Approved'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : pattern.status === 'Under Review'
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                          }`}>
                            {pattern.status}
                          </span>
                          <span className="text-xs text-gray-500">{pattern.version}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${pattern.usage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {pattern.usage}% adoption
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Compliance Issues */}
          <FadeIn delay={400}>
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Compliance Issues
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {complianceIssues.map((issue, idx) => (
                    <div key={idx} className="border-l-4 pl-4 py-2" style={{
                      borderColor: issue.severity === 'High' ? '#ef4444' : issue.severity === 'Medium' ? '#f59e0b' : '#10b981'
                    }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`w-4 h-4 ${
                              issue.severity === 'High' ? 'text-red-600' : 
                              issue.severity === 'Medium' ? 'text-yellow-600' : 
                              'text-green-600'
                            }`} />
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {issue.category}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {issue.count} violations across {issue.projects.join(', ')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          issue.severity === 'High'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : issue.severity === 'Medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Technology Stack Health */}
        <FadeIn delay={500}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Technology Stack Health
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {technologyStackHealth.map((stack) => (
                  <div key={stack.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{stack.name}</h3>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {stack.healthy}/{stack.total} ({stack.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stack.percentage >= 90 ? 'bg-green-600' : 
                            stack.percentage >= 70 ? 'bg-yellow-600' : 
                            'bg-red-600'
                          }`}
                          style={{ width: `${stack.percentage}%` }}
                        />
                      </div>
                      {stack.percentage >= 90 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
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
