import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LockClosedIcon, 
  EnvelopeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    setEmail('demo@iacdharma.com');
    setPassword('Demo@2025!Secure');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Invalid email or password. Please try again.');
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

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Enterprise Platform</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">IAC DHARMA</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Enterprise Infrastructure as Code Platform - Secure, Scalable, Intelligent
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              { icon: ShieldCheckIcon, title: 'Enterprise Security', desc: 'Bank-level encryption & SOC 2 compliant' },
              { icon: DevicePhoneMobileIcon, title: 'Multi-Factor Auth', desc: 'Enhanced security with 2FA support' },
              { icon: IdentificationIcon, title: 'Biometric Login', desc: 'Secure access with biometric authentication' },
              { icon: KeyIcon, title: 'SSO Integration', desc: 'Single sign-on with major providers' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-blue-400">99.9%</div>
              <div className="text-xs text-gray-400 mt-1">Uptime SLA</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-green-400">10K+</div>
              <div className="text-xs text-gray-400 mt-1">Active Users</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-xs text-gray-400 mt-1">Support</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-300">Access your enterprise infrastructure dashboard</p>
          </div>

          {/* Demo User Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Try Demo Account</h3>
                </div>
                <p className="text-xs text-gray-300 mb-3">
                  Explore the platform with pre-configured demo credentials
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Fill Demo Credentials
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Corporate Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-white">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me & Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-3 gap-4">
            {['Google', 'Microsoft', 'Okta'].map((provider) => (
              <button
                key={provider}
                type="button"
                className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:bg-white/10 transition-all"
              >
                {provider}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Create Enterprise Account
              </Link>
            </p>
            <p className="mt-4 text-center text-sm text-gray-400">
              Need help? Contact{' '}
              <a href="/support" className="text-blue-400 hover:underline">enterprise support</a>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="w-4 h-4 text-green-400" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4 text-blue-400" />
              <span>SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
