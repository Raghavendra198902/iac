import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Zap,
  History,
  Star,
  StarOff,
  Mic,
  Image,
  Code,
  Database,
  Cloud,
  Brain,
  ArrowRight,
  Command,
  Hash,
  Calendar,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MainLayout } from '../components/layout';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Data Analytics Pipeline',
    'Security vulnerability',
    'Sarah Johnson',
    'Architecture Document',
  ]);
  const [savedSearches, setSavedSearches] = useState<{ query: string; category: SearchCategory }[]>([
    { query: 'high priority tasks', category: 'tasks' },
    { query: 'architecture documents', category: 'documents' },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>('relevance');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search whenever query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
      // Add to history after a delay
      const timer = setTimeout(() => {
        if (!searchHistory.includes(searchQuery)) {
          setSearchHistory([searchQuery, ...searchHistory.slice(0, 9)]);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setStats(null);
    }
  }, [searchQuery, activeCategory, sortBy]);

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.success('🎤 Voice search activated');
      setTimeout(() => {
        setSearchQuery('Cloud infrastructure monitoring');
        setIsListening(false);
      }, 2000);
    }
  };

  const toggleSaveSearch = () => {
    const exists = savedSearches.find(s => s.query === searchQuery && s.category === activeCategory);
    if (exists) {
      setSavedSearches(savedSearches.filter(s => s.query !== searchQuery || s.category !== activeCategory));
      toast.success('Removed from saved searches');
    } else {
      setSavedSearches([{ query: searchQuery, category: activeCategory }, ...savedSearches]);
      toast.success('⭐ Search saved!');
    }
  };

  const isSaved = savedSearches.some(s => s.query === searchQuery && s.category === activeCategory);

  const performSearch = () => {
    setIsSearching(true);
    const startTime = Date.now();

    // Simulate AI-powered search with fuzzy matching
    setTimeout(() => {
      const sampleResults = generateSampleResults(searchQuery, activeCategory);
      
      // Apply sorting
      let sortedResults = [...sampleResults];
      if (sortBy === 'date') {
        sortedResults.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      } else if (sortBy === 'popularity') {
        sortedResults.sort((a, b) => (b.metadata?.views || 0) - (a.metadata?.views || 0));
      }
      
      setResults(sortedResults);
      
      const searchTime = Date.now() - startTime;
      setStats({
        totalResults: sortedResults.length,
        resultsByCategory: {
          all: sortedResults.length,
          projects: sortedResults.filter(r => r.category === 'projects').length,
          tasks: sortedResults.filter(r => r.category === 'tasks').length,
          team: sortedResults.filter(r => r.category === 'team').length,
          documents: sortedResults.filter(r => r.category === 'documents').length,
          activities: sortedResults.filter(r => r.category === 'activities').length,
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
        metadata: { status: 'in-progress', progress: 45, team: 8, views: 324, relevance: 0.95 },
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
        metadata: { status: 'planning', progress: 15, team: 5, views: 156, relevance: 0.88 },
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
        metadata: { status: 'in-progress', progress: 60, team: 12, views: 489, relevance: 0.92 },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 p-6 relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 dark:from-blue-600/10 dark:to-purple-800/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/20 to-pink-600/20 dark:from-purple-600/10 dark:to-pink-800/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  </motion.div>
                  AI-Powered Global Search
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Intelligent search across your entire workspace with natural language processing
                </p>
              </div>
              
              {/* AI Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAiMode(!aiMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  aiMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Zap className="w-4 h-4" />
                {aiMode ? 'AI Mode Active' : 'Enable AI Mode'}
              </motion.button>
            </div>
          </motion.div>

          {/* Search Bar - Ultra Modern */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mb-6 overflow-hidden"
          >
            <div className="p-6">
              <div className="relative">
                <motion.div
                  animate={isSearching ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isSearching ? Infinity : 0, ease: "linear" }}
                  className="absolute left-5 top-1/2 -translate-y-1/2"
                >
                  <Search className="w-7 h-7 text-blue-600" />
                </motion.div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={aiMode ? "Ask anything... (e.g., 'show me high priority tasks from last week')" : "Search for anything..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  className="w-full pl-16 pr-40 py-5 text-lg border-0 focus:ring-2 focus:ring-blue-500 rounded-xl bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-all"
                  autoFocus
                />
                
                {/* Action Buttons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleSaveSearch}
                        className={`p-2 rounded-lg transition-all ${
                          isSaved
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'
                        }`}
                        title={isSaved ? "Remove from saved" : "Save search"}
                      >
                        {isSaved ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery('')}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </motion.button>
                    </>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVoiceSearch}
                    className={`p-2 rounded-lg transition-all ${
                      isListening
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'
                    }`}
                    title="Voice search"
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Search History Dropdown */}
                <AnimatePresence>
                  {showHistory && searchQuery.length === 0 && searchHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Recent Searches
                          </span>
                          <button
                            onClick={() => setSearchHistory([])}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {searchHistory.map((query, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(query)}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group"
                          >
                            <Clock className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            <span className="text-gray-700 dark:text-gray-300">{query}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Advanced Controls Row */}
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                {/* Category Filters */}
                <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                        activeCategory === cat.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {getCategoryIcon(cat.id)}
                      <span>{cat.label}</span>
                      {searchQuery && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            activeCategory === cat.id
                              ? 'bg-white/30 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {cat.count}
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">🎯 Relevance</option>
                  <option value="date">📅 Date</option>
                  <option value="popularity">🔥 Popularity</option>
                </select>
              </div>
            </div>

            {/* Search Stats Bar */}
            {stats && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    Found <span className="font-bold text-blue-600">{stats.totalResults}</span> results
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{stats.searchTime}ms</span>
                  </div>
                  {aiMode && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                    >
                      <Brain className="w-3 h-3" />
                      AI Enhanced
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                >
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                Saved Searches
              </h3>
              <div className="flex gap-2 flex-wrap">
                {savedSearches.map((saved, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    onClick={() => {
                      setSearchQuery(saved.query);
                      setActiveCategory(saved.category);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    {getCategoryIcon(saved.category)}
                    <span>{saved.query}</span>
                    <ArrowRight className="w-3 h-3" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {isSearching ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Sparkles className="w-16 h-16 text-blue-600" />
              </motion.div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                {aiMode ? 'AI is analyzing your query...' : 'Searching...'}
              </p>
            </motion.div>
          ) : searchQuery.length < 2 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center py-16"
            >
              <div className="relative inline-block mb-6">
                <Search className="w-20 h-20 text-gray-300 dark:text-gray-700" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Start your search journey
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Use natural language or keywords to find anything across your workspace
              </p>
              
              {/* Quick Search Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {[
                  { icon: Hash, text: 'high priority tasks', cat: 'tasks' as SearchCategory },
                  { icon: Calendar, text: 'projects from last month', cat: 'projects' as SearchCategory },
                  { icon: Users, text: 'team members in cloud', cat: 'team' as SearchCategory },
                  { icon: FileText, text: 'architecture documents', cat: 'documents' as SearchCategory },
                ].map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    onClick={() => {
                      setSearchQuery(suggestion.text);
                      setActiveCategory(suggestion.cat);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <suggestion.icon className="w-4 h-4 text-blue-600" />
                    {suggestion.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="relative inline-block mb-6">
                <Search className="w-20 h-20 text-gray-300 dark:text-gray-700" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search query or filters
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              {results.map((result, idx) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  onClick={() => handleResultClick(result)}
                  whileHover={{ scale: 1.01, y: -4 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-start gap-4">
                    {/* Icon with Ping Effect */}
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`relative p-4 rounded-xl ${getCategoryColor(result.category)} group-hover:shadow-lg transition-all`}
                    >
                      {getCategoryIcon(result.category)}
                      {aiMode && result.metadata?.relevance && result.metadata.relevance > 0.9 && (
                        <>
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                          </span>
                        </>
                      )}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                            {result.title}
                            {aiMode && result.metadata?.relevance && (
                              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                {Math.round(result.metadata.relevance * 100)}% match
                              </span>
                            )}
                          </h3>
                          {result.subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="text-gray-400 group-hover:text-blue-600 transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </motion.div>
                      </div>

                      {result.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {result.description}
                        </p>
                      )}

                      {/* Enhanced Metadata */}
                      <div className="flex items-center gap-3 flex-wrap text-xs">
                        <span className={`px-3 py-1.5 rounded-full font-semibold ${getCategoryColor(result.category)}`}>
                          {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                        </span>
                        {result.timestamp && (
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <Clock className="w-3.5 h-3.5" />
                            {result.timestamp.toLocaleDateString()}
                          </span>
                        )}
                        {result.metadata?.views && (
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <Activity className="w-3.5 h-3.5" />
                            {result.metadata.views} views
                          </span>
                        )}
                        {result.metadata && Object.keys(result.metadata).length > 3 && (
                          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Tag className="w-3.5 h-3.5" />
                            +{Object.keys(result.metadata).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Enhanced Search Tips */}
          {!searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50"
            >
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Pro Search Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Brain, title: 'Natural Language', desc: 'Ask questions naturally: "show me projects by Sarah"' },
                  { icon: Zap, title: 'Smart Filters', desc: 'Combine categories and dates for precise results' },
                  { icon: Star, title: 'Save Searches', desc: 'Star frequently used searches for quick access' },
                  { icon: Mic, title: 'Voice Search', desc: 'Use voice input for hands-free searching' },
                  { icon: Command, title: 'Keyboard Shortcuts', desc: 'Press Cmd+K (Mac) or Ctrl+K (Windows) anywhere' },
                  { icon: History, title: 'Search History', desc: 'Access your recent searches from the dropdown' },
                ].map((tip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <tip.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tip.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
