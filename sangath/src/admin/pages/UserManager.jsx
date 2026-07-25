import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { SkeletonLoader } from '../components/SkeletonLoader';

export function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [status, setStatus] = useState('active');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/users');
      setUsers(data || []);
    } catch (err) {
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('viewer');
    setStatus('active');
    setSelectedUser(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }
    try {
      await apiClient.post('/admin/users', { email, password, role, status });
      toast.success('User created successfully.');
      setIsAddModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error('Failed to create user.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required.');
      return;
    }
    try {
      await apiClient.put(`/admin/users/${selectedUser.id}`, { email, role, status });
      toast.success('User updated successfully.');
      setIsEditModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('New password is required.');
      return;
    }
    try {
      await apiClient.put(`/admin/users/${selectedUser.id}/password`, { password });
      toast.success('Password reset successfully.');
      setIsResetModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to reset password.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/admin/users/${selectedUser.id}`);
      toast.success('User deleted successfully.');
      setIsDeleteModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setIsEditModalOpen(true);
  };

  const openReset = (user) => {
    setSelectedUser(user);
    setPassword('');
    setIsResetModalOpen(true);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getRoleBadgeVariant = (r) => {
    switch (r) {
      case 'super_admin': return 'purple';
      case 'editor': return 'info';
      default: return 'muted';
    }
  };

  const getStatusBadgeVariant = (s) => {
    return s === 'active' ? 'success' : 'danger';
  };

  return (
    <div className="sys-page-layout">
      <div className="sys-page-header">
        <div className="sys-page-title-group">
          <h1 className="sys-page-title">Admin Users</h1>
          <p className="sys-page-subtitle">Manage system access and roles</p>
        </div>
        <div className="sys-page-actions">
          <button className="sys-btn sys-btn-primary" onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sys-icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add User
          </button>
        </div>
      </div>

      <div className="sys-card sys-table-wrapper">
        {loading ? (
          <SkeletonLoader type="table" />
        ) : (
          <table className="sys-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th className="sys-text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td><Badge variant={getRoleBadgeVariant(user.role)}>{user.role.replace('_', ' ')}</Badge></td>
                  <td><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></td>
                  <td>{formatDate(user.last_login)}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td className="sys-text-right">
                    <div className="sys-action-group">
                      <button className="sys-btn sys-btn-sm sys-btn-ghost" onClick={() => openEdit(user)} title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="sys-btn sys-btn-sm sys-btn-ghost" onClick={() => openReset(user)} title="Reset Password">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </button>
                      <button className="sys-btn sys-btn-sm sys-btn-danger-ghost" onClick={() => openDelete(user)} title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="sys-text-center sys-p-6 sys-text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="sys-card sys-mt-6">
        <h3 className="sys-card-title">Role Permissions</h3>
        <div className="sys-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="sys-p-4" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <h4 style={{ color: '#a855f7', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              Super Admin
            </h4>
            <p className="sys-text-sm sys-text-muted">Full access to everything, including settings, user management, and sensitive data.</p>
          </div>
          <div className="sys-p-4" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <h4 style={{ color: '#0ea5e9', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Editor
            </h4>
            <p className="sys-text-sm sys-text-muted">Create, edit, and delete content. Can view audit logs. Cannot manage users or settings.</p>
          </div>
          <div className="sys-p-4" style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', borderRadius: '8px', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
            <h4 style={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Viewer
            </h4>
            <p className="sys-text-sm sys-text-muted">Read-only access to content. Cannot make any changes.</p>
          </div>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add User">
        <form onSubmit={handleAddSubmit}>
          <div className="sys-form-group">
            <label className="sys-label">Email</label>
            <input type="email" className="sys-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="sys-form-group">
            <label className="sys-label">Password</label>
            <input type="password" className="sys-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="sys-text-sm sys-text-muted sys-mt-1">Use a strong password with at least 8 characters.</p>
          </div>
          <div className="sys-form-group">
            <label className="sys-label">Role</label>
            <select className="sys-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="super_admin">Super Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="sys-form-group">
            <label className="sys-label">Status</label>
            <select className="sys-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          <div className="sys-modal-footer">
            <button type="button" className="sys-btn sys-btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="sys-btn sys-btn-primary">Add User</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <form onSubmit={handleEditSubmit}>
          <div className="sys-form-group">
            <label className="sys-label">Email</label>
            <input type="email" className="sys-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="sys-form-group">
            <label className="sys-label">Role</label>
            <select className="sys-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="super_admin">Super Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="sys-form-group">
            <label className="sys-label">Status</label>
            <select className="sys-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          <div className="sys-modal-footer">
            <button type="button" className="sys-btn sys-btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="sys-btn sys-btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Password">
        <form onSubmit={handleResetSubmit}>
          <div className="sys-form-group">
            <label className="sys-label">New Password for {selectedUser?.email}</label>
            <input type="password" className="sys-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="sys-modal-footer">
            <button type="button" className="sys-btn sys-btn-ghost" onClick={() => setIsResetModalOpen(false)}>Cancel</button>
            <button type="submit" className="sys-btn sys-btn-warning">Reset Password</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete User">
        <p className="sys-text-muted">Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.</p>
        <div className="sys-modal-footer sys-mt-6">
          <button type="button" className="sys-btn sys-btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
          <button type="button" className="sys-btn sys-btn-danger" onClick={handleDeleteConfirm}>Delete User</button>
        </div>
      </Modal>
    </div>
  );
}
