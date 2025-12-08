import React, { useState } from 'react';
import { 
  CpuChipIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  LightBulbIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'active' | 'training' | 'ready';
  accuracy: number;
  lastUpdated: string;
}

interface Recommendation {
  id: string;
  title: string;
  category: 'cost' | 'performance' | 'security' | 'architecture';
  priority: 'high' | 'medium' | 'low';
  impact: string;
  confidence: number;
  description: string;
}

interface Prediction {
  id: string;
  metric: string;
  current: string;
  predicted: string;
  timeframe: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

const AIOverview: React.FC = () => {
  const [features] = useState<AIFeature[]>([
    {
      id: '1',
      name: 'Cost Optimization AI',
      description: 'ML-powered cost analysis and recommendations',
      icon: ChartBarIcon,
      status: 'active',
      accuracy: 94.5,
      lastUpdated: '2 hours ago'
    },
    {
      id: '2',
      name: 'Anomaly Detection',
      description: 'Real-time anomaly detection using Isolation Forest',
      icon: ShieldCheckIcon,
      status: 'active',
      accuracy: 97.2,
      lastUpdated: '15 minutes ago'
    },
    {
      id: '3',
      name: 'Predictive Scaling',
      description: 'LSTM-based resource demand forecasting',
      icon: ArrowTrendingUpIcon,
      status: 'active',
      accuracy: 91.8,
      lastUpdated: '1 hour ago'
    },
    {
      id: '4',
      name: 'Architecture Advisor',
      description: 'AI-powered architecture recommendations',
      icon: LightBulbIcon,
      status: 'ready',
      accuracy: 89.3,
      lastUpdated: '3 hours ago'
    },
    {
      id: '5',
      name: 'Natural Language Interface',
      description: 'Generate infrastructure from natural language',
      icon: SparklesIcon,
      status: 'training',
      accuracy: 86.7,
      lastUpdated: '30 minutes ago'
    },
    {
      id: '6',
      name: 'Performance Optimizer',
      description: 'Automated performance tuning recommendations',
      icon: CpuChipIcon,
      status: 'active',
      accuracy: 93.1,
      lastUpdated: '45 minutes ago'
    }
  ]);

  const [recommendations] = useState<Recommendation[]>([
    {
      id: '1',
      title: 'Optimize RDS Instance Sizing',
      category: 'cost',
      priority: 'high',
      impact: '$5,400/year savings',
      confidence: 94,
      description: 'RDS instance running at 20% CPU. Downsize to db.t3.medium'
    },
    {
      id: '2',
      title: 'Enable CloudFront Caching',
      category: 'performance',
      priority: 'high',
      impact: '40% latency reduction',
      confidence: 89,
      description: 'Static assets account for 65% of bandwidth'
    },
    {
      id: '3',
      title: 'Implement Multi-AZ Deployment',
      category: 'architecture',
      priority: 'medium',
      impact: '99.95% availability',
      confidence: 92,
      description: 'Critical services are single-AZ, improve resilience'
    },
    {
      id: '4',
      title: 'Update Security Group Rules',
      category: 'security',
      priority: 'high',
      impact: 'Reduce attack surface',
      confidence: 96,
      description: '12 overly permissive rules detected'
    }
  ]);

  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      metric: 'Monthly Cost',
      current: '$12,450',
      predicted: '$14,200',
      timeframe: 'Next 30 days',
      confidence: 91,
      trend: 'up'
    },
    {
      id: '2',
      metric: 'CPU Usage',
      current: '68%',
      predicted: '82%',
      timeframe: 'Next 7 days',
      confidence: 87,
      trend: 'up'
    },
    {
      id: '3',
      metric: 'Storage Capacity',
      current: '1.2 TB',
      predicted: '1.5 TB',
      timeframe: 'Next 14 days',
      confidence: 94,
      trend: 'up'
    },
    {
      id: '4',
      metric: 'Network Traffic',
      current: '245 GB/day',
      predicted: '238 GB/day',
      timeframe: 'Next 7 days',
      confidence: 88,
      trend: 'down'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'training': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ready': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cost': return 'bg-green-500/20 text-green-400';
      case 'performance': return 'bg-blue-500/20 text-blue-400';
      case 'security': return 'bg-red-500/20 text-red-400';
      case 'architecture': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
      default: return '—';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-400';
      case 'down': return 'text-green-400';
      case 'stable': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            AI & Machine Learning
          </h1>
          <p className="text-gray-400 mt-1">
            Intelligent automation and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ClockIcon className="w-4 h-4" />
          Last updated: 2 minutes ago
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Models</span>
            <CpuChipIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">6</div>
          <div className="text-sm text-green-400 mt-1">↑ 2 this month</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Accuracy</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">92.1%</div>
          <div className="text-sm text-green-400 mt-1">↑ 3.2% improved</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Recommendations</span>
            <LightBulbIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">24</div>
          <div className="text-sm text-yellow-400 mt-1">4 high priority</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Cost Savings</span>
            <ChartBarIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">$18.5K</div>
          <div className="text-sm text-purple-400 mt-1">Potential/month</div>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CpuChipIcon className="w-6 h-6 text-blue-400" />
          AI Models & Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-8 h-8 text-blue-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-400">Accuracy: </span>
                    <span className="text-green-400 font-semibold">{feature.accuracy}%</span>
                  </div>
                  <span className="text-gray-500 text-xs">{feature.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recommendations */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-yellow-400" />
            Top Recommendations
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold flex-1">{rec.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ml-2 ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(rec.category)}`}>
                    {rec.category}
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">Impact: <span className="text-green-400">{rec.impact}</span></span>
                    <span className="text-gray-400">Confidence: <span className="text-blue-400">{rec.confidence}%</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
            Predictive Analytics
          </h2>
          <div className="space-y-3">
            {predictions.map((pred) => (
              <div
                key={pred.id}
                className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{pred.metric}</h3>
                  <span className={`text-2xl font-bold ${getTrendColor(pred.trend)}`}>
                    {getTrendIcon(pred.trend)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-400 block">Current</span>
                    <span className="text-lg font-bold text-white">{pred.current}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Predicted</span>
                    <span className="text-lg font-bold text-purple-400">{pred.predicted}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{pred.timeframe}</span>
                  <span className="text-blue-400">Confidence: {pred.confidence}%</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
                    style={{ width: `${pred.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOverview;
