import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ScheduledIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Report {
  id: string;
  name: string;
  description: string;
  category: 'infrastructure' | 'cost' | 'security' | 'compliance' | 'performance';
  type: 'standard' | 'custom';
  lastRun: string;
  status: 'completed' | 'running' | 'failed';
  format: 'pdf' | 'csv' | 'json' | 'html';
  size: string;
  generatedBy: string;
  favorite: boolean;
}

const ReportsOverview: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Infrastructure Utilization',
      description: 'Comprehensive analysis of resource utilization across all environments',
      category: 'infrastructure',
      type: 'standard',
      lastRun: '2 hours ago',
      status: 'completed',
      format: 'pdf',
      size: '2.4 MB',
      generatedBy: 'System',
      favorite: true
    },
    {
      id: '2',
      name: 'Monthly Cost Analysis',
      description: 'Detailed breakdown of cloud spending and cost optimization opportunities',
      category: 'cost',
      type: 'standard',
      lastRun: '5 hours ago',
      status: 'completed',
      format: 'pdf',
      size: '3.1 MB',
      generatedBy: 'Admin',
      favorite: true
    },
    {
      id: '3',
      name: 'Security Compliance Report',
      description: 'Compliance status across PCI DSS, SOC 2, HIPAA, and GDPR frameworks',
      category: 'security',
      type: 'standard',
      lastRun: '1 day ago',
      status: 'completed',
      format: 'pdf',
      size: '5.6 MB',
      generatedBy: 'Security Team',
      favorite: true
    },
    {
      id: '4',
      name: 'Performance Metrics',
      description: 'Application performance monitoring and response time analysis',
      category: 'performance',
      type: 'custom',
      lastRun: '30 minutes ago',
      status: 'running',
      format: 'html',
      size: '1.2 MB',
      generatedBy: 'DevOps',
      favorite: false
    },
    {
      id: '5',
      name: 'Audit Trail Export',
      description: 'Complete audit log of system changes and user activities',
      category: 'compliance',
      type: 'custom',
      lastRun: '3 days ago',
      status: 'completed',
      format: 'csv',
      size: '12.3 MB',
      generatedBy: 'Compliance',
      favorite: false
    },
    {
      id: '6',
      name: 'Vulnerability Assessment',
      description: 'Security vulnerability scan results and remediation recommendations',
      category: 'security',
      type: 'standard',
      lastRun: '1 week ago',
      status: 'failed',
      format: 'pdf',
      size: '0 MB',
      generatedBy: 'Security Team',
      favorite: false
    },
    {
      id: '7',
      name: 'Resource Inventory',
      description: 'Complete inventory of all cloud resources across providers',
      category: 'infrastructure',
      type: 'standard',
      lastRun: '12 hours ago',
      status: 'completed',
      format: 'json',
      size: '4.8 MB',
      generatedBy: 'System',
      favorite: false
    },
    {
      id: '8',
      name: 'Cost Optimization Recommendations',
      description: 'AI-powered recommendations for reducing cloud infrastructure costs',
      category: 'cost',
      type: 'custom',
      lastRun: '2 days ago',
      status: 'completed',
      format: 'pdf',
      size: '1.9 MB',
      generatedBy: 'AI Engine',
      favorite: true
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Reports', icon: DocumentTextIcon },
    { id: 'infrastructure', name: 'Infrastructure', icon: ChartBarIcon },
    { id: 'cost', name: 'Cost', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: ChartBarIcon },
    { id: 'compliance', name: 'Compliance', icon: ChartBarIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon }
  ];

  const filteredReports = reports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return 'bg-blue-500/20 text-blue-400';
      case 'cost':
        return 'bg-green-500/20 text-green-400';
      case 'security':
        return 'bg-red-500/20 text-red-400';
      case 'compliance':
        return 'bg-purple-500/20 text-purple-400';
      case 'performance':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const favoriteReports = reports.filter(r => r.favorite).length;
  const runningReports = reports.filter(r => r.status === 'running').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <DocumentTextIcon className="w-8 h-8 text-blue-400" />
            Reports Overview
          </h1>
          <p className="text-gray-400 mt-1">
            View and download generated reports
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Reports</span>
            <DocumentTextIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{totalReports}</div>
          <div className="text-sm text-gray-400 mt-1">All time</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Completed</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{completedReports}</div>
          <div className="text-sm text-green-400 mt-1">{((completedReports / totalReports) * 100).toFixed(0)}% success rate</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Favorites</span>
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">{favoriteReports}</div>
          <div className="text-sm text-gray-400 mt-1">Pinned reports</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Running</span>
            <ScheduledIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{runningReports}</div>
          <div className="text-sm text-gray-400 mt-1">In progress</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all"
          >
            {/* Report Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{report.name}</h3>
                  {report.favorite && <StarIconSolid className="w-5 h-5 text-yellow-400" />}
                </div>
                <p className="text-sm text-gray-300 mb-3">{report.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-gray-500/20 text-gray-400 text-xs font-semibold">
                    {report.type}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-gray-500/20 text-gray-400 text-xs font-semibold uppercase">
                    {report.format}
                  </span>
                </div>
              </div>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                {getStatusIcon(report.status)}
                {report.status}
              </span>
            </div>

            {/* Report Details */}
            <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-gray-400 block">Last Run</span>
                <span className="text-sm text-white font-semibold">{report.lastRun}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Size</span>
                <span className="text-sm text-white font-semibold">{report.size}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Generated By</span>
                <span className="text-sm text-white font-semibold">{report.generatedBy}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                <EyeIcon className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download
              </button>
              <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No reports found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ReportsOverview;
