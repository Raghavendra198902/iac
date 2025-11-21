import { FileText, Plus, Search, Filter, Download, Upload, MoreVertical, Clock, Users, Shield, TrendingUp, Brain, Cloud, Zap, Grid, List, Star, Copy, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FadeIn from '../components/ui/FadeIn';

interface Blueprint {
  id: string;
  name: string;
  cloud: string | any;
  environment: string | any;
  resources: number | any[];
  status: string;
  updatedAt: string;
  cost?: number;
  compliance?: number;
  aiScore?: number;
  collaborators?: number;
  starred?: boolean;
  category?: string;
}

// Helper function to safely render values
const safeRenderValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && value !== null) {
    // Handle objects that might have a name or label property
    return value.name || value.label || value.value || JSON.stringify(value);
  }
  return String(value || '');
};

export default function BlueprintList() {
  // Load blueprints from API - no demo data
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Enterprise metrics
  const [stats] = useState({
    totalBlueprints: 47,
    activeDeployments: 23,
    avgCostSavings: 32,
    complianceScore: 94,
  });

  useEffect(() => {
    const loadBlueprints = async () => {
      try {
        const response = await fetch('/api/blueprints');
        if (response.ok) {
          const data = await response.json();
          setBlueprints(data);
        }
      } catch (error) {
        console.error('Failed to load blueprints:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlueprints();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <FadeIn>
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-bold">Blueprint Library</h1>
              </div>
              <p className="text-primary-100 text-lg">
                AI-powered infrastructure designs with compliance tracking and cost optimization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 border border-white/20">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <Link to="/designer" className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg">
                <Plus className="w-5 h-5" />
                New Blueprint
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FadeIn delay={100}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBlueprints}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Blueprints</p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900 rounded-lg">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDeployments}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Deployments</p>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgCostSavings}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Cost Savings</p>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.complianceScore}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Compliance Score</p>
          </div>
        </FadeIn>
      </div>

      {/* Filters & View Options */}
      <FadeIn delay={500}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Search blueprints by name, cloud, or environment..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                <option>All Clouds</option>
                <option>AWS</option>
                <option>Azure</option>
                <option>GCP</option>
                <option>Multi-Cloud</option>
              </select>

              <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                <option>All Environments</option>
                <option>Production</option>
                <option>Staging</option>
                <option>Development</option>
              </select>

              <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-gray-50 dark:bg-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Blueprints Grid/List */}
      <FadeIn delay={600}>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 text-primary-600 dark:text-primary-400">
                <div className="w-6 h-6 border-3 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium">Loading blueprints...</span>
              </div>
            </div>
          ) : blueprints.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <div className="inline-flex p-5 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900 dark:to-purple-900 rounded-2xl mb-6">
                  <FileText className="h-16 w-16 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No blueprints yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  Start building your infrastructure with AI-powered blueprint designer
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/designer" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg">
                    <Plus className="h-5 w-5" />
                    Create Blueprint
                  </Link>
                  <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Existing
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
              {blueprints.map((blueprint, idx) => (
                viewMode === 'grid' ? (
                  <FadeIn key={blueprint.id} delay={100 + idx * 50}>
                    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900 dark:to-purple-900 rounded-xl">
                              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {blueprint.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{blueprint.category || 'Infrastructure'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {blueprint.starred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Cloud className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{safeRenderValue(blueprint.cloud)}</span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{safeRenderValue(blueprint.environment)}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {typeof blueprint.resources === 'number' ? blueprint.resources : Array.isArray(blueprint.resources) ? blueprint.resources.length : 0} resources
                              </span>
                            </div>
                            {blueprint.collaborators && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <span className="text-gray-700 dark:text-gray-300">{blueprint.collaborators}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            {blueprint.aiScore && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI {blueprint.aiScore}%</span>
                              </div>
                            )}
                            {blueprint.compliance && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-semibold text-green-700 dark:text-green-300">{blueprint.compliance}%</span>
                              </div>
                            )}
                            {blueprint.cost && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">${blueprint.cost}/mo</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{blueprint.updatedAt}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            blueprint.status === 'Active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {blueprint.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            to={`/blueprints/${blueprint.id}`}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all text-center"
                          >
                            View Details
                          </Link>
                          <button className="p-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ) : (
                  <FadeIn key={blueprint.id} delay={100 + idx * 30}>
                    <Link
                      to={`/blueprints/${blueprint.id}`}
                      className="flex items-center justify-between p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-5 flex-1">
                        <div className="p-3 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900 dark:to-purple-900 rounded-xl">
                          <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {blueprint.name}
                            </h3>
                            {blueprint.starred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Cloud className="w-4 h-4" />
                              {safeRenderValue(blueprint.cloud)}
                            </span>
                            <span>{safeRenderValue(blueprint.environment)}</span>
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4" />
                              {typeof blueprint.resources === 'number' ? blueprint.resources : Array.isArray(blueprint.resources) ? blueprint.resources.length : 0} resources
                            </span>
                            {blueprint.collaborators && (
                              <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {blueprint.collaborators} collaborators
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {blueprint.updatedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {blueprint.aiScore && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{blueprint.aiScore}%</span>
                          </div>
                        )}
                        {blueprint.compliance && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">{blueprint.compliance}%</span>
                          </div>
                        )}
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          blueprint.status === 'Active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {blueprint.status}
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                )
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
