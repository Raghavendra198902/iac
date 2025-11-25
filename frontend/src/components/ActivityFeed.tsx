import { useState, useEffect, useMemo } from 'react';
import { Activity, ActivityType, ActivityPriority, ActivityFilter } from '../types/activity';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../utils/userAvatar';
import { useWebSocket } from '../contexts/WebSocketContext';
import {
  Search,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Package,
  TrendingUp,
  Bell,
  XCircle,
  UserPlus,
  UserMinus,
  MessageSquare,
  Shield,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

interface ActivityFeedProps {
  maxItems?: number;
  showFilters?: boolean;
  projectId?: string;
  compact?: boolean;
  height?: string;
}

const activityIcons: Record<ActivityType, any> = {
  project_created: FileText,
  project_updated: FileText,
  step_started: Clock,
  step_completed: CheckCircle,
  step_blocked: XCircle,
  asset_linked: Package,
  asset_removed: Package,
  user_joined: UserPlus,
  user_left: UserMinus,
  comment_added: MessageSquare,
  approval_requested: Shield,
  approval_granted: CheckCircle,
  approval_denied: XCircle,
  pdf_exported: Download,
  milestone_reached: Target,
  deadline_approaching: AlertTriangle,
  risk_identified: AlertCircle,
};

const activityColors: Record<ActivityType, string> = {
  project_created: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  project_updated: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  step_started: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  step_completed: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  step_blocked: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  asset_linked: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  asset_removed: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
  user_joined: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  user_left: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
  comment_added: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20',
  approval_requested: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  approval_granted: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  approval_denied: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  pdf_exported: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  milestone_reached: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  deadline_approaching: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  risk_identified: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

const priorityColors: Record<ActivityPriority, string> = {
  low: 'text-gray-600',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
};

export default function ActivityFeed({
  maxItems = 50,
  showFilters = true,
  projectId,
  compact = false,
  height = '600px',
}: ActivityFeedProps) {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket real-time activity updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join appropriate room
    if (projectId) {
      socket.emit('join-project', projectId);
    } else {
      socket.emit('join-activity-feed');
    }

    // Listen for new activities
    const handleNewActivity = (activity: any) => {
      const newActivity: Activity = {
        ...activity,
        timestamp: new Date(activity.timestamp),
      };
      
      setActivities((prev) => {
        const updated = [newActivity, ...prev];
        // Keep only maxItems
        return updated.slice(0, maxItems);
      });
      
      // Show toast notification for high priority activities
      if (activity.priority === 'high' || activity.priority === 'critical') {
        toast.success(activity.title, {
          duration: 3000,
          icon: activity.priority === 'critical' ? '🚨' : '✅',
        });
      }
    };

    socket.on('activity-created', handleNewActivity);

    // Cleanup
    return () => {
      socket.off('activity-created', handleNewActivity);
      if (projectId) {
        socket.emit('leave-project', projectId);
      } else {
        socket.emit('leave-activity-feed');
      }
    };
  }, [socket, isConnected, projectId, maxItems]);

  // Load activities from backend
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (projectId) params.append('projectId', projectId);
        if (maxItems) params.append('limit', maxItems.toString());
        
        const response = await fetch(`${API_URL}/workflow/activities?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          })));
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
        // Fallback to sample data for demo
        setActivities(generateSampleActivities());
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [projectId, maxItems]);

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Project filter
      if (filter.projectIds?.length && !filter.projectIds.includes(activity.projectId || '')) {
        return false;
      }

      // Type filter
      if (filter.types?.length && !filter.types.includes(activity.type)) {
        return false;
      }

      // Priority filter
      if (filter.priorities?.length && !filter.priorities.includes(activity.priority)) {
        return false;
      }

      // User filter
      if (filter.userIds?.length && !filter.userIds.includes(activity.userId)) {
        return false;
      }

      // Date range filter
      if (filter.dateFrom && activity.timestamp < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && activity.timestamp > filter.dateTo) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          activity.title.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query) ||
          activity.userName.toLowerCase().includes(query) ||
          activity.projectName?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [activities, filter, searchQuery]);

  // Export activities to CSV
  const handleExport = () => {
    const csvHeaders = ['Timestamp', 'Type', 'Priority', 'User', 'Project', 'Title', 'Description'];
    const csvRows = filteredActivities.map((a) => [
      a.timestamp.toISOString(),
      a.type,
      a.priority,
      a.userName,
      a.projectName || 'N/A',
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-feed-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Activity feed exported to CSV');
  };

  const renderActivity = (activity: Activity) => {
    const Icon = activityIcons[activity.type];
    const colorClass = activityColors[activity.type];
    const priorityColor = priorityColors[activity.priority];

    return (
      <div
        key={activity.id}
        className={`${
          compact ? 'p-3' : 'p-4'
        } border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
      >
        <div className="flex gap-3">
          {/* Activity Icon */}
          <div className={`flex-shrink-0 ${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full ${colorClass} flex items-center justify-center`}>
            <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-gray-100`}>
                    {activity.title}
                  </h4>
                  {activity.priority !== 'low' && (
                    <span className={`text-xs font-medium ${priorityColor}`}>
                      {activity.priority.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 mb-2`}>
                  {activity.description}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <UserAvatar name={activity.userName} size="xs" />
                    <span>{activity.userName}</span>
                  </div>
                  {activity.projectName && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">{activity.projectName}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                </div>
              </div>

              {/* Timestamp */}
              {!compact && (
                <div className="text-xs text-gray-400">
                  {activity.timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Feed
            </h2>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-medium rounded-full">
              {filteredActivities.length} activities
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showFilters && (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilter({
                      ...filter,
                      types: value ? [value as ActivityType] : undefined,
                    });
                  }}
                >
                  <option value="">All Types</option>
                  <option value="project_created">Project Created</option>
                  <option value="step_completed">Step Completed</option>
                  <option value="asset_linked">Asset Linked</option>
                  <option value="approval_granted">Approval Granted</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilter({
                      ...filter,
                      priorities: value ? [value as ActivityPriority] : undefined,
                    });
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => {
                    setFilter({
                      ...filter,
                      dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => {
                    setFilter({
                      ...filter,
                      dateTo: e.target.value ? new Date(e.target.value) : undefined,
                    });
                  }}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(filter.types?.length || filter.priorities?.length || filter.dateFrom || filter.dateTo) && (
              <button
                onClick={() => setFilter({})}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: height }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mb-3 text-gray-400" />
            <p className="text-lg font-medium">No activities found</p>
            <p className="text-sm">Activities will appear here as they happen</p>
          </div>
        ) : (
          <div>
            {filteredActivities.map(renderActivity)}
          </div>
        )}
      </div>
    </div>
  );
}

// Generate sample activities for demo
function generateSampleActivities(): Activity[] {
  const now = new Date();
  const users = [
    { id: '1', name: 'John Smith', email: 'john.smith@iacdharma.com' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@iacdharma.com' },
    { id: '3', name: 'Mike Chen', email: 'mike.chen@iacdharma.com' },
    { id: '4', name: 'Emily Davis', email: 'emily.d@iacdharma.com' },
  ];

  const projects = [
    { id: 'proj-1', name: 'E-commerce Platform Migration' },
    { id: 'proj-2', name: 'Data Analytics Pipeline' },
    { id: 'proj-3', name: 'Microservices Architecture' },
  ];

  const activities: Activity[] = [];

  // Generate 30 sample activities
  for (let i = 0; i < 30; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const minutesAgo = Math.floor(Math.random() * 1440); // Last 24 hours

    const activityTypes: { type: ActivityType; title: string; description: string; priority: ActivityPriority }[] = [
      {
        type: 'project_created',
        title: 'New Project Created',
        description: `${user.name} created project "${project.name}"`,
        priority: 'high',
      },
      {
        type: 'step_completed',
        title: 'Step Completed',
        description: `${user.name} completed "Requirements Gathering" in ${project.name}`,
        priority: 'medium',
      },
      {
        type: 'asset_linked',
        title: 'Assets Linked',
        description: `${user.name} linked 3 Terraform templates to ${project.name}`,
        priority: 'low',
      },
      {
        type: 'approval_granted',
        title: 'Approval Granted',
        description: `${user.name} approved deployment for ${project.name}`,
        priority: 'high',
      },
      {
        type: 'milestone_reached',
        title: 'Milestone Reached',
        description: `${project.name} reached 50% completion`,
        priority: 'high',
      },
      {
        type: 'risk_identified',
        title: 'Risk Identified',
        description: `Potential security vulnerability detected in ${project.name}`,
        priority: 'critical',
      },
      {
        type: 'comment_added',
        title: 'Comment Added',
        description: `${user.name} commented on "Design Architecture" step`,
        priority: 'low',
      },
      {
        type: 'pdf_exported',
        title: 'Report Exported',
        description: `${user.name} exported project report for ${project.name}`,
        priority: 'low',
      },
    ];

    const activityTemplate = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    activities.push({
      id: `activity-${i}`,
      type: activityTemplate.type,
      title: activityTemplate.title,
      description: activityTemplate.description,
      projectId: project.id,
      projectName: project.name,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      timestamp: new Date(now.getTime() - minutesAgo * 60 * 1000),
      priority: activityTemplate.priority,
      metadata: {
        stepNumber: Math.floor(Math.random() * 6) + 1,
        assetCount: Math.floor(Math.random() * 10) + 1,
      },
    });
  }

  // Sort by timestamp descending
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
