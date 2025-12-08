import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CubeIcon,
  CloudIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface SolutionDesign {
  id: string;
  name: string;
  project: string;
  status: 'draft' | 'review' | 'approved' | 'implemented';
  architect: string;
  components: number;
  lastUpdated: string;
  coverage: number;
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  phase: string;
}

const SADesign: React.FC = () => {
  const [designs, setDesigns] = useState<SolutionDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadSolutionDesigns();
  }, []);

  const loadSolutionDesigns = () => {
    const sampleDesigns: SolutionDesign[] = [
      {
        id: '1',
        name: 'Multi-Cloud Orchestration Platform',
        project: 'Cloud Migration Initiative',
        status: 'implemented',
        architect: 'John Smith',
        components: 12,
        lastUpdated: '2024-11-28',
        coverage: 98,
        complexity: 'very-high',
        phase: 'Production'
      },
      {
        id: '2',
        name: 'Zero Trust Security Framework',
        project: 'Enterprise Security Upgrade',
        status: 'implemented',
        architect: 'Sarah Johnson',
        components: 8,
        lastUpdated: '2024-12-01',
        coverage: 95,
        complexity: 'high',
        phase: 'Production'
      },
      {
        id: '3',
        name: 'AI-Powered AIOps Solution',
        project: 'Operations Modernization',
        status: 'approved',
        architect: 'Michael Chen',
        components: 15,
        lastUpdated: '2024-12-05',
        coverage: 85,
        complexity: 'very-high',
        phase: 'Implementation'
      },
      {
        id: '4',
        name: 'Real-time Data Analytics Pipeline',
        project: 'Data Platform v3',
        status: 'review',
        architect: 'Emily Davis',
        components: 10,
        lastUpdated: '2024-12-07',
        coverage: 72,
        complexity: 'high',
        phase: 'Design Review'
      },
      {
        id: '5',
        name: 'Microservices API Gateway',
        project: 'API Strategy',
        status: 'approved',
        architect: 'David Wilson',
        components: 6,
        lastUpdated: '2024-11-25',
        coverage: 88,
        complexity: 'medium',
        phase: 'Development'
      },
      {
        id: '6',
        name: 'Kubernetes Multi-Cluster Architecture',
        project: 'Container Platform',
        status: 'draft',
        architect: 'Lisa Anderson',
        components: 9,
        lastUpdated: '2024-12-08',
        coverage: 45,
        complexity: 'high',
        phase: 'Initial Design'
      }
    ];

    setDesigns(sampleDesigns);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'text-green-400 bg-green-400/20';
      case 'approved':
        return 'text-blue-400 bg-blue-400/20';
      case 'review':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'draft':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-green-400 bg-green-400/20';
      case 'medium':
        return 'text-blue-400 bg-blue-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/20';
      case 'very-high':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const statuses = ['all', 'draft', 'review', 'approved', 'implemented'];
  const filteredDesigns = selectedStatus === 'all' 
    ? designs 
    : designs.filter(d => d.status === selectedStatus);

  const implementedCount = designs.filter(d => d.status === 'implemented').length;
  const avgCoverage = designs.reduce((sum, d) => sum + d.coverage, 0) / designs.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading solution designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
              Solution Architecture Design
            </h1>
            <p className="text-gray-300">Solution blueprints and architecture documentation</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedStatus === status
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <DocumentTextIcon className="w-8 h-8 text-violet-400" />
              <span className="text-3xl font-bold text-white">{designs.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Designs</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{implementedCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Implemented</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{avgCoverage.toFixed(0)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Coverage</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CubeIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">
                {designs.reduce((sum, d) => sum + d.components, 0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Components</h3>
          </div>
        </div>

        {/* Solution Designs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDesigns.map((design) => (
            <div
              key={design.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <CpuChipIcon className="w-6 h-6 text-violet-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{design.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{design.project}</p>
                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(design.status)}`}>
                        {design.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getComplexityColor(design.complexity)}`}>
                        {design.complexity.toUpperCase().replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Architect</p>
                    <p className="text-sm font-semibold text-white">{design.architect}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Components</p>
                    <p className="text-sm font-semibold text-white">{design.components}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Design Coverage</span>
                    <span className="text-lg font-bold text-white">{design.coverage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        design.coverage >= 90 
                          ? 'bg-green-400' 
                          : design.coverage >= 70 
                          ? 'bg-blue-400' 
                          : 'bg-yellow-400'
                      }`}
                      style={{ width: `${design.coverage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Phase</p>
                    <p className="text-sm font-semibold text-white">{design.phase}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Last Updated</p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(design.lastUpdated).toLocaleDateString()}
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

export default SADesign;
