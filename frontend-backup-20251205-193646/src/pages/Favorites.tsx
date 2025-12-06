import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Star, Trash2, ExternalLink, Clock, Folder, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface FavoriteItem {
  id: string;
  type: 'blueprint' | 'deployment' | 'template' | 'document' | 'dashboard';
  title: string;
  description: string;
  path: string;
  addedAt: string;
  category: string;
  icon: any;
  color: string;
}

export default function Favorites() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: '1',
      type: 'dashboard',
      title: 'Executive Dashboard',
      description: 'Main overview dashboard with key metrics',
      path: '/dashboard',
      addedAt: '2025-12-03',
      category: 'Dashboards',
      icon: '📊',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: '2',
      type: 'template',
      title: 'AWS EKS Cluster',
      description: 'Production-ready Kubernetes cluster template',
      path: '/templates/aws-eks',
      addedAt: '2025-12-02',
      category: 'Templates',
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: '3',
      type: 'blueprint',
      title: 'Multi-Region Database',
      description: 'PostgreSQL with cross-region replication',
      path: '/blueprints/multi-region-db',
      addedAt: '2025-12-01',
      category: 'Blueprints',
      icon: '🗄️',
      color: 'from-green-500 to-green-600',
    },
    {
      id: '4',
      type: 'document',
      title: 'Architecture Strategy',
      description: 'Enterprise architecture strategic planning',
      path: '/ea/strategy',
      addedAt: '2025-11-30',
      category: 'Documentation',
      icon: '📄',
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: '5',
      type: 'deployment',
      title: 'Production Environment',
      description: 'Main production deployment configuration',
      path: '/deployments/prod',
      addedAt: '2025-11-29',
      category: 'Deployments',
      icon: '🚀',
      color: 'from-pink-500 to-pink-600',
    },
  ]);

  const types = [
    { value: 'all', label: 'All Items', count: favorites.length },
    { value: 'dashboard', label: 'Dashboards', count: favorites.filter(f => f.type === 'dashboard').length },
    { value: 'template', label: 'Templates', count: favorites.filter(f => f.type === 'template').length },
    { value: 'blueprint', label: 'Blueprints', count: favorites.filter(f => f.type === 'blueprint').length },
    { value: 'document', label: 'Documents', count: favorites.filter(f => f.type === 'document').length },
    { value: 'deployment', label: 'Deployments', count: favorites.filter(f => f.type === 'deployment').length },
  ];

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Quick access to your most used resources
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{favorites.length} Favorites</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {types.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className="block group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden"
                >
                  {/* Gradient header */}
                  <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                  
                  <div className="p-6">
                    {/* Icon & Type */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {item.icon}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFavorite(item.id);
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 pointer-events-none transition-all duration-300"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Star className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No favorites found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Start adding items to your favorites for quick access'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
