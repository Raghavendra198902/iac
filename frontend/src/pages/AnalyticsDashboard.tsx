import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Cloud, TrendingUp, Zap, Activity, DollarSign } from 'lucide-react';
import { API_URL } from '../config/api';
import AIRecommendationsPanel from '../components/AIRecommendationsPanel';
import FadeIn from '../components/ui/FadeIn';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  costTrend: Array<{ month: string; cost: number }>;
  resourceDistribution: Array<{ name: string; value: number }>;
  utilizationMetrics: {
    compute: number;
    storage: number;
    network: number;
  };
  predictions: {
    nextMonth: { estimated: number; confidence: number };
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [mlMetrics] = useState({
    predictionAccuracy: 94.2,
    totalPredictions: 1247,
    multiCloudInsights: {
      aws: { trend: 'increasing', projected: 2850 },
      azure: { trend: 'stable', projected: 1620 },
      gcp: { trend: 'decreasing', projected: 980 },
    },
    anomaliesDetected: 8,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ai/analytics/predict-costs`, {
        historicalData: [4200, 4350, 4500, 4650, 4800],
        timeframe: 'next_month'
      });
      
      // Mock data for demonstration
      setData({
        costTrend: [
          { month: 'Jan', cost: 4200 },
          { month: 'Feb', cost: 4350 },
          { month: 'Mar', cost: 4500 },
          { month: 'Apr', cost: 4650 },
          { month: 'May', cost: 4800 },
          { month: 'Jun (Est)', cost: response.data.nextMonth?.estimated || 4850 }
        ],
        resourceDistribution: [
          { name: 'Compute', value: 2800 },
          { name: 'Storage', value: 1200 },
          { name: 'Network', value: 800 }
        ],
        utilizationMetrics: {
          compute: 68,
          storage: 85,
          network: 52
        },
        predictions: response.data
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set mock data on error
      setData({
        costTrend: [
          { month: 'Jan', cost: 4200 },
          { month: 'Feb', cost: 4350 },
          { month: 'Mar', cost: 4500 },
          { month: 'Apr', cost: 4650 },
          { month: 'May', cost: 4800 },
          { month: 'Jun (Est)', cost: 4850 }
        ],
        resourceDistribution: [
          { name: 'Compute', value: 2800 },
          { name: 'Storage', value: 1200 },
          { name: 'Network', value: 800 }
        ],
        utilizationMetrics: {
          compute: 68,
          storage: 85,
          network: 52
        },
        predictions: {
          nextMonth: { estimated: 4850, confidence: 0.87 }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Insights powered by machine learning</p>
        </div>
        <div className="flex space-x-3">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ML Accuracy</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{mlMetrics.predictionAccuracy}%</p>
              <div className="flex items-center gap-1 mt-2 text-purple-600 dark:text-purple-400">
                <Brain className="w-3 h-3" />
                <p className="text-xs font-medium">AI-Powered</p>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Month</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">$4,800</p>
              <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                <TrendingUp className="w-3 h-3" />
                <p className="text-xs font-medium">↑ 5.3% vs last month</p>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Predicted Next</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                ${data.predictions.nextMonth.estimated}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {(data.predictions.nextMonth.confidence * 100).toFixed(0)}% confidence
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Resources</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">156</p>
              <div className="flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400">
                <Cloud className="w-3 h-3" />
                <p className="text-xs font-medium">Across 3 clouds</p>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-lg">
              <Cloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">$262</p>
              <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                <Zap className="w-3 h-3" />
                <p className="text-xs font-medium">From AI recommendations</p>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Cloud Predictive Analytics */}
      <FadeIn delay={0.3}>
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Multi-Cloud Cost Projections</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">ML-powered forecasts per cloud provider</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">AWS</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {mlMetrics.multiCloudInsights.aws.trend}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">${mlMetrics.multiCloudInsights.aws.projected}</p>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-400">Next month projected</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Azure</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {mlMetrics.multiCloudInsights.azure.trend}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">${mlMetrics.multiCloudInsights.azure.projected}</p>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">Next month projected</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-red-900 dark:text-red-300">GCP</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {mlMetrics.multiCloudInsights.gcp.trend}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold text-red-900 dark:text-red-300">${mlMetrics.multiCloudInsights.gcp.projected}</p>
              </div>
              <p className="text-xs text-red-700 dark:text-red-400">Next month projected</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* AI Recommendations Panel */}
      <FadeIn delay={0.4}>
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI-Powered Cost Optimization</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Machine learning recommendations for savings</p>
            </div>
          </div>
          <AIRecommendationsPanel />
        </div>
      </FadeIn>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Trend & Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.costTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.resourceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.resourceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Utilization Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Utilization</h3>
        <div className="space-y-4">
          {Object.entries(data.utilizationMetrics).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">🤖 AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90">Cost Optimization</p>
            <p className="text-lg font-semibold mt-1">3 opportunities detected</p>
            <p className="text-xs mt-2 opacity-75">Potential savings: $262/month</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90">Performance Issues</p>
            <p className="text-lg font-semibold mt-1">2 bottlenecks found</p>
            <p className="text-xs mt-2 opacity-75">Database CPU at 85%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90">Security Alerts</p>
            <p className="text-lg font-semibold mt-1">1 critical issue</p>
            <p className="text-xs mt-2 opacity-75">Unrestricted SSH access detected</p>
          </div>
        </div>
      </div>
    </div>
  );
};
