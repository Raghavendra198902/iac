import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <MainLayout>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2, 
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <AlertTriangle className="h-20 w-20 mx-auto text-orange-500 dark:text-orange-400 mb-4" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-9xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent"
          >
            404
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4"
          >
            Page Not Found
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 dark:text-gray-300 mt-2"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 justify-center"
        >
          <Link to="/">
            <Button variant="primary">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/blueprints">
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Browse Blueprints
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ y: -5 }}
          className="mt-12 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Links</h3>
          <div className="space-y-2 text-left">
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Link to="/dashboard" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → Dashboard
              </Link>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Link to="/designer" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → AI Designer
              </Link>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Link to="/risk" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → Risk Assessment
              </Link>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Link to="/cost" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → Cost Management
              </Link>
            </motion.div>
          </div>
        </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
