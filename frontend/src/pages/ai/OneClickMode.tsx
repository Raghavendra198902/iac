import React, { useState } from 'react';
import {
  Zap, ArrowLeft, ArrowRight, Sparkles, CheckCircle,
  Shield, DollarSign, Clock, Users, AlertCircle, Loader2,
  FileText, Code, GitBranch, BarChart3, Lock, Download,
  Eye, Share2, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  businessGoal: string;
  compliance: string[];
  budgetMin: number;
  budgetMax: number;
  timelineMonths: number;
  usersPerDay: number;
  concurrentUsers: number;
}

interface AIAgent {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
  progress: number;
  duration?: number;
  output?: any;
}

const OneClickMode = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'processing' | 'results'>('form');
  const [formData, setFormData] = useState<FormData>({
    businessGoal: '',
    compliance: [],
    budgetMin: 50000,
    budgetMax: 200000,
    timelineMonths: 3,
    usersPerDay: 100000,
    concurrentUsers: 5000
  });

  const [agents, setAgents] = useState<AIAgent[]>([
    { id: 'chief', name: 'Chief AI Architect', status: 'pending', progress: 0 },
    { id: 'ea', name: 'Enterprise Architect Agent', status: 'pending', progress: 0 },
    { id: 'sa', name: 'Solution Architect Agent', status: 'pending', progress: 0 },
    { id: 'ta', name: 'Technical Architect Agent', status: 'pending', progress: 0 },
    { id: 'pm', name: 'Project Manager Agent', status: 'pending', progress: 0 },
    { id: 'se', name: 'Security Engineer Agent', status: 'pending', progress: 0 }
  ]);

  const complianceOptions = [
    { id: 'hipaa', name: 'HIPAA', description: 'Healthcare data' },
    { id: 'pci-dss', name: 'PCI-DSS', description: 'Payment cards' },
    { id: 'soc2', name: 'SOC 2', description: 'Enterprise SaaS' },
    { id: 'iso27001', name: 'ISO 27001', description: 'Security management' },
    { id: 'gdpr', name: 'GDPR', description: 'EU privacy' },
    { id: 'fedramp', name: 'FedRAMP', description: 'Government' }
  ];

  const handleComplianceToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      compliance: prev.compliance.includes(id)
        ? prev.compliance.filter(c => c !== id)
        : [...prev.compliance, id]
    }));
  };

  const handleGenerate = () => {
    setStep('processing');
    // Simulate AI processing
    simulateAIProcessing();
  };

  const simulateAIProcessing = () => {
    // In real implementation, this would connect to WebSocket for real-time updates
    setTimeout(() => {
      setAgents(prev => prev.map((agent, idx) => 
        idx === 0 ? { ...agent, status: 'running', progress: 50 } : agent
      ));
    }, 500);

    setTimeout(() => {
      setAgents(prev => prev.map((agent, idx) => 
        idx === 0 ? { ...agent, status: 'completed', progress: 100, duration: 15 } :
        idx === 1 ? { ...agent, status: 'running', progress: 30 } : agent
      ));
    }, 2000);

    // Continue simulation...
    setTimeout(() => {
      setStep('results');
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/ai')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">One-Click Mode</div>
              <div className="text-xs text-slate-600">AI-Powered Generation</div>
            </div>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Form Step */}
        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                AI will generate everything in ~6 minutes
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                One-Click Architecture Generator
              </h1>
              <p className="text-slate-600">
                Answer these 5 questions and let AI create your complete architecture
              </p>
            </div>

            <div className="space-y-8">
              {/* Question 1: Business Goal */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  1. 📝 Describe Your Project <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.businessGoal}
                  onChange={(e) => setFormData({ ...formData, businessGoal: e.target.value })}
                  placeholder="I need a secure e-commerce platform for healthcare products with patient data management..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
                {formData.businessGoal.toLowerCase().includes('healthcare') && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>AI Suggestion: Detected healthcare + payments context. Recommending HIPAA and PCI-DSS compliance.</span>
                  </div>
                )}
              </div>

              {/* Question 2: Compliance */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  2. ☑️ Compliance Requirements
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {complianceOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleComplianceToggle(option.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.compliance.includes(option.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{option.name}</span>
                        {formData.compliance.includes(option.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <span className="text-xs text-slate-600">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Budget */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  3. 💰 Budget Range
                </label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 w-16">Min:</span>
                    <input
                      type="range"
                      min="10000"
                      max="500000"
                      step="10000"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData({ ...formData, budgetMin: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold text-slate-900 w-24">
                      ${(formData.budgetMin / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 w-16">Max:</span>
                    <input
                      type="range"
                      min="10000"
                      max="500000"
                      step="10000"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold text-slate-900 w-24">
                      ${(formData.budgetMax / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>AI Estimate: $78,500 for your requirements (within budget)</span>
                </div>
              </div>

              {/* Question 4: Timeline */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  4. ⏱️ Timeline
                </label>
                <select
                  value={formData.timelineMonths}
                  onChange={(e) => setFormData({ ...formData, timelineMonths: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 month (rapid prototype)</option>
                  <option value={2}>2 months (MVP)</option>
                  <option value={3}>3 months (full product)</option>
                  <option value={6}>6 months (enterprise)</option>
                  <option value={12}>12 months (complex system)</option>
                </select>
                <div className="mt-2 text-sm text-slate-600">
                  {formData.timelineMonths} months = {formData.timelineMonths * 4} weeks with 5 engineers
                </div>
              </div>

              {/* Question 5: Scale */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  5. 📊 Expected Scale
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-2">Users per day</label>
                    <input
                      type="number"
                      value={formData.usersPerDay}
                      onChange={(e) => setFormData({ ...formData, usersPerDay: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-2">Peak concurrent</label>
                    <input
                      type="number"
                      value={formData.concurrentUsers}
                      onChange={(e) => setFormData({ ...formData, concurrentUsers: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* What AI Will Generate */}
            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-900">AI Will Generate:</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Enterprise Architecture (50-page doc)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Solution Architecture (20+ diagrams)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Technical Architecture (Terraform code)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Project Plan (Gantt chart, 387 tasks)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Security Report (threat model, controls)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Compliance Certification (auto-validated)
                </div>
              </div>
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated time: <span className="font-semibold text-slate-900">6 minutes</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => navigate('/ai')}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!formData.businessGoal || formData.compliance.length === 0}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5" />
                Generate Architecture
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                AI Agents Working...
              </h2>
              <p className="text-slate-600">
                Creating your complete architecture in real-time
              </p>
            </div>

            {/* Agent Progress */}
            <div className="space-y-6">
              {agents.map((agent) => (
                <div key={agent.id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        agent.status === 'completed' ? 'bg-green-100' :
                        agent.status === 'running' ? 'bg-blue-100' :
                        'bg-slate-100'
                      }`}>
                        {agent.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : agent.status === 'running' ? (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{agent.name}</div>
                        {agent.duration && (
                          <div className="text-sm text-slate-600">{agent.duration} seconds</div>
                        )}
                      </div>
                    </div>
                    {agent.status === 'running' && (
                      <span className="text-sm text-blue-600 font-medium">{agent.progress}%</span>
                    )}
                  </div>
                  
                  {agent.status !== 'pending' && (
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          agent.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${agent.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">Overall Progress</span>
                <span className="text-sm text-slate-600">3 min 30 sec elapsed</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300" style={{ width: '58%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                🎉 Architecture Complete!
              </h2>
              <p className="text-slate-600 mb-4">
                Generated in 5 minutes and 42 seconds
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download All
                </button>
                <button className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                <button className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Artifacts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* EA Document */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Enterprise Architecture</h3>
                    <p className="text-sm text-slate-600 mb-3">52 pages, 7 domains, 118 capabilities</p>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View Document
                      </button>
                      <span className="text-slate-300">•</span>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SA Diagrams */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GitBranch className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Solution Architecture</h3>
                    <p className="text-sm text-slate-600 mb-3">23 diagrams, tech stack defined</p>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        View Diagrams
                      </button>
                      <span className="text-slate-300">•</span>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TA Code */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Technical Architecture</h3>
                    <p className="text-sm text-slate-600 mb-3">1,245 lines Terraform, 12 DB tables</p>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        View Code
                      </button>
                      <span className="text-slate-300">•</span>
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Deploy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PM Plan */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Project Management</h3>
                    <p className="text-sm text-slate-600 mb-3">387 tasks, 15 sprints, $78.5K budget</p>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                        View Plan
                      </button>
                      <span className="text-slate-300">•</span>
                      <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                        Export to Jira
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SE Report */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Security Engineering</h3>
                    <p className="text-sm text-slate-600 mb-3">32 threats, 156 security controls</p>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        View Report
                      </button>
                      <span className="text-slate-300">•</span>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Compliance Report</h3>
                    <p className="text-sm text-slate-600 mb-3">HIPAA 98%, PCI-DSS 100%, SOC2 95%</p>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                        View Report
                      </button>
                      <span className="text-slate-300">•</span>
                      <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                        Fix Gaps
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Switch to Advanced */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Want to customize?</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Switch to Advanced Mode to modify component selections, adjust technology stack, 
                    fine-tune compliance controls, and customize project timeline.
                  </p>
                  <button 
                    onClick={() => navigate('/ai/advanced')}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                  >
                    Switch to Advanced Mode
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneClickMode;
