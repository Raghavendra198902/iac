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
  LineChart,
  Cpu,
  HardDrive,
  Network,
  Boxes,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertTriangle,
  Radio,
  Flame,
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

const navigationGroups = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Advanced Dashboard', href: '/advanced', icon: LineChart, badge: 'New' },
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
      { name: 'Cloud Providers', href: '/cloud', icon: Cloud },
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
    name: 'Analytics & Insights',
    items: [
      { name: 'Advanced Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'AI Insights', href: '/ai', icon: Brain },
      { name: 'Cost Management', href: '/cost', icon: DollarSign },
      { name: 'Trends & Forecasting', href: '/trends', icon: TrendingUp },
    ]
  },
  {
    name: 'Resources',
    items: [
      { name: 'Downloads', href: '/downloads', icon: Download },
      { name: 'Documentation', href: '/docs', icon: FileText },
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
    'Analytics & Insights': false,
    'Resources': false,
  });
  const [systemStats, setSystemStats] = useState({
    services: { total: 18, healthy: 17, warning: 1, critical: 0 },
    cpu: 45,
    memory: 68,
    disk: 52,
    network: 'online',
    responseTime: 142,
  });
  const [isConnected, setIsConnected] = useState(true);
  const location = useLocation();
  const { logout, user } = useAuth();

  // Auto-collapse menus on route change
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Auto-collapse menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close user menu if clicking outside
      if (userMenuOpen && !target.closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
      
      // Close notifications if clicking outside
      if (notificationsOpen && !target.closest('[data-notifications]')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, notificationsOpen]);

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(50, Math.min(300, prev.responseTime + (Math.random() - 0.5) * 30)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/dashboard' }];
    
    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const item = navigationGroups
        .flatMap(g => g.items)
        .find(item => item.href === currentPath);
      if (item) {
        breadcrumbs.push({ name: item.name, path: currentPath });
      } else {
        breadcrumbs.push({ 
          name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '), 
          path: currentPath 
        });
      }
    });
    
    return breadcrumbs;
  };

  const getHealthColor = () => {
    const { healthy, warning, critical } = systemStats.services;
    if (critical > 0) return 'text-red-600 dark:text-red-400';
    if (warning > 0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getHealthBg = () => {
    const { healthy, warning, critical } = systemStats.services;
    if (critical > 0) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (warning > 0) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const getCpuColor = (cpu: number) => {
    if (cpu > 80) return 'text-red-600 dark:text-red-400';
    if (cpu > 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getCpuBg = (cpu: number) => {
    if (cpu > 80) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (cpu > 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  const getMemoryColor = (memory: number) => {
    if (memory > 80) return 'text-red-600 dark:text-red-400';
    if (memory > 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  const getMemoryBg = (memory: number) => {
    if (memory > 80) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (memory > 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
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
        <div className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
          <div className="flex h-16 items-center justify-between px-4">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">IAC DHARMA</h1>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    <p className="text-xs text-white/70">System {isConnected ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="mx-auto relative">
                <Layers className="h-8 w-8 text-white" />
                <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} border-2 border-primary-700`} />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* System Health Bar */}
          {!sidebarCollapsed && (
            <div className="px-4 pb-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/90">
                <span className="font-medium">System Health</span>
                <span className="flex items-center gap-1">
                  {systemStats.services.healthy}/{systemStats.services.total} Services
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Cpu className="h-3 w-3 text-white/70" />
                    <span className="text-xs text-white/70">CPU</span>
                  </div>
                  <div className="text-sm font-bold text-white">{Math.round(systemStats.cpu)}%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <HardDrive className="h-3 w-3 text-white/70" />
                    <span className="text-xs text-white/70">RAM</span>
                  </div>
                  <div className="text-sm font-bold text-white">{Math.round(systemStats.memory)}%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="h-3 w-3 text-white/70" />
                    <span className="text-xs text-white/70">Ping</span>
                  </div>
                  <div className="text-sm font-bold text-white">{Math.round(systemStats.responseTime)}ms</div>
                </div>
              </div>
            </div>
          )}
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
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                          active
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:shadow-md hover:scale-[1.01]'
                        }`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'} transition-all ${active ? 'animate-pulse' : ''}`} />
                        {!sidebarCollapsed && (
                          <span className="flex-1">{item.name}</span>
                        )}
                        {!sidebarCollapsed && (item as any).badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full shadow-sm animate-pulse">
                            {(item as any).badge}
                          </span>
                        )}
                        {!sidebarCollapsed && active && (
                          <div className="h-2 w-2 rounded-full bg-white shadow-lg animate-pulse" />
                        )}
                        {sidebarCollapsed && active && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
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
                <div className="font-semibold">Version 2.1.0</div>
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
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          {/* Breadcrumbs */}
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 px-6 py-2">
            <div className="flex items-center gap-2 text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                  <Link
                    to={crumb.path}
                    className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                      index === getBreadcrumbs().length - 1
                        ? 'text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
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
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 min-w-[350px] focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white dark:focus-within:bg-gray-750 transition-all shadow-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dashboards, services, metrics..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-full"
                />
                <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {/* Real-time Stats */}
              <div className="hidden xl:flex items-center gap-3 mr-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getHealthBg()} transition-all duration-300`}>
                  <Radio className={`h-3.5 w-3.5 ${getHealthColor()} animate-pulse`} />
                  <span className={`text-xs font-semibold ${getHealthColor()}`}>
                    {systemStats.services.healthy}/{systemStats.services.total}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Services</span>
                  {systemStats.services.warning > 0 && (
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  )}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${getCpuBg(systemStats.cpu)}`}>
                  <Cpu className={`h-3.5 w-3.5 ${getCpuColor(systemStats.cpu)}`} />
                  <span className={`text-xs font-semibold ${getCpuColor(systemStats.cpu)}`}>{Math.round(systemStats.cpu)}%</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${getMemoryBg(systemStats.memory)}`}>
                  <HardDrive className={`h-3.5 w-3.5 ${getMemoryColor(systemStats.memory)}`} />
                  <span className={`text-xs font-semibold ${getMemoryColor(systemStats.memory)}`}>{Math.round(systemStats.memory)}%</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  {isConnected ? (
                    <Wifi className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">{Math.round(systemStats.responseTime)}ms</span>
                </div>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="hidden lg:flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:rotate-180 transition-all duration-500" />
              </button>
              <Link
                to="/designer"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4" />
                New Blueprint
              </Link>

              <div className="relative" data-notifications>
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

              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              
              <div className="relative" data-user-menu>
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
