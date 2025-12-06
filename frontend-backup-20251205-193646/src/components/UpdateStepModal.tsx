import { useState } from 'react';
import { X, Save, CheckCircle, User, FileText } from 'lucide-react';
import { API_URL } from '../config/api';

interface UpdateStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStepUpdated: () => void;
  projectId: string;
  step: {
    id: string;
    title: string;
    status: string;
    assignee: string;
    notes?: string;
  };
}

export default function UpdateStepModal({ isOpen, onClose, onStepUpdated, projectId, step }: UpdateStepModalProps) {
  const [formData, setFormData] = useState({
    status: step.status,
    assignee: step.assignee,
    notes: step.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const updateData: any = {
        status: formData.status,
        assignee: formData.assignee,
        notes: formData.notes,
      };

      // Add completedDate if marking as completed
      if (formData.status === 'completed' && step.status !== 'completed') {
        updateData.completedDate = new Date().toISOString().split('T')[0];
      }

      const response = await fetch(`${API_URL}/projects/${projectId}/steps/${step.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update step');
      }

      // Show success toast
      const statusText = formData.status === 'completed' ? 'completed' : 'updated';
      toast.success(`Step ${statusText} successfully!`);

      onStepUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error updating step:', err);
      setError(err.message);
      toast.error(`Failed to update step: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Update Workflow Step</h2>
              <p className="text-blue-100">{step.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Step Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                disabled={loading}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Assigned To <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Team member name"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Progress Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                placeholder="Add notes about progress, blockers, or next steps..."
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Document any important updates or issues
            </p>
          </div>

          {/* Status Change Info */}
          {formData.status === 'completed' && step.status !== 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                <strong>Marking as completed</strong> will automatically update the project progress and set the completion date to today.
              </p>
            </div>
          )}

          {formData.status === 'blocked' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Marking as blocked</strong> - Please add notes explaining the blocker in the Progress Notes field above.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Step
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
