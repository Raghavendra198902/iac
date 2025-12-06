import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../../components/layout';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Shield,
  Lock,
  FileCheck,
  AlertTriangle,
  Award,
} from 'lucide-react';

export default function SecurityCompliance() {
  const responsibilities = [
    {
      title: 'Security Architecture & Frameworks',
      icon: Shield,
      items: [
        'Define enterprise security architecture and controls',
        'Implement Zero-Trust, SASE, and defense-in-depth strategies',
        'Establish security reference architectures',
        'Align with NIST, ISO 27001, and CIS frameworks',
      ],
    },
    {
      title: 'Compliance & Regulatory',
      icon: FileCheck,
      items: [
        'Ensure compliance with GDPR, HIPAA, SOC 2, PCI-DSS',
        'Conduct compliance assessments and audits',
        'Manage regulatory reporting and certifications',
        'Track compliance posture and remediation',
      ],
    },
    {
      title: 'Risk Management',
      icon: AlertTriangle,
      items: [
        'Conduct architecture risk assessments',
        'Identify and mitigate security vulnerabilities',
        'Manage third-party and vendor risk',
        'Develop incident response and disaster recovery plans',
      ],
    },
    {
      title: 'Identity & Access Management',
      icon: Lock,
      items: [
        'Define IAM strategy and SSO architecture',
        'Implement RBAC, ABAC, and just-in-time access',
        'Design MFA and passwordless authentication',
        'Manage privileged access and secrets',
      ],
    },
    {
      title: 'Security Standards & Best Practices',
      icon: Award,
      items: [
        'Establish secure coding standards and guidelines',
        'Promote DevSecOps and shift-left security',
        'Conduct security architecture reviews',
        'Provide security training and awareness',
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 shadow-2xl p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
            <div className="relative z-10 text-white">
              <Link to="/ea/responsibilities" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to EA Responsibilities
              </Link>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">6. Security, Compliance & Risk</h1>
                  <p className="text-white/90 text-lg">Define security frameworks and ensure regulatory compliance</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Security Controls', value: '142', icon: Shield, color: 'blue' },
              { label: 'Compliance Standards', value: '8', icon: FileCheck, color: 'green' },
              { label: 'Risk Items Mitigated', value: '67', icon: AlertTriangle, color: 'orange' },
              { label: 'Security Score', value: '92%', icon: Award, color: 'purple' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {responsibilities.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl"
          >
            <Link to="/ea/responsibilities/innovation-emerging-tech" className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Prev: Innovation & Emerging Technologies
            </Link>
            <Link to="/ea/responsibilities/data-architecture" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
              Next: Data Architecture & Strategy
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
