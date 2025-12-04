import { Link } from 'react-router-dom';
import { Shield, Cloud, Zap, GitBranch, Lock, TrendingUp, CheckCircle2, ArrowRight, PlayCircle, Users, Award, Globe, Server, Database, Cpu, HardDrive, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement waitlist signup
    console.log('Waitlist signup:', email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                IAC Dharma
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/demo" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Live Demo
              </Link>
              <Link to="/downloads" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Downloads
              </Link>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full mb-8"
          >
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Trusted by 500+ Enterprise Teams
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 dark:from-white dark:via-blue-200 dark:to-blue-400 bg-clip-text text-transparent">
              Transform Your Cloud Infrastructure
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              with AI-Powered Automation
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Enterprise Infrastructure as Code platform that combines <span className="font-bold text-blue-600 dark:text-blue-400">intelligent automation</span>, 
            governance, and <span className="font-bold text-purple-600 dark:text-purple-400">multi-cloud orchestration</span> in one unified solution
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Link
              to="/demo"
              className="group px-10 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Try Live Demo</span>
              <PlayCircle className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="group px-10 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 flex items-center gap-3"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">No credit card needed</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Everything You Need. <span className="text-blue-600 dark:text-blue-400">Nothing You Don't.</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for modern enterprises
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Enterprise Governance"
              description="Built-in compliance, policy enforcement, and guardrails for secure infrastructure provisioning with real-time audit trails"
              gradient="from-blue-500 to-cyan-500"
              delay={0}
            />
            <FeatureCard
              icon={Cloud}
              title="Multi-Cloud Support"
              description="Seamlessly manage AWS, Azure, and Google Cloud resources from a unified platform with intelligent cost optimization"
              gradient="from-purple-500 to-pink-500"
              delay={0.1}
            />
            <FeatureCard
              icon={Server}
              title="In-House Datacenter"
              description="Manage your private datacenter infrastructure alongside cloud resources with unified orchestration and monitoring"
              gradient="from-slate-500 to-gray-700"
              delay={0.15}
            />
            <FeatureCard
              icon={Zap}
              title="AI-Powered Automation"
              description="Smart recommendations, pattern detection, and automated optimization powered by advanced machine learning algorithms"
              gradient="from-orange-500 to-red-500"
              delay={0.2}
            />
            <FeatureCard
              icon={GitBranch}
              title="Architecture Blueprints"
              description="Reusable templates and industry-standard patterns for rapid infrastructure deployment across environments"
              gradient="from-green-500 to-teal-500"
              delay={0.3}
            />
            <FeatureCard
              icon={Lock}
              title="Security First"
              description="Advanced security controls, end-to-end encryption, and comprehensive audit logging built into every layer"
              gradient="from-indigo-500 to-purple-500"
              delay={0.4}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Cost Optimization"
              description="Real-time cost tracking, predictive forecasting, and AI-driven optimization recommendations to reduce cloud spend"
              gradient="from-yellow-500 to-orange-500"
              delay={0.5}
            />
            <FeatureCard
              icon={Network}
              title="Hybrid Cloud Orchestration"
              description="Seamlessly bridge on-premises datacenters with cloud environments for true hybrid infrastructure management"
              gradient="from-cyan-500 to-blue-600"
              delay={0.55}
            />
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <StatCard number="500+" label="Enterprise Customers" icon={Users} />
              <StatCard number="10M+" label="Resources Managed" icon={Globe} />
              <StatCard number="99.9%" label="Uptime SLA" icon={Shield} />
              <StatCard number="24/7" label="Expert Support" icon={Award} />
            </div>
          </div>
        </motion.div>

        {/* Hybrid Cloud & Datacenter Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
            >
              Manage <span className="text-blue-600 dark:text-blue-400">Cloud</span> & <span className="text-slate-600 dark:text-slate-400">On-Premises</span> Together
            </motion.h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              True hybrid infrastructure management - Bridge your datacenter with public cloud seamlessly
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Animated Datacenter Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-slate-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl border border-gray-300 dark:border-gray-700">
                <div className="space-y-6">
                  {/* Datacenter Title */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Server className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">In-House Datacenter</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Private Infrastructure</p>
                    </div>
                  </div>

                  {/* Animated Server Racks */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Server, label: 'Physical Servers', count: '120+', color: 'from-blue-500 to-blue-600' },
                      { icon: Database, label: 'Storage Arrays', count: '500TB', color: 'from-green-500 to-green-600' },
                      { icon: Network, label: 'Network Fabric', count: '10Gbps', color: 'from-purple-500 to-purple-600' },
                      { icon: Cpu, label: 'Compute Power', count: '2000+', color: 'from-orange-500 to-orange-600' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{item.count}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.label}</div>
                        </div>
                        {/* Animated pulse effect */}
                        <motion.div
                          className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Connection Indicator */}
                  <motion.div
                    className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(34, 197, 94, 0)',
                        '0 0 0 10px rgba(34, 197, 94, 0.1)',
                        '0 0 0 0 rgba(34, 197, 94, 0)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 bg-green-500 rounded-full"
                    />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Connected & Monitored 24/7
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right: Benefits List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-8">
                {[
                  {
                    icon: Shield,
                    title: 'Keep Data On-Premises',
                    description: 'Maintain complete control over sensitive data while leveraging cloud scalability for non-critical workloads',
                    color: 'from-blue-600 to-blue-700',
                  },
                  {
                    icon: Network,
                    title: 'Unified Management',
                    description: 'Single pane of glass for both cloud and datacenter resources with consistent policies and governance',
                    color: 'from-purple-600 to-purple-700',
                  },
                  {
                    icon: Zap,
                    title: 'Disaster Recovery',
                    description: 'Automated failover between datacenter and cloud with real-time replication and recovery orchestration',
                    color: 'from-orange-600 to-orange-700',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Cost Optimization',
                    description: 'Intelligent workload placement based on cost, performance, and compliance requirements across hybrid infrastructure',
                    color: 'from-green-600 to-green-700',
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    whileHover={{ x: 10 }}
                    className="flex gap-4 group"
                  >
                    <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HardDrive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                      Seamless Integration with Existing Infrastructure
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Works with VMware, Hyper-V, OpenStack, and bare metal servers. No rip-and-replace required.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Powered by Industry-Leading Technologies
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Built on proven, enterprise-grade infrastructure
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Terraform', color: 'from-purple-600 to-purple-700' },
              { name: 'Kubernetes', color: 'from-blue-600 to-blue-700' },
              { name: 'AWS', color: 'from-orange-500 to-orange-600' },
              { name: 'Azure', color: 'from-blue-500 to-cyan-600' },
              { name: 'GCP', color: 'from-red-500 to-yellow-500' },
              { name: 'Docker', color: 'from-blue-400 to-blue-600' },
              { name: 'VMware', color: 'from-slate-600 to-gray-700' },
              { name: 'OpenStack', color: 'from-red-600 to-red-700' },
              { name: 'Hyper-V', color: 'from-blue-700 to-indigo-700' },
              { name: 'Ansible', color: 'from-red-500 to-black' },
              { name: 'Prometheus', color: 'from-orange-600 to-red-600' },
              { name: 'Grafana', color: 'from-orange-500 to-red-500' },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 flex items-center justify-center relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10">
                  {tech.name}
                </span>
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter/Waitlist Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Infrastructure?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of teams already using IAC Dharma Platform to modernize their cloud operations
            </p>
            <form onSubmit={handleWaitlist} className="max-w-md mx-auto flex gap-3 mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </button>
            </form>
            <div className="flex items-center justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

function FeatureCard({ icon: Icon, title, description, gradient, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-9 h-9 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  number: string;
  label: string;
  icon: any;
}

function StatCard({ number, label, icon: Icon }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-600 dark:text-gray-300 font-semibold text-lg">{label}</div>
    </motion.div>
  );
}
