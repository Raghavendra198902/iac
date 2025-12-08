import React, { useState } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface Forecast {
  id: string;
  metric: string;
  current: string;
  predicted: string;
  change: number;
  timeframe: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'info' | 'warning' | 'critical';
}

const AIPredictive: React.FC = () => {
  const [forecasts] = useState<Forecast[]>([
    {
      id: '1',
      metric: 'Monthly Cloud Spend',
      current: '$12,450',
      predicted: '$14,200',
      change: 14.0,
      timeframe: 'Next 30 days',
      confidence: 91,
      trend: 'up',
      severity: 'warning'
    },
    {
      id: '2',
      metric: 'CPU Usage Peak',
      current: '68%',
      predicted: '82%',
      change: 20.6,
      timeframe: 'Next 7 days',
      confidence: 87,
      trend: 'up',
      severity: 'warning'
    },
    {
      id: '3',
      metric: 'Storage Capacity',
      current: '1.2 TB',
      predicted: '1.5 TB',
      change: 25.0,
      timeframe: 'Next 14 days',
      confidence: 94,
      trend: 'up',
      severity: 'info'
    },
    {
      id: '4',
      metric: 'Network Bandwidth',
      current: '245 GB/day',
      predicted: '238 GB/day',
      change: -2.9,
      timeframe: 'Next 7 days',
      confidence: 88,
      trend: 'down',
      severity: 'info'
    },
    {
      id: '5',
      metric: 'Memory Utilization',
      current: '72%',
      predicted: '89%',
      change: 23.6,
      timeframe: 'Next 3 days',
      confidence: 92,
      trend: 'up',
      severity: 'critical'
    },
    {
      id: '6',
      metric: 'Request Volume',
      current: '1.2M/day',
      predicted: '1.45M/day',
      change: 20.8,
      timeframe: 'Next 14 days',
      confidence: 85,
      trend: 'up',
      severity: 'info'
    }
  ]);

  const costForecastData = [
    { month: 'Jan', actual: 11200, predicted: 11300, budget: 12000 },
    { month: 'Feb', actual: 11800, predicted: 11900, budget: 12000 },
    { month: 'Mar', actual: 12450, predicted: 12400, budget: 12000 },
    { month: 'Apr', actual: null, predicted: 14200, budget: 12000 },
    { month: 'May', actual: null, predicted: 15800, budget: 15000 },
    { month: 'Jun', actual: null, predicted: 16500, budget: 15000 }
  ];

  const cpuForecastData = [
    { time: '00:00', actual: 45, predicted: 46 },
    { time: '04:00', actual: 52, predicted: 53 },
    { time: '08:00', actual: 68, predicted: 67 },
    { time: '12:00', actual: 75, predicted: 76 },
    { time: '16:00', actual: 82, predicted: 83 },
    { time: '20:00', actual: 71, predicted: 72 },
    { time: '24:00', actual: null, predicted: 78 },
    { time: '28:00', actual: null, predicted: 82 }
  ];

  const storageForecastData = [
    { week: 'Week 1', used: 980, predicted: 1000, capacity: 2000 },
    { week: 'Week 2', used: 1050, predicted: 1080, capacity: 2000 },
    { week: 'Week 3', used: 1120, predicted: 1150, capacity: 2000 },
    { week: 'Week 4', used: 1200, predicted: 1220, capacity: 2000 },
    { week: 'Week 5', used: null, predicted: 1320, capacity: 2000 },
    { week: 'Week 6', used: null, predicted: 1450, capacity: 2000 },
    { week: 'Week 7', used: null, predicted: 1580, capacity: 2000 },
    { week: 'Week 8', used: null, predicted: 1720, capacity: 2000 }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-5 h-5 text-red-400" />;
      case 'down': return <ArrowTrendingDownIcon className="w-5 h-5 text-green-400" />;
      default: return <span className="text-blue-400">→</span>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ArrowTrendingUpIcon className="w-8 h-8 text-purple-400" />
            Predictive Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered forecasting and trend analysis
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ClockIcon className="w-4 h-4" />
          Models updated: 15 minutes ago
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Forecasts</span>
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">6</div>
          <div className="text-sm text-gray-400 mt-1">2 critical alerts</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Confidence</span>
            <ChartBarIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">89.5%</div>
          <div className="text-sm text-green-400 mt-1">↑ 2.3%</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Prediction Horizon</span>
            <ClockIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">30d</div>
          <div className="text-sm text-gray-400 mt-1">Maximum</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Accuracy Rate</span>
            <ChartBarIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">94.2%</div>
          <div className="text-sm text-green-400 mt-1">Last 30 days</div>
        </div>
      </div>

      {/* Forecasts Grid */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Key Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts.map((forecast) => (
            <div
              key={forecast.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold">{forecast.metric}</h3>
                <div className="flex items-center gap-2">
                  {getTrendIcon(forecast.trend)}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(forecast.severity)}`}>
                    {forecast.severity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-xs text-gray-400 block">Current</span>
                  <span className="text-xl font-bold text-white">{forecast.current}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Predicted</span>
                  <span className="text-xl font-bold text-purple-400">{forecast.predicted}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">{forecast.timeframe}</span>
                <span className={`font-semibold ${forecast.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {forecast.change > 0 ? '+' : ''}{forecast.change}%
                </span>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Confidence Level</span>
                  <span>{forecast.confidence}%</span>
                </div>
                <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                    style={{ width: `${forecast.confidence}%` }}
                  />
                </div>
              </div>

              {forecast.severity === 'critical' && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Action required soon</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cost Forecast Chart */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
            Cost Forecast - Next 6 Months
          </h2>
          <span className="text-sm text-gray-400">LSTM Model - 91% confidence</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={costForecastData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" name="Actual Cost" />
              <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" name="Predicted Cost" />
              <Area type="monotone" dataKey="budget" stroke="#10b981" strokeDasharray="3 3" fill="none" name="Budget" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Forecast */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ServerIcon className="w-6 h-6 text-blue-400" />
              CPU Usage Forecast
            </h2>
            <span className="text-sm text-gray-400">87% confidence</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpuForecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" dot={{ fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="Predicted" dot={{ fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Forecast */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ServerIcon className="w-6 h-6 text-yellow-400" />
              Storage Growth Forecast
            </h2>
            <span className="text-sm text-gray-400">94% confidence</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageForecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="used" fill="#3b82f6" name="Used Storage (GB)" />
                <Bar dataKey="predicted" fill="#a855f7" name="Predicted (GB)" />
                <Bar dataKey="capacity" fill="#374151" name="Capacity (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictive;
