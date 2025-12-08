import React, { useState, useEffect } from 'react';
import {
  RocketLaunchIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Release {
  id: string;
  version: string;
  name: string;
  status: 'deployed' | 'staging' | 'planned' | 'rollback';
  deployedAt: string;
  features: number;
  bugFixes: number;
  environment: string;
  health: number;
}

const SERelease: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sampleReleases: Release[] = [
      {
        id: '1',
        version: 'v3.0.8',
        name: 'Solution Architecture Pages',
        status: 'deployed',
        deployedAt: '2024-12-08 14:30',
        features: 4,
        bugFixes: 0,
        environment: 'Production',
        health: 98
      },
      {
        id: '2',
        version: 'v3.0.7',
        name: 'Enterprise Architecture Suite',
        status: 'deployed',
        deployedAt: '2024-12-07 16:45',
        features: 7,
        bugFixes: 2,
        environment: 'Production',
        health: 99
      },
      {
        id: '3',
        version: 'v3.0.6',
        name: 'DevOps Management Pages',
        status: 'deployed',
        deployedAt: '2024-12-06 11:20',
        features: 4,
        bugFixes: 1,
        environment: 'Production',
        health: 97
      },
      {
        id: '4',
        version: 'v3.1.0-rc1',
        name: 'Technical Architecture Module',
        status: 'staging',
        deployedAt: '2024-12-08 15:00',
        features: 11,
        bugFixes: 3,
        environment: 'Staging',
        health: 95
      },
      {
        id: '5',
        version: 'v3.2.0',
        name: 'Advanced Analytics Dashboard',
        status: 'planned',
        deployedAt: '2024-12-15',
        features: 8,
        bugFixes: 0,
        environment: 'Development',
        health: 0
      }
    ];
    setReleases(sampleReleases);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-400 bg-green-400/20';
      case 'staging': return 'text-blue-400 bg-blue-400/20';
      case 'planned': return 'text-gray-400 bg-gray-400/20';
      case 'rollback': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <ArrowPathIcon className="w-16 h-16 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Release Management
        </h1>
        <p className="text-gray-300 mb-8">Version control, deployments, and release tracking</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <RocketLaunchIcon className="w-8 h-8 text-orange-400 mb-2" />
            <span className="text-3xl font-bold text-white">{releases.length}</span>
            <h3 className="text-lg font-semibold text-white">Total Releases</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-3xl font-bold text-white">
              {releases.filter(r => r.status === 'deployed').length}
            </span>
            <h3 className="text-lg font-semibold text-white">Deployed</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <TagIcon className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-3xl font-bold text-white">v3.0.8</span>
            <h3 className="text-lg font-semibold text-white">Latest Version</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <DocumentTextIcon className="w-8 h-8 text-pink-400 mb-2" />
            <span className="text-3xl font-bold text-white">
              {releases.reduce((sum, r) => sum + r.features, 0)}
            </span>
            <h3 className="text-lg font-semibold text-white">Total Features</h3>
          </div>
        </div>

        <div className="space-y-4">
          {releases.map((release) => (
            <div
              key={release.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <RocketLaunchIcon className="w-6 h-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{release.version} - {release.name}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(release.status)}`}>
                        {release.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-white/10 text-gray-300">
                        {release.environment}
                      </span>
                    </div>
                  </div>
                </div>
                {release.status === 'deployed' && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Health</p>
                    <p className="text-2xl font-bold text-green-400">{release.health}%</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Features</p>
                  <p className="text-lg font-semibold text-white">{release.features}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Bug Fixes</p>
                  <p className="text-lg font-semibold text-white">{release.bugFixes}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">
                    {release.status === 'planned' ? 'Scheduled' : 'Deployed'}
                  </p>
                  <p className="text-lg font-semibold text-white">{release.deployedAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.animation-delay-2000 { animation-delay: 2s; }`}</style>
    </div>
  );
};

export default SERelease;
