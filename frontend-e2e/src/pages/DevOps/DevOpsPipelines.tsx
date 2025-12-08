import React, { useState, useEffect } from 'react';
import {
  RocketLaunchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

interface Pipeline {
  id: string;
  name: string;
  repository: string;
  branch: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration: string;
  lastRun: string;
  stages: Stage[];
  triggeredBy: string;
}

interface Stage {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending' | 'skipped';
  duration?: string;
}

const DevOpsPipelines: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  useEffect(() => {
    loadPipelines();
    const interval = setInterval(loadPipelines, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadPipelines = () => {
    const samplePipelines: Pipeline[] = [
      {
        id: '1',
        name: 'Frontend Build & Deploy',
        repository: 'iac-platform-frontend',
        branch: 'main',
        status: 'success',
        duration: '4m 32s',
        lastRun: new Date(Date.now() - 1800000).toISOString(),
        triggeredBy: 'webhook',
        stages: [
          { id: '1', name: 'Checkout', status: 'success', duration: '12s' },
          { id: '2', name: 'Install Dependencies', status: 'success', duration: '45s' },
          { id: '3', name: 'Build', status: 'success', duration: '2m 15s' },
          { id: '4', name: 'Test', status: 'success', duration: '38s' },
          { id: '5', name: 'Deploy', status: 'success', duration: '42s' }
        ]
      },
      {
        id: '2',
        name: 'Backend API Build',
        repository: 'iac-api-gateway',
        branch: 'v3.0-development',
        status: 'running',
        duration: '2m 15s',
        lastRun: new Date(Date.now() - 135000).toISOString(),
        triggeredBy: 'manual',
        stages: [
          { id: '1', name: 'Checkout', status: 'success', duration: '8s' },
          { id: '2', name: 'Install Dependencies', status: 'success', duration: '32s' },
          { id: '3', name: 'Build', status: 'running' },
          { id: '4', name: 'Test', status: 'pending' },
          { id: '5', name: 'Docker Build', status: 'pending' },
          { id: '6', name: 'Deploy', status: 'pending' }
        ]
      },
      {
        id: '3',
        name: 'Zero Trust Security',
        repository: 'zero-trust-security',
        branch: 'main',
        status: 'failed',
        duration: '1m 48s',
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        triggeredBy: 'schedule',
        stages: [
          { id: '1', name: 'Checkout', status: 'success', duration: '10s' },
          { id: '2', name: 'Install Dependencies', status: 'success', duration: '28s' },
          { id: '3', name: 'Lint', status: 'success', duration: '15s' },
          { id: '4', name: 'Test', status: 'failed', duration: '55s' },
          { id: '5', name: 'Build', status: 'skipped' },
          { id: '6', name: 'Deploy', status: 'skipped' }
        ]
      },
      {
        id: '4',
        name: 'ML Models Training',
        repository: 'aiops-engine',
        branch: 'develop',
        status: 'success',
        duration: '8m 42s',
        lastRun: new Date(Date.now() - 7200000).toISOString(),
        triggeredBy: 'webhook',
        stages: [
          { id: '1', name: 'Checkout', status: 'success', duration: '15s' },
          { id: '2', name: 'Setup Environment', status: 'success', duration: '1m 20s' },
          { id: '3', name: 'Train Models', status: 'success', duration: '6m 15s' },
          { id: '4', name: 'Validate', status: 'success', duration: '42s' },
          { id: '5', name: 'Deploy Models', status: 'success', duration: '10s' }
        ]
      }
    ];

    setPipelines(samplePipelines);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'running':
        return <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400/20';
      case 'failed':
        return 'text-red-400 bg-red-400/20';
      case 'running':
        return 'text-blue-400 bg-blue-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'skipped':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
            CI/CD Pipelines
          </h1>
          <p className="text-gray-300">Continuous Integration and Deployment pipelines</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <RocketLaunchIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{pipelines.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Pipelines</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">
                {pipelines.filter(p => p.status === 'success').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Successful</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ArrowPathIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">
                {pipelines.filter(p => p.status === 'running').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Running</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <XCircleIcon className="w-8 h-8 text-red-400" />
              <span className="text-3xl font-bold text-white">
                {pipelines.filter(p => p.status === 'failed').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Failed</h3>
          </div>
        </div>

        {/* Pipelines List */}
        <div className="space-y-4">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => setSelectedPipeline(selectedPipeline?.id === pipeline.id ? null : pipeline)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(pipeline.status)}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{pipeline.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <CodeBracketIcon className="w-4 h-4" />
                        {pipeline.repository}
                      </span>
                      <span>Branch: {pipeline.branch}</span>
                      <span>Duration: {pipeline.duration}</span>
                      <span>Last run: {new Date(pipeline.lastRun).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status.toUpperCase()}
                  </span>
                  <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    <PlayIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stages - shown when selected */}
              {selectedPipeline?.id === pipeline.id && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <h4 className="text-lg font-semibold text-white mb-3">Pipeline Stages</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pipeline.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(stage.status)}
                            <h5 className="font-semibold text-white">{stage.name}</h5>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(stage.status)}`}>
                            {stage.status}
                          </span>
                        </div>
                        {stage.duration && (
                          <p className="text-sm text-gray-400">Duration: {stage.duration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default DevOpsPipelines;
