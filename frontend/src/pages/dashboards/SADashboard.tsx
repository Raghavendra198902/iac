import { Lightbulb, FileText, Sparkles, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/ui/PageTransition';
import FadeIn from '../../components/ui/FadeIn';
import ChartCard from '../../components/ui/ChartCard';

/**
 * Solution Architect (SA) Dashboard
 * 
 * Responsibilities:
 * - Blueprint design & creation
 * - Pattern selection & application
 * - AI-assisted design recommendations
 * - Cost optimization
 * - Solution validation
 */
export default function SADashboard() {
  const designMetrics = [
    {
      name: 'Active Blueprints',
      value: '18',
      change: '+5',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: FileText,
    },
    {
      name: 'AI Suggestions Used',
      value: '142',
      change: '+28%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Sparkles,
    },
    {
      name: 'Est. Cost Savings',
      value: '$24.5K',
      change: '+12%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      name: 'Design Quality Score',
      value: '8.9/10',
      change: '+0.4',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: TrendingUp,
    },
  ];

  const myBlueprints = [
    {
      id: '1',
      name: 'E-Commerce Platform - AWS',
      status: 'In Progress',
      cloud: 'AWS',
      resources: 47,
      estimatedCost: '$3,200/mo',
      aiOptimizations: 8,
      lastModified: '2 hours ago',
      completeness: 75,
    },
    {
      id: '2',
      name: 'Data Analytics Pipeline - Azure',
      status: 'Ready for Review',
      cloud: 'Azure',
      resources: 32,
      estimatedCost: '$2,100/mo',
      aiOptimizations: 12,
      lastModified: '1 day ago',
      completeness: 95,
    },
    {
      id: '3',
      name: 'IoT Backend - GCP',
      status: 'Draft',
      cloud: 'GCP',
      resources: 28,
      estimatedCost: '$1,800/mo',
      aiOptimizations: 5,
      lastModified: '3 days ago',
      completeness: 45,
    },
  ];

  const aiRecommendations = [
    {
      id: '1',
      type: 'Cost Optimization',
      blueprint: 'E-Commerce Platform',
      suggestion: 'Switch to Reserved Instances for RDS',
      impact: 'High',
      savings: '$890/mo',
      confidence: 95,
    },
    {
      id: '2',
      type: 'Performance',
      blueprint: 'Data Analytics Pipeline',
      suggestion: 'Add CloudFront CDN for static assets',
      impact: 'Medium',
      savings: 'Latency -40%',
      confidence: 88,
    },
    {
      id: '3',
      type: 'Security',
      blueprint: 'IoT Backend',
      suggestion: 'Enable encryption at rest for all storage',
      impact: 'High',
      savings: 'Risk -60%',
      confidence: 92,
    },
    {
      id: '4',
      type: 'Scalability',
      blueprint: 'E-Commerce Platform',
      suggestion: 'Implement auto-scaling for API tier',
      impact: 'High',
      savings: 'Capacity +200%',
      confidence: 90,
    },
  ];

  const patternUsage = [
    { name: 'Microservices', count: 12, trend: 'up', description: 'Container-based architecture' },
    { name: 'Serverless API', count: 8, trend: 'up', description: 'Lambda + API Gateway' },
    { name: 'Data Lake', count: 5, trend: 'stable', description: 'S3 + Athena + Glue' },
    { name: 'Event-Driven', count: 7, trend: 'up', description: 'SNS/SQS messaging' },
    { name: 'CDN + WAF', count: 10, trend: 'stable', description: 'CloudFront security' },
  ];

  const costProjections = [
    { name: 'Jan', value: 18500 },
    { name: 'Feb', value: 19200 },
    { name: 'Mar', value: 17800 },
    { name: 'Apr', value: 21000 },
    { name: 'May', value: 19500 },
    { name: 'Jun', value: 18200 },
  ];

  const designQualityData = [
    { name: 'Week 1', value: 8.2 },
    { name: 'Week 2', value: 8.5 },
    { name: 'Week 3', value: 8.7 },
    { name: 'Week 4', value: 8.9 },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Solution Architect Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Blueprint Design & AI-Assisted Architecture
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/designer"
                className="btn-primary flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI Designer
              </Link>
              <Link
                to="/blueprints/new"
                className="btn-secondary"
              >
                New Blueprint
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Design Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designMetrics.map((metric, idx) => (
            <FadeIn key={metric.name} delay={idx * 100}>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {metric.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                      )}
                      <span className={`text-sm ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    metric.changeType === 'positive' 
                      ? 'bg-blue-100 dark:bg-blue-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <metric.icon className={`w-6 h-6 ${
                      metric.changeType === 'positive' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Cost Projections"
            data={costProjections}
            dataKey="value"
            color="#3b82f6"
          />
          <ChartCard
            title="Design Quality Trend"
            data={designQualityData}
            dataKey="value"
            color="#10b981"
          />
        </div>

        {/* My Blueprints */}
        <FadeIn delay={200}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  My Blueprints
                </h2>
                <Link
                  to="/blueprints"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {myBlueprints.map((blueprint) => (
                <div key={blueprint.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {blueprint.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          blueprint.status === 'Ready for Review'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : blueprint.status === 'In Progress'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {blueprint.status}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded text-xs font-medium">
                          {blueprint.cloud}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm text-gray-600 dark:text-gray-300">
                        <div>
                          <span className="block text-xs text-gray-500">Resources</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{blueprint.resources}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Est. Cost</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{blueprint.estimatedCost}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">AI Optimizations</span>
                          <span className="font-medium text-blue-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {blueprint.aiOptimizations}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Last Modified</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{blueprint.lastModified}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${blueprint.completeness}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {blueprint.completeness}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/blueprints/${blueprint.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* AI Recommendations */}
        <FadeIn delay={300}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AI Recommendations
                  </h2>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium">
                  {aiRecommendations.length} Active
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.type === 'Cost Optimization'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : rec.type === 'Security'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : rec.type === 'Performance'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                        }`}>
                          {rec.type}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{rec.blueprint}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mt-2">
                        {rec.suggestion}
                      </h3>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Impact:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            rec.impact === 'High'
                              ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                          }`}>
                            {rec.impact}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">{rec.savings}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Confidence:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{rec.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Apply
                      </button>
                      <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Pattern Usage */}
        <FadeIn delay={400}>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                My Pattern Usage
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patternUsage.map((pattern) => (
                  <div key={pattern.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {pattern.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {pattern.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-2xl font-bold text-blue-600">{pattern.count}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">uses</span>
                          {pattern.trend === 'up' && (
                            <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
