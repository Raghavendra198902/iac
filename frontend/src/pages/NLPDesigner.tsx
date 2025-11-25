import { useState } from 'react';
import { Sparkles, Send, CheckCircle, AlertCircle, Code, Terminal, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MainLayout } from '../components/layout';
import { aiService } from '../services/aiService';  
import Button from '../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import type { BlueprintFromNLP, CloudProvider, Environment } from '../types';

export default function NLPDesigner() {
  const [userInput, setUserInput] = useState('');
  const [targetCloud, setTargetCloud] = useState<CloudProvider | ''>('');
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [budget, setBudget] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlueprintFromNLP | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Command execution state
  const [commandInput, setCommandInput] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandResult, setCommandResult] = useState<any>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'command'>('blueprint');

  const examples = [
    // Web Applications
    "I need a scalable web application on Azure with a PostgreSQL database and load balancer for production",
    "Deploy a high-availability WordPress site on Azure with CDN, auto-scaling VMs, and MySQL database",
    "Create a React app with Node.js backend on AWS using ECS, ALB, and RDS PostgreSQL",
    "Setup a Django web app on GCP with Cloud SQL, Cloud Storage for static files, and Cloud Run",
    
    // Microservices & Containers
    "Create a microservices architecture on AWS with Kubernetes, Redis caching, and RDS database",
    "Deploy a Docker-based microservices platform on Azure with AKS, Service Mesh, and Cosmos DB",
    "Setup Kubernetes cluster on GCP with Istio service mesh, Cloud SQL, and Cloud Memorystore",
    "Build a serverless microservices architecture on AWS with Lambda, API Gateway, and DynamoDB",
    
    // Data & Analytics
    "Setup a data analytics pipeline on GCP with Cloud Storage, BigQuery, and Dataflow for processing",
    "Create a real-time data streaming platform on AWS with Kinesis, Lambda, and Redshift",
    "Deploy a data lake on Azure with Data Lake Storage, Databricks, and Synapse Analytics",
    "Build an ETL pipeline on GCP with Pub/Sub, Dataflow, and BigQuery for data warehousing",
    
    // Machine Learning & AI
    "Setup a machine learning platform on AWS with SageMaker, S3, and model deployment infrastructure",
    "Create an ML training pipeline on GCP with Vertex AI, Cloud Storage, and GPU instances",
    "Deploy an AI inference service on Azure with AKS, ML models, and Application Insights",
    
    // E-commerce & Retail
    "Build a scalable e-commerce platform on AWS with product catalog, shopping cart, and payment processing",
    "Create an online store on Azure with inventory management, order processing, and CDN for images",
    "Setup a multi-region e-commerce site on GCP with global load balancing and Cloud SQL",
    
    // Mobile Backend
    "Create a mobile app backend on AWS with user authentication, push notifications, and file storage",
    "Setup a mobile API on Azure with App Service, Cosmos DB, and Notification Hubs",
    "Build a Firebase-based mobile backend on GCP with authentication, Firestore, and Cloud Functions",
    
    // IoT & Real-time
    "Deploy an IoT platform on AWS with IoT Core, time-series database, and real-time analytics",
    "Create an IoT solution on Azure with IoT Hub, Stream Analytics, and Cosmos DB",
    "Setup a sensor data processing pipeline on GCP with IoT Core, Pub/Sub, and BigQuery",
    
    // Gaming
    "Build a multiplayer game backend on AWS with GameLift, DynamoDB, and ElastiCache",
    "Create a game server infrastructure on Azure with PlayFab integration and Azure Functions",
    
    // DevOps & CI/CD
    "Setup a complete CI/CD pipeline on AWS with CodePipeline, CodeBuild, and ECS deployment",
    "Create a DevOps platform on Azure with Azure DevOps, Container Registry, and AKS",
    "Build a GitOps workflow on GCP with Cloud Build, Artifact Registry, and GKE",
    
    // Content & Media
    "Create a video streaming platform on AWS with CloudFront CDN, S3 storage, and MediaConvert",
    "Setup a content delivery network on Azure with CDN, Blob Storage, and Media Services",
    "Build a media processing pipeline on GCP with Cloud Storage, Transcoder API, and Cloud CDN",
    
    // Security & Compliance
    "Deploy a secure multi-tier application on AWS with VPC isolation, WAF, and encrypted databases",
    "Create a PCI-DSS compliant payment processing infrastructure on Azure with HSM and Key Vault",
    "Setup a HIPAA-compliant healthcare application on GCP with encrypted storage and audit logging",
  ];

  const commandExamples = [
    "Deploy the infrastructure to production",
    "Show me the current status of my infrastructure",
    "Plan the deployment without applying changes",
    "Check the cost estimate for this blueprint",
    "Generate Terraform configuration",
    "Destroy the staging environment",
    "Validate the infrastructure configuration",
    "Apply changes to development environment",
    "Show resource dependencies",
    "Export blueprint as CloudFormation template",
  ];

  const handleGenerate = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Generating blueprint with:', {
        userInput,
        targetCloud,
        environment,
        budget,
        region
      });
      
      const result = await aiService.generateFromNLP({
        userInput,
        targetCloud: targetCloud as CloudProvider,
        environment: environment as Environment,
        budget: budget ? parseFloat(budget) : undefined,
        region: region || undefined,
      });
      
      console.log('Blueprint generated:', result);
      setResult(result);
      toast.success('Blueprint generated successfully!');
    } catch (err: any) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      
      let errorMessage = 'Failed to generate blueprint. Please try again.';
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to API server. Please check your connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlueprint = () => {
    if (result) {
      // In real app, save to backend
      navigate(`/blueprints/${result.blueprintId}`);
    }
  };

  const handleSaveAsTemplate = () => {
    if (result) {
      // Generate Terraform code from the blueprint
      const terraformCode = generateTerraformFromBlueprint(result);
      
      // Navigate to IAC Generator with the template data
      navigate('/iac', { 
        state: { 
          createTemplate: true,
          templateData: {
            name: result.name,
            description: result.description,
            resources: result.resources.length,
            code: terraformCode,
          }
        } 
      });
    }
  };

  const handleExecuteCommand = async () => {
    if (!commandInput.trim()) return;

    setCommandLoading(true);
    setCommandError(null);
    setCommandResult(null);

    try {
      console.log('Executing command:', commandInput);
      
      // Parse the command using intent analysis
      const intent = await aiService.analyzeIntent({
        query: commandInput,
        context: result ? {
          blueprintId: result.blueprintId,
          blueprintName: result.name,
          resources: result.resources
        } : undefined
      });

      console.log('Intent analyzed:', intent);

      // Execute based on intent
      if (intent.intent === 'deploy' || intent.intent === 'provision') {
        setCommandResult({
          type: 'deployment',
          status: 'initiated',
          message: `Deployment initiated for ${intent.entities?.blueprint || 'infrastructure'}`,
          command: intent.suggestedAction || 'terraform apply',
          details: intent
        });
        toast.success('Deployment command prepared!');
      } else if (intent.intent === 'status' || intent.intent === 'check') {
        setCommandResult({
          type: 'status',
          status: 'checking',
          message: 'Checking infrastructure status...',
          command: intent.suggestedAction || 'terraform show',
          details: intent
        });
        toast.success('Status check initiated!');
      } else if (intent.intent === 'destroy' || intent.intent === 'delete') {
        setCommandResult({
          type: 'destruction',
          status: 'warning',
          message: `Destroy command prepared for ${intent.entities?.blueprint || 'infrastructure'}. Confirm to proceed.`,
          command: intent.suggestedAction || 'terraform destroy',
          details: intent
        });
        toast.error('⚠️ Destroy command requires confirmation!');
      } else if (intent.intent === 'plan' || intent.intent === 'preview') {
        setCommandResult({
          type: 'planning',
          status: 'running',
          message: 'Generating execution plan...',
          command: intent.suggestedAction || 'terraform plan',
          details: intent
        });
        toast.success('Plan generation started!');
      } else {
        setCommandResult({
          type: 'general',
          status: 'processed',
          message: `Command interpreted as: ${intent.intent}`,
          command: intent.suggestedAction || commandInput,
          details: intent
        });
        toast.success('Command processed!');
      }

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Command execution error:', error);
      
      let errorMessage = 'Failed to execute command. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setCommandError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCommandLoading(false);
    }
  };

  const generateTerraformFromBlueprint = (blueprint: BlueprintFromNLP): string => {
    const provider = blueprint.targetCloud.toLowerCase();
    
    let code = `# ${blueprint.name}
# Generated from AI Blueprint Designer
# ${blueprint.description}

terraform {
  required_providers {`;

    if (provider === 'aws') {
      code += `
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }`;
    } else if (provider === 'azure') {
      code += `
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }`;
    } else if (provider === 'gcp') {
      code += `
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }`;
    }

    code += `
  }
}

provider "${provider === 'aws' ? 'aws' : provider === 'azure' ? 'azurerm' : 'google'}" {
  region = var.region
}

variable "region" {
  description = "Deployment region"
  type        = string
  default     = "${blueprint.environment || 'us-east-1'}"
}

variable "environment" {

# Resources
`;

    // Add resource blocks based on blueprint
    blueprint.resources.forEach((resource) => {
      code += `
# ${resource.name} - ${resource.type}
# ${resource.reasoning || 'Generated resource'}
# Estimated cost: $${resource.estimatedCost?.toFixed(2) || '0.00'}/month

`;
    });

    code += `
# Outputs
output "infrastructure_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    blueprint_name = "${blueprint.name}"
    environment    = var.environment
    region         = var.region
    resources      = ${blueprint.resources.length}
  }
}
`;

    return code;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Blueprint Designer</h1>
          <p className="text-gray-600 dark:text-gray-300">Generate infrastructure from natural language descriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs for Blueprint vs Command */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <Tabs defaultValue="blueprint" value={activeTab} onValueChange={(val) => setActiveTab(val as 'blueprint' | 'command')}>
              <TabsList className="mb-4">
                <TabsTrigger value="blueprint" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Blueprint Designer
                </TabsTrigger>
                <TabsTrigger value="command" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Command Executor
                </TabsTrigger>
              </TabsList>

              {/* Blueprint Tab */}
              <TabsContent value="blueprint">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Describe Your Infrastructure</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="label dark:text-gray-300">What do you need?</label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      rows={6}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      placeholder="Describe your infrastructure needs in plain English... e.g., 'I need a scalable web application...'"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label dark:text-gray-300">Cloud Provider (Optional)</label>
                      <select
                        value={targetCloud}
                        onChange={(e) => setTargetCloud(e.target.value as CloudProvider | '')}
                        className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      >
                        <option value="">Auto-detect</option>
                        <option value="azure">Azure</option>
                        <option value="aws">AWS</option>
                        <option value="gcp">GCP</option>
                        <option value="on-premise">On-Premise / Data Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="label dark:text-gray-300">Environment (Optional)</label>
                      <select
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value as Environment | '')}
                        className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      >
                        <option value="">Auto-detect</option>
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Budget (Optional)</label>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="input"
                        placeholder="Monthly budget in USD"
                      />
                    </div>

                    <div>
                      <label className="label">Region (Optional)</label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="input"
                        placeholder="e.g., eastus, us-west-2"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!userInput.trim()}
                    loading={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Generate Blueprint
                  </Button>
                </div>
              </TabsContent>

              {/* Command Tab */}
              <TabsContent value="command">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Execute Commands</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="label dark:text-gray-300">What would you like to do?</label>
                    <textarea
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      rows={4}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      placeholder="Describe what you want to do... e.g., 'Deploy the infrastructure to production'"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Example commands:</p>
                    <div className="flex flex-wrap gap-2">
                      {commandExamples.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCommandInput(example)}
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                                   text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleExecuteCommand}
                    disabled={!commandInput.trim()}
                    loading={commandLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Execute Command
                  </Button>

                  {/* Command Result */}
                  {commandResult && (
                    <div className={`p-4 rounded-lg ${
                      commandResult.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                      commandResult.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                      'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        {commandResult.status === 'warning' ? (
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {commandResult.type === 'deployment' && 'Deployment'}
                            {commandResult.type === 'status' && 'Status Check'}
                            {commandResult.type === 'destruction' && 'Destroy Command'}
                            {commandResult.type === 'planning' && 'Execution Plan'}
                            {commandResult.type === 'general' && 'Command Processed'}
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{commandResult.message}</p>
                          <div className="bg-gray-900 dark:bg-gray-950 rounded p-3 mt-2">
                            <code className="text-sm text-green-400 font-mono">{commandResult.command}</code>
                          </div>
                          {commandResult.details?.confidence && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Confidence: {(commandResult.details.confidence * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {commandError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Command Error</h4>
                          <p className="text-sm text-red-700 dark:text-red-300">{commandError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Result Section */}
          {result && (
            <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generated Blueprint</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Confidence:</span>
                  <span className="badge badge-success">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{result.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{result.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-primary">{result.targetCloud}</span>
                    <span className="badge badge-gray">{result.environment}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Resources ({result.resources.length})</h4>
                  <div className="space-y-3">
                    {result.resources.map((resource, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">{resource.name}</h5>
                              {resource.quantity && resource.quantity > 1 && (
                                <span className="badge badge-gray">x{resource.quantity}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{resource.type}</p>
                            {resource.sku && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {resource.sku}</p>
                            )}
                            {resource.reasoning && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">{resource.reasoning}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {resource.confidence && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {(resource.confidence * 100).toFixed(0)}% confident
                              </div>
                            )}
                            {resource.estimatedCost && (
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                ${resource.estimatedCost.toFixed(2)}/mo
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 border dark:border-primary-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-primary-300">Estimated Total Cost</h4>
                    <p className="text-sm text-gray-600 dark:text-primary-400">Monthly estimate</p>
                  </div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ${result.resources.reduce((sum, r) => sum + (r.estimatedCost || 0), 0).toFixed(2)}/mo
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSaveBlueprint} className="btn-primary flex-1">
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Save Blueprint
                  </button>
                  <button 
                    onClick={handleSaveAsTemplate}
                    className="btn-secondary flex-1"
                  >
                    <Code className="h-5 w-5 inline mr-2" />
                    Save as Template
                  </button>
                  <button className="btn-secondary">
                    Refine
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="card bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
              <div className="flex items-center gap-2 text-danger-700 dark:text-danger-400">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Examples Section */}
        <div className="space-y-6">
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Example Prompts</h3>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setUserInput(example)}
                  className="text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors w-full text-sm text-gray-700 dark:text-gray-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-primary-900 dark:text-primary-300 mb-2">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-400">
              <li>• Be specific about your requirements</li>
              <li>• Mention cloud provider if you have a preference</li>
              <li>• Include environment (dev/staging/prod)</li>
              <li>• Specify budget constraints if any</li>
              <li>• Describe scaling and HA needs</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
