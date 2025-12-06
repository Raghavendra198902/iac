import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Cloud, Mail, Lock, Eye, EyeOff, User, Building, Sparkles, Shield, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate registration then auto-login
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
              />
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Cloud className="w-12 h-12 text-white" />
                <Sparkles className="w-4 h-4 text-white absolute top-2 right-2 animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Join IAC Dharma
          </h1>
          <p className="text-gray-300 font-medium">Infrastructure as Code Platform</p>
          <p className="text-sm text-blue-300 mt-1">Start your free 30-day trial</p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-gray-200">No credit card</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-medium text-gray-200">Quick setup</span>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-400"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="block w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-400"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-400"
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>

            {/* Company Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-400"
                  placeholder="Acme Inc"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength
                            ? passwordStrength === 1
                              ? 'bg-red-500'
                              : passwordStrength === 2
                              ? 'bg-orange-500'
                              : passwordStrength === 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {passwordStrength === 0 && 'Enter a password'}
                    {passwordStrength === 1 && 'Weak password'}
                    {passwordStrength === 2 && 'Fair password'}
                    {passwordStrength === 3 && 'Good password'}
                    {passwordStrength === 4 && 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-400"
                  placeholder="••••••••"
                  required
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start pt-2">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                required
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-600 hover:text-purple-500 font-medium underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-purple-600 hover:text-purple-500 font-medium underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Creating account...' : 'Create Account'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1">
              <span>←</span> Back to home
            </Link>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30"
        >
          <p className="text-sm font-semibold text-white mb-4 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            What's included in your free trial
          </p>
          <div className="space-y-3 text-sm text-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Full access to all features for 30 days</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span>AI-powered infrastructure recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Multi-cloud deployment automation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span>24/7 support and onboarding assistance</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
