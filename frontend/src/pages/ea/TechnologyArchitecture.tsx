import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { Code, FileCheck, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Technology {
  id: string;
  name: string;
  description: string;
  category: string;
  vendor: string;
  version: string;
  lifecycle_phase: string;
  usage_level: string;
  license_type: string;
  annual_cost: number;
  application_count: number;
  risk_level: string;
  eol_date: string;
  notes: string;
}

interface Standard {
  id: string;
  name: string;
  description: string;
  standard_type: string;
  category: string;
  technology_id: string;
  technology_name: string;
  compliance_required: boolean;
  adoption_level: number;
  effective_date: string;
  owner: string;
  notes: string;
}

export default function TechnologyArchitecture() {
  const [activeTab, setActiveTab] = useState<'technologies' | 'standards'>('technologies');
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [techRes, standardsRes] = await Promise.all([
        fetch(`${API_URL}/technology/technologies`),
        fetch(`${API_URL}/technology/standards`)
      ]);

      if (techRes.ok) setTechnologies(await techRes.json());
      if (stdRes.ok) setStandards(await stdRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLifecycleColor = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case 'adopt': return 'text-green-600 bg-green-50';
      case 'maintain': return 'text-blue-600 bg-blue-50';
      case 'sunset': return 'text-orange-600 bg-orange-50';
      case 'retire': return 'text-red-600 bg-red-50';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Technology Architecture</h1>
          <p className="text-gray-600">Manage technology stack and standards</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('technologies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'technologies' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Technologies ({technologies.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('standards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'standards' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Standards ({standards.length})
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'technologies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech) => (
              <div
                key={tech.id}
                onDoubleClick={() => setSelectedTech(tech)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{tech.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLifecycleColor(tech.lifecycle_phase)}`}>
                      {tech.lifecycle_phase}
                    </span>
                  </div>
                  <Code className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tech.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{tech.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vendor:</span>
                    <span className="font-medium text-gray-900">{tech.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Usage Level:</span>
                    <span className="font-medium text-gray-900">{tech.usage_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Applications:</span>
                    <span className="font-medium text-gray-900">{tech.application_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'standards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standards.map((standard) => (
              <div
                key={standard.id}
                onDoubleClick={() => setSelectedStandard(standard)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{standard.name}</h3>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {standard.standard_type}
                    </span>
                  </div>
                  <FileCheck className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{standard.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{standard.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Owner:</span>
                    <span className="font-medium text-gray-900">{standard.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adoption:</span>
                    <span className="font-medium text-gray-900">{standard.adoption_level}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Required:</span>
                    <span className="font-medium text-gray-900">{standard.compliance_required ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technology Detail Modal */}
        {selectedTech && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTech.name}</h2>
                <button onClick={() => setSelectedTech(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedTech.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Vendor</label><p className="mt-1">{selectedTech.vendor}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Version</label><p className="mt-1">{selectedTech.version}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Lifecycle Phase</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getLifecycleColor(selectedTech.lifecycle_phase)}`}>{selectedTech.lifecycle_phase}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Usage Level</label><p className="mt-1">{selectedTech.usage_level}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">License Type</label><p className="mt-1">{selectedTech.license_type}</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Usage & Cost</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Application Count</label><p className="mt-1">{selectedTech.application_count}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Annual Cost</label><p className="mt-1">${selectedTech.annual_cost?.toLocaleString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Risk Level</label><p className="mt-1">{selectedTech.risk_level}</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedTech.description}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Standard Detail Modal */}
        {selectedStandard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStandard.name}</h2>
                <button onClick={() => setSelectedStandard(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Standard Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedStandard.standard_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedStandard.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedStandard.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Compliance Required</label><p className="mt-1">{selectedStandard.compliance_required ? 'Yes' : 'No'}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Adoption Level</label><p className="mt-1">{selectedStandard.adoption_level}%</p></div>
                    {selectedStandard.technology_name && (
                      <div><label className="text-sm font-medium text-gray-500">Related Technology</label><p className="mt-1">{selectedStandard.technology_name}</p></div>
                    )}
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedStandard.description}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
