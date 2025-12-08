import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ExportJob {
  id: string;
  name: string;
  type: string;
  format: 'pdf' | 'csv' | 'json' | 'excel';
  status: 'completed' | 'processing' | 'queued';
  size: string;
  createdAt: string;
  expiresAt: string;
}

const ReportsExport: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [selectedData, setSelectedData] = useState<string>('all');

  const [exports] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Infrastructure Export',
      type: 'infrastructure',
      format: 'pdf',
      status: 'completed',
      size: '5.2 MB',
      createdAt: '2 hours ago',
      expiresAt: 'in 6 days'
    },
    {
      id: '2',
      name: 'Cost Data Export',
      type: 'cost',
      format: 'csv',
      status: 'completed',
      size: '1.8 MB',
      createdAt: '5 hours ago',
      expiresAt: 'in 6 days'
    },
    {
      id: '3',
      name: 'Security Audit Export',
      type: 'security',
      format: 'json',
      status: 'processing',
      size: '-',
      createdAt: '10 minutes ago',
      expiresAt: 'in 7 days'
    },
    {
      id: '4',
      name: 'Performance Metrics',
      type: 'performance',
      format: 'excel',
      status: 'queued',
      size: '-',
      createdAt: '5 minutes ago',
      expiresAt: 'in 7 days'
    }
  ]);

  const formats = [
    { id: 'pdf', name: 'PDF', icon: DocumentTextIcon, description: 'Formatted document' },
    { id: 'csv', name: 'CSV', icon: TableCellsIcon, description: 'Spreadsheet data' },
    { id: 'json', name: 'JSON', icon: CodeBracketIcon, description: 'Structured data' },
    { id: 'excel', name: 'Excel', icon: TableCellsIcon, description: 'Excel workbook' }
  ];

  const dataTypes = [
    { id: 'all', name: 'All Data' },
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'cost', name: 'Cost Analysis' },
    { id: 'security', name: 'Security' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'performance', name: 'Performance' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'queued':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4 animate-spin" />;
      case 'queued':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const completedExports = exports.filter(e => e.status === 'completed').length;
  const processingExports = exports.filter(e => e.status === 'processing').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ArrowDownTrayIcon className="w-8 h-8 text-yellow-400" />
            Export Reports
          </h1>
          <p className="text-gray-400 mt-1">
            Export data in various formats
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Exports</span>
            <ArrowDownTrayIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{exports.length}</div>
          <div className="text-sm text-gray-400 mt-1">All time</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Completed</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{completedExports}</div>
          <div className="text-sm text-green-400 mt-1">Ready to download</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Processing</span>
            <ClockIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{processingExports}</div>
          <div className="text-sm text-gray-400 mt-1">In progress</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Size</span>
            <DocumentTextIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">8.8 MB</div>
          <div className="text-sm text-gray-400 mt-1">Storage used</div>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Format</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedFormat === format.id
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <format.icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-semibold mb-1">{format.name}</div>
                  <div className="text-xs opacity-70">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Data Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dataTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedData(type.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedData === type.id
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-semibold">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3">
            <ArrowDownTrayIcon className="w-6 h-6" />
            Start Export
          </button>
        </div>

        {/* Export Queue */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Exports</h2>
            <div className="space-y-3">
              {exports.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white/5 rounded-lg border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white mb-1">{exp.name}</div>
                      <div className="text-xs text-gray-400">{exp.createdAt}</div>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(exp.status)}`}>
                      {getStatusIcon(exp.status)}
                      {exp.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="uppercase">{exp.format}</span>
                    <span>{exp.size}</span>
                  </div>
                  {exp.status === 'completed' && (
                    <>
                      <button className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 mb-2">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                      </button>
                      <div className="text-xs text-gray-400 text-center">
                        Expires {exp.expiresAt}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsExport;
