import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../../components/layout';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Briefcase,
} from 'lucide-react';

export default function BusinessITAlignment() {
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
                  <Briefcase className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">2. Business & IT Alignment</h1>
                  <p className="text-white/90 text-lg">Translate business capabilities into technology roadmaps and drive value realization</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 dark:border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Key Responsibilities
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">
                Content for Business & IT Alignment will be added here. This page covers the comprehensive responsibilities and strategic impact of this EA focus area.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl"
          >
            <Link to="/ea/responsibilities/strategy-governance" className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Prev: Architecture Strategy & Governance
            </Link>
            <Link to="/ea/responsibilities/solution-oversight" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
              Next: Solution Architecture Oversight
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
