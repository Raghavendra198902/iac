import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Clock, Eye, Edit, FileText, Code, Database, Settings as SettingsIcon, Trash2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'view' | 'edit' | 'create' | 'delete';
  resource: string;
  resourceType: 'blueprint' | 'deployment' | 'template' | 'document' | 'settings';
  path: string;
  timestamp: string;
  description: string;
}

export default function RecentActivity() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'view',
      resource: 'Executive Dashboard',
      resourceType: 'document',
      path: '/dashboard',
      timestamp: '2025-12-04T10:30:00Z',
      description: 'Viewed dashboard metrics',
    },
    {
      id: '2',
      type: 'edit',
      resource: 'AWS EKS Template',
      resourceType: 'template',
      path: '/templates/aws-eks',
      timestamp: '2025-12-04T09:15:00Z',
      description: 'Updated cluster configuration',
    },
    {
      id: '3',
      type: 'create',
      resource: 'Production Deployment',
      resourceType: 'deployment',
      path: '/deployments/prod-123',
      timestamp: '2025-12-03T16:45:00Z',
      description: 'Created new production deployment',
    },
    {
      id: '4',
      type: 'view',
      resource: 'Security Architecture',
      resourceType: 'document',
      path: '/ea/security',
      timestamp: '2025-12-03T14:20:00Z',
      description: 'Reviewed security documentation',
    },
    {
      id: '5',
      type: 'edit',
      resource: 'Database Blueprint',
      resourceType: 'blueprint',
      path: '/blueprints/db-postgres',
      timestamp: '2025-12-03T11:30:00Z',
      description: 'Modified database schema',
    },
    {
      id: '6',
      type: 'view',
      resource: 'Settings',
      resourceType: 'settings',
      path: '/settings',
      timestamp: '2025-12-02T15:10:00Z',
      description: 'Checked user preferences',
    },
    {
      id: '7',
      type: 'delete',
      resource: 'Old Test Blueprint',
      resourceType: 'blueprint',
      path: '#',
      timestamp: '2025-12-02T12:00:00Z',
      description: 'Removed unused blueprint',
    },
    {
      id: '8',
      type: 'create',
      resource: 'API Gateway Template',
      resourceType: 'template',
      path: '/templates/api-gateway',
      timestamp: '2025-12-01T10:00:00Z',
      description: 'Created new API gateway template',
    },
  ]);

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'create': return <FileText className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
    }
  };

  const getResourceIcon = (resourceType: ActivityItem['resourceType']) => {
    switch (resourceType) {
      case 'blueprint': return '📋';
      case 'deployment': return '🚀';
      case 'template': return '⚙️';
      case 'document': return '📄';
      case 'settings': return '⚙️';
    }
  };

  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view': return 'from-blue-500 to-blue-600';
      case 'edit': return 'from-purple-500 to-purple-600';
      case 'create': return 'from-green-500 to-green-600';
      case 'delete': return 'from-red-500 to-red-600';
    }
  };

  const getTypeBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'edit': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  };

  const filters = [
    { value: 'all', label: 'All Activity' },
    { value: 'view', label: 'Views' },
    { value: 'edit', label: 'Edits' },
    { value: 'create', label: 'Created' },
    { value: 'delete', label: 'Deleted' },
  ];

  const filteredActivities = selectedType === 'all' 
    ? activities 
    : activities.filter(a => a.type === selectedType);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Recent Activity
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your recent actions and interactions
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{activities.length} Activities</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedType === filter.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              {/* Timeline line */}
              {index < filteredActivities.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2"></div>
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(activity.type)} flex items-center justify-center text-white shadow-lg relative z-10`}>
                  {getTypeIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg group-hover:scale-[1.01]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getTypeBadge(activity.type)}`}>
                          {activity.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getResourceIcon(activity.resourceType)}</span>
                        {activity.path !== '#' ? (
                          <Link
                            to={activity.path}
                            className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {activity.resource}
                          </Link>
                        ) : (
                          <span className="text-lg font-bold text-gray-400 dark:text-gray-600">
                            {activity.resource}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>

                    {activity.path !== '#' && (
                      <Link
                        to={activity.path}
                        className="flex-shrink-0 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No activity found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No {selectedType} activities to display
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
