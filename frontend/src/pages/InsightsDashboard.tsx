import { useState, useEffect } from 'react';
import {
  Activity, DollarSign, Shield, CheckCircle,
  AlertTriangle, BarChart3, PieChart, LineChart, Clock, Filter,
  Download, RefreshCw, Server, Zap, Target, Award,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import { MainLayout } from '../components/layout';
import type {
  Metric,
  ChartData,
  TimeRange,
  MetricCategory,
  AnalyticsStats,
  Insight
} from '../types/analytics';

export default function InsightsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalResources: 456,
    totalCost: 24567,
    avgPerformance: 94.5,
    securityScore: 87,
    complianceRate: 92,
    deploymentSuccess: 98.5
  });
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedCategory]);

  const loadAnalytics = () => {
    // Metrics
    const mockMetrics: Metric[] = [
      {
        id: '1',
        name: 'Total Infrastructure Cost',
        category: 'cost',
        value: 24567,
        unit: 'USD/month',
        change: -8.5,
        changeType: 'decrease',
        trend: 'down',
        target: 20000
      },
      {
        id: '2',
        name: 'Resource Utilization',
        category: 'performance',
        value: 73.2,
        unit: '%',
        change: 5.3,
        changeType: 'increase',
        trend: 'up',
        threshold: { warning: 80, critical: 90 }
      },
      {
        id: '3',
        name: 'Security Score',
        category: 'security',
        value: 87,
        unit: '/100',
        change: 3,
        changeType: 'increase',
        trend: 'up',
        target: 95
      },
      {
        id: '4',
        name: 'Deployment Success Rate',
        category: 'deployment',
        value: 98.5,
        unit: '%',
        change: 0.2,
        changeType: 'increase',
        trend: 'stable',
        target: 99
      },
      {
        id: '5',
        name: 'Compliance Rate',
        category: 'compliance',
        value: 92,
        unit: '%',
        change: 2,
        changeType: 'increase',
        trend: 'up',
        target: 95
      },
      {
        id: '6',
        name: 'Active Resources',
        category: 'infrastructure',
        value: 456,
        unit: 'resources',
        change: 12,
        changeType: 'increase',
        trend: 'up'
      }
    ];

    // Charts
    const mockCharts: ChartData[] = [
      {
        id: 'cost-trend',
        title: 'Cost Trend (7 Days)',
        type: 'line',
        category: 'cost',
        data: [
          { label: 'Mon', value: 3200 },
          { label: 'Tue', value: 3400 },
          { label: 'Wed', value: 3100 },
          { label: 'Thu', value: 3300 },
          { label: 'Fri', value: 3500 },
          { label: 'Sat', value: 3000 },
          { label: 'Sun', value: 3450 }
        ],
        colors: ['#3B82F6']
      },
      {
        id: 'resource-distribution',
        title: 'Resource Distribution',
        type: 'pie',
        category: 'infrastructure',
        data: [
          { label: 'Compute', value: 145 },
          { label: 'Storage', value: 89 },
          { label: 'Database', value: 67 },
          { label: 'Networking', value: 98 },
          { label: 'Security', value: 57 }
        ],
        legend: ['Compute', 'Storage', 'Database', 'Networking', 'Security'],
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      },
      {
        id: 'deployment-frequency',
        title: 'Deployment Frequency',
        type: 'bar',
        category: 'deployment',
        data: [
          { label: 'Week 1', value: 23 },
          { label: 'Week 2', value: 31 },
          { label: 'Week 3', value: 28 },
          { label: 'Week 4', value: 35 }
        ],
        colors: ['#10B981']
      },
      {
        id: 'security-incidents',
        title: 'Security Incidents',
        type: 'area',
        category: 'security',
        data: [
          { label: 'Jan', value: 12 },
          { label: 'Feb', value: 8 },
          { label: 'Mar', value: 5 },
          { label: 'Apr', value: 3 },
          { label: 'May', value: 4 },
          { label: 'Jun', value: 2 }
        ],
        colors: ['#EF4444']
      }
    ];

    // Insights
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'recommendation',
        category: 'cost',
        title: 'Optimize Unused Resources',
        description: '23 EC2 instances have been idle for over 7 days. Consider downsizing or terminating.',
        impact: 'high',
        potentialSavings: 2340,
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'warning',
        category: 'security',
        title: 'Security Group Configuration',
        description: '5 security groups have overly permissive inbound rules (0.0.0.0/0).',
        impact: 'high',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'alert',
        category: 'compliance',
        title: 'Compliance Violation Detected',
        description: '3 S3 buckets are not encrypted at rest, violating compliance policy.',
        impact: 'high',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        type: 'recommendation',
        category: 'performance',
        title: 'Database Performance Optimization',
        description: 'RDS instances show potential for read replica scaling to improve query performance.',
        impact: 'medium',
        potentialSavings: 450,
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '5',
        type: 'info',
        category: 'deployment',
        title: 'Deployment Success Milestone',
        description: 'Achieved 98.5% deployment success rate this month, exceeding target.',
        impact: 'low',
        actionable: false,
        timestamp: new Date().toISOString()
      }
    ];

    setMetrics(mockMetrics);
    setCharts(mockCharts);
    setInsights(mockInsights);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadAnalytics();
    setIsRefreshing(false);
  };

  const getCategoryIcon = (category: MetricCategory) => {
    const icons = {
      infrastructure: Server,
      cost: DollarSign,
      performance: Activity,
      security: Shield,
      compliance: CheckCircle,
      deployment: Zap
    };
    return icons[category];
  };

  const getCategoryColor = (category: MetricCategory) => {
    const colors = {
      infrastructure: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      cost: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      performance: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      security: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      compliance: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20',
      deployment: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
    };
    return colors[category];
  };

  const getInsightIcon = (type: Insight['type']) => {
    const icons = {
      recommendation: Target,
      warning: AlertTriangle,
      alert: Shield,
      info: Activity
    };
    return icons[type];
  };

  const getInsightColor = (type: Insight['type']) => {
    const colors = {
      recommendation: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      warning: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      alert: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      info: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    };
    return colors[type];
  };

  const getTrendIcon = (trend: Metric['trend']) => {
    if (trend === 'up') return ArrowUp;
    if (trend === 'down') return ArrowDown;
    return Minus;
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const filteredCharts = selectedCategory === 'all'
    ? charts
    : charts.filter(c => c.category === selectedCategory);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Real-time analytics and business intelligence
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
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as MetricCategory | 'all')}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="cost">Cost</option>
                  <option value="performance">Performance</option>
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="deployment">Deployment</option>
                </select>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Overview */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="info">Active</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalResources}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Resources</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant="success">-8.5%</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalCost.toLocaleString()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly Cost</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="info">+5.3%</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgPerformance}%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Performance</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <Badge variant="info">+3%</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.securityScore}/100</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Security Score</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <Badge variant="info">+2%</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.complianceRate}%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Compliance Rate</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge variant="success">+0.2%</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.deploymentSuccess}%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Deploy Success</p>
            </div>
          </div>
        </FadeIn>

        {/* Key Metrics */}
        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric) => {
                const CategoryIcon = getCategoryIcon(metric.category);
                const TrendIcon = getTrendIcon(metric.trend);
                
                return (
                  <div key={metric.id} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(metric.category)}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        metric.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        <TrendIcon className="w-4 h-4" />
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{metric.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value.toLocaleString()} {metric.unit}
                    </p>
                    {metric.target && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Target: {metric.target} {metric.unit}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Charts */}
        <FadeIn delay={0.4}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCharts.map((chart) => (
              <div key={chart.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{chart.title}</h3>
                  <div className="flex items-center gap-2">
                    {chart.type === 'line' && <LineChart className="w-5 h-5 text-gray-400" />}
                    {chart.type === 'bar' && <BarChart3 className="w-5 h-5 text-gray-400" />}
                    {chart.type === 'pie' && <PieChart className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                
                {/* Simple chart visualization */}
                <div className="space-y-3">
                  {chart.data.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{point.label}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full flex items-center justify-end px-3 text-white text-sm font-medium rounded-full transition-all"
                          style={{
                            width: `${(point.value / Math.max(...chart.data.map(d => d.value))) * 100}%`,
                            backgroundColor: chart.colors?.[idx % chart.colors.length] || '#3B82F6'
                          }}
                        >
                          {point.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Insights */}
        <FadeIn delay={0.5}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered Insights</h2>
              <Badge variant="info">
                <Award className="w-3 h-3 mr-1" />
                {insights.length} Insights
              </Badge>
            </div>

            <div className="space-y-4">
              {insights.map((insight) => {
                const InsightIcon = getInsightIcon(insight.type);
                
                return (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-900/50">
                        <InsightIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'gray'}>
                              {insight.impact}
                            </Badge>
                          </div>
                        </div>
                        {insight.potentialSavings && (
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            Potential savings: ${insight.potentialSavings.toLocaleString()}/month
                          </p>
                        )}
                        {insight.actionable && (
                          <button className="mt-3 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
      </div>
    </MainLayout>
  );
}
