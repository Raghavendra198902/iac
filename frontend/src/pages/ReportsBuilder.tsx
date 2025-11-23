import React, { useState } from 'react';
import { 
  FileText, Plus, Download, Calendar, Clock, Share2, Eye, 
  BarChart3, Table, AlertTriangle, CheckCircle2, TrendingUp, Users, Server,
  DollarSign, Shield, Activity, Trash2, Copy, Edit2, Play
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import FadeIn from '../components/FadeIn';
import Badge from '../components/Badge';
import Tabs from '../components/Tabs';
import { TabsContent } from '../components/Tabs';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'operational' | 'financial' | 'security' | 'compliance' | 'custom';
  widgets: ReportWidget[];
  schedule?: ReportSchedule;
  lastGenerated?: string;
  createdBy: string;
  isPublic: boolean;
}

interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'alert';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataSource: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  enabled: boolean;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  format: string;
  size: string;
  status: 'completed' | 'failed' | 'generating';
  downloadUrl?: string;
}

const ReportsBuilder: React.FC = () => {
  const { theme } = useTheme();
  
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Infrastructure Health Report',
      description: 'Comprehensive overview of infrastructure health, performance, and capacity',
      category: 'operational',
      widgets: [
        { id: 'w1', type: 'metric', title: 'System Uptime', dataSource: 'monitoring.uptime', config: {}, position: { x: 0, y: 0, w: 3, h: 2 } },
        { id: 'w2', type: 'chart', chartType: 'line', title: 'CPU Usage Trend', dataSource: 'monitoring.cpu', config: {}, position: { x: 3, y: 0, w: 6, h: 3 } }
      ],
      schedule: {
        frequency: 'daily',
        time: '08:00',
        recipients: ['ops-team@company.com'],
        format: 'pdf',
        enabled: true
      },
      lastGenerated: '2024-01-15T08:00:00Z',
      createdBy: 'Admin',
      isPublic: true
    },
    {
      id: '2',
      name: 'Security Compliance Report',
      description: 'Security posture, vulnerabilities, and compliance status',
      category: 'security',
      widgets: [
        { id: 'w3', type: 'chart', chartType: 'pie', title: 'Vulnerability Distribution', dataSource: 'security.vulns', config: {}, position: { x: 0, y: 0, w: 4, h: 3 } },
        { id: 'w4', type: 'table', title: 'Critical Findings', dataSource: 'security.findings', config: {}, position: { x: 4, y: 0, w: 8, h: 4 } }
      ],
      lastGenerated: '2024-01-14T10:30:00Z',
      createdBy: 'Security Team',
      isPublic: false
    },
    {
      id: '3',
      name: 'Cost Analysis Report',
      description: 'Multi-cloud cost breakdown, trends, and optimization opportunities',
      category: 'financial',
      widgets: [
        { id: 'w5', type: 'chart', chartType: 'bar', title: 'Cost by Cloud Provider', dataSource: 'cost.providers', config: {}, position: { x: 0, y: 0, w: 6, h: 3 } },
        { id: 'w6', type: 'metric', title: 'Total Spend', dataSource: 'cost.total', config: {}, position: { x: 6, y: 0, w: 3, h: 2 } }
      ],
      schedule: {
        frequency: 'monthly',
        time: '09:00',
        recipients: ['finance@company.com', 'cto@company.com'],
        format: 'excel',
        enabled: true
      },
      lastGenerated: '2024-01-01T09:00:00Z',
      createdBy: 'Finance',
      isPublic: true
    }
  ]);

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: 'r1',
      templateId: '1',
      templateName: 'Infrastructure Health Report',
      generatedAt: '2024-01-15T08:00:00Z',
      format: 'PDF',
      size: '2.4 MB',
      status: 'completed',
      downloadUrl: '/reports/infra-health-2024-01-15.pdf'
    },
    {
      id: 'r2',
      templateId: '2',
      templateName: 'Security Compliance Report',
      generatedAt: '2024-01-14T10:30:00Z',
      format: 'PDF',
      size: '3.8 MB',
      status: 'completed',
      downloadUrl: '/reports/security-2024-01-14.pdf'
    },
    {
      id: 'r3',
      templateId: '1',
      templateName: 'Infrastructure Health Report',
      generatedAt: '2024-01-15T09:15:00Z',
      format: 'Excel',
      size: '1.2 MB',
      status: 'generating'
    }
  ]);

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([

  const widgetTypes = [
    { type: 'metric', icon: TrendingUp, label: 'Metric Card', color: 'blue' },
    { type: 'chart', icon: BarChart3, label: 'Chart', color: 'purple' },
    { type: 'table', icon: Table, label: 'Data Table', color: 'green' },
    { type: 'alert', icon: AlertTriangle, label: 'Alert List', color: 'orange' },
    { type: 'text', icon: FileText, label: 'Text Block', color: 'gray' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational': return <Server className="w-5 h-5" />;
      case 'financial': return <DollarSign className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'compliance': return <CheckCircle2 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operational': return 'blue';
      case 'financial': return 'green';
      case 'security': return 'red';
      case 'compliance': return 'purple';
      default: return 'gray';
    }
  };

  const generateReport = (templateId: string, format: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newReport: GeneratedReport = {
      id: `r${Date.now()}`,
      templateId,
      templateName: template.name,
      generatedAt: new Date().toISOString(),
      format: format.toUpperCase(),
      size: '0 MB',
      status: 'generating'
    };

    setGeneratedReports([newReport, ...generatedReports]);

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReports(prev => 
        prev.map(r => 
          r.id === newReport.id 
            ? { ...r, status: 'completed', size: '2.1 MB', downloadUrl: `/reports/${templateId}-${Date.now()}.${format}` }
            : r
        )
      );
    }, 3000);
  };

  const duplicateTemplate = (template: ReportTemplate) => {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `t${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdBy: 'Current User',
      isPublic: false
    };
    setTemplates([...templates, newTemplate]);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Builder</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create custom reports and schedule automated delivery
              </p>
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Report Template
            </button>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{templates.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {templates.filter(t => t.schedule?.enabled).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generated Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {generatedReports.filter(r => new Date(r.generatedAt).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">24</p>
                </div>
                <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main Content Tabs */}
        <FadeIn delay={0.2}>
          <Tabs defaultValue="templates">
            <div className="mb-4">
              <div role="tablist" className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  role="tab"
                  data-value="templates"
                  className="px-4 py-2 text-sm font-medium transition-colors border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                >
                  <FileText className="w-4 h-4 inline-block mr-2" />
                  Templates
                </button>
                <button
                  role="tab"
                  data-value="generated"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4 inline-block mr-2" />
                  Generated Reports
                </button>
                <button
                  role="tab"
                  data-value="widgets"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <BarChart3 className="w-4 h-4 inline-block mr-2" />
                  Widget Library
                </button>
              </div>
            </div>

            <TabsContent value="templates">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-${getCategoryColor(template.category)}-100 dark:bg-${getCategoryColor(template.category)}-900/20 flex items-center justify-center`}>
                          {getCategoryIcon(template.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                        </div>
                      </div>
                      <Badge variant={template.isPublic ? 'success' : 'default'}>
                        {template.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <BarChart3 className="w-4 h-4" />
                        <span>{template.widgets.length} widgets</span>
                      </div>
                      {template.schedule && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {template.schedule.frequency} at {template.schedule.time}
                            {template.schedule.enabled && <Badge variant="success" className="ml-2">Active</Badge>}
                          </span>
                        </div>
                      )}
                      {template.lastGenerated && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Last generated: {new Date(template.lastGenerated).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => generateReport(template.id, 'pdf')}
                        className="flex-1 btn btn-primary btn-sm flex items-center justify-center gap-2"
                      >
                        <Play className="w-3 h-3" />
                        Generate
                      </button>
                      <button 
                        onClick={() => setSelectedTemplate(template)}
                        className="btn btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button 
                        onClick={() => duplicateTemplate(template)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => deleteTemplate(template.id)}
                        className="btn btn-secondary btn-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="generated">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Report Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Generated At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Format
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {generatedReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {report.templateName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {new Date(report.generatedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default">{report.format}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {report.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={
                              report.status === 'completed' ? 'success' :
                              report.status === 'generating' ? 'warning' :
                              'error'
                            }>
                              {report.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {report.status === 'completed' && report.downloadUrl && (
                                <>
                                  <button className="btn btn-primary btn-sm flex items-center gap-1">
                                    <Download className="w-3 h-3" />
                                    Download
                                  </button>
                                  <button className="btn btn-secondary btn-sm flex items-center gap-1">
                                    <Share2 className="w-3 h-3" />
                                    Share
                                  </button>
                                </>
                              )}
                              {report.status === 'generating' && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <Activity className="w-4 h-4 animate-spin" />
                                  Generating...
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="widgets">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgetTypes.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <div
                      key={widget.type}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                    >
                      <div className={`h-12 w-12 rounded-lg bg-${widget.color}-100 dark:bg-${widget.color}-900/20 flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 text-${widget.color}-600 dark:text-${widget.color}-400`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{widget.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Drag to add this widget to your report template
                      </p>
                      <button className="mt-4 btn btn-secondary btn-sm w-full flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" />
                        Add Widget
                      </button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTemplate(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTemplate.name}</h2>
                <button onClick={() => setSelectedTemplate(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  ×
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedTemplate.description}</p>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Report Widgets ({selectedTemplate.widgets.length})</h3>
                <div className="grid grid-cols-1 gap-4">
                  {selectedTemplate.widgets.map((widget) => (
                    <div key={widget.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {widget.type === 'chart' && <BarChart3 className="w-5 h-5 text-purple-600" />}
                          {widget.type === 'metric' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                          {widget.type === 'table' && <Table className="w-5 h-5 text-green-600" />}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{widget.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {widget.type === 'chart' ? `${widget.chartType} chart` : widget.type}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">{widget.dataSource}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTemplate.schedule && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Schedule Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Frequency</p>
                      <p className="text-gray-900 dark:text-white font-medium capitalize">{selectedTemplate.schedule.frequency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Time</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedTemplate.schedule.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Format</p>
                      <p className="text-gray-900 dark:text-white font-medium uppercase">{selectedTemplate.schedule.format}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Recipients</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedTemplate.schedule.recipients.length} users</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setSelectedTemplate(null)} className="btn btn-secondary">
                  Close
                </button>
                <button className="btn btn-primary flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsBuilder;
