import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  ChevronDown, 
  LogOut,
  Globe,
  HelpCircle,
  Shield,
  Activity,
  AlertCircle,
  Palette,
  Check,
  Moon,
  Sun
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    tenantName?: string;
  };
  onToggleSidebar?: () => void;
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Policy Violation',
      message: 'Blueprint "Prod-DB-Cluster" has 2 guardrail violations',
      timestamp: '5 min ago',
      read: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'Deployment Complete',
      message: 'Infrastructure deployment completed successfully',
      timestamp: '15 min ago',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Cost Alert',
      message: 'Monthly budget at 85% threshold',
      timestamp: '1 hour ago',
      read: true,
    },
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success': return <Activity className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const defaultUser = {
    name: 'Admin User',
    email: 'admin@iacdharma.com',
    role: 'Enterprise Architect',
    tenantName: 'IAC Dharma',
  };

  const currentUser = user || defaultUser;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg transition-all duration-300 overflow-visible">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 relative">
        {/* Animated gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 opacity-50 animate-pulse"></div>
        {/* Left Section - Logo & Tenant */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:blur-lg"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white animate-pulse" />
              </div>
              {/* Rotating ring */}
              <div className="absolute inset-0 rounded-lg border-2 border-blue-400/30 group-hover:rotate-180 transition-transform duration-700"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                IAC Dharma
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">ENTERPRISE PLATFORM</p>
            </div>
          </Link>

          {/* Tenant Selector */}
          {currentUser.tenantName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentUser.tenantName}
              </span>
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search blueprints, deployments, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            
            {/* Search Results Dropdown */}
            {showSearch && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">Quick Results</div>
                  
                  {/* Sample search results */}
                  <Link to="/blueprints/1" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Production Database Cluster</div>
                      <div className="text-xs text-gray-500">Blueprint • AWS • PostgreSQL</div>
                    </div>
                  </Link>

                  <Link to="/deployments/1" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Dev Environment Deployment</div>
                      <div className="text-xs text-gray-500">Deployment • Active • 12 resources</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Help */}
          <button className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group">
            <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Help & Docs
            </span>
          </button>

          {/* Theme Switcher - Single Button with Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 relative group transform hover:scale-110"
              title="Change Theme"
            >
              <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
              {showThemeMenu && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
              )}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 blur transition-opacity duration-300"></div>
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[100] animate-slideDown overflow-visible">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Select Theme</p>
                </div>
                
                <button
                  onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">💡</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
                  {theme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                
                <button
                  onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">🌙</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
                  {theme === 'dark' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                
                <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                
                <button
                  onClick={() => { setTheme('blue'); setShowThemeMenu(false); }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">🌊</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">Blue Ocean</span>
                  {theme === 'blue' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                
                <button
                  onClick={() => { setTheme('purple'); setShowThemeMenu(false); }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">💜</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">Purple Dream</span>
                  {theme === 'purple' && <Check className="w-4 h-4 text-purple-600" />}
                </button>
                
                <button
                  onClick={() => { setTheme('green'); setShowThemeMenu(false); }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">🌲</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">Green Forest</span>
                  {theme === 'green' && <Check className="w-4 h-4 text-green-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 relative group transform hover:scale-110"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300 group-hover:rotate-180" style={{transition: 'transform 0.5s ease'}} />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
            )}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 blur transition-opacity duration-300"></div>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/notifications"
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            to="/settings"
            className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentUser.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 hidden lg:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-white">{currentUser.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</div>
                  <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium rounded">
                    {currentUser.role}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Link
                    to="/help"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
