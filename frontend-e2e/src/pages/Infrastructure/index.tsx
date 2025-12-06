import React from 'react';
import { ServerIcon, CloudIcon, RocketLaunchIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const InfrastructureDashboard: React.FC = () => {
  const resources = [
    { name: 'EC2 Instances', count: 45, status: 'healthy', change: '+5' },
    { name: 'S3 Buckets', count: 23, status: 'healthy', change: '+2' },
    { name: 'RDS Databases', count: 12, status: 'warning', change: '0' },
    { name: 'Lambda Functions', count: 78, status: 'healthy', change: '+12' }
  ];

  const cloudStatus = [
    { provider: 'AWS', regions: 5, resources: 234, health: 98 },
    { provider: 'Azure', regions: 3, resources: 156, health: 95 },
    { provider: 'GCP', regions: 2, resources: 89, health: 99 }
  ];

  const recentDeployments = [
    { id: 1, name: 'Web App Stack', status: 'success', time: '5 mins ago', region: 'us-east-1' },
    { id: 2, name: 'Database Cluster', status: 'in-progress', time: '12 mins ago', region: 'eu-west-1' },
    { id: 3, name: 'API Gateway', status: 'success', time: '1 hour ago', region: 'ap-south-1' },
    { id: 4, name: 'CDN Setup', status: 'failed', time: '2 hours ago', region: 'us-west-2' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
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
            Infrastructure Dashboard
          </h1>
          <p className="text-gray-300">Monitor and manage your multi-cloud infrastructure</p>
        </div>

        {/* Resource Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <ServerIcon className="w-8 h-8 text-blue-400" />
                <span className={`text-sm font-semibold ${resource.change.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                  {resource.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{resource.count}</h3>
              <p className="text-gray-300 text-sm">{resource.name}</p>
              <div className="mt-4 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${resource.status === 'healthy' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-gray-400 capitalize">{resource.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Multi-Cloud Status */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CloudIcon className="w-7 h-7 mr-3 text-purple-400" />
            Multi-Cloud Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cloudStatus.map((cloud, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{cloud.provider}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{cloud.health}%</div>
                    <div className="text-xs text-gray-400">Health Score</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Regions</span>
                    <span className="text-white font-semibold">{cloud.regions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Resources</span>
                    <span className="text-white font-semibold">{cloud.resources}</span>
                  </div>
                </div>
                <div className="mt-4 bg-gray-700/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{ width: `${cloud.health}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <RocketLaunchIcon className="w-7 h-7 mr-3 text-pink-400" />
            Recent Deployments
          </h2>
          <div className="space-y-4">
            {recentDeployments.map((deployment) => (
              <div key={deployment.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    deployment.status === 'success' ? 'bg-green-400' :
                    deployment.status === 'in-progress' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-400'
                  }`}></div>
                  <div>
                    <h4 className="text-white font-semibold">{deployment.name}</h4>
                    <p className="text-gray-400 text-sm">{deployment.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    deployment.status === 'success' ? 'bg-green-400/20 text-green-400' :
                    deployment.status === 'in-progress' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-red-400/20 text-red-400'
                  }`}>
                    {deployment.status}
                  </span>
                  <p className="text-gray-400 text-xs mt-1">{deployment.time}</p>
                </div>
              </div>
            ))}
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

export default InfrastructureDashboard;
