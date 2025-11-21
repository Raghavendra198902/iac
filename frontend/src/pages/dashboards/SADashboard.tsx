import { useState, useEffect } from 'react';
import { Lightbulb, FileText, Sparkles, TrendingUp, TrendingDown, DollarSign, Zap, ArrowRight } from 'lucide-react';
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
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'AI Suggestions Used',
      value: '142',
      change: '+28%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: Sparkles,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Est. Cost Savings',
      value: '$24.5K',
      change: '+12%',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Design Quality Score',
      value: '8.9/10',
      change: '+0.4',
      changeType: 'positive' as const,
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  // Load real data from APIs - no demo data
  const [myBlueprints, setMyBlueprints] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [patternUsage, setPatternUsage] = useState<any[]>([]);
  const [costProjections, setCostProjections] = useState<any[]>([]);
  const [designQualityData, setDesignQualityData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blueprintsRes, recommendationsRes, patternsRes, costsRes, qualityRes] = await Promise.all([
          fetch('/api/sa/blueprints'),
          fetch('/api/sa/recommendations'),
          fetch('/api/sa/patterns'),
          fetch('/api/metrics/cost-projections'),
          fetch('/api/metrics/design-quality')
        ]);
        if (blueprintsRes.ok) setMyBlueprints(await blueprintsRes.json());
        if (recommendationsRes.ok) setAiRecommendations(await recommendationsRes.json());
        if (patternsRes.ok) setPatternUsage(await patternsRes.json());
        if (costsRes.ok) setCostProjections(await costsRes.json());
        if (qualityRes.ok) setDesignQualityData(await qualityRes.json());
      } catch (error) {
        console.error('Failed to load SA dashboard data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Hero Section */}
        <FadeIn>
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    Solution Architect Dashboard
                    <Sparkles className="w-8 h-8" />
                  </h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Blueprint Design & AI-Assisted Architecture
                  </p>
                </div>
                <Link
                  to="/designer"
                  className="bg-white dark:bg-blue-600 text-blue-600 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 group shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  AI Designer
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Design Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designMetrics.map((metric, idx) => (
            <FadeIn key={metric.name} delay={idx * 100}>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="card p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{metric.name}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-1 mt-3">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-semibold ${
                          metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                      <metric.icon className="w-7 h-7 text-white" />
                    </div>
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
