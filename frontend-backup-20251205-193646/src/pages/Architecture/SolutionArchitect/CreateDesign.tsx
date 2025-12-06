import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload, Plus, Minus } from 'lucide-react';
import { solutionArchitectApi } from '../../../services/rolesApi';
import type { DesignStatus } from '../../../types/roles';

interface DesignFormData {
  title: string;
  description: string;
  business_context: string;
  technical_approach: string;
  architecture_diagram_url: string;
  technology_stack: string[];
  estimated_cost: number | null;
  estimated_timeline_weeks: number | null;
  status: DesignStatus;
  created_by_user_id: number;
}

const CreateDesign: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  
  const [formData, setFormData] = useState<DesignFormData>({
    title: '',
    description: '',
    business_context: '',
    technical_approach: '',
    architecture_diagram_url: '',
    technology_stack: [],
    estimated_cost: null,
    estimated_timeline_weeks: null,
    status: 'draft',
    created_by_user_id: 1, // TODO: Get from auth context
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimated_cost' || name === 'estimated_timeline_weeks' 
        ? value ? parseFloat(value) : null
        : value
    }));
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technology_stack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technology_stack: [...prev.technology_stack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technology_stack: prev.technology_stack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.business_context || !formData.technical_approach) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await solutionArchitectApi.createDesign(formData);
      navigate('/architecture/solution-architect');
    } catch (err: any) {
      setError(err.message || 'Failed to create design');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Solution Design</h1>
          <p className="text-gray-600 mt-1">Define a new solution architecture design</p>
        </div>
        <button
          onClick={() => navigate('/architecture/solution-architect')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Multi-Region E-Commerce Platform"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the solution design"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="implemented">Implemented</option>
                </select>
              </div>
            </div>
          </div>

          {/* Context */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business & Technical Context</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Context <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="business_context"
                  value={formData.business_context}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the business drivers, goals, and constraints"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technical Approach <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="technical_approach"
                  value={formData.technical_approach}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the technical solution, architecture patterns, and design decisions"
                  required
                />
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technology Stack</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., React, Node.js, PostgreSQL"
                />
                <button
                  type="button"
                  onClick={handleAddTechnology}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              {formData.technology_stack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.technology_stack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTechnology(tech)}
                        className="hover:text-blue-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Estimates */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost (USD)
                </label>
                <input
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 150000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Timeline (weeks)
                </label>
                <input
                  type="number"
                  name="estimated_timeline_weeks"
                  value={formData.estimated_timeline_weeks || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 16"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Architecture Diagram</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagram URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="architecture_diagram_url"
                  value={formData.architecture_diagram_url}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/diagram.png"
                />
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Upload or provide a URL to your architecture diagram
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/architecture/solution-architect')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Design'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDesign;
