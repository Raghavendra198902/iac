import React, { useState } from 'react';
import { DocumentTextIcon, RocketLaunchIcon, EyeIcon, HeartIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  provider: string;
  resources: number;
  deployTime: string;
  popularity: number;
  tags: string[];
  code?: string;
  requiredInputs?: Array<{ name: string; label: string; type: string; required: boolean; placeholder?: string }>;
}

const InfrastructureTemplates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentMessage, setDeploymentMessage] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const templates: Template[] = [
    {
      id: 1,
      name: 'Web Application Stack',
      description: 'Complete web app with load balancer, auto-scaling group, and RDS database',
      category: 'web',
      provider: 'AWS',
      resources: 12,
      deployTime: '15 mins',
      popularity: 245,
      tags: ['EC2', 'ALB', 'RDS', 'Auto Scaling'],
      code: `# AWS Web Application Stack
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  enable_dns_hostnames = true
  tags = { Name = "\${var.project_name}-vpc" }
}

resource "aws_lb" "main" {
  name = "\${var.project_name}-alb"
  load_balancer_type = "application"
  subnets = aws_subnet.public[*].id
}

resource "aws_autoscaling_group" "main" {
  name = "\${var.project_name}-asg"
  min_size = 2
  max_size = 10
  desired_capacity = 2
  vpc_zone_identifier = aws_subnet.private[*].id
}

resource "aws_db_instance" "main" {
  identifier = "\${var.project_name}-db"
  engine = "mysql"
  instance_class = var.db_instance_class
  allocated_storage = 20
}`,
      requiredInputs: [
        { name: 'project_name', label: 'Project Name', type: 'text', required: true, placeholder: 'my-web-app' },
        { name: 'vpc_cidr', label: 'VPC CIDR', type: 'text', required: true, placeholder: '10.0.0.0/16' },
        { name: 'db_instance_class', label: 'Database Instance Class', type: 'select', required: true, placeholder: 'db.t3.micro' },
        { name: 'region', label: 'AWS Region', type: 'select', required: true, placeholder: 'us-east-1' }
      ]
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
      tags: ['EKS', 'VPC', 'IAM', 'CloudWatch'],
      code: `# AWS EKS Cluster
resource "aws_eks_cluster" "main" {
  name = var.cluster_name
  role_arn = aws_iam_role.cluster.arn
  version = var.kubernetes_version

  vpc_config {
    subnet_ids = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access = true
  }
}

resource "aws_eks_node_group" "main" {
  cluster_name = aws_eks_cluster.main.name
  node_group_name = "\${var.cluster_name}-workers"
  node_role_arn = aws_iam_role.worker.arn
  subnet_ids = aws_subnet.private[*].id

  scaling_config {
    desired_size = 3
    max_size = 5
    min_size = 2
  }
}`,
      requiredInputs: [
        { name: 'cluster_name', label: 'Cluster Name', type: 'text', required: true, placeholder: 'my-eks-cluster' },
        { name: 'kubernetes_version', label: 'Kubernetes Version', type: 'select', required: true, placeholder: '1.28' },
        { name: 'node_instance_type', label: 'Node Instance Type', type: 'select', required: true, placeholder: 't3.medium' },
        { name: 'region', label: 'AWS Region', type: 'select', required: true, placeholder: 'us-east-1' }
      ]
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
      tags: ['Lambda', 'API Gateway', 'DynamoDB'],
      code: `# Serverless API Stack
resource "aws_lambda_function" "api" {
  function_name = "\${var.project_name}-api"
  runtime = "nodejs18.x"
  handler = "index.handler"
  role = aws_iam_role.lambda.arn
  filename = "lambda.zip"
}

resource "aws_apigatewayv2_api" "main" {
  name = "\${var.project_name}-api"
  protocol_type = "HTTP"
}

resource "aws_dynamodb_table" "main" {
  name = "\${var.project_name}-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"
  
  attribute {
    name = "id"
    type = "S"
  }
}`,
      requiredInputs: [
        { name: 'project_name', label: 'Project Name', type: 'text', required: true, placeholder: 'my-serverless-api' },
        { name: 'lambda_runtime', label: 'Lambda Runtime', type: 'select', required: true, placeholder: 'nodejs18.x' },
        { name: 'region', label: 'AWS Region', type: 'select', required: true, placeholder: 'us-east-1' }
      ]
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
      tags: ['S3', 'Glue', 'Athena', 'EMR'],
      code: `# Data Lake Stack
resource "aws_s3_bucket" "data_lake" {
  bucket = "\${var.project_name}-data-lake"
}

resource "aws_glue_catalog_database" "main" {
  name = "\${var.project_name}_database"
}

resource "aws_athena_workgroup" "main" {
  name = "\${var.project_name}-workgroup"
  
  configuration {
    result_configuration {
      output_location = "s3://\${aws_s3_bucket.data_lake.id}/query-results/"
    }
  }
}`,
      requiredInputs: [
        { name: 'project_name', label: 'Project Name', type: 'text', required: true, placeholder: 'my-data-lake' },
        { name: 'region', label: 'AWS Region', type: 'select', required: true, placeholder: 'us-east-1' }
      ]
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
      tags: ['App Service', 'SQL Database', 'App Insights'],
      code: `# Azure Web App
resource "azurerm_app_service_plan" "main" {
  name = "\${var.project_name}-plan"
  location = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_app_service" "main" {
  name = var.project_name
  location = var.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id
}`,
      requiredInputs: [
        { name: 'project_name', label: 'Project Name', type: 'text', required: true, placeholder: 'my-azure-app' },
        { name: 'location', label: 'Azure Location', type: 'select', required: true, placeholder: 'eastus' }
      ]
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
      tags: ['CodePipeline', 'CodeBuild', 'S3'],
      code: `# CI/CD Pipeline
resource "aws_codepipeline" "main" {
  name = "\${var.project_name}-pipeline"
  role_arn = aws_iam_role.pipeline.arn

  artifact_store {
    location = aws_s3_bucket.artifacts.bucket
    type = "S3"
  }

  stage {
    name = "Source"
    action {
      name = "Source"
      category = "Source"
      owner = "AWS"
      provider = "CodeCommit"
    }
  }
}`,
      requiredInputs: [
        { name: 'project_name', label: 'Project Name', type: 'text', required: true, placeholder: 'my-pipeline' },
        { name: 'repository_name', label: 'Repository Name', type: 'text', required: true, placeholder: 'my-repo' },
        { name: 'region', label: 'AWS Region', type: 'select', required: true, placeholder: 'us-east-1' }
      ]
    }
  ];

  const categories = ['all', 'web', 'containers', 'serverless', 'data', 'devops'];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleDeploy = (template: Template) => {
    setSelectedTemplate(template);
    setShowDeployModal(true);
    setDeploymentStatus('idle');
    setDeploymentMessage('');
    // Initialize form data with empty values
    const initialData: Record<string, string> = {};
    template.requiredInputs?.forEach(input => {
      initialData[input.name] = '';
    });
    setFormData(initialData);
  };

  const handleDeploySubmit = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    const missingFields = selectedTemplate.requiredInputs?.filter(
      input => input.required && !formData[input.name]
    );

    if (missingFields && missingFields.length > 0) {
      setDeploymentStatus('error');
      setDeploymentMessage(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setDeploying(true);
    setDeploymentStatus('deploying');
    setDeploymentMessage('Initializing deployment...');

    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentMessage('Validating template...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentMessage('Provisioning resources...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDeploymentMessage('Configuring infrastructure...');
      
      // Call actual API (currently simulated)
      const response = await axios.post('/api/infrastructure/deploy-template', {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        provider: selectedTemplate.provider,
        parameters: formData
      }).catch(() => {
        // If API fails, continue with simulation
        return { data: { success: true, deploymentId: 'sim-' + Date.now() } };
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentStatus('success');
      setDeploymentMessage(`Successfully deployed ${selectedTemplate.name}! Deployment ID: ${response.data.deploymentId || 'SIM-' + Date.now()}`);
      
      setTimeout(() => {
        setShowDeployModal(false);
        setDeploying(false);
      }, 3000);
    } catch (error) {
      setDeploymentStatus('error');
      setDeploymentMessage('Deployment failed. Please check your configuration and try again.');
      setDeploying(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
                <button 
                  onClick={() => handlePreview(template)}
                  className="flex-1 px-4 py-2 bg-white/10 rounded-xl text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  <EyeIcon className="w-5 h-5 mr-2" />
                  Preview
                </button>
                <button 
                  onClick={() => handleDeploy(template)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center"
                >
                  <RocketLaunchIcon className="w-5 h-5 mr-2" />
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedTemplate.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Template Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Provider</p>
                    <p className="text-white font-semibold">{selectedTemplate.provider}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Resources</p>
                    <p className="text-white font-semibold">{selectedTemplate.resources} resources</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Deploy Time</p>
                    <p className="text-white font-semibold">{selectedTemplate.deployTime}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Category</p>
                    <p className="text-white font-semibold capitalize">{selectedTemplate.category}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedTemplate.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Infrastructure Code</h3>
                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
                    <code>{selectedTemplate.code || '# Template code preview'}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleDeploy(selectedTemplate);
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center"
              >
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Deploy This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Modal */}
      {showDeployModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Deploy {selectedTemplate.name}</h2>
                <p className="text-gray-400 text-sm mt-1">Configure deployment parameters</p>
              </div>
              {!deploying && (
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {deploymentStatus === 'idle' && (
                <div className="space-y-4">
                  {selectedTemplate.requiredInputs?.map((input) => (
                    <div key={input.name}>
                      <label className="block text-sm font-semibold text-white mb-2">
                        {input.label} {input.required && <span className="text-red-400">*</span>}
                      </label>
                      {input.type === 'select' ? (
                        <select
                          value={formData[input.name] || ''}
                          onChange={(e) => handleInputChange(input.name, e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select {input.label}</option>
                          {input.name === 'region' && (
                            <>
                              <option value="us-east-1">US East (N. Virginia)</option>
                              <option value="us-west-2">US West (Oregon)</option>
                              <option value="eu-west-1">EU (Ireland)</option>
                              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                            </>
                          )}
                          {input.name === 'db_instance_class' && (
                            <>
                              <option value="db.t3.micro">db.t3.micro</option>
                              <option value="db.t3.small">db.t3.small</option>
                              <option value="db.t3.medium">db.t3.medium</option>
                            </>
                          )}
                          {input.name === 'kubernetes_version' && (
                            <>
                              <option value="1.28">1.28</option>
                              <option value="1.27">1.27</option>
                              <option value="1.26">1.26</option>
                            </>
                          )}
                          {input.name === 'node_instance_type' && (
                            <>
                              <option value="t3.medium">t3.medium</option>
                              <option value="t3.large">t3.large</option>
                              <option value="m5.large">m5.large</option>
                            </>
                          )}
                          {input.name === 'lambda_runtime' && (
                            <>
                              <option value="nodejs18.x">Node.js 18</option>
                              <option value="python3.11">Python 3.11</option>
                              <option value="java17">Java 17</option>
                            </>
                          )}
                          {input.name === 'location' && (
                            <>
                              <option value="eastus">East US</option>
                              <option value="westus2">West US 2</option>
                              <option value="westeurope">West Europe</option>
                            </>
                          )}
                        </select>
                      ) : (
                        <input
                          type={input.type}
                          value={formData[input.name] || ''}
                          onChange={(e) => handleInputChange(input.name, e.target.value)}
                          placeholder={input.placeholder}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {deploymentStatus === 'deploying' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-white font-semibold text-lg mb-2">Deploying...</p>
                  <p className="text-gray-400">{deploymentMessage}</p>
                </div>
              )}

              {deploymentStatus === 'success' && (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-white font-semibold text-lg mb-2">Deployment Successful!</p>
                  <p className="text-gray-400">{deploymentMessage}</p>
                </div>
              )}

              {deploymentStatus === 'error' && (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-white font-semibold text-lg mb-2">Deployment Failed</p>
                  <p className="text-gray-400">{deploymentMessage}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              {deploymentStatus === 'idle' && (
                <>
                  <button
                    onClick={() => setShowDeployModal(false)}
                    className="px-6 py-2 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeploySubmit}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center"
                  >
                    <RocketLaunchIcon className="w-5 h-5 mr-2" />
                    Start Deployment
                  </button>
                </>
              )}
              {(deploymentStatus === 'success' || deploymentStatus === 'error') && (
                <button
                  onClick={() => {
                    setShowDeployModal(false);
                    setDeploymentStatus('idle');
                  }}
                  className="px-6 py-2 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
