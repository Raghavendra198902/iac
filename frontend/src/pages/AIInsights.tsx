import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Lightbulb, TrendingUp, Target, Zap, AlertCircle, Play, BarChart3, 
  Activity, Clock, Sparkles, CheckCircle2, RefreshCw, Eye, Shield, 
  DollarSign, Cpu, Lock, Layers, TrendingDown, ArrowRight
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config/api';

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'cost' | 'performance' | 'security' | 'architecture';
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: string;
  confidence: number;
}

interface Insight {
  id: string;
  type: 'optimization' | 'anomaly' | 'prediction' | 'best-practice';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  data: Array<{ time: string; actual: number; predicted: number }>;
}

interface SimulationResult {
  metric: string;
  before: number;
  after: number;
  improvement: number;
  cost: number;
  timeToImplement: string;
}

interface AutoRemediation {
  id: string;
  issue: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  result?: string;
}

const AIInsights = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      title: 'Optimize RDS Instance Sizing',
      description: 'Your RDS instance is consistently running at 20% CPU. Downsizing to db.t3.medium could save $450/month.',
      category: 'cost',
      priority: 'high',
      impact: 'High ($5,400/year savings)',
      effort: 'Low (15 minutes)',
      confidence: 94,
    },
    {
      id: '2',
      title: 'Enable CloudFront Caching',
      description: 'Static assets account for 65% of your bandwidth. CloudFront CDN could reduce latency by 200ms.',
      category: 'performance',
      priority: 'high',
      impact: 'High (40% latency reduction)',
      effort: 'Medium (2 hours)',
      confidence: 89,
    },
    {
      id: '3',
      title: 'Implement Multi-AZ Deployment',
      description: 'Critical services are single-AZ. Multi-AZ setup would improve availability from 99.5% to 99.95%.',
      category: 'architecture',
      priority: 'medium',
      impact: 'High (Better resilience)',
      effort: 'High (1 day)',
      confidence: 92,
    },
    {
      id: '4',
      title: 'Enable Encryption at Rest',
      description: 'S3 buckets containing PII data lack encryption. Enable AES-256 encryption for compliance.',
      category: 'security',
      priority: 'high',
      impact: 'Critical (Compliance)',
      effort: 'Low (30 minutes)',
      confidence: 97,
    },
  ]);

  const [insights] = useState<Insight[]>([
    {
      id: '1',
      type: 'anomaly',
      message: 'Unusual spike in API Gateway errors detected (15% increase)',
      timestamp: '2025-11-16T14:45:00Z',
      severity: 'warning',
    },
    {
      id: '2',
      type: 'prediction',
      message: 'Database storage will reach 80% capacity in 7 days based on current growth',
      timestamp: '2025-11-16T13:30:00Z',
      severity: 'warning',
    },
    {
      id: '3',
      type: 'optimization',
      message: 'Lambda cold starts can be reduced by 60% with provisioned concurrency',
      timestamp: '2025-11-16T12:15:00Z',
      severity: 'info',
    },
  ]);

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [autoRemediations, setAutoRemediations] = useState<AutoRemediation[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    
    if (!autoRefresh) return;
    
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [recsRes, predsRes, remediationsRes] = await Promise.all([
        fetch(`${API_URL}/ai/recommendations`),
        fetch(`${API_URL}/ai/predictions`),
        fetch(`${API_URL}/ai/auto-remediations`)
      ]);
      if (recsRes.ok) setRecommendations(await recsRes.json());
      if (predsRes.ok) setPredictions(await predsRes.json());
      if (remediationsRes.ok) setAutoRemediations(await remediationsRes.json());
    } catch (error) {
      console.error('Failed to load AI data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const simulateImpact = async (recommendationId: string) => {
    setIsSimulating(true);
    try {
      const response = await fetch(`${API_URL}/ai/simulate/${recommendationId}`, { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setSimulationResult(result);
      }
    } catch (error) {
      console.error('Failed to simulate impact:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const startAutoRemediation = async (recommendationId: string) => {
    try {
      await fetch(`${API_URL}/ai/remediate/${recommendationId}`, { method: 'POST' });
      const response = await fetch(`${API_URL}/ai/auto-remediations`);
      if (response.ok) {
        setAutoRemediations(await response.json());
      }
    } catch (error) {
      console.error('Failed to start auto-remediation:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cost':
        return 'text-green-600 dark:text-green-400';
      case 'performance':
        return 'text-blue-600 dark:text-blue-400';
      case 'security':
        return 'text-red-600 dark:text-red-400';
      case 'architecture':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'anomaly':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'best-practice':
        return <Target className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 -left-4 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-0 right-4 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
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
                    className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  AI Insights & Recommendations
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs sm:text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-normal flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </motion.span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Intelligent analysis and optimization suggestions powered by machine learning
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Auto Refresh Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm ${
                    autoRefresh
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">{autoRefresh ? 'Auto' : 'Manual'}</span>
                </motion.button>

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: 180 }}
                  onClick={loadData}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>

                {/* Generate Report */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-all duration-300 shadow-sm"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate Report</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg"
                  >
                    <Lightbulb className="w-6 h-6 text-white" />
                  </motion.div>
                  <Badge variant="warning">Active</Badge>
                </div>
                <motion.h3
                  key={`recs-${recommendations.length}`}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
                >
                  {recommendations.length}
                </motion.h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recommendations</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg"
                  >
                    <AlertCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <Badge variant="error">Urgent</Badge>
                </div>
                <motion.h3
                  key={`high-${recommendations.filter((r) => r.priority === 'high').length}`}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                >
                  {recommendations.filter((r) => r.priority === 'high').length}
                </motion.h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">High Priority</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg"
                  >
                    <DollarSign className="w-6 h-6 text-white" />
                  </motion.div>
                  <Badge variant="success">Savings</Badge>
                </div>
                <motion.h3
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                >
                  $5.4K
                </motion.h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Potential Savings</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                    <Target className="w-6 h-6 text-white" />
                  </motion.div>
                  <Badge variant="info">AI</Badge>
                </div>
                <motion.h3
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                >
                  93%
                </motion.h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Confidence</p>
              </div>
            </motion.div>
          </div>
            </div>
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Recent Insights Alert */}
      {insights.some((i) => i.severity === 'warning' || i.severity === 'critical') && (
        <Alert variant="warning" title="New Insights Detected">
          {insights.filter((i) => i.severity !== 'info').length} insights require your attention
        </Alert>
      )}

      {/* Real-Time Predictions */}
      {predictions.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Real-Time Predictions</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ML-powered forecasting and trend analysis</p>
                </div>
              </div>
              <Badge variant="default">{predictions.length} Active Predictions</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{prediction.metric}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prediction.timeframe}</p>
                    </div>
                    <Badge variant={prediction.trend === 'up' ? 'warning' : prediction.trend === 'down' ? 'success' : 'default'}>
                      {prediction.trend === 'up' ? '↑' : prediction.trend === 'down' ? '↓' : '→'} {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={prediction.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#fff', 
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                      <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Current</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{prediction.currentValue}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Predicted</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{prediction.predictedValue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Auto-Remediation Status */}
      {autoRemediations.length > 0 && (
        <FadeIn delay={0.4}>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Auto-Remediation Status</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered automated issue resolution</p>
              </div>
            </div>

            <div className="space-y-3">
              {autoRemediations.map((remediation) => (
                <div key={remediation.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{remediation.issue}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{remediation.action}</p>
                    </div>
                    <Badge variant={
                      remediation.status === 'completed' ? 'success' :
                      remediation.status === 'running' ? 'warning' :
                      remediation.status === 'failed' ? 'error' :
                      'default'
                    }>
                      {remediation.status}
                    </Badge>
                  </div>

                  {remediation.status === 'running' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">{remediation.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${remediation.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {remediation.status === 'completed' && remediation.result && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{remediation.result}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {remediation.startedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started: {new Date(remediation.startedAt).toLocaleString()}
                      </span>
                    )}
                    {remediation.completedAt && (
                      <span>Completed: {new Date(remediation.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Impact Simulation Modal */}
      {simulationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSimulationResult(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Impact Simulation Results</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{simulationResult.metric}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current State</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{simulationResult.before}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-900 dark:text-green-300">After Implementation</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">{simulationResult.after}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-900 dark:text-blue-300">Expected Improvement</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">+{simulationResult.improvement}%</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Implementation Cost</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">${simulationResult.cost}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Time to Implement</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{simulationResult.timeToImplement}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setSimulationResult(null)} className="btn btn-secondary">
                  Close
                </button>
                <button className="btn btn-primary">
                  Proceed with Implementation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="recommendations">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <TabsList>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="cost">Cost Optimization</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="recommendations">
            <div className="p-6">
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {rec.title}
                          </h3>
                          <Badge variant={getPriorityVariant(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                          <span className={`text-sm font-medium uppercase ${getCategoryColor(rec.category)}`}>
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {rec.description}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Impact</p>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">
                              {rec.impact}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Effort</p>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">
                              {rec.effort}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Confidence</p>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">
                              {rec.confidence}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => simulateImpact(rec.id)}
                          disabled={isSimulating}
                          className="btn btn-secondary btn-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          {isSimulating ? 'Simulating...' : 'Simulate'}
                        </button>
                        {rec.autoRemediable && (
                          <button 
                            onClick={() => startAutoRemediation(rec.id)}
                            className="btn btn-primary btn-sm flex items-center gap-1 bg-green-500 hover:bg-green-600"
                          >
                            <Sparkles className="w-3 h-3" />
                            Auto-Fix
                          </button>
                        )}
                        <button className="btn btn-primary btn-sm">Apply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="p-6">
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={getSeverityVariant(insight.severity)}>
                            {insight.severity}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {insight.type}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {insight.message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(insight.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cost">
            <div className="p-6">
              <div className="space-y-4">
                {recommendations
                  .filter((r) => r.category === 'cost')
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {rec.description}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="p-6">
              <div className="space-y-4">
                {recommendations
                  .filter((r) => r.category === 'security')
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {rec.description}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIInsights;
