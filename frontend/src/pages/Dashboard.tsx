// Version: ECG-SINE-WAVE-v2.0
import { FileText, AlertTriangle, DollarSign, Activity, Sparkles, TrendingUp, TrendingDown, Code, Monitor, Shield, Zap, ArrowRight, BarChart3, Globe, Server, Cloud, Database, Cpu, Bell, User, Settings, Search, Calendar, CheckCircle, XCircle, Clock, MapPin, Layers, GitBranch, Package, Target, Workflow, Users, PieChart, LineChart, TrendingUp as TrendUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout';
import PageTransition from '../components/ui/PageTransition';
import FadeIn, { StaggerChildren, FadeInStagger } from '../components/ui/FadeIn';
import WorkflowDashboardWidget from '../components/WorkflowDashboardWidget';
import ActivityFeed from '../components/ActivityFeed';

// ECG-style heartbeat monitor component - simulates real ECG sine wave pattern
const ECGMonitor = ({ data, color = 'blue', height = 20, width = 60, showGrid = false }: { 
  data: number[], 
  color?: string, 
  height?: number, 
  width?: number,
  showGrid?: boolean 
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  // Generate ECG-style sine wave with sharp peaks (like real heartbeat monitor)
  const ecgPoints: number[] = [];
  const samplesPerBeat = 20; // Points per heartbeat cycle
  const totalBeats = 8; // Number of heartbeat cycles to show
  
  for (let beat = 0; beat < totalBeats; beat++) {
    for (let i = 0; i < samplesPerBeat; i++) {
      const t = i / samplesPerBeat;
      const dataIndex = Math.floor((beat / totalBeats) * data.length);
      const baseValue = data[Math.min(dataIndex, data.length - 1)];
      
      // Create realistic ECG waveform: P wave, QRS complex, T wave
      let ecgValue;
      if (t < 0.15) {
        // P wave (small bump)
        ecgValue = baseValue + range * 0.15 * Math.sin(t * Math.PI / 0.15);
      } else if (t >= 0.15 && t < 0.2) {
        // Baseline
        ecgValue = baseValue;
      } else if (t >= 0.2 && t < 0.35) {
        // QRS complex (sharp spike)
        const qrsT = (t - 0.2) / 0.15;
        if (qrsT < 0.3) {
          // Q dip
          ecgValue = baseValue - range * 0.2 * Math.sin(qrsT * Math.PI / 0.3);
        } else if (qrsT < 0.6) {
          // R spike (tall peak)
          ecgValue = baseValue + range * 0.8 * Math.sin((qrsT - 0.3) * Math.PI / 0.3);
        } else {
          // S dip
          ecgValue = baseValue - range * 0.15 * Math.sin((qrsT - 0.6) * Math.PI / 0.4);
        }
      } else if (t >= 0.35 && t < 0.45) {
        // ST segment (baseline)
        ecgValue = baseValue;
      } else if (t >= 0.45 && t < 0.65) {
        // T wave (rounded bump)
        ecgValue = baseValue + range * 0.25 * Math.sin((t - 0.45) * Math.PI / 0.2);
      } else {
        // Baseline
        ecgValue = baseValue;
      }
      
      ecgPoints.push(ecgValue);
    }
  }
  
  const step = width / (ecgPoints.length - 1);
  const points = ecgPoints.map((value, i) => {
    const x = i * step;
    const y = height - ((value - min) / range) * height * 0.9 - height * 0.05;
    return `${x},${y}`;
  }).join(' ');
  
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f59e0b',
    purple: '#8b5cf6',
    red: '#ef4444',
  };
  
  const strokeColor = colorMap[color] || colorMap.blue;
  
  return (
    <svg width={width} height={height} className="inline-block">
      {showGrid && (
        <>
          {/* Grid lines for ECG effect */}
          <defs>
            <pattern id={`grid-${color}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill={`url(#grid-${color})`} />
        </>
      )}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse"
      />
      {/* Glowing effect like ECG monitor */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        className="blur-sm"
      />
    </svg>
  );
};

// Large ECG Chart for detailed monitoring (like hospital monitors)
const ECGChart = ({ data, height = 200, color = 'green', title = 'Real-Time Monitor' }: { 
  data: number[], 
  height?: number, 
  color?: string,
  title?: string 
}) => {
  const [animatedData, setAnimatedData] = useState(data);
  
  useEffect(() => {
    // Simulate real-time data updates every 2 seconds
    const interval = setInterval(() => {
      setAnimatedData(prev => {
        const newData = [...prev.slice(1), prev[prev.length - 1] + (Math.random() - 0.5) * 2];
        return newData;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const max = Math.max(...animatedData);
  const min = Math.min(...animatedData);
  const range = max - min || 1;
  const width = 100;
  
  // Generate ECG-style sine wave for large chart
  const ecgPoints: number[] = [];
  const samplesPerBeat = 25; // Points per heartbeat cycle
  const totalBeats = 12; // Number of heartbeat cycles for detailed view
  
  for (let beat = 0; beat < totalBeats; beat++) {
    for (let i = 0; i < samplesPerBeat; i++) {
      const t = i / samplesPerBeat;
      const dataIndex = Math.floor((beat / totalBeats) * animatedData.length);
      const baseValue = animatedData[Math.min(dataIndex, animatedData.length - 1)];
      
      // Create realistic ECG waveform: P wave, QRS complex, T wave
      let ecgValue;
      if (t < 0.15) {
        // P wave (small bump)
        ecgValue = baseValue + range * 0.15 * Math.sin(t * Math.PI / 0.15);
      } else if (t >= 0.15 && t < 0.2) {
        // Baseline
        ecgValue = baseValue;
      } else if (t >= 0.2 && t < 0.35) {
        // QRS complex (sharp spike)
        const qrsT = (t - 0.2) / 0.15;
        if (qrsT < 0.3) {
          // Q dip
          ecgValue = baseValue - range * 0.2 * Math.sin(qrsT * Math.PI / 0.3);
        } else if (qrsT < 0.6) {
          // R spike (tall peak)
          ecgValue = baseValue + range * 0.8 * Math.sin((qrsT - 0.3) * Math.PI / 0.3);
        } else {
          // S dip
          ecgValue = baseValue - range * 0.15 * Math.sin((qrsT - 0.6) * Math.PI / 0.4);
        }
      } else if (t >= 0.35 && t < 0.45) {
        // ST segment (baseline)
        ecgValue = baseValue;
      } else if (t >= 0.45 && t < 0.65) {
        // T wave (rounded bump)
        ecgValue = baseValue + range * 0.25 * Math.sin((t - 0.45) * Math.PI / 0.2);
      } else {
        // Baseline
        ecgValue = baseValue;
      }
      
      ecgPoints.push(ecgValue);
    }
  }
  
  const step = width / (ecgPoints.length - 1);
  const linePoints = ecgPoints.map((value, i) => {
    const x = (i * step).toFixed(2);
    const y = (height - ((value - min) / range) * (height * 0.9) - height * 0.05).toFixed(2);
    return `${x},${y}`;
  }).join(' ');
  
  const colorMap: Record<string, { stroke: string, glow: string, bg: string }> = {
    blue: { stroke: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', bg: '#0f172a' },
    green: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: '#0a2f1f' },
    orange: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: '#2f1f0a' },
    purple: { stroke: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', bg: '#1f0a2f' },
    red: { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', bg: '#2f0a0a' },
  };
  
  const colors = colorMap[color] || colorMap.green;
  
  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg 
        width="100%" 
        height={height} 
        className="w-full" 
        viewBox={`0 0 ${width} ${height}`} 
        preserveAspectRatio="none"
        style={{ background: colors.bg }}
      >
        <defs>
          {/* ECG Grid Pattern */}
          <pattern id={`ecg-grid-${color}`} width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke={colors.stroke} strokeWidth="0.2" opacity="0.3"/>
          </pattern>
          <pattern id={`ecg-grid-major-${color}`} width="25" height="25" patternUnits="userSpaceOnUse">
            <rect width="25" height="25" fill={`url(#ecg-grid-${color})`}/>
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke={colors.stroke} strokeWidth="0.4" opacity="0.5"/>
          </pattern>
          
          {/* Glow effect filter */}
          <filter id={`glow-${color}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background grid like ECG paper */}
        <rect width={width} height={height} fill={`url(#ecg-grid-major-${color})`} />
        
        {/* ECG Line with glow */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${color})`}
          className="transition-all duration-500"
        />
        
        {/* Scanning line effect (like real-time monitors) */}
        <line
          x1={width}
          y1="0"
          x2={width}
          y2={height}
          stroke={colors.stroke}
          strokeWidth="1"
          opacity="0.6"
          className="animate-pulse"
        >
          <animate
            attributeName="x1"
            from="0"
            to={width}
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            from="0"
            to={width}
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
      
      {/* Time indicators */}
      <div className="absolute bottom-1 left-2 text-xs font-mono opacity-60" style={{ color: colors.stroke }}>
        -30min
      </div>
      <div className="absolute bottom-1 right-2 text-xs font-mono opacity-60" style={{ color: colors.stroke }}>
        now
      </div>
    </div>
  );
};

// Donut Chart Component for Distribution
const DonutChart = ({ value, max = 100, color = 'blue', size = 80 }: { value: number, max?: number, color?: string, size?: number }) => {
  const percentage = (value / max) * 100;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f59e0b',
    purple: '#8b5cf6',
    red: '#ef4444',
  };
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colorMap[color] || colorMap.blue}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

export default function Dashboard() {
  const stats = [
    {
      name: 'Blueprints',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      trend: 'up',
      icon: FileText,
      href: '/blueprints',
      color: 'blue',
      sparkline: [18, 20, 19, 22, 21, 24],
    },
    {
      name: 'Deployments',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      trend: 'up',
      icon: Activity,
      href: '/deployments',
      color: 'green',
      sparkline: [142, 145, 148, 150, 153, 156],
    },
    {
      name: 'Risk Score',
      value: '32',
      change: '-5%',
      changeType: 'positive',
      trend: 'down',
      icon: AlertTriangle,
      href: '/risk',
      color: 'orange',
      sparkline: [40, 38, 36, 35, 34, 32],
    },
    {
      name: 'Monthly Cost',
      value: '$12.4K',
      change: '-15%',
      changeType: 'positive',
      trend: 'down',
      icon: DollarSign,
      href: '/cost',
      color: 'purple',
      sparkline: [14.5, 14.2, 13.8, 13.2, 12.8, 12.4],
    },
  ];

  const systemMetrics = [
    {
      name: 'CPU Usage',
      value: '45%',
      status: 'normal',
      icon: Cpu,
      color: 'blue',
      sparkline: [42, 44, 43, 46, 45, 45],
    },
    {
      name: 'Memory',
      value: '62%',
      status: 'normal',
      icon: Database,
      color: 'green',
      sparkline: [58, 60, 61, 63, 62, 62],
    },
    {
      name: 'Active Services',
      value: '18/20',
      status: 'warning',
      icon: Server,
      color: 'orange',
      sparkline: [20, 20, 19, 18, 18, 18],
    },
    {
      name: 'Requests/min',
      value: '2.4K',
      status: 'normal',
      icon: Activity,
      color: 'purple',
      sparkline: [2.1, 2.2, 2.3, 2.5, 2.4, 2.4],
    },
  ];

  const quickActions = [
    {
      title: 'AI Designer',
      description: 'Generate with AI',
      icon: Sparkles,
      href: '/designer',
      color: 'blue',
    },
    {
      title: 'IAC Generator',
      description: 'Create IaC code',
      icon: Code,
      href: '/iac',
      color: 'green',
    },
    {
      title: 'Monitor',
      description: 'System health',
      icon: Monitor,
      href: '/monitoring',
      color: 'purple',
    },
    {
      title: 'Security',
      description: 'Compliance',
      icon: Shield,
      href: '/security',
      color: 'red',
    },
  ];

  // Load real data from APIs - no demo data
  const [recentBlueprints, setRecentBlueprints] = useState<any[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blueprintsRes, deploymentsRes] = await Promise.all([
          fetch('/api/blueprints?limit=5'),
          fetch('/api/deployments?limit=5')
        ]);
        if (blueprintsRes.ok) setRecentBlueprints(await blueprintsRes.json());
        if (deploymentsRes.ok) setRecentDeployments(await deploymentsRes.json());
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Enterprise Command Center Header */}
          <FadeIn>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
            
            {/* Top Bar with Actions */}
            <div className="relative border-b border-white/10 px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-medium text-white/80">All Systems Operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">{new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Bell className="h-4 w-4 text-white" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-slate-900"></span>
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Settings className="h-4 w-4 text-white" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <User className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium text-white">Admin</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Header Content */}
            <div className="relative p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">Infrastructure Command Center</h1>
                    <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">ENTERPRISE</span>
                  </div>
                  <p className="text-white/70 text-sm max-w-2xl">Real-time monitoring and intelligent orchestration of your multi-cloud infrastructure ecosystem</p>
                  
                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Uptime</p>
                        <p className="text-sm font-bold text-white">99.99%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Server className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Resources</p>
                        <p className="text-sm font-bold text-white">847</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Globe className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Regions</p>
                        <p className="text-sm font-bold text-white">12</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Activity className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Alerts</p>
                        <p className="text-sm font-bold text-white">3</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Link
                    to="/designer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Designer
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Compact Stats Grid with ECG Monitors - Real-Time 30min Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
              green: 'from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700',
              orange: 'from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700',
              purple: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
            };
            
            return (
              <FadeIn key={stat.name} delay={index * 0.05}>
                <Link
                  to={stat.href}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-4 shadow hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} transition-all duration-200`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold ${
                      stat.changeType === 'positive' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      <TrendIcon className="h-3 w-3" />
                      {stat.change}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <ECGMonitor data={stat.sparkline} color={stat.color} width={80} height={24} showGrid={true} />
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>

        {/* System Metrics - ECG-Style Real-Time Monitors */}
        <div className="mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center font-bold text-xl rounded-lg animate-pulse">
          ⚡ ECG SINE WAVE MONITORS LOADED - VERSION 2.0 ⚡
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {systemMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const statusColors = {
              normal: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
              warning: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
              critical: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
            };
            const colorClasses = {
              blue: 'text-blue-600 dark:text-blue-400',
              green: 'text-green-600 dark:text-green-400',
              orange: 'text-orange-600 dark:text-orange-400',
              purple: 'text-purple-600 dark:text-purple-400',
            };
            
            return (
              <FadeIn key={metric.name} delay={0.2 + index * 0.05}>
                <div className="rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${colorClasses[metric.color as keyof typeof colorClasses]}`} />
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[metric.status as keyof typeof statusColors]}`}>
                      {metric.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{metric.name}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{metric.value}</p>
                  <ECGMonitor data={metric.sparkline} color={metric.color} width={100} height={28} showGrid={true} />
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Executive Analytics Dashboard */}
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Analytics with Area Charts */}
            <div className="lg:col-span-2 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">30-day trend analysis</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">30D</button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700">7D</button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700">24H</button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deployment Success Rate</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">98.7% ↑ 2.3%</span>
                  </div>
                  <ECGChart data={[92, 94, 95, 96, 97, 98, 98, 97, 98, 99, 98, 99]} height={80} color="green" title="Success Rate" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Infrastructure Response Time</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">124ms ↓ 14%</span>
                  </div>
                  <ECGChart data={[145, 142, 138, 135, 130, 128, 125, 122, 120, 118, 122, 124]} height={80} color="blue" title="Response Time" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Optimization Savings</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">$18.2K saved</span>
                  </div>
                  <ECGChart data={[100, 98, 95, 92, 90, 88, 85, 84, 83, 82, 82, 82]} height={80} color="purple" title="Cost Savings" />
                </div>
              </div>
            </div>
            
            {/* Resource Distribution with Donut Charts */}
            <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Resource Distribution</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <DonutChart value={72} max={100} color="blue" size={90} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">72%</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Compute</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">EC2 Instances</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">342</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Lambda Functions</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">128</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Containers</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">67</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <DonutChart value={45} max={100} color="green" size={90} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">45%</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Storage</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">S3 Buckets</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">EBS Volumes</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Databases</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">24</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <DonutChart value={28} max={100} color="orange" size={90} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">28%</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Network</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">VPCs</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Load Balancers</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">CDN Endpoints</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">34</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Workflow Dashboard Widget */}
        <FadeIn delay={0.35}>
          <WorkflowDashboardWidget />
        </FadeIn>

        {/* Activity Feed - Real-time Activity Tracking */}
        <FadeIn delay={0.38}>
          <ActivityFeed maxItems={20} showFilters={true} height="500px" />
        </FadeIn>

        {/* Real-Time Operations Grid */}
        <FadeIn delay={0.4}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Deployments Table */}
            <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Deployments</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold">Live</span>
              </div>
              
              <div className="space-y-2">
                {[
                  { name: 'prod-api-cluster', status: 'running', progress: 100, region: 'us-east-1', time: '2m ago' },
                  { name: 'staging-web-app', status: 'deploying', progress: 67, region: 'eu-west-1', time: 'now' },
                  { name: 'dev-database', status: 'pending', progress: 15, region: 'ap-south-1', time: '30s ago' },
                  { name: 'test-microservice', status: 'running', progress: 100, region: 'us-west-2', time: '5m ago' },
                ].map((deployment, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{deployment.name}</p>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          deployment.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          deployment.status === 'deploying' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {deployment.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{deployment.region}</span>
                        <span>•</span>
                        <span>{deployment.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{deployment.progress}%</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/deployments" className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium transition-colors">
                View All Deployments
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            
            {/* Infrastructure Health */}
            <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Infrastructure Health</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">Healthy</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { category: 'Compute Resources', healthy: 342, total: 350, percentage: 98 },
                  { category: 'Storage Systems', healthy: 156, total: 160, percentage: 98 },
                  { category: 'Network Infrastructure', healthy: 64, total: 64, percentage: 100 },
                  { category: 'Security Services', healthy: 28, total: 30, percentage: 93 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.healthy}/{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.percentage === 100 ? 'bg-green-500' : item.percentage >= 95 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">All Systems Operational</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">No critical issues detected. Performance within normal parameters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Quick Actions - Compact Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
              red: 'from-red-500 to-red-600',
            };
            
            return (
              <FadeIn key={action.title} delay={0.3 + index * 0.05}>
                <Link
                  to={action.href}
                  className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${colorClasses[action.color as keyof typeof colorClasses]} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </Link>
              </FadeIn>
            );
          })}
        </div>

        {/* Recent Activity - Compact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Blueprints */}
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Blueprints</h2>
              </div>
              <Link 
                to="/blueprints" 
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group"
              >
                View all
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentBlueprints.length > 0 ? (
                recentBlueprints.slice(0, 5).map((blueprint, index) => (
                  <Link
                    key={blueprint.id}
                    to={`/blueprints/${blueprint.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-150 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{blueprint.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{blueprint.cloud} • {blueprint.updatedAt}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                      blueprint.status === 'Active' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {blueprint.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No blueprints yet</p>
                  <Link to="/designer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block">
                    Create your first
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Deployments */}
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Deployments</h2>
              </div>
              <Link 
                to="/deployments" 
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group"
              >
                View all
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentDeployments.length > 0 ? (
                recentDeployments.slice(0, 5).map((deployment, index) => (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-150 border border-transparent hover:border-green-200 dark:hover:border-green-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{deployment.blueprint}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{deployment.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                      deployment.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      deployment.status === 'in_progress' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {deployment.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No deployments yet</p>
                  <Link to="/deployments" className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block">
                    View history
                  </Link>
                </div>
              )}
          </div>
        </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
// Force rebuild 1763959386
