import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: string;
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filterStatus, filterRole]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterRole !== 'all') params.append('role', filterRole);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:3025/api/users?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Particle Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="glass-card hover-lift dark:glass-dark rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <UserGroupIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text animate-fade-in gradient-text">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and permissions</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="developer">Developer</option>
            <option value="auditor">Auditor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card hover-lift dark:glass-dark rounded-xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/50 dark:bg-gray-800/50 border-b border-white/20 dark:border-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    2FA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-gray-700/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 rounded-full"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.twoFactorEnabled ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <ShieldCheckIcon className="w-5 h-5 mr-1" />
                          <span className="text-xs">Enabled</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <KeyIcon className="w-5 h-5 mr-1" />
                          <span className="text-xs">Disabled</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card hover-lift dark:glass-dark rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold gradient-text">{users.length}</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-primary-500" />
          </div>
        </div>
        <div className="glass-card hover-lift dark:glass-dark rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-green-600">
                {users.filter((u) => u.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="glass-card hover-lift dark:glass-dark rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">2FA Enabled</p>
              <p className="text-3xl font-bold text-blue-600">
                {users.filter((u) => u.twoFactorEnabled).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="glass-card hover-lift dark:glass-dark rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {users.filter((u) => u.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
