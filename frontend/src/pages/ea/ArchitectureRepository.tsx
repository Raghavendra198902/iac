import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Box, X, Plus, Edit, Sparkles, Save, Trash2, FileCheck, Network, Eye, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import LLDDocumentEditor from '../../components/LLDDocumentEditor';
import SADocumentEditor from '../../components/SADocumentEditor';
import TADocumentEditor from '../../components/TADocumentEditor';
import DiagramGenerator from '../../components/DiagramGenerator';
import { API_URL } from '../../config/api';

interface Artifact {
  id?: string;
  name: string;
  description: string;
  artifact_type: string;
  category: string;
  version: string;
  status: string;
  owner: string;
  file_path: string;
  file_size_kb: number;
  last_modified?: string;
  tags: string;
  related_domains: string;
  notes: string;
  document_content?: any;
}

interface Model {
  id?: string;
  name: string;
  description: string;
  model_type: string;
  notation: string;
  owner: string;
  status: string;
  last_updated?: string;
  complexity: string;
  stakeholders: string;
  related_artifacts: string;
  notes: string;
}

const ARTIFACT_TYPES = ['Document', 'Model', 'Template', 'Catalog', 'Blueprint'];
const CATEGORIES = ['Strategy', 'Business', 'Application', 'Data', 'Integration', 'Technology', 'Security'];
const STATUSES = ['Draft', 'In Review', 'Published', 'Current', 'Archived'];
const MODEL_TYPES = ['Data Model', 'Process Model', 'Integration Model', 'Component Model', 'Deployment Model'];
const NOTATIONS = ['UML', 'BPMN', 'ArchiMate', 'C4', 'Custom'];
const COMPLEXITY_LEVELS = ['Low', 'Medium', 'High', 'Very High'];

export default function ArchitectureRepository() {
  const { user } = useAuth();
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown User';
  
  const [searchParams] = useSearchParams();
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
  const [showLLDEditor, setShowLLDEditor] = useState(false);
  const [showSAEditor, setShowSAEditor] = useState(false);
  const [showTAEditor, setShowTAEditor] = useState(false);
  const [showDiagramGenerator, setShowDiagramGenerator] = useState(false);
  const [selectedDocForDiagram, setSelectedDocForDiagram] = useState<any>(null);
  const [diagramDocType, setDiagramDocType] = useState<'LLD' | 'SA'>('LLD');

  const [newArtifact, setNewArtifact] = useState<Artifact>({
    name: '',
    description: '',
    artifact_type: 'Document',
    category: 'Strategy',
    version: '1.0',
    status: 'Draft',
    owner: userName,
    file_path: '',
    file_size_kb: 0,
    tags: '',
    related_domains: '',
    notes: ''
  });

  const [newModel, setNewModel] = useState<Model>({
    name: '',
    description: '',
    model_type: 'Data Model',
    notation: 'UML',
    owner: userName,
    status: 'Draft',
    complexity: 'Medium',
    stakeholders: '',
    related_artifacts: '',
    notes: ''
  });

  useEffect(() => {
    fetchAllData();
    
    // Auto-open modal based on query parameter
    const docType = searchParams.get('doc');
    if (docType === 'sa') {
      setShowLLDEditor(false);
      setShowTAEditor(false);
      setShowCreateArtifact(false);
      setShowSAEditor(true);
    } else if (docType === 'ta') {
      setShowLLDEditor(false);
      setShowSAEditor(false);
      setShowCreateArtifact(false);
      setShowTAEditor(true);
    } else if (docType === 'lld') {
      setShowSAEditor(false);
      setShowTAEditor(false);
      setShowCreateArtifact(false);
      setShowLLDEditor(true);
    }
  }, [searchParams]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [artifactsRes, modelsRes] = await Promise.all([
        fetch(API_URL + '/repository/artifacts'),
        fetch(API_URL + '/repository/models')
      ]);

      if (artifactsRes.ok) setArtifacts(await artifactsRes.json());
      if (modelsRes.ok) setModels(await modelsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async (description: string) => {
    if (!description || description.length < 10) {
      toast.error('Please provide a detailed description for AI assistance');
      return;
    }

    setGeneratingAI(true);
    try {
      const response = await fetch(API_URL + '/repository/artifacts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description,
          artifact_type: newArtifact.artifact_type,
          category: newArtifact.category
        })
      });

      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions(suggestions);
        toast.success('AI suggestions generated!');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setGeneratingAI(false);
    }
  };

  const applyAISuggestions = () => {
    if (aiSuggestions) {
      setNewArtifact(prev => ({
        ...prev,
        name: aiSuggestions.name || prev.name,
        artifact_type: aiSuggestions.recommended_type || prev.artifact_type,
        category: aiSuggestions.recommended_category || prev.category,
        tags: aiSuggestions.tags || prev.tags,
        related_domains: aiSuggestions.related_domains || prev.related_domains,
        notes: aiSuggestions.notes || prev.notes
      }));
      toast.success('AI suggestions applied!');
      setAiSuggestions(null);
    }
  };

  const createArtifact = async () => {
    if (!newArtifact.name || !newArtifact.description) {
      toast.error('Name and description are required');
      return;
    }

    try {
      const response = await fetch(API_URL + '/repository/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArtifact)
      });

      if (response.ok) {
        toast.success('HLD Artifact created successfully!');
        setShowCreateArtifact(false);
        fetchAllData();
        resetNewArtifact();
      }
    } catch (error) {
      console.error('Error creating artifact:', error);
      toast.error('Failed to create artifact');
    }
  };

  const saveSADocument = async (saDocument: any) => {
    try {
      const artifact = {
        name: saDocument.documentTitle,
        description: saDocument.systemContext,
        artifact_type: 'Document',
        category: 'Strategy',
        version: saDocument.documentVersion,
        status: 'Draft',
        owner: saDocument.architect || 'System',
        file_path: '',
        file_size_kb: 0,
        tags: 'solution-architecture,sa,microservices',
        related_domains: 'Enterprise',
        notes: 'Solution Architecture document with 20 comprehensive sections',
        document_content: saDocument,
        executive_summary: saDocument.systemContext,
        technical_details: {
          microservices: saDocument.microservices,
          deployment: saDocument.deploymentModel,
          security: saDocument.authenticationMechanism
        },
        document_references: saDocument.references.join('\n')
      };

      const response = await fetch(API_URL + '/repository/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artifact)
      });

      if (!response.ok) throw new Error('Failed to save SA document');

      toast.success('SA document saved successfully!');
      setShowSAEditor(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving SA:', error);
      toast.error('Failed to save SA document');
    }
  };

  const saveTADocument = async (taDocument: any) => {
    try {
      const artifact = {
        name: taDocument.documentTitle,
        description: `Technical Architecture for ${taDocument.systemName}`,
        artifact_type: 'Document',
        category: 'Strategy',
        version: taDocument.documentVersion,
        status: 'Draft',
        owner: taDocument.architect || 'Technical Architect',
        file_path: '',
        file_size_kb: 0,
        tags: 'technical-architecture,ta,implementation',
        related_domains: 'Enterprise',
        notes: 'Technical Architecture document with 20 detailed sections',
        document_content: taDocument,
        executive_summary: `Technical architecture for ${taDocument.systemName} covering components, APIs, database, security, and deployment`,
        technical_details: {
          components: taDocument.components,
          techStack: taDocument.techStack,
          security: taDocument.securityHardening
        },
        document_references: taDocument.references.join('\n')
      };

      const response = await fetch(API_URL + '/repository/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artifact)
      });

      if (!response.ok) throw new Error('Failed to save TA document');

      toast.success('TA document saved successfully!');
      setShowTAEditor(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving TA:', error);
      toast.error('Failed to save TA document');
    }
  };

  const saveLLDDocument = async (lldDocument: any) => {
    try {
      const artifact = {
        name: lldDocument.documentTitle,
        description: lldDocument.executiveSummary || lldDocument.businessContext,
        artifact_type: 'Document',
        category: 'Strategy',
        version: lldDocument.documentVersion,
        status: 'Draft',
        owner: lldDocument.author,
        tags: 'LLD, Architecture, Design Document',
        related_domains: 'Enterprise Architecture',
        notes: `Created: ${lldDocument.documentDate}`,
        document_content: lldDocument,
        executive_summary: lldDocument.executiveSummary,
        technical_details: {
          architecture: lldDocument.architecturalStyle,
          technologyStack: lldDocument.technologyStack,
          components: lldDocument.components
        },
        document_references: lldDocument.references.join('\n')
      };

      const response = await fetch(API_URL + '/repository/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artifact)
      });

      if (response.ok) {
        toast.success('Detailed LLD Document created successfully!');
        setShowLLDEditor(false);
        fetchAllData();
      } else {
        toast.error('Failed to save LLD document');
      }
    } catch (error) {
      console.error('Error saving LLD:', error);
      toast.error('Failed to save LLD document');
    }
  };

  const updateArtifact = async () => {
    if (!editingArtifact?.id) return;

    try {
      const response = await fetch(`${API_URL}/repository/artifacts/${editingArtifact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingArtifact)
      });

      if (response.ok) {
        toast.success('Artifact updated successfully!');
        setEditingArtifact(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error updating artifact:', error);
      toast.error('Failed to update artifact');
    }
  };

  const deleteArtifact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artifact?')) return;

    try {
      const response = await fetch(`${API_URL}/repository/artifacts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Artifact deleted successfully!');
        setSelectedArtifact(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error deleting artifact:', error);
      toast.error('Failed to delete artifact');
    }
  };

  const createModel = async () => {
    if (!newModel.name || !newModel.description) {
      toast.error('Name and description are required');
      return;
    }

    try {
      const response = await fetch(API_URL + '/repository/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModel)
      });

      if (response.ok) {
        toast.success('Model created successfully!');
        setShowCreateModel(false);
        fetchAllData();
        resetNewModel();
      }
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Failed to create model');
    }
  };

  const updateModel = async () => {
    if (!editingModel?.id) return;

    try {
      const response = await fetch(`${API_URL}/repository/models/${editingModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingModel)
      });

      if (response.ok) {
        toast.success('Model updated successfully!');
        setEditingModel(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model');
    }
  };

  const deleteModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await fetch(`${API_URL}/repository/models/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Model deleted successfully!');
        setSelectedModel(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model');
    }
  };

  const resetNewArtifact = () => {
    setNewArtifact({
      name: '',
      description: '',
      artifact_type: 'Document',
      category: 'Strategy',
      version: '1.0',
      status: 'Draft',
      owner: 'Current User',
      file_path: '',
      file_size_kb: 0,
      tags: '',
      related_domains: '',
      notes: ''
    });
    setAiSuggestions(null);
  };

  const resetNewModel = () => {
    setNewModel({
      name: '',
      description: '',
      model_type: 'Data Model',
      notation: 'UML',
      owner: 'Current User',
      status: 'Draft',
      complexity: 'Medium',
      stakeholders: '',
      related_artifacts: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'current': return 'text-blue-600 bg-blue-50';
      case 'in review': return 'text-orange-600 bg-orange-50';
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Architecture Repository</h1>
            <p className="text-gray-600">Create and manage HLD artifacts and models with AI assistance</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'artifacts' && (
              <>
                <button
                  onClick={() => {
                    setShowLLDEditor(false);
                    setShowTAEditor(false);
                    setShowCreateArtifact(false);
                    setShowSAEditor(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md"
                >
                  <Network className="w-5 h-5" />
                  Create SA Document
                </button>
                <button
                  onClick={() => {
                    setShowLLDEditor(false);
                    setShowSAEditor(false);
                    setShowCreateArtifact(false);
                    setShowTAEditor(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors shadow-md"
                >
                  <FileCode className="w-5 h-5" />
                  Create TA Document
                </button>
                <button
                  onClick={() => {
                    setShowSAEditor(false);
                    setShowTAEditor(false);
                    setShowCreateArtifact(false);
                    setShowLLDEditor(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors shadow-md"
                >
                  <FileCheck className="w-5 h-5" />
                  Create Detailed LLD
                </button>
                <button
                  onClick={() => {
                    setShowSAEditor(false);
                    setShowTAEditor(false);
                    setShowLLDEditor(false);
                    setShowCreateArtifact(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Quick Create
                </button>
              </>
            )}
            {activeTab === 'models' && (
              <button
                onClick={() => setShowCreateModel(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Model
              </button>
            )}
          </div>
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

        {/* Artifacts Grid */}
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Models Grid */}
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Artifact Modal */}
        {showCreateArtifact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New HLD Artifact</h2>
                <button onClick={() => { setShowCreateArtifact(false); resetNewArtifact(); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* AI Assistance Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">AI-Assisted HLD Generation</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Describe your architecture document and get AI-powered suggestions</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateAISuggestions(newArtifact.description)}
                      disabled={generatingAI || !newArtifact.description}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {generatingAI ? 'Generating...' : 'Generate AI Suggestions'}
                      <Sparkles className="w-4 h-4" />
                    </button>
                    {aiSuggestions && (
                      <button
                        onClick={applyAISuggestions}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Apply Suggestions
                      </button>
                    )}
                  </div>
                  {aiSuggestions && (
                    <div className="mt-3 p-3 bg-white rounded border border-purple-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">AI Suggestions:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Name: {aiSuggestions.name}</li>
                        <li>• Type: {aiSuggestions.recommended_type}</li>
                        <li>• Category: {aiSuggestions.recommended_category}</li>
                        <li>• Tags: {aiSuggestions.tags}</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newArtifact.name}
                      onChange={(e) => setNewArtifact({ ...newArtifact, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Cloud Migration Strategy HLD"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={newArtifact.description}
                      onChange={(e) => setNewArtifact({ ...newArtifact, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe the architecture document in detail..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artifact Type</label>
                    <select
                      value={newArtifact.artifact_type}
                      onChange={(e) => setNewArtifact({ ...newArtifact, artifact_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {ARTIFACT_TYPES.map(type => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newArtifact.category}
                      onChange={(e) => setNewArtifact({ ...newArtifact, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      value={newArtifact.version}
                      onChange={(e) => setNewArtifact({ ...newArtifact, version: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newArtifact.status}
                      onChange={(e) => setNewArtifact({ ...newArtifact, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {STATUSES.map(status => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <input
                      type="text"
                      value={newArtifact.owner}
                      onChange={(e) => setNewArtifact({ ...newArtifact, owner: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      value={newArtifact.tags}
                      onChange={(e) => setNewArtifact({ ...newArtifact, tags: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="cloud, migration, strategy"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Domains</label>
                    <input
                      type="text"
                      value={newArtifact.related_domains}
                      onChange={(e) => setNewArtifact({ ...newArtifact, related_domains: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Business, Technology, Data"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newArtifact.notes}
                      onChange={(e) => setNewArtifact({ ...newArtifact, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => { setShowCreateArtifact(false); resetNewArtifact(); }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createArtifact}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Create Artifact
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Model Modal - Similar structure */}
        {showCreateModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Model</h2>
                <button onClick={() => { setShowCreateModel(false); resetNewModel(); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newModel.name}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Enterprise Data Model"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={newModel.description}
                      onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Type</label>
                    <select
                      value={newModel.model_type}
                      onChange={(e) => setNewModel({ ...newModel, model_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {MODEL_TYPES.map(type => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notation</label>
                    <select
                      value={newModel.notation}
                      onChange={(e) => setNewModel({ ...newModel, notation: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {NOTATIONS.map(notation => <option key={notation}>{notation}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newModel.status}
                      onChange={(e) => setNewModel({ ...newModel, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {STATUSES.map(status => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                    <select
                      value={newModel.complexity}
                      onChange={(e) => setNewModel({ ...newModel, complexity: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {COMPLEXITY_LEVELS.map(level => <option key={level}>{level}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <input
                      type="text"
                      value={newModel.owner}
                      onChange={(e) => setNewModel({ ...newModel, owner: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholders</label>
                    <input
                      type="text"
                      value={newModel.stakeholders}
                      onChange={(e) => setNewModel({ ...newModel, stakeholders: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="CTO, VP Engineering"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => { setShowCreateModel(false); resetNewModel(); }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createModel}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Create Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View/Edit Artifact Modal */}
        {selectedArtifact && !editingArtifact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedArtifact.name}</h2>
                <div className="flex items-center gap-2">
                  {selectedArtifact.document_content && (
                    <button
                      onClick={() => {
                        setSelectedDocForDiagram(selectedArtifact.document_content);
                        // Detect document type from content structure
                        const content = selectedArtifact.document_content;
                        if (content.microservices || content.apiArchitecture) {
                          setDiagramDocType('SA');
                        } else if (content.components || content.interfaces) {
                          setDiagramDocType('LLD');
                        }
                        setShowDiagramGenerator(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="View Diagrams"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingArtifact(selectedArtifact)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteArtifact(selectedArtifact.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedArtifact(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
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
                    <div><label className="text-sm font-medium text-gray-500">Last Modified</label><p className="mt-1">{new Date(selectedArtifact.last_modified!).toLocaleDateString()}</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedArtifact.description}</p></div>
                {selectedArtifact.tags && (
                  <div><h3 className="text-lg font-semibold mb-3">Tags</h3><p>{selectedArtifact.tags}</p></div>
                )}
                {selectedArtifact.related_domains && (
                  <div><h3 className="text-lg font-semibold mb-3">Related Domains</h3><p>{selectedArtifact.related_domains}</p></div>
                )}
                {selectedArtifact.notes && (
                  <div><h3 className="text-lg font-semibold mb-3">Notes</h3><p className="text-gray-600">{selectedArtifact.notes}</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View/Edit Model Modal - Similar structure */}
        {selectedModel && !editingModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedModel.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingModel(selectedModel)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteModel(selectedModel.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedModel(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
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
                    <div><label className="text-sm font-medium text-gray-500">Last Updated</label><p className="mt-1">{new Date(selectedModel.last_updated!).toLocaleDateString()}</p></div>
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

        {/* Diagram Generator Modal */}
        {showDiagramGenerator && selectedDocForDiagram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
              <DiagramGenerator
                document={selectedDocForDiagram}
                documentType={diagramDocType}
                onClose={() => {
                  setShowDiagramGenerator(false);
                  setSelectedDocForDiagram(null);
                }}
              />
            </div>
          </div>
        )}

        {/* SA Document Editor Modal */}
        {showSAEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
              <SADocumentEditor
                onSave={saveSADocument}
                onCancel={() => setShowSAEditor(false)}
              />
            </div>
          </div>
        )}

        {/* TA Document Editor Modal */}
        {showTAEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
              <TADocumentEditor
                onSave={saveTADocument}
                onCancel={() => setShowTAEditor(false)}
              />
            </div>
          </div>
        )}

        {/* LLD Document Editor Modal */}
        {showLLDEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
              <LLDDocumentEditor
                onSave={saveLLDDocument}
                onCancel={() => setShowLLDEditor(false)}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
