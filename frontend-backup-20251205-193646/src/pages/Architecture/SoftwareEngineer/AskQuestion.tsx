import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { softwareEngineerApi } from '../../../services/rolesApi';

const AskQuestion: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    question_details: '',
    context: '',
    related_component: '',
    is_blocking: false,
    asked_by_user_id: 1,
    status: 'open' as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.question_details || !formData.context) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await softwareEngineerApi.createQuestion(formData);
      navigate('/architecture/software-engineer');
    } catch (err: any) {
      setError(err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ask Architecture Question</h1>
          <p className="text-gray-600 mt-1">Get help with architecture decisions and implementations</p>
        </div>
        <button onClick={() => navigate('/architecture/software-engineer')} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., How should we implement caching for the API?" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Details <span className="text-red-500">*</span></label>
            <textarea name="question_details" value={formData.question_details} onChange={handleChange} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Provide detailed description of your question..." required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Context <span className="text-red-500">*</span></label>
            <textarea name="context" value={formData.context} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Provide background context, what you've already tried, constraints, etc." required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Component</label>
            <input type="text" name="related_component" value={formData.related_component} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., API Gateway, Database Layer, Authentication Service" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input type="checkbox" id="is_blocking" name="is_blocking" checked={formData.is_blocking} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="is_blocking" className="text-sm font-medium text-gray-900">
              This question is blocking my work
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips for great questions:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Be specific and provide detailed context</li>
              <li>Include what you've already tried</li>
              <li>Explain any constraints or requirements</li>
              <li>Reference relevant documentation or specifications</li>
              <li>Mark as blocking if it's preventing progress</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/architecture/software-engineer')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Submitting...' : 'Ask Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion;
