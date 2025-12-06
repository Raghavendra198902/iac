import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Activity,
  Users,
  FileDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateDashboardPDF } from '../utils/pdfExport';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  status: string;
  targetDate: string;
  workflowSteps: any[];
}

export default function WorkflowDashboardWidget() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const [projectsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/projects`),
        fetch(`${API_URL}/projects/stats/summary`),
      ]);

      if (projectsRes.ok) {
        const projects = await projectsRes.json();
        setAllProjects(projects);
        setRecentProjects(projects.slice(0, 3)); // Top 3 recent
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast.error('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDashboard = () => {
    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown User';
    const exportData = allProjects.map(p => ({
      id: parseInt(p.id.replace('PRJ-', '')),
      name: p.name,
      description: '',
      status: p.status,
      priority: 'High',
      start_date: new Date().toISOString(),
      target_date: p.targetDate,
      completion_percentage: p.progress,
      created_at: new Date().toISOString(),
      created_by: userName,
    }));
    
    try {
      generateDashboardPDF(exportData);
      toast.success('Dashboard report exported successfully!');
    } catch (err: any) {
      toast.error('Failed to export dashboard report');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalProjects > 0 
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Project Workflows</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportDashboard}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              title="Export dashboard as PDF"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>
            <Link 
              to="/workflow" 
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalProjects}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.activeProjects}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">Done</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{stats.completedProjects}</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-900">On Hold</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">{stats.onHoldProjects}</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Overall Completion Rate</span>
            <span className="text-lg font-bold text-indigo-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Projects
        </h3>
        {recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.map((project) => {
              const completedSteps = project.workflowSteps?.filter(s => s.status === 'completed').length || 0;
              const totalSteps = project.workflowSteps?.length || 6;
              const stepsText = `${completedSteps}/${totalSteps} steps`;

              return (
                <Link 
                  key={project.id}
                  to="/workflow"
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{project.name}</div>
                      <div className="text-xs text-gray-600">{project.id}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : project.status === 'completed'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{stepsText}</span>
                    </div>
                    <div className="font-semibold text-indigo-600">{project.progress}%</div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            No projects yet. Create your first project!
          </div>
        )}

        {/* Bottleneck Alert */}
        {stats.activeProjects > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-semibold">Workflow Insight: </span>
                {stats.activeProjects} active {stats.activeProjects === 1 ? 'project' : 'projects'} in progress. 
                Monitor step completion to identify bottlenecks.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
