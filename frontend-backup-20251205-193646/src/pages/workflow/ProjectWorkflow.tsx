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
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Zap,
  Target,
  BarChart3,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* Modern Header with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 shadow-2xl"
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"
              style={{ backgroundSize: '200% 200%' }}
            />
            
            <div className="relative z-10 p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg"
                    >
                      <GitBranch className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                      Dharma IaC Workflow
                      {isConnected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 text-sm font-normal bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 bg-green-400 rounded-full"
                          ></motion.div>
                          Live Sync
                        </motion.span>
                      )}
                    </h1>
                  </div>
                  <p className="text-white/90 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Project orchestration from architecture to deployment
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {selectedProject && (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExportPDF}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-semibold flex items-center gap-2 border border-white/30 shadow-lg"
                      title="Export project report as PDF"
                    >
                      <FileDown className="w-5 h-5" />
                      Export PDF
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    New Project
                  </motion.button>
                </motion.div>
              </div>

              {/* Modern Stats with Glassmorphism */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                {[
                  { label: 'Total Projects', value: projectStats.totalProjects, icon: FolderOpen, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Active', value: projectStats.inProgress, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                  { label: 'Completed', value: projectStats.completed, icon: CheckCircle, color: 'from-purple-500 to-pink-500' },
                  { label: 'On Hold', value: projectStats.onHold, icon: Clock, color: 'from-yellow-500 to-orange-500' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-white/20 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}
                      >
                        <stat.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + idx * 0.1, type: "spring", stiffness: 200 }}
                        className="text-4xl font-bold"
                      >
                        {stat.value}
                      </motion.div>
                    </div>
                    <span className="text-sm text-white/90 font-semibold">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Project Selector with Modern Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Select Project
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => setSelectedProject(project.id)}
                    className={`relative overflow-hidden p-5 rounded-xl cursor-pointer transition-all shadow-lg ${
                      selectedProject === project.id
                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-500 shadow-indigo-500/30'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    {selectedProject === project.id && (
                      <motion.div
                        layoutId="activeProject"
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg">
                          {project.id}
                        </span>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getProjectStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </motion.span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            Progress
                          </span>
                          <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1, delay: idx * 0.1, type: "spring", stiffness: 100 }}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full shadow-lg"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                        <Calendar className="w-3 h-3" />
                        Target: {project.targetDate}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

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
