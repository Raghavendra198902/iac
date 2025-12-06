import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FolderOpen, Calendar, Users, DollarSign, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout';
import { API_URL } from '../config/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'completed' | 'on-hold';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  team: string[];
  progress: number;
}

const ProjectsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Use real API or demo mode based on environment
        const useDemoMode = import.meta.env.VITE_USE_DEMO_AUTH === 'true';
        
        if (!useDemoMode) {
          try {
            const response = await fetch(`${API_URL}/projects`);
            if (response.ok) {
              const data = await response.json();
            setProjects(data as Project[]);
            setLoading(false);
              return;
            }
          } catch (apiError) {
            console.error('API fetch failed, using empty list:', apiError);
          }
        }
        
        // Demo mode or API failure - show empty list
        setProjects([]);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Projects
              </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and track your infrastructure projects
              </p>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Link
          to="/projects/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Link
              to={`/projects/${project.id}`}
              className="card p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg block"
            >
              <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"
                >
                  <FolderOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {project.name}
                  </h3>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>Budget</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Timeline</span>
                </div>
                <span className="text-gray-900 dark:text-white">
                  {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                  {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </div>
                <span className="text-gray-900 dark:text-white">
                  {project.team.length} members
                </span>
              </div>
            </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card p-12 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg"
        >
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </motion.div>
      )}
      </div>
      </div>
    </MainLayout>
  );
};

export default ProjectsList;
