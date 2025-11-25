import { Link } from 'react-router-dom';
import { Shield, Cloud, Zap, GitBranch, Lock, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <Cloud className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            IAC Dharma Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Enterprise-grade Infrastructure as Code platform with AI-powered recommendations, 
            governance, and multi-cloud support
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-200"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={Shield}
            title="Enterprise Governance"
            description="Built-in compliance, policy enforcement, and guardrails for secure infrastructure provisioning"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={Cloud}
            title="Multi-Cloud Support"
            description="Seamlessly manage AWS, Azure, and Google Cloud resources from a unified platform"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={Zap}
            title="AI-Powered Automation"
            description="Smart recommendations, pattern detection, and automated optimization for your infrastructure"
            gradient="from-orange-500 to-red-500"
          />
          <FeatureCard
            icon={GitBranch}
            title="Architecture Blueprints"
            description="Reusable templates and patterns for rapid infrastructure deployment"
            gradient="from-green-500 to-teal-500"
          />
          <FeatureCard
            icon={Lock}
            title="Security First"
            description="Advanced security controls, encryption, and audit logging built into every layer"
            gradient="from-indigo-500 to-purple-500"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Cost Optimization"
            description="Real-time cost tracking, forecasting, and optimization recommendations"
            gradient="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="500+" label="Enterprise Customers" />
            <StatCard number="10M+" label="Resources Managed" />
            <StatCard number="99.9%" label="Uptime SLA" />
            <StatCard number="24/7" label="Expert Support" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Infrastructure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams already using IAC Dharma Platform
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon: Icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-200 border border-gray-100 dark:border-gray-700">
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

interface StatCardProps {
  number: string;
  label: string;
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{number}</div>
      <div className="text-gray-600 dark:text-gray-300 font-medium">{label}</div>
    </div>
  );
}
