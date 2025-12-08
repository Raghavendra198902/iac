import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ServerIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  BuildingOfficeIcon,
  FolderIcon,
  CubeIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  CloudIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  CommandLineIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Home', path: '/', icon: HomeIcon },
  { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
  {
    name: 'Infrastructure',
    path: '/infrastructure',
    icon: ServerIcon,
    children: [
      { name: 'Overview', path: '/infrastructure', icon: ServerIcon },
      { name: 'Resources', path: '/infrastructure/resources', icon: CubeIcon },
      { name: 'Templates', path: '/infrastructure/templates', icon: DocumentTextIcon },
      { name: 'Generator', path: '/infrastructure/generator', icon: CodeBracketIcon },
    ],
  },
  {
    name: 'Monitoring',
    path: '/monitoring',
    icon: ChartBarIcon,
    children: [
      { name: 'Overview', path: '/monitoring', icon: ChartBarIcon },
      { name: 'Performance', path: '/monitoring/performance', icon: ChartBarIcon },
      { name: 'Health', path: '/monitoring/health', icon: ShieldCheckIcon },
      { name: 'Alerts', path: '/monitoring/alerts', icon: BellIcon },
    ],
  },
  {
    name: 'Security',
    path: '/security',
    icon: ShieldCheckIcon,
    children: [
      { name: 'Overview', path: '/security', icon: ShieldCheckIcon },
      { name: 'Compliance', path: '/security/compliance', icon: ShieldCheckIcon },
      { name: 'Audit', path: '/security/audit', icon: DocumentTextIcon },
      { name: 'Access', path: '/security/access', icon: UsersIcon },
    ],
  },
  {
    name: 'Cost',
    path: '/cost',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Overview', path: '/cost', icon: CurrencyDollarIcon },
      { name: 'Analytics', path: '/cost/analytics', icon: ChartBarIcon },
      { name: 'Budget', path: '/cost/budget', icon: DocumentTextIcon },
      { name: 'Optimization', path: '/cost/optimization', icon: CpuChipIcon },
    ],
  },
  {
    name: 'DevOps',
    path: '/devops',
    icon: CodeBracketIcon,
    children: [
      { name: 'Overview', path: '/devops', icon: CodeBracketIcon },
      { name: 'Pipelines', path: '/devops/pipelines', icon: CodeBracketIcon },
      { name: 'Containers', path: '/devops/containers', icon: CubeIcon },
      { name: 'Git', path: '/devops/git', icon: CodeBracketIcon },
    ],
  },
  {
    name: 'EA - Enterprise',
    path: '/ea',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'Overview', path: '/ea', icon: BuildingOfficeIcon },
      { name: 'Business', path: '/ea/business', icon: BuildingOfficeIcon },
      { name: 'Application', path: '/ea/application', icon: CubeIcon },
      { name: 'Data', path: '/ea/data', icon: ServerIcon },
    ],
  },
  {
    name: 'SA - Solution',
    path: '/sa',
    icon: CpuChipIcon,
    children: [
      { name: 'Overview', path: '/sa', icon: CpuChipIcon },
      { name: 'Architecture Design', path: '/sa/design', icon: CpuChipIcon },
      { name: 'Technology Stack', path: '/sa/stack', icon: ServerIcon },
      { name: 'Integration Patterns', path: '/sa/patterns', icon: PuzzlePieceIcon },
    ],
  },
  {
    name: 'TA - Technical',
    path: '/ta',
    icon: PuzzlePieceIcon,
    children: [
      { name: 'Overview', path: '/ta', icon: PuzzlePieceIcon },
      { name: 'Infrastructure Design', path: '/ta/infrastructure', icon: ServerIcon },
      { name: 'Network Architecture', path: '/ta/network', icon: GlobeAltIcon },
      { name: 'Cloud Architecture', path: '/ta/cloud', icon: CloudIcon },
    ],
  },
  {
    name: 'PM - Project',
    path: '/projects',
    icon: FolderIcon,
    children: [
      { name: 'Overview', path: '/projects', icon: FolderIcon },
      { name: 'List', path: '/projects/list', icon: FolderIcon },
      { name: 'Collaboration', path: '/projects/collaboration', icon: UsersIcon },
      { name: 'Timeline', path: '/projects/timeline', icon: ChartBarIcon },
      { name: 'Resources', path: '/projects/resources', icon: UserGroupIcon },
      { name: 'Risks', path: '/projects/risks', icon: ExclamationTriangleIcon },
    ],
  },
  {
    name: 'SE - Software',
    path: '/se',
    icon: CodeBracketIcon,
    children: [
      { name: 'Overview', path: '/se', icon: CodeBracketIcon },
      { name: 'Development', path: '/se/development', icon: CommandLineIcon },
      { name: 'Quality Assurance', path: '/se/quality', icon: CheckCircleIcon },
      { name: 'Release Management', path: '/se/release', icon: RocketLaunchIcon },
    ],
  },
  {
    name: 'CMDB',
    path: '/cmdb',
    icon: CubeIcon,
    children: [
      { name: 'Overview', path: '/cmdb', icon: CubeIcon },
      { name: 'Assets', path: '/cmdb/assets', icon: ServerIcon },
      { name: 'Config Items', path: '/cmdb/config-items', icon: Cog6ToothIcon },
      { name: 'Relationships', path: '/cmdb/relationships', icon: PuzzlePieceIcon },
    ],
  },
  {
    name: 'AI & Automation',
    path: '/ai',
    icon: CpuChipIcon,
    children: [
      { name: 'Overview', path: '/ai', icon: CpuChipIcon },
      { name: 'Models', path: '/ai/models', icon: CpuChipIcon },
      { name: 'Automation', path: '/ai/automation', icon: CodeBracketIcon },
      { name: 'Predictive', path: '/ai/predictive', icon: ChartBarIcon },
      { name: 'Natural Language', path: '/ai/nli', icon: ChatBubbleLeftRightIcon },
    ],
  },
  {
    name: 'Integrations',
    path: '/integrations',
    icon: PuzzlePieceIcon,
    children: [
      { name: 'Overview', path: '/integrations', icon: PuzzlePieceIcon },
      { name: 'API', path: '/integrations/api', icon: CodeBracketIcon },
      { name: 'Webhooks', path: '/integrations/webhooks', icon: CodeBracketIcon },
      { name: 'Services', path: '/integrations/services', icon: ServerIcon },
    ],
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: DocumentTextIcon,
    children: [
      { name: 'Overview', path: '/reports', icon: DocumentTextIcon },
      { name: 'Builder', path: '/reports/builder', icon: CodeBracketIcon },
      { name: 'Scheduled', path: '/reports/scheduled', icon: DocumentTextIcon },
      { name: 'Export', path: '/reports/export', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'Admin',
    path: '/admin',
    icon: Cog6ToothIcon,
    children: [
      { name: 'System', path: '/admin/system', icon: Cog6ToothIcon },
      { name: 'License', path: '/admin/license', icon: DocumentTextIcon },
      { name: 'Backup', path: '/admin/backup', icon: ServerIcon },
    ],
  },
  {
    name: 'Agents',
    path: '/agents/downloads',
    icon: ServerIcon,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Cog6ToothIcon,
    children: [
      { name: 'General', path: '/settings', icon: Cog6ToothIcon },
      { name: 'Cloud Providers', path: '/settings/cloud', icon: CloudIcon },
    ],
  },
  { name: 'Users', path: '/users', icon: UsersIcon },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col glass-effect border-r border-white/20 dark:border-slate-700/50">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/20 dark:border-slate-700/50">
            {sidebarOpen && (
              <h1 className="text-xl font-bold gradient-text">IAC Platform</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200"
            >
              {sidebarOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                        {sidebarOpen && (
                          <span className="text-sm font-medium">{item.name}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform ${
                            expandedMenus.includes(item.name) ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    {sidebarOpen && expandedMenus.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-300/50 dark:border-primary-700/50 pl-2">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                isActive(child.path)
                                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                                  : 'hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {ChildIcon && <ChildIcon className="w-4 h-4" />}
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                        : 'hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 glass-effect border-b border-white/20 dark:border-slate-700/50 sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4 ml-6">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200"
                >
                  <UserCircleIcon className="w-8 h-8" />
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.roles?.[0] || 'User'}
                    </div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-effect rounded-lg shadow-xl border border-white/20 dark:border-slate-700/50 py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-2 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative z-10 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout;
