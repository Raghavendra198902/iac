import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import CreateProjectModal from '../../components/CreateProjectModal';
import UpdateStepModal from '../../components/UpdateStepModal';
import ProjectAssetsModal from '../../components/ProjectAssetsModal';
import ActivityFeed from '../../components/ActivityFeed';
import { useWorkflowCollaboration } from '../../hooks/useWorkflowCollaboration';
import { generateProjectPDF } from '../../utils/pdfExport';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../../utils/userAvatar';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/api';
import {
  Layers,
  FileText,
  Database,
  Users,
  Code2,
  Rocket,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Clock,
  DollarSign,
  GitBranch,
  Settings,
  Play,
  Download,
  Plus,
  FolderOpen,
  Calendar,
  TrendingUp,
  Edit,
  Package,
  Bell,
  X as XIcon,
  FileDown,
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  stepNumber: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  ownerTeam: string;
  assignee: string;
  completedDate?: string;
  route: string;
  notes?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  createdBy: string;
  workflowSteps: WorkflowStep[];
}

const iconMap: Record<string, any> = {
  'ea-project': Layers,
  'sa-lld': FileText,
  'cmdb-config': Database,
  'pm-budget': DollarSign,
  'se-implementation': Code2,
  'agent-deployment': Rocket,
};

export default function ProjectWorkflow() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>('PRJ-001');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [assetsModalStep, setAssetsModalStep] = useState<{ stepId: string; stepTitle: string } | null>(null);

  // WebSocket collaboration
  const { notifications, clearNotification, emitStepUpdate, emitStepCompleted, isConnected } = useWorkflowCollaboration(selectedProject || '');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects(); // Refresh project list
  };

  const handleStepUpdated = () => {
    fetchProjects(); // Refresh to see updated progress
    if (selectedStep) {
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown User';
      emitStepUpdate(selectedProject || '', selectedStep.id, userName);
      if (selectedStep.status === 'completed') {
        emitStepCompleted(selectedProject || '', selectedStep.id, selectedStep.title, userName);
      }
    }
  };

  const openUpdateStepModal = (step: WorkflowStep) => {
    setSelectedStep(step);
    setIsUpdateModalOpen(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-gray-100 font-semibold">Loading projects...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-semibold mb-2">Error Loading Projects</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentProject = projects.find((p) => p.id === selectedProject);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 animate-spin" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const projectStats = {
    totalProjects: projects.length,
    inProgress: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    onHold: projects.filter((p) => p.status === 'on-hold').length,
  };

  const handleExportPDF = async () => {
    if (!selectedProject) return;

    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    try {
      // Fetch assets for the project
      const assetsResponse = await fetch(`${API_URL}/assets/project/${selectedProject}`);
      const assets = assetsResponse.ok ? await assetsResponse.json() : [];

      // Transform data for PDF
      const exportData = {
        project: {
          id: parseInt(project.id.replace('PRJ-', '')),
          name: project.name,
          description: project.description,
          status: project.status,
          priority: 'High', // Default priority
          start_date: project.createdDate,
          target_date: project.targetDate,
          completion_percentage: project.progress,
          created_at: project.createdDate,
          created_by: project.createdBy,
        },
        steps: project.workflowSteps.map(step => ({
          id: parseInt(step.id.replace(/[^\d]/g, '')),
          step_name: step.title,
          status: step.status.replace('-', '_'),
          assigned_to: step.assignee,
          started_at: step.status !== 'pending' ? project.createdDate : null,
          completed_at: step.completedDate || null,
          notes: step.notes || null,
          estimated_hours: 40, // Default estimate
          actual_hours: step.status === 'completed' ? 35 : null,
        })),
        assets: assets,
      };

      generateProjectPDF(exportData);
      toast.success('PDF report generated successfully!');
    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      toast.error(`Failed to export PDF: ${err.message || 'Unknown error'}`);
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                Project Workflow Management
                {isConnected && (
                  <span className="flex items-center gap-2 text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Live
                  </span>
                )}
              </h1>
              <p className="text-indigo-100 text-lg">
                Track projects from Architecture Design to Deployment
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedProject && (
                <button 
                  onClick={handleExportPDF}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-semibold flex items-center gap-2 border border-white/30"
                  title="Export project report as PDF"
                >
                  <FileDown className="w-5 h-5" />
                  Export PDF
                </button>
              )}
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Projects', value: projectStats.totalProjects, icon: FolderOpen },
              { label: 'Active', value: projectStats.inProgress, icon: TrendingUp },
              { label: 'Completed', value: projectStats.completed, icon: CheckCircle },
              { label: 'On Hold', value: projectStats.onHold, icon: Clock },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5" />
                  <span className="text-sm text-indigo-100">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Select Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProject === project.id
                    ? 'border-indigo-600 bg-white dark:bg-gray-700 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{project.id}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${getProjectStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-800 dark:text-gray-300 font-medium mb-3">{project.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-900 dark:text-gray-100">
                    <span>Progress</span>
                    <span className="font-bold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Calendar className="w-3 h-3" />
                    Target: {project.targetDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Integrated Workflow Process</h2>
          <div className="prose prose-sm max-w-none text-gray-900 dark:text-gray-100">
            <p className="mb-4 font-medium">
              This comprehensive workflow ensures seamless collaboration across all teams from initial
              architecture design to final deployment:
            </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-600">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Architecture Phase
                </h3>
                <ul className="text-sm space-y-1 text-gray-800 dark:text-gray-200 font-medium">
                  <li>• EA creates project charter and HLD</li>
                  <li>• SA develops detailed Solution Architecture</li>
                  <li>• LLD defines technical implementation details</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-600">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  Configuration Phase
                </h3>
                <ul className="text-sm space-y-1 text-gray-800 dark:text-gray-200 font-medium">
                  <li>• CMDB identifies infrastructure assets</li>
                  <li>• Configuration items mapped to design</li>
                  <li>• Resource inventory validated</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-green-300 dark:border-green-600">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Planning Phase
                </h3>
                <ul className="text-sm space-y-1 text-gray-800 dark:text-gray-200 font-medium">
                  <li>• PM creates project budget</li>
                  <li>• Team members assigned to tasks</li>
                  <li>• Resources allocated and tracked</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-orange-300 dark:border-orange-600">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-orange-600" />
                  Implementation Phase
                </h3>
                <ul className="text-sm space-y-1 text-gray-800 dark:text-gray-200 font-medium">
                  <li>• SE designs implementation flow</li>
                  <li>• Automation playbooks created</li>
                  <li>• Agents execute deployment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Notifications */}
        {notifications.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-blue-300 dark:border-blue-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Live Updates ({notifications.length})
              </h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-600 flex items-start gap-3 hover:shadow-md transition-shadow"
                >
                  {/* User Avatar */}
                  <UserAvatar name={notification.userName} size="sm" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.type === 'step-completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {notification.type === 'step-update' && (
                        <Edit className="w-4 h-4 text-blue-600" />
                      )}
                      {notification.type === 'progress-update' && (
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{notification.userName}</span>
                      <span className="text-xs text-gray-800 dark:text-gray-300 font-semibold">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-300 font-medium">{notification.message}</p>
                  </div>
                  
                  <button
                    onClick={() => clearNotification(notification.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                  >
                    <XIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Project Workflow */}
        {currentProject && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentProject.name}</h2>
                  <p className="text-gray-800 dark:text-gray-300 font-medium">{currentProject.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">{currentProject.progress}%</div>
                  <div className="text-sm text-gray-800 dark:text-gray-300 font-semibold">Complete</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-800 dark:text-gray-300 font-semibold">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Started: {currentProject.createdDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Target: {currentProject.targetDate}
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Workflow Steps for {currentProject.id}</h2>
              {currentProject.workflowSteps.map((step, index) => {
            const Icon = iconMap[step.id] || Layers;
            const isLast = index === currentProject.workflowSteps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute left-8 top-20 w-0.5 h-full bg-gray-300 dark:bg-gray-600 -ml-0.5" />
                )}

                {/* Step Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:shadow-lg transition-all">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            step.status === 'completed'
                              ? 'bg-green-100'
                              : step.status === 'in-progress'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`w-8 h-8 ${
                              step.status === 'completed'
                                ? 'text-green-600'
                                : step.status === 'in-progress'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{step.title}</h3>
                            <p className="text-gray-800 dark:text-gray-300 text-sm font-medium">{step.description}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(
                              step.status
                            )}`}
                          >
                            {getStatusIcon(step.status)}
                            {step.status.charAt(0).toUpperCase() + step.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>

                        {/* Owner & Assignee */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300 font-semibold">
                            <Users className="w-4 h-4" />
                            <span>Team: {step.ownerTeam}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300 font-semibold">
                            <Users className="w-4 h-4" />
                            <span>Assigned: {step.assignee}</span>
                          </div>
                        </div>

                        {/* Completed Date */}
                        {step.completedDate && (
                          <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed on {step.completedDate}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <a
                            href={step.route}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold no-underline"
                          >
                            {step.status === 'pending' ? 'Start' : step.status === 'in-progress' ? 'Continue' : 'View'}
                            <ChevronRight className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => openUpdateStepModal(step)}
                            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                          >
                            <Edit className="w-4 h-4" />
                            Update
                          </button>
                          {step.id === 'cmdb-config' && (
                            <button 
                              onClick={() => {
                                setAssetsModalStep({ stepId: step.id, stepTitle: step.title });
                                setIsAssetsModalOpen(true);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                            >
                              <Package className="w-4 h-4" />
                              View Assets
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}

        {/* Integration Points */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-indigo-300 dark:border-indigo-600 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Integration Points & Data Flow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-indigo-300 dark:border-indigo-600">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">EA → SA → CMDB</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300 font-medium">
                Architecture documents (HLD/SA/LLD) reference CMDB configuration items for infrastructure mapping
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-indigo-300 dark:border-indigo-600">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">CMDB → PM → SE</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300 font-medium">
                CMDB assets inform budget planning and resource allocation for implementation teams
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-indigo-300 dark:border-indigo-600">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">SE → Agents → Deployment</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300 font-medium">
                Implementation playbooks are executed by agents on CMDB-tracked infrastructure
              </p>
            </div>
          </div>
        </div>

        {/* Activity Feed for Selected Project */}
        {selectedProject && (
          <div className="mb-8">
            <ActivityFeed 
              projectId={selectedProject}
              maxItems={15}
              showFilters={false}
              compact={true}
              height="400px"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/ea/repository?doc=sa"
              className="p-4 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 no-underline"
            >
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">Create SA Document</div>
                <div className="text-sm text-gray-800 dark:text-gray-300 font-medium">Start with Solution Architecture</div>
              </div>
            </a>
            <a
              href="/cmdb"
              className="p-4 border-2 border-purple-300 dark:border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 no-underline"
            >
              <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">View CMDB Assets</div>
                <div className="text-sm text-gray-800 dark:text-gray-300 font-medium">Browse configuration items</div>
              </div>
            </a>
            <a
              href="/agents/downloads"
              className="p-4 border-2 border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 no-underline"
            >
              <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">Download Agents</div>
                <div className="text-sm text-gray-800 dark:text-gray-300 font-medium">Deploy automation agents</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      
      {selectedStep && (
        <UpdateStepModal 
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedStep(null);
          }}
          onStepUpdated={handleStepUpdated}
          projectId={selectedProject || ''}
          step={selectedStep}
        />
      )}
      
      {currentProject && (
        <ProjectAssetsModal 
          isOpen={isAssetsModalOpen}
          onClose={() => {
            setIsAssetsModalOpen(false);
            setAssetsModalStep(null);
          }}
          projectId={currentProject.id}
          projectName={currentProject.name}
          stepId={assetsModalStep?.stepId}
          stepTitle={assetsModalStep?.stepTitle}
        />
      )}
    </MainLayout>
  );
}
