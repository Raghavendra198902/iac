import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle, X, Check, Filter, Search, Clock, Settings } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import FadeIn from '../components/ui/FadeIn';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'deployment' | 'security' | 'cost' | 'monitoring' | 'system';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const filteredNotifications = notifications
    .filter(n => filter === 'all' || (filter === 'unread' && !n.read) || (filter === 'read' && n.read))
    .filter(n => categoryFilter === 'all' || n.category === categoryFilter)
    .filter(n => 
      searchQuery === '' || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = notifications.filter(n => !n.read).length;
  const categoryCounts = {
    all: notifications.length,
    deployment: notifications.filter(n => n.category === 'deployment').length,
    security: notifications.filter(n => n.category === 'security').length,
    cost: notifications.filter(n => n.category === 'cost').length,
    monitoring: notifications.filter(n => n.category === 'monitoring').length,
    system: notifications.filter(n => n.category === 'system').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative">
            <Bell className="h-6 w-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications Center</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <FadeIn delay={0.1}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300 mb-1">Unread</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{unreadCount}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-900 dark:text-red-300 mb-1">Errors</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">
              {notifications.filter(n => n.type === 'error').length}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-900 dark:text-orange-300 mb-1">Warnings</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {notifications.filter(n => n.type === 'warning').length}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.5}>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 shadow-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-300 mb-1">Success</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {notifications.filter(n => n.type === 'success').length}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories ({categoryCounts.all})</option>
            <option value="deployment">Deployment ({categoryCounts.deployment})</option>
            <option value="security">Security ({categoryCounts.security})</option>
            <option value="cost">Cost ({categoryCounts.cost})</option>
            <option value="monitoring">Monitoring ({categoryCounts.monitoring})</option>
            <option value="system">System ({categoryCounts.system})</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
            <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <FadeIn key={notification.id}>
              <div className={`rounded-xl p-5 border transition-all ${
                notification.read 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75' 
                  : `${getTypeColor(notification.type)}`
              }`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <Badge variant="default" className="text-xs">
                          {notification.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className={`text-sm mb-3 ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          View Details
                        </a>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))
        )}
      </div>
    </div>
  );
}
