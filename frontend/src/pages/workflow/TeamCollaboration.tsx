import { useState, useEffect } from 'react';
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
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Team Collaboration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Coordinate with your team, share updates, and track progress
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Invite Member
          </button>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamMembers.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
            <p className="text-xs text-green-600 mt-1">{teamMembers.filter((m) => m.status === 'online').length} online</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {teamMembers.reduce((acc, m) => acc + m.activeProjects, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
            <p className="text-xs text-gray-500 mt-1">Across all members</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {teamMembers.reduce((acc, m) => acc + m.completedTasks, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
            <p className="text-xs text-green-600 mt-1">+12 this week</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{messages.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team Messages</p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members ({teamMembers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'chat'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Team Chat ({messages.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Team Tasks ({tasks.length})
                </div>
              </button>
            </div>
          </div>

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <UserAvatar name={member.name} size="lg" />
                        <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-900`} />
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{member.role}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{member.department}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{member.activeProjects} projects</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>{member.completedTasks} tasks</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {member.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{member.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="p-6">
              <div className="flex flex-col h-[600px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <UserAvatar name={message.senderName} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{message.senderName}</span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-sm text-gray-900 dark:text-gray-100">{message.content}</p>
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {reaction.emoji} {reaction.users.length}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="p-6">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.projectName}</p>
                        <div className="flex items-center gap-2">
                          <UserAvatar name={task.assignedToName} size="xs" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{task.assignedToName}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      {task.completedDate && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed: {new Date(task.completedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar name={selectedMember.name} size="xl" />
                  <div className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(selectedMember.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedMember.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedMember.role}</p>
                  <p className="text-sm text-gray-500">{selectedMember.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">{selectedMember.email}</span>
              </div>
              {selectedMember.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-gray-100">{selectedMember.phone}</span>
                </div>
              )}
              {selectedMember.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-gray-100">{selectedMember.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">Joined {new Date(selectedMember.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMember.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedMember.activeProjects}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedMember.completedTasks}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
