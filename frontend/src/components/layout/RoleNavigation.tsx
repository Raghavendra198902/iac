import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, Code, Briefcase } from 'lucide-react';

interface RoleNavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const roleNavItems: RoleNavItem[] = [
  {
    id: 'sa',
    name: 'Solution Architect',
    path: '/architecture/solution-architect',
    icon: <FileText className="w-5 h-5" />,
    description: 'Manage solution designs and patterns',
  },
  {
    id: 'ta',
    name: 'Technical Architect',
    path: '/architecture/technical-architect',
    icon: <Code className="w-5 h-5" />,
    description: 'Technical specifications and debt tracking',
  },
  {
    id: 'pm',
    name: 'Project Manager',
    path: '/architecture/project-manager',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Project portfolio and milestone management',
  },
  {
    id: 'se',
    name: 'Software Engineer',
    path: '/architecture/software-engineer',
    icon: <Code className="w-5 h-5" />,
    description: 'Tasks, reviews, and Q&A',
  },
];

export const RoleNavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 mr-4">
          <Users className="w-5 h-5" />
          <span className="font-semibold">Architecture Roles:</span>
        </div>
        <div className="flex gap-2">
          {roleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.path)
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
              title={item.description}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RoleNavigationGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {roleNavItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.path)}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              {item.icon}
            </div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{item.description}</p>
        </button>
      ))}
    </div>
  );
};
