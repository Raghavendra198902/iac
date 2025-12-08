import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface BusinessCapability {
  id: string;
  name: string;
  category: string;
  maturity: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  applications: number;
  processes: number;
  status: 'active' | 'planned' | 'deprecated';
}

interface BusinessProcess {
  id: string;
  name: string;
  owner: string;
  capability: string;
  efficiency: number;
  automation: number;
  sla: string;
}

const EABusiness: React.FC = () => {
  const [capabilities, setCapabilities] = useState<BusinessCapability[]>([]);
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadBusinessArchitecture();
  }, []);

  const loadBusinessArchitecture = () => {
    const sampleCapabilities: BusinessCapability[] = [
      {
        id: '1',
        name: 'Customer Relationship Management',
        category: 'Customer Operations',
        maturity: 'optimizing',
        criticality: 'critical',
        applications: 5,
        processes: 12,
        status: 'active'
      },
      {
        id: '2',
        name: 'Financial Management',
        category: 'Finance',
        maturity: 'managed',
        criticality: 'critical',
        applications: 8,
        processes: 15,
        status: 'active'
      },
      {
        id: '3',
        name: 'Supply Chain Management',
        category: 'Operations',
        maturity: 'defined',
        criticality: 'high',
        applications: 6,
        processes: 10,
        status: 'active'
      },
      {
        id: '4',
        name: 'Human Resource Management',
        category: 'HR',
        maturity: 'developing',
        criticality: 'medium',
        applications: 4,
        processes: 8,
        status: 'active'
      },
      {
        id: '5',
        name: 'Product Development',
        category: 'Innovation',
        maturity: 'managed',
        criticality: 'critical',
        applications: 7,
        processes: 14,
        status: 'active'
      },
      {
        id: '6',
        name: 'Marketing & Sales',
        category: 'Customer Operations',
        maturity: 'optimizing',
        criticality: 'high',
        applications: 9,
        processes: 11,
        status: 'active'
      }
    ];

    const sampleProcesses: BusinessProcess[] = [
      {
        id: '1',
        name: 'Customer Onboarding',
        owner: 'Sales Team',
        capability: 'Customer Relationship Management',
        efficiency: 87,
        automation: 65,
        sla: '24 hours'
      },
      {
        id: '2',
        name: 'Invoice Processing',
        owner: 'Finance Team',
        capability: 'Financial Management',
        efficiency: 92,
        automation: 85,
        sla: '48 hours'
      },
      {
        id: '3',
        name: 'Order Fulfillment',
        owner: 'Operations Team',
        capability: 'Supply Chain Management',
        efficiency: 78,
        automation: 55,
        sla: '72 hours'
      },
      {
        id: '4',
        name: 'Employee Recruitment',
        owner: 'HR Team',
        capability: 'Human Resource Management',
        efficiency: 71,
        automation: 40,
        sla: '2 weeks'
      }
    ];

    setCapabilities(sampleCapabilities);
    setProcesses(sampleProcesses);
    setLoading(false);
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'optimizing':
        return 'text-green-400 bg-green-400/20';
      case 'managed':
        return 'text-blue-400 bg-blue-400/20';
      case 'defined':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'developing':
        return 'text-orange-400 bg-orange-400/20';
      case 'initial':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical':
        return 'text-red-400 bg-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'low':
        return 'text-green-400 bg-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const categories = ['all', ...Array.from(new Set(capabilities.map(c => c.category)))];
  const filteredCapabilities = selectedCategory === 'all' 
    ? capabilities 
    : capabilities.filter(c => c.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading business architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Business Architecture
            </h1>
            <p className="text-gray-300">Capabilities, processes, and organizational structure</p>
          </div>
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
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
              <BuildingOfficeIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{capabilities.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Capabilities</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{processes.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Processes</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ArrowTrendingUpIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">82%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Efficiency</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">61%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Automation</h3>
          </div>
        </div>

        {/* Business Capabilities */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Business Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCapabilities.map((capability) => (
              <div
                key={capability.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-400" />
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMaturityColor(capability.maturity)}`}>
                    {capability.maturity.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{capability.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{capability.category}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Applications</span>
                    <span className="text-white font-semibold">{capability.applications}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Processes</span>
                    <span className="text-white font-semibold">{capability.processes}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getCriticalityColor(capability.criticality)}`}>
                    {capability.criticality.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">{capability.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Processes */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Key Business Processes</h2>
          <div className="space-y-4">
            {processes.map((process) => (
              <div
                key={process.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{process.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {process.owner}
                      </span>
                      <span>•</span>
                      <span>{process.capability}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        SLA: {process.sla}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Efficiency</span>
                      <span className="text-lg font-bold text-white">{process.efficiency}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all"
                        style={{ width: `${process.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Automation</span>
                      <span className="text-lg font-bold text-white">{process.automation}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${process.automation}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default EABusiness;
