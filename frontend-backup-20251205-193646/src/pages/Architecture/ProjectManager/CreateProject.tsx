import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Minus } from 'lucide-react';
import { projectManagerApi } from '../../../services/rolesApi';
import type { ProjectType, ProjectHealthStatus } from '../../../types/roles';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stakeholderInput, setStakeholderInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'new_development' as ProjectType,
    solution_design_id: null as number | null,
    start_date: '',
    planned_end_date: '',
    total_budget: null as number | null,
    health_status: 'green' as ProjectHealthStatus,
    status: 'planning' as const,
    stakeholders: [] as string[],
    project_manager_user_id: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_budget' ? (value ? parseFloat(value) : null) : value
    }));
  };

  const handleAddStakeholder = () => {
    if (stakeholderInput.trim() && !formData.stakeholders.includes(stakeholderInput.trim())) {
      setFormData(prev => ({ ...prev, stakeholders: [...prev.stakeholders, stakeholderInput.trim()] }));
      setStakeholderInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.start_date || !formData.planned_end_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectManagerApi.createProject(formData);
      navigate('/architecture/project-manager');
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const projectTypes: ProjectType[] = ['new_development', 'modernization', 'migration', 'integration', 'optimization', 'poc'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Architecture Project</h1>
          <p className="text-gray-600 mt-1">Define a new architecture implementation project</p>
        </div>
        <button onClick={() => navigate('/architecture/project-manager')} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Cloud Migration Phase 1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type <span className="text-red-500">*</span></label>
                <select name="project_type" value={formData.project_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {projectTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (USD)</label>
                <input type="number" name="total_budget" value={formData.total_budget || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="500000" min="0" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned End Date <span className="text-red-500">*</span></label>
              <input type="date" name="planned_end_date" value={formData.planned_end_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
              <select name="health_status" value={formData.health_status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="green">Green - On Track</option>
                <option value="yellow">Yellow - Needs Attention</option>
                <option value="red">Red - Critical Issues</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stakeholders</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={stakeholderInput} onChange={(e) => setStakeholderInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStakeholder())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add stakeholder name" />
              <button type="button" onClick={handleAddStakeholder} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            {formData.stakeholders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.stakeholders.map((stakeholder) => (
                  <span key={stakeholder} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {stakeholder}
                    <button type="button" onClick={() => setFormData(p => ({ ...p, stakeholders: p.stakeholders.filter(s => s !== stakeholder) }))}><Minus className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/architecture/project-manager')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
