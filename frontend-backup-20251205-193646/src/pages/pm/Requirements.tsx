import { useState } from 'react';
import { MainLayout } from '../../components/layout';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Tag,
  Link2,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
  Shield,
  Zap,
  Database,
  Layout,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Requirement {
  id: string;
  reqId: string;
  title: string;
  description: string;
  type: 'functional' | 'non-functional' | 'technical' | 'business';
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  assignee: string;
  stakeholder: string;
  acceptanceCriteria: string[];
  dependencies: string[];
  estimatedEffort: string;
  createdDate: string;
  updatedDate: string;
  tags: string[];
}

export default function Requirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      reqId: 'REQ-001',
      title: 'User Authentication System',
      description: 'Implement secure user authentication with JWT tokens, password hashing, and multi-factor authentication support',
      type: 'functional',
      category: 'Security',
      priority: 'critical',
      status: 'in-progress',
      assignee: 'Security Team',
      stakeholder: 'CTO',
      acceptanceCriteria: [
        'Users can register with email and password',
        'Password must meet complexity requirements (12+ chars, uppercase, lowercase, numbers, symbols)',
        'JWT tokens expire after 15 minutes with refresh token mechanism',
        'Support for 2FA via authenticator apps',
        'Account lockout after 5 failed login attempts',
      ],
      dependencies: ['REQ-005', 'REQ-012'],
      estimatedEffort: '3 weeks',
      createdDate: '2025-11-15',
      updatedDate: '2025-12-01',
      tags: ['auth', 'security', 'backend'],
    },
    {
      id: '2',
      reqId: 'REQ-002',
      title: 'Real-time Agent Monitoring Dashboard',
      description: 'Create a live dashboard displaying all deployed agents with CPU, memory, disk, and network metrics updated every 30 seconds',
      type: 'functional',
      category: 'Frontend',
      priority: 'high',
      status: 'completed',
      assignee: 'Frontend Team',
      stakeholder: 'Product Manager',
      acceptanceCriteria: [
        'Display all agents in a grid/list view',
        'Show real-time metrics: CPU %, Memory %, Disk %, Network I/O',
        'Color-coded status indicators (online/offline/warning)',
        'Auto-refresh every 30 seconds',
        'Support dark mode',
        'Filter agents by status, OS, or hostname',
      ],
      dependencies: ['REQ-010'],
      estimatedEffort: '2 weeks',
      createdDate: '2025-11-01',
      updatedDate: '2025-11-28',
      tags: ['frontend', 'monitoring', 'dashboard'],
    },
    {
      id: '3',
      reqId: 'REQ-003',
      title: 'Database Performance - 99.9% Uptime',
      description: 'PostgreSQL database must maintain 99.9% uptime with automatic failover and replication',
      type: 'non-functional',
      category: 'Database',
      priority: 'critical',
      status: 'approved',
      assignee: 'DevOps Team',
      stakeholder: 'Infrastructure Lead',
      acceptanceCriteria: [
        'Primary-replica replication configured',
        'Automatic failover in under 30 seconds',
        'Connection pooling with 100+ concurrent connections',
        'Query response time < 100ms for 95th percentile',
        'Automated daily backups with 30-day retention',
      ],
      dependencies: [],
      estimatedEffort: '4 weeks',
      createdDate: '2025-10-20',
      updatedDate: '2025-11-25',
      tags: ['database', 'performance', 'ha'],
    },
    {
      id: '4',
      reqId: 'REQ-004',
      title: 'Cross-Platform Agent Deployment',
      description: 'Agents must run on Windows, Linux, and macOS with consistent functionality and automatic updates',
      type: 'functional',
      category: 'Agent',
      priority: 'high',
      status: 'in-progress',
      assignee: 'Agent Team',
      stakeholder: 'Engineering Manager',
      acceptanceCriteria: [
        'Single codebase supports Windows 10+, Ubuntu 20.04+, macOS 11+',
        'Agent binary size < 50MB',
        'Self-update mechanism with signature verification',
        'Service installation via MSI (Windows), systemd (Linux), launchd (macOS)',
        'Graceful shutdown and restart capabilities',
      ],
      dependencies: ['REQ-007'],
      estimatedEffort: '6 weeks',
      createdDate: '2025-11-10',
      updatedDate: '2025-12-02',
      tags: ['agent', 'cross-platform', 'deployment'],
    },
    {
      id: '5',
      reqId: 'REQ-005',
      title: 'Role-Based Access Control (RBAC)',
      description: 'Implement fine-grained permissions system with predefined roles and custom role creation',
      type: 'functional',
      category: 'Security',
      priority: 'high',
      status: 'approved',
      assignee: 'Backend Team',
      stakeholder: 'Security Officer',
      acceptanceCriteria: [
        'Predefined roles: Admin, Manager, Engineer, Viewer',
        'Granular permissions for each API endpoint',
        'Custom role creation with permission assignment',
        'Role inheritance support',
        'Audit logging for permission changes',
      ],
      dependencies: ['REQ-001'],
      estimatedEffort: '3 weeks',
      createdDate: '2025-11-18',
      updatedDate: '2025-11-30',
      tags: ['rbac', 'security', 'permissions'],
    },
    {
      id: '6',
      reqId: 'REQ-006',
      title: 'API Response Time < 200ms',
      description: 'All API endpoints must respond within 200ms for 95th percentile under normal load',
      type: 'non-functional',
      category: 'Performance',
      priority: 'high',
      status: 'draft',
      assignee: 'Backend Team',
      stakeholder: 'Technical Architect',
      acceptanceCriteria: [
        'P95 response time < 200ms for all endpoints',
        'P99 response time < 500ms',
        'Database queries optimized with proper indexing',
        'Redis caching for frequently accessed data',
        'Load testing with 1000 concurrent users',
      ],
      dependencies: ['REQ-003'],
      estimatedEffort: '2 weeks',
      createdDate: '2025-11-22',
      updatedDate: '2025-11-22',
      tags: ['performance', 'api', 'optimization'],
    },
    {
      id: '7',
      reqId: 'REQ-007',
      title: 'Secure Agent-Server Communication',
      description: 'All agent-to-server communication must use TLS 1.3 with certificate pinning',
      type: 'technical',
      category: 'Security',
      priority: 'critical',
      status: 'approved',
      assignee: 'Security Team',
      stakeholder: 'CISO',
      acceptanceCriteria: [
        'TLS 1.3 enforced for all agent connections',
        'Certificate pinning implemented in agent',
        'Certificate rotation every 90 days',
        'Mutual TLS (mTLS) for agent authentication',
        'No plaintext data transmission',
      ],
      dependencies: [],
      estimatedEffort: '2 weeks',
      createdDate: '2025-10-25',
      updatedDate: '2025-11-20',
      tags: ['security', 'tls', 'encryption'],
    },
    {
      id: '8',
      reqId: 'REQ-008',
      title: 'Compliance Audit Trail',
      description: 'System must maintain complete audit trail of all user actions and system events for compliance',
      type: 'business',
      category: 'Compliance',
      priority: 'critical',
      status: 'in-progress',
      assignee: 'Backend Team',
      stakeholder: 'Compliance Officer',
      acceptanceCriteria: [
        'Log all authentication attempts (success/failure)',
        'Track all CRUD operations with user, timestamp, changes',
        'Immutable audit logs stored separately from application DB',
        'Audit log retention for 7 years',
        'Export audit logs in CSV/JSON format',
      ],
      dependencies: ['REQ-005'],
      estimatedEffort: '3 weeks',
      createdDate: '2025-11-12',
      updatedDate: '2025-11-29',
      tags: ['compliance', 'audit', 'logging'],
    },
    {
      id: '9',
      reqId: 'REQ-009',
      title: 'Mobile App for Agent Management',
      description: 'iOS and Android apps for monitoring and managing agents on-the-go',
      type: 'functional',
      category: 'Mobile',
      priority: 'medium',
      status: 'draft',
      assignee: 'Mobile Team',
      stakeholder: 'Product Manager',
      acceptanceCriteria: [
        'View all agents and their status',
        'Receive push notifications for critical alerts',
        'Execute remote commands on agents',
        'View real-time metrics',
        'Support offline mode for cached data',
      ],
      dependencies: ['REQ-002', 'REQ-010'],
      estimatedEffort: '8 weeks',
      createdDate: '2025-11-05',
      updatedDate: '2025-11-05',
      tags: ['mobile', 'ios', 'android'],
    },
    {
      id: '10',
      reqId: 'REQ-010',
      title: 'RESTful API with OpenAPI Documentation',
      description: 'All APIs must follow REST principles with auto-generated OpenAPI/Swagger documentation',
      type: 'technical',
      category: 'API',
      priority: 'high',
      status: 'completed',
      assignee: 'Backend Team',
      stakeholder: 'Technical Architect',
      acceptanceCriteria: [
        'RESTful endpoints with proper HTTP methods',
        'Consistent JSON response format',
        'OpenAPI 3.0 specification auto-generated',
        'Interactive Swagger UI available',
        'API versioning (v1, v2, etc.)',
      ],
      dependencies: [],
      estimatedEffort: '2 weeks',
      createdDate: '2025-10-15',
      updatedDate: '2025-11-10',
      tags: ['api', 'documentation', 'rest'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'functional':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'non-functional':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'technical':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'business':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'approved':
        return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
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
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return Shield;
      case 'Frontend':
        return Layout;
      case 'Database':
        return Database;
      case 'Agent':
        return Zap;
      case 'Mobile':
        return Smartphone;
      case 'API':
        return Link2;
      default:
        return Target;
    }
  };

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.reqId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const statusCounts = {
    draft: requirements.filter((r) => r.status === 'draft').length,
    approved: requirements.filter((r) => r.status === 'approved').length,
    'in-progress': requirements.filter((r) => r.status === 'in-progress').length,
    completed: requirements.filter((r) => r.status === 'completed').length,
    rejected: requirements.filter((r) => r.status === 'rejected').length,
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <FileText className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Requirements Management</h1>
                <p className="text-blue-100 text-lg font-medium">
                  Track and manage functional, non-functional, technical, and business requirements
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Requirement
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {[
              { label: 'Draft', value: statusCounts.draft, icon: FileText, color: 'bg-gray-500' },
              { label: 'Approved', value: statusCounts.approved, icon: CheckCircle2, color: 'bg-cyan-500' },
              { label: 'In Progress', value: statusCounts['in-progress'], icon: Clock, color: 'bg-blue-500' },
              { label: 'Completed', value: statusCounts.completed, icon: CheckCircle2, color: 'bg-green-500' },
              { label: 'Total', value: requirements.length, icon: Target, color: 'bg-purple-500' },
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
                  <span className="text-sm text-blue-100 font-medium">{stat.label}</span>
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
                placeholder="Search requirements by ID, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="all">All Types</option>
              <option value="functional">Functional</option>
              <option value="non-functional">Non-Functional</option>
              <option value="technical">Technical</option>
              <option value="business">Business</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-4">
          {filteredRequirements.map((req, idx) => {
            const CategoryIcon = getCategoryIcon(req.category);
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CategoryIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{req.reqId}</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{req.title}</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">{req.description}</p>

                      {/* Acceptance Criteria */}
                      <div className="mb-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Acceptance Criteria:</h4>
                        <ul className="space-y-1">
                          {req.acceptanceCriteria.map((criteria, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="font-medium">{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-semibold">{req.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span className="font-semibold">Stakeholder: {req.stakeholder}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">{req.estimatedEffort}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {req.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Dependencies */}
                      {req.dependencies.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                          <Link2 className="w-4 h-4" />
                          <span className="font-semibold">Dependencies: {req.dependencies.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(req.status)}`}>
                      {req.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(req.priority)}`}>
                      {req.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getTypeColor(req.type)}`}>
                      {req.type.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700">
                      {req.category}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
