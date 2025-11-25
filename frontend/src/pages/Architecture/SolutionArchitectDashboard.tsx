import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Package,
  Eye,
  Plus,
  Filter,
  Download,
} from 'lucide-react';
import { solutionArchitectApi } from '../../services/rolesApi';
import type { SADashboard, SolutionDesign, SolutionPattern } from '../../types/roles';

const SolutionArchitectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<SADashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await solutionArchitectApi.getDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDesign = () => {
    navigate('/architecture/solution-architect/designs/new');
  };

  const handleViewDesign = (id: number) => {
    navigate(`/architecture/solution-architect/designs/${id}`);
  };

  const handleViewPattern = (id: number) => {
    navigate(`/architecture/solution-architect/patterns/${id}`);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      implemented: 'bg-purple-100 text-purple-800',
      deprecated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'in_review':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'implemented':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solution Architect Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage solution designs, patterns, and reviews</p>
        </div>
        <button
          onClick={handleCreateDesign}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Design
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Designs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard.total_designs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            All solution designs
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{dashboard.pending_reviews}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Eye className="w-4 h-4 mr-1" />
            Awaiting review
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pattern Library</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{dashboard.patterns_library_count}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            Reusable patterns
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {dashboard.avg_review_time_days.toFixed(1)}
                <span className="text-lg ml-1">days</span>
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            Review efficiency
          </div>
        </div>
      </div>

      {/* Design Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Designs by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dashboard.designs_by_status).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Designs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Designs</h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboard.recent_designs.length > 0 ? (
            dashboard.recent_designs.map((design) => (
              <div
                key={design.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewDesign(design.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{design.design_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(design.status)}`}>
                        {design.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">v{design.version}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{design.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{design.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {design.technology_stack && design.technology_stack.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>{design.technology_stack.length} technologies</span>
                        </div>
                      )}
                      {design.estimated_cost && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${design.estimated_cost.toLocaleString()}</span>
                          <span>estimated</span>
                        </div>
                      )}
                      {design.estimated_timeline_weeks && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{design.estimated_timeline_weeks} weeks</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No designs yet. Create your first solution design to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Reviews */}
      {dashboard.pending_review_list.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.pending_review_list.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.review_type === 'security_review' ? 'bg-red-100 text-red-800' :
                        review.review_type === 'technical_review' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {review.review_type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        review.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {review.approval_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comments}</p>
                    {review.recommendations && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Recommendations:</span> {review.recommendations}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Patterns */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Popular Patterns</h2>
            <button
              onClick={() => navigate('/architecture/solution-architect/patterns')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {dashboard.popular_patterns.length > 0 ? (
            dashboard.popular_patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewPattern(pattern.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pattern.category === 'security' ? 'bg-red-100 text-red-800' :
                    pattern.category === 'performance' ? 'bg-green-100 text-green-800' :
                    pattern.category === 'integration' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {pattern.category}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {pattern.usage_count} uses
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{pattern.pattern_name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{pattern.description}</p>
                {pattern.benefits && pattern.benefits.length > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>{pattern.benefits.length} benefits</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No patterns available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionArchitectDashboard;
