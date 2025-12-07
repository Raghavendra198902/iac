import React, { useState, useEffect } from 'react';
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CircleStackIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  status: 'completed' | 'in-progress' | 'failed';
  timestamp: string;
  location: string;
  retention: string;
}

const BackupRecovery: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    fetchBackups();
    const interval = setInterval(fetchBackups, 100);
    return () => clearInterval(interval);
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/backups');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async (type: string) => {
    setIsCreatingBackup(true);
    try {
      const response = await fetch('http://localhost:4000/api/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (response.ok) {
        fetchBackups();
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/backups/${backupId}/restore`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('Backup restoration initiated successfully!');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('Failed to restore backup');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/backups/${backupId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchBackups();
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'incremental':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'differential':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalBackupSize = backups.reduce((total, backup) => {
    const size = parseFloat(backup.size);
    return total + size;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Backup & Disaster Recovery
            <span className="ml-3 inline-flex items-center">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="ml-2 text-sm font-medium text-green-600">LIVE</span>
            </span>
          </h1>
          <p className="text-gray-600">Manage backups and recovery operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => createBackup('incremental')}
            disabled={isCreatingBackup}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            <CloudArrowUpIcon className="h-5 w-5 inline mr-2" />
            Quick Backup
          </button>
          <button
            onClick={() => createBackup('full')}
            disabled={isCreatingBackup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <CircleStackIcon className="h-5 w-5 inline mr-2" />
            Full Backup
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Backups</p>
              <p className="text-3xl font-bold text-gray-900">{backups.length}</p>
            </div>
            <CircleStackIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-3xl font-bold text-gray-900">{totalBackupSize.toFixed(1)} GB</p>
            </div>
            <CloudArrowDownIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-3xl font-bold text-gray-900">
                {backups.filter(b => b.status === 'completed').length}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Backup</p>
              <p className="text-lg font-bold text-gray-900">
                {backups.length > 0 ? new Date(backups[0].timestamp).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Backup Schedule */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Automated Backup Schedule</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-900">Full Backup</span>
              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">Weekly</span>
            </div>
            <p className="text-xs text-blue-700">Every Sunday at 2:00 AM</p>
            <p className="text-xs text-blue-600 mt-2">Next: Sunday, Dec 14, 2025</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-green-900">Incremental</span>
              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Daily</span>
            </div>
            <p className="text-xs text-green-700">Every day at 1:00 AM</p>
            <p className="text-xs text-green-600 mt-2">Next: Tomorrow at 1:00 AM</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-900">Database</span>
              <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">Hourly</span>
            </div>
            <p className="text-xs text-purple-700">Every hour</p>
            <p className="text-xs text-purple-600 mt-2">Next: In 45 minutes</p>
          </div>
        </div>
      </div>

      {/* Backups List */}
      {isLoading ? (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-12 w-12 text-gray-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading backups...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Backup History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retention
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentDuplicateIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{backup.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getTypeColor(backup.type)}`}>
                        {backup.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.size} GB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(backup.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{backup.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(backup.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.retention}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {backup.status === 'completed' && (
                        <>
                          <button
                            onClick={() => restoreBackup(backup.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => deleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            <TrashIcon className="h-5 w-5 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRecovery;
