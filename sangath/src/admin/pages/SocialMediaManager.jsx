import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toggle from '../components/Toggle';
import EmptyState from '../components/EmptyState';
import { apiClient } from '../utils/apiClient';

const Icons = {
  Facebook: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  Instagram: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  LinkedIn: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  'Twitter/X': (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>
  ),
  YouTube: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
  ),
  WhatsApp: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  TikTok: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    </svg>
  ),
  Pinterest: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.25 2.65 7.9 6.44 9.38-.08-.79-.16-2.02.04-2.88.17-.81 1.13-4.8 1.13-4.8s-.29-.58-.29-1.44c0-1.35.78-2.36 1.76-2.36.83 0 1.23.63 1.23 1.38 0 .84-.53 2.1-.81 3.27-.23.98.49 1.78 1.46 1.78 1.75 0 3.1-1.85 3.1-4.52 0-2.36-1.7-4.01-4.13-4.01-2.83 0-4.49 2.12-4.49 4.31 0 .85.33 1.76.74 2.26.08.1.09.19.06.31-.08.34-.27 1.09-.3 1.23-.05.21-.17.26-.39.15-1.47-.71-2.39-2.92-2.39-4.7 0-3.83 2.78-7.34 8.01-7.34 4.21 0 7.48 3.01 7.48 7.03 0 4.19-2.64 7.56-6.31 7.56-1.23 0-2.39-.64-2.79-1.4l-.76 2.89c-.27 1.04-1.02 2.34-1.52 3.13 1.12.35 2.31.54 3.54.54 5.52 0 10-4.48 10-10S17.52 2 12 2z"></path>
    </svg>
  ),
  Other: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  Plus: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Edit: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Delete: (
    <svg className="sys-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  ExternalLink: (
    <svg className="sys-icon sys-icon-sm" style={{width: '14px', height: '14px', marginLeft: '4px', display: 'inline-block'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  )
};

const PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter/X', 'YouTube', 'WhatsApp', 'TikTok', 'Pinterest', 'Other'];

export function SocialMediaManager() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({ platform: 'Facebook', url: '', iconUrl: '', displayOrder: 0, active: true });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/admin/social-media');
      setLinks(data || []);
    } catch (err) {
      toast.error('Failed to fetch social media links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openAddModal = () => {
    setEditingLink(null);
    setFormData({ platform: 'Facebook', url: '', iconUrl: '', displayOrder: links.length + 1, active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setFormData({ 
      platform: link.platform || 'Other', 
      url: link.url || '', 
      iconUrl: link.iconUrl || '', 
      displayOrder: link.displayOrder || 0, 
      active: link.active ?? true 
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (link) => {
    try {
      const updatedLink = { ...link, active: !link.active };
      // Optimistic update
      setLinks(links.map(l => l._id === link._id ? updatedLink : l));
      await apiClient.put(`/admin/social-media/${link._id}`, updatedLink);
      toast.success(`${link.platform} is now ${updatedLink.active ? 'active' : 'inactive'}`);
    } catch (err) {
      // Revert on fail
      setLinks(links.map(l => l._id === link._id ? link : l));
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
      toast.error('URL is required');
      return;
    }

    try {
      setIsSaving(true);
      if (editingLink) {
        const updated = await apiClient.put(`/admin/social-media/${editingLink._id}`, formData);
        setLinks(links.map(l => l._id === editingLink._id ? updated : l));
        toast.success('Social media link updated successfully');
      } else {
        const created = await apiClient.post('/admin/social-media', formData);
        setLinks([...links, created]);
        toast.success('Social media link added successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save social media link');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (link) => {
    setLinkToDelete(link);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/admin/social-media/${linkToDelete._id}`);
      setLinks(links.filter(l => l._id !== linkToDelete._id));
      toast.success('Social media link deleted');
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete social media link');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="sys-page-container">
      <div className="sys-page-header">
        <div>
          <h1 className="sys-page-title">Social Media</h1>
          <p className="sys-page-subtitle">Manage your social media presence</p>
        </div>
        <button className="sys-btn sys-btn-primary" onClick={openAddModal}>
          <span className="sys-btn-icon">{Icons.Plus}</span>
          Add Link
        </button>
      </div>

      {loading ? (
        <div className="sys-loading-spinner" />
      ) : links.length === 0 ? (
        <EmptyState 
          title="No Social Media Links"
          description="You haven't added any social media links yet."
          icon="inbox"
        />
      ) : (
        <div className="sys-grid-3">
          {links.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((link) => (
            <div key={link._id || link.id} className="sys-card sys-card-hover">
              <div className="sys-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="sys-icon-container" style={{ color: 'var(--sys-accent)' }}>
                    {Icons[link.platform] || Icons.Other}
                  </div>
                  <div>
                    <h3 className="sys-card-title">{link.platform}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant={link.active ? 'success' : 'default'}>
                        {link.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="sys-text-muted" style={{ fontSize: '0.75rem' }}>Order: {link.displayOrder || 0}</span>
                    </div>
                  </div>
                </div>
                <Toggle 
                  checked={link.active} 
                  onChange={() => handleToggleActive(link)} 
                />
              </div>
              
              <div className="sys-card-body" style={{ marginTop: '16px' }}>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="sys-text-body sys-link"
                  style={{ display: 'inline-flex', alignItems: 'center', wordBreak: 'break-all' }}
                >
                  {link.url.length > 40 ? link.url.substring(0, 40) + '...' : link.url}
                  {Icons.ExternalLink}
                </a>
              </div>
              
              <div className="sys-card-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--sys-border)', paddingTop: '16px' }}>
                <button className="sys-btn sys-btn-ghost sys-btn-sm" onClick={() => openEditModal(link)}>
                  <span className="sys-btn-icon">{Icons.Edit}</span>
                  Edit
                </button>
                <button className="sys-btn sys-btn-danger-ghost sys-btn-sm" onClick={() => confirmDelete(link)}>
                  <span className="sys-btn-icon">{Icons.Delete}</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingLink ? 'Edit Social Link' : 'Add Social Link'}
      >
        <form onSubmit={handleSubmit} className="sys-form">
          <div className="sys-form-group">
            <label className="sys-label">Platform</label>
            <select 
              className="sys-input sys-select"
              value={formData.platform}
              onChange={(e) => setFormData({...formData, platform: e.target.value})}
            >
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="sys-form-group">
            <label className="sys-label">URL <span className="sys-required">*</span></label>
            <input 
              type="url" 
              className="sys-input" 
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              placeholder="https://..."
              required
            />
          </div>
          
          <div className="sys-form-group">
            <label className="sys-label">Custom Icon URL (Optional)</label>
            <input 
              type="url" 
              className="sys-input" 
              value={formData.iconUrl}
              onChange={(e) => setFormData({...formData, iconUrl: e.target.value})}
              placeholder="https://.../icon.png"
            />
          </div>

          <div className="sys-form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="sys-form-group" style={{ flex: 1 }}>
              <label className="sys-label">Display Order</label>
              <input 
                type="number" 
                className="sys-input" 
                value={formData.displayOrder}
                onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="sys-form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="sys-label">Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Toggle 
                  checked={formData.active} 
                  onChange={(checked) => setFormData({...formData, active: checked})} 
                />
                <span className="sys-text-body">{formData.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          <div className="sys-modal-footer">
            <button type="button" className="sys-btn sys-btn-ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="sys-btn sys-btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingLink ? 'Update Link' : 'Add Link')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="sys-modal-body">
          <p className="sys-text-body">Are you sure you want to delete the social media link for <strong>{linkToDelete?.platform}</strong>? This action cannot be undone.</p>
        </div>
        <div className="sys-modal-footer">
          <button type="button" className="sys-btn sys-btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="sys-btn sys-btn-danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
