import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
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

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'compute' | 'storage' | 'network' | 'database';
  potential_savings: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  priority: number;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  current_cost: number;
  optimized_cost: number;
  savings: number;
  status: 'idle' | 'underutilized' | 'rightsized' | 'overprovisioned';
}

const CostOptimization: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Generate sample optimization data
    const generateData = () => {
      const sampleRecommendations: Recommendation[] = [
        {
          id: '1',
          title: 'Rightsize EC2 Instances',
          description: '8 EC2 instances running at <20% CPU utilization can be downsized',
          category: 'compute',
          potential_savings: 2840,
          impact: 'high',
          effort: 'easy',
          priority: 1
        },
        {
          id: '2',
          title: 'Delete Unused EBS Volumes',
          description: '12 unattached EBS volumes detected (total 4.8 TB)',
          category: 'storage',
          potential_savings: 1920,
          impact: 'high',
          effort: 'easy',
          priority: 2
        },
        {
          id: '3',
          title: 'Enable S3 Intelligent-Tiering',
          description: 'Move infrequently accessed S3 data to cheaper storage classes',
          category: 'storage',
          potential_savings: 3450,
          impact: 'high',
          effort: 'moderate',
          priority: 3
        },
        {
          id: '4',
          title: 'Optimize RDS Instance Types',
          description: '3 RDS instances can be switched to more cost-effective types',
          category: 'database',
          potential_savings: 1680,
          impact: 'medium',
          effort: 'moderate',
          priority: 4
        },
        {
          id: '5',
          title: 'Use Reserved Instances',
          description: 'Purchase 1-year reserved instances for steady-state workloads',
          category: 'compute',
          potential_savings: 4200,
          impact: 'high',
          effort: 'easy',
          priority: 5
        },
        {
          id: '6',
          title: 'Optimize Data Transfer',
          description: 'Configure CloudFront to reduce data transfer costs',
          category: 'network',
          potential_savings: 890,
          impact: 'medium',
          effort: 'moderate',
          priority: 6
        }
      ];

      const sampleResources: Resource[] = [
        {
          id: '1',
          name: 'web-server-prod-01',
          type: 't3.xlarge',
          current_cost: 580,
          optimized_cost: 290,
          savings: 290,
          status: 'underutilized'
        },
        {
          id: '2',
          name: 'db-primary',
          type: 'db.r5.2xlarge',
          current_cost: 1240,
          optimized_cost: 820,
          savings: 420,
          status: 'overprovisioned'
        },
        {
          id: '3',
          name: 'data-volume-backup',
          type: 'gp3 (2TB)',
          current_cost: 320,
          optimized_cost: 0,
          savings: 320,
          status: 'idle'
        },
        {
          id: '4',
          name: 'cache-cluster',
          type: 'cache.r5.large',
          current_cost: 180,
          optimized_cost: 180,
          savings: 0,
          status: 'rightsized'
        }
      ];

      setRecommendations(sampleRecommendations);
      setResources(sampleResources);
      setLoading(false);
    };

    generateData();
  }, []);

  const totalSavings = recommendations.reduce((sum, r) => sum + r.potential_savings, 0);
  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

  const savingsByCategory = [
    { name: 'Compute', value: 7040, color: '#3b82f6' },
    { name: 'Storage', value: 5370, color: '#10b981' },
    { name: 'Network', value: 890, color: '#f59e0b' },
    { name: 'Database', value: 1680, color: '#8b5cf6' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/20';
      case 'complex': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-red-400 bg-red-400/20';
      case 'underutilized': return 'text-yellow-400 bg-yellow-400/20';
      case 'overprovisioned': return 'text-orange-400 bg-orange-400/20';
      case 'rightsized': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compute': return ServerIcon;
      case 'storage': return CircleStackIcon;
      case 'network': return CloudIcon;
      case 'database': return CircleStackIcon;
      default: return SparklesIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-16 h-16 text-green-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Analyzing optimization opportunities...</p>
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
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Cost Optimization
          </h1>
          <p className="text-gray-300">Identify and implement cost-saving opportunities</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <SparklesIcon className="w-10 h-10 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{recommendations.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Recommendations</h3>
            <p className="text-sm text-gray-300">Optimization opportunities</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-10 h-10 text-green-400" />
              <span className="text-3xl font-bold text-white">${totalSavings.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Potential Savings</h3>
            <p className="text-sm text-gray-300">Per month</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingDownIcon className="w-10 h-10 text-blue-400" />
              <span className="text-3xl font-bold text-white">28%</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Cost Reduction</h3>
            <p className="text-sm text-gray-300">Potential reduction</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <BoltIcon className="w-10 h-10 text-purple-400" />
              <span className="text-3xl font-bold text-white">{recommendations.filter(r => r.effort === 'easy').length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Quick Wins</h3>
            <p className="text-sm text-gray-300">Easy to implement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Savings by Category */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-green-400" />
              Savings by Category
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={savingsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {savingsByCategory.map((entry, index) => (
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
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <LightBulbIcon className="w-6 h-6 text-yellow-400" />
              Optimization Insights
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  <span className="text-2xl font-bold text-white">12</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Idle Resources</h4>
                <p className="text-sm text-gray-400">Unused resources costing money</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <ServerIcon className="w-6 h-6 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">8</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Underutilized</h4>
                <p className="text-sm text-gray-400">Resources running below 20%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <BoltIcon className="w-6 h-6 text-green-400" />
                  <span className="text-2xl font-bold text-white">$7.2k</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Quick Wins</h4>
                <p className="text-sm text-gray-400">Easy optimization savings</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircleIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-2xl font-bold text-white">24</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Rightsized</h4>
                <p className="text-sm text-gray-400">Optimally configured resources</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-yellow-400" />
              Optimization Recommendations
            </h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-xl focus:outline-none focus:border-green-400 transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="compute">Compute</option>
              <option value="storage">Storage</option>
              <option value="network">Network</option>
              <option value="database">Database</option>
            </select>
          </div>
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => {
              const Icon = getCategoryIcon(rec.category);
              return (
                <div key={rec.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start gap-4">
                    <Icon className="w-10 h-10 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">${rec.potential_savings.toLocaleString()}/mo</div>
                          <div className="text-xs text-gray-400">Potential Savings</div>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{rec.description}</p>
                      <div className="flex gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getImpactColor(rec.impact)}`}>
                          {rec.impact.toUpperCase()} IMPACT
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEffortColor(rec.effort)}`}>
                          {rec.effort.toUpperCase()} EFFORT
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-blue-400 bg-blue-400/20">
                          {rec.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource List */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ServerIcon className="w-6 h-6 text-purple-400" />
            Resource Analysis
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Resource</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Type</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Current Cost</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Optimized Cost</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Savings</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-4 text-white font-medium">{resource.name}</td>
                    <td className="py-4 px-4 text-gray-300">{resource.type}</td>
                    <td className="py-4 px-4 text-right text-white">${resource.current_cost}</td>
                    <td className="py-4 px-4 text-right text-white">${resource.optimized_cost}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-green-400 font-bold">
                        ${resource.savings} ({resource.savings > 0 ? ((resource.savings / resource.current_cost) * 100).toFixed(0) : 0}%)
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(resource.status)}`}>
                        {resource.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default CostOptimization;
