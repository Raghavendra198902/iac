import React from 'react';
import { ChartBarIcon, CubeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const CMDBAssets: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 relative overflow-hidden">
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            Asset Inventory
          </h1>
          <p className="text-gray-300">Comprehensive management and analytics</p>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <ChartBarIcon className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-gray-300">View detailed analytics and insights</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CubeIcon className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Resources</h3>
            <p className="text-gray-300">Manage your resources efficiently</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Cog6ToothIcon className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Configuration</h3>
            <p className="text-gray-300">Configure system settings</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
          <p className="text-gray-300 mb-4">
            This is the Asset Inventory page. Add your content and functionality here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Feature 1</h4>
              <p className="text-gray-400 text-sm">Description of feature</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Feature 2</h4>
              <p className="text-gray-400 text-sm">Description of feature</p>
            </div>
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

export default CMDBAssets;
