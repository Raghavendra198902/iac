import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3011/api/ai/analytics/predict-costs', {
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Insights powered by machine learning</p>
        </div>
        <div className="flex space-x-3">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Month</p>
              <p className="text-2xl font-bold text-gray-800">$4,800</p>
              <p className="text-xs text-green-600 mt-1">↑ 5.3% vs last month</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Predicted Next</p>
              <p className="text-2xl font-bold text-gray-800">
                ${data.predictions.nextMonth.estimated}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {(data.predictions.nextMonth.confidence * 100).toFixed(0)}% confidence
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold text-gray-800">156</p>
              <p className="text-xs text-blue-600 mt-1">Across 3 clouds</p>
            </div>
            <div className="text-4xl">☁️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-2xl font-bold text-gray-800">$262</p>
              <p className="text-xs text-green-600 mt-1">From AI recommendations</p>
            </div>
            <div className="text-4xl">💡</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Trend & Forecast</h3>
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resource Distribution</h3>
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resource Utilization</h3>
        <div className="space-y-4">
          {Object.entries(data.utilizationMetrics).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                <span className="text-sm font-semibold text-gray-800">{value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
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
