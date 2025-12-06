import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Minus, AlertTriangle } from 'lucide-react';
import { technicalArchitectApi } from '../../../services/rolesApi';
import type { ArchDebtSeverity } from '../../../types/roles';

const CreateDebt: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemInput, setSystemInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    affected_systems: [] as string[],
    severity: 'medium' as ArchDebtSeverity,
    impact_description: '',
    proposed_resolution: '',
    estimated_effort_days: null as number | null,
    maintenance_cost_monthly: null as number | null,
    priority_score: 50,
    status: 'identified' as const,
    identified_by_user_id: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimated_effort_days' || name === 'maintenance_cost_monthly' || name === 'priority_score' 
        ? (value ? parseFloat(value) : null) 
        : value
    }));
  };

  const handleAddSystem = () => {
    if (systemInput.trim() && !formData.affected_systems.includes(systemInput.trim())) {
      setFormData(prev => ({ ...prev, affected_systems: [...prev.affected_systems, systemInput.trim()] }));
      setSystemInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.impact_description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await technicalArchitectApi.createDebt(formData);
      navigate('/architecture/technical-architect');
    } catch (err: any) {
      setError(err.message || 'Failed to create architecture debt');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    critical: 'bg-red-100 border-red-300 text-red-800',
    high: 'bg-orange-100 border-orange-300 text-orange-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-blue-100 border-blue-300 text-blue-800',
  };

  const severities: ArchDebtSeverity[] = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Architecture Debt</h1>
            <p className="text-gray-600 mt-1">Document technical debt and improvement opportunities</p>
          </div>
        </div>
        <button onClick={() => navigate('/architecture/technical-architect')} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Legacy authentication system" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Detailed description of the architecture debt" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affected Systems</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={systemInput} onChange={(e) => setSystemInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSystem())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add affected system or component" />
              <button type="button" onClick={handleAddSystem} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            {formData.affected_systems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.affected_systems.map((system) => (
                  <span key={system} className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {system}
                    <button type="button" onClick={() => setFormData(p => ({ ...p, affected_systems: p.affected_systems.filter(s => s !== system) }))}><Minus className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-4 gap-3">
              {severities.map(sev => (
                <button key={sev} type="button" onClick={() => setFormData(p => ({ ...p, severity: sev }))} className={`px-4 py-3 border-2 rounded-lg font-semibold text-sm transition-all ${formData.severity === sev ? severityColors[sev] : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {sev.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Impact Description <span className="text-red-500">*</span></label>
            <textarea name="impact_description" value={formData.impact_description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describe the impact on the system, team, or business" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Resolution</label>
            <textarea name="proposed_resolution" value={formData.proposed_resolution} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="How can this debt be addressed?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Effort (Days)</label>
              <input type="number" name="estimated_effort_days" value={formData.estimated_effort_days || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="15" min="0" step="0.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Cost (USD/month)</label>
              <input type="number" name="maintenance_cost_monthly" value={formData.maintenance_cost_monthly || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="1000" min="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Score: <span className="font-bold text-blue-600">{formData.priority_score}</span> / 100
            </label>
            <input type="range" name="priority_score" value={formData.priority_score} onChange={handleChange} min="1" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Priority</span>
              <span>High Priority</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="identified">Identified</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="accepted">Accepted (Won't Fix)</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/architecture/technical-architect')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Report Debt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDebt;
