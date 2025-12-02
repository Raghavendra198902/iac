import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle,
  Target, Zap, Download, RefreshCw,
  Database, Server, HardDrive, Network, BarChart3,
  Lightbulb, Clock, Minus, Euro, IndianRupee, 
  PoundSterling, Coins, Activity, ArrowUpRight, ArrowDownRight, PieChart, Globe
} from 'lucide-react';
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

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';

const currencySymbols: Record<Currency, { symbol: string; icon: typeof DollarSign }> = {
  USD: { symbol: '$', icon: DollarSign },
  EUR: { symbol: '€', icon: Euro },
  GBP: { symbol: '£', icon: PoundSterling },
  INR: { symbol: '₹', icon: IndianRupee },
  JPY: { symbol: '¥', icon: Coins }
};

const exchangeRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 149.50
};

export default function CostManagement() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
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
    
    if (!autoRefresh) return;
    
    const interval = setInterval(loadCostData, refreshInterval);
    return () => clearInterval(interval);
  }, [selectedPeriod, selectedCategory, autoRefresh, refreshInterval]);

  const convertCurrency = (amount: number): number => {
    return amount * exchangeRates[currency];
  };

  const formatCurrency = (amount: number): string => {
    const converted = convertCurrency(amount);
    const { symbol } = currencySymbols[currency];
    
    if (currency === 'INR' || currency === 'JPY') {
      return `${symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
    
    return `${symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/5 via-cyan-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <motion.div 
                    className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <DollarSign className="w-8 h-8 text-white" />
                  </motion.div>
                  Cost Management & Analytics
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs sm:text-sm px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-normal flex items-center gap-1.5"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </motion.span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track, analyze, and optimize your cloud spending across all regions
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Currency Selector */}
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                >
                  {Object.entries(currencySymbols).map(([code, { symbol }]) => (
                    <option key={code} value={code}>{symbol} {code}</option>
                  ))}
                </motion.select>

                {/* Auto Refresh Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm ${
                    autoRefresh
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">{autoRefresh ? 'Auto' : 'Manual'}</span>
                </motion.button>

                {/* Period Selector */}
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as CostPeriod)}
                  className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </motion.select>

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: 180 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>

                {/* Export Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-all duration-300 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

        {/* Cost Alerts */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border backdrop-blur-xl flex items-start gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : alert.severity === 'warning'
                      ? 'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
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
                    {formatCurrency(alert.amount)}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg"
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex items-center gap-2">
                  {summary.changePercent < 0 ? (
                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-600" />
                  )}
                  <Badge variant={summary.changePercent < 0 ? 'success' : 'error'}>
                    {summary.changePercent > 0 ? '+' : ''}{summary.changePercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <motion.h3 
                key={`current-${currency}-${summary.currentMonth}`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                {formatCurrency(summary.currentMonth)}
              </motion.h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current Month</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                vs {formatCurrency(summary.lastMonth)} last month
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
                <Badge variant="info">Forecast</Badge>
              </div>
              <motion.h3 
                key={`forecast-${currency}-${summary.forecast}`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
              >
                {formatCurrency(summary.forecast)}
              </motion.h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Next Month</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Based on current trends
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg"
                >
                  <Target className="w-6 h-6 text-white" />
                </motion.div>
                <Badge variant={summary.budgetUsed > 80 ? 'error' : 'success'}>
                  {summary.budgetUsed.toFixed(0)}%
                </Badge>
              </div>
              <motion.h3 
                key={`budget-${currency}-${summary.budget}`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                {formatCurrency(summary.budget)}
              </motion.h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly Budget</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(summary.budgetUsed, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-2 rounded-full ${summary.budgetUsed > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg"
                >
                  <Lightbulb className="w-6 h-6 text-white" />
                </motion.div>
                <Badge variant="warning">{recommendations.length} Tips</Badge>
              </div>
              <motion.h3 
                key={`savings-${currency}-${totalPotentialSavings}`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent"
              >
                {formatCurrency(totalPotentialSavings)}
              </motion.h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Potential Savings</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                From {recommendations.length} recommendations
              </p>
            </div>
          </motion.div>
        </div>

        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Cost Breakdown by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakdown.map((item, index) => {
              const CategoryIcon = getCategoryIcon(item.category);
              const TrendIcon = getTrendIcon(item.trend);
              return (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-750/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </motion.div>
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
                  <motion.p 
                    key={`breakdown-${currency}-${item.amount}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1"
                  >
                    {formatCurrency(item.amount)}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Cost Resources */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              Top Cost Resources
            </h2>
            <div className="space-y-3">
              {topResources.map((resource, index) => {
                const CategoryIcon = getCategoryIcon(resource.category);
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="p-3 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-750/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}
                        >
                          <CategoryIcon className="w-4 h-4" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {resource.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{resource.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <motion.p 
                          key={`resource-${currency}-${resource.monthlyCost}`}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-bold text-gray-900 dark:text-white"
                        >
                          {formatCurrency(resource.monthlyCost)}
                        </motion.p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">/month</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${resource.utilizationRate}%` }}
                              transition={{ duration: 1, delay: 0.8 + (index * 0.1) }}
                              className={`h-full rounded-full ${
                                resource.utilizationRate > 80 ? 'bg-green-500' :
                                resource.utilizationRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                          <span className="font-medium">{resource.utilizationRate}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {Object.entries(resource.tags).map(([key, value]) => (
                          <Badge key={key} variant="gray" size="sm">{key}: {value}</Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Budget Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Budget Status
            </h2>
            <div className="space-y-4">
              {budgets.map((budget, index) => {
                const percentage = (budget.spent / budget.amount) * 100;
                const isOverThreshold = percentage >= budget.alertThreshold;
                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-750/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  >
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
                          <motion.span 
                            key={`spent-${currency}-${budget.spent}`}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="font-medium text-gray-900 dark:text-white"
                          >
                            {formatCurrency(budget.spent)}
                          </motion.span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, delay: 0.8 + (index * 0.1) }}
                            className={`h-2 rounded-full ${
                              isOverThreshold 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Budget</span>
                          <motion.span 
                            key={`budget-${currency}-${budget.amount}`}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="font-medium text-gray-900 dark:text-white"
                          >
                            {formatCurrency(budget.amount)}
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

        {/* Optimization Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Optimization Recommendations
            </h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge variant="success">
                <Lightbulb className="w-3 h-3 mr-1" />
                Save {formatCurrency(totalPotentialSavings)}/mo
              </Badge>
            </motion.div>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + (index * 0.1) }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="p-4 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-750/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`p-2 rounded-lg ${
                      rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <Lightbulb className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <motion.p 
                          key={`savings-${currency}-${rec.potentialSavings}`}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                        >
                          {formatCurrency(rec.potentialSavings)}
                        </motion.p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {rec.savingsPercent}% savings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3 flex-wrap">
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
                    <motion.button
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Implement Recommendation
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
    </MainLayout>
  );
}
