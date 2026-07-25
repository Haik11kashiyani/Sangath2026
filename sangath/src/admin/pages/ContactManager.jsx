import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

export function ContactManager() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, new, read, replied
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const toast = useToast();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/contact-submissions');
      setSubmissions(data || []);
    } catch (err) {
      toast.error('Failed to fetch contact submissions.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleStatusChange = async (id, status) => {
    try {
      await apiClient.put(`/admin/contact-submissions/${id}/status`, { status });
      setSubmissions(subs => subs.map(sub => sub.id === id ? { ...sub, status } : sub));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status });
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await apiClient.put(`/admin/contact-submissions/${selectedItem.id}/reply`, { reply: replyText });
      const updatedStatus = 'replied';
      setSubmissions(subs => subs.map(sub => sub.id === selectedItem.id ? { ...sub, reply: replyText, status: updatedStatus } : sub));
      setSelectedItem({ ...selectedItem, reply: replyText, status: updatedStatus });
      toast.success('Reply sent successfully.');
    } catch (err) {
      toast.error('Failed to send reply.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/admin/contact-submissions/${selectedItem.id}`);
      setSubmissions(subs => subs.filter(sub => sub.id !== selectedItem.id));
      setSelectedItem(null);
      setIsDeleteModalOpen(false);
      toast.success('Submission deleted.');
    } catch (err) {
      toast.error('Failed to delete submission.');
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'var(--sys-color-success)';
      case 'replied': return 'var(--sys-color-info)';
      case 'read': return 'var(--sys-color-text-muted)';
      default: return 'var(--sys-color-text-muted)';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const counts = {
    all: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    read: submissions.filter(s => s.status === 'read').length,
    replied: submissions.filter(s => s.status === 'replied').length
  };

  return (
    <div className="sys-page-layout">
      <div className="sys-page-header">
        <div className="sys-page-title-group">
          <h1 className="sys-page-title">Contact Submissions</h1>
          <p className="sys-page-subtitle">Manage incoming messages ({counts.new} new)</p>
        </div>
      </div>

      <div className="sys-filter-bar sys-mb-4" style={{ display: 'flex', gap: '0.5rem' }}>
        {['all', 'new', 'read', 'replied'].map(f => (
          <button
            key={f}
            className={`sys-btn sys-btn-sm ${filter === f ? 'sys-btn-primary' : 'sys-btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} <Badge variant="muted" className="sys-ml-2">{counts[f]}</Badge>
          </button>
        ))}
      </div>

      <div className="sys-inbox-layout sys-card" style={{ display: 'flex', height: 'calc(100vh - 250px)', padding: 0, overflow: 'hidden' }}>
        
        {/* Left Pane: List */}
        <div className="sys-inbox-list" style={{ width: '35%', borderRight: '1px solid var(--sys-color-border)', overflowY: 'auto' }}>
          {loading ? (
            <div className="sys-p-4"><div className="sys-skeleton" style={{ height: '100%' }}></div></div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="sys-p-6 sys-text-center sys-text-muted">No submissions found.</div>
          ) : (
            filteredSubmissions.map(sub => (
              <div
                key={sub.id}
                className={`sys-inbox-item ${selectedItem?.id === sub.id ? 'sys-active' : ''} ${sub.status === 'new' ? 'unread' : ''}`}
                onClick={() => {
                  setSelectedItem(sub);
                  setReplyText(sub.reply || '');
                  if (sub.status === 'new') handleStatusChange(sub.id, 'read');
                }}
                style={{
                  padding: '1rem', borderBottom: '1px solid var(--sys-color-border)', cursor: 'pointer',
                  backgroundColor: selectedItem?.id === sub.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  fontWeight: sub.status === 'new' ? '600' : '400'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(sub.status) }}></div>
                    <span className="sys-text-truncate" style={{ maxWidth: '150px' }}>{sub.name}</span>
                  </div>
                  <span className="sys-text-xs sys-text-muted">{formatDate(sub.created_at)}</span>
                </div>
                <div className="sys-text-sm sys-text-truncate">{sub.subject}</div>
                <div className="sys-text-xs sys-text-muted sys-text-truncate" style={{ marginTop: '0.25rem' }}>{sub.message}</div>
              </div>
            ))
          )}
        </div>

        {/* Right Pane: Detail */}
        <div className="sys-inbox-detail" style={{ width: '65%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {!selectedItem ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--sys-color-text-muted)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="sys-mb-4" style={{ opacity: 0.5 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <p>Select a message to read</p>
            </div>
          ) : (
            <div className="sys-p-6" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedItem.subject}</h2>
                  <div className="sys-text-muted sys-text-sm">
                    <strong>From:</strong> {selectedItem.name} &lt;{selectedItem.email}&gt;
                  </div>
                  {selectedItem.phone && (
                    <div className="sys-text-muted sys-text-sm">
                      <strong>Phone:</strong> {selectedItem.phone}
                    </div>
                  )}
                  <div className="sys-text-muted sys-text-sm">
                    <strong>Date:</strong> {formatDate(selectedItem.created_at)}
                  </div>
                </div>
                <div className="sys-action-group">
                  {selectedItem.status !== 'read' && selectedItem.status !== 'replied' && (
                     <button className="sys-btn sys-btn-sm sys-btn-ghost" onClick={() => handleStatusChange(selectedItem.id, 'read')} title="Mark as Read">
                       Mark as Read
                     </button>
                  )}
                  <button className="sys-btn sys-btn-sm sys-btn-danger-ghost" onClick={() => setIsDeleteModalOpen(true)} title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>

              <div className="sys-message-body sys-p-4 sys-mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                {selectedItem.message}
              </div>

              <div className="sys-reply-section">
                <h3 className="sys-text-lg sys-mb-4">Reply</h3>
                {selectedItem.status === 'replied' ? (
                  <div className="sys-p-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                    <div className="sys-text-sm sys-text-muted sys-mb-2">You replied:</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedItem.reply}</div>
                  </div>
                ) : (
                  <form onSubmit={handleReplySubmit} className="sys-reply-form">
                    <div className="sys-form-group">
                      <textarea
                        className="sys-input"
                        rows="5"
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="sys-btn sys-btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sys-icon"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      Send Reply
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Submission">
        <p className="sys-text-muted">Are you sure you want to delete this message from {selectedItem?.name}? This action cannot be undone.</p>
        <div className="sys-modal-footer sys-mt-6">
          <button type="button" className="sys-btn sys-btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
          <button type="button" className="sys-btn sys-btn-danger" onClick={handleDeleteConfirm}>Delete</button>
        </div>
      </Modal>

    </div>
  );
}
