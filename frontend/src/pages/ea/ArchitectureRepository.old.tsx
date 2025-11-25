import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { FileText, Box, X, Plus, Edit, Sparkles, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Artifact {
  id: string;
  name: string;
  description: string;
  artifact_type: string;
  category: string;
  version: string;
  status: string;
  owner: string;
  file_path: string;
  file_size_kb: number;
  last_modified: string;
  tags: string;
  related_domains: string;
  notes: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  model_type: string;
  notation: string;
  owner: string;
  status: string;
  last_updated: string;
  complexity: string;
  stakeholders: string;
  related_artifacts: string;
  notes: string;
}

export default function ArchitectureRepository() {
  const [activeTab, setActiveTab] = useState<'artifacts' | 'models'>('artifacts');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateArtifact, setShowCreateArtifact] = useState(false);
  const [showCreateModel, setShowCreateModel] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [artifactsRes, modelsRes] = await Promise.all([
        fetch('http://localhost:3001/api/repository/artifacts'),
        fetch('http://localhost:3001/api/repository/models')
      ]);

      if (artifactsRes.ok) setArtifacts(await artifactsRes.json());
      if (modelsRes.ok) setModels(await modelsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'current': return 'text-blue-600 bg-blue-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Architecture Repository</h1>
          <p className="text-gray-600">Manage artifacts and models</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('artifacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'artifacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Artifacts ({artifacts.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'models' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5" />
                Models ({models.length})
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'artifacts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                onDoubleClick={() => setSelectedArtifact(artifact)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{artifact.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(artifact.status)}`}>
                      {artifact.status}
                    </span>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{artifact.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">{artifact.artifact_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{artifact.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-medium text-gray-900">{artifact.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium text-gray-900">{artifact.file_size_kb} KB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'models' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                onDoubleClick={() => setSelectedModel(model)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{model.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                      {model.status}
                    </span>
                  </div>
                  <Box className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{model.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">{model.model_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notation:</span>
                    <span className="font-medium text-gray-900">{model.notation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Complexity:</span>
                    <span className="font-medium text-gray-900">{model.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Owner:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{model.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Artifact Detail Modal */}
        {selectedArtifact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedArtifact.name}</h2>
                <button onClick={() => setSelectedArtifact(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Artifact Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedArtifact.artifact_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedArtifact.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Version</label><p className="mt-1">{selectedArtifact.version}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedArtifact.status)}`}>{selectedArtifact.status}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedArtifact.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">File Size</label><p className="mt-1">{selectedArtifact.file_size_kb} KB</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Last Modified</label><p className="mt-1">{new Date(selectedArtifact.last_modified).toLocaleDateString()}</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedArtifact.description}</p></div>
                {selectedArtifact.tags && (
                  <div><h3 className="text-lg font-semibold mb-3">Tags</h3><p>{selectedArtifact.tags}</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Model Detail Modal */}
        {selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedModel.name}</h2>
                <button onClick={() => setSelectedModel(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Model Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedModel.model_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Notation</label><p className="mt-1">{selectedModel.notation}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedModel.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedModel.status)}`}>{selectedModel.status}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Complexity</label><p className="mt-1">{selectedModel.complexity}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Last Updated</label><p className="mt-1">{new Date(selectedModel.last_updated).toLocaleDateString()}</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedModel.description}</p></div>
                {selectedModel.stakeholders && (
                  <div><h3 className="text-lg font-semibold mb-3">Stakeholders</h3><p>{selectedModel.stakeholders}</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
