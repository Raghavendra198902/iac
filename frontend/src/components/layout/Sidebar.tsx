import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ChevronRight,
  Server,
  Users,
  Settings,
  Layers,
  FileText,
  Network,
  FileCode,
  Briefcase,
  Code2,
  FileCheck,
  Download,
  Database,
  GitBranch,
  Search,
  MessageSquare,
  BarChart3,
  Shield,
  DollarSign,
  Activity,
  ShieldCheck,
  Upload,
  BookOpen,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
  roles?: string[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
}

export default function Sidebar({ isOpen = true, onClose, userRole = 'EA' }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      // If clicking an already expanded item, collapse it
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      // Otherwise, close all others and expand this one
      return [id];
    });
  };

  const isActive = (path: string) => {
    // Extract path without query params
    const pathWithoutQuery = path.split('?')[0];
    
    // Exact match only for parent routes to avoid multiple highlights
    if (pathWithoutQuery === '/ea') {
      return location.pathname === '/ea';
    }
    
    // For paths with query params, only match if query params also match
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    
    return location.pathname === pathWithoutQuery || location.pathname.startsWith(pathWithoutQuery + '/');
  };

  // Filter menu items based on search query
  const filterMenuItems = (items: MenuItemOrDivider[]): MenuItemOrDivider[] => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    const filtered: MenuItemOrDivider[] = [];

    items.forEach(item => {
      if ('type' in item && item.type === 'divider') {
        // Keep divider if next item matches
        filtered.push(item);
      } else {
        const menuItem = item as MenuItem;
        const matchesLabel = menuItem.label.toLowerCase().includes(query);
        const matchesBadge = menuItem.badge?.toLowerCase().includes(query);
        
        if (matchesLabel || matchesBadge) {
          filtered.push(menuItem);
        } else if (menuItem.children) {
          // Check if any child matches
          const matchingChildren = menuItem.children.filter(child => 
            child.label.toLowerCase().includes(query) || 
            child.badge?.toLowerCase().includes(query)
          );
          
          if (matchingChildren.length > 0) {
            filtered.push({
              ...menuItem,
              children: matchingChildren
            });
          }
        }
      }
    });

    return filtered;
  };

  // Section divider type
  interface SectionDivider {
    type: 'divider';
    label: string;
  }

  type MenuItemOrDivider = MenuItem | SectionDivider;

  const menuItems: MenuItemOrDivider[] = [
    // ========== FAVORITES & RECENT ==========
    {
      type: 'divider',
      label: 'QUICK ACCESS',
    },
    {
      id: 'favorites',
      label: 'Favorites (Arjuna)',
      icon: Star,
      path: '/favorites',
      badge: '5',
      badgeColor: 'bg-yellow-600',
    },
    {
      id: 'recent',
      label: 'Recent Activity (Sanjaya)',
      icon: Clock,
      path: '/recent',
      badge: 'NEW',
      badgeColor: 'bg-blue-600',
    },
    
    // ========== CORE PLATFORM ==========
    {
      type: 'divider',
      label: 'CORE PLATFORM',
    },
    {
      id: 'dashboard',
      label: 'Executive Dashboard (Yudhishthira)',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'search',
      label: 'Global Search (Vidura)',
      icon: Search,
      path: '/search',
      badge: 'AI',
      badgeColor: 'bg-blue-600',
    },
    
    // ========== COLLABORATION SUITE ==========
    {
      type: 'divider',
      label: 'COLLABORATION',
    },
    {
      id: 'collaboration',
      label: 'Team Chat (Nakula)',
      icon: MessageSquare,
      path: '/collaboration',
      badge: 'LIVE',
      badgeColor: 'bg-green-600',
    },
    {
      id: 'workflow',
      label: 'Project Workflow (Sahadeva)',
      icon: GitBranch,
      children: [
        {
          id: 'workflow-projects',
          label: 'Active Projects (Bhima)',
          icon: GitBranch,
          path: '/workflow',
        },
        {
          id: 'workflow-team',
          label: 'Team Coordination (Draupadi)',
          icon: Users,
          path: '/workflow/team',
        },
      ],
    },

    // ========== ENTERPRISE ARCHITECTURE ==========
    {
      type: 'divider',
      label: 'ARCHITECTURE & DESIGN',
    },
    {
      id: 'ea',
      label: 'Enterprise Architecture (Krishna)',
      icon: Layers,
      children: [
        {
          id: 'ea-overview',
          label: 'Architecture Dashboard (Vishwakarma)',
          icon: Layers,
          path: '/ea',
        },
        {
          id: 'ea-repository',
          label: 'Repository (Vyasa)',
          icon: FileText,
          path: '/ea/repository',
        },
        {
          id: 'ea-sa',
          label: 'Solution Architecture (Dronacharya)',
          icon: Network,
          path: '/ea/repository?doc=sa',
          badge: 'SA',
          badgeColor: 'bg-indigo-600',
        },
        {
          id: 'ea-ta',
          label: 'Technical Architecture (Karna)',
          icon: FileCode,
          path: '/ea/repository?doc=ta',
          badge: 'TA',
          badgeColor: 'bg-green-600',
        },
      ],
    },
    {
      id: 'templates',
      label: 'IaC Templates (Brahma)',
      icon: Layers,
      path: '/templates',
      badge: 'AI',
      badgeColor: 'bg-purple-600',
    },

    // ========== PRODUCT & ENGINEERING ==========
    {
      type: 'divider',
      label: 'PRODUCT & ENGINEERING',
    },
    {
      id: 'pm',
      label: 'Product Management (Dhritarashtra)',
      icon: Briefcase,
      children: [
        {
          id: 'pm-roadmap',
          label: 'Product Roadmap (Shakuni)',
          icon: Briefcase,
          path: '/pm/roadmap',
          badge: 'PM',
          badgeColor: 'bg-blue-600',
        },
        {
          id: 'pm-requirements',
          label: 'Requirements & PRDs (Kunti)',
          icon: FileText,
          path: '/pm/requirements',
        },
      ],
    },
    {
      id: 'se',
      label: 'Software Engineering (Ashwatthama)',
      icon: Code2,
      children: [
        {
          id: 'se-projects',
          label: 'Engineering Projects (Abhimanyu)',
          icon: Code2,
          path: '/se/projects',
          badge: 'SE',
          badgeColor: 'bg-orange-600',
        },
        {
          id: 'se-tasks',
          label: 'Tasks & Sprints (Ghatotkacha)',
          icon: FileCheck,
          path: '/se/tasks',
        },
        {
          id: 'se-playbooks',
          label: 'Implementation Playbooks (Barbarika)',
          icon: BookOpen,
          path: '/se/playbooks',
        },
      ],
    },

    // ========== OPERATIONS & INFRASTRUCTURE ==========
    {
      type: 'divider',
      label: 'OPERATIONS',
    },
    {
      id: 'cmdb',
      label: 'Configuration Management (Hanuman)',
      icon: Database,
      path: '/cmdb',
      badge: 'CMDB',
      badgeColor: 'bg-slate-600',
    },
    {
      id: 'agents',
      label: 'Agent Management (Jatayu)',
      icon: Download,
      path: '/agents/downloads',
    },
    {
      id: 'monitoring',
      label: 'System Monitoring (Garuda)',
      icon: Activity,
      path: '/agents/monitoring',
      badge: 'Live',
      badgeColor: 'bg-green-600',
    },
    {
      id: 'enforcement',
      label: 'Policy Enforcement (Bhishma)',
      icon: ShieldCheck,
      path: '/agents/enforcement',
      badge: 'Active',
      badgeColor: 'bg-indigo-600',
    },

    // ========== GOVERNANCE & INSIGHTS ==========
    {
      type: 'divider',
      label: 'GOVERNANCE & INSIGHTS',
    },
    {
      id: 'insights',
      label: 'Analytics & Insights (Narada)',
      icon: BarChart3,
      path: '/insights',
      badge: 'ML',
      badgeColor: 'bg-orange-600',
    },
    {
      id: 'security',
      label: 'Security & Compliance (Duryodhana)',
      icon: Shield,
      path: '/security',
      badge: 'SOC2',
      badgeColor: 'bg-red-600',
    },
    {
      id: 'cost',
      label: 'FinOps & Cost Optimization (Kubera)',
      icon: DollarSign,
      path: '/cost',
      badge: 'SAVE',
      badgeColor: 'bg-green-600',
    },

    // ========== SYSTEM ADMINISTRATION ==========
    {
      type: 'divider',
      label: 'ADMINISTRATION',
    },
    {
      id: 'system',
      label: 'System Monitoring (Indra)',
      icon: Server,
      path: '/system',
    },
    {
      id: 'users',
      label: 'Identity & Access (Yama)',
      icon: Users,
      path: '/users',
    },
    {
      id: 'settings',
      label: 'Settings (Agni)',
      icon: Settings,
      path: '/settings',
    },
  ];

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = item.path ? isActive(item.path) : false;

    // Role-based access control
    if (item.roles && !item.roles.includes(userRole)) {
      return null;
    }

    const content = (
      <div
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
          active
            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02] animate-gradient bg-[length:200%_auto]'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 hover:shadow-md hover:scale-[1.01]'
        } ${level > 0 ? 'ml-6 text-sm' : ''} ${isExpanded && hasChildren ? 'bg-gray-50 dark:bg-gray-800/30' : ''}`}
        onClick={() => {
          if (hasChildren) {
            toggleExpand(item.id);
          }
        }}
      >
        {/* Active indicator bar */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg animate-slideInLeft"></div>
        )}
        
        {/* Hover glow effect */}
        {!active && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
        )}
        
        <div className="flex items-center gap-3 flex-1 relative z-10">
          <div className={`relative ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
            {active && (
              <>
                <div className="absolute inset-0 bg-white/30 rounded-lg blur-md animate-pulse"></div>
                <div className="absolute -inset-1 bg-white/20 rounded-lg blur-sm"></div>
              </>
            )}
            <item.icon className={`relative w-5 h-5 ${active ? 'text-white drop-shadow-md animate-bounce-subtle' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'} transition-colors duration-300`} />
          </div>
          <span className={`text-sm font-semibold ${active ? 'text-white' : 'group-hover:text-gray-900 dark:group-hover:text-gray-100'} transition-colors duration-300`}>
            {item.label}
          </span>
          {item.badge && (
            <span className={`${item.badgeColor} text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider shadow-md ${active ? 'animate-pulse scale-110' : 'group-hover:scale-110 transition-transform duration-300'}`}>
              {item.badge}
            </span>
          )}
        </div>
        {hasChildren && (
          <div className={`relative z-10 transition-all duration-300 ${isExpanded ? 'rotate-90' : ''} ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            <ChevronRight className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} transition-colors duration-300`} />
          </div>
        )}
      </div>
    );

    return (
      <div key={item.id} className="mb-1">
        {item.path ? (
          <Link to={item.path}>{content}</Link>
        ) : (
          content
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-500 ease-out z-40 overflow-y-auto shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-72`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-transparent dark:from-blue-900/10 dark:via-purple-900/10 opacity-50 animate-gradient pointer-events-none"></div>
        
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 relative z-10 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-blue-500 p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-300 animate-gradient bg-[length:200%_auto]">
                  <LayoutDashboard className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
                {/* Rotating orbital ring */}
                <div className="absolute inset-0 rounded-lg border-2 border-blue-400/30 group-hover:rotate-180 transition-transform duration-1000 ease-out"></div>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Navigation</h2>
                <p className="text-[9px] font-semibold tracking-[0.15em] text-gray-500 dark:text-gray-500 uppercase">Enterprise Edition</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Quick Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 relative z-10">
          {filterMenuItems(menuItems).length > 0 ? (
            filterMenuItems(menuItems).map((item, index) => {
              // Check if item is a section divider
              if ('type' in item && item.type === 'divider') {
                return (
                  <div key={`divider-${index}`} className={`${index > 0 ? 'mt-6 pt-4' : 'mb-3'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.15em] text-gray-500 dark:text-gray-500 uppercase px-2 mb-2 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                      {item.label}
                    </p>
                  </div>
                );
              }
              // Regular menu item
              return renderMenuItem(item as MenuItem);
            })
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-500">No results found</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Try a different search term</p>
            </div>
          )}
        </nav>

        {/* Version Info - Enterprise Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 mt-auto relative z-10 backdrop-blur-sm">
          <div className="space-y-3 animate-fadeIn">
            {/* Platform branding */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 tracking-[0.2em] uppercase">
                  IAC Dharma Platform
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold rounded-full tracking-wider shadow-md">
                  v2.0
                </span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold rounded-full tracking-wider shadow-md">
                  ENTERPRISE
                </span>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-1" title="System Status">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span>ONLINE</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex items-center gap-1" title="Security Status">
                <Shield className="w-3 h-3 text-blue-600" />
                <span>SECURED</span>
              </div>
            </div>
            
            {/* Copyright */}
            <p className="text-[9px] text-center text-gray-400 dark:text-gray-600 tracking-wide">
              © 2025 All Rights Reserved
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
