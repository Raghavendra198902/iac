import React from 'react';
import { Shield, AlertTriangle, Brain, Cloud, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout';
import AIRecommendationsPanel from '../components/AIRecommendationsPanel';

export default function RiskDashboard() {
  const riskFactors = [
    { category: 'AI Threat Detection', count: 8, severity: 'medium', color: 'warning', icon: Brain },
    { category: 'Security', count: 3, severity: 'high', color: 'danger', icon: Shield },
    { category: 'Multi-Cloud Risk', count: 4, severity: 'medium', color: 'warning', icon: Cloud },
    { category: 'Availability', count: 5, severity: 'medium', color: 'warning', icon: AlertTriangle },
    { category: 'Cost', count: 2, severity: 'low', color: 'success', icon: TrendingUp },
    { category: 'Compliance', count: 1, severity: 'low', color: 'success', icon: Lock },
  ];

  return (
    <MainLayout>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Risk Assessment</h1>
            <p className="text-gray-600 dark:text-gray-300">Multi-dimensional infrastructure risk analysis</p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full border border-red-300 dark:border-red-700"
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Active Monitoring</span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riskFactors.map((factor, index) => (
          <motion.div
            key={factor.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border dark:border-gray-700 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{factor.category}</h3>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                <factor.icon className={`h-5 w-5 text-${factor.color}-600`} />
              </motion.div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{factor.count}</p>
            <div className="flex items-center gap-2">
              <p className={`text-sm text-${factor.color}-600 capitalize`}>{factor.severity} severity</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
      >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
            >
              <Cloud className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Multi-Cloud Risk Scores</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Security and compliance risk by provider</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">AWS</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Medium Risk</span>
              </div>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">42/100</p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">8 critical findings</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Azure</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Low Risk</span>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">18/100</p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">3 critical findings</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-red-900 dark:text-red-300">GCP</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Medium Risk</span>
              </div>
              <p className="text-3xl font-bold text-red-900 dark:text-red-300">35/100</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-2">5 critical findings</p>
            </motion.div>
          </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 border border-purple-200 dark:border-purple-800"
      >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
            >
              <Brain className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI-Powered Risk Mitigation</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Machine learning recommendations to reduce risk exposure</p>
            </div>
          </div>
          <AIRecommendationsPanel />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border dark:border-gray-700 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Risk Factors</h2>
        <div className="space-y-3">
          <motion.div
            whileHover={{ x: 5 }}
            className="p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-danger-900 dark:text-danger-300">Unencrypted Storage</h4>
                <p className="text-sm text-danger-800 dark:text-danger-400 mt-1">Storage resources do not have encryption enabled</p>
                <p className="text-sm text-danger-700 dark:text-danger-400 mt-2"><strong>Mitigation:</strong> Enable encryption at rest for all storage</p>
              </div>
              <span className="badge badge-danger">HIGH</span>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ x: 5 }}
            className="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-warning-900 dark:text-warning-300">Single Point of Failure</h4>
                <p className="text-sm text-warning-800 dark:text-warning-400 mt-1">Only one compute instance - no redundancy</p>
                <p className="text-sm text-warning-700 dark:text-warning-400 mt-2"><strong>Mitigation:</strong> Deploy multiple instances with load balancing</p>
              </div>
              <span className="badge badge-warning">MEDIUM</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
      </div>
    </MainLayout>
    </div>
  );
}
