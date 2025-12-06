import React, { useState, useEffect } from 'react';
import {
  Package, Download, Heart, Star, TrendingUp, Filter, Search,
  Eye, Code, Play, Copy, ExternalLink, Award, Shield, Zap,
  Database, Network, Server, Lock, Activity, Cloud, Box, Grid
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import type { 
  Template, 
  TemplateCategory, 
  CloudProvider, 
  TemplateComplexity,
  TemplateStats,
  TemplateFilters
} from '../types/templates';

export default function ResourceTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<TemplateStats>({
    totalTemplates: 48,
    totalDownloads: 12450,
    averageRating: 4.6,
    verifiedTemplates: 32,
    categoryCounts: {
      compute: 12,
      networking: 8,
      database: 10,
      storage: 6,
      security: 7,
      monitoring: 5,
      kubernetes: 8,
      serverless: 6
    }
  });
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, filters, searchQuery]);

  const loadTemplates = () => {
    const mockTemplates: Template[] = [
      {
        id: '1',
        name: 'High-Availability Web Application',
        description: 'Production-ready web app infrastructure with auto-scaling, load balancing, and RDS database',
        category: 'compute',
        provider: 'aws',
        complexity: 'intermediate',
        version: '2.1.0',
        author: 'AWS Solutions',
        downloads: 2456,
        likes: 342,
        rating: 4.8,
        tags: ['auto-scaling', 'load-balancer', 'rds', 'cloudfront'],
        estimatedCost: '$250-500/mo',
        deploymentTime: '15-20 min',
        lastUpdated: '2024-11-15',
        isVerified: true,
        isFeatured: true,
        parameters: [
          { name: 'instanceType', type: 'select', description: 'EC2 instance type', required: true, options: ['t3.small', 't3.medium', 't3.large'] },
          { name: 'minInstances', type: 'number', description: 'Minimum instances', required: true, default: 2 },
          { name: 'maxInstances', type: 'number', description: 'Maximum instances', required: true, default: 10 }
        ],
        resources: [
          { type: 'AWS::EC2::Instance', name: 'Web Servers', count: 2 },
          { type: 'AWS::ElasticLoadBalancingV2::LoadBalancer', name: 'Application Load Balancer', count: 1 },
          { type: 'AWS::RDS::DBInstance', name: 'PostgreSQL Database', count: 1 },
          { type: 'AWS::CloudFront::Distribution', name: 'CDN Distribution', count: 1 }
        ]
      },
      {
        id: '2',
        name: 'Secure VPC with Multi-AZ',
        description: 'Enterprise-grade VPC with public/private subnets, NAT gateways, and security groups',
        category: 'networking',
        provider: 'aws',
        complexity: 'advanced',
        version: '3.0.1',
        author: 'Network Team',
        downloads: 1834,
        likes: 267,
        rating: 4.9,
        tags: ['vpc', 'security', 'multi-az', 'nat-gateway'],
        estimatedCost: '$150-300/mo',
        deploymentTime: '10-15 min',
        lastUpdated: '2024-11-20',
        isVerified: true,
        isFeatured: true,
        parameters: [
          { name: 'vpcCidr', type: 'string', description: 'VPC CIDR block', required: true, default: '10.0.0.0/16' },
          { name: 'availabilityZones', type: 'number', description: 'Number of AZs', required: true, default: 3 }
        ],
        resources: [
          { type: 'AWS::EC2::VPC', name: 'Virtual Private Cloud', count: 1 },
          { type: 'AWS::EC2::Subnet', name: 'Public/Private Subnets', count: 6 },
          { type: 'AWS::EC2::NatGateway', name: 'NAT Gateways', count: 3 },
          { type: 'AWS::EC2::SecurityGroup', name: 'Security Groups', count: 4 }
        ]
      },
      {
        id: '3',
        name: 'Kubernetes Production Cluster',
        description: 'Production-ready AKS cluster with monitoring, logging, and auto-scaling',
        category: 'kubernetes',
        provider: 'azure',
        complexity: 'expert',
        version: '1.28.0',
        author: 'Kubernetes Team',
        downloads: 1567,
        likes: 423,
        rating: 4.7,
        tags: ['aks', 'kubernetes', 'monitoring', 'ingress'],
        estimatedCost: '$400-800/mo',
        deploymentTime: '25-30 min',
        lastUpdated: '2024-11-18',
        isVerified: true,
        isFeatured: true,
        parameters: [
          { name: 'nodeCount', type: 'number', description: 'Initial node count', required: true, default: 3 },
          { name: 'nodeSize', type: 'select', description: 'Node VM size', required: true, options: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3'] }
        ],
        resources: [
          { type: 'Microsoft.ContainerService/managedClusters', name: 'AKS Cluster', count: 1 },
          { type: 'Microsoft.Network/virtualNetworks', name: 'Virtual Network', count: 1 },
          { type: 'Microsoft.OperationalInsights/workspaces', name: 'Log Analytics', count: 1 }
        ]
      },
      {
        id: '4',
        name: 'Serverless API with DynamoDB',
        description: 'Scalable serverless REST API using Lambda, API Gateway, and DynamoDB',
        category: 'serverless',
        provider: 'aws',
        complexity: 'intermediate',
        version: '1.5.2',
        author: 'Serverless Team',
        downloads: 2145,
        likes: 389,
        rating: 4.6,
        tags: ['lambda', 'api-gateway', 'dynamodb', 'serverless'],
        estimatedCost: '$50-150/mo',
        deploymentTime: '8-12 min',
        lastUpdated: '2024-11-22',
        isVerified: true,
        isFeatured: false,
        parameters: [
          { name: 'apiName', type: 'string', description: 'API name', required: true },
          { name: 'tableName', type: 'string', description: 'DynamoDB table name', required: true }
        ],
        resources: [
          { type: 'AWS::Lambda::Function', name: 'API Functions', count: 5 },
          { type: 'AWS::ApiGateway::RestApi', name: 'REST API', count: 1 },
          { type: 'AWS::DynamoDB::Table', name: 'Database Table', count: 1 }
        ]
      },
      {
        id: '5',
        name: 'Cloud SQL with High Availability',
        description: 'Production-grade Cloud SQL (PostgreSQL) with failover and read replicas',
        category: 'database',
        provider: 'gcp',
        complexity: 'advanced',
        version: '2.0.0',
        author: 'Database Team',
        downloads: 987,
        likes: 156,
        rating: 4.5,
        tags: ['cloud-sql', 'postgresql', 'ha', 'replicas'],
        estimatedCost: '$200-400/mo',
        deploymentTime: '15-20 min',
        lastUpdated: '2024-11-17',
        isVerified: true,
        isFeatured: false,
        parameters: [
          { name: 'databaseVersion', type: 'select', description: 'PostgreSQL version', required: true, options: ['POSTGRES_14', 'POSTGRES_15', 'POSTGRES_16'] },
          { name: 'tier', type: 'select', description: 'Machine tier', required: true, options: ['db-n1-standard-2', 'db-n1-standard-4'] }
        ],
        resources: [
          { type: 'google_sql_database_instance', name: 'Primary Database', count: 1 },
          { type: 'google_sql_database_instance', name: 'Read Replicas', count: 2 },
          { type: 'google_compute_network', name: 'Private Network', count: 1 }
        ]
      },
      {
        id: '6',
        name: 'S3 Static Website Hosting',
        description: 'Static website hosting with CloudFront CDN, SSL, and Route53 DNS',
        category: 'storage',
        provider: 'aws',
        complexity: 'beginner',
        version: '1.2.0',
        author: 'Web Team',
        downloads: 3245,
        likes: 578,
        rating: 4.9,
        tags: ['s3', 'cloudfront', 'website', 'ssl'],
        estimatedCost: '$5-20/mo',
        deploymentTime: '5-10 min',
        lastUpdated: '2024-11-21',
        isVerified: true,
        isFeatured: true,
        parameters: [
          { name: 'domainName', type: 'string', description: 'Website domain', required: true },
          { name: 'sslCertificate', type: 'string', description: 'ACM certificate ARN', required: true }
        ],
        resources: [
          { type: 'AWS::S3::Bucket', name: 'Website Bucket', count: 1 },
          { type: 'AWS::CloudFront::Distribution', name: 'CDN', count: 1 },
          { type: 'AWS::Route53::RecordSet', name: 'DNS Record', count: 1 }
        ]
      },
      {
        id: '7',
        name: 'WAF with DDoS Protection',
        description: 'Web Application Firewall with AWS Shield and rate limiting rules',
        category: 'security',
        provider: 'aws',
        complexity: 'advanced',
        version: '1.8.0',
        author: 'Security Team',
        downloads: 1456,
        likes: 234,
        rating: 4.7,
        tags: ['waf', 'ddos', 'security', 'shield'],
        estimatedCost: '$100-200/mo',
        deploymentTime: '10-15 min',
        lastUpdated: '2024-11-19',
        isVerified: true,
        isFeatured: false,
        parameters: [
          { name: 'rateLimit', type: 'number', description: 'Requests per 5 minutes', required: true, default: 2000 },
          { name: 'blockedCountries', type: 'multiselect', description: 'Countries to block', required: false, options: ['CN', 'RU', 'KP'] }
        ],
        resources: [
          { type: 'AWS::WAFv2::WebACL', name: 'Web ACL', count: 1 },
          { type: 'AWS::WAFv2::IPSet', name: 'IP Sets', count: 2 },
          { type: 'AWS::Shield::Protection', name: 'Shield Protection', count: 1 }
        ]
      },
      {
        id: '8',
        name: 'Prometheus + Grafana Stack',
        description: 'Complete monitoring solution with Prometheus, Grafana, and AlertManager',
        category: 'monitoring',
        provider: 'multi-cloud',
        complexity: 'intermediate',
        version: '2.3.0',
        author: 'Observability Team',
        downloads: 1789,
        likes: 312,
        rating: 4.8,
        tags: ['prometheus', 'grafana', 'monitoring', 'alerts'],
        estimatedCost: '$100-250/mo',
        deploymentTime: '20-25 min',
        lastUpdated: '2024-11-16',
        isVerified: true,
        isFeatured: true,
        parameters: [
          { name: 'retentionDays', type: 'number', description: 'Metrics retention', required: true, default: 15 },
          { name: 'replicas', type: 'number', description: 'Prometheus replicas', required: true, default: 2 }
        ],
        resources: [
          { type: 'Deployment', name: 'Prometheus', count: 1 },
          { type: 'Deployment', name: 'Grafana', count: 1 },
          { type: 'Deployment', name: 'AlertManager', count: 1 },
          { type: 'Service', name: 'Services', count: 3 }
        ]
      }
    ];

    setTemplates(mockTemplates);
    setFilteredTemplates(mockTemplates);
  };

  const applyFilters = () => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Provider filter
    if (filters.provider) {
      filtered = filtered.filter(t => t.provider === filters.provider);
    }

    // Complexity filter
    if (filters.complexity) {
      filtered = filtered.filter(t => t.complexity === filters.complexity);
    }

    // Verified filter
    if (filters.verified !== undefined) {
      filtered = filtered.filter(t => t.isVerified === filters.verified);
    }

    // Featured filter
    if (filters.featured !== undefined) {
      filtered = filtered.filter(t => t.isFeatured === filters.featured);
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(t => t.rating >= filters.minRating);
    }

    setFilteredTemplates(filtered);
  };

  const getCategoryIcon = (category: TemplateCategory) => {
    const icons = {
      compute: Server,
      networking: Network,
      database: Database,
      storage: Box,
      security: Lock,
      monitoring: Activity,
      kubernetes: Grid,
      serverless: Zap
    };
    return icons[category] || Package;
  };

  const getProviderColor = (provider: CloudProvider) => {
    const colors = {
      aws: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
      azure: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      gcp: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      'multi-cloud': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20'
    };
    return colors[provider] || colors.aws;
  };

  const getComplexityColor = (complexity: TemplateComplexity) => {
    const colors = {
      beginner: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      intermediate: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      advanced: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
      expert: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
    };
    return colors[complexity];
  };

  const handleTemplatePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <MainLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Resource Templates</h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Production-ready infrastructure templates for rapid deployment
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTemplates}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Templates</p>
                </div>
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Downloads</p>
                </div>
                <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Rating</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.verifiedTemplates}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Verified</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Search and Filters */}
        <FadeIn delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as TemplateCategory || undefined })}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="compute">Compute</option>
                <option value="networking">Networking</option>
                <option value="database">Database</option>
                <option value="storage">Storage</option>
                <option value="security">Security</option>
                <option value="monitoring">Monitoring</option>
                <option value="kubernetes">Kubernetes</option>
                <option value="serverless">Serverless</option>
              </select>

              {/* Provider */}
              <select
                value={filters.provider || ''}
                onChange={(e) => setFilters({ ...filters, provider: e.target.value as CloudProvider || undefined })}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Providers</option>
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="gcp">GCP</option>
                <option value="multi-cloud">Multi-Cloud</option>
              </select>

              {/* Complexity */}
              <select
                value={filters.complexity || ''}
                onChange={(e) => setFilters({ ...filters, complexity: e.target.value as TemplateComplexity || undefined })}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={() => setFilters({ ...filters, featured: !filters.featured })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.featured
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Award className="w-4 h-4 inline-block mr-1" />
                Featured
              </button>
              <button
                onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.verified
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Shield className="w-4 h-4 inline-block mr-1" />
                Verified Only
              </button>
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTemplates.length}</span> templates
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100">
              <option>Most Popular</option>
              <option>Highest Rated</option>
              <option>Recently Updated</option>
              <option>Most Downloaded</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTemplates.map((template, index) => {
            const CategoryIcon = getCategoryIcon(template.category);
            
            return (
              <FadeIn key={template.id} delay={0.3 + index * 0.05}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">v{template.version}</p>
                        </div>
                      </div>
                      {template.isVerified && (
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{template.description}</p>
                  </div>

                  {/* Badges */}
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 flex flex-wrap gap-2">
                    <Badge className={getProviderColor(template.provider)}>
                      <Cloud className="w-3 h-3 mr-1" />
                      {template.provider.toUpperCase()}
                    </Badge>
                    <Badge className={getComplexityColor(template.complexity)}>
                      {template.complexity}
                    </Badge>
                    {template.isFeatured && (
                      <Badge variant="blue">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Download className="w-4 h-4" />
                        {template.downloads.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Heart className="w-4 h-4" />
                        {template.likes}
                      </span>
                      <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        {template.rating}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Cost: {template.estimatedCost}</span>
                      <span>Deploy: {template.deploymentTime}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 flex gap-2">
                    <button
                      onClick={() => handleTemplatePreview(template)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                      <Code className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTemplate.name}</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>

                {/* Parameters */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Parameters</h3>
                  <div className="space-y-2">
                    {selectedTemplate.parameters.map((param) => (
                      <div key={param.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{param.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{param.description}</p>
                        </div>
                        {param.required && (
                          <Badge variant="red" className="text-xs">Required</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Resources Created</h3>
                  <div className="space-y-2">
                    {selectedTemplate.resources.map((resource, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{resource.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{resource.type}</p>
                        </div>
                        {resource.count && (
                          <Badge variant="blue">x{resource.count}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Deploy Template
                  </button>
                  <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Copy className="w-5 h-5" />
                    Copy
                  </button>
                  <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  );
}
