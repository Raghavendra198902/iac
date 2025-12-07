import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  company?: string;
  phone?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    jobTitle: '',
    country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Weak',
    color: 'bg-red-500',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Real-time password strength calculation
  useEffect(() => {
    if (formData.password) {
      const requirements = {
        length: formData.password.length >= 12,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      };

      const score = Object.values(requirements).filter(Boolean).length;
      let label = 'Weak';
      let color = 'bg-red-500';

      if (score >= 5) {
        label = 'Very Strong';
        color = 'bg-green-500';
      } else if (score >= 4) {
        label = 'Strong';
        color = 'bg-blue-500';
      } else if (score >= 3) {
        label = 'Medium';
        color = 'bg-yellow-500';
      }

      setPasswordStrength({ score, label, color, requirements });
    }
  }, [formData.password]);

  // Real-time field validation
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'username':
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, hyphens, and underscores';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        if (value.includes('+')) return 'Email addresses with + are not allowed';
        break;
      case 'password':
        if (value.length < 12) return 'Password must be at least 12 characters';
        if (passwordStrength.score < 4) return 'Password is too weak. Please meet all requirements';
        break;
      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        break;
      case 'phone':
        if (value && !/^[\d\s+()-]+$/.test(value)) return 'Please enter a valid phone number';
        break;
      case 'company':
        if (value.length < 2) return 'Company name must be at least 2 characters';
        break;
    }
    return undefined;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      const newErrors = { ...errors };
      delete newErrors[name as keyof ValidationErrors];
      setErrors(newErrors);
    }
  };

  const handleFieldBlur = (name: string, value: string) => {
    const error = validateField(name, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    ['firstName', 'lastName', 'email', 'username'].forEach((field) => {
      const value = formData[field as keyof typeof formData];
      const error = validateField(field, value);
      if (error) newErrors[field as keyof ValidationErrors] = error;
      if (!value) newErrors[field as keyof ValidationErrors] = `${field} is required`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const passwordError = validateField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;
    if (!formData.password) newErrors.password = 'Password is required';
    
    const confirmError = validateField('confirmPassword', formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      alert('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        acceptTerms,
        acceptMarketing,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden py-12 px-4">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <SparklesIcon className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Enterprise Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Create Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Enterprise Account</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join thousands of companies managing their infrastructure with IAC DHARMA
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Step Indicators */}
          {[
            { num: 1, title: 'Account Details', icon: UserIcon },
            { num: 2, title: 'Security', icon: ShieldCheckIcon },
            { num: 3, title: 'Company Info', icon: BuildingOfficeIcon },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                step === s.num
                  ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                  : step > s.num
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === s.num ? 'bg-blue-500' : step > s.num ? 'bg-green-500' : 'bg-white/10'
              }`}>
                {step > s.num ? (
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                ) : (
                  <s.icon className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400">Step {s.num}</div>
                <div className="text-sm font-semibold text-white">{s.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Form Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Account Details */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Username *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleFieldChange('username', e.target.value)}
                      onBlur={(e) => handleFieldBlur('username', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.username ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                      }`}
                      placeholder="johndoe_enterprise"
                      required
                    />
                    {errors.username && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      {errors.username}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">3+ characters, letters, numbers, hyphens, underscores only</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Corporate Email *</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={(e) => handleFieldBlur('email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                      }`}
                      placeholder="john.doe@company.com"
                      required
                    />
                    {errors.email && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">Use your corporate email for enterprise verification</p>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Continue to Security
                </button>
              </div>
            )}

            {/* Step 2: Security */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Password *</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      onBlur={(e) => handleFieldBlur('password', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                      }`}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Password Strength:</span>
                        <span className={`font-semibold ${
                          passwordStrength.score >= 5 ? 'text-green-400' :
                          passwordStrength.score >= 4 ? 'text-blue-400' :
                          passwordStrength.score >= 3 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              i <= passwordStrength.score ? passwordStrength.color : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="mt-4 space-y-2 bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-sm font-semibold text-white mb-2">Password Requirements:</div>
                    {Object.entries(passwordStrength.requirements).map(([key, met]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {met ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-gray-500" />
                        )}
                        <span className={met ? 'text-green-400' : 'text-gray-400'}>
                          {key === 'length' && 'At least 12 characters'}
                          {key === 'uppercase' && 'One uppercase letter'}
                          {key === 'lowercase' && 'One lowercase letter'}
                          {key === 'number' && 'One number'}
                          {key === 'special' && 'One special character (!@#$%^&*)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Confirm Password *</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                      onBlur={(e) => handleFieldBlur('confirmPassword', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                      }`}
                      placeholder="Re-enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Passwords match
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Continue to Company Info
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Company Info */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Company Name *</label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleFieldChange('company', e.target.value)}
                        onBlur={(e) => handleFieldBlur('company', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.company ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                        }`}
                        placeholder="Acme Corporation"
                        required
                      />
                    </div>
                    {errors.company && (
                      <p className="mt-2 text-sm text-red-400">{errors.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Job Title</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="DevOps Engineer"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Phone Number</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Country</label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.country}
                        onChange={(e) => handleFieldChange('country', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                      >
                        <option value="" className="bg-slate-800">Select Country</option>
                        <option value="US" className="bg-slate-800">United States</option>
                        <option value="UK" className="bg-slate-800">United Kingdom</option>
                        <option value="CA" className="bg-slate-800">Canada</option>
                        <option value="IN" className="bg-slate-800">India</option>
                        <option value="DE" className="bg-slate-800">Germany</option>
                        <option value="FR" className="bg-slate-800">France</option>
                        <option value="AU" className="bg-slate-800">Australia</option>
                        <option value="SG" className="bg-slate-800">Singapore</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
                      I understand that enterprise accounts may be subject to additional verification.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={acceptMarketing}
                      onChange={(e) => setAcceptMarketing(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="marketing" className="text-sm text-gray-300">
                      Send me product updates, feature announcements, and exclusive enterprise offers.
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !acceptTerms}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5" />
                        Create Enterprise Account
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Security Features */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-sm font-semibold text-white">Enterprise Security</div>
                <div className="text-xs text-gray-400">Bank-level encryption</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-sm font-semibold text-white">SOC 2 Compliant</div>
                <div className="text-xs text-gray-400">Certified security standards</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <LockClosedIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-sm font-semibold text-white">GDPR Ready</div>
                <div className="text-xs text-gray-400">Full data protection</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign In
            </Link>
          </p>
          <p className="mt-4 text-sm text-gray-400">
            Need help? Contact our{' '}
            <a href="/support" className="text-blue-400 hover:underline">enterprise support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
