import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Minus } from 'lucide-react';
import { technicalArchitectApi } from '../../../services/rolesApi';
import type { TechEvaluationRecommendation } from '../../../types/roles';

const CreateEvaluation: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriaInput, setCriteriaInput] = useState('');
  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');
  
  const [formData, setFormData] = useState({
    technology_name: '',
    version: '',
    category: '',
    evaluation_purpose: '',
    evaluation_criteria: [] as string[],
    pros: [] as string[],
    cons: [] as string[],
    recommendation: 'recommended' as TechEvaluationRecommendation,
    cost_implications: '',
    poc_required: false,
    poc_completed: false,
    poc_results: '',
    poc_repository_url: '',
    evaluated_by_user_id: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddCriteria = () => {
    if (criteriaInput.trim() && !formData.evaluation_criteria.includes(criteriaInput.trim())) {
      setFormData(prev => ({ ...prev, evaluation_criteria: [...prev.evaluation_criteria, criteriaInput.trim()] }));
      setCriteriaInput('');
    }
  };

  const handleAddPro = () => {
    if (proInput.trim() && !formData.pros.includes(proInput.trim())) {
      setFormData(prev => ({ ...prev, pros: [...prev.pros, proInput.trim()] }));
      setProInput('');
    }
  };

  const handleAddCon = () => {
    if (conInput.trim() && !formData.cons.includes(conInput.trim())) {
      setFormData(prev => ({ ...prev, cons: [...prev.cons, conInput.trim()] }));
      setConInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.technology_name || !formData.evaluation_purpose || formData.evaluation_criteria.length === 0) {
      setError('Please fill in all required fields and add at least one evaluation criterion');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await technicalArchitectApi.createEvaluation(formData);
      navigate('/architecture/technical-architect');
    } catch (err: any) {
      setError(err.message || 'Failed to create evaluation');
    } finally {
      setLoading(false);
    }
  };

  const recommendations: TechEvaluationRecommendation[] = ['strongly_recommended', 'recommended', 'conditional', 'not_recommended'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Technology Evaluation</h1>
          <p className="text-gray-600 mt-1">Evaluate new technologies and tools</p>
        </div>
        <button onClick={() => navigate('/architecture/technical-architect')} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technology Name <span className="text-red-500">*</span></label>
              <input type="text" name="technology_name" value={formData.technology_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Redis" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input type="text" name="version" value={formData.version} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 7.0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Database, Cache, Message Queue" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Purpose <span className="text-red-500">*</span></label>
            <textarea name="evaluation_purpose" value={formData.evaluation_purpose} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Why are we evaluating this technology?" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Criteria <span className="text-red-500">*</span></label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={criteriaInput} onChange={(e) => setCriteriaInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCriteria())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add evaluation criterion" />
              <button type="button" onClick={handleAddCriteria} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            {formData.evaluation_criteria.length > 0 && (
              <div className="space-y-2">
                {formData.evaluation_criteria.map((criterion, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm">{criterion}</span>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, evaluation_criteria: p.evaluation_criteria.filter((_, i) => i !== idx) }))} className="text-red-600"><Minus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-green-900 mb-2">Pros / Advantages</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={proInput} onChange={(e) => setProInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())} className="flex-1 px-3 py-2 border border-green-300 rounded-lg" placeholder="Add advantage" />
              <button type="button" onClick={handleAddPro} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" /></button>
            </div>
            {formData.pros.length > 0 && (
              <div className="space-y-2">
                {formData.pros.map((pro, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded">
                    <span className="flex-1 text-sm text-green-800">✓ {pro}</span>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, pros: p.pros.filter((_, i) => i !== idx) }))} className="text-red-600"><Minus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-red-900 mb-2">Cons / Disadvantages</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={conInput} onChange={(e) => setConInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())} className="flex-1 px-3 py-2 border border-red-300 rounded-lg" placeholder="Add disadvantage" />
              <button type="button" onClick={handleAddCon} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Plus className="w-4 h-4" /></button>
            </div>
            {formData.cons.length > 0 && (
              <div className="space-y-2">
                {formData.cons.map((con, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded">
                    <span className="flex-1 text-sm text-red-800">✗ {con}</span>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, cons: p.cons.filter((_, i) => i !== idx) }))} className="text-red-600"><Minus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
              <select name="recommendation" value={formData.recommendation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {recommendations.map(rec => (
                  <option key={rec} value={rec}>{rec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Implications</label>
              <input type="text" name="cost_implications" value={formData.cost_implications} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., $500/month" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Proof of Concept (PoC)</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="poc_required" name="poc_required" checked={formData.poc_required} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="poc_required" className="text-sm font-medium text-gray-900">PoC Required</label>
              </div>
              
              {formData.poc_required && (
                <>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="poc_completed" name="poc_completed" checked={formData.poc_completed} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <label htmlFor="poc_completed" className="text-sm font-medium text-gray-900">PoC Completed</label>
                  </div>
                  
                  {formData.poc_completed && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PoC Results</label>
                        <textarea name="poc_results" value={formData.poc_results} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PoC Repository URL</label>
                        <input type="url" name="poc_repository_url" value={formData.poc_repository_url} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" placeholder="https://github.com/..." />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/architecture/technical-architect')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Evaluation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvaluation;
