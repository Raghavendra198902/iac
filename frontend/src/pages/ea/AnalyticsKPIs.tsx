import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { BarChart3, FileText, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Metric {
  id: string;
  metric_name: string;
  description: string;
  category: string;
  metric_type: string;
  current_value: number;
  target_value: number;
  unit: string;
  trend: string;
  last_measured: string;
  frequency: string;
  owner: string;
  status: string;
  notes: string;
}

interface Report {
  id: string;
  report_name: string;
  description: string;
  report_type: string;
  category: string;
  generated_date: string;
  author: string;
  audience: string;
  key_findings: string;
  recommendations: string;
  file_path: string;
  status: string;
  notes: string;
}

export default function AnalyticsKPIs() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'reports'>('metrics');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [metricsRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/analytics/metrics`),
        fetch(`${API_URL}/analytics/reports`)
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'on track': return 'text-green-600 bg-green-50';
      case 'at risk': return 'text-orange-600 bg-orange-50';
      case 'off track': return 'text-red-600 bg-red-50';
      case 'published': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'increasing': return '↗';
      case 'decreasing': return '↘';
      case 'stable': return '→';
      default: return '–';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & KPIs</h1>
          <p className="text-gray-600">Monitor metrics and view reports</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'metrics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Metrics ({metrics.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reports ({reports.length})
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                onDoubleClick={() => setSelectedMetric(metric)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{metric.metric_name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">{metric.current_value}</span>
                    <span className="text-sm text-gray-500">/ {metric.target_value} {metric.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((metric.current_value / metric.target_value) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{metric.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trend:</span>
                    <span className="font-medium text-gray-900">{getTrendIcon(metric.trend)} {metric.trend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Owner:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{metric.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                onDoubleClick={() => setSelectedReport(report)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.report_name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">{report.report_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{report.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Generated:</span>
                    <span className="font-medium text-gray-900">{new Date(report.generated_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Author:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{report.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metric Detail Modal */}
        {selectedMetric && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMetric.metric_name}</h2>
                <button onClick={() => setSelectedMetric(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Metric Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedMetric.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedMetric.metric_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Current Value</label><p className="mt-1">{selectedMetric.current_value} {selectedMetric.unit}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Target Value</label><p className="mt-1">{selectedMetric.target_value} {selectedMetric.unit}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Trend</label><p className="mt-1">{getTrendIcon(selectedMetric.trend)} {selectedMetric.trend}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedMetric.status)}`}>{selectedMetric.status}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedMetric.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Frequency</label><p className="mt-1">{selectedMetric.frequency}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Last Measured</label><p className="mt-1">{new Date(selectedMetric.last_measured).toLocaleDateString()}</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedMetric.description}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.report_name}</h2>
                <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Report Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedReport.report_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedReport.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Author</label><p className="mt-1">{selectedReport.author}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Generated</label><p className="mt-1">{new Date(selectedReport.generated_date).toLocaleDateString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedReport.status)}`}>{selectedReport.status}</span></p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedReport.description}</p></div>
                {selectedReport.audience && (
                  <div><h3 className="text-lg font-semibold mb-3">Audience</h3><p>{selectedReport.audience}</p></div>
                )}
                {selectedReport.key_findings && (
                  <div><h3 className="text-lg font-semibold mb-3">Key Findings</h3><p>{selectedReport.key_findings}</p></div>
                )}
                {selectedReport.recommendations && (
                  <div><h3 className="text-lg font-semibold mb-3">Recommendations</h3><p>{selectedReport.recommendations}</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
