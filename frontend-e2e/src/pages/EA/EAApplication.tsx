import React, { useState, useEffect } from 'react';
import {
  CubeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ServerIcon,
  CodeBracketIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: string;
  name: string;
  category: string;
  status: 'production' | 'development' | 'deprecated' | 'sunset';
  health: 'healthy' | 'warning' | 'critical';
  version: string;
  users: number;
  uptime: number;
  technology: string;
  owner: string;
}

const EAApplication: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const sampleApps: Application[] = [
      {
        id: '1',
        name: 'IAC Dharma Platform',
        category: 'Infrastructure',
        status: 'production',
        health: 'healthy',
        version: 'v3.0',
        users: 1250,
        uptime: 99.98,
        technology: 'React + Node.js + Python',
        owner: 'DevOps Team'
      },
      {
        id: '2',
        name: 'Zero Trust Security Suite',
        category: 'Security',
        status: 'production',
        health: 'healthy',
        version: 'v2.5',
        users: 850,
        uptime: 99.95,
        technology: 'Python + FastAPI',
        owner: 'Security Team'
      },
      {
        id: '3',
        name: 'AIOps Engine',
        category: 'AI/ML',
        status: 'production',
        health: 'warning',
        version: 'v1.8',
        users: 450,
        uptime: 99.2,
        technology: 'Python + TensorFlow',
        owner: 'AI Team'
      },
      {
        id: '4',
        name: 'API Gateway',
        category: 'Integration',
        status: 'production',
        health: 'healthy',
        version: 'v3.0',
        users: 2100,
        uptime: 99.99,
        technology: 'Node.js + Express',
        owner: 'Backend Team'
      },
      {
        id: '5',
        name: 'CMDB Agent',
        category: 'Infrastructure',
        status: 'production',
        health: 'healthy',
        version: 'v2.1',
        users: 320,
        uptime: 99.85,
        technology: 'Python + FastAPI',
        owner: 'Infrastructure Team'
      },
      {
        id: '6',
        name: 'Legacy Monitoring System',
        category: 'Monitoring',
        status: 'deprecated',
        health: 'warning',
        version: 'v1.2',
        users: 85,
        uptime: 98.5,
        technology: 'Java + Spring',
        owner: 'Legacy Systems'
      },
      {
        id: '7',
        name: 'Multi-Cloud Optimizer',
        category: 'Cloud',
        status: 'development',
        health: 'healthy',
        version: 'v0.9-beta',
        users: 45,
        uptime: 97.8,
        technology: 'Go + Kubernetes',
        owner: 'Cloud Team'
      },
      {
        id: '8',
        name: 'Self-Healing Engine',
        category: 'Automation',
        status: 'production',
        health: 'healthy',
        version: 'v2.0',
        users: 680,
        uptime: 99.7,
        technology: 'Python + Redis',
        owner: 'SRE Team'
      }
    ];

    setApplications(sampleApps);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production':
        return 'text-green-400 bg-green-400/20';
      case 'development':
        return 'text-blue-400 bg-blue-400/20';
      case 'deprecated':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'sunset':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />;
      case 'critical':
        return <XCircleIcon className="w-6 h-6 text-red-400" />;
      default:
        return null;
    }
  };

  const categories = ['all', ...Array.from(new Set(applications.map(a => a.category)))];
  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(a => a.category === filter);

  const productionApps = applications.filter(a => a.status === 'production').length;
  const avgUptime = applications.reduce((sum, a) => sum + a.uptime, 0) / applications.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading application portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
              Application Architecture
            </h1>
            <p className="text-gray-300">Enterprise application portfolio and lifecycle management</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  filter === category
                    ? 'bg-purple-500 text-white'
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
              <CubeIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{applications.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Applications</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{productionApps}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">In Production</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{avgUptime.toFixed(2)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Uptime</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CodeBracketIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">
                {applications.reduce((sum, a) => sum + a.users, 0).toLocaleString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Users</h3>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getHealthIcon(app.health)}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{app.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{app.category}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500/20 text-gray-300">
                        {app.version}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Active Users</p>
                    <p className="text-lg font-bold text-white">{app.users.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Uptime</p>
                    <p className="text-lg font-bold text-white">{app.uptime}%</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-400">Technology Stack</p>
                  </div>
                  <p className="text-sm text-white">{app.technology}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ServerIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-400">Owner</p>
                  </div>
                  <p className="text-sm text-white">{app.owner}</p>
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

export default EAApplication;
