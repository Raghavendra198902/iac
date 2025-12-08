import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ArrowPathIcon,
  CloudIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CircleStackIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface TechnologyComponent {
  id: string;
  name: string;
  category: 'infrastructure' | 'platform' | 'middleware' | 'database' | 'security';
  vendor: string;
  version: string;
  status: 'active' | 'deprecated' | 'sunset';
  licenses: number;
  cost: number;
  supportEnd: string;
}

const EATechnology: React.FC = () => {
  const [components, setComponents] = useState<TechnologyComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTechnologyStack();
  }, []);

  const loadTechnologyStack = () => {
    const sampleComponents: TechnologyComponent[] = [
      {
        id: '1',
        name: 'AWS Cloud Platform',
        category: 'infrastructure',
        vendor: 'Amazon Web Services',
        version: 'Latest',
        status: 'active',
        licenses: 100,
        cost: 45000,
        supportEnd: '2030-12-31'
      },
      {
        id: '2',
        name: 'Kubernetes',
        category: 'platform',
        vendor: 'CNCF',
        version: 'v1.28',
        status: 'active',
        licenses: 0,
        cost: 0,
        supportEnd: '2025-06-30'
      },
      {
        id: '3',
        name: 'PostgreSQL',
        category: 'database',
        vendor: 'PostgreSQL Global Development Group',
        version: '15.3',
        status: 'active',
        licenses: 0,
        cost: 0,
        supportEnd: '2027-11-09'
      },
      {
        id: '4',
        name: 'Redis Enterprise',
        category: 'database',
        vendor: 'Redis Inc',
        version: '7.0',
        status: 'active',
        licenses: 10,
        cost: 12000,
        supportEnd: '2026-03-15'
      },
      {
        id: '5',
        name: 'Kong API Gateway',
        category: 'middleware',
        vendor: 'Kong Inc',
        version: '3.4',
        status: 'active',
        licenses: 5,
        cost: 18000,
        supportEnd: '2026-08-20'
      },
      {
        id: '6',
        name: 'HashiCorp Vault',
        category: 'security',
        vendor: 'HashiCorp',
        version: '1.15',
        status: 'active',
        licenses: 20,
        cost: 25000,
        supportEnd: '2027-01-10'
      },
      {
        id: '7',
        name: 'Oracle Database',
        category: 'database',
        vendor: 'Oracle',
        version: '19c',
        status: 'deprecated',
        licenses: 50,
        cost: 85000,
        supportEnd: '2024-12-31'
      },
      {
        id: '8',
        name: 'VMware vSphere',
        category: 'infrastructure',
        vendor: 'VMware',
        version: '7.0',
        status: 'active',
        licenses: 100,
        cost: 75000,
        supportEnd: '2026-10-01'
      }
    ];

    setComponents(sampleComponents);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'deprecated':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'sunset':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return <ServerIcon className="w-6 h-6 text-blue-400" />;
      case 'platform':
        return <CloudIcon className="w-6 h-6 text-purple-400" />;
      case 'middleware':
        return <CpuChipIcon className="w-6 h-6 text-cyan-400" />;
      case 'database':
        return <CircleStackIcon className="w-6 h-6 text-green-400" />;
      case 'security':
        return <ShieldCheckIcon className="w-6 h-6 text-red-400" />;
      default:
        return <CpuChipIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const categories = ['all', 'infrastructure', 'platform', 'middleware', 'database', 'security'];
  const filteredComponents = selectedCategory === 'all' 
    ? components 
    : components.filter(c => c.category === selectedCategory);

  const totalCost = components.reduce((sum, c) => sum + c.cost, 0);
  const activeComponents = components.filter(c => c.status === 'active').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading technology stack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              Technology Architecture
            </h1>
            <p className="text-gray-300">Technology stack and infrastructure components</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CpuChipIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">{components.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Components</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{activeComponents}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Active</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">
                {components.filter(c => c.status === 'deprecated').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Deprecated</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CpuChipIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">${(totalCost / 1000).toFixed(0)}K</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Annual Cost</h3>
          </div>
        </div>

        {/* Technology Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getCategoryIcon(component.category)}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{component.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{component.vendor}</p>
                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(component.status)}`}>
                        {component.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500/20 text-gray-300">
                        {component.version}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Category</p>
                    <p className="text-sm font-semibold text-white capitalize">{component.category}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Licenses</p>
                    <p className="text-sm font-semibold text-white">
                      {component.licenses === 0 ? 'Open Source' : component.licenses}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Annual Cost</p>
                    <p className="text-sm font-semibold text-white">
                      {component.cost === 0 ? 'Free' : `$${component.cost.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Support End</p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(component.supportEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default EATechnology;
