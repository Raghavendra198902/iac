import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle,
  Target, Zap, Download, RefreshCw,
  Database, Server, HardDrive, Network, BarChart3,
  Lightbulb, Clock, Minus
} from 'lucide-react';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import type {
  CostData,
  CostSummary,
  CostBreakdown,
  ResourceCost,
  OptimizationRecommendation,
  CostAlert,
  BudgetConfig,
  CostPeriod,
  CostCategory
} from '../types/cost';

export default function CostManagement() {
  const [summary, setSummary] = useState<CostSummary>({
    currentMonth: 24567,
    lastMonth: 26789,
    change: -2222,
    changePercent: -8.3,
    forecast: 23450,
    budget: 30000,
    budgetUsed: 81.9
  });
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [topResources, setTopResources] = useState<ResourceCost[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [budgets, setBudgets] = useState<BudgetConfig[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<CostPeriod>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<CostCategory | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCostData();
  }, [selectedPeriod, selectedCategory]);

  const loadCostData = () => {
    // Cost trend data
    const mockCostData: CostData[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 3600000).toISOString().split('T')[0],
      total: 750 + Math.random() * 200,
      compute: 300 + Math.random() * 100,
      storage: 150 + Math.random() * 50,
      network: 100 + Math.random() * 40,
      database: 120 + Math.random() * 60,
      analytics: 50 + Math.random() * 30,
      other: 30 + Math.random() * 20
    }));

    // Cost breakdown
    const mockBreakdown: CostBreakdown[] = [
      { category: 'compute', amount: 9845, percentage: 40, change: -5.2, trend: 'down' },
      { category: 'database', amount: 6145, percentage: 25, change: 3.1, trend: 'up' },
      { category: 'storage', amount: 4920, percentage: 20, change: -2.1, trend: 'down' },
      { category: 'network', amount: 2460, percentage: 10, change: 1.5, trend: 'up' },
      { category: 'analytics', amount: 984, percentage: 4, change: 0.2, trend: 'stable' },
      { category: 'other', amount: 213, percentage: 1, change: -0.5, trend: 'down' }
    ];

    // Top cost resources
    const mockResources: ResourceCost[] = [
      {
        id: '1',
        name: 'prod-db-cluster-primary',
        type: 'RDS PostgreSQL',
        provider: 'aws',
        category: 'database',
        monthlyCost: 2340,
        dailyCost: 78,
        utilizationRate: 87,
        tags: { env: 'production', team: 'platform' }
      },
      {
        id: '2',
        name: 'prod-eks-cluster',
        type: 'EKS Cluster',
        provider: 'aws',
        category: 'compute',
        monthlyCost: 1890,
        dailyCost: 63,
        utilizationRate: 65,
        tags: { env: 'production', team: 'engineering' }
      },
      {
        id: '3',
        name: 's3-data-lake-prod',
        type: 'S3 Storage',
        provider: 'aws',
        category: 'storage',
        monthlyCost: 1245,
        dailyCost: 41.5,
        utilizationRate: 92,
        tags: { env: 'production', team: 'data' }
      },
      {
        id: '4',
        name: 'cloudfront-cdn-global',
        type: 'CloudFront',
        provider: 'aws',
        category: 'network',
        monthlyCost: 987,
        dailyCost: 32.9,
        utilizationRate: 78,
        tags: { env: 'production', team: 'platform' }
      },
      {
        id: '5',
        name: 'redshift-analytics-cluster',
        type: 'Redshift',
        provider: 'aws',
        category: 'analytics',
        monthlyCost: 845,
        dailyCost: 28.2,
        utilizationRate: 54,
        tags: { env: 'production', team: 'analytics' }
      }
    ];

    // Optimization recommendations
    const mockRecommendations: OptimizationRecommendation[] = [
      {
        id: '1',
        title: 'Resize Underutilized RDS Instances',
        description: '3 RDS instances running at <40% CPU utilization can be downsized',
        priority: 'high',
        potentialSavings: 1240,
        savingsPercent: 35,
        effort: 'low',
        category: 'database',
        affectedResources: ['dev-db-1', 'staging-db-2', 'test-db-3'],
        implementationSteps: [
          'Create snapshot of current instances',
          'Test application with smaller instance types',
          'Schedule maintenance window',
          'Apply instance type changes'
        ],
        estimatedTime: '2 hours'
      },
      {
        id: '2',
        title: 'Enable S3 Intelligent-Tiering',
        description: 'Move infrequently accessed data to cheaper storage tiers automatically',
        priority: 'high',
        potentialSavings: 890,
        savingsPercent: 28,
        effort: 'low',
        category: 'storage',
        affectedResources: ['s3-logs-bucket', 's3-archive-bucket'],
        implementationSteps: [
          'Analyze access patterns for 30 days',
          'Enable Intelligent-Tiering on buckets',
          'Configure lifecycle policies',
          'Monitor savings over time'
        ],
        estimatedTime: '1 hour'
      },
      {
        id: '3',
        title: 'Purchase Reserved Instances',
        description: 'Commit to 1-year term for stable workloads to save up to 40%',
        priority: 'high',
        potentialSavings: 2450,
        savingsPercent: 40,
        effort: 'medium',
        category: 'compute',
        affectedResources: ['prod-app-servers'],
        implementationSteps: [
          'Identify steady-state workloads',
          'Calculate ROI for 1-year vs 3-year terms',
          'Purchase Reserved Instances',
          'Apply reservations to instances'
        ],
        estimatedTime: '4 hours'
      },
      {
        id: '4',
        title: 'Delete Unused EBS Volumes',
        description: '23 unattached EBS volumes found costing $340/month',
        priority: 'medium',
        potentialSavings: 340,
        savingsPercent: 100,
        effort: 'low',
        category: 'storage',
        affectedResources: ['vol-abc123', 'vol-def456', 'vol-ghi789'],
        implementationSteps: [
          'Create final snapshots',
          'Verify volumes are not needed',
          'Delete unattached volumes',
          'Update documentation'
        ],
        estimatedTime: '30 minutes'
      },
      {
        id: '5',
        title: 'Optimize Redshift Cluster Schedule',
        description: 'Pause analytics cluster during off-hours (8PM-6AM)',
        priority: 'medium',
        potentialSavings: 520,
        savingsPercent: 45,
        effort: 'medium',
        category: 'analytics',
        affectedResources: ['redshift-analytics-cluster'],
        implementationSteps: [
          'Identify usage patterns',
          'Configure pause/resume schedule',
          'Update ETL jobs timing',
          'Test automated scheduling'
        ],
        estimatedTime: '3 hours'
      }
    ];

    // Cost alerts
    const mockAlerts: CostAlert[] = [
      {
        id: '1',
        type: 'budget-exceeded',
        severity: 'critical',
        title: 'Monthly Budget Alert',
        message: 'You have exceeded 80% of your monthly budget',
        amount: 24567,
        threshold: 30000,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'anomaly-detected',
        severity: 'warning',
        title: 'Cost Anomaly Detected',
        message: 'Network costs are 45% higher than usual',
        amount: 1245,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        type: 'unused-resource',
        severity: 'info',
        title: 'Unused Resources Found',
        message: '12 idle EC2 instances running for >7 days',
        amount: 340,
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    // Budget configurations
    const mockBudgets: BudgetConfig[] = [
      {
        id: '1',
        name: 'Production Environment',
        amount: 20000,
        period: 'monthly',
        spent: 16450,
        remaining: 3550,
        alertThreshold: 80,
        categories: ['compute', 'database', 'network']
      },
      {
        id: '2',
        name: 'Development & Testing',
        amount: 5000,
        period: 'monthly',
        spent: 4120,
        remaining: 880,
        alertThreshold: 75,
        categories: ['compute', 'storage']
      },
      {
        id: '3',
        name: 'Data & Analytics',
        amount: 5000,
        period: 'monthly',
        spent: 3997,
        remaining: 1003,
        alertThreshold: 85,
        categories: ['analytics', 'storage']
      }
    ];

    setBreakdown(mockBreakdown);
    setTopResources(mockResources);
    setRecommendations(mockRecommendations);
    setAlerts(mockAlerts);
    setBudgets(mockBudgets);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadCostData();
    setIsRefreshing(false);
  };

  const getCategoryIcon = (category: CostCategory) => {
    const icons = {
      compute: Server,
      storage: HardDrive,
      network: Network,
      database: Database,
      analytics: BarChart3,
      other: Zap
    };
    return icons[category];
  };

  const getCategoryColor = (category: CostCategory) => {
    const colors = {
      compute: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      storage: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      network: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      database: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
      analytics: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20',
      other: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    };
    return colors[category];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  Cost Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track, analyze, and optimize your cloud spending
                </p>
              </div>
              <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as CostPeriod)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Cost Alerts */}
        {alerts.length > 0 && (
          <FadeIn delay={0.1}>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border flex items-start gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : alert.severity === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                    alert.severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                    alert.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}>
                    ${alert.amount.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Cost Summary Cards */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant={summary.changePercent < 0 ? 'success' : 'error'}>
                  {summary.changePercent > 0 ? '+' : ''}{summary.changePercent.toFixed(1)}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summary.currentMonth.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current Month</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                vs ${summary.lastMonth.toLocaleString()} last month
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="info">Forecast</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summary.forecast.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Next Month</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Based on current trends
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant={summary.budgetUsed > 80 ? 'error' : 'success'}>
                  {summary.budgetUsed.toFixed(0)}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summary.budget.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly Budget</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full ${summary.budgetUsed > 80 ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(summary.budgetUsed, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge variant="warning">{recommendations.length} Tips</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalPotentialSavings.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Potential Savings</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                From {recommendations.length} recommendations
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Cost Breakdown */}
        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cost Breakdown by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {breakdown.map((item) => {
                const CategoryIcon = getCategoryIcon(item.category);
                const TrendIcon = getTrendIcon(item.trend);
                return (
                  <div key={item.category} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          item.change < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <TrendIcon className="w-4 h-4" />
                          {Math.abs(item.change)}%
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{item.percentage}% of total</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{item.category}</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ${item.amount.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Cost Resources */}
          <FadeIn delay={0.4}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Cost Resources</h2>
              <div className="space-y-3">
                {topResources.map((resource) => {
                  const CategoryIcon = getCategoryIcon(resource.category);
                  return (
                    <div key={resource.id} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {resource.name}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{resource.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">${resource.monthlyCost}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">/month</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Utilization: {resource.utilizationRate}%</span>
                        <div className="flex gap-2">
                          {Object.entries(resource.tags).map(([key, value]) => (
                            <Badge key={key} variant="gray" size="sm">{key}: {value}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Budget Status */}
          <FadeIn delay={0.4}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Budget Status</h2>
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const percentage = (budget.spent / budget.amount) * 100;
                  const isOverThreshold = percentage >= budget.alertThreshold;
                  return (
                    <div key={budget.id} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{budget.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{budget.period}</p>
                        </div>
                        <Badge variant={isOverThreshold ? 'warning' : 'success'}>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Spent</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${budget.spent.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isOverThreshold ? 'bg-yellow-600' : 'bg-green-600'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Budget</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${budget.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Optimization Recommendations */}
        <FadeIn delay={0.5}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Optimization Recommendations</h2>
              <Badge variant="success">
                <Lightbulb className="w-3 h-3 mr-1" />
                Save ${totalPotentialSavings.toLocaleString()}/mo
              </Badge>
            </div>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            ${rec.potentialSavings}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {rec.savingsPercent}% savings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <Badge variant={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}>
                          {rec.priority} priority
                        </Badge>
                        <span>•</span>
                        <span>{rec.effort} effort</span>
                        <span>•</span>
                        <span>{rec.affectedResources.length} resources</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{rec.estimatedTime}</span>
                      </div>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Implement Recommendation
                      </button>
                    </div>
                  </div>
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
