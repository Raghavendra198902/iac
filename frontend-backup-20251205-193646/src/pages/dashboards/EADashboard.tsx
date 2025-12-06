import { useState, useEffect } from 'react';
import { Shield, FileText, Users, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, ArrowRight, Brain, Cloud, Lock, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import PageTransition from '../../components/ui/PageTransition';
import FadeIn from '../../components/ui/FadeIn';
import ChartCard from '../../components/ui/ChartCard';
import AIRecommendationsPanel from '../../components/AIRecommendationsPanel';

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
      name: 'AI Governance Score',
      value: '92%',
      change: '+5%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      name: 'Multi-Cloud Compliance',
      value: '89%',
      change: '+4%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Cloud,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Policy Compliance',
      value: '94%',
      change: '+3%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Shield,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Pattern Adoption',
      value: '78%',
      change: '+12%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Active Architects',
      value: '24',
      change: '+2',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Security Posture',
      value: '87/100',
      change: '+3',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Lock,
      color: 'from-red-500 to-red-600',
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

  // Load real data from APIs - no demo data
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [patternAdoptionData, setPatternAdoptionData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [complianceRes, adoptionRes] = await Promise.all([
          fetch('/api/ea/compliance'),
          fetch('/api/ea/pattern-adoption')
        ]);
        if (complianceRes.ok) setComplianceData(await complianceRes.json());
        if (adoptionRes.ok) setPatternAdoptionData(await adoptionRes.json());
      } catch (error) {
        console.error('Failed to load EA dashboard data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
        {/* Hero Section */}
        <FadeIn>
          <div className="rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-teal-800 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    Enterprise Architect Dashboard
                    <Shield className="w-8 h-8" />
                  </h1>
                  <p className="text-green-100 mt-2 text-lg">
                    Governance, Standards & Strategic Architecture
                  </p>
                </div>
                <Link
                  to="/governance/policies"
                  className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 group shadow-lg"
                >
                  <Shield className="w-5 h-5" />
                  Manage Policies
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/governance/policies"
            className="card p-6 hover:shadow-xl transition-all group border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Governance & Policies</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage policies & compliance</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          
          <Link
            to="/ea/functions"
            className="card p-6 hover:shadow-xl transition-all group border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">EA Functions & Roles</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View responsibilities & metrics</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          
          <Link
            to="/architecture/framework"
            className="card p-6 hover:shadow-xl transition-all group border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900 group-hover:scale-110 transition-transform">
                <GitBranch className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">EA/SA/TA Framework</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Architecture methodology</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          
          <Link
            to="/guardrails"
            className="card p-6 hover:shadow-xl transition-all group border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Guardrails Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure security rules</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Governance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {governanceMetrics.map((metric, idx) => (
            <FadeIn key={metric.name} delay={idx * 100}>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="card p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{metric.name}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-1 mt-3">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-semibold ${
                          metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                      <metric.icon className="w-7 h-7 text-white" />
                    </div>
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

        {/* Multi-Cloud Governance Intelligence */}
        <FadeIn delay={300}>
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Multi-Cloud Governance</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Policy compliance across cloud providers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">AWS</span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Compliant</span>
                </div>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">93%</p>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">18 policies enforced</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Azure</span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Warning</span>
                </div>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">87%</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">15 policies enforced</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-red-900 dark:text-red-300">GCP</span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Compliant</span>
                </div>
                <p className="text-3xl font-bold text-red-900 dark:text-red-300">91%</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-2">12 policies enforced</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* AI-Powered Architecture Recommendations */}
        <FadeIn delay={350}>
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI-Powered Architecture Insights</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Machine learning recommendations for governance improvements</p>
              </div>
            </div>
            <AIRecommendationsPanel />
          </div>
        </FadeIn>

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
    </MainLayout>
  );
}
