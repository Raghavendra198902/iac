import React from 'react';
import { ChartBarIcon, CpuChipIcon, CircleStackIcon, SignalIcon } from '@heroicons/react/24/outline';

const MonitoringDashboard: React.FC = () => {
  const metrics = [
    { name: 'CPU Usage', value: '68%', status: 'normal', icon: CpuChipIcon, color: 'blue' },
    { name: 'Memory', value: '72%', status: 'warning', icon: CircleStackIcon, color: 'yellow' },
    { name: 'Network', value: '45%', status: 'normal', icon: SignalIcon, color: 'green' },
    { name: 'Disk I/O', value: '23%', status: 'normal', icon: ChartBarIcon, color: 'purple' }
  ];

  const chartData = [
    { time: '00:00', cpu: 45, memory: 62, network: 30 },
    { time: '04:00', cpu: 52, memory: 68, network: 35 },
    { time: '08:00', cpu: 68, memory: 72, network: 45 },
    { time: '12:00', cpu: 75, memory: 78, network: 52 },
    { time: '16:00', cpu: 82, memory: 85, network: 60 },
    { time: '20:00', cpu: 70, memory: 75, network: 48 }
  ];

  const services = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.99%', responseTime: '45ms' },
    { name: 'Database', status: 'healthy', uptime: '99.98%', responseTime: '12ms' },
    { name: 'Cache Layer', status: 'degraded', uptime: '99.85%', responseTime: '8ms' },
    { name: 'Auth Service', status: 'healthy', uptime: '100%', responseTime: '23ms' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Monitoring Dashboard
          </h1>
          <p className="text-gray-300">Real-time system metrics and performance monitoring</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 text-${metric.color}-400`} />
                  <span className={`text-sm font-semibold ${
                    metric.status === 'normal' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {metric.status}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-gray-300 text-sm">{metric.name}</p>
                <div className="mt-4 bg-gray-700/50 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 h-2 rounded-full`}
                    style={{ width: metric.value }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Metrics Chart */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <ChartBarIcon className="w-7 h-7 mr-3 text-cyan-400" />
            Real-time Metrics
          </h2>
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={200 - y * 2}
                  x2="800"
                  y2={200 - y * 2}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              ))}
              
              {/* CPU Line */}
              <polyline
                points={chartData.map((d, i) => `${i * 160},${200 - d.cpu * 2}`).join(' ')}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="3"
              />
              
              {/* Memory Line */}
              <polyline
                points={chartData.map((d, i) => `${i * 160},${200 - d.memory * 2}`).join(' ')}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="3"
              />
              
              {/* Network Line */}
              <polyline
                points={chartData.map((d, i) => `${i * 160},${200 - d.network * 2}`).join(' ')}
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
              <span className="text-gray-300 text-sm">CPU</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-400 rounded mr-2"></div>
              <span className="text-gray-300 text-sm">Memory</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
              <span className="text-gray-300 text-sm">Network</span>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{service.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.status === 'healthy' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
                  }`}>
                    {service.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Uptime</p>
                    <p className="text-white font-semibold">{service.uptime}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Response Time</p>
                    <p className="text-white font-semibold">{service.responseTime}</p>
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

export default MonitoringDashboard;
