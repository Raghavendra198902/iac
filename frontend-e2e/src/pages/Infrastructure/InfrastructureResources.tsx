import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const InfrastructureResources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const resources = [
    { id: 1, name: 'prod-web-server-01', type: 'EC2', provider: 'AWS', region: 'us-east-1', status: 'running', cost: '$45.20' },
    { id: 2, name: 'dev-database-cluster', type: 'RDS', provider: 'AWS', region: 'us-west-2', status: 'running', cost: '$120.50' },
    { id: 3, name: 'storage-bucket-prod', type: 'S3', provider: 'AWS', region: 'us-east-1', status: 'active', cost: '$23.10' },
    { id: 4, name: 'api-function-auth', type: 'Lambda', provider: 'AWS', region: 'eu-west-1', status: 'running', cost: '$8.30' },
    { id: 5, name: 'azure-vm-analytics', type: 'VM', provider: 'Azure', region: 'eastus', status: 'running', cost: '$78.90' },
    { id: 6, name: 'gcp-sql-instance', type: 'CloudSQL', provider: 'GCP', region: 'us-central1', status: 'stopped', cost: '$0.00' },
    { id: 7, name: 'cdn-distribution', type: 'CloudFront', provider: 'AWS', region: 'global', status: 'active', cost: '$34.60' },
    { id: 8, name: 'kubernetes-cluster', type: 'EKS', provider: 'AWS', region: 'us-east-1', status: 'running', cost: '$210.00' }
  ];

  const filteredResources = resources.filter(resource => 
    (filterType === 'all' || resource.provider === filterType) &&
    (resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     resource.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        ></div>
      ))}

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Infrastructure Resources
          </h1>
          <p className="text-gray-300">Manage all your cloud resources across providers</p>
        </div>

        {/* Controls */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                <option value="all">All Providers</option>
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
                <option value="GCP">GCP</option>
              </select>
            </div>

            {/* Add Button */}
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Resource
            </button>
          </div>
        </div>

        {/* Resources Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Cost/Month</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{resource.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-xs font-semibold">
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{resource.provider}</td>
                    <td className="px-6 py-4 text-gray-300">{resource.region}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        resource.status === 'running' || resource.status === 'active' 
                          ? 'bg-green-400/20 text-green-400' 
                          : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">{resource.cost}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default InfrastructureResources;
