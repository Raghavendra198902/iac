import { useState, useEffect } from 'react';
import { CheckSquare, DollarSign, Clock, TrendingUp, TrendingDown, Calendar, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import PageTransition from '../../components/ui/PageTransition';
import FadeIn from '../../components/ui/FadeIn';
import ChartCard from '../../components/ui/ChartCard';

/**
 * Project Manager (PM) Dashboard
 * 
 * Responsibilities:
 * - Project oversight & KPIs
 * - Deployment approvals
 * - Cost management & budget tracking
 * - Migration planning & scheduling
 * - Resource allocation
 */
export default function PMDashboard() {
  const projectMetrics = [
    {
      name: 'Active Projects',
      value: '12',
      change: '+2',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Budget Utilization',
      value: '78%',
      change: '+5%',
      changeType: 'neutral' as const,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Pending Approvals',
      value: '8',
      change: '-3',
      changeType: 'positive' as const,
      trend: 'down' as const,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
    },
    {
      name: 'On-Time Delivery',
      value: '94%',
      change: '+6%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      type: 'Deployment',
      projectName: 'E-Commerce Platform',
      requestedBy: 'Michael Chen (TA)',
      requestedAt: '2 hours ago',
      estimatedCost: '$3,200/mo',
      risk: 'Medium',
      resources: 47,
      timeline: '3 weeks',
    },
    {
      id: '2',
      type: 'Budget Increase',
      projectName: 'Data Analytics Pipeline',
      requestedBy: 'Sarah Liu (SA)',
      requestedAt: '5 hours ago',
      estimatedCost: '+$1,500/mo',
      risk: 'Low',
      resources: 12,
      timeline: '1 week',
    },
    {
      id: '3',
      type: 'Migration',
      projectName: 'Legacy System Migration',
      requestedBy: 'James Torres (SE)',
      requestedAt: '1 day ago',
      estimatedCost: '$8,900 one-time',
      risk: 'High',
      resources: 85,
      timeline: '6 weeks',
    },
  ];

  const projectPortfolio = [
    {
      name: 'E-Commerce Platform',
      status: 'In Progress',
      progress: 75,
      budget: 45000,
      spent: 32000,
      variance: -2000,
      timeline: 'On Track',
      team: 8,
      nextMilestone: 'Production Deploy',
      daysToMilestone: 12,
    },
    {
      name: 'Data Analytics Pipeline',
      status: 'In Progress',
      progress: 60,
      budget: 28000,
      spent: 18500,
      variance: 1500,
      timeline: 'Ahead',
      team: 5,
      nextMilestone: 'UAT Testing',
      daysToMilestone: 8,
    },
    {
      name: 'IoT Backend Infrastructure',
      status: 'Planning',
      progress: 25,
      budget: 52000,
      spent: 8000,
      variance: 0,
      timeline: 'At Risk',
      team: 6,
      nextMilestone: 'Design Review',
      daysToMilestone: 5,
    },
  ];

  const costBreakdown = [
    { category: 'Compute', current: 12500, budgeted: 15000, variance: 2500 },
    { category: 'Storage', current: 8200, budgeted: 10000, variance: 1800 },
    { category: 'Networking', current: 5800, budgeted: 6000, variance: 200 },
    { category: 'Database', current: 9500, budgeted: 8500, variance: -1000 },
    { category: 'Security', current: 4200, budgeted: 5000, variance: 800 },
  ];

  const migrationSchedule = [
    {
      id: '1',
      name: 'Phase 1: Web Tier',
      startDate: '2025-11-20',
      endDate: '2025-12-05',
      status: 'Scheduled',
      systems: 12,
      complexity: 'Medium',
    },
    {
      id: '2',
      name: 'Phase 2: Application Tier',
      startDate: '2025-12-06',
      endDate: '2025-12-20',
      status: 'Pending Approval',
      systems: 24,
      complexity: 'High',
    },
    {
      id: '3',
      name: 'Phase 3: Data Tier',
      startDate: '2026-01-05',
      endDate: '2026-01-25',
      status: 'Planning',
      systems: 8,
      complexity: 'High',
    },
  ];

  // Load real data from APIs - no demo data
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [deliveryData, setDeliveryData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgetRes, deliveryRes] = await Promise.all([
          fetch('/api/pm/budget'),
          fetch('/api/pm/delivery')
        ]);
        if (budgetRes.ok) setBudgetData(await budgetRes.json());
        if (deliveryRes.ok) setDeliveryData(await deliveryRes.json());
      } catch (error) {
        console.error('Failed to load PM dashboard data:', error);
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
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    Project Manager Dashboard
                    <CheckSquare className="w-8 h-8" />
                  </h1>
                  <p className="text-indigo-100 mt-2 text-lg">
                    Project Oversight, Approvals & Cost Management
                  </p>
                </div>
                <Link
                  to="/projects/new"
                  className="bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 group shadow-lg"
                >
                  <CheckSquare className="w-5 h-5" />
                  New Project
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Project Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectMetrics.map((metric, idx) => (
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
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        <span className={`text-sm font-semibold ${
                          metric.changeType === 'positive' ? 'text-green-600' : 'text-orange-600'
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
            title="Budget vs Actual Spend"
            data={budgetData}
            dataKey="actual"
            color="#3b82f6"
          />
          <ChartCard
            title="On-Time Delivery Rate"
            data={deliveryData}
            dataKey="value"
            color="#10b981"
          />
        </div>

        {/* Pending Approvals */}
        <FadeIn delay={200}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pending Approvals
                </h2>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded-full text-sm font-medium">
                  {pendingApprovals.length} Awaiting Review
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          approval.type === 'Deployment'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                            : approval.type === 'Budget Increase'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                        }`}>
                          {approval.type}
                        </span>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {approval.projectName}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          approval.risk === 'High'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : approval.risk === 'Medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        }`}>
                          Risk: {approval.risk}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="block text-xs text-gray-500">Requested By</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{approval.requestedBy}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Cost Impact</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{approval.estimatedCost}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Resources</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{approval.resources}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Timeline</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{approval.timeline}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        Requested {approval.requestedAt}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Reject
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

        {/* Project Portfolio */}
        <FadeIn delay={300}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Project Portfolio
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {projectPortfolio.map((project) => (
                <div key={project.name} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                          {project.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === 'In Progress'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.timeline === 'On Track'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : project.timeline === 'Ahead'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        }`}>
                          {project.timeline}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        {project.team} team members
                        <span className="mx-2">•</span>
                        <Calendar className="w-4 h-4" />
                        Next: {project.nextMilestone} ({project.daysToMilestone} days)
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget Information */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="block text-xs text-gray-500">Budget</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Spent</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${project.spent.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Remaining</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${(project.budget - project.spent).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Variance</span>
                      <span className={`font-medium ${
                        project.variance >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {project.variance >= 0 ? '+' : ''}${Math.abs(project.variance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Cost Breakdown & Migration Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <FadeIn delay={400}>
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Cost Breakdown
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {costBreakdown.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {category.category}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          ${category.current.toLocaleString()} / ${category.budgeted.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            category.current > category.budgeted
                              ? 'bg-red-600'
                              : category.variance < 500
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min((category.current / category.budgeted) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {((category.current / category.budgeted) * 100).toFixed(0)}% utilized
                        </span>
                        <span className={`text-xs font-medium ${
                          category.variance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.variance >= 0 ? '+' : ''}${Math.abs(category.variance).toLocaleString()} variance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Migration Schedule */}
          <FadeIn delay={500}>
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Migration Schedule
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {migrationSchedule.map((phase) => (
                    <div key={phase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{phase.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          phase.status === 'Scheduled'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : phase.status === 'Pending Approval'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {phase.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div>
                          <span className="block text-xs text-gray-500">Timeline</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Systems</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{phase.systems}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          phase.complexity === 'High'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          Complexity: {phase.complexity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
    </MainLayout>
  );
}
