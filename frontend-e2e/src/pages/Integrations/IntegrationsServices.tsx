import React, { useState } from 'react';
import {
  RectangleStackIcon,
  MagnifyingGlassIcon,
  StarIcon,
  CloudIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Service {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'cloud' | 'monitoring' | 'communication' | 'security' | 'cicd' | 'database' | 'itsm';
  logo: string;
  rating: number;
  reviews: number;
  installs: number;
  status: 'available' | 'installed' | 'coming-soon';
  features: string[];
  pricing: string;
  documentation: string;
}

const IntegrationsServices: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [services] = useState<Service[]>([
    {
      id: '1',
      name: 'AWS',
      provider: 'Amazon Web Services',
      description: 'Cloud computing platform with comprehensive infrastructure services',
      category: 'cloud',
      logo: '☁️',
      rating: 4.8,
      reviews: 1234,
      installs: 45678,
      status: 'installed',
      features: ['EC2', 'S3', 'Lambda', 'RDS', 'CloudWatch'],
      pricing: 'Pay as you go',
      documentation: 'https://docs.aws.amazon.com'
    },
    {
      id: '2',
      name: 'Azure',
      provider: 'Microsoft',
      description: 'Enterprise cloud platform with hybrid capabilities',
      category: 'cloud',
      logo: '🔷',
      rating: 4.7,
      reviews: 892,
      installs: 34567,
      status: 'installed',
      features: ['Virtual Machines', 'Blob Storage', 'Functions', 'SQL Database'],
      pricing: 'Pay as you go',
      documentation: 'https://docs.microsoft.com/azure'
    },
    {
      id: '3',
      name: 'Google Cloud',
      provider: 'Google',
      description: 'Advanced cloud platform with AI/ML capabilities',
      category: 'cloud',
      logo: '🌐',
      rating: 4.6,
      reviews: 567,
      installs: 23456,
      status: 'available',
      features: ['Compute Engine', 'Cloud Storage', 'BigQuery', 'Kubernetes Engine'],
      pricing: 'Pay as you go',
      documentation: 'https://cloud.google.com/docs'
    },
    {
      id: '4',
      name: 'Datadog',
      provider: 'Datadog Inc',
      description: 'Comprehensive monitoring and analytics platform',
      category: 'monitoring',
      logo: '🐕',
      rating: 4.9,
      reviews: 2345,
      installs: 56789,
      status: 'installed',
      features: ['APM', 'Log Management', 'Infrastructure Monitoring', 'Dashboards'],
      pricing: 'Starting at $15/host/month',
      documentation: 'https://docs.datadoghq.com'
    },
    {
      id: '5',
      name: 'New Relic',
      provider: 'New Relic Inc',
      description: 'Observability platform for performance monitoring',
      category: 'monitoring',
      logo: '📊',
      rating: 4.5,
      reviews: 1567,
      installs: 34567,
      status: 'available',
      features: ['APM', 'Browser Monitoring', 'Mobile Monitoring', 'Synthetics'],
      pricing: 'Starting at $99/month',
      documentation: 'https://docs.newrelic.com'
    },
    {
      id: '6',
      name: 'Prometheus',
      provider: 'CNCF',
      description: 'Open-source monitoring and alerting toolkit',
      category: 'monitoring',
      logo: '🔥',
      rating: 4.7,
      reviews: 892,
      installs: 45678,
      status: 'available',
      features: ['Time Series DB', 'PromQL', 'Alertmanager', 'Service Discovery'],
      pricing: 'Free (Open Source)',
      documentation: 'https://prometheus.io/docs'
    },
    {
      id: '7',
      name: 'Slack',
      provider: 'Slack Technologies',
      description: 'Team collaboration and messaging platform',
      category: 'communication',
      logo: '💬',
      rating: 4.8,
      reviews: 3456,
      installs: 78901,
      status: 'installed',
      features: ['Channels', 'Direct Messages', 'File Sharing', 'Integrations'],
      pricing: 'Free tier available',
      documentation: 'https://api.slack.com'
    },
    {
      id: '8',
      name: 'Microsoft Teams',
      provider: 'Microsoft',
      description: 'Enterprise communication and collaboration tool',
      category: 'communication',
      logo: '👥',
      rating: 4.4,
      reviews: 2345,
      installs: 67890,
      status: 'available',
      features: ['Chat', 'Video Calls', 'File Sharing', 'Office Integration'],
      pricing: 'Included with Microsoft 365',
      documentation: 'https://docs.microsoft.com/teams'
    },
    {
      id: '9',
      name: 'Snyk',
      provider: 'Snyk Ltd',
      description: 'Developer security platform for vulnerability scanning',
      category: 'security',
      logo: '🔒',
      rating: 4.7,
      reviews: 1234,
      installs: 45678,
      status: 'installed',
      features: ['Code Scanning', 'Container Security', 'IaC Security', 'Dependency Monitoring'],
      pricing: 'Free tier available',
      documentation: 'https://docs.snyk.io'
    },
    {
      id: '10',
      name: 'Aqua Security',
      provider: 'Aqua Security',
      description: 'Cloud native security platform',
      category: 'security',
      logo: '🛡️',
      rating: 4.6,
      reviews: 567,
      installs: 23456,
      status: 'available',
      features: ['Container Scanning', 'Runtime Protection', 'Compliance', 'SBOM'],
      pricing: 'Contact for pricing',
      documentation: 'https://docs.aquasec.com'
    },
    {
      id: '11',
      name: 'Jenkins',
      provider: 'CloudBees',
      description: 'Open-source automation server for CI/CD',
      category: 'cicd',
      logo: '⚙️',
      rating: 4.5,
      reviews: 2345,
      installs: 56789,
      status: 'installed',
      features: ['Pipeline as Code', 'Plugins', 'Distributed Builds', 'Blue Ocean'],
      pricing: 'Free (Open Source)',
      documentation: 'https://www.jenkins.io/doc'
    },
    {
      id: '12',
      name: 'GitHub Actions',
      provider: 'GitHub',
      description: 'CI/CD platform integrated with GitHub',
      category: 'cicd',
      logo: '🐙',
      rating: 4.8,
      reviews: 3456,
      installs: 78901,
      status: 'available',
      features: ['Workflow Automation', 'Matrix Builds', 'Secrets Management', 'Marketplace'],
      pricing: 'Free for public repos',
      documentation: 'https://docs.github.com/actions'
    },
    {
      id: '13',
      name: 'PostgreSQL',
      provider: 'PostgreSQL Global Development Group',
      description: 'Advanced open-source relational database',
      category: 'database',
      logo: '🐘',
      rating: 4.9,
      reviews: 4567,
      installs: 89012,
      status: 'installed',
      features: ['ACID Compliance', 'JSON Support', 'Full Text Search', 'Replication'],
      pricing: 'Free (Open Source)',
      documentation: 'https://www.postgresql.org/docs'
    },
    {
      id: '14',
      name: 'MongoDB',
      provider: 'MongoDB Inc',
      description: 'Document-oriented NoSQL database',
      category: 'database',
      logo: '🍃',
      rating: 4.6,
      reviews: 2345,
      installs: 67890,
      status: 'available',
      features: ['Document Model', 'Sharding', 'Replication', 'Aggregation Framework'],
      pricing: 'Free tier available',
      documentation: 'https://docs.mongodb.com'
    },
    {
      id: '15',
      name: 'PagerDuty',
      provider: 'PagerDuty Inc',
      description: 'Incident response and on-call management',
      category: 'itsm',
      logo: '🚨',
      rating: 4.7,
      reviews: 1567,
      installs: 45678,
      status: 'installed',
      features: ['Incident Management', 'On-Call Scheduling', 'Escalation Policies', 'Analytics'],
      pricing: 'Starting at $21/user/month',
      documentation: 'https://developer.pagerduty.com'
    },
    {
      id: '16',
      name: 'ServiceNow',
      provider: 'ServiceNow Inc',
      description: 'Enterprise IT service management platform',
      category: 'itsm',
      logo: '📋',
      rating: 4.5,
      reviews: 1234,
      installs: 34567,
      status: 'available',
      features: ['Ticketing', 'Change Management', 'Asset Management', 'CMDB'],
      pricing: 'Contact for pricing',
      documentation: 'https://docs.servicenow.com'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Services', icon: RectangleStackIcon },
    { id: 'cloud', name: 'Cloud', icon: CloudIcon },
    { id: 'monitoring', name: 'Monitoring', icon: ChartBarIcon },
    { id: 'communication', name: 'Communication', icon: ChatBubbleLeftRightIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'cicd', name: 'CI/CD', icon: WrenchScrewdriverIcon },
    { id: 'database', name: 'Database', icon: CircleStackIcon },
    { id: 'itsm', name: 'ITSM', icon: BellIcon }
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'installed':
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircleIcon className="w-3 h-3" />
          Installed
        </span>;
      case 'coming-soon':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          Coming Soon
        </span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Available
        </span>;
    }
  };

  const totalServices = services.length;
  const installedServices = services.filter(s => s.status === 'installed').length;
  const availableServices = services.filter(s => s.status === 'available').length;
  const avgRating = services.reduce((sum, s) => sum + s.rating, 0) / services.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <RectangleStackIcon className="w-8 h-8 text-green-400" />
            Service Marketplace
          </h1>
          <p className="text-gray-400 mt-1">
            Browse and install integrations from our service catalog
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Services</span>
            <RectangleStackIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{totalServices}</div>
          <div className="text-sm text-gray-400 mt-1">Available</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Installed</span>
            <CheckCircleIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{installedServices}</div>
          <div className="text-sm text-green-400 mt-1">{availableServices} more available</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Rating</span>
            <StarIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</div>
          <div className="text-sm text-gray-400 mt-1">Out of 5.0</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Installs</span>
            <ArrowDownTrayIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{(services.reduce((sum, s) => sum + s.installs, 0) / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-gray-400 mt-1">Across all services</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all"
          >
            {/* Service Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{service.logo}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{service.name}</h3>
                  <p className="text-xs text-gray-400">{service.provider}</p>
                </div>
              </div>
              {getStatusBadge(service.status)}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 mb-4">{service.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {service.features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">
                  {feature}
                </span>
              ))}
              {service.features.length > 3 && (
                <span className="px-2 py-1 rounded-lg bg-gray-500/20 text-gray-400 text-xs">
                  +{service.features.length - 3} more
                </span>
              )}
            </div>

            {/* Rating and Stats */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, idx) => (
                  idx < Math.floor(service.rating) ? (
                    <StarIconSolid key={idx} className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <StarIcon key={idx} className="w-4 h-4 text-gray-600" />
                  )
                ))}
                <span className="text-sm text-white ml-1">{service.rating}</span>
              </div>
              <span className="text-xs text-gray-400">
                {service.reviews.toLocaleString()} reviews
              </span>
              <span className="text-xs text-gray-400">
                {(service.installs / 1000).toFixed(0)}K installs
              </span>
            </div>

            {/* Pricing */}
            <div className="mb-4">
              <span className="text-xs text-gray-400">Pricing: </span>
              <span className="text-sm text-white font-semibold">{service.pricing}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {service.status === 'installed' ? (
                <button className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold hover:bg-green-500/30 transition-all flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  Installed
                </button>
              ) : service.status === 'available' ? (
                <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Install
                </button>
              ) : (
                <button disabled className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
                  Coming Soon
                </button>
              )}
              <a
                href={service.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-all"
              >
                Docs
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No services found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default IntegrationsServices;
