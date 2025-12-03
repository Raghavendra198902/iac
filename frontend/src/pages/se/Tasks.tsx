import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Users,
  Calendar,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Code2,
  GitBranch,
  Bug,
  Zap,
  Shield,
  Database,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignee: string;
  dueDate: string;
  createdDate: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
}

export default function SETasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // For now, use demo data until backend is connected
      const demoTasks: Task[] = [
        {
          id: '1',
          taskNumber: 'SE-001',
          title: 'Implement Authentication Middleware',
          description: 'Create JWT authentication middleware for API Gateway with token validation and refresh logic',
          status: 'in-progress',
          priority: 'high',
          category: 'Backend',
          assignee: 'John Doe',
          dueDate: '2025-12-10',
          createdDate: '2025-12-01',
          estimatedHours: 16,
          actualHours: 8,
          tags: ['security', 'middleware', 'api'],
        },
        {
          id: '2',
          taskNumber: 'SE-002',
          title: 'Database Migration Script for User Roles',
          description: 'Create Alembic migration to add role-based access control tables and indexes',
          status: 'todo',
          priority: 'high',
          category: 'Database',
          assignee: 'Unassigned',
          dueDate: '2025-12-08',
          createdDate: '2025-12-02',
          estimatedHours: 8,
          tags: ['database', 'migration', 'rbac'],
        },
        {
          id: '3',
          taskNumber: 'SE-003',
          title: 'Frontend Component Library Setup',
          description: 'Initialize Storybook and create reusable React component library with TypeScript',
          status: 'review',
          priority: 'medium',
          category: 'Frontend',
          assignee: 'Jane Smith',
          dueDate: '2025-12-12',
          createdDate: '2025-11-28',
          estimatedHours: 24,
          actualHours: 22,
          tags: ['frontend', 'components', 'storybook'],
        },
        {
          id: '4',
          taskNumber: 'SE-004',
          title: 'Fix Memory Leak in Agent Service',
          description: 'Investigate and fix memory leak occurring during long-running agent data collection cycles',
          status: 'in-progress',
          priority: 'critical',
          category: 'Agent',
          assignee: 'Mike Johnson',
          dueDate: '2025-12-05',
          createdDate: '2025-12-03',
          estimatedHours: 12,
          actualHours: 6,
          tags: ['bug', 'performance', 'agent'],
        },
        {
          id: '5',
          taskNumber: 'SE-005',
          title: 'Unit Tests for AI Recommendations Engine',
          description: 'Write comprehensive unit tests for AI recommendation algorithms with mock data',
          status: 'todo',
          priority: 'medium',
          category: 'AI/ML',
          assignee: 'Sarah Chen',
          dueDate: '2025-12-15',
          createdDate: '2025-12-01',
          estimatedHours: 20,
          tags: ['testing', 'ai', 'unit-tests'],
        },
        {
          id: '6',
          taskNumber: 'SE-006',
          title: 'API Rate Limiting Implementation',
          description: 'Implement Redis-based rate limiting for public API endpoints with configurable thresholds',
          status: 'done',
          priority: 'high',
          category: 'Backend',
          assignee: 'David Lee',
          dueDate: '2025-12-01',
          createdDate: '2025-11-20',
          estimatedHours: 16,
          actualHours: 14,
          tags: ['api', 'security', 'redis'],
        },
        {
          id: '7',
          taskNumber: 'SE-007',
          title: 'Optimize SQL Query Performance',
          description: 'Optimize slow queries in reporting module using indexes and query restructuring',
          status: 'blocked',
          priority: 'high',
          category: 'Database',
          assignee: 'Emily Wang',
          dueDate: '2025-12-09',
          createdDate: '2025-11-30',
          estimatedHours: 10,
          actualHours: 4,
          tags: ['database', 'performance', 'optimization'],
        },
        {
          id: '8',
          taskNumber: 'SE-008',
          title: 'Docker Multi-Stage Build Optimization',
          description: 'Reduce Docker image sizes using multi-stage builds and Alpine base images',
          status: 'todo',
          priority: 'low',
          category: 'DevOps',
          assignee: 'Unassigned',
          dueDate: '2025-12-20',
          createdDate: '2025-12-02',
          estimatedHours: 8,
          tags: ['docker', 'devops', 'optimization'],
        },
        {
          id: '9',
          taskNumber: 'SE-009',
          title: 'Security Audit for File Upload Feature',
          description: 'Conduct security review of file upload endpoints including validation, sanitization, and virus scanning',
          status: 'in-progress',
          priority: 'critical',
          category: 'Security',
          assignee: 'Alex Rivera',
          dueDate: '2025-12-06',
          createdDate: '2025-12-02',
          estimatedHours: 12,
          actualHours: 8,
          tags: ['security', 'audit', 'files'],
        },
        {
          id: '10',
          taskNumber: 'SE-010',
          title: 'Performance Monitoring Dashboard',
          description: 'Create Grafana dashboards for application performance metrics and alerts',
          status: 'review',
          priority: 'medium',
          category: 'Observability',
          assignee: 'Tom Brown',
          dueDate: '2025-12-14',
          createdDate: '2025-11-25',
          estimatedHours: 16,
          actualHours: 15,
          tags: ['monitoring', 'grafana', 'observability'],
        },
      ];
      setTasks(demoTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'review':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'blocked':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Backend':
        return Code2;
      case 'Frontend':
        return BarChart3;
      case 'Database':
        return Database;
      case 'Agent':
        return Zap;
      case 'Security':
        return Shield;
      case 'DevOps':
        return GitBranch;
      case 'AI/ML':
        return Zap;
      default:
        return Code2;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const statusCounts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 rounded-xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Code2 className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Software Engineering Tasks</h1>
                <p className="text-indigo-100 text-lg">
                  Track and manage engineering deliverables across the development lifecycle
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {[
              { label: 'To Do', value: statusCounts.todo, icon: Clock, color: 'bg-gray-500' },
              { label: 'In Progress', value: statusCounts['in-progress'], icon: Play, color: 'bg-blue-500' },
              { label: 'In Review', value: statusCounts.review, icon: Users, color: 'bg-purple-500' },
              { label: 'Blocked', value: statusCounts.blocked, icon: AlertCircle, color: 'bg-red-500' },
              { label: 'Completed', value: statusCounts.done, icon: CheckCircle2, color: 'bg-green-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/25"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 ${stat.color} rounded-lg`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-indigo-100">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by title, description, or task number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
              <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or create a new task</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => {
              const CategoryIcon = getCategoryIcon(task.category);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <CategoryIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{task.taskNumber}</span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{task.title}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">{task.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {task.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">{task.assignee}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">Due: {task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">
                              {task.actualHours || 0}h / {task.estimatedHours}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(task.status)}`}>
                        {task.status.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-700">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
