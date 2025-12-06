import React, { useState } from 'react';
import { BellAlertIcon, FunnelIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MonitoringAlerts: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState('all');

  const alerts = [
    {
      id: 1,
      title: 'High CPU Usage on web-server-02',
      description: 'CPU usage has exceeded 85% for 10 minutes',
      severity: 'critical',
      time: '2 minutes ago',
      service: 'web-server-02',
      acknowledged: false
    },
    {
      id: 2,
      title: 'Database Connection Pool Exhausted',
      description: 'Connection pool reached maximum capacity',
      severity: 'critical',
      time: '5 minutes ago',
      service: 'db-primary',
      acknowledged: false
    },
    {
      id: 3,
      title: 'Memory Usage Warning',
      description: 'Memory usage at 78% on api-server-01',
      severity: 'warning',
      time: '15 minutes ago',
      service: 'api-server-01',
      acknowledged: true
    },
    {
      id: 4,
      title: 'Slow API Response Time',
      description: 'Average response time increased to 450ms',
      severity: 'warning',
      time: '23 minutes ago',
      service: 'api-gateway',
      acknowledged: false
    },
    {
      id: 5,
      title: 'Disk Space Low',
      description: 'Disk usage at 82% on storage-server',
      severity: 'warning',
      time: '1 hour ago',
      service: 'storage-server',
      acknowledged: true
    },
    {
      id: 6,
      title: 'SSL Certificate Expiring Soon',
      description: 'Certificate expires in 14 days',
      severity: 'info',
      time: '2 hours ago',
      service: 'cdn',
      acknowledged: false
    },
    {
      id: 7,
      title: 'Backup Completed Successfully',
      description: 'Daily backup finished without errors',
      severity: 'info',
      time: '3 hours ago',
      service: 'backup-service',
      acknowledged: true
    },
    {
      id: 8,
      title: 'CDN Cache Miss Rate High',
      description: 'Cache miss rate at 35%, above threshold',
      severity: 'warning',
      time: '4 hours ago',
      service: 'cdn',
      acknowledged: false
    }
  ];

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filterSeverity);

  const alertCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  };

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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Alert Management
          </h1>
          <p className="text-gray-300">Monitor and manage system alerts</p>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Critical Alerts</p>
                <p className="text-4xl font-bold text-red-400">{alertCounts.critical}</p>
              </div>
              <BellAlertIcon className="w-12 h-12 text-red-400" />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Warning Alerts</p>
                <p className="text-4xl font-bold text-yellow-400">{alertCounts.warning}</p>
              </div>
              <BellAlertIcon className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Info Alerts</p>
                <p className="text-4xl font-bold text-blue-400">{alertCounts.info}</p>
              </div>
              <BellAlertIcon className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="w-6 h-6 text-gray-300" />
            <div className="flex space-x-2">
              {['all', 'critical', 'warning', 'info'].map((severity) => (
                <button
                  key={severity}
                  onClick={() => setFilterSeverity(severity)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filterSeverity === severity
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="divide-y divide-white/10">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-6 hover:bg-white/5 transition-all ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        alert.severity === 'critical' ? 'bg-red-400/20 text-red-400' :
                        alert.severity === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-blue-400/20 text-blue-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-gray-400 text-sm">{alert.time}</span>
                      {alert.acknowledged && (
                        <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs font-semibold">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{alert.title}</h3>
                    <p className="text-gray-300 mb-3">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">Service:</span>
                      <span className="text-white font-semibold">{alert.service}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!alert.acknowledged && (
                      <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all">
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
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

export default MonitoringAlerts;
