import React, { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  code?: string;
  blueprint?: any;
}

interface Example {
  id: string;
  prompt: string;
  category: string;
  description: string;
}

const NaturalLanguageInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I can help you design and deploy infrastructure using natural language. Just describe what you need, and I\'ll generate the architecture, code, and deployment plan for you.',
      timestamp: '10:30 AM'
    }
  ]);

  const [examples] = useState<Example[]>([
    {
      id: '1',
      prompt: 'Create a scalable e-commerce platform on AWS with auto-scaling',
      category: 'Web Application',
      description: 'Multi-tier web app with load balancer, auto-scaling, and RDS'
    },
    {
      id: '2',
      prompt: 'Deploy a microservices architecture on Kubernetes with service mesh',
      category: 'Microservices',
      description: 'Container orchestration with Istio, monitoring, and CI/CD'
    },
    {
      id: '3',
      prompt: 'Build a data analytics pipeline with real-time processing',
      category: 'Data Engineering',
      description: 'Kafka, Spark, S3, and Athena for big data analytics'
    },
    {
      id: '4',
      prompt: 'Set up a machine learning model serving infrastructure',
      category: 'ML/AI',
      description: 'MLflow, SageMaker, API Gateway for model deployment'
    },
    {
      id: '5',
      prompt: 'Create a serverless API with authentication and database',
      category: 'Serverless',
      description: 'Lambda, API Gateway, DynamoDB with Cognito auth'
    },
    {
      id: '6',
      prompt: 'Deploy a high-availability PostgreSQL cluster with replication',
      category: 'Database',
      description: 'Multi-AZ RDS with read replicas and backup automation'
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Simulate AI response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `I understand you want to ${input.toLowerCase()}. Let me analyze your requirements and generate an optimal architecture...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'View generated Terraform code',
        'See architecture diagram',
        'Review cost estimate',
        'Deploy to staging'
      ],
      code: `# Generated Infrastructure as Code
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  
  tags = {
    Name = "web-server"
    Environment = "production"
  }
}

resource "aws_lb" "main" {
  name               = "main-lb"
  internal           = false
  load_balancer_type = "application"
  
  enable_deletion_protection = true
}`,
      blueprint: {
        services: 4,
        estimatedCost: '$345/month',
        deployTime: '8 minutes',
        confidence: 94
      }
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-400" />
            Natural Language Interface
          </h1>
          <p className="text-gray-400 mt-1">
            Generate infrastructure from plain English descriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            AI Model Active
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Blueprints Generated</span>
            <SparklesIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">1,247</div>
          <div className="text-sm text-green-400 mt-1">↑ 23 today</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Generation Time</span>
            <ClockIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">6.2s</div>
          <div className="text-sm text-green-400 mt-1">↓ 1.3s</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Success Rate</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">96.8%</div>
          <div className="text-sm text-gray-400 mt-1">Last 30 days</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Languages Supported</span>
            <CodeBracketIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">5</div>
          <div className="text-sm text-gray-400 mt-1">TF, CF, ARM, etc</div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-12rem)]">
        {/* Examples Sidebar */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-yellow-400" />
            Example Prompts
          </h2>
          <div className="space-y-3">
            {examples.map((example) => (
              <div
                key={example.id}
                onClick={() => handleExampleClick(example.prompt)}
                className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400">
                    {example.category}
                  </span>
                </div>
                <p className="text-sm text-white font-medium mb-2">{example.prompt}</p>
                <p className="text-xs text-gray-400">{example.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {message.code && (
                    <div className="mt-3 bg-black/30 rounded-lg p-3 font-mono text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">Generated Code</span>
                        <button className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs">
                          Copy
                        </button>
                      </div>
                      <pre className="text-gray-300 whitespace-pre-wrap">{message.code}</pre>
                    </div>
                  )}

                  {message.blueprint && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-xs text-gray-400 block">Services</span>
                        <span className="text-sm font-semibold">{message.blueprint.services}</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-xs text-gray-400 block">Est. Cost</span>
                        <span className="text-sm font-semibold text-green-400">{message.blueprint.estimatedCost}</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-xs text-gray-400 block">Deploy Time</span>
                        <span className="text-sm font-semibold">{message.blueprint.deployTime}</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="text-xs text-gray-400 block">Confidence</span>
                        <span className="text-sm font-semibold text-purple-400">{message.blueprint.confidence}%</span>
                      </div>
                    </div>
                  )}

                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs rounded-full border border-white/20"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-xs opacity-60 mt-2 block">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe your infrastructure requirements..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl flex items-center gap-2 transition-all"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <SparklesIcon className="w-4 h-4" />
              <span>AI will generate Terraform, CloudFormation, or ARM templates based on your description</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <DocumentTextIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Multi-Cloud Support</h3>
              <p className="text-xs text-gray-400">AWS, Azure, GCP, and on-premise</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CodeBracketIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Code Generation</h3>
              <p className="text-xs text-gray-400">Terraform, CloudFormation, ARM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Best Practices</h3>
              <p className="text-xs text-gray-400">Security, compliance, cost optimization</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">AI-Powered</h3>
              <p className="text-xs text-gray-400">GPT-4 + custom ML models</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageInterface;
