import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Target,
  AlertCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { projectManagerApi } from '../../services/rolesApi';
import type { PMDashboard, ArchitectureProject } from '../../types/roles';

const ProjectManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<PMDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await projectManagerApi.getDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string): string => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[health] || 'bg-gray-100 text-gray-800';
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'green':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'yellow':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'red':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      on_hold: 'bg-gray-100 text-gray-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMilestoneStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatBudget = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
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

  const budgetVarianceColor = dashboard.budget_variance_percentage > 0 
    ? 'text-red-600' 
    : 'text-green-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor projects, milestones, and dependencies</p>
        </div>
        <button
          onClick={() => navigate('/architecture/project-manager/projects/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard.total_projects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">
              <span className="font-medium">{dashboard.projects_by_status.in_progress}</span> Active
            </div>
            <div className="text-gray-600">
              <span className="font-medium">{dashboard.projects_by_status.completed}</span> Done
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Milestones</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{dashboard.upcoming_milestones}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            Next 30 days
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked Dependencies</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{dashboard.blocked_dependencies}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <Clock className="w-4 h-4 mr-1" />
            Immediate attention
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Variance</p>
              <p className={`text-3xl font-bold mt-2 ${budgetVarianceColor}`}>
                {dashboard.budget_variance_percentage > 0 ? '+' : ''}
                {dashboard.budget_variance_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Spent:</span>
              <span className="font-medium">{formatBudget(dashboard.spent_to_date)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{formatBudget(dashboard.total_budget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Health & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Health */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects by Health Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Green</p>
                  <p className="text-sm text-gray-600">On track</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">{dashboard.projects_by_health.green}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Yellow</p>
                  <p className="text-sm text-gray-600">Needs attention</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{dashboard.projects_by_health.yellow}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Red</p>
                  <p className="text-sm text-gray-600">Critical issues</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-red-600">{dashboard.projects_by_health.red}</p>
            </div>
          </div>
        </div>

        {/* Projects by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(dashboard.projects_by_status).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 capitalize mb-1">{status.replace('_', ' ')}</p>
                <p className="text-3xl font-bold text-gray-900">{count}</p>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'in_progress' ? 'bg-blue-500' :
                        status === 'planning' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}
                      style={{
                        width: `${(count / dashboard.total_projects) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button
              onClick={() => navigate('/architecture/project-manager/projects')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboard.recent_projects.length > 0 ? (
            dashboard.recent_projects.map((project) => (
              <div
                key={project.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/architecture/project-manager/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{project.project_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getHealthColor(project.health_status)}`}>
                        {getHealthIcon(project.health_status)}
                        <span className="ml-1">{project.health_status}</span>
                      </span>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                        {project.project_type.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.planned_end_date).toLocaleDateString()}
                        </span>
                      </div>
                      {project.total_budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatBudget(project.total_budget)}</span>
                          {project.spent_to_date && (
                            <span className="text-xs text-gray-400">
                              ({formatBudget(project.spent_to_date)} spent)
                            </span>
                          )}
                        </div>
                      )}
                      {project.stakeholders && project.stakeholders.length > 0 && (
                        <span>{project.stakeholders.length} stakeholders</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No projects yet. Create your first project to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* At-Risk Milestones */}
      {dashboard.at_risk_milestones.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200">
          <div className="p-6 border-b border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-lg font-semibold text-yellow-900">At-Risk Milestones</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.at_risk_milestones.map((milestone) => (
              <div key={milestone.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {milestone.completion_percentage}% complete
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.milestone_name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Planned: {new Date(milestone.planned_date).toLocaleDateString()}</span>
                      </div>
                      {milestone.actual_date && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Actual: {new Date(milestone.actual_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <span>{milestone.deliverables.length} deliverables</span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            milestone.completion_percentage >= 80 ? 'bg-green-500' :
                            milestone.completion_percentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${milestone.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Dependencies */}
      {dashboard.critical_dependencies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200">
          <div className="p-6 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-red-900">Critical Dependencies</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.critical_dependencies.map((dependency) => (
              <div key={dependency.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                        {dependency.dependency_type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dependency.criticality === 'critical' ? 'bg-red-100 text-red-800' :
                        dependency.criticality === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dependency.criticality}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dependency.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        dependency.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                        dependency.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {dependency.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{dependency.description}</p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Dependent on:</span> {dependency.dependent_on}
                    </p>
                    {dependency.required_by_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Required by: {new Date(dependency.required_by_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {dependency.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">{dependency.notes}</p>
                    )}
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

export default ProjectManagerDashboard;
