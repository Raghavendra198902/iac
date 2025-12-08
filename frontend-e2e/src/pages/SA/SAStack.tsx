import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  CircleStackIcon,
  CloudIcon,
  CpuChipIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

interface TechnologyLayer {
  id: string;
  name: string;
  layer: 'presentation' | 'application' | 'business' | 'data' | 'infrastructure';
  technologies: Technology[];
  maturity: 'emerging' | 'adopted' | 'standard' | 'legacy';
}

interface Technology {
  name: string;
  version: string;
  purpose: string;
  status: 'active' | 'deprecated' | 'planned';
}

const SAStack: React.FC = () => {
  const [layers, setLayers] = useState<TechnologyLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<string>('all');

  useEffect(() => {
    loadTechnologyStack();
  }, []);

  const loadTechnologyStack = () => {
    const sampleLayers: TechnologyLayer[] = [
      {
        id: '1',
        name: 'Presentation Layer',
        layer: 'presentation',
        maturity: 'standard',
        technologies: [
          { name: 'React', version: '18.3.1', purpose: 'Frontend Framework', status: 'active' },
          { name: 'TypeScript', version: '5.5.3', purpose: 'Type Safety', status: 'active' },
          { name: 'Vite', version: '5.4.21', purpose: 'Build Tool', status: 'active' },
          { name: 'TailwindCSS', version: '3.4.0', purpose: 'Styling', status: 'active' }
        ]
      },
      {
        id: '2',
        name: 'Application Layer',
        layer: 'application',
        maturity: 'standard',
        technologies: [
          { name: 'Node.js', version: '18 LTS', purpose: 'Runtime', status: 'active' },
          { name: 'Express', version: '4.x', purpose: 'Web Framework', status: 'active' },
          { name: 'FastAPI', version: '0.109.0', purpose: 'Python API Framework', status: 'active' },
          { name: 'GraphQL', version: '16.x', purpose: 'API Query Language', status: 'active' }
        ]
      },
      {
        id: '3',
        name: 'Business Logic Layer',
        layer: 'business',
        maturity: 'adopted',
        technologies: [
          { name: 'Python', version: '3.11', purpose: 'Business Logic', status: 'active' },
          { name: 'TensorFlow', version: '2.15', purpose: 'ML/AI Models', status: 'active' },
          { name: 'Scikit-learn', version: '1.3', purpose: 'ML Library', status: 'active' },
          { name: 'Pandas', version: '2.1', purpose: 'Data Processing', status: 'active' }
        ]
      },
      {
        id: '4',
        name: 'Data Layer',
        layer: 'data',
        maturity: 'standard',
        technologies: [
          { name: 'PostgreSQL', version: '15.3', purpose: 'Relational Database', status: 'active' },
          { name: 'Redis', version: '7.0', purpose: 'Cache & Session Store', status: 'active' },
          { name: 'Neo4j', version: '5.x', purpose: 'Graph Database', status: 'active' },
          { name: 'Kafka', version: '3.5', purpose: 'Event Streaming', status: 'active' }
        ]
      },
      {
        id: '5',
        name: 'Infrastructure Layer',
        layer: 'infrastructure',
        maturity: 'standard',
        technologies: [
          { name: 'Docker', version: '24.x', purpose: 'Containerization', status: 'active' },
          { name: 'Kubernetes', version: '1.28', purpose: 'Orchestration', status: 'active' },
          { name: 'Prometheus', version: '2.45', purpose: 'Monitoring', status: 'active' },
          { name: 'Grafana', version: '10.x', purpose: 'Visualization', status: 'active' },
          { name: 'Nginx', version: 'Alpine', purpose: 'Reverse Proxy', status: 'active' }
        ]
      }
    ];

    setLayers(sampleLayers);
    setLoading(false);
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'standard':
        return 'text-green-400 bg-green-400/20';
      case 'adopted':
        return 'text-blue-400 bg-blue-400/20';
      case 'emerging':
        return 'text-purple-400 bg-purple-400/20';
      case 'legacy':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'presentation':
        return <CodeBracketIcon className="w-6 h-6 text-blue-400" />;
      case 'application':
        return <CommandLineIcon className="w-6 h-6 text-green-400" />;
      case 'business':
        return <CpuChipIcon className="w-6 h-6 text-purple-400" />;
      case 'data':
        return <CircleStackIcon className="w-6 h-6 text-cyan-400" />;
      case 'infrastructure':
        return <ServerIcon className="w-6 h-6 text-orange-400" />;
      default:
        return <ServerIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const layerFilters = ['all', 'presentation', 'application', 'business', 'data', 'infrastructure'];
  const filteredLayers = selectedLayer === 'all' 
    ? layers 
    : layers.filter(l => l.layer === selectedLayer);

  const totalTechnologies = layers.reduce((sum, l) => sum + l.technologies.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading technology stack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Technology Stack
            </h1>
            <p className="text-gray-300">Layered technology architecture and standards</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {layerFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedLayer(filter)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedLayer === filter
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold text-white">{layers.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Architecture Layers</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CpuChipIcon className="w-8 h-8 text-teal-400" />
              <span className="text-3xl font-bold text-white">{totalTechnologies}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Technologies</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">
                {layers.filter(l => l.maturity === 'standard').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Standard Layers</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CloudIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">100%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Cloud Native</h3>
          </div>
        </div>

        {/* Technology Layers */}
        <div className="space-y-6">
          {filteredLayers.map((layer) => (
            <div
              key={layer.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  {getLayerIcon(layer.layer)}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{layer.name}</h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getMaturityColor(layer.maturity)}`}>
                        {layer.maturity.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-white/10 text-gray-300">
                        {layer.technologies.length} Technologies
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {layer.technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-bold text-white">{tech.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        tech.status === 'active' 
                          ? 'text-green-400 bg-green-400/20' 
                          : tech.status === 'deprecated'
                          ? 'text-red-400 bg-red-400/20'
                          : 'text-blue-400 bg-blue-400/20'
                      }`}>
                        {tech.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{tech.purpose}</p>
                    <p className="text-xs text-gray-500">Version: {tech.version}</p>
                  </div>
                ))}
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

export default SAStack;
