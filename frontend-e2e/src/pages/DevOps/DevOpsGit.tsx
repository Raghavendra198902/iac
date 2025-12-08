import React, { useState, useEffect } from 'react';
import {
  CodeBracketIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface Repository {
  id: string;
  name: string;
  branch: string;
  commits: number;
  contributors: number;
  lastCommit: {
    message: string;
    author: string;
    date: string;
    hash: string;
  };
  status: 'clean' | 'modified' | 'conflict';
}

interface Commit {
  hash: string;
  author: string;
  message: string;
  date: string;
  files: number;
}

const DevOpsGit: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadCommits(selectedRepo.id);
    }
  }, [selectedRepo]);

  const loadRepositories = () => {
    const sampleRepos: Repository[] = [
      {
        id: '1',
        name: 'iac-platform-frontend',
        branch: 'v3.0-development',
        commits: 487,
        contributors: 8,
        lastCommit: {
          message: 'fix(e2e): add Cost index route that redirects to Analytics',
          author: 'DevOps Team',
          date: new Date(Date.now() - 300000).toISOString(),
          hash: '27cba53'
        },
        status: 'clean'
      },
      {
        id: '2',
        name: 'iac-api-gateway',
        branch: 'main',
        commits: 342,
        contributors: 6,
        lastCommit: {
          message: 'feat(metrics): add Prometheus metrics to API Gateway v3',
          author: 'Backend Team',
          date: new Date(Date.now() - 3600000).toISOString(),
          hash: '1e857ac'
        },
        status: 'clean'
      },
      {
        id: '3',
        name: 'zero-trust-security',
        branch: 'develop',
        commits: 256,
        contributors: 4,
        lastCommit: {
          message: 'feat(security): implement device compliance scoring',
          author: 'Security Team',
          date: new Date(Date.now() - 7200000).toISOString(),
          hash: 'f3a8b21'
        },
        status: 'modified'
      },
      {
        id: '4',
        name: 'aiops-engine',
        branch: 'main',
        commits: 189,
        contributors: 5,
        lastCommit: {
          message: 'feat(ml): add predictive anomaly detection models',
          author: 'AI Team',
          date: new Date(Date.now() - 10800000).toISOString(),
          hash: 'd4c9e72'
        },
        status: 'clean'
      }
    ];

    setRepositories(sampleRepos);
    setSelectedRepo(sampleRepos[0]);
    setLoading(false);
  };

  const loadCommits = (repoId: string) => {
    const sampleCommits: Commit[] = [
      {
        hash: '27cba53',
        author: 'DevOps Team',
        message: 'fix(e2e): add Cost index route that redirects to Analytics',
        date: new Date(Date.now() - 300000).toISOString(),
        files: 2
      },
      {
        hash: '81ef119',
        author: 'DevOps Team',
        message: 'feat(e2e): replace placeholder pages with live functional pages',
        date: new Date(Date.now() - 900000).toISOString(),
        files: 4
      },
      {
        hash: '3510d71',
        author: 'DevOps Team',
        message: 'feat(e2e): add comprehensive Cost management dashboards',
        date: new Date(Date.now() - 1800000).toISOString(),
        files: 3
      },
      {
        hash: 'ea9b278',
        author: 'Security Team',
        message: 'feat(e2e): add Zero Trust Access Control dashboard',
        date: new Date(Date.now() - 3600000).toISOString(),
        files: 1
      },
      {
        hash: 'b579bae',
        author: 'DevOps Team',
        message: 'fix(e2e): add nginx proxy for Zero Trust API endpoints',
        date: new Date(Date.now() - 5400000).toISOString(),
        files: 1
      }
    ];

    setCommits(sampleCommits);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean':
        return 'text-green-400 bg-green-400/20';
      case 'modified':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'conflict':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'modified':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      case 'conflict':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Git Repository Management
          </h1>
          <p className="text-gray-300">Version control and repository monitoring</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <FolderIcon className="w-8 h-8 text-indigo-400" />
              <span className="text-3xl font-bold text-white">{repositories.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Repositories</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CodeBracketIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">
                {repositories.reduce((sum, r) => sum + r.commits, 0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Commits</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <UserIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">
                {Math.max(...repositories.map(r => r.contributors))}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Contributors</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">
                {repositories.filter(r => r.status === 'clean').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Clean Repos</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Repositories List */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Repositories</h2>
            <div className="space-y-3">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedRepo?.id === repo.id
                      ? 'bg-white/20 border-2 border-indigo-400'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(repo.status)}
                      <h3 className="font-semibold text-white">{repo.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(repo.status)}`}>
                      {repo.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Branch: {repo.branch}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>{repo.commits} commits</span>
                    <span>{repo.contributors} contributors</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commit History */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            {selectedRepo && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Recent Commits - {selectedRepo.name}
                  </h2>
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                      <ArrowUpTrayIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {commits.map((commit) => (
                    <div key={commit.hash} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            {commit.author.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{commit.message}</h4>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                            <span>{commit.author}</span>
                            <span>•</span>
                            <span>{new Date(commit.date).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-indigo-400 font-mono">{commit.hash}</span>
                            <span>•</span>
                            <span>{commit.files} files changed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
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

export default DevOpsGit;
