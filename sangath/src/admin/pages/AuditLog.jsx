import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';
import Badge from '../components/Badge';
import { SkeletonLoader } from '../components/SkeletonLoader';

export function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const toast = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (resourceFilter) params.append('resource_type', resourceFilter);
      params.append('limit', '50');

      const data = await apiClient.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(data || []);
    } catch (err) {
      toast.error('Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resourceFilter, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleExpand = (id) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'create': return <Badge variant="success">Create</Badge>;
      case 'update': return <Badge variant="info">Update</Badge>;
      case 'delete': return <Badge variant="danger">Delete</Badge>;
      case 'reset_password': return <Badge variant="warning">Reset Password</Badge>;
      default: return <Badge variant="muted">{action}</Badge>;
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return days === 1 ? 'Yesterday' : `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="sys-page-layout">
      <div className="sys-page-header">
        <div className="sys-page-title-group">
          <h1 className="sys-page-title">Audit Log</h1>
          <p className="sys-page-subtitle">Activity trail of all admin actions</p>
        </div>
      </div>

      <div className="sys-card sys-mb-6">
        <div className="sys-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="sys-form-group" style={{ marginBottom: 0 }}>
            <label className="sys-label">Action</label>
            <select className="sys-input" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="reset_password">Reset Password</option>
            </select>
          </div>
          <div className="sys-form-group" style={{ marginBottom: 0 }}>
            <label className="sys-label">Resource Type</label>
            <select className="sys-input" value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
              <option value="">All Resources</option>
              <option value="admin_user">Admin User</option>
              <option value="product">Product</option>
              <option value="page">Page</option>
              <option value="category">Category</option>
              <option value="social_media">Social Media</option>
              <option value="site_settings">Site Settings</option>
              <option value="contact_submission">Contact Submission</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sys-activity-feed sys-card">
        {loading ? (
          <SkeletonLoader type="table" />
        ) : logs.length === 0 ? (
          <div className="sys-text-center sys-p-6 sys-text-muted">No activity logs found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.map(log => (
              <div key={log.id} style={{ borderLeft: '2px solid var(--sys-color-border)', paddingLeft: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--sys-color-border)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => toggleExpand(log.id)}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {getActionBadge(log.action)}
                      <span className="sys-text-sm">
                        <strong className="sys-text-primary">{log.admin_email}</strong> {log.action}d <strong>{log.resource_type}</strong> {log.resource_id}
                      </span>
                    </div>
                    <div className="sys-text-xs sys-text-muted">{formatTimeAgo(log.created_at)}</div>
                  </div>
                  {(log.old_values || log.new_values) && (
                    <button className="sys-btn sys-btn-ghost sys-btn-sm" style={{ padding: '0.25rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedLogs.has(log.id) ? 'rotate(180deg)' : 'rotate(0)' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  )}
                </div>
                
                {expandedLogs.has(log.id) && (log.old_values || log.new_values) && (
                  <div className="sys-grid sys-mt-4" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px' }}>
                    {log.old_values && (
                      <div>
                        <div className="sys-text-xs sys-text-muted sys-mb-2">Previous Data</div>
                        <pre style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sys-color-danger)', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace' }}>
                          {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_values && (
                      <div>
                        <div className="sys-text-xs sys-text-muted sys-mb-2">New Data</div>
                        <pre style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sys-color-success)', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace' }}>
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {logs.length > 0 && !loading && (
          <div className="sys-mt-6 sys-text-center">
            <button className="sys-btn sys-btn-ghost">Load More</button>
          </div>
        )}
      </div>
    </div>
  );
}
