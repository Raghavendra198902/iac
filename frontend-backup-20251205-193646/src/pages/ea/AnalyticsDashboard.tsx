import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Activity, Target, Zap,
  Award, Clock, DollarSign, CheckCircle, AlertTriangle,
  ArrowUp, ArrowDown, Sparkles, Calendar, FileText, Shield
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  // Sample data for charts
  const responsibilityCompletion = [
    { name: 'Integration & API', completion: 98, trend: 'up' },
    { name: 'Solution Oversight', completion: 96, trend: 'up' },
    { name: 'Cloud Infrastructure', completion: 95, trend: 'stable' },
    { name: 'Architecture Strategy', completion: 94, trend: 'up' },
    { name: 'Program Delivery', completion: 93, trend: 'up' },
    { name: 'Security', completion: 92, trend: 'stable' },
    { name: 'Data Architecture', completion: 91, trend: 'up' },
    { name: 'Business Alignment', completion: 89, trend: 'stable' },
    { name: 'People Leadership', completion: 88, trend: 'up' },
    { name: 'Stakeholder Mgmt', completion: 87, trend: 'stable' },
    { name: 'Standards', completion: 86, trend: 'up' },
    { name: 'Lifecycle', completion: 85, trend: 'stable' },
    { name: 'Portfolio', completion: 85, trend: 'up' },
    { name: 'Documentation', completion: 84, trend: 'stable' },
    { name: 'Innovation', completion: 82, trend: 'down' }
  ];

  const monthlyTrends = [
    { month: 'Jul', initiatives: 32, documents: 156, stakeholders: 65, value: 6200 },
    { month: 'Aug', initiatives: 38, documents: 178, stakeholders: 71, value: 6800 },
    { month: 'Sep', initiatives: 42, documents: 195, stakeholders: 78, value: 7500 },
    { month: 'Oct', initiatives: 45, documents: 221, stakeholders: 84, value: 8100 },
    { month: 'Nov', initiatives: 47, documents: 243, stakeholders: 89, value: 8500 },
    { month: 'Dec', initiatives: 47, documents: 243, stakeholders: 89, value: 8500 }
  ];

  const categoryDistribution = [
    { name: 'Strategy & Governance', value: 18, color: '#3b82f6' },
    { name: 'Technical Excellence', value: 25, color: '#8b5cf6' },
    { name: 'Business Value', value: 22, color: '#10b981' },
    { name: 'Innovation', value: 15, color: '#f59e0b' },
    { name: 'People & Culture', value: 20, color: '#ec4899' }
  ];

  const maturityLevels = [
    { area: 'Process Maturity', current: 85, target: 90 },
    { area: 'Tool Adoption', current: 88, target: 95 },
    { area: 'Standards Compliance', current: 92, target: 95 },
    { area: 'Documentation', current: 78, target: 90 },
    { area: 'Automation', current: 75, target: 85 },
    { area: 'Security Posture', current: 90, target: 95 }
  ];

  const keyMetrics = [
    {
      title: 'Overall Health Score',
      value: '88%',
      change: '+3%',
      trend: 'up',
      icon: Activity,
      color: 'blue',
      description: 'Composite health across all areas'
    },
    {
      title: 'Active Initiatives',
      value: '47',
      change: '+5',
      trend: 'up',
      icon: Target,
      color: 'purple',
      description: 'Currently running initiatives'
    },
    {
      title: 'Value Realized',
      value: '$8.5M',
      change: '+$0.4M',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
      description: 'Total business value delivered'
    },
    {
      title: 'Stakeholders Engaged',
      value: '89',
      change: '+7',
      trend: 'up',
      icon: Users,
      color: 'orange',
      description: 'Active stakeholder relationships'
    },
    {
      title: 'Compliance Rate',
      value: '94%',
      change: '+2%',
      trend: 'up',
      icon: Shield,
      color: 'emerald',
      description: 'Architecture compliance score'
    },
    {
      title: 'Documentation',
      value: '243',
      change: '+22',
      trend: 'up',
      icon: FileText,
      color: 'indigo',
      description: 'Active architecture documents'
    }
  ];

  const recentAchievements = [
    {
      title: 'Integration API Uptime',
      description: 'Achieved 99.9% uptime for Q4',
      icon: CheckCircle,
      date: '2 days ago',
      impact: 'high'
    },
    {
      title: 'Cost Optimization',
      description: 'Reduced cloud costs by $2.4M through portfolio rationalization',
      icon: DollarSign,
      date: '1 week ago',
      impact: 'high'
    },
    {
      title: 'Security Certification',
      description: 'Obtained SOC 2 Type II compliance',
      icon: Shield,
      date: '2 weeks ago',
      impact: 'high'
    },
    {
      title: 'Innovation Initiative',
      description: 'Launched 8 pilot projects for emerging technologies',
      icon: Sparkles,
      date: '3 weeks ago',
      impact: 'medium'
    }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 rounded-full bg-gray-400" />;
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (impact === 'medium') return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <BarChart3 className="w-12 h-12 text-blue-600" />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-blue-600" />
                EA Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive metrics and insights across all EA responsibility areas
              </p>
            </div>
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {keyMetrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 shadow-lg`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  {getTrendIcon(metric.trend)}
                  <span className={metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {metric.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Responsibility Completion */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              Responsibility Area Completion
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={responsibilityCompletion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={150} style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="completion" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Monthly Growth Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="initiatives" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="stakeholders" stroke="#8b5cf6" strokeWidth={3} />
                <Line type="monotone" dataKey="documents" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-600" />
              Effort Distribution by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Maturity Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              Maturity Assessment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={maturityLevels}>
                <PolarGrid />
                <PolarAngleAxis dataKey="area" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Recent Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAchievements.map((achievement, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl border ${getImpactColor(achievement.impact)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                    <achievement.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {achievement.date}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
