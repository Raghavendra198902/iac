import React, { useState } from 'react';
import {
  CodeBracketIcon,
  PlusIcon,
  TableCellsIcon,
  ChartBarIcon,
  FunnelIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  selected: boolean;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const ReportsBuilder: React.FC = () => {
  const [reportName, setReportName] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('infrastructure');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [selectedFields, setSelectedFields] = useState<ReportField[]>([
    { id: '1', name: 'Resource Name', type: 'string', selected: true },
    { id: '2', name: 'Resource Type', type: 'string', selected: true },
    { id: '3', name: 'Cost', type: 'number', selected: true },
    { id: '4', name: 'Created Date', type: 'date', selected: false },
    { id: '5', name: 'Region', type: 'string', selected: false },
    { id: '6', name: 'Status', type: 'string', selected: true },
    { id: '7', name: 'Owner', type: 'string', selected: false },
    { id: '8', name: 'Tags', type: 'string', selected: false }
  ]);

  const [filters, setFilters] = useState<ReportFilter[]>([
    { id: '1', field: 'Status', operator: 'equals', value: 'active' }
  ]);

  const dataSources = [
    { id: 'infrastructure', name: 'Infrastructure', icon: TableCellsIcon },
    { id: 'cost', name: 'Cost Analysis', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: FunnelIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'compliance', name: 'Compliance', icon: DocumentTextIcon }
  ];

  const formats = [
    { id: 'pdf', name: 'PDF', icon: DocumentTextIcon },
    { id: 'csv', name: 'CSV', icon: TableCellsIcon },
    { id: 'json', name: 'JSON', icon: CodeBracketIcon },
    { id: 'html', name: 'HTML', icon: DocumentTextIcon }
  ];

  const operators = ['equals', 'not equals', 'contains', 'greater than', 'less than', 'between'];

  const toggleField = (fieldId: string) => {
    setSelectedFields(fields =>
      fields.map(field =>
        field.id === fieldId ? { ...field, selected: !field.selected } : field
      )
    );
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: String(filters.length + 1),
      field: 'Status',
      operator: 'equals',
      value: ''
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, key: keyof ReportFilter, value: string) => {
    setFilters(filters.map(f =>
      f.id === filterId ? { ...f, [key]: value } : f
    ));
  };

  const selectedFieldsCount = selectedFields.filter(f => f.selected).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CodeBracketIcon className="w-8 h-8 text-purple-400" />
            Report Builder
          </h1>
          <p className="text-gray-400 mt-1">
            Create custom reports with advanced filtering and formatting
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2 hover:bg-blue-500/30">
            <EyeIcon className="w-5 h-5" />
            Preview
          </button>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2">
            <PlayIcon className="w-5 h-5" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Enter report description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Data Source Selection */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Data Source</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dataSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedDataSource(source.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedDataSource === source.id
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <source.icon className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-semibold">{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fields Selection */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Fields</h2>
              <span className="text-sm text-gray-400">
                {selectedFieldsCount} of {selectedFields.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {selectedFields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => toggleField(field.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    field.selected
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{field.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-black/30">
                      {field.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <button
                onClick={addFilter}
                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-500/30 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Filter
              </button>
            </div>
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <div key={filter.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-8">{index + 1}</span>
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {selectedFields.map(field => (
                      <option key={field.id} value={field.name}>{field.name}</option>
                    ))}
                  </select>
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {operators.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    placeholder="Value..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              {filters.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No filters applied. Click "Add Filter" to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          {/* Output Format */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Output Format</h2>
            <div className="space-y-2">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    selectedFormat === format.id
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <format.icon className="w-5 h-5" />
                  <span className="font-semibold">{format.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Frequency
                </label>
                <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Delivery</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Recipients
                </label>
                <input
                  type="text"
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm">Save to storage</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Data Source:</span>
                <span className="text-white font-semibold capitalize">{selectedDataSource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fields:</span>
                <span className="text-white font-semibold">{selectedFieldsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Filters:</span>
                <span className="text-white font-semibold">{filters.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Format:</span>
                <span className="text-white font-semibold uppercase">{selectedFormat}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsBuilder;
