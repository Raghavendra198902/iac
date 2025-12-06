import React, { useState } from 'react';
import { DocumentTextIcon, RocketLaunchIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';

const InfrastructureTemplates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 1,
      name: 'Web Application Stack',
      description: 'Complete web app with load balancer, auto-scaling group, and RDS database',
      category: 'web',
      provider: 'AWS',
      resources: 12,
      deployTime: '15 mins',
      popularity: 245,
      tags: ['EC2', 'ALB', 'RDS', 'Auto Scaling']
    },
    {
      id: 2,
      name: 'Kubernetes Cluster',
      description: 'Production-ready Kubernetes cluster with monitoring and logging',
      category: 'containers',
      provider: 'AWS',
      resources: 8,
      deployTime: '20 mins',
      popularity: 189,
      tags: ['EKS', 'VPC', 'IAM', 'CloudWatch']
    },
    {
      id: 3,
      name: 'Serverless API',
      description: 'Serverless REST API with Lambda, API Gateway, and DynamoDB',
      category: 'serverless',
      provider: 'AWS',
      resources: 6,
      deployTime: '10 mins',
      popularity: 312,
      tags: ['Lambda', 'API Gateway', 'DynamoDB']
    },
    {
      id: 4,
      name: 'Data Lake',
      description: 'Complete data lake solution with S3, Glue, and Athena',
      category: 'data',
      provider: 'AWS',
      resources: 10,
      deployTime: '25 mins',
      popularity: 156,
      tags: ['S3', 'Glue', 'Athena', 'EMR']
    },
    {
      id: 5,
      name: 'Azure Web App',
      description: 'Azure App Service with SQL Database and Application Insights',
      category: 'web',
      provider: 'Azure',
      resources: 7,
      deployTime: '12 mins',
      popularity: 198,
      tags: ['App Service', 'SQL Database', 'App Insights']
    },
    {
      id: 6,
      name: 'CI/CD Pipeline',
      description: 'Complete CI/CD pipeline with CodePipeline and CodeBuild',
      category: 'devops',
      provider: 'AWS',
      resources: 9,
      deployTime: '18 mins',
      popularity: 223,
      tags: ['CodePipeline', 'CodeBuild', 'S3']
    }
  ];

  const categories = ['all', 'web', 'containers', 'serverless', 'data', 'devops'];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 left-1/4"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-1/4 animation-delay-2000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        ></div>
      ))}

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Infrastructure Templates
          </h1>
          <p className="text-gray-300">Deploy pre-configured infrastructure with one click</p>
        </div>

        {/* Category Filter */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <DocumentTextIcon className="w-12 h-12 text-purple-400" />
                <div className="flex items-center space-x-1 text-pink-400">
                  <HeartIcon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{template.popularity}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{template.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded-lg text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{template.provider}</span>
                <span>{template.resources} resources</span>
                <span>{template.deployTime}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-white/10 rounded-xl text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center">
                  <EyeIcon className="w-5 h-5 mr-2" />
                  Preview
                </button>
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center">
                  <RocketLaunchIcon className="w-5 h-5 mr-2" />
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default InfrastructureTemplates;
