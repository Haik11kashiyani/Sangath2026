import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';

export function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', role: 'editor', status: 'active', password: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormMode('create');
    setEditingUser(null);
    setFormData({ email: '', role: 'editor', status: 'active', password: '' });
  };

  const handleSave = async () => {
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    if (formMode === 'create' && !formData.password) {
      setError('Password is required for new user');
      return;
    }

    try {
      if (formMode === 'create') {
        await apiClient.post('/admin/users', formData);
      } else {
        const payload = { email: formData.email, role: formData.role, status: formData.status };
        await apiClient.put(`/admin/users/${editingUser.id}`, payload);
        if (formData.password) {
          await apiClient.put(`/admin/users/${editingUser.id}/password`, { password: formData.password });
        }
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/admin/users/${user.id}`);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const startEdit = (user) => {
    setFormMode('edit');
    setEditingUser(user);
    setFormData({ email: user.email, role: user.role, status: user.status, password: '' });
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="sys-users-view">
      <header className="sys-header" style={{ marginBottom: '2rem' }}>
        <div className="sys-header-meta">ACCESS CONTROL // USER ADMINISTRATION</div>
        <h1 className="sys-title">Admin Users</h1>
        <p className="sys-subtitle">Create, update, reset passwords, and remove admin accounts.</p>
      </header>

      <div className="sys-grid sys-grid-2">
        <section className="sys-panel">
          <h2>{formMode === 'create' ? 'Create Admin User' : `Edit ${editingUser?.email}`}</h2>
          <div className="sys-form">
            <div className="sys-input-group">
              <label>Email</label>
              <input
                className="sys-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="sys-input-group">
              <label>Role</label>
              <select
                className="sys-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="super_admin">super_admin</option>
                <option value="editor">editor</option>
                <option value="viewer">viewer</option>
              </select>
            </div>
            <div className="sys-input-group">
              <label>Status</label>
              <select
                className="sys-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">active</option>
                <option value="locked">locked</option>
              </select>
            </div>
            <div className="sys-input-group">
              <label>{formMode === 'create' ? 'Password' : 'Reset Password'}</label>
              <input
                className="sys-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={formMode === 'create' ? 'Password for new user' : 'Leave blank to keep current password'}
              />
            </div>

            <div className="sys-form-actions">
              <button className="sys-btn-primary" type="button" onClick={handleSave}>
                {formMode === 'create' ? 'Create User' : 'Save Changes'}
              </button>
              {formMode === 'edit' && (
                <button className="sys-btn-outline" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
            {error && <div className="sys-error-msg" style={{ marginTop: '1rem' }}>{error}</div>}
          </div>
        </section>

        <section className="sys-panel">
          <h2>Users</h2>
          <div className="sys-table-wrapper">
            <table className="sys-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                    <td>{new Date(user.created_at).toLocaleString()}</td>
                    <td>
                      <button className="sys-table-btn" onClick={() => startEdit(user)}>
                        Edit
                      </button>
                      <button className="sys-table-btn sys-table-btn-danger" onClick={() => handleDelete(user)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
