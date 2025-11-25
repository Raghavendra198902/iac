import { useState, useEffect } from 'react';
import type { SearchResult, SearchCategory, SearchStats } from '../types/search';
import {
  Search,
  Filter,
  X,
  FileText,
  Users,
  CheckSquare,
  Folder,
  Activity,
  Tag,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MainLayout } from '../components/layout';

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);

  // Search whenever query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setResults([]);
      setStats(null);
    }
  }, [searchQuery, activeCategory]);

  const performSearch = () => {
    setIsSearching(true);
    const startTime = Date.now();

    // Simulate search with sample data
    setTimeout(() => {
      const sampleResults = generateSampleResults(searchQuery, activeCategory);
      setResults(sampleResults);
      
      const searchTime = Date.now() - startTime;
      setStats({
        totalResults: sampleResults.length,
        resultsByCategory: {
          all: sampleResults.length,
          projects: sampleResults.filter(r => r.category === 'projects').length,
          tasks: sampleResults.filter(r => r.category === 'tasks').length,
          team: sampleResults.filter(r => r.category === 'team').length,
          documents: sampleResults.filter(r => r.category === 'documents').length,
          activities: sampleResults.filter(r => r.category === 'activities').length,
        },
        searchTime,
      });
      
      setIsSearching(false);
    }, 300);
  };

  const generateSampleResults = (query: string, category: SearchCategory): SearchResult[] => {
    const allResults: SearchResult[] = [
      // Projects
      {
        id: 'proj-1',
        category: 'projects',
        title: 'E-commerce Platform Migration',
        description: 'Migrate legacy e-commerce platform to cloud-native architecture',
        subtitle: 'In Progress • 45% Complete',
        url: '/workflow',
        icon: 'folder',
        timestamp: new Date('2025-11-20'),
        metadata: { status: 'in-progress', progress: 45, team: 8 },
      },
      {
        id: 'proj-2',
        category: 'projects',
        title: 'Data Analytics Pipeline',
        description: 'Build real-time data processing pipeline with ML capabilities',
        subtitle: 'Planning • 15% Complete',
        url: '/workflow',
        icon: 'folder',
        timestamp: new Date('2025-11-22'),
        metadata: { status: 'planning', progress: 15, team: 5 },
      },
      {
        id: 'proj-3',
        category: 'projects',
        title: 'Microservices Architecture',
        description: 'Decompose monolith into containerized microservices',
        subtitle: 'In Progress • 60% Complete',
        url: '/workflow',
        icon: 'folder',
        timestamp: new Date('2025-11-18'),
        metadata: { status: 'in-progress', progress: 60, team: 12 },
      },
      
      // Tasks
      {
        id: 'task-1',
        category: 'tasks',
        title: 'Complete architecture documentation',
        description: 'Document system architecture and design decisions',
        subtitle: 'Assigned to Sarah Johnson • High Priority',
        url: '/workflow/team',
        icon: 'check-square',
        timestamp: new Date('2025-11-25'),
        metadata: { assignee: 'Sarah Johnson', priority: 'high', status: 'in-progress' },
      },
      {
        id: 'task-2',
        category: 'tasks',
        title: 'Security vulnerability assessment',
        description: 'Perform comprehensive security audit',
        subtitle: 'Assigned to Emily Davis • Critical',
        url: '/workflow/team',
        icon: 'check-square',
        timestamp: new Date('2025-11-26'),
        metadata: { assignee: 'Emily Davis', priority: 'critical', status: 'in-progress' },
      },
      {
        id: 'task-3',
        category: 'tasks',
        title: 'Deploy monitoring stack',
        description: 'Set up Grafana and Prometheus monitoring',
        subtitle: 'Assigned to Mike Chen • Completed',
        url: '/workflow/team',
        icon: 'check-square',
        timestamp: new Date('2025-11-24'),
        metadata: { assignee: 'Mike Chen', priority: 'high', status: 'completed' },
      },
      
      // Team Members
      {
        id: 'user-1',
        category: 'team',
        title: 'Sarah Johnson',
        description: 'Solution Architect',
        subtitle: 'AWS, Azure, Architecture Design, Terraform',
        url: '/workflow/team',
        icon: 'user',
        timestamp: new Date('2023-11-20'),
        metadata: { role: 'Solution Architect', projects: 5, tasks: 78 },
      },
      {
        id: 'user-2',
        category: 'team',
        title: 'Mike Chen',
        description: 'DevOps Engineer',
        subtitle: 'Kubernetes, Docker, CI/CD, Monitoring',
        url: '/workflow/team',
        icon: 'user',
        timestamp: new Date('2024-02-10'),
        metadata: { role: 'DevOps Engineer', projects: 2, tasks: 62 },
      },
      {
        id: 'user-3',
        category: 'team',
        title: 'Emily Davis',
        description: 'Security Engineer',
        subtitle: 'Security, Compliance, Risk Assessment, IAM',
        url: '/workflow/team',
        icon: 'user',
        timestamp: new Date('2024-03-05'),
        metadata: { role: 'Security Engineer', projects: 4, tasks: 56 },
      },
      
      // Documents
      {
        id: 'doc-1',
        category: 'documents',
        title: 'System Architecture Document',
        description: 'Comprehensive architecture design and patterns',
        subtitle: 'Solution Architecture • Updated 2 days ago',
        url: '/ea/repository',
        icon: 'file-text',
        timestamp: new Date('2025-11-23'),
        metadata: { type: 'SA', pages: 45, version: '2.1' },
      },
      {
        id: 'doc-2',
        category: 'documents',
        title: 'Technical Architecture Specification',
        description: 'Detailed technical implementation guide',
        subtitle: 'Technical Architecture • Updated 1 week ago',
        url: '/ea/repository',
        icon: 'file-text',
        timestamp: new Date('2025-11-18'),
        metadata: { type: 'TA', pages: 67, version: '1.8' },
      },
      {
        id: 'doc-3',
        category: 'documents',
        title: 'Security Compliance Report',
        description: 'Q4 2025 security audit and compliance status',
        subtitle: 'Security • Updated 3 days ago',
        url: '/ea/repository',
        icon: 'file-text',
        timestamp: new Date('2025-11-22'),
        metadata: { type: 'Security', pages: 28, version: '1.0' },
      },
      
      // Activities
      {
        id: 'activity-1',
        category: 'activities',
        title: 'Project created: Data Analytics Pipeline',
        description: 'New workflow project initiated by John Smith',
        subtitle: '2 hours ago',
        url: '/dashboard',
        icon: 'activity',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        metadata: { type: 'project_created', user: 'John Smith' },
      },
      {
        id: 'activity-2',
        category: 'activities',
        title: 'Task completed: Monitoring deployment',
        description: 'Mike Chen completed high priority task',
        subtitle: '5 hours ago',
        url: '/workflow/team',
        icon: 'activity',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        metadata: { type: 'task_completed', user: 'Mike Chen' },
      },
      {
        id: 'activity-3',
        category: 'activities',
        title: 'Document updated: Architecture Design',
        description: 'Sarah Johnson updated solution architecture',
        subtitle: '1 day ago',
        url: '/ea/repository',
        icon: 'activity',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        metadata: { type: 'document_updated', user: 'Sarah Johnson' },
      },
    ];

    // Filter by search query
    const queryLower = query.toLowerCase();
    let filtered = allResults.filter(
      (result) =>
        result.title.toLowerCase().includes(queryLower) ||
        result.description?.toLowerCase().includes(queryLower) ||
        result.subtitle?.toLowerCase().includes(queryLower)
    );

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter((result) => result.category === category);
    }

    return filtered;
  };

  const getCategoryIcon = (category: SearchCategory) => {
    switch (category) {
      case 'projects':
        return <Folder className="w-5 h-5" />;
      case 'tasks':
        return <CheckSquare className="w-5 h-5" />;
      case 'team':
        return <Users className="w-5 h-5" />;
      case 'documents':
        return <FileText className="w-5 h-5" />;
      case 'activities':
        return <Activity className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: SearchCategory) => {
    switch (category) {
      case 'projects':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'tasks':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'team':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'documents':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'activities':
        return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const categories: { id: SearchCategory; label: string; count?: number }[] = [
    { id: 'all', label: 'All Results', count: stats?.totalResults || 0 },
    { id: 'projects', label: 'Projects', count: stats?.resultsByCategory.projects || 0 },
    { id: 'tasks', label: 'Tasks', count: stats?.resultsByCategory.tasks || 0 },
    { id: 'team', label: 'Team', count: stats?.resultsByCategory.team || 0 },
    { id: 'documents', label: 'Documents', count: stats?.resultsByCategory.documents || 0 },
    { id: 'activities', label: 'Activities', count: stats?.resultsByCategory.activities || 0 },
  ];

  const handleResultClick = (result: SearchResult) => {
    toast.success(`Opening: ${result.title}`);
    if (result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-2">
              <Search className="w-8 h-8 text-blue-600" />
              Global Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find projects, tasks, team members, documents, and activities across your workspace
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 text-lg border-0 focus:ring-2 focus:ring-blue-500 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.label}</span>
                    {searchQuery && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          activeCategory === cat.id
                            ? 'bg-blue-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Stats */}
            {stats && searchQuery && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Found <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.totalResults}</span> results
                  in {stats.searchTime}ms
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          {isSearching ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Start typing to search
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Search across projects, tasks, team members, documents, and activities
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search query or filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg ${getCategoryColor(result.category)}`}>
                      {getCategoryIcon(result.category)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                            {result.title}
                          </h3>
                          {result.subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </div>

                      {result.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {result.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full font-medium ${getCategoryColor(result.category)}`}>
                          {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                        </span>
                        {result.timestamp && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.timestamp.toLocaleDateString()}
                          </span>
                        )}
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {Object.keys(result.metadata).length} attributes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Tips */}
          {!searchQuery && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Search Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Use category filters to narrow down results to specific types</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Search works across titles, descriptions, and metadata</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Click on any result to navigate directly to that item</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Use keyboard shortcut Cmd+K (Mac) or Ctrl+K (Windows) to quick search</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
