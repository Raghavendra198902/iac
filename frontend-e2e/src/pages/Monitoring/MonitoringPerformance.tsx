import React, { useEffect, useState } from 'react';
import { CpuChipIcon, CircleStackIcon, SignalIcon, ServerIcon } from '@heroicons/react/24/outline';

const MonitoringPerformance: React.FC = () => {
  const [performanceData, setPerformanceData] = useState({
    cpu: { current: 0, avg: 0, peak: 0, trend: 'stable' },
    memory: { current: 0, avg: 0, peak: 0, trend: 'stable' },
    network: { current: 0, avg: 0, peak: 0, trend: 'stable' },
    disk: { current: 0, avg: 0, peak: 0, trend: 'stable' }
  });

  const [servers, setServers] = useState([
    { name: 'web-server-01', cpu: 0, memory: 0, network: 0, disk: 0, status: 'healthy' },
    { name: 'web-server-02', cpu: 0, memory: 0, network: 0, disk: 0, status: 'healthy' },
    { name: 'api-server-01', cpu: 0, memory: 0, network: 0, disk: 0, status: 'healthy' },
    { name: 'db-server-01', cpu: 0, memory: 0, network: 0, disk: 0, status: 'healthy' },
    { name: 'cache-server-01', cpu: 0, memory: 0, network: 0, disk: 0, status: 'healthy' }
  ]);

  useEffect(() => {
    const updateData = () => {
      // Generate live performance data
      const cpuCurrent = Math.floor(Math.random() * 40) + 50;
      const memCurrent = Math.floor(Math.random() * 30) + 60;
      const netCurrent = Math.floor(Math.random() * 50) + 30;
      const diskCurrent = Math.floor(Math.random() * 30) + 15;

      setPerformanceData({
        cpu: { 
          current: cpuCurrent, 
          avg: Math.floor(Math.random() * 20) + 55, 
          peak: Math.floor(Math.random() * 15) + 80,
          trend: cpuCurrent > 70 ? 'up' : cpuCurrent < 55 ? 'down' : 'stable'
        },
        memory: { 
          current: memCurrent, 
          avg: Math.floor(Math.random() * 20) + 60, 
          peak: Math.floor(Math.random() * 10) + 85,
          trend: memCurrent > 75 ? 'up' : memCurrent < 60 ? 'down' : 'stable'
        },
        network: { 
          current: netCurrent, 
          avg: Math.floor(Math.random() * 20) + 35, 
          peak: Math.floor(Math.random() * 20) + 70,
          trend: 'stable'
        },
        disk: { 
          current: diskCurrent, 
          avg: Math.floor(Math.random() * 15) + 20, 
          peak: Math.floor(Math.random() * 20) + 55,
          trend: diskCurrent > 35 ? 'up' : 'down'
        }
      });

      // Update server metrics
      setServers([
        { 
          name: 'web-server-01', 
          cpu: Math.floor(Math.random() * 30) + 55, 
          memory: Math.floor(Math.random() * 20) + 65, 
          network: Math.floor(Math.random() * 30) + 40, 
          disk: Math.floor(Math.random() * 20) + 25, 
          status: 'healthy' 
        },
        { 
          name: 'web-server-02', 
          cpu: Math.floor(Math.random() * 30) + 60, 
          memory: Math.floor(Math.random() * 20) + 60, 
          network: Math.floor(Math.random() * 30) + 45, 
          disk: Math.floor(Math.random() * 20) + 20, 
          status: 'healthy' 
        },
        { 
          name: 'api-server-01', 
          cpu: Math.floor(Math.random() * 30) + 50, 
          memory: Math.floor(Math.random() * 20) + 70, 
          network: Math.floor(Math.random() * 30) + 30, 
          disk: Math.floor(Math.random() * 20) + 18, 
          status: 'healthy' 
        },
        { 
          name: 'db-server-01', 
          cpu: Math.floor(Math.random() * 20) + 75, 
          memory: Math.floor(Math.random() * 15) + 80, 
          network: Math.floor(Math.random() * 20) + 35, 
          disk: Math.floor(Math.random() * 30) + 45, 
          status: Math.random() > 0.7 ? 'warning' : 'healthy'
        },
        { 
          name: 'cache-server-01', 
          cpu: Math.floor(Math.random() * 25) + 40, 
          memory: Math.floor(Math.random() * 20) + 55, 
          network: Math.floor(Math.random() * 20) + 30, 
          disk: Math.floor(Math.random() * 15) + 15, 
          status: 'healthy' 
        }
      ]);
    };

    // Initial update
    updateData();

    // Auto-refresh every 0.1 seconds
    const interval = setInterval(updateData, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                Performance Analytics
              </h1>
              <p className="text-gray-300">Detailed performance metrics and trends</p>
            </div>
            <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-semibold">LIVE</span>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CpuChipIcon className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-gray-300 text-sm mb-2">CPU Usage</h3>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-4xl font-bold text-white">{performanceData.cpu.current}%</span>
              <span className={`text-sm mb-1 ${performanceData.cpu.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                {performanceData.cpu.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between"><span>Avg:</span><span>{performanceData.cpu.avg}%</span></div>
              <div className="flex justify-between"><span>Peak:</span><span>{performanceData.cpu.peak}%</span></div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CircleStackIcon className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-gray-300 text-sm mb-2">Memory Usage</h3>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-4xl font-bold text-white">{performanceData.memory.current}%</span>
              <span className={`text-sm mb-1 ${performanceData.memory.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                {performanceData.memory.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between"><span>Avg:</span><span>{performanceData.memory.avg}%</span></div>
              <div className="flex justify-between"><span>Peak:</span><span>{performanceData.memory.peak}%</span></div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <SignalIcon className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-gray-300 text-sm mb-2">Network Traffic</h3>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-4xl font-bold text-white">{performanceData.network.current}%</span>
              <span className="text-sm mb-1 text-gray-400">→</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between"><span>Avg:</span><span>{performanceData.network.avg}%</span></div>
              <div className="flex justify-between"><span>Peak:</span><span>{performanceData.network.peak}%</span></div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <ServerIcon className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-gray-300 text-sm mb-2">Disk I/O</h3>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-4xl font-bold text-white">{performanceData.disk.current}%</span>
              <span className={`text-sm mb-1 ${performanceData.disk.trend === 'down' ? 'text-green-400' : 'text-red-400'}`}>
                {performanceData.disk.trend === 'down' ? '↓' : '↑'}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between"><span>Avg:</span><span>{performanceData.disk.avg}%</span></div>
              <div className="flex justify-between"><span>Peak:</span><span>{performanceData.disk.peak}%</span></div>
            </div>
          </div>
        </div>

        {/* Server Performance Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">Server Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Server</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">CPU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Memory</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Network</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Disk</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {servers.map((server, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{server.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-2 w-20">
                          <div 
                            className={`h-2 rounded-full ${server.cpu > 75 ? 'bg-red-400' : 'bg-blue-400'}`}
                            style={{ width: `${server.cpu}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm w-10">{server.cpu}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-2 w-20">
                          <div 
                            className={`h-2 rounded-full ${server.memory > 80 ? 'bg-red-400' : 'bg-purple-400'}`}
                            style={{ width: `${server.memory}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm w-10">{server.memory}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-2 w-20">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: `${server.network}%` }}></div>
                        </div>
                        <span className="text-white text-sm w-10">{server.network}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-2 w-20">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${server.disk}%` }}></div>
                        </div>
                        <span className="text-white text-sm w-10">{server.disk}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        server.status === 'healthy' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {server.status}
                      </span>
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

export default MonitoringPerformance;
