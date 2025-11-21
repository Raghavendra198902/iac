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
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🤖 AI Recommendations</h2>
          <p className="text-sm text-gray-500 mt-1">ML-powered insights to optimize your infrastructure</p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Analyzing your infrastructure...</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">🎉</p>
          <p>No recommendations at this time. Your infrastructure looks optimized!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="border-2 rounded-lg p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getImpactColor(rec.impact)}`}>
                      {rec.impact.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(rec.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {rec.description}
                  </p>
                  {rec.savings && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-green-700">
                        💰 Potential Savings: ${rec.savings}/month
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Recommended Actions:</p>
                    {rec.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start text-xs text-gray-600">
                        <span className="text-blue-500 mr-2">→</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredRecommendations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Total Potential Savings
              </p>
              <p className="text-2xl font-bold text-blue-900">
                ${filteredRecommendations.reduce((sum, r) => sum + (r.savings || 0), 0)}/month
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">
                {filteredRecommendations.length} recommendations
              </p>
              <p className="text-xs text-blue-600">
                Based on ML analysis
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
