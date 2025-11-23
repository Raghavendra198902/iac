import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FolderOpen, Calendar, Users, DollarSign } from 'lucide-react';

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
            const { projectsApi } = await import('../services/api.service');
            const data = await projectsApi.list();
            setProjects(data as Project[]);
            setLoading(false);
            return;
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage and track your infrastructure projects
          </p>
        </div>
        <Link
          to="/projects/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
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
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
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
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="card p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
