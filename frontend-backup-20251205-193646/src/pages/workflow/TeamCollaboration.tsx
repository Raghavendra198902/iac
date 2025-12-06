import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '../../components/layout';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../../utils/userAvatar';
import {
  Users,
  MessageSquare,
  Calendar,
  CheckCircle,
  Target,
  Mail,
  Phone,
  MapPin,
  Send,
  Image as ImageIcon,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Plus,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  X,
  Upload,
  FileText,
  Edit2,
  Save,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  activeProjects: number;
  completedTasks: number;
  joinedDate: string;
  skills: string[];
  location?: string;
  phone?: string;
  cvUrl?: string;
  cvFileName?: string;
}

interface TeamMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  attachments?: { name: string; url: string; type: string }[];
  reactions?: { emoji: string; users: string[] }[];
}

interface TeamTask {
  id: string;
  title: string;
  assignedTo: string;
  assignedToName: string;
  projectId: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueDate: string;
  completedDate?: string;
}

export default function TeamCollaboration() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'tasks'>('members');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    location: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Helper to get full user name
  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || 'John Smith';
  };

  // Load team data
  useEffect(() => {
    loadTeamMembers();
    loadMessages();
    loadTasks();
  }, []);

  const loadTeamMembers = async () => {
    // In production, fetch from API
    const sampleMembers: TeamMember[] = [
      {
        id: '1',
        name: getUserName(),
        email: user?.email || 'john.smith@iacdharma.com',
        role: 'Project Manager',
        department: 'Engineering',
        status: 'online',
        activeProjects: 3,
        completedTasks: 45,
        joinedDate: '2024-01-15',
        skills: ['Project Management', 'Agile', 'IaC'],
        location: 'San Francisco, CA',
        phone: '+1 (555) 123-4567',
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@iacdharma.com',
        role: 'Solution Architect',
        department: 'Architecture',
        status: 'online',
        activeProjects: 5,
        completedTasks: 78,
        joinedDate: '2023-11-20',
        skills: ['AWS', 'Azure', 'Architecture Design', 'Terraform'],
        location: 'New York, NY',
        phone: '+1 (555) 234-5678',
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike.chen@iacdharma.com',
        role: 'DevOps Engineer',
        department: 'Operations',
        status: 'away',
        activeProjects: 2,
        completedTasks: 62,
        joinedDate: '2024-02-10',
        skills: ['Kubernetes', 'Docker', 'CI/CD', 'Monitoring'],
        location: 'Austin, TX',
        phone: '+1 (555) 345-6789',
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily.d@iacdharma.com',
        role: 'Security Engineer',
        department: 'Security',
        status: 'online',
        activeProjects: 4,
        completedTasks: 56,
        joinedDate: '2024-03-05',
        skills: ['Security', 'Compliance', 'Risk Assessment', 'IAM'],
        location: 'Seattle, WA',
        phone: '+1 (555) 456-7890',
      },
      {
        id: '5',
        name: 'David Wilson',
        email: 'david.w@iacdharma.com',
        role: 'Full Stack Developer',
        department: 'Engineering',
        status: 'offline',
        activeProjects: 2,
        completedTasks: 89,
        joinedDate: '2023-09-12',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        location: 'Boston, MA',
        phone: '+1 (555) 567-8901',
      },
    ];
    setTeamMembers(sampleMembers);
  };

  const loadMessages = () => {
    const now = new Date();
    const sampleMessages: TeamMessage[] = [
      {
        id: '1',
        senderId: '2',
        senderName: 'Sarah Johnson',
        content: 'Great progress on the migration project! The architecture review went well.',
        timestamp: new Date(now.getTime() - 300000), // 5 mins ago
        reactions: [{ emoji: '👍', users: ['1', '3'] }],
      },
      {
        id: '2',
        senderId: '3',
        senderName: 'Mike Chen',
        content: 'I\'ve deployed the monitoring stack. Grafana dashboards are ready for review.',
        timestamp: new Date(now.getTime() - 600000), // 10 mins ago
      },
      {
        id: '3',
        senderId: '1',
        senderName: getUserName(),
        content: 'Team standup at 10 AM tomorrow. Please update your task status.',
        timestamp: new Date(now.getTime() - 900000), // 15 mins ago
        reactions: [{ emoji: '✅', users: ['2', '3', '4'] }],
      },
      {
        id: '4',
        senderId: '4',
        senderName: 'Emily Davis',
        content: 'Security scan completed. Found 2 medium-priority issues that need attention.',
        timestamp: new Date(now.getTime() - 1800000), // 30 mins ago
        reactions: [{ emoji: '🔒', users: ['1'] }],
      },
    ];
    setMessages(sampleMessages);
  };

  const loadTasks = () => {
    const sampleTasks: TeamTask[] = [
      {
        id: '1',
        title: 'Complete architecture documentation',
        assignedTo: '2',
        assignedToName: 'Sarah Johnson',
        projectId: 'proj-1',
        projectName: 'E-commerce Platform Migration',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2025-11-28',
      },
      {
        id: '2',
        title: 'Deploy monitoring stack',
        assignedTo: '3',
        assignedToName: 'Mike Chen',
        projectId: 'proj-1',
        projectName: 'E-commerce Platform Migration',
        priority: 'high',
        status: 'completed',
        dueDate: '2025-11-25',
        completedDate: '2025-11-25',
      },
      {
        id: '3',
        title: 'Security vulnerability assessment',
        assignedTo: '4',
        assignedToName: 'Emily Davis',
        projectId: 'proj-2',
        projectName: 'Data Analytics Pipeline',
        priority: 'critical',
        status: 'in-progress',
        dueDate: '2025-11-26',
      },
      {
        id: '4',
        title: 'Update project status dashboard',
        assignedTo: '1',
        assignedToName: getUserName(),
        projectId: 'proj-3',
        projectName: 'Microservices Architecture',
        priority: 'medium',
        status: 'pending',
        dueDate: '2025-11-30',
      },
    ];
    setTasks(sampleTasks);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: TeamMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '1',
      senderName: getUserName(),
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    toast.success('Message sent');
  };

  const handleInviteMember = () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.role || !inviteForm.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      department: inviteForm.department,
      phone: inviteForm.phone,
      location: inviteForm.location,
      status: 'offline',
      activeProjects: 0,
      completedTasks: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      skills: [],
      cvUrl: cvFile ? URL.createObjectURL(cvFile) : undefined,
      cvFileName: cvFile?.name,
    };

    setTeamMembers([...teamMembers, newMember]);
    setIsInviteModalOpen(false);
    setInviteForm({
      name: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      location: '',
    });
    setCvFile(null);
    toast.success(`Invitation sent to ${newMember.name}`);
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>, memberId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      toast.error('Please upload a PDF or DOC file');
      return;
    }

    if (memberId && selectedMember?.id === memberId) {
      const updatedMember = {
        ...selectedMember,
        cvUrl: URL.createObjectURL(file),
        cvFileName: file.name,
      };
      setSelectedMember(updatedMember);
      setTeamMembers(teamMembers.map(m => m.id === memberId ? updatedMember : m));
      toast.success('CV uploaded successfully');
    } else {
      setCvFile(file);
      toast.success('CV attached');
    }
  };

  const startEditingSkills = () => {
    if (selectedMember) {
      setEditedSkills([...selectedMember.skills]);
      setIsEditingSkills(true);
    }
  };

  const saveSkills = () => {
    if (selectedMember) {
      const updatedMember = { ...selectedMember, skills: editedSkills };
      setSelectedMember(updatedMember);
      setTeamMembers(teamMembers.map(m => m.id === selectedMember.id ? updatedMember : m));
      setIsEditingSkills(false);
      toast.success('Skills updated successfully');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !editedSkills.includes(newSkill.trim())) {
      setEditedSkills([...editedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditedSkills(editedSkills.filter(skill => skill !== skillToRemove));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'low':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'blocked':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'pending':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400/20 to-pink-600/20 rounded-full blur-3xl"
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
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"
              style={{ backgroundSize: '200% 200%' }}
            />
            
            <div className="relative z-10 p-8 text-white">
              <div className="flex items-center justify-between">
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
                      <Users className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                      Dharma IaC Team
                    </h1>
                  </div>
                  <p className="text-white/90 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Coordinate with your team, share updates, and track progress
                  </p>
                </motion.div>
                
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-semibold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Invite Member
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Team Stats with Modern Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              { 
                label: 'Team Members', 
                value: teamMembers.length, 
                icon: Users, 
                color: 'from-blue-500 to-cyan-500',
                subtitle: `${teamMembers.filter((m) => m.status === 'online').length} online`
              },
              { 
                label: 'Active Projects', 
                value: teamMembers.reduce((acc, m) => acc + m.activeProjects, 0), 
                icon: Target, 
                color: 'from-purple-500 to-pink-500',
                subtitle: 'Across all members'
              },
              { 
                label: 'Tasks Completed', 
                value: teamMembers.reduce((acc, m) => acc + m.completedTasks, 0), 
                icon: CheckCircle, 
                color: 'from-green-500 to-emerald-500',
                subtitle: '+12 this week'
              },
              { 
                label: 'Team Messages', 
                value: messages.length, 
                icon: MessageSquare, 
                color: 'from-orange-500 to-red-500',
                subtitle: 'Last 24 hours'
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1, type: "spring", stiffness: 200 }}
                    className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                  >
                    {stat.value}
                  </motion.div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{stat.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stat.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl"
        >
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'members'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members ({teamMembers.length})
                </div>
                {activeTab === 'members' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'chat'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Team Chat ({messages.length})
                </div>
                {activeTab === 'chat' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'tasks'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Team Tasks ({tasks.length})
                </div>
                {activeTab === 'tasks' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Members Tab */}
          {activeTab === 'members' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredMembers.map((member, idx) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => setSelectedMember(member)}
                      className="relative overflow-hidden bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <UserAvatar name={member.name} size="lg" />
                          <motion.div
                            animate={{
                              scale: member.status === 'online' ? [1, 1.2, 1] : 1,
                            }}
                            transition={{ duration: 2, repeat: member.status === 'online' ? Infinity : 0 }}
                            className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-900`}
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </motion.button>
                      </div>

                      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                        {member.name}
                      </h3>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{member.role}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{member.department}</p>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{member.activeProjects}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{member.completedTasks}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {member.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-lg font-medium">
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs rounded-lg font-medium">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Hover Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 pointer-events-none transition-all duration-300"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="flex flex-col h-[600px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  <AnimatePresence>
                    {messages.map((message, idx) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-3"
                      >
                        <UserAvatar name={message.senderName} size="md" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-3 border border-gray-200/50 dark:border-gray-600/50"
                          >
                            <p className="text-sm text-gray-900 dark:text-gray-100">{message.content}</p>
                          </motion.div>
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {message.reactions.map((reaction, idx) => (
                                <motion.button
                                  key={idx}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                >
                                  {reaction.emoji} {reaction.users.length}
                                </motion.button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </motion.button>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="space-y-4">
                <AnimatePresence>
                  {tasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                            {task.title}
                          </h3>
                          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-2">{task.projectName}</p>
                          <div className="flex items-center gap-2">
                            <UserAvatar name={task.assignedToName} size="xs" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{task.assignedToName}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority.toUpperCase()}
                          </motion.span>
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${getTaskStatusColor(task.status)}`}
                          >
                            {task.status.replace('-', ' ').toUpperCase()}
                          </motion.span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        {task.completedDate && (
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed: {new Date(task.completedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress indicator for completed tasks */}
                      {task.status === 'completed' && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ transformOrigin: 'left' }}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </motion.div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-2xl p-8 max-w-2xl w-full m-4 border border-white/50 dark:border-gray-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar name={selectedMember.name} size="xl" />
                  <motion.div
                    animate={{
                      scale: selectedMember.status === 'online' ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 2, repeat: selectedMember.status === 'online' ? Infinity : 0 }}
                    className={`absolute bottom-0 right-0 w-6 h-6 ${getStatusColor(selectedMember.status)} rounded-full border-4 border-white dark:border-gray-800`}
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {selectedMember.name}
                  </h2>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{selectedMember.role}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMember.department}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 text-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-3 rounded-xl"
              >
                <Mail className="w-5 h-5 text-indigo-500" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedMember.email}</span>
              </motion.div>
              {selectedMember.phone && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 text-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-3 rounded-xl"
                >
                  <Phone className="w-5 h-5 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedMember.phone}</span>
                </motion.div>
              )}
              {selectedMember.location && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 text-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-3 rounded-xl"
                >
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedMember.location}</span>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 text-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-3 rounded-xl"
              >
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  Joined {new Date(selectedMember.joinedDate).toLocaleDateString()}
                </span>
              </motion.div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Skills & Expertise
                </h3>
                {!isEditingSkills ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startEditingSkills}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg font-semibold flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveSkills}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg font-semibold flex items-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </motion.button>
                )}
              </div>
              
              {isEditingSkills ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="Add new skill..."
                      className="flex-1 px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addSkill}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editedSkills.map((skill, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg font-semibold border border-indigo-200 dark:border-indigo-800 flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map((skill, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg font-semibold border border-indigo-200 dark:border-indigo-800"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* CV Section */}
            <div className="mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                CV / Resume
              </h3>
              {selectedMember.cvUrl ? (
                <div className="flex items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedMember.cvFileName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Click to download</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={selectedMember.cvUrl}
                      download={selectedMember.cvFileName}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Download
                    </motion.a>
                    <label className="cursor-pointer">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                      >
                        Replace
                      </motion.div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleCvUpload(e, selectedMember.id)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload CV / Resume</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, DOC, or DOCX (Max 10MB)</p>
                  </motion.div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleCvUpload(e, selectedMember.id)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <Target className="w-8 h-8 text-purple-600" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {selectedMember.activeProjects}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Projects</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedMember.completedTasks}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Completed Tasks</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsInviteModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-2xl p-8 max-w-2xl w-full m-4 border border-white/50 dark:border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-600" />
                Invite Team Member
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="john.doe@iacdharma.com"
                    className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                    placeholder="Engineering"
                    className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={inviteForm.location}
                    onChange={(e) => setInviteForm({ ...inviteForm, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  CV / Resume
                </label>
                {cvFile ? (
                  <div className="flex items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{cvFile.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{(cvFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCvFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600"
                    >
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload CV / Resume</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, DOC, or DOCX (Max 10MB)</p>
                    </motion.div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleCvUpload(e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsInviteModalOpen(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInviteMember}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Invitation
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </MainLayout>
  );
}
