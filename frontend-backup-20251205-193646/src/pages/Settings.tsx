import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  Mail, 
  Key, 
  Cloud,
  Server,
  Code,
  Zap,
  Save,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Upload,
  Activity,
  TrendingUp,
  Users,
  FileText,
  HardDrive,
  Cpu,
  BarChart3,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  Layers,
  Package,
  AlertTriangle,
  Info,
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Target,
  Award,
  Bookmark
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import { API_URL } from '../config/api';

interface SettingsSection {
  id: string;
  label: string;
  icon: any;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [securityScore, setSecurityScore] = useState(85);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Get current user ID from AuthContext
  const userId = user?.id || '10000000-0000-0000-0000-000000000001';
  
  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@iacdharma.com',
    phone: '+1-555-0101',
    role: 'Enterprise Architect',
    department: 'Architecture',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    bio: 'Experienced Enterprise Architect specializing in cloud infrastructure and DevOps.',
    avatar: '',
    linkedin: '',
    github: ''
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    deploymentAlerts: true,
    securityAlerts: true,
    costAlerts: false,
    weeklyReports: true,
    slackIntegration: false,
    teamsIntegration: false
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    ipWhitelisting: false,
    auditLogging: true
  });

  // Application Settings
  const [appSettings, setAppSettings] = useState({
    language: 'en',
    theme: 'system',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    defaultCloud: 'aws',
    autoSave: true,
    compactMode: false
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk-iacdharma-xxxxxxxxxxxxxxxx',
    webhookUrl: '',
    rateLimitPerMinute: '100',
    enableWebhooks: false
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@iacdharma.com',
    enableTLS: true
  });

  // Track changes
  useEffect(() => {
    setIsDirty(true);
  }, [profileSettings, notificationSettings, securitySettings, appSettings, apiSettings, emailSettings]);

  const sections: SettingsSection[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'application', label: 'Application', icon: SettingsIcon },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'api', label: 'API & Integration', icon: Code },
    { id: 'cloud', label: 'Cloud Providers', icon: Cloud },
    { id: 'database', label: 'Database', icon: Database }
  ];

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/users/settings/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          const savedSettings = data.settings || {};
          
          // Load saved settings into state
          if (savedSettings.profile) {
            setProfileSettings(prev => ({ ...prev, ...savedSettings.profile }));
          }
          if (savedSettings.notifications) {
            setNotificationSettings(prev => ({ ...prev, ...savedSettings.notifications }));
          }
          if (savedSettings.security) {
            setSecuritySettings(prev => ({ ...prev, ...savedSettings.security }));
          }
          if (savedSettings.application) {
            setAppSettings(prev => ({ ...prev, ...savedSettings.application }));
          }
          if (savedSettings.email) {
            setEmailSettings(prev => ({ ...prev, ...savedSettings.email }));
          }
          if (savedSettings.api) {
            setApiSettings(prev => ({ ...prev, ...savedSettings.api }));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setErrorMessage('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMessage('');
    
    try {
      const allSettings = {
        profile: profileSettings,
        notifications: notificationSettings,
        security: securitySettings,
        application: appSettings,
        email: emailSettings,
        api: apiSettings
      };

      const response = await fetch(`${API_URL}/users/settings/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: allSettings })
      });

      if (response.ok) {
        setSaveStatus('saved');
        setIsDirty(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setErrorMessage(error.message || 'Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Copy API Key to clipboard
  const copyApiKey = () => {
    navigator.clipboard.writeText(apiSettings.apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  // Regenerate API Key
  const regenerateApiKey = () => {
    setApiSettings({ 
      ...apiSettings, 
      apiKey: 'sk-iacdharma-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    });
    setShowConfirmDialog(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Calculate security score dynamically
  useEffect(() => {
    let score = 50;
    if (securitySettings.twoFactorAuth) score += 20;
    if (securitySettings.auditLogging) score += 10;
    if (securitySettings.ipWhitelisting) score += 15;
    if (parseInt(securitySettings.sessionTimeout) <= 30) score += 5;
    setSecurityScore(Math.min(score, 100));
  }, [securitySettings]);

  const handleReset = () => {
    // Reset to default values
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setProfileSettings({
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@iacdharma.com',
        phone: '+1-555-0101',
        role: 'Enterprise Architect',
        department: 'Architecture',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles'
      });
      setNotificationSettings({
        emailNotifications: true,
        deploymentAlerts: true,
        securityAlerts: true,
        costAlerts: false,
        weeklyReports: true,
        slackIntegration: false,
        teamsIntegration: false
      });
      setSecuritySettings({
        twoFactorAuth: false,
        sessionTimeout: '30',
        passwordExpiry: '90',
        ipWhitelisting: false,
        auditLogging: true
      });
      setAppSettings({
        language: 'en',
        theme: 'system',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        defaultCloud: 'aws',
        autoSave: true,
        compactMode: false
      });
    }
  };

  const renderProfileSection = () => {
    const tabs = [
      { id: 'personal', label: 'Personal Info', icon: User },
      { id: 'work', label: 'Work Details', icon: Cpu },
      { id: 'social', label: 'Social Links', icon: Globe },
    ];

    return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </motion.button>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Profile Picture</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload a professional photo (max 5MB)</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Upload
                  </button>
                  <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Personal Information
              </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={profileSettings.firstName}
              onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={profileSettings.lastName}
              onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profileSettings.email}
              onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileSettings.phone}
              onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={profileSettings.bio}
            onChange={(e) => setProfileSettings({ ...profileSettings, bio: e.target.value })}
            rows={4}
            maxLength={500}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">{profileSettings.bio.length}/500 characters</span>
            <span className="text-green-600 dark:text-green-400">✓ Saved automatically</span>
          </div>
        </div>
      </div>
          </motion.div>
        )}

        {activeTab === 'work' && (
          <motion.div
            key="work"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Work Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <input
              type="text"
              value={profileSettings.role}
              onChange={(e) => setProfileSettings({ ...profileSettings, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <input
              type="text"
              value={profileSettings.department}
              onChange={(e) => setProfileSettings({ ...profileSettings, department: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={profileSettings.location}
              onChange={(e) => setProfileSettings({ ...profileSettings, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={profileSettings.timezone}
              onChange={(e) => setProfileSettings({ ...profileSettings, timezone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
        </div>
      </div>
          </motion.div>
        )}

        {activeTab === 'social' && (
          <motion.div
            key="social"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                Social Links
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'linkedin', label: 'LinkedIn Profile', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
                  { key: 'github', label: 'GitHub Profile', icon: '💻', placeholder: 'https://github.com/username' },
                  { key: 'twitter', label: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/username' },
                ].map(({ key, label, icon, placeholder }) => (
                  <div key={key} className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <span>{icon}</span>
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={profileSettings[key as keyof typeof profileSettings] as string}
                        onChange={(e) => setProfileSettings({ ...profileSettings, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      />
                      <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  };

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Enable Email Notifications', description: 'Receive notifications via email' },
            { key: 'deploymentAlerts', label: 'Deployment Alerts', description: 'Get notified when deployments complete' },
            { key: 'securityAlerts', label: 'Security Alerts', description: 'Critical security notifications' },
            { key: 'costAlerts', label: 'Cost Alerts', description: 'Budget threshold warnings' },
            { key: 'weeklyReports', label: 'Weekly Summary Reports', description: 'Weekly activity summaries' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Third-Party Integrations</h3>
        <div className="space-y-4">
          {[
            { key: 'slackIntegration', label: 'Slack Integration', description: 'Send notifications to Slack channels' },
            { key: 'teamsIntegration', label: 'Microsoft Teams', description: 'Send notifications to Teams channels' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Security Score Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                Security Score
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your account security rating</p>
            </div>
            <motion.div
              className="text-4xl font-bold text-green-600 dark:text-green-400"
              key={securityScore}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {securityScore}%
            </motion.div>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {securityScore >= 90 ? 'Excellent' : securityScore >= 70 ? 'Good' : securityScore >= 50 ? 'Fair' : 'Poor'} security posture
            </span>
          </div>
        </div>
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password Expiry (days)
              </label>
              <select
                value={securitySettings.passwordExpiry}
                onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Security</h3>
        <div className="space-y-4">
          {[
            { key: 'ipWhitelisting', label: 'IP Whitelisting', description: 'Restrict access to specific IP addresses' },
            { key: 'auditLogging', label: 'Audit Logging', description: 'Track all security-related events' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings[key as keyof typeof securitySettings] as boolean}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Security Recommendation</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Enable two-factor authentication and set session timeout to 30 minutes or less for enhanced security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplicationSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={appSettings.theme}
              onChange={(e) => setAppSettings({ ...appSettings, theme: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={appSettings.language}
              onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={appSettings.dateFormat}
              onChange={(e) => setAppSettings({ ...appSettings, dateFormat: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Format
            </label>
            <select
              value={appSettings.timeFormat}
              onChange={(e) => setAppSettings({ ...appSettings, timeFormat: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'autoSave', label: 'Auto-Save', description: 'Automatically save changes' },
            { key: 'compactMode', label: 'Compact Mode', description: 'Use condensed layout for more content' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings[key as keyof typeof appSettings] as boolean}
                  onChange={(e) => setAppSettings({ ...appSettings, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAPISection = () => (
    <div className="space-y-6">
      {/* API Key Management Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            API Key Management
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiSettings.apiKey}
                    className="w-full px-4 py-3 pr-24 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all font-mono text-sm"
                    readOnly
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={copyApiKey}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {apiKeyCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmDialog(true)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Last rotated: 30 days ago • Next rotation: 60 days
              </p>
            </div>

            {/* API Usage Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {[
                { label: 'Requests Today', value: '2,547', icon: Activity },
                { label: 'Success Rate', value: '99.8%', icon: Check },
                { label: 'Avg Response', value: '124ms', icon: Zap },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Configuration</h3>
        <div className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={apiSettings.webhookUrl}
              onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rate Limit (per hour)
              </label>
              <select
                value={apiSettings.rateLimitPerHour}
                onChange={(e) => setApiSettings({ ...apiSettings, rateLimitPerHour: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="100">100 requests</option>
                <option value="500">500 requests</option>
                <option value="1000">1,000 requests</option>
                <option value="5000">5,000 requests</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Version
              </label>
              <select
                value={apiSettings.apiVersion}
                onChange={(e) => setApiSettings({ ...apiSettings, apiVersion: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="v1">v1 (Legacy)</option>
                <option value="v2">v2 (Current)</option>
                <option value="v3">v3 (Beta)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Enable CORS</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Allow cross-origin requests</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={apiSettings.enableCORS}
                onChange={(e) => setApiSettings({ ...apiSettings, enableCORS: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Code className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-300">API Documentation</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              View complete API documentation at <a href="/api-docs" className="underline">api-docs</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCloudSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cloud Provider Connections</h3>
        <div className="space-y-4">
          {[
            { name: 'Amazon Web Services', status: 'connected', logo: '☁️', regions: 3 },
            { name: 'Microsoft Azure', status: 'connected', logo: '⚡', regions: 2 },
            { name: 'Google Cloud Platform', status: 'disconnected', logo: '🌐', regions: 0 },
            { name: 'DigitalOcean', status: 'disconnected', logo: '🌊', regions: 0 }
          ].map((provider) => (
            <div key={provider.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{provider.logo}</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{provider.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {provider.status === 'connected' ? `${provider.regions} regions configured` : 'Not connected'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {provider.status === 'connected' ? (
                  <>
                    <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Connected
                    </span>
                    <button className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Cloud Provider
        </label>
        <select
          value={appSettings.defaultCloud}
          onChange={(e) => setAppSettings({ ...appSettings, defaultCloud: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
        >
          <option value="aws">Amazon Web Services</option>
          <option value="azure">Microsoft Azure</option>
          <option value="gcp">Google Cloud Platform</option>
        </select>
      </div>
    </div>
  );

  const renderEmailSection = () => {
    const mailServices = [
      { 
        id: 'gmail', 
        name: 'Gmail', 
        host: 'smtp.gmail.com', 
        port: '587',
        icon: '📧',
        description: 'Google Gmail SMTP'
      },
      { 
        id: 'outlook', 
        name: 'Outlook', 
        host: 'smtp-mail.outlook.com', 
        port: '587',
        icon: '📨',
        description: 'Microsoft Outlook/Office365'
      },
      { 
        id: 'sendgrid', 
        name: 'SendGrid', 
        host: 'smtp.sendgrid.net', 
        port: '587',
        icon: '✉️',
        description: 'SendGrid Email Service'
      },
      { 
        id: 'mailgun', 
        name: 'Mailgun', 
        host: 'smtp.mailgun.org', 
        port: '587',
        icon: '📬',
        description: 'Mailgun Email Service'
      },
      { 
        id: 'ses', 
        name: 'AWS SES', 
        host: 'email-smtp.us-east-1.amazonaws.com', 
        port: '587',
        icon: '☁️',
        description: 'Amazon Simple Email Service'
      },
      { 
        id: 'smtp', 
        name: 'Custom SMTP', 
        host: '', 
        port: '587',
        icon: '⚙️',
        description: 'Custom SMTP Server'
      }
    ];

    const handleServiceChange = (serviceId: string) => {
      const service = mailServices.find(s => s.id === serviceId);
      if (service) {
        setEmailSettings({
          ...emailSettings,
          mailService: serviceId,
          smtpHost: service.host,
          smtpPort: service.port
        });
      }
    };

    const handleTestEmail = async () => {
      setEmailSettings({ ...emailSettings, testEmailSent: false });
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSettings({ ...emailSettings, testEmailSent: true });
      setTimeout(() => {
        setEmailSettings(prev => ({ ...prev, testEmailSent: false }));
      }, 3000);
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Service Provider</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {mailServices.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceChange(service.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  emailSettings.mailService === service.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{service.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {service.name}
                      {emailSettings.mailService === service.id && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {service.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SMTP Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                placeholder="smtp.example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Port
              </label>
              <select
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="25">25 (Standard)</option>
                <option value="465">465 (SSL)</option>
                <option value="587">587 (TLS)</option>
                <option value="2525">2525 (Alternative)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                placeholder="username@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mt-4">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Use SSL/TLS Encryption</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Secure connection to SMTP server</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailSettings.smtpSecure}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpSecure: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Headers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Email Address
              </label>
              <input
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                placeholder="notifications@iacdharma.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                placeholder="IAC Dharma Platform"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reply-To Address
              </label>
              <input
                type="email"
                value={emailSettings.replyTo}
                onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })}
                placeholder="support@iacdharma.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'enableEmailAlerts', label: 'Enable Email Alerts', description: 'Receive email notifications for important events' },
              { key: 'dailyDigest', label: 'Daily Digest', description: 'Receive a daily summary of activities' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSettings[key as keyof typeof emailSettings] as boolean}
                    onChange={(e) => setEmailSettings({ ...emailSettings, [key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Test Email Configuration</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                Send a test email to verify your SMTP settings are configured correctly.
              </p>
              <button
                onClick={handleTestEmail}
                disabled={emailSettings.testEmailSent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {emailSettings.testEmailSent ? (
                  <>
                    <Check className="w-4 h-4" />
                    Test Email Sent!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Test Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDatabaseSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database Connection</h3>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-semibold text-green-800 dark:text-green-300">Database Connected</div>
              <div className="text-sm text-green-700 dark:text-green-400">PostgreSQL 15 - dharma-postgres</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tables', value: '47' },
            { label: 'Records', value: '12.5K' },
            { label: 'Size', value: '342 MB' },
            { label: 'Uptime', value: '15d 3h' }
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Test Connection
          </button>
          <button className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            View Connection Details
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup & Recovery</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">Automatic Backups</span>
              <span className="text-sm text-green-600 dark:text-green-400">Enabled</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last backup: Today at 2:00 AM
            </div>
          </div>
          <button className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            Create Manual Backup
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'security':
        return renderSecuritySection();
      case 'application':
        return renderApplicationSection();
      case 'email':
        return renderEmailSection();
      case 'api':
        return renderAPISection();
      case 'cloud':
        return renderCloudSection();
      case 'database':
        return renderDatabaseSection();
      default:
        return renderProfileSection();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Regenerate API Key?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This will invalidate your current API key. All applications using the old key will need to be updated immediately. This action cannot be undone.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        Make sure to update your API key in all connected applications and services before proceeding.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={regenerateApiKey}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Yes, Regenerate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/10">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative space-y-6 p-6 max-w-[1600px] mx-auto">
          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 dark:text-red-300">Error</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage('')}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {saveStatus === 'saved' && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-xl"
              >
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Settings Saved</h4>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">Your settings have been successfully saved.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/90 dark:to-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
          >
            {/* Header Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
            
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-30"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                        <SettingsIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                        Settings & Configuration
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Enterprise-level customization and control
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  {/* Search Settings */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search settings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 w-64 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-xl text-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="px-5 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
                      initial={{ x: '100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative flex items-center gap-2">
                      {saveStatus === 'saving' ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Saving...
                        </>
                      ) : saveStatus === 'saved' ? (
                        <>
                          <Check className="w-5 h-5" />
                          Saved!
                        </>
                      ) : saveStatus === 'error' ? (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          Error - Retry
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Quick Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { icon: Shield, label: 'Security Score', value: '98%', color: 'green' },
                  { icon: Activity, label: 'System Health', value: 'Optimal', color: 'blue' },
                  { icon: Database, label: 'Storage Used', value: '342 MB', color: 'purple' },
                  { icon: Users, label: 'Active Sessions', value: '3', color: 'pink' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl blur-sm group-hover:blur-md transition-all" />
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20`}>
                          <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Real-time System Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 overflow-hidden rounded-2xl"
          >
            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-xl p-4 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">All Systems Operational</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last sync: 2 seconds ago
                      </p>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Premium Plan
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Wifi className="w-4 h-4" />
                      <span className="text-sm font-bold">99.9%</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Uptime</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-bold">24ms</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Latency</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-bold">100%</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Reliability</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Settings Container */}
          <div className="grid grid-cols-12 gap-6">
            {/* Enhanced Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-12 lg:col-span-3"
            >
              <div className="sticky top-6 space-y-4">
                <div className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
                  
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {profileSettings.firstName} {profileSettings.lastName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{profileSettings.role}</div>
                      </div>
                    </div>

                    <nav className="space-y-1">
                      <AnimatePresence mode="wait">
                        {sections.map((section, index) => {
                          const Icon = section.icon;
                          const isActive = activeSection === section.id;
                          return (
                            <motion.button
                              key={section.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 4, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setActiveSection(section.id)}
                              className={`w-full group relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                                isActive
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="activeSection"
                                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                              <Icon className={`relative w-5 h-5 transition-transform group-hover:scale-110 ${
                                isActive ? 'text-white' : ''
                              }`} />
                              <span className="relative">{section.label}</span>
                              <ChevronRight className={`relative ml-auto w-4 h-4 transition-transform ${
                                isActive ? 'text-white translate-x-1' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                              }`} />
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </nav>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
                    <div className="space-y-2 text-sm">
                      <button className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Settings
                      </button>
                      <button className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import Settings
                      </button>
                      <button className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        View Audit Log
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Content Area */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="col-span-12 lg:col-span-9"
            >
              <div className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
                
                <div className="relative p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {sections.find(s => s.id === activeSection) && (
                          <>
                            {(() => {
                              const Icon = sections.find(s => s.id === activeSection)!.icon;
                              return <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />;
                            })()}
                            {sections.find(s => s.id === activeSection)!.label}
                          </>
                        )}
                      </h2>
                      {showAdvanced && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <Layers className="w-4 h-4" />
                          {showAdvanced ? 'Hide' : 'Show'} Advanced
                        </motion.button>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {activeSection === 'profile' && 'Manage your personal information and work details'}
                      {activeSection === 'notifications' && 'Configure how you receive notifications and alerts'}
                      {activeSection === 'security' && 'Protect your account with advanced security features'}
                      {activeSection === 'application' && 'Customize your application experience and preferences'}
                      {activeSection === 'email' && 'Configure email service provider and notification settings'}
                      {activeSection === 'api' && 'Manage API keys, webhooks, and integration settings'}
                      {activeSection === 'cloud' && 'Connect and manage cloud provider integrations'}
                      {activeSection === 'database' && 'Monitor database health and manage connections'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {renderContent()}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
