import React, { useState } from 'react';
import {
  ServerIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
  CircleStackIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed';
  size: string;
  duration: string;
  timestamp: string;
  location: string;
}

const AdminBackup: React.FC = () => {
  const [backups] = useState<Backup[]>([
    {
      id: '1',
      name: 'Full System Backup',
      type: 'full',
      status: 'completed',
      size: '24.5 GB',
      duration: '45 minutes',
      timestamp: '2024-12-08 02:00:00',
      location: 's3://backups/full-2024-12-08'
    },
    {
      id: '2',
      name: 'Database Backup',
      type: 'incremental',
      status: 'completed',
      size: '2.1 GB',
      duration: '5 minutes',
      timestamp: '2024-12-08 06:00:00',
      location: 's3://backups/db-2024-12-08-06'
    },
    {
      id: '3',
      name: 'Configuration Backup',
      type: 'differential',
      status: 'completed',
      size: '45 MB',
      duration: '1 minute',
      timestamp: '2024-12-08 12:00:00',
      location: 's3://backups/config-2024-12-08-12'
    },
    {
      id: '4',
      name: 'Application Data Backup',
      type: 'incremental',
      status: 'running',
      size: '1.8 GB',
      duration: '3 minutes',
      timestamp: '2024-12-08 18:00:00',
      location: 's3://backups/app-2024-12-08-18'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'running':
        return <ClockIcon className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-purple-500/20 text-purple-400';
      case 'incremental':
        return 'bg-blue-500/20 text-blue-400';
      case 'differential':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const completedBackups = backups.filter(b => b.status === 'completed').length;
  const runningBackups = backups.filter(b => b.status === 'running').length;
  const totalSize = backups
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.size.replace(' GB', '').replace(' MB', '')) * (b.size.includes('GB') ? 1 : 0.001), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ServerIcon className="w-8 h-8 text-green-400" />
            Backup & Recovery
          </h1>
          <p className="text-gray-400 mt-1">
            Manage system backups and disaster recovery
          </p>
        </div>
        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2">
          <PlayIcon className="w-5 h-5" />
          Start Backup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Backups</span>
            <CircleStackIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{backups.length}</div>
          <div className="text-sm text-gray-400 mt-1">All time</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Completed</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{completedBackups}</div>
          <div className="text-sm text-green-400 mt-1">Successful</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Running</span>
            <ClockIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{runningBackups}</div>
          <div className="text-sm text-gray-400 mt-1">In progress</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Size</span>
            <DocumentArrowDownIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{totalSize.toFixed(1)} GB</div>
          <div className="text-sm text-gray-400 mt-1">Storage used</div>
        </div>
      </div>

      {/* Backup Schedule */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-400" />
          Backup Schedule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Full Backup</h3>
              <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-semibold">
                Daily
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Complete system backup</p>
            <div className="text-xs text-gray-500">
              <div>Scheduled: 2:00 AM</div>
              <div>Retention: 30 days</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Incremental</h3>
              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
                Hourly
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Changed data only</p>
            <div className="text-xs text-gray-500">
              <div>Scheduled: Every hour</div>
              <div>Retention: 7 days</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Differential</h3>
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
                6 Hours
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Changes since last full</p>
            <div className="text-xs text-gray-500">
              <div>Scheduled: 6:00, 12:00, 18:00</div>
              <div>Retention: 14 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CircleStackIcon className="w-6 h-6 text-purple-400" />
          Backup History
        </h2>
        <div className="space-y-3">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{backup.name}</h3>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                      {backup.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(backup.type)}`}>
                      {backup.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{backup.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3 pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs text-gray-400 block">Timestamp</span>
                  <span className="text-sm text-white font-semibold">{backup.timestamp}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Size</span>
                  <span className="text-sm text-white font-semibold">{backup.size}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Duration</span>
                  <span className="text-sm text-white font-semibold">{backup.duration}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Type</span>
                  <span className="text-sm text-white font-semibold capitalize">{backup.type}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {backup.status === 'completed' && (
                  <>
                    <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <CloudArrowDownIcon className="w-4 h-4" />
                      Restore
                    </button>
                    <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      Download
                    </button>
                  </>
                )}
                <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <PlayIcon className="w-5 h-5" />
              Start Manual Backup
            </button>
            <button className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <CloudArrowDownIcon className="w-5 h-5" />
              Restore from Backup
            </button>
            <button className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <CalendarIcon className="w-5 h-5" />
              Configure Schedule
            </button>
            <button className="w-full px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg font-semibold text-left flex items-center gap-3">
              <ArrowPathIcon className="w-5 h-5" />
              Verify Backups
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Backup Configuration</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Storage Location:</span>
              <span className="text-white font-semibold">AWS S3</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Encryption:</span>
              <span className="text-white font-semibold">AES-256</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Compression:</span>
              <span className="text-white font-semibold">Enabled</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Retention Policy:</span>
              <span className="text-white font-semibold">30 days</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Auto-verify:</span>
              <span className="text-white font-semibold">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBackup;
