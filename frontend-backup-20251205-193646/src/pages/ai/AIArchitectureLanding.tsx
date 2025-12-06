import React, { useState } from 'react';
import { 
  Zap, Target, Brain, Rocket, TrendingUp, Shield, 
  DollarSign, Clock, Users, CheckCircle, ArrowRight,
  Sparkles, ChevronRight, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  compliance: string[];
  score: number;
  cost: string;
  date: string;
  mode: 'oneclick' | 'advanced';
}

const AIArchitectureLanding = () => {
  const navigate = useNavigate();
  const [recentProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      compliance: ['HIPAA', 'PCI-DSS'],
      score: 98,
      cost: '$78.5K',
      date: '2 days ago',
      mode: 'oneclick'
    },
    {
      id: '2',
      name: 'Healthcare Portal',
      compliance: ['HIPAA', 'SOC2'],
      score: 100,
      cost: '$125K',
      date: '1 week ago',
      mode: 'advanced'
    },
    {
      id: '3',
      name: 'FinTech App',
      compliance: ['PCI-DSS', 'SOC2'],
      score: 95,
      cost: '$65K',
      date: '2 weeks ago',
      mode: 'oneclick'
    }
  ]);

  const features = [
    { icon: Brain, label: '6 AI Agents', value: 'EA, SA, TA, PM, SE, Security' },
    { icon: Clock, label: 'Generation Time', value: '6 minutes average' },
    { icon: CheckCircle, label: 'Compliance', value: '15+ frameworks' },
    { icon: TrendingUp, label: 'Accuracy', value: '95%+ validated' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">IAC Dharma</h1>
              <p className="text-xs text-slate-600">AI-Powered Architecture</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm text-slate-600 hover:text-slate-900">
              Documentation
            </button>
            <button className="text-sm text-slate-600 hover:text-slate-900">
              Pricing
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by GPT-4 + Claude 3 + ML Models
          </div>
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Enterprise Architecture in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              6 Minutes
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Let AI generate complete Enterprise, Solution, Technical Architecture, 
            Project Plans, and Security Reports with automated compliance validation.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-600">{feature.label}</div>
                  <div className="text-sm font-semibold text-slate-900">{feature.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* One-Click Mode */}
          <div 
            className="group relative bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => navigate('/ai/oneclick')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 rounded-bl-full"></div>
            
            <div className="p-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
                <Zap className="w-3 h-3" />
                FASTEST
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                One-Click Mode
              </h3>
              <p className="text-slate-600 mb-6">
                AI generates everything automatically. Just answer 5 simple questions.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">30 seconds input time</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">6 minutes complete generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Production-ready code + docs</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Automated compliance validation</span>
                </div>
              </div>

              {/* Ideal For */}
              <div className="p-4 bg-blue-50 rounded-lg mb-6">
                <div className="text-xs font-semibold text-blue-900 mb-2">IDEAL FOR:</div>
                <div className="text-sm text-blue-700">
                  Rapid prototyping, MVPs, startups, quick POCs
                </div>
              </div>

              {/* CTA */}
              <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 group-hover:gap-4">
                Start Quick Generation
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Mode */}
          <div 
            className="group relative bg-white rounded-2xl shadow-xl border-2 border-indigo-200 overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => navigate('/ai/advanced')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-10 rounded-bl-full"></div>
            
            <div className="p-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold mb-4">
                <Target className="w-3 h-3" />
                FULL CONTROL
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Advanced Mode
              </h3>
              <p className="text-slate-600 mb-6">
                Full control over every decision. AI assists and recommends as you design.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">6-step interactive wizard</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Drag & drop architecture designer</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Live code editor with AI assist</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Real-time compliance validation</span>
                </div>
              </div>

              {/* Ideal For */}
              <div className="p-4 bg-indigo-50 rounded-lg mb-6">
                <div className="text-xs font-semibold text-indigo-900 mb-2">IDEAL FOR:</div>
                <div className="text-sm text-indigo-700">
                  Enterprise projects, complex systems, architects who want control
                </div>
              </div>

              {/* CTA */}
              <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group-hover:gap-4">
                Start Expert Design
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Compare Modes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Feature</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-blue-600">One-Click</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-indigo-600">Advanced</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-sm text-slate-700">Setup Time</td>
                  <td className="py-4 px-6 text-center text-sm font-semibold text-slate-900">30 seconds</td>
                  <td className="py-4 px-6 text-center text-sm font-semibold text-slate-900">30-60 minutes</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-sm text-slate-700">Generation Time</td>
                  <td className="py-4 px-6 text-center text-sm font-semibold text-slate-900">6 minutes</td>
                  <td className="py-4 px-6 text-center text-sm font-semibold text-slate-900">1-2 hours</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-sm text-slate-700">Customization</td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Limited</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Full Control</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-sm text-slate-700">Technical Expertise</td>
                  <td className="py-4 px-6 text-center text-sm text-slate-600">None required</td>
                  <td className="py-4 px-6 text-center text-sm text-slate-600">Intermediate to Expert</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-sm text-slate-700">AI Assistance</td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-sm text-slate-700">Switch Modes</td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Projects</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">{project.name}</h4>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      project.mode === 'oneclick' 
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {project.mode === 'oneclick' ? 'One-Click' : 'Advanced'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.compliance.map((comp) => (
                      <span key={comp} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                        {comp}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        project.score >= 98 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-slate-600">{project.score}% compliant</span>
                    </div>
                    <span className="font-semibold text-slate-900">{project.cost}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">{project.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-12 text-white mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">Trusted by Architects Worldwide</h3>
            <p className="text-blue-100">Powering the next generation of enterprise architecture</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Projects Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">99.8%</div>
              <div className="text-blue-100">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">95%+</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Compliance Frameworks</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Architecture Process?
          </h3>
          <p className="text-xl text-slate-600 mb-8">
            Choose your path and let AI do the heavy lifting
          </p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/ai/oneclick')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Try One-Click Mode
            </button>
            <button 
              onClick={() => navigate('/ai/advanced')}
              className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              Try Advanced Mode
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              © 2025 IAC Dharma. Powered by GPT-4, Claude 3, and advanced ML models.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">Privacy</a>
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">Terms</a>
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIArchitectureLanding;
