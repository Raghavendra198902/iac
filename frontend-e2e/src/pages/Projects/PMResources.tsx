import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  allocation: number;
  availability: number;
  projects: ResourceProject[];
  skills: string[];
  cost: number;
  performance: number;
}

interface ResourceProject {
  name: string;
  hours: number;
  status: 'active' | 'planned' | 'completed';
}

const PMResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = () => {
    const sampleResources: Resource[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        role: 'Senior DevOps Engineer',
        department: 'Engineering',
        allocation: 90,
        availability: 10,
        cost: 12000,
        performance: 95,
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD'],
        projects: [
          { name: 'IAC Dharma v3.0', hours: 120, status: 'active' },
          { name: 'Infrastructure Upgrade', hours: 40, status: 'active' }
        ]
      },
      {
        id: '2',
        name: 'Michael Rodriguez',
        role: 'Full Stack Developer',
        department: 'Engineering',
        allocation: 100,
        availability: 0,
        cost: 11000,
        performance: 92,
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'GraphQL'],
        projects: [
          { name: 'IAC Dharma v3.0', hours: 160, status: 'active' }
        ]
      },
      {
        id: '3',
        name: 'Emily Watson',
        role: 'Security Architect',
        department: 'Security',
        allocation: 75,
        availability: 25,
        cost: 13500,
        performance: 98,
        skills: ['Zero Trust', 'Compliance', 'Penetration Testing', 'SIEM', 'IAM'],
        projects: [
          { name: 'IAC Dharma v3.0', hours: 80, status: 'active' },
          { name: 'Security Audit Q4', hours: 40, status: 'active' }
        ]
      },
      {
        id: '4',
        name: 'David Kim',
        role: 'ML Engineer',
        department: 'Data Science',
        allocation: 80,
        availability: 20,
        cost: 12500,
        performance: 94,
        skills: ['TensorFlow', 'PyTorch', 'Python', 'MLOps', 'Data Engineering'],
        projects: [
          { name: 'IAC Dharma v3.0', hours: 100, status: 'active' },
          { name: 'AIOps Model Training', hours: 28, status: 'active' }
        ]
      },
      {
        id: '5',
        name: 'Lisa Anderson',
        role: 'QA Engineer',
        department: 'Quality',
        allocation: 60,
        availability: 40,
        cost: 9000,
        performance: 90,
        skills: ['Test Automation', 'Selenium', 'Jest', 'Performance Testing', 'Security Testing'],
        projects: [
          { name: 'IAC Dharma v3.0', hours: 96, status: 'active' }
        ]
      },
      {
        id: '6',
        name: 'James Wilson',
        role: 'Cloud Architect',
        department: 'Architecture',
        allocation: 85,
        availability: 15,
        cost: 14000,
        performance: 96,
        skills: ['AWS', 'Azure', 'GCP', 'Multi-Cloud', 'Solution Design'],
        projects: [
          { name: 'IAC Dharma v3.0', hours: 110, status: 'active' },
          { name: 'Cloud Migration', hours: 26, status: 'planned' }
        ]
      }
    ];

    setResources(sampleResources);
    setLoading(false);
  };

  const roles = ['all', 'Senior DevOps Engineer', 'Full Stack Developer', 'Security Architect', 'ML Engineer', 'QA Engineer', 'Cloud Architect'];
  const filteredResources = selectedRole === 'all' ? resources : resources.filter(r => r.role === selectedRole);

  const totalCost = resources.reduce((sum, r) => sum + r.cost, 0);
  const avgAllocation = resources.reduce((sum, r) => sum + r.allocation, 0) / resources.length;
  const avgPerformance = resources.reduce((sum, r) => sum + r.performance, 0) / resources.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Resource Management
            </h1>
          <p className="text-gray-300">Team allocation, availability, and capacity planning</p>
        </div>

        {/* Role Filter */}
        <div className="mb-8">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 rounded-lg font-semibold bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {roles.map((role) => (
              <option key={role} value={role} className="bg-slate-800">
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <UserGroupIcon className="w-8 h-8 text-teal-400" />
              <span className="text-3xl font-bold text-white">{resources.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Team Members</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">{avgAllocation.toFixed(0)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Allocation</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{avgPerformance.toFixed(0)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Performance</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">${(totalCost / 1000).toFixed(0)}K</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Monthly Cost</h3>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-8 h-8 text-teal-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{resource.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{resource.role}</p>
                    <span className="px-3 py-1 rounded text-xs font-semibold bg-teal-400/20 text-teal-400">
                      {resource.department}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Cost/Month</p>
                  <p className="text-lg font-bold text-white">${(resource.cost / 1000).toFixed(1)}K</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Allocation</span>
                    <span className="text-white font-semibold">{resource.allocation}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${resource.allocation}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Availability</span>
                    <span className="text-white font-semibold">{resource.availability}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${resource.availability}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white font-semibold">{resource.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${resource.performance}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">Current Projects</p>
                  <div className="space-y-2">
                    {resource.projects.map((project, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-white">{project.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{project.hours}h</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            project.status === 'active' 
                              ? 'bg-green-400/20 text-green-400' 
                              : project.status === 'planned'
                              ? 'bg-blue-400/20 text-blue-400'
                              : 'bg-gray-400/20 text-gray-400'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 rounded text-xs bg-white/10 text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default PMResources;
