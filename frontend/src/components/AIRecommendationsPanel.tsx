import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings?: number;
  confidence: number;
  actions: string[];
}

interface AIRecommendationsPanelProps {
  resourceType?: string;
  resourceId?: string;
}

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  resourceType = 'all',
  resourceId
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchRecommendations();
  }, [resourceType, resourceId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3011/api/ai/recommendations/cost-optimization', {
        resources: [],
        usage: {}
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Mock data for demo
      setRecommendations([
        {
          id: 'rec-1',
          type: 'cost',
          title: 'Rightsize EC2 Instance',
          description: 'Instance is underutilized (avg 15% CPU). Recommend downsizing to t3.medium',
          impact: 'medium',
          savings: 55,
          confidence: 0.92,
          actions: ['Resize instance', 'Update auto-scaling policies']
        },
        {
          id: 'rec-2',
          type: 'cost',
          title: 'Purchase Reserved Instances',
          description: 'Purchase reserved instances for steady-state workloads running 24/7',
          impact: 'high',
          savings: 175,
          confidence: 0.88,
          actions: ['Analyze usage patterns', 'Purchase 1-year reserved instances']
        },
        {
          id: 'rec-3',
          type: 'storage',
          title: 'Migrate to S3 Glacier',
          description: 'Migrate infrequently accessed data to S3 Glacier',
          impact: 'low',
          savings: 32,
          confidence: 0.95,
          actions: ['Set lifecycle policies', 'Archive old data']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === selectedCategory);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🤖 AI Recommendations</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">ML-powered insights to optimize your infrastructure</p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['all', 'cost', 'security', 'performance', 'storage'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Analyzing your infrastructure...</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p className="text-4xl mb-4">🎉</p>
          <p>No recommendations at this time. Your infrastructure looks optimized!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getImpactColor(rec.impact)}`}>
                      {rec.impact.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {(rec.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rec.description}
                  </p>
                  {rec.savings && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        💰 Potential Savings: ${rec.savings}/month
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Recommended Actions:</p>
                    {rec.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-primary-600 dark:text-primary-400 mr-2">→</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors whitespace-nowrap">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredRecommendations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Total Potential Savings
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                ${filteredRecommendations.reduce((sum, r) => sum + (r.savings || 0), 0)}/month
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {filteredRecommendations.length} recommendations
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Based on ML analysis
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationsPanel;
