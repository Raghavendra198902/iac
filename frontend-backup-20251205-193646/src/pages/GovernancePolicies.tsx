import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, FileText, Clock, Users, TrendingUp } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

// ECG Monitor Component
interface ECGMonitorProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showGrid?: boolean;
}

const ECGMonitor: React.FC<ECGMonitorProps> = ({
  data,
  color = '#3b82f6',
  width = 200,
  height = 80,
  showGrid = true,
}) => {
  // Generate ECG waveform (P-QRS-T complex pattern)
  const generateECGWaveform = (values: number[]): string => {
    if (!values || values.length === 0) {
      values = Array(8).fill(75); // Default 8 beats at 75%
    }

    const points: string[] = [];
    const samplesPerBeat = 20;
    const totalBeats = 8;
    
    for (let beat = 0; beat < totalBeats; beat++) {
      const beatValue = values[beat % values.length] || 75;
      const amplitude = beatValue / 100;
      const baseX = (beat / totalBeats) * width;
      
      for (let i = 0; i < samplesPerBeat; i++) {
        const progress = i / samplesPerBeat;
        const x = baseX + (progress * width / totalBeats);
        let y = height / 2; // Baseline
        
        // P wave (small bump before QRS)
        if (progress < 0.15) {
          const pProgress = progress / 0.15;
          y -= Math.sin(pProgress * Math.PI) * (height * 0.08 * amplitude);
        }
        // QRS complex (the main spike)
        else if (progress >= 0.25 && progress < 0.40) {
          const qrsProgress = (progress - 0.25) / 0.15;
          if (qrsProgress < 0.3) {
            // Q wave (small dip)
            y += Math.sin(qrsProgress / 0.3 * Math.PI) * (height * 0.1 * amplitude);
          } else if (qrsProgress < 0.6) {
            // R wave (tall spike)
            const rProgress = (qrsProgress - 0.3) / 0.3;
            y -= Math.sin(rProgress * Math.PI) * (height * 0.4 * amplitude);
          } else {
            // S wave (small dip)
            const sProgress = (qrsProgress - 0.6) / 0.4;
            y += Math.sin(sProgress * Math.PI) * (height * 0.12 * amplitude);
          }
        }
        // T wave (rounded bump after QRS)
        else if (progress >= 0.50 && progress < 0.75) {
          const tProgress = (progress - 0.50) / 0.25;
          y -= Math.sin(tProgress * Math.PI) * (height * 0.12 * amplitude);
        }
        
        points.push(`${x},${y}`);
      }
    }
    
    return `M ${points.join(' L ')}`;
  };

  const pathData = generateECGWaveform(data);

  return (
    <svg width={width} height={height} className="ecg-monitor">
      {showGrid && (
        <defs>
          <pattern id={`ecg-grid-gov-${color}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
          </pattern>
          <filter id="glow-gov">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
      {showGrid && <rect width={width} height={height} fill={`url(#ecg-grid-gov-${color})`} />}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow-gov)"
        className="animate-pulse"
      />
    </svg>
  );
};

interface Policy {
  id: string;
  name: string;
  category: 'security' | 'compliance' | 'operational' | 'financial';
  status: 'active' | 'draft' | 'archived';
  compliance: number;
  lastReview: string;
  owner: string;
  violations: number;
}

interface PolicyMetric {
  label: string;
  value: number;
  color: string;
  trend: number[];
}

const GovernancePolicies = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const policies: Policy[] = [
    {
      id: '1',
      name: 'Data Protection & Privacy Policy',
      category: 'security',
      status: 'active',
      compliance: 94,
      lastReview: '2025-01-10',
      owner: 'Security Team',
      violations: 2,
    },
    {
      id: '2',
      name: 'Cloud Resource Tagging Standards',
      category: 'operational',
      status: 'active',
      compliance: 87,
      lastReview: '2025-01-05',
      owner: 'Cloud Ops',
      violations: 8,
    },
    {
      id: '3',
      name: 'PCI DSS Compliance Framework',
      category: 'compliance',
      status: 'active',
      compliance: 98,
      lastReview: '2025-01-15',
      owner: 'Compliance Team',
      violations: 1,
    },
    {
      id: '4',
      name: 'Cost Optimization Guidelines',
      category: 'financial',
      status: 'active',
      compliance: 82,
      lastReview: '2024-12-20',
      owner: 'FinOps Team',
      violations: 5,
    },
    {
      id: '5',
      name: 'Multi-Cloud Security Baseline',
      category: 'security',
      status: 'active',
      compliance: 91,
      lastReview: '2025-01-12',
      owner: 'Security Team',
      violations: 3,
    },
    {
      id: '6',
      name: 'GDPR Data Residency Policy',
      category: 'compliance',
      status: 'active',
      compliance: 96,
      lastReview: '2025-01-08',
      owner: 'Legal & Compliance',
      violations: 1,
    },
  ];

  const metrics: PolicyMetric[] = [
    {
      label: 'Overall Compliance',
      value: 92,
      color: '#10b981',
      trend: [88, 89, 90, 91, 91, 92, 92],
    },
    {
      label: 'Active Policies',
      value: 24,
      color: '#3b82f6',
      trend: [20, 21, 22, 22, 23, 23, 24],
    },
    {
      label: 'Open Violations',
      value: 18,
      color: '#f59e0b',
      trend: [25, 23, 22, 20, 19, 19, 18],
    },
    {
      label: 'Policy Reviews (30d)',
      value: 12,
      color: '#8b5cf6',
      trend: [8, 9, 10, 11, 11, 12, 12],
    },
  ];

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      security: 'red',
      compliance: 'blue',
      operational: 'purple',
      financial: 'green',
    };
    return colors[category] || 'gray';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'green',
      draft: 'yellow',
      archived: 'gray',
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Governance & Policies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enterprise governance framework, policy management, and compliance monitoring
          </p>
        </div>
      </div>

      {/* ECG Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.label}
              </span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {metric.value}{metric.label === 'Overall Compliance' ? '%' : ''}
            </div>
            <div className="mt-4">
              <ECGMonitor
                data={metric.trend}
                color={metric.color}
                width={200}
                height={60}
                showGrid={true}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security Policies</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Policies
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Policy Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Compliance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Violations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Review
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {policy.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getCategoryColor(policy.category)}>
                          {policy.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {policy.compliance}%
                          </span>
                          <ECGMonitor
                            data={[policy.compliance]}
                            color={policy.compliance >= 90 ? '#10b981' : policy.compliance >= 80 ? '#f59e0b' : '#ef4444'}
                            width={80}
                            height={30}
                            showGrid={false}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {policy.violations > 0 ? (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                              {policy.violations}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              None
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {policy.owner}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(policy.lastReview).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Category-specific tabs */}
        {['security', 'compliance', 'operational', 'financial'].map((category) => (
          <TabsContent key={category} value={category}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                {category} Policies
              </h2>
              <div className="space-y-4">
                {policies
                  .filter((p) => p.category === category)
                  .map((policy) => (
                    <div
                      key={policy.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-blue-600" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {policy.name}
                          </h3>
                        </div>
                        <Badge color={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Compliance</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {policy.compliance}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Violations</span>
                          <div className="flex items-center gap-2 mt-1">
                            {policy.violations > 0 ? (
                              <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-lg font-bold text-red-600">{policy.violations}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-lg font-bold text-green-600">0</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Owner</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            {policy.owner}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Last Review</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            {new Date(policy.lastReview).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <ECGMonitor
                          data={Array(8).fill(policy.compliance)}
                          color={policy.compliance >= 90 ? '#10b981' : policy.compliance >= 80 ? '#f59e0b' : '#ef4444'}
                          width={400}
                          height={60}
                          showGrid={true}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default GovernancePolicies;
