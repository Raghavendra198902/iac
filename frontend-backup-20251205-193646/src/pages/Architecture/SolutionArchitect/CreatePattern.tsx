import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Minus } from 'lucide-react';
import { solutionArchitectApi } from '../../../services/rolesApi';
import type { PatternCategory } from '../../../types/roles';

interface PatternFormData {
  pattern_name: string;
  category: PatternCategory;
  description: string;
  use_cases: string[];
  implementation_details: string;
  benefits: string[];
  trade_offs: string[];
  code_example: string;
  diagram_url: string;
  created_by_user_id: number;
}

const CreatePattern: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCaseInput, setUseCaseInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [tradeOffInput, setTradeOffInput] = useState('');
  
  const [formData, setFormData] = useState<PatternFormData>({
    pattern_name: '',
    category: 'integration',
    description: '',
    use_cases: [],
    implementation_details: '',
    benefits: [],
    trade_offs: [],
    code_example: '',
    diagram_url: '',
    created_by_user_id: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (field: 'use_cases' | 'benefits' | 'trade_offs', value: string, setter: (val: string) => void) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const handleRemoveItem = (field: 'use_cases' | 'benefits' | 'trade_offs', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pattern_name || !formData.description || !formData.implementation_details) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await solutionArchitectApi.createPattern(formData);
      navigate('/architecture/solution-architect');
    } catch (err: any) {
      setError(err.message || 'Failed to create pattern');
    } finally {
      setLoading(false);
    }
  };

  const categories: PatternCategory[] = ['integration', 'data', 'security', 'performance', 'scalability', 'resilience', 'deployment'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Solution Pattern</h1>
          <p className="text-gray-600 mt-1">Add a reusable pattern to the library</p>
        </div>
        <button
          onClick={() => navigate('/architecture/solution-architect')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pattern Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pattern_name"
                value={formData.pattern_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Event-Driven Microservices"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
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
                placeholder="Brief description of the pattern"
                required
              />
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Use Cases</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={useCaseInput}
                  onChange={(e) => setUseCaseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('use_cases', useCaseInput, setUseCaseInput))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a use case"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('use_cases', useCaseInput, setUseCaseInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.use_cases.length > 0 && (
                <div className="space-y-2">
                  {formData.use_cases.map((uc, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm">{uc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('use_cases', uc)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Implementation Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Implementation Details <span className="text-red-500">*</span>
            </label>
            <textarea
              name="implementation_details"
              value={formData.implementation_details}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Detailed implementation steps and guidelines"
              required
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('benefits', benefitInput, setBenefitInput))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a benefit"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('benefits', benefitInput, setBenefitInput)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.benefits.length > 0 && (
                <div className="space-y-2">
                  {formData.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <span className="flex-1 text-sm">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('benefits', benefit)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trade-offs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trade-offs</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tradeOffInput}
                  onChange={(e) => setTradeOffInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('trade_offs', tradeOffInput, setTradeOffInput))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a trade-off"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('trade_offs', tradeOffInput, setTradeOffInput)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.trade_offs.length > 0 && (
                <div className="space-y-2">
                  {formData.trade_offs.map((tradeOff, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <span className="flex-1 text-sm">{tradeOff}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('trade_offs', tradeOff)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code Example */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Example (Optional)
            </label>
            <textarea
              name="code_example"
              value={formData.code_example}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
              placeholder="// Example code implementation"
            />
          </div>

          {/* Diagram URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagram URL (Optional)
            </label>
            <input
              type="url"
              name="diagram_url"
              value={formData.diagram_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/pattern-diagram.png"
            />
          </div>
        </div>

        {/* Actions */}
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
            {loading ? 'Creating...' : 'Create Pattern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePattern;
