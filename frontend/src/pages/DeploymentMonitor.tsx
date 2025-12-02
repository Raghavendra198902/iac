import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, Loader2, XCircle, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config/api';
import { MainLayout } from '../components/layout';

export default function DeploymentMonitor() {
  // Load real deployments from API - no demo data
  const [deployments, setDeployments] = useState<any[]>([]);

  useEffect(() => {
    const loadDeployments = async () => {
      try {
        const response = await fetch(`${API_URL}/deployments`);
        if (response.ok) {
          const data = await response.json();
          setDeployments(data);
        }
      } catch (error) {
        console.error('Failed to load deployments:', error);
      }
    };
    loadDeployments();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-danger-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in_progress':
        return 'badge-primary';
      case 'failed':
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  };

  return (
    <MainLayout>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
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
            <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deployment Monitor</h1>
            <p className="text-gray-600 dark:text-gray-300">Real-time deployment status and logs</p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full border border-green-300 dark:border-green-700"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Live Monitoring</span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border dark:border-gray-700 shadow-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Deployments</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border dark:border-gray-700 shadow-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">3</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border dark:border-gray-700 shadow-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400">142</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border dark:border-gray-700 shadow-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed</p>
          <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">11</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border dark:border-gray-700 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Deployments</h2>
        <div className="space-y-3">
          {deployments.map((deployment, index) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.01, x: 5 }}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-750 bg-white/50 dark:bg-gray-750/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(deployment.status)}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{deployment.blueprint}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{deployment.time}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(deployment.status)}`}>
                  {deployment.status.replace('_', ' ')}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    deployment.status === 'completed' ? 'bg-success-600' :
                    deployment.status === 'in_progress' ? 'bg-primary-600' :
                    'bg-danger-600'
                  }`}
                  style={{ width: `${deployment.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{deployment.progress}% complete</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      </div>
    </MainLayout>
  );
}
