import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/user-management.css';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, statusFilter, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`http://localhost:3025/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3025/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { color: '#22c55e', label: 'Active' },
      inactive: { color: '#94a3b8', label: 'Inactive' },
      suspended: { color: '#ef4444', label: 'Suspended' },
      pending: { color: '#f59e0b', label: 'Pending' },
    };
    const { color, label } = statusMap[status] || statusMap.pending;
    return (
      <span className="status-badge" style={{ background: `${color}20`, color }}>
        {label}
      </span>
    );
  };

  return (
    <div className="user-management-page">
      <div className="page-header-modern">
        <div>
          <h1 className="page-title-gradient">User Management</h1>
          <p className="page-subtitle">Manage users, roles, and permissions</p>
        </div>
        <button className="btn-primary-modern" onClick={() => setShowCreateModal(true)}>
          <span className="btn-icon">👤</span>
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-card-modern">
        <div className="search-box-modern">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-modern"
          />
        </div>

        <div className="filter-group-modern">
          <div className="filter-item">
            <label>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-modern"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Role</label>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="select-modern"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrator</option>
              <option value="operator">Operator</option>
              <option value="developer">Developer</option>
              <option value="auditor">Auditor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card-modern">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-modern"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>2FA</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-modern">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div className="user-info">
                            <div className="user-name">{user.first_name} {user.last_name}</div>
                            <div className="user-username">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="email-cell">
                          {user.email}
                          {user.email_verified && (
                            <span className="verified-badge" title="Verified">✓</span>
                          )}
                        </div>
                      </td>
                      <td>{user.department || '—'}</td>
                      <td>
                        <div className="roles-cell">
                          {user.roles?.map((role, idx) => (
                            <span key={idx} className="role-badge">{role}</span>
                          ))}
                        </div>
                      </td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>
                        {user.two_factor_enabled ? (
                          <span className="badge-success">Enabled</span>
                        ) : (
                          <span className="badge-muted">Disabled</span>
                        )}
                      </td>
                      <td>
                        {user.last_login_at ? (
                          <span className="text-muted">
                            {new Date(user.last_login_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted">Never</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/users/${user.id}`} className="btn-icon-modern" title="View Details">
                            👁️
                          </Link>
                          <Link to={`/users/${user.id}/edit`} className="btn-icon-modern" title="Edit">
                            ✏️
                          </Link>
                          <button 
                            className="btn-icon-modern btn-danger" 
                            title="Suspend"
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                          >
                            🚫
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-modern">
              <div className="pagination-info">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </div>
              <div className="pagination-controls">
                <button
                  className="btn-pagination"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  ← Previous
                </button>
                <span className="pagination-current">Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  className="btn-pagination"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
    jobTitle: '',
    roles: ['viewer'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3025/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-modern" onClick={onClose}>
      <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-modern">
          <h2>Create New User</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-modern"
                placeholder="john.doe"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-modern"
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-modern"
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-modern"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-modern"
              placeholder="Min 8 chars, uppercase, lowercase, number, special char"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-modern"
              />
            </div>

            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="input-modern"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Roles *</label>
            <select
              multiple
              value={formData.roles}
              onChange={(e) => setFormData({ 
                ...formData, 
                roles: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="select-modern"
              style={{ height: '120px' }}
            >
              <option value="viewer">Viewer</option>
              <option value="developer">Developer</option>
              <option value="operator">Operator</option>
              <option value="auditor">Auditor</option>
              <option value="admin">Administrator</option>
            </select>
            <small className="form-hint">Hold Ctrl/Cmd to select multiple roles</small>
          </div>

          <div className="modal-footer-modern">
            <button type="button" className="btn-secondary-modern" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-modern" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementPage;
