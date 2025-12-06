import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { blueprintService } from '../services/blueprintService';
import Button from '../components/ui/Button';
import type { Blueprint, Resource, CloudProvider, Environment } from '../types';
import toast from 'react-hot-toast';

export default function BlueprintEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  useEffect(() => {
    if (id) {
      loadBlueprint(id);
    }
  }, [id]);

  const loadBlueprint = async (blueprintId: string) => {
    try {
      setLoading(true);
      const data = await blueprintService.getById(blueprintId);
      setBlueprint(data);
    } catch (err) {
      console.warn('Failed to load blueprint from API, checking localStorage');
      
      // Try to load from localStorage first
      const storageKey = `blueprint_${blueprintId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsedBlueprint = JSON.parse(savedData);
          setBlueprint(parsedBlueprint);
          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Failed to parse localStorage data:', parseError);
        }
      }
      
      // No fallback mock data - show error if blueprint not found
      toast.error('Blueprint not found. Please create a blueprint first.');
      navigate('/blueprints');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!blueprint || !id) return;

    try {
      setSaving(true);
      
      try {
        await blueprintService.updateBlueprint(id, {
          name: blueprint.name,
          description: blueprint.description,
          targetCloud: blueprint.targetCloud,
          environment: blueprint.environment,
          resources: blueprint.resources,
          metadata: blueprint.metadata,
        });
        toast.success('Blueprint updated successfully');
      } catch (apiError) {
        // Backend unavailable - save to localStorage
        console.warn('Backend unavailable, saving to localStorage:', apiError);
        
        // Update local blueprint with timestamp
        const updatedBlueprint = {
          ...blueprint,
          updatedAt: new Date().toISOString(),
        };
        
        // Save to localStorage
        const storageKey = `blueprint_${id}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedBlueprint));
        
        setBlueprint(updatedBlueprint);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast.success('✓ Changes saved successfully (local storage)');
      }
      
      navigate(`/blueprints/${id}`);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update blueprint');
    } finally {
      setSaving(false);
    }
  };

  const updateBlueprint = (updates: Partial<Blueprint>) => {
    if (blueprint) {
      setBlueprint({ ...blueprint, ...updates });
    }
  };

  const addResource = () => {
    if (!blueprint) return;
    
    const newResource: Resource = {
      id: `resource-${Date.now()}`,
      type: '',
      name: '',
      quantity: 1,
      properties: {},
      estimatedCost: 0,
    };

    updateBlueprint({
      resources: [...blueprint.resources, newResource],
    });
  };

  const updateResource = (index: number, updates: Partial<Resource>) => {
    if (!blueprint) return;
    
    const updatedResources = [...blueprint.resources];
    updatedResources[index] = { ...updatedResources[index], ...updates };
    updateBlueprint({ resources: updatedResources });
  };

  const removeResource = (index: number) => {
    if (!blueprint) return;
    
    const updatedResources = blueprint.resources.filter((_, i) => i !== index);
    updateBlueprint({ resources: updatedResources });
  };

  const updateResourceProperty = (resourceIndex: number, key: string, value: string) => {
    if (!blueprint) return;
    
    const updatedResources = [...blueprint.resources];
    updatedResources[resourceIndex].properties[key] = value;
    updateBlueprint({ resources: updatedResources });
  };

  const removeResourceProperty = (resourceIndex: number, key: string) => {
    if (!blueprint) return;
    
    const updatedResources = [...blueprint.resources];
    delete updatedResources[resourceIndex].properties[key];
    updateBlueprint({ resources: updatedResources });
  };

  const addResourceProperty = (resourceIndex: number) => {
    if (!blueprint) return;
    
    const key = prompt('Enter property name:');
    if (!key) return;
    
    updateResourceProperty(resourceIndex, key, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading blueprint...</p>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate('/blueprints')} className="btn-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blueprints
        </Button>
        <div className="card bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
          <div className="flex items-center gap-2 text-danger-700 dark:text-danger-400">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Blueprint not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Blueprint</h1>
            <p className="text-gray-600 dark:text-gray-300">Modify your infrastructure blueprint</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(`/blueprints/${id}`)} className="btn-secondary">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label dark:text-gray-300">Blueprint Name</label>
            <input
              type="text"
              value={blueprint.name}
              onChange={(e) => updateBlueprint({ name: e.target.value })}
              className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="Enter blueprint name"
            />
          </div>
          <div>
            <label className="label dark:text-gray-300">Version</label>
            <input
              type="text"
              value={blueprint.version}
              onChange={(e) => updateBlueprint({ version: e.target.value })}
              className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="1.0.0"
            />
          </div>
          <div>
            <label htmlFor="cloud-provider" className="label dark:text-gray-300">Cloud Provider</label>
            <select
              id="cloud-provider"
              value={blueprint.targetCloud}
              onChange={(e) => updateBlueprint({ targetCloud: e.target.value as CloudProvider })}
              className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
              <option value="on-premise">On-Premise / Data Center</option>
            </select>
          </div>
          <div>
            <label htmlFor="environment" className="label dark:text-gray-300">Environment</label>
            <select
              id="environment"
              value={blueprint.environment}
              onChange={(e) => updateBlueprint({ environment: e.target.value as Environment })}
              className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label dark:text-gray-300">Description</label>
            <textarea
              value={blueprint.description}
              onChange={(e) => updateBlueprint({ description: e.target.value })}
              rows={3}
              className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="Describe your infrastructure blueprint"
            />
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Resources ({blueprint.resources.length})
          </h2>
          <Button onClick={addResource} className="btn-primary btn-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>

        <div className="space-y-4">
          {blueprint.resources.map((resource, index) => (
            <div key={resource.id || index} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Resource #{index + 1}</h3>
                <Button
                  onClick={() => removeResource(index)}
                  className="btn-danger btn-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="label text-sm dark:text-gray-300">Resource Type</label>
                  <input
                    type="text"
                    value={resource.type}
                    onChange={(e) => updateResource(index, { type: e.target.value })}
                    className="input input-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder="e.g., vpc, ec2, rds"
                  />
                </div>
                <div>
                  <label className="label text-sm dark:text-gray-300">Resource Name</label>
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => updateResource(index, { name: e.target.value })}
                    className="input input-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder="e.g., main-vpc"
                  />
                </div>
                <div>
                  <label className="label text-sm dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    value={resource.quantity || 1}
                    onChange={(e) => updateResource(index, { quantity: parseInt(e.target.value) || 1 })}
                    className="input input-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="label text-sm dark:text-gray-300">SKU (Optional)</label>
                  <input
                    type="text"
                    value={resource.sku || ''}
                    onChange={(e) => updateResource(index, { sku: e.target.value })}
                    className="input input-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder="e.g., t3.medium"
                  />
                </div>
                <div>
                  <label className="label text-sm dark:text-gray-300">Estimated Cost ($/month)</label>
                  <input
                    type="number"
                    value={resource.estimatedCost || 0}
                    onChange={(e) => updateResource(index, { estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="input input-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Properties */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="label text-sm dark:text-gray-300">Properties</label>
                  <button
                    onClick={() => addResourceProperty(index)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    + Add Property
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(resource.properties).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        disabled
                        title="Property key"
                        className="input input-sm w-1/3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                      <input
                        type="text"
                        value={typeof value === 'string' ? value : JSON.stringify(value)}
                        onChange={(e) => updateResourceProperty(index, key, e.target.value)}
                        title={`Value for ${key}`}
                        className="input input-sm flex-1 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        placeholder="Property value"
                      />
                      <button
                        onClick={() => removeResourceProperty(index, key)}
                        title={`Remove ${key} property`}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {Object.keys(resource.properties).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No properties defined</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {blueprint.resources.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No resources added yet</p>
              <p className="text-sm mt-1">Click "Add Resource" to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 sticky bottom-4">
        <Button onClick={() => navigate(`/blueprints/${id}`)} className="btn-secondary">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
