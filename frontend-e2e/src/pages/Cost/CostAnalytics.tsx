import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CloudIcon,
  ServerIcon,
  CircleStackIcon,
  ArrowPathIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
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

interface CostData {
  total_cost: number;
  month_to_date: number;
  forecast: number;
  savings: number;
  trend: number;
}

const CostAnalytics: React.FC = () => {
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Generate sample data for demonstration
  useEffect(() => {
    const generateData = () => {
      setCostData({
        total_cost: 45678.50,
        month_to_date: 32456.80,
        forecast: 52000.00,
        savings: 8543.20,
        trend: -12.5
      });
      setLoading(false);
    };

    generateData();
  }, [timeRange]);

  const monthlyData = [
    { month: 'Jan', cost: 38500, budget: 45000 },
    { month: 'Feb', cost: 41200, budget: 45000 },
    { month: 'Mar', cost: 39800, budget: 45000 },
    { month: 'Apr', cost: 43500, budget: 45000 },
    { month: 'May', cost: 42100, budget: 45000 },
    { month: 'Jun', cost: 45678, budget: 45000 }
  ];

  const serviceBreakdown = [
    { name: 'Compute', value: 18500, color: '#3b82f6' },
    { name: 'Storage', value: 12300, color: '#10b981' },
    { name: 'Network', value: 8200, color: '#f59e0b' },
    { name: 'Database', value: 6678, color: '#8b5cf6' }
  ];

  const dailyTrend = [
    { day: 'Mon', cost: 1520 },
    { day: 'Tue', cost: 1480 },
    { day: 'Wed', cost: 1650 },
    { day: 'Thu', cost: 1590 },
    { day: 'Fri', cost: 1420 },
    { day: 'Sat', cost: 980 },
    { day: 'Sun', cost: 890 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading cost analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-green-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Cost Analytics
            </h1>
            <p className="text-gray-300">Comprehensive cost analysis and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-xl focus:outline-none focus:border-green-400 transition-colors"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-10 h-10 text-green-400" />
              <span className="text-3xl font-bold text-white">${costData.total_cost.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Total Cost (MTD)</h3>
            <div className="flex items-center gap-2 text-sm">
              <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400">{Math.abs(costData.trend)}% vs last month</span>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-10 h-10 text-blue-400" />
              <span className="text-3xl font-bold text-white">${costData.forecast.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Forecasted Cost</h3>
            <p className="text-sm text-gray-300">End of month projection</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingDownIcon className="w-10 h-10 text-emerald-400" />
              <span className="text-3xl font-bold text-white">${costData.savings.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Savings Realized</h3>
            <p className="text-sm text-gray-300">From optimizations</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <CalendarIcon className="w-10 h-10 text-purple-400" />
              <span className="text-3xl font-bold text-white">${(costData.total_cost / 30).toFixed(0)}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Avg Daily Cost</h3>
            <p className="text-sm text-gray-300">Current month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Cost Trend */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-green-400" />
              Monthly Cost Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#10b981" name="Actual Cost" />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Service Cost Breakdown */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ServerIcon className="w-6 h-6 text-blue-400" />
              Service Cost Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {serviceBreakdown.map((service) => (
                <div key={service.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }}></div>
                  <span className="text-gray-300">{service.name}: ${service.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Cost Trend */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
            Daily Cost Trend (This Week)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cost Drivers */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CloudIcon className="w-6 h-6 text-yellow-400" />
            Top Cost Drivers
          </h2>
          <div className="space-y-4">
            {[
              { resource: 'EC2 Instances (Production)', cost: 8450, change: 5.2, icon: ServerIcon, color: 'text-blue-400' },
              { resource: 'S3 Storage', cost: 6780, change: -2.3, icon: CircleStackIcon, color: 'text-green-400' },
              { resource: 'RDS Databases', cost: 5420, change: 3.1, icon: CircleStackIcon, color: 'text-purple-400' },
              { resource: 'Data Transfer', cost: 4890, change: 8.7, icon: CloudIcon, color: 'text-yellow-400' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                  <div>
                    <h4 className="text-white font-semibold">{item.resource}</h4>
                    <p className="text-sm text-gray-400">Current month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${item.cost.toLocaleString()}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {item.change > 0 ? (
                      <>
                        <ArrowTrendingUpIcon className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">+{item.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">{item.change}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default CostAnalytics;
