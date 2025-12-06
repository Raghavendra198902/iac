import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageCircle,
  Plus,
  Eye,
  ThumbsUp,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { softwareEngineerApi } from '../../services/rolesApi';
import type { SEDashboard, ImplementationTask, CodeReview, ArchitectureQuestion } from '../../types/roles';

const SoftwareEngineerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<SEDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await softwareEngineerApi.getDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      in_review: 'bg-purple-100 text-purple-800',
      blocked: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityColor = (complexity: string): string => {
    const colors: Record<string, string> = {
      trivial: 'bg-green-100 text-green-800',
      simple: 'bg-blue-100 text-blue-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      complex: 'bg-orange-100 text-orange-800',
      very_complex: 'bg-red-100 text-red-800',
    };
    return colors[complexity] || 'bg-gray-100 text-gray-800';
  };

  const getReviewStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      changes_requested: 'bg-red-100 text-red-800',
      commented: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getQuestionStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      open: 'bg-yellow-100 text-yellow-800',
      answered: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getQualityScoreColor = (score?: number): string => {
    if (!score) return 'text-gray-500';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
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
          <h1 className="text-3xl font-bold text-gray-900">Software Engineer Dashboard</h1>
          <p className="text-gray-600 mt-1">Track tasks, code reviews, and architecture questions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/architecture/software-engineer/tasks/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
          <button
            onClick={() => navigate('/architecture/software-engineer/questions/new')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ask Question
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Tasks</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{dashboard.my_tasks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">{dashboard.total_tasks}</span> total tasks
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{dashboard.pending_code_reviews}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <GitBranch className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            Awaiting review
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Code Quality</p>
              <p className={`text-3xl font-bold mt-2 ${getQualityScoreColor(dashboard.avg_code_quality_score)}`}>
                {dashboard.avg_code_quality_score ? dashboard.avg_code_quality_score.toFixed(1) : 'N/A'}
                {dashboard.avg_code_quality_score && <span className="text-lg">/10</span>}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            Average score
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Questions</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{dashboard.open_questions}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            {dashboard.blocking_questions > 0 && (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                {dashboard.blocking_questions} blocking
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(dashboard.tasks_by_status).map(([status, count]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(status)}`}>
                  {status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{count}</p>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'blocked' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}
                    style={{
                      width: `${(count / dashboard.total_tasks) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <button
              onClick={() => navigate('/architecture/software-engineer/tasks')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboard.recent_tasks.length > 0 ? (
            dashboard.recent_tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/architecture/software-engineer/tasks/${task.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{task.task_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(task.complexity)}`}>
                        {task.complexity.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {task.task_type.replace('_', ' ')}
                      </span>
                      {task.status === 'blocked' && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          Blocked
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{task.estimated_hours}h estimated</span>
                          {task.actual_hours && <span className="text-xs">({task.actual_hours}h actual)</span>}
                        </div>
                      )}
                      {task.branch_name && (
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-4 h-4" />
                          <span className="font-mono text-xs">{task.branch_name}</span>
                        </div>
                      )}
                      {task.priority && (
                        <span className="font-medium">Priority: {task.priority}</span>
                      )}
                    </div>
                    {task.blocked_reason && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        <span className="font-medium">Blocked:</span> {task.blocked_reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No tasks yet. Create your first task to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Code Reviews */}
      {dashboard.pending_reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Code Reviews</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.pending_reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReviewStatusColor(review.review_status)}`}>
                        {review.review_status.replace('_', ' ')}
                      </span>
                      {review.code_quality_score && (
                        <span className={`text-sm font-medium ${getQualityScoreColor(review.code_quality_score)}`}>
                          Quality: {review.code_quality_score}/10
                        </span>
                      )}
                    </div>
                    <a
                      href={review.pull_request_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-mono text-sm mb-2 block"
                    >
                      {review.pull_request_url}
                    </a>
                    <p className="text-sm text-gray-700 mb-3">{review.comments}</p>
                    {(review.critical_issues.length > 0 || review.major_issues.length > 0 || review.minor_issues.length > 0) && (
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        {review.critical_issues.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-xs font-medium text-red-800 mb-1">Critical Issues</p>
                            <ul className="text-xs text-red-700 space-y-1">
                              {review.critical_issues.slice(0, 2).map((issue, idx) => (
                                <li key={idx} className="line-clamp-1">• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {review.major_issues.length > 0 && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-3">
                            <p className="text-xs font-medium text-orange-800 mb-1">Major Issues</p>
                            <ul className="text-xs text-orange-700 space-y-1">
                              {review.major_issues.slice(0, 2).map((issue, idx) => (
                                <li key={idx} className="line-clamp-1">• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {review.minor_issues.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-xs font-medium text-yellow-800 mb-1">Minor Issues</p>
                            <ul className="text-xs text-yellow-700 space-y-1">
                              {review.minor_issues.slice(0, 2).map((issue, idx) => (
                                <li key={idx} className="line-clamp-1">• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
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

      {/* Recent Questions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Architecture Questions</h2>
            </div>
            <button
              onClick={() => navigate('/architecture/software-engineer/questions')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboard.recent_questions.length > 0 ? (
            dashboard.recent_questions.map((question) => (
              <div
                key={question.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/architecture/software-engineer/questions/${question.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{question.question_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionStatusColor(question.status)}`}>
                        {question.status}
                      </span>
                      {question.is_blocking && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Blocking
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{question.question_details}</p>
                    {question.related_component && (
                      <p className="text-sm text-gray-500 mb-3">
                        <span className="font-medium">Component:</span> {question.related_component}
                      </p>
                    )}
                    {question.answer && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs font-medium text-green-800 mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Answer
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">{question.answer}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{question.views_count} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{question.helpful_votes} helpful</span>
                      </div>
                      <span>{new Date(question.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No questions yet. Ask your first architecture question.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoftwareEngineerDashboard;
