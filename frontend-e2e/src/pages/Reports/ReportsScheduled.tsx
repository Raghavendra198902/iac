import React, { useState } from 'react';
import {
  ClockIcon,
  CalendarIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused' | 'error';
  recipients: string[];
  format: string;
  createdBy: string;
}

const ReportsScheduled: React.FC = () => {
  const [reports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Daily Infrastructure Summary',
      description: 'Daily resource utilization and health status',
      frequency: 'daily',
      nextRun: 'Today at 8:00 AM',
      lastRun: 'Yesterday at 8:00 AM',
      status: 'active',
      recipients: ['admin@example.com', 'ops@example.com'],
      format: 'PDF',
      createdBy: 'Admin'
    },
    {
      id: '2',
      name: 'Weekly Cost Report',
      description: 'Weekly cost breakdown and optimization recommendations',
      frequency: 'weekly',
      nextRun: 'Monday at 9:00 AM',
      lastRun: '7 days ago',
      status: 'active',
      recipients: ['finance@example.com'],
      format: 'PDF',
      createdBy: 'Finance Team'
    },
    {
      id: '3',
      name: 'Monthly Security Compliance',
      description: 'Comprehensive security and compliance audit',
      frequency: 'monthly',
      nextRun: '1st of next month',
      lastRun: '30 days ago',
      status: 'active',
      recipients: ['security@example.com', 'compliance@example.com'],
      format: 'PDF',
      createdBy: 'Security Team'
    },
    {
      id: '4',
      name: 'Daily Performance Metrics',
      description: 'Application performance and response times',
      frequency: 'daily',
      nextRun: 'Tomorrow at 6:00 AM',
      lastRun: 'Today at 6:00 AM',
      status: 'paused',
      recipients: ['devops@example.com'],
      format: 'HTML',
      createdBy: 'DevOps'
    },
    {
      id: '5',
      name: 'Weekly Audit Trail',
      description: 'System changes and user activity log',
      frequency: 'weekly',
      nextRun: 'Friday at 5:00 PM',
      lastRun: '2 days ago',
      status: 'error',
      recipients: ['audit@example.com'],
      format: 'CSV',
      createdBy: 'Compliance'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'paused':
        return <PauseIcon className="w-4 h-4" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-500/20 text-blue-400';
      case 'weekly':
        return 'bg-purple-500/20 text-purple-400';
      case 'monthly':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const activeReports = reports.filter(r => r.status === 'active').length;
  const pausedReports = reports.filter(r => r.status === 'paused').length;
  const errorReports = reports.filter(r => r.status === 'error').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-green-400" />
            Scheduled Reports
          </h1>
          <p className="text-gray-400 mt-1">
            Manage automated report generation and delivery
          </p>
        </div>
        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Schedule New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Scheduled</span>
            <CalendarIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{reports.length}</div>
          <div className="text-sm text-gray-400 mt-1">Reports</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{activeReports}</div>
          <div className="text-sm text-green-400 mt-1">Running</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Paused</span>
            <PauseIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">{pausedReports}</div>
          <div className="text-sm text-gray-400 mt-1">Temporarily stopped</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Errors</span>
            <XCircleIcon className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white">{errorReports}</div>
          <div className="text-sm text-red-400 mt-1">Need attention</div>
        </div>
      </div>

      {/* Scheduled Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{report.name}</h3>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getFrequencyColor(report.frequency)}`}>
                    {report.frequency}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{report.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs text-gray-400 block">Next Run</span>
                <span className="text-sm text-white font-semibold">{report.nextRun}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Last Run</span>
                <span className="text-sm text-white font-semibold">{report.lastRun}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Format</span>
                <span className="text-sm text-white font-semibold">{report.format}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Recipients</span>
                <span className="text-sm text-white font-semibold">{report.recipients.length}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Created By</span>
                <span className="text-sm text-white font-semibold">{report.createdBy}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Recipients:</div>
                <div className="flex flex-wrap gap-1">
                  {report.recipients.map((recipient, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
                      {recipient}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {report.status === 'active' ? (
                  <button className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg" title="Pause">
                    <PauseIcon className="w-5 h-5" />
                  </button>
                ) : (
                  <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg" title="Resume">
                    <PlayIcon className="w-5 h-5" />
                  </button>
                )}
                <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg" title="Edit">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg" title="Delete">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsScheduled;
