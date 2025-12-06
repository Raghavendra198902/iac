import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Minus, Flag } from 'lucide-react';
import { projectManagerApi } from '../../../services/rolesApi';

const CreateMilestone: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliverableInput, setDeliverableInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_id: null as number | null,
    target_date: '',
    deliverables: [] as string[],
    status: 'planned' as const,
    completion_percentage: 0,
    created_by_user_id: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'completion_percentage' || name === 'project_id' 
        ? (value ? parseFloat(value) : null) 
        : value
    }));
  };

  const handleAddDeliverable = () => {
    if (deliverableInput.trim() && !formData.deliverables.includes(deliverableInput.trim())) {
      setFormData(prev => ({ ...prev, deliverables: [...prev.deliverables, deliverableInput.trim()] }));
      setDeliverableInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.target_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectManagerApi.createMilestone(formData);
      navigate('/architecture/project-manager');
    } catch (err: any) {
      setError(err.message || 'Failed to create milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Project Milestone</h1>
            <p className="text-gray-600 mt-1">Define a key project milestone with deliverables</p>
          </div>
        </div>
        <button onClick={() => navigate('/architecture/project-manager')} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Infrastructure Setup Complete" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describe what will be accomplished at this milestone" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date <span className="text-red-500">*</span></label>
              <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deliverables</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={deliverableInput} onChange={(e) => setDeliverableInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDeliverable())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add deliverable item" />
              <button type="button" onClick={handleAddDeliverable} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            {formData.deliverables.length > 0 && (
              <div className="space-y-2">
                {formData.deliverables.map((deliverable, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold">{idx + 1}</span>
                    <span className="flex-1 text-sm text-gray-800">{deliverable}</span>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, deliverables: p.deliverables.filter((_, i) => i !== idx) }))} className="text-red-600 hover:bg-red-100 p-1 rounded"><Minus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion: <span className="font-bold text-blue-600">{formData.completion_percentage}%</span>
            </label>
            <input type="range" name="completion_percentage" value={formData.completion_percentage} onChange={handleChange} min="0" max="100" step="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Milestone Best Practices:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Define clear, measurable deliverables</li>
              <li>Set realistic target dates with buffer</li>
              <li>Align milestones with project phases</li>
              <li>Review and update progress regularly</li>
              <li>Communicate milestone achievement to stakeholders</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/architecture/project-manager')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Milestone'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMilestone;
