import { useState } from 'react';
import { Brain, Lightbulb, TrendingUp, Target, Zap, AlertCircle } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Alert from '../components/ui/Alert';

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

const AIInsights = () => {
  const [recommendations] = useState<AIRecommendation[]>([
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Insights & Recommendations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Intelligent analysis and optimization suggestions
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recommendations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {recommendations.length}
              </p>
            </div>
            <Lightbulb className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {recommendations.filter((r) => r.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                $5.4K
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                93%
              </p>
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
                        <button className="btn btn-secondary btn-sm">Dismiss</button>
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
  );
};

export default AIInsights;
