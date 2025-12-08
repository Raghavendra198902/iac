import React, { useState, useEffect } from 'react';
import {
  PuzzlePieceIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  ServerIcon,
  CloudIcon,
  CircleStackIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface IntegrationPattern {
  id: string;
  name: string;
  category: 'messaging' | 'api' | 'data' | 'event' | 'orchestration';
  description: string;
  useCase: string;
  pros: string[];
  cons: string[];
  complexity: 'low' | 'medium' | 'high';
  adoption: number;
  examples: string[];
}

const SAPatterns: React.FC = () => {
  const [patterns, setPatterns] = useState<IntegrationPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPattern, setSelectedPattern] = useState<IntegrationPattern | null>(null);

  useEffect(() => {
    loadIntegrationPatterns();
  }, []);

  const loadIntegrationPatterns = () => {
    const samplePatterns: IntegrationPattern[] = [
      {
        id: '1',
        name: 'API Gateway Pattern',
        category: 'api',
        description: 'Centralized entry point for all client requests to microservices',
        useCase: 'Microservices architecture with multiple backend services',
        pros: [
          'Single entry point for clients',
          'Centralized authentication & authorization',
          'Request routing and load balancing',
          'Protocol translation (REST, gRPC, GraphQL)'
        ],
        cons: [
          'Single point of failure if not highly available',
          'Can become a bottleneck',
          'Added latency for request routing'
        ],
        complexity: 'medium',
        adoption: 95,
        examples: ['Kong API Gateway', 'AWS API Gateway', 'Azure API Management']
      },
      {
        id: '2',
        name: 'Event-Driven Architecture',
        category: 'event',
        description: 'Asynchronous communication through events and message brokers',
        useCase: 'Real-time data processing and loosely coupled systems',
        pros: [
          'Loose coupling between services',
          'High scalability and resilience',
          'Asynchronous processing',
          'Event sourcing capabilities'
        ],
        cons: [
          'Eventual consistency challenges',
          'Complex debugging and monitoring',
          'Message ordering complexities'
        ],
        complexity: 'high',
        adoption: 88,
        examples: ['Kafka', 'RabbitMQ', 'AWS EventBridge']
      },
      {
        id: '3',
        name: 'Service Mesh',
        category: 'orchestration',
        description: 'Infrastructure layer for service-to-service communication',
        useCase: 'Complex microservices with advanced networking requirements',
        pros: [
          'Traffic management and routing',
          'Security with mTLS',
          'Observability and tracing',
          'Resilience patterns (circuit breaker, retry)'
        ],
        cons: [
          'Increased complexity',
          'Performance overhead',
          'Steep learning curve'
        ],
        complexity: 'high',
        adoption: 72,
        examples: ['Istio', 'Linkerd', 'Consul Connect']
      },
      {
        id: '4',
        name: 'ETL Pipeline',
        category: 'data',
        description: 'Extract, Transform, Load pattern for data integration',
        useCase: 'Data warehouse and analytics platform integration',
        pros: [
          'Batch processing efficiency',
          'Data quality transformation',
          'Historical data loading',
          'Well-established pattern'
        ],
        cons: [
          'High latency for data availability',
          'Complex transformation logic',
          'Resource intensive'
        ],
        complexity: 'medium',
        adoption: 90,
        examples: ['Apache Airflow', 'AWS Glue', 'Talend']
      },
      {
        id: '5',
        name: 'CQRS (Command Query Responsibility Segregation)',
        category: 'data',
        description: 'Separate models for reading and writing data',
        useCase: 'High-performance systems with different read/write patterns',
        pros: [
          'Optimized read and write models',
          'Scalability for read-heavy workloads',
          'Event sourcing integration',
          'Complex query optimization'
        ],
        cons: [
          'Increased complexity',
          'Eventual consistency',
          'Code duplication risk'
        ],
        complexity: 'high',
        adoption: 65,
        examples: ['Event Store', 'Axon Framework']
      },
      {
        id: '6',
        name: 'BFF (Backend for Frontend)',
        category: 'api',
        description: 'Dedicated backend service for each frontend application',
        useCase: 'Multiple client types (web, mobile, IoT) with different needs',
        pros: [
          'Optimized for specific UI needs',
          'Independent evolution of frontends',
          'Reduced client complexity',
          'Better security control'
        ],
        cons: [
          'Code duplication across BFFs',
          'More services to maintain',
          'Potential inconsistency'
        ],
        complexity: 'medium',
        adoption: 78,
        examples: ['GraphQL BFF', 'REST BFF per platform']
      },
      {
        id: '7',
        name: 'Saga Pattern',
        category: 'orchestration',
        description: 'Distributed transactions across microservices',
        useCase: 'Long-running business transactions spanning multiple services',
        pros: [
          'Distributed transaction management',
          'Compensation for failures',
          'Maintains data consistency',
          'Works with event-driven architecture'
        ],
        cons: [
          'Complex implementation',
          'Difficult to debug',
          'Requires compensating transactions'
        ],
        complexity: 'high',
        adoption: 68,
        examples: ['Choreography Saga', 'Orchestration Saga']
      },
      {
        id: '8',
        name: 'Publish-Subscribe',
        category: 'messaging',
        description: 'Asynchronous message broadcasting to multiple subscribers',
        useCase: 'Event notification and real-time updates',
        pros: [
          'Decoupled publishers and subscribers',
          'Dynamic subscription management',
          'Scalable message distribution',
          'Supports multiple consumers'
        ],
        cons: [
          'Message ordering challenges',
          'Potential message duplication',
          'Debugging complexity'
        ],
        complexity: 'medium',
        adoption: 92,
        examples: ['Redis Pub/Sub', 'AWS SNS', 'Google Pub/Sub']
      }
    ];

    setPatterns(samplePatterns);
    setLoading(false);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-green-400 bg-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'high':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'messaging':
        return <ArrowsRightLeftIcon className="w-6 h-6 text-blue-400" />;
      case 'api':
        return <CloudIcon className="w-6 h-6 text-green-400" />;
      case 'data':
        return <CircleStackIcon className="w-6 h-6 text-purple-400" />;
      case 'event':
        return <ChartBarIcon className="w-6 h-6 text-orange-400" />;
      case 'orchestration':
        return <ServerIcon className="w-6 h-6 text-cyan-400" />;
      default:
        return <PuzzlePieceIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const categories = ['all', 'messaging', 'api', 'data', 'event', 'orchestration'];
  const filteredPatterns = selectedCategory === 'all' 
    ? patterns 
    : patterns.filter(p => p.category === selectedCategory);

  const avgAdoption = patterns.reduce((sum, p) => sum + p.adoption, 0) / patterns.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading integration patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-amber-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              Integration Patterns
            </h1>
            <p className="text-gray-300">Enterprise integration patterns and best practices</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <PuzzlePieceIcon className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-bold text-white">{patterns.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Patterns</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{avgAdoption.toFixed(0)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Adoption</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ArrowsRightLeftIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">
                {patterns.filter(p => p.complexity === 'medium').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Medium Complexity</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-white">
                {categories.length - 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Categories</h3>
          </div>
        </div>

        {/* Integration Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => setSelectedPattern(selectedPattern?.id === pattern.id ? null : pattern)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getCategoryIcon(pattern.category)}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{pattern.name}</h3>
                    <p className="text-sm text-gray-400 mb-2 capitalize">{pattern.category}</p>
                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getComplexityColor(pattern.complexity)}`}>
                        {pattern.complexity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-400/20 text-blue-400">
                        {pattern.adoption}% ADOPTED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{pattern.description}</p>

              {selectedPattern?.id === pattern.id && (
                <div className="mt-4 pt-4 border-t border-white/20 space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Use Case</h4>
                    <p className="text-sm text-gray-300">{pattern.useCase}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Pros</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {pattern.pros.map((pro, index) => (
                          <li key={index}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                      <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Cons</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {pattern.cons.map((con, index) => (
                          <li key={index}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Examples</h4>
                    <div className="flex flex-wrap gap-2">
                      {pattern.examples.map((example, index) => (
                        <span key={index} className="px-2 py-1 rounded text-xs bg-white/10 text-gray-300">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default SAPatterns;
