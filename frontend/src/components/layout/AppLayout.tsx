import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Shield,
  DollarSign,
  Activity,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Code,
  ShieldCheck,
  Zap,
  Monitor,
  Brain,
  Gauge,
  Database,
  Download,
  ShieldAlert,
  Briefcase,
  PenTool,
  GitBranch,
  Server,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  Layers,
  Package,
  BarChart3,
  Cloud,
  TrendingUp,
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

const navigationGroups = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    name: 'Role Dashboards',
    items: [
      { name: 'Solution Architect', href: '/dashboards/sa', icon: Brain },
      { name: 'Enterprise Architect', href: '/dashboards/ea', icon: Briefcase },
      { name: 'Project Manager', href: '/dashboards/pm', icon: PenTool },
      { name: 'Technical Architect', href: '/dashboards/ta', icon: GitBranch },
      { name: 'Software Engineer', href: '/dashboards/se', icon: Server },
    ]
  },
  {
    name: 'Infrastructure',
    items: [
      { name: 'Blueprints', href: '/blueprints', icon: FileText },
      { name: 'AI Designer', href: '/designer', icon: Sparkles },
      { name: 'IAC Generator', href: '/iac', icon: Code },
      { name: 'CMDB', href: '/cmdb', icon: Database },
    ]
  },
  {
    name: 'Operations',
    items: [
      { name: 'Deployments', href: '/deployments', icon: Activity },
      { name: 'Monitoring', href: '/monitoring', icon: Monitor },
      { name: 'Automation', href: '/automation', icon: Zap },
      { name: 'Performance', href: '/performance', icon: Gauge },
    ]
  },
  {
    name: 'Security & Compliance',
    items: [
      { name: 'Security Dashboard', href: '/security', icon: ShieldAlert },
      { name: 'Guardrails', href: '/guardrails', icon: ShieldCheck },
      { name: 'Risk Assessment', href: '/risk', icon: Shield },
    ]
  },
  {
    name: 'Analytics',
    items: [
      { name: 'Advanced Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'AI Insights', href: '/ai', icon: Brain },
      { name: 'Cost Management', href: '/cost', icon: DollarSign },
    ]
  },
  {
    name: 'Resources',
    items: [
      { name: 'Downloads', href: '/downloads', icon: Download },
    ]
  },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Overview': true,
    'Role Dashboards': false,
    'Infrastructure': true,
    'Operations': true,
    'Security & Compliance': false,
    'Analytics': false,
    'Resources': false,
  });
  const location = useLocation();
  const { logout, user } = useAuth();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Deployment Completed', message: 'Production Web App deployed successfully', time: '5 min ago', unread: true },
    { id: 2, title: 'Cost Alert', message: 'Monthly budget 80% utilized', time: '1 hour ago', unread: true },
    { id: 3, title: 'Security Scan', message: 'Weekly security scan completed', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">IAC DHARMA</h1>
                <p className="text-xs text-white/70">Infrastructure Platform</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="mx-auto">
              <Layers className="h-8 w-8 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {navigationGroups.map((group) => (
            <div key={group.name} className="mb-4">
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>{group.name}</span>
                  {expandedGroups[group.name] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              
              {(expandedGroups[group.name] || sidebarCollapsed) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                          active
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:shadow-md'
                        }`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'} transition-colors`} />
                        {!sidebarCollapsed && (
                          <span className="flex-1">{item.name}</span>
                        )}
                        {!sidebarCollapsed && active && (
                          <div className="h-2 w-2 rounded-full bg-white shadow-lg" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-gray-50/50 dark:bg-gray-800/50">
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="h-4 w-4" />
                Collapse Sidebar
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400 px-3">
                <div className="font-semibold">Version 2.0.0</div>
                <div>© 2025 IAC DHARMA</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Expand Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6 gap-4">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Search bar */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 min-w-[300px] focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources, blueprints..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-full"
                />
                <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              <Link
                to="/designer"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4" />
                New Blueprint
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-2 w-2 rounded-full mt-2 ${notification.unread ? 'bg-primary-600' : 'bg-gray-300'}`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{notification.message}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-center">
                      <button className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : 'Admin User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || 'admin@iac.dharma'}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {user?.email || 'admin@iac.dharma'}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
