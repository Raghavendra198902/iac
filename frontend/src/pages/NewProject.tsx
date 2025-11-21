import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Globe,
  Brain,
  Target,
  Clock,
  Rocket
} from 'lucide-react';
import { CloudProviderSelector } from '../components/CloudProviderSelector';
import FadeIn from '../components/ui/FadeIn';
import toast from 'react-hot-toast';

const NewProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    team: '',
    status: 'planning',
    priority: 'medium',
    cloudProvider: 'aws',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Valid budget amount is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Creating project...');

      // TODO: Submit to API
      console.log('Creating project:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Project created successfully!', { id: loadingToast });
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to create project. Please try again.');
      console.error('Error creating project:', error);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.description || formData.budget) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/projects');
      }
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <FadeIn>
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Rocket className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Create New Project</h1>
                <p className="text-primary-100 text-lg">
                  Launch your next infrastructure project with AI-powered insights
                </p>
              </div>
            </div>
            <Link
              to="/projects"
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/20 inline-flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Back</span>
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="text-sm">AI Recommendations</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Security Guardrails</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Cost Optimization</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Auto-Deploy</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Progress Steps */}
        <FadeIn delay={100}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border-2 border-primary-500">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">1</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Basic Information</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Project details</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                  <span className="text-sm font-bold text-gray-400">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Budget & Timeline</p>
                  <p className="text-xs text-gray-400">Financial planning</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                  <span className="text-sm font-bold text-gray-400">3</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Team Setup</p>
                  <p className="text-xs text-gray-400">Collaborators</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Basic Information */}
        <FadeIn delay={150}>
          <div className="card p-6 space-y-4 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Core project configuration</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">STEP 1</span>
              </div>
            </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Project Name *
            </label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input w-full pl-12 h-12 text-base rounded-xl border-2 focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., Cloud Migration Phase 1"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`input w-full text-base rounded-xl border-2 focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe the project objectives, scope, and expected outcomes..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Cloud Provider Selection */}
          <div>
            <CloudProviderSelector
              selectedProvider={formData.cloudProvider}
              onProviderChange={(provider) => setFormData(prev => ({ ...prev, cloudProvider: provider }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input w-full pl-12 h-12 text-base rounded-xl border-2 font-medium appearance-none cursor-pointer"
                >
                  <option value="planning">📋 Planning</option>
                  <option value="active">🚀 Active</option>
                  <option value="on-hold">⏸️ On Hold</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input w-full pl-12 h-12 text-base rounded-xl border-2 font-medium appearance-none cursor-pointer"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🟠 High Priority</option>
                  <option value="critical">🔴 Critical Priority</option>
                </select>
              </div>
            </div>
          </div>
          </div>
        </FadeIn>

        {/* Budget & Timeline */}
        <FadeIn delay={200}>
          <div className="card p-6 space-y-4 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget & Timeline</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Financial planning and scheduling</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span className="text-xs font-bold text-green-600 dark:text-green-400">STEP 2</span>
              </div>
            </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Budget (USD) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className={`input w-full pl-12 h-12 text-base rounded-xl border-2 focus:ring-2 focus:ring-primary-500 ${errors.budget ? 'border-red-500' : ''}`}
                placeholder="500,000"
                min="0"
                step="1000"
              />
              {formData.budget && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ${parseInt(formData.budget).toLocaleString()}
                </div>
              )}
            </div>
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.budget}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`input w-full pl-12 h-12 text-base rounded-xl border-2 focus:ring-2 focus:ring-primary-500 ${errors.startDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`input w-full pl-12 h-12 text-base rounded-xl border-2 focus:ring-2 focus:ring-primary-500 ${errors.endDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>
          </div>
        </FadeIn>

        {/* Team */}
        <FadeIn delay={250}>
          <div className="card p-6 space-y-4 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assign collaborators to this project</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">STEP 3</span>
              </div>
            </div>

          <div>
            <label htmlFor="team" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Team Members (comma-separated)
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                id="team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                rows={3}
                className="input w-full pl-12 text-base rounded-xl border-2 focus:ring-2 focus:ring-primary-500"
                placeholder="John Doe, Jane Smith, Bob Johnson..."
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter team member names or emails separated by commas
              </p>
            </div>
          </div>
          </div>
        </FadeIn>

        {/* Actions */}
        <FadeIn delay={300}>
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Launch?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Review your project settings and create</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 shadow-md"
                >
                  <Rocket className="w-5 h-5" />
                  Create Project
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </form>
    </div>
  );
};

export default NewProject;
