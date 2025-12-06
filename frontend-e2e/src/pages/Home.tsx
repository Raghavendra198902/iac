import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ServerIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ArrowRightIcon,
  BoltIcon,
  CloudIcon,
  CubeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    resources: 0,
    deployments: 0,
    savings: 0,
    uptime: 0,
  });

  useEffect(() => {
    // Animate counters
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      resources: 1247,
      deployments: 3589,
      savings: 42,
      uptime: 99.9,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setStats({
        resources: Math.floor(targets.resources * progress),
        deployments: Math.floor(targets.deployments * progress),
        savings: Math.floor(targets.savings * progress),
        uptime: parseFloat((targets.uptime * progress).toFixed(1)),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: 'Multi-Cloud Infrastructure',
      description: 'Seamless orchestration across AWS, Azure, GCP, and private clouds with unified management',
      icon: ServerIcon,
      color: 'from-blue-500 to-cyan-500',
      link: '/infrastructure',
    },
    {
      title: 'AI-Powered Insights',
      description: 'Machine learning-driven analytics for predictive maintenance and intelligent automation',
      icon: CpuChipIcon,
      color: 'from-purple-500 to-pink-500',
      link: '/ai',
    },
    {
      title: 'Enterprise Security',
      description: 'Zero-trust architecture with SOC 2, ISO 27001, and HIPAA compliance built-in',
      icon: ShieldCheckIcon,
      color: 'from-red-500 to-rose-500',
      link: '/security',
    },
    {
      title: 'Cost Intelligence',
      description: 'Real-time spend analytics with automatic optimization recommendations saving 30%+ on average',
      icon: CurrencyDollarIcon,
      color: 'from-yellow-500 to-orange-500',
      link: '/cost',
    },
    {
      title: 'DevOps Excellence',
      description: 'GitOps-native workflows with automated CI/CD pipelines and rollback protection',
      icon: CodeBracketIcon,
      color: 'from-green-500 to-emerald-500',
      link: '/devops',
    },
    {
      title: 'Real-Time Observability',
      description: 'Comprehensive monitoring with distributed tracing, logs, and metrics in one platform',
      icon: ChartBarIcon,
      color: 'from-indigo-500 to-purple-500',
      link: '/monitoring',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-16">
        {/* Enterprise Header with Dual Branding */}
        <div className="relative overflow-hidden rounded-3xl glass-card p-12 border border-white/20 dark:border-slate-700/50 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* RRD Technologies */}
            <div className="flex flex-col items-center md:items-start flex-1">
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-8 shadow-2xl mb-6 hover-lift">
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                  RRD
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">RRD Technologies</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">Global Infrastructure Solutions Leader</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">Fortune 500</span>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-sm font-semibold">20+ Years</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">Global</span>
              </div>
            </div>

            {/* Partnership Connection */}
            <div className="flex flex-col items-center px-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-5 shadow-2xl animate-pulse-slow">
                <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Powered By</span>
            </div>

            {/* IAC Platform */}
            <div className="flex flex-col items-center md:items-end flex-1">
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 shadow-2xl mb-6 hover-lift">
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                  IAC
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">IAC Platform</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">Next-Generation Cloud Orchestration</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold">AI-Powered</span>
                <span className="px-3 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full text-sm font-semibold">Enterprise</span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold">Secure</span>
              </div>
            </div>
          </div>
        </div>

      {/* Enterprise Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-effect p-16 border border-white/20 dark:border-slate-700/50">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 animate-gradient-x"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20">
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              ENTERPRISE INFRASTRUCTURE AS CODE PLATFORM
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text animate-fade-in leading-tight">
            Transform Your Cloud Infrastructure
          </h1>
          
          <p className="text-2xl text-slate-600 dark:text-slate-300 mb-8 animate-slide-up max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade infrastructure automation powered by AI. Deploy, manage, and optimize multi-cloud environments with unprecedented speed and reliability.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up mb-12" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/register"
              className="px-10 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-lg rounded-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            >
              Start Free Trial
              <RocketLaunchIcon className="inline-block w-6 h-6 ml-3" />
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 glass-effect border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-slate-700 dark:text-slate-200 flex items-center justify-center"
            >
              Sign In
              <ArrowRightIcon className="inline-block w-6 h-6 ml-3" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Stats with Enhanced Messaging */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Trusted by Global Enterprises</h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">Powering infrastructure for Fortune 500 companies worldwide</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <CubeIcon className="w-10 h-10 text-blue-500" />
            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="text-4xl font-bold mb-2 gradient-text">{stats.resources.toLocaleString()}+</div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Active Resources</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Managed across all clouds</div>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <BoltIcon className="w-10 h-10 text-green-500" />
            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
              +8%
            </span>
          </div>
          <div className="text-4xl font-bold mb-2 gradient-text">{stats.deployments.toLocaleString()}+</div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deployments Daily</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Zero-downtime releases</div>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="w-10 h-10 text-yellow-500" />
            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
              +15%
            </span>
          </div>
          <div className="text-4xl font-bold mb-2 gradient-text">${stats.savings}K+</div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Savings</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Average per customer</div>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <CloudIcon className="w-10 h-10 text-purple-500" />
            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
              ✓ SLA
            </span>
          </div>
          <div className="text-4xl font-bold mb-2 gradient-text">{stats.uptime}%</div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Uptime</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Last 12 months</div>
        </div>
      </div>

      {/* Enterprise Value Proposition */}
      <div className="glass-effect rounded-3xl p-12 border border-white/20 dark:border-slate-700/50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Why Global Leaders Choose IAC Platform</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Built for enterprise scale with security, compliance, and performance at the core
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden glass-effect rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Icon with Gradient */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                <feature.icon className="w-full h-full text-white" />
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:gradient-text transition-all duration-300 text-slate-800 dark:text-slate-100">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Learn more
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="glass-effect rounded-3xl p-12 border border-white/20 dark:border-slate-700/50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Enterprise-Grade Trust & Compliance</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Meeting the highest standards of security and regulatory compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 text-center hover-lift">
            <BuildingOfficeIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">SOC 2 Type II</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Certified secure operations</p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 text-center hover-lift">
            <ShieldCheckIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">ISO 27001</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Information security certified</p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 text-center hover-lift">
            <GlobeAltIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">GDPR Compliant</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">EU data protection ready</p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border border-white/20 dark:border-slate-700/50 text-center hover-lift">
            <AcademicCapIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">HIPAA Ready</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Healthcare compliance</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="glass-effect rounded-3xl p-16 border border-white/20 dark:border-slate-700/50 text-center">
        <h2 className="text-5xl font-bold mb-6 gradient-text">Ready to Transform Your Infrastructure?</h2>
        <p className="text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto">
          Join thousands of enterprises automating their cloud operations with IAC Platform
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/register"
            className="px-12 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xl rounded-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
          >
            Start Your Free Trial
            <SparklesIcon className="inline-block w-6 h-6 ml-3" />
          </Link>
          <Link
            to="/login"
            className="px-12 py-5 glass-effect border-2 border-slate-300 dark:border-slate-600 rounded-xl text-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-slate-700 dark:text-slate-200 flex items-center justify-center"
          >
            Request a Demo
            <ArrowRightIcon className="inline-block w-6 h-6 ml-3" />
          </Link>
        </div>
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          Enterprise support available • Custom deployment options • Dedicated success team
        </p>
      </div>
      </div>
    </div>
  );
};

export default Home;
