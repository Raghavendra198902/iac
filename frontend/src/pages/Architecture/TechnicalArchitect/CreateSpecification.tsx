import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Minus } from 'lucide-react';
import { technicalArchitectApi } from '../../../services/rolesApi';

const CreateSpecification: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [integrationInput, setIntegrationInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    solution_design_id: null as number | null,
    technology_stack: [] as string[],
    architecture_details: '',
    integration_points: [] as string[],
    security_requirements: '',
    performance_requirements: '',
    scalability_considerations: '',
    monitoring_strategy: '',
    deployment_strategy: '',
    status: 'draft' as const,
    created_by_user_id: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => {
    if (techInput.trim() && !formData.technology_stack.includes(techInput.trim())) {
      setFormData(prev => ({ ...prev, technology_stack: [...prev.technology_stack, techInput.trim()] }));
      setTechInput('');
    }
  };

  const handleAddIntegration = () => {
    if (integrationInput.trim() && !formData.integration_points.includes(integrationInput.trim())) {
      setFormData(prev => ({ ...prev, integration_points: [...prev.integration_points, integrationInput.trim()] }));
      setIntegrationInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.architecture_details) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await technicalArchitectApi.createSpecification(formData);
      navigate('/architecture/technical-architect');
    } catch (err: any) {
      setError(err.message || 'Failed to create specification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Technical Specification</h1>
          <p className="text-gray-600 mt-1">Define technical implementation details</p>
        </div>
        <button onClick={() => navigate('/architecture/technical-architect')} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., API Gateway Technical Specification" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="implemented">Implemented</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technology Stack</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add technology" />
              <button type="button" onClick={handleAddTech} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technology_stack.map((tech) => (
                <span key={tech} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {tech}
                  <button type="button" onClick={() => setFormData(p => ({ ...p, technology_stack: p.technology_stack.filter(t => t !== tech) }))}><Minus className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Architecture Details <span className="text-red-500">*</span></label>
            <textarea name="architecture_details" value={formData.architecture_details} onChange={handleChange} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Integration Points</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={integrationInput} onChange={(e) => setIntegrationInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIntegration())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
              <button type="button" onClick={handleAddIntegration} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            {formData.integration_points.length > 0 && (
              <div className="space-y-2">
                {formData.integration_points.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm">{point}</span>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, integration_points: p.integration_points.filter((_, i) => i !== idx) }))} className="text-red-600"><Minus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Requirements</label>
              <textarea name="security_requirements" value={formData.security_requirements} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Performance Requirements</label>
              <textarea name="performance_requirements" value={formData.performance_requirements} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scalability Considerations</label>
              <textarea name="scalability_considerations" value={formData.scalability_considerations} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Strategy</label>
              <textarea name="monitoring_strategy" value={formData.monitoring_strategy} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deployment Strategy</label>
              <textarea name="deployment_strategy" value={formData.deployment_strategy} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/architecture/technical-architect')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Specification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSpecification;
