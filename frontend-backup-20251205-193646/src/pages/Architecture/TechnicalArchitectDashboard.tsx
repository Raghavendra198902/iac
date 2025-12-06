import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCode,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingDown,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { technicalArchitectApi } from '../../services/rolesApi';
import type { TADashboard, ArchitectureDebt, TechnologyEvaluation } from '../../types/roles';

const TechnicalArchitectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<TADashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await technicalArchitectApi.getDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getRecommendationColor = (recommendation: string): string => {
    const colors: Record<string, string> = {
      strongly_recommended: 'bg-green-100 text-green-800',
      recommended: 'bg-blue-100 text-blue-800',
      conditional: 'bg-yellow-100 text-yellow-800',
      not_recommended: 'bg-red-100 text-red-800',
    };
    return colors[recommendation] || 'bg-gray-100 text-gray-800';
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
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Technical Architect Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage technical specifications, evaluations, and architecture debt</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/architecture/technical-architect/specifications/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Spec
          </button>
          <button
            onClick={() => navigate('/architecture/technical-architect/evaluations/new')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Evaluation
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Specifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard.total_specifications}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileCode className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">
              <span className="font-medium">{dashboard.specifications_by_status.draft}</span> Draft
            </div>
            <div className="text-gray-600">
              <span className="font-medium">{dashboard.specifications_by_status.approved}</span> Approved
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tech Evaluations</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{dashboard.total_evaluations}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span className="font-medium text-orange-600">{dashboard.evaluations_pending_approval}</span>
            <span className="ml-1">pending approval</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Architecture Debt</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{dashboard.architecture_debt.total}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="text-red-600">
              <span className="font-medium">{dashboard.architecture_debt.critical}</span> Critical
            </div>
            <div className="text-orange-600">
              <span className="font-medium">{dashboard.architecture_debt.high}</span> High
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Debt Cost</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${(dashboard.debt_monthly_cost / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingDown className="w-4 h-4 mr-1" />
            Maintenance overhead
          </div>
        </div>
      </div>

      {/* Specification Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dashboard.specifications_by_status).map(([status, count]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 capitalize mb-1">{status.replace('_', ' ')}</p>
              <p className="text-3xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Debt Severity Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Architecture Debt by Severity</h2>
          <button
            onClick={() => navigate('/architecture/technical-architect/debt')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all debt →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-800">Critical</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">{dashboard.architecture_debt.critical}</p>
            <p className="text-xs text-red-600 mt-1">Immediate action required</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-800">High</span>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{dashboard.architecture_debt.high}</p>
            <p className="text-xs text-orange-600 mt-1">Address within quarter</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-800">Medium</span>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{dashboard.architecture_debt.medium}</p>
            <p className="text-xs text-yellow-600 mt-1">Plan for next phase</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Low</span>
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{dashboard.architecture_debt.low}</p>
            <p className="text-xs text-blue-600 mt-1">Monitor and track</p>
          </div>
        </div>
      </div>

      {/* Recent Specifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Specifications</h2>
            <button
              onClick={() => navigate('/architecture/technical-architect/specifications')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboard.recent_specifications.length > 0 ? (
            dashboard.recent_specifications.map((spec) => (
              <div
                key={spec.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/architecture/technical-architect/specifications/${spec.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{spec.spec_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        spec.status === 'approved' ? 'bg-green-100 text-green-800' :
                        spec.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {spec.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">v{spec.version}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{spec.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{spec.description}</p>
                    {spec.technology_stack && spec.technology_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {spec.technology_stack.slice(0, 5).map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                            {tech}
                          </span>
                        ))}
                        {spec.technology_stack.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{spec.technology_stack.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <FileCode className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No specifications yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Evaluations */}
      {dashboard.pending_evaluations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Technology Evaluations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.pending_evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/architecture/technical-architect/evaluations/${evaluation.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{evaluation.evaluation_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(evaluation.recommendation)}`}>
                        {evaluation.recommendation.replace('_', ' ')}
                      </span>
                      {evaluation.poc_required && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          POC {evaluation.poc_completed ? 'Completed' : 'Required'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {evaluation.technology_name} {evaluation.version}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{evaluation.category}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      {evaluation.pros && evaluation.pros.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Pros</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {evaluation.pros.slice(0, 2).map((pro, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="w-3 h-3 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {evaluation.cons && evaluation.cons.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Cons</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {evaluation.cons.slice(0, 2).map((con, idx) => (
                              <li key={idx} className="flex items-start">
                                <XCircle className="w-3 h-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Architecture Debt */}
      {dashboard.critical_debt.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200">
          <div className="p-6 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-red-900">Critical Architecture Debt</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.critical_debt.map((debt) => (
              <div
                key={debt.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/architecture/technical-architect/debt/${debt.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{debt.debt_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(debt.severity)}`}>
                        {debt.severity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        debt.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        debt.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        debt.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {debt.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{debt.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{debt.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {debt.affected_systems && debt.affected_systems.length > 0 && (
                        <span>{debt.affected_systems.length} systems affected</span>
                      )}
                      {debt.estimated_effort_days && (
                        <span>{debt.estimated_effort_days} days estimated</span>
                      )}
                      {debt.maintenance_cost_monthly && (
                        <span className="text-red-600 font-medium">
                          ${debt.maintenance_cost_monthly}/month cost
                        </span>
                      )}
                      <span className="font-medium">Priority: {debt.priority_score}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalArchitectDashboard;
