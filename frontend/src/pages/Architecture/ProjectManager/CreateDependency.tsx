import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Link2 } from 'lucide-react';
import { projectManagerApi } from '../../../services/rolesApi';
import type { DependencyType } from '../../../types/roles';

const CreateDependency: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    project_id: null as number | null,
    dependent_on_project_id: null as number | null,
    dependency_type: 'blocks' as DependencyType,
    description: '',
    required_completion_date: '',
    is_critical: false,
    status: 'active' as const,
    created_by_user_id: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.project_id || !formData.dependent_on_project_id) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.project_id === formData.dependent_on_project_id) {
      setError('A project cannot depend on itself');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectManagerApi.createDependency(formData);
      navigate('/architecture/project-manager');
    } catch (err: any) {
      setError(err.message || 'Failed to create dependency');
    } finally {
      setLoading(false);
    }
  };

  const dependencyTypes: DependencyType[] = ['blocks', 'requires', 'related_to', 'depends_on'];

  const typeDescriptions = {
    blocks: 'This project is blocking another project from progressing',
    requires: 'This project requires completion of another project',
    related_to: 'This project is related to another project',
    depends_on: 'This project depends on deliverables from another project',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link2 className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Project Dependency</h1>
            <p className="text-gray-600 mt-1">Define relationships between projects</p>
          </div>
        </div>
        <button onClick={() => navigate('/architecture/project-manager')} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-purple-900 mb-2">How Dependencies Work</h3>
            <p className="text-sm text-purple-800">
              Define how projects relate to each other to track critical paths and ensure proper sequencing of work.
              Dependencies help identify bottlenecks and manage project timelines effectively.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Project ID <span className="text-red-500">*</span></label>
              <input type="number" name="project_id" value={formData.project_id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="1" min="1" required />
              <p className="text-xs text-gray-500 mt-1">The project that has the dependency</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depends On Project ID <span className="text-red-500">*</span></label>
              <input type="number" name="dependent_on_project_id" value={formData.dependent_on_project_id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="2" min="1" required />
              <p className="text-xs text-gray-500 mt-1">The project being depended upon</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dependency Type <span className="text-red-500">*</span></label>
            <select name="dependency_type" value={formData.dependency_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
              {dependencyTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1 italic">{typeDescriptions[formData.dependency_type]}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describe the nature of this dependency and what needs to be completed" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Completion Date</label>
              <input type="date" name="required_completion_date" value={formData.required_completion_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-500 mt-1">When the dependency must be resolved</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <input type="checkbox" id="is_critical" name="is_critical" checked={formData.is_critical} onChange={handleChange} className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
            <label htmlFor="is_critical" className="text-sm font-medium text-gray-900">
              <span className="text-red-600 font-bold">Critical Dependency</span> - Failure to resolve will block project completion
            </label>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Ensure both project IDs exist before creating the dependency</li>
              <li>Critical dependencies should be monitored closely</li>
              <li>Circular dependencies should be avoided</li>
              <li>Update dependency status as projects progress</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/architecture/project-manager')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Dependency'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDependency;
