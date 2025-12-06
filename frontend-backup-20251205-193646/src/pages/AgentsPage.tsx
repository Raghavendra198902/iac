import React, { useEffect, useState } from 'react';
import { Computer, CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, TrendingUp, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout';
import { API_URL } from '../config/api';
import Badge from '../components/ui/Badge';

interface AgentData {
  agentName: string;
  organizationId?: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'warning';
  totalEvents: number;
  eventCounts: {
    process_start: number;
    process_stop: number;
    suspicious_process: number;
    heartbeat: number;
  };
  uptime: string;
}

interface AgentSummary {
  totalAgents: number;
  onlineAgents: number;
  warningAgents: number;
  offlineAgents: number;
  totalEvents: number;
  totalProcessStarts: number;
  totalProcessStops: number;
  totalSuspicious: number;
}

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      const agentsRes = await fetch(`${API_URL}/agents`);
      if (!agentsRes.ok) throw new Error('Failed to fetch agents');
      const agentsData = await agentsRes.json();

      const summaryRes = await fetch(`${API_URL}/agents/stats/summary`);
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryRes.json();

      setAgents(agentsData.agents || []);
      setSummary(summaryData.summary);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching agent data:', err);
      setError(err?.message || 'Failed to fetch agent data');
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Computer className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string): 'success' | 'warning' | 'error' | 'gray' => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'gray';
    }
  };

  if (loading && agents.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <RefreshCw className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading agent data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Management</h1>
                <p className="text-gray-600 dark:text-gray-300">Monitor and manage CMDB agents in real-time</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full border border-green-300 dark:border-green-700"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Agents</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalAgents}</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Computer className="h-12 w-12 text-blue-600 dark:text-blue-400 opacity-30" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Online</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.onlineAgents}</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 opacity-30" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Events</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalEvents.toLocaleString()}</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Activity className="h-12 w-12 text-cyan-600 dark:text-cyan-400 opacity-30" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Suspicious</p>
                    <p className={`text-3xl font-bold ${summary.totalSuspicious > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {summary.totalSuspicious}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 opacity-30" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Agents Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Registered Agents</h2>
              
              {agents.length === 0 ? (
                <div className="p-8 text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Server className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-800 dark:text-blue-200">No agents registered yet. Deploy an agent to see it here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Agent Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Last Seen</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total Events</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Process Starts</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Process Stops</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Suspicious</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent, index) => (
                        <motion.tr
                          key={agent.agentName}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-4 px-4">
                            <Badge variant={getStatusBadge(agent.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(agent.status)}
                                {agent.status.toUpperCase()}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{agent.agentName}</p>
                              {agent.organizationId && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Org: {agent.organizationId}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">{agent.uptime}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(agent.lastSeen).toLocaleString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                            {agent.totalEvents.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                            {agent.eventCounts.process_start}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                            {agent.eventCounts.process_stop}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-${agent.eventCounts.suspicious_process > 0 ? 'bold' : 'normal'} ${agent.eventCounts.suspicious_process > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                              {agent.eventCounts.suspicious_process}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentsPage;
