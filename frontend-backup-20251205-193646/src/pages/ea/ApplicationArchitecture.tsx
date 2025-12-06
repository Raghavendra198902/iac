import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { Server, GitBranch, X, Activity } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Application {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  criticality: string;
  owner: string;
  vendor: string;
  technology_stack: string;
  hosting: string;
  users: number;
  annual_cost: number;
  health_score: number;
  availability: number;
  last_audit_date: string;
  compliance_frameworks: string;
  notes: string;
}

interface Integration {
  id: string;
  source_app_id: string;
  target_app_id: string;
  source_app_name: string;
  target_app_name: string;
  integration_type: string;
  protocol: string;
  frequency: string;
  data_volume: string;
  status: string;
  description: string;
}

export default function ApplicationArchitecture() {
  const [activeTab, setActiveTab] = useState<'applications' | 'integrations'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [appsRes, integrationsRes] = await Promise.all([
        fetch(`${API_URL}/application/applications`),
        fetch(`${API_URL}/application/integrations`)
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }

      if (intsRes.ok) {
        const intsData = await intsRes.json();
        setIntegrations(intsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'deprecated': return 'text-orange-600 bg-orange-50';
      case 'retired': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Architecture</h1>
          <p className="text-gray-600">Manage application portfolio and integrations</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Applications ({applications.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'integrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Integrations ({integrations.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                onDoubleClick={() => setSelectedApp(app)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{app.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(app.criticality)}`}>
                      {app.criticality}
                    </span>
                  </div>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{app.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Owner:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{app.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Users:</span>
                    <span className="font-medium text-gray-900">{app.users?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Health Score:</span>
                    <span className="font-medium text-gray-900">{app.health_score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                onDoubleClick={() => setSelectedIntegration(integration)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {integration.source_app_name} → {integration.target_app_name}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                  <GitBranch className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integration.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">{integration.integration_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Protocol:</span>
                    <span className="font-medium text-gray-900">{integration.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="font-medium text-gray-900">{integration.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Volume:</span>
                    <span className="font-medium text-gray-900">{integration.data_volume}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedApp.name}</h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="mt-1 text-gray-900">{selectedApp.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedApp.status)}`}>
                          {selectedApp.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Criticality</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCriticalityColor(selectedApp.criticality)}`}>
                          {selectedApp.criticality}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Owner</label>
                      <p className="mt-1 text-gray-900">{selectedApp.owner}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vendor</label>
                      <p className="mt-1 text-gray-900">{selectedApp.vendor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hosting</label>
                      <p className="mt-1 text-gray-900">{selectedApp.hosting}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Technology Stack</label>
                      <p className="mt-1 text-gray-900">{selectedApp.technology_stack}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-gray-900">{selectedApp.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Metrics & Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Users</label>
                      <p className="mt-1 text-gray-900">{selectedApp.users?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Annual Cost</label>
                      <p className="mt-1 text-gray-900">${selectedApp.annual_cost?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Health Score</label>
                      <p className="mt-1 text-gray-900">{selectedApp.health_score}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Availability</label>
                      <p className="mt-1 text-gray-900">{selectedApp.availability}%</p>
                    </div>
                  </div>
                </div>

                {selectedApp.compliance_frameworks && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance</h3>
                    <p className="text-gray-900">{selectedApp.compliance_frameworks}</p>
                  </div>
                )}

                {selectedApp.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedApp.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Integration Detail Modal */}
        {selectedIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Integration Details</h2>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Flow</h3>
                  <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{selectedIntegration.source_app_name}</p>
                      <p className="text-xs text-gray-500">Source</p>
                    </div>
                    <GitBranch className="w-8 h-8 text-blue-600" />
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{selectedIntegration.target_app_name}</p>
                      <p className="text-xs text-gray-500">Target</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="mt-1 text-gray-900">{selectedIntegration.integration_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Protocol</label>
                      <p className="mt-1 text-gray-900">{selectedIntegration.protocol}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Frequency</label>
                      <p className="mt-1 text-gray-900">{selectedIntegration.frequency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data Volume</label>
                      <p className="mt-1 text-gray-900">{selectedIntegration.data_volume}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedIntegration.status)}`}>
                          {selectedIntegration.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {selectedIntegration.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-900">{selectedIntegration.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
