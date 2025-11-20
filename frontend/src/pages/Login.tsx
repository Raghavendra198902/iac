import { useState } from 'react';
import { LogIn, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { loginSchema, type LoginFormData } from '../lib/schemas';
import { useAuth } from '../contexts/AuthContext';

// Demo users for quick login
const DEMO_USERS = [
  { email: 'ea@demo.com', name: 'Emma Anderson', role: 'Enterprise Architect (EA)' },
  { email: 'sa@demo.com', name: 'Sam Taylor', role: 'Solution Architect (SA)' },
  { email: 'ta@demo.com', name: 'Tom Harris', role: 'Technical Architect (TA)' },
  { email: 'pm@demo.com', name: 'Patricia Martinez', role: 'Project Manager (PM)' },
  { email: 'se@demo.com', name: 'Steve Evans', role: 'System Engineer (SE)' },
  { email: 'consultant@demo.com', name: 'Chris Lee', role: 'Consultant' },
  { email: 'admin@demo.com', name: 'Alice Brown', role: 'Administrator' },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      // Navigation handled by AuthContext
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUserSelect = (email: string) => {
    setValue('email', email);
    setValue('password', 'demo123'); // Demo password
    setShowDemoUsers(false);
    toast.success('Demo user selected! Click Sign In to continue.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">IAC DHARMA</h1>
            <p className="text-gray-600 dark:text-gray-300">Intelligent Infrastructure Design & Deployment</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Demo User Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoUsers(!showDemoUsers)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors border border-primary-200 dark:border-primary-700"
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Quick Login as Demo User</span>
              </button>

              {showDemoUsers && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
                  {DEMO_USERS.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => handleDemoUserSelect(user.email)}
                      className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.role}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {user.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or sign in with credentials
                </span>
              </div>
            </div>

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="admin@iac.dharma"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              loading={loading}
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            All demo users use password: <span className="font-mono font-semibold">demo123</span>
          </div>
        </div>

        <div className="mt-8 text-center text-white dark:text-gray-300 text-sm">
          <p>© 2024 IAC DHARMA Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
