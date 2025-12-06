import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { Shield, AlertTriangle, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface SecurityControl {
  id: string;
  name: string;
  description: string;
  control_type: string;
  category: string;
  framework: string;
  control_id: string;
  implementation_status: string;
  effectiveness_score: number;
  owner: string;
  priority: string;
  last_review_date: string;
  next_review_date: string;
  notes: string;
}

interface SecurityThreat {
  id: string;
  name: string;
  description: string;
  threat_category: string;
  severity: string;
  likelihood: string;
  impact: string;
  risk_score: number;
  mitigation_controls: string;
  residual_risk: string;
  owner: string;
  last_assessment: string;
  notes: string;
}

export default function SecurityArchitecture() {
  const [activeTab, setActiveTab] = useState<'controls' | 'threats'>('controls');
  const [controls, setControls] = useState<SecurityControl[]>([]);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [selectedControl, setSelectedControl] = useState<SecurityControl | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<SecurityThreat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [controlsRes, threatsRes] = await Promise.all([
        fetch(`${API_URL}/security/controls`),
        fetch(`${API_URL}/security/threats`)
      ]);

      if (controlsRes.ok) setControls(await controlsRes.json());
      if (threatsRes.ok) setThreats(await threatsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Architecture</h1>
          <p className="text-gray-600">Manage security controls and threats</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('controls')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'controls' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Controls ({controls.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('threats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'threats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Threats ({threats.length})
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {controls.map((control) => (
              <div
                key={control.id}
                onDoubleClick={() => setSelectedControl(control)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{control.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(control.priority)}`}>
                      {control.priority}
                    </span>
                  </div>
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{control.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">{control.control_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Framework:</span>
                    <span className="font-medium text-gray-900">{control.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium text-gray-900">{control.implementation_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Effectiveness:</span>
                    <span className="font-medium text-gray-900">{control.effectiveness_score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {threats.map((threat) => (
              <div
                key={threat.id}
                onDoubleClick={() => setSelectedThreat(threat)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{threat.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{threat.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{threat.threat_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Likelihood:</span>
                    <span className="font-medium text-gray-900">{threat.likelihood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Impact:</span>
                    <span className="font-medium text-gray-900">{threat.impact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Score:</span>
                    <span className="font-medium text-gray-900">{threat.risk_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Control Detail Modal */}
        {selectedControl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedControl.name}</h2>
                <button onClick={() => setSelectedControl(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Control Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedControl.control_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedControl.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Framework</label><p className="mt-1">{selectedControl.framework}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Control ID</label><p className="mt-1">{selectedControl.control_id}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1">{selectedControl.implementation_status}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Priority</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedControl.priority)}`}>{selectedControl.priority}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedControl.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Effectiveness</label><p className="mt-1">{selectedControl.effectiveness_score}%</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedControl.description}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Threat Detail Modal */}
        {selectedThreat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedThreat.name}</h2>
                <button onClick={() => setSelectedThreat(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Threat Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedThreat.threat_category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Severity</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedThreat.severity)}`}>{selectedThreat.severity}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Likelihood</label><p className="mt-1">{selectedThreat.likelihood}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Impact</label><p className="mt-1">{selectedThreat.impact}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Risk Score</label><p className="mt-1">{selectedThreat.risk_score}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Residual Risk</label><p className="mt-1">{selectedThreat.residual_risk}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedThreat.owner}</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedThreat.description}</p></div>
                {selectedThreat.mitigation_controls && (
                  <div><h3 className="text-lg font-semibold mb-3">Mitigation Controls</h3><p>{selectedThreat.mitigation_controls}</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
