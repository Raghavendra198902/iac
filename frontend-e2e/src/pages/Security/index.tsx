import React, { useEffect, useState } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const SecurityDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    securityScore: 0,
    threats: [] as any[],
    compliance: [] as any[],
    recentEvents: [] as any[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/security/overview');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.log('No API data available, showing zeros');
        setData({
          securityScore: 0,
          threats: [
            { type: 'Failed Login Attempts', count: 0, severity: 'low', trend: 'stable' },
            { type: 'Suspicious API Calls', count: 0, severity: 'low', trend: 'stable' },
            { type: 'Unauthorized Access', count: 0, severity: 'low', trend: 'stable' },
            { type: 'DDoS Attempts', count: 0, severity: 'low', trend: 'stable' }
          ],
          compliance: [
            { framework: 'SOC 2', score: 0, status: 'unknown' },
            { framework: 'HIPAA', score: 0, status: 'unknown' },
            { framework: 'PCI-DSS', score: 0, status: 'unknown' },
            { framework: 'GDPR', score: 0, status: 'unknown' }
          ],
          recentEvents: [
            { event: 'No security events', severity: 'info', time: 'N/A' }
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const securityScore = data.securityScore;
  const threats = data.threats;
  const compliance = data.compliance;
  const recentEvents = data.recentEvents;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-400 border-t-transparent"></div>
          <p className="mt-4 text-gray-300">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 relative overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

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
        <div className="mb-8">
          <h1 className="text-5xl font-bold gradient-text animate-fade-in bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
            Security Dashboard
          </h1>
          <p className="text-gray-300">Monitor security threats and compliance status</p>
        </div>

        {/* Security Score */}
        <div className="glass-card hover-lift rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <ShieldCheckIcon className="w-8 h-8 mr-3 text-green-400" />
                Security Score
              </h2>
              <p className="text-gray-300">Your infrastructure security rating</p>
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
                    strokeDasharray={`${(securityScore / 100) * 339.292} 339.292`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{securityScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {threats.map((threat, index) => (
            <div key={index} className="glass-card hover-lift rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <ExclamationTriangleIcon className={`w-8 h-8 ${
                  threat.severity === 'critical' ? 'text-red-400' :
                  threat.severity === 'high' ? 'text-orange-400' :
                  threat.severity === 'medium' ? 'text-yellow-400' :
                  'text-green-400'
                }`} />
                <span className="text-sm text-gray-400">{threat.trend === 'down' ? '↓' : '→'}</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{threat.count}</h3>
              <p className="text-gray-300 text-sm">{threat.type}</p>
            </div>
          ))}
        </div>

        {/* Compliance Status */}
        <div className="glass-card hover-lift rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Compliance Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {compliance.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{item.framework}</h4>
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">{item.score}%</div>
                <div className="bg-gray-700/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="glass-card hover-lift rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Security Events</h2>
          <div className="space-y-4">
            {recentEvents.map((event, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    event.severity === 'high' ? 'bg-red-400' :
                    event.severity === 'medium' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}></div>
                  <span className="text-white">{event.event}</span>
                </div>
                <span className="text-gray-400 text-sm">{event.time}</span>
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

export default SecurityDashboard;
