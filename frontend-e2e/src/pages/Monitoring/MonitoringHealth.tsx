import React from 'react';
import { HeartIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MonitoringHealth: React.FC = () => {
  const healthScore = 94;

  const services = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.99%', lastCheck: '1 min ago', responseTime: '45ms' },
    { name: 'Auth Service', status: 'healthy', uptime: '100%', lastCheck: '1 min ago', responseTime: '23ms' },
    { name: 'Database Primary', status: 'healthy', uptime: '99.98%', lastCheck: '1 min ago', responseTime: '12ms' },
    { name: 'Database Replica', status: 'degraded', uptime: '99.85%', lastCheck: '2 mins ago', responseTime: '28ms' },
    { name: 'Cache Layer', status: 'healthy', uptime: '99.95%', lastCheck: '1 min ago', responseTime: '8ms' },
    { name: 'Message Queue', status: 'healthy', uptime: '99.92%', lastCheck: '1 min ago', responseTime: '15ms' },
    { name: 'Storage Service', status: 'healthy', uptime: '99.99%', lastCheck: '1 min ago', responseTime: '35ms' },
    { name: 'CDN', status: 'down', uptime: '98.50%', lastCheck: '5 mins ago', responseTime: 'N/A' }
  ];

  const healthChecks = [
    { category: 'Infrastructure', passed: 15, failed: 1, total: 16 },
    { category: 'Application', passed: 22, failed: 0, total: 22 },
    { category: 'Database', passed: 8, failed: 1, total: 9 },
    { category: 'Security', passed: 12, failed: 0, total: 12 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse top-0 left-1/4"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-1/4 animation-delay-2000"></div>
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            System Health Checks
          </h1>
          <p className="text-gray-300">Monitor service health and system status</p>
        </div>

        {/* Overall Health Score */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <HeartIcon className="w-8 h-8 mr-3 text-pink-400" />
                Overall Health Score
              </h2>
              <p className="text-gray-300">System is operating normally</p>
            </div>
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="54" 
                    stroke="#10b981" 
                    strokeWidth="12" 
                    fill="none"
                    strokeDasharray={`${(healthScore / 100) * 339.292} 339.292`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{healthScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Check Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthChecks.map((check, index) => (
            <div key={index} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <h3 className="text-lg font-bold text-white mb-4">{check.category}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Passed</span>
                  <span className="text-green-400 font-semibold">{check.passed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Failed</span>
                  <span className="text-red-400 font-semibold">{check.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Total</span>
                  <span className="text-white font-semibold">{check.total}</span>
                </div>
              </div>
              <div className="mt-4 bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                  style={{ width: `${(check.passed / check.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Status Grid */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {service.status === 'healthy' && <CheckCircleIcon className="w-6 h-6 text-green-400" />}
                    {service.status === 'degraded' && <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />}
                    {service.status === 'down' && <XCircleIcon className="w-6 h-6 text-red-400" />}
                    <h4 className="text-white font-semibold">{service.name}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.status === 'healthy' ? 'bg-green-400/20 text-green-400' :
                    service.status === 'degraded' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-red-400/20 text-red-400'
                  }`}>
                    {service.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Uptime</p>
                    <p className="text-white font-semibold">{service.uptime}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Response</p>
                    <p className="text-white font-semibold">{service.responseTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Check</p>
                    <p className="text-white font-semibold">{service.lastCheck}</p>
                  </div>
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

export default MonitoringHealth;
