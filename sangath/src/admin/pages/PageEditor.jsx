import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toggle from '../components/Toggle';

export function PageEditor() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState(null);
  const [editorData, setEditorData] = useState(null);
  
  // Modals & States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', slug: '', content: '' });
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/pages');
      setPages(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    if (activeSlug) {
      const page = pages.find(p => p.slug === activeSlug);
      if (page) {
        setEditorData({
          title: page.title,
          slug: page.slug,
          content: page.content || '',
          metaDescription: page.metaDescription || '',
          metaKeywords: page.metaKeywords || '',
          isPublished: page.isPublished !== false
        });
      }
    } else {
      setEditorData(null);
    }
  }, [activeSlug, pages]);

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/admin/pages', createForm);
      toast.success('Page created successfully');
      setIsCreateModalOpen(false);
      await fetchPages();
      setActiveSlug(createForm.slug);
      setCreateForm({ title: '', slug: '', content: '' });
    } catch (err) {
      toast.error(err.message || 'Error creating page');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditor = async () => {
    if (!editorData) return;
    setSaving(true);
    try {
      // Put to the original slug, even if they changed the slug in the form (changing slug might need backend support)
      await apiClient.put(`/admin/pages/${activeSlug}`, editorData);
      toast.success('Page updated successfully');
      if (editorData.slug !== activeSlug) {
        setActiveSlug(editorData.slug);
      }
      fetchPages();
    } catch (err) {
      toast.error(err.message || 'Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/admin/pages/${activeSlug}`);
      toast.success('Page deleted');
      setIsDeleteModalOpen(false);
      setActiveSlug(null);
      fetchPages();
    } catch (err) {
      toast.error(err.message || 'Error deleting page');
    }
  };

  return (
    <div className="sys-editor-layout sys-flex sys-h-full sys-min-h-[80vh] sys-gap-6 sys-p-6">
      <div className="sys-editor-sidebar sys-w-[280px] sys-flex-shrink-0 sys-flex sys-flex-col sys-card sys-glass sys-rounded-lg sys-border sys-border-white-10 sys-overflow-hidden">
        <div className="sys-p-4 sys-border-b sys-border-white-10">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="sys-btn sys-btn-primary sys-w-full sys-bg-accent sys-text-base sys-py-2 sys-rounded hover:sys-bg-accent-hover sys-font-medium"
          >
            Create Page
          </button>
        </div>
        <div className="sys-flex-1 sys-overflow-y-auto sys-p-2 sys-space-y-1">
          {loading ? (
            <div className="sys-text-center sys-p-4 sys-text-muted sys-text-sm">Loading...</div>
          ) : pages.length === 0 ? (
            <div className="sys-text-center sys-p-4 sys-text-muted sys-text-sm">No pages found.</div>
          ) : (
            pages.map(page => (
              <div 
                key={page.slug}
                onClick={() => setActiveSlug(page.slug)}
                className={`sys-page-list-item sys-p-3 sys-rounded sys-cursor-pointer sys-transition-colors sys-flex sys-justify-between sys-items-center ${activeSlug === page.slug ? 'sys-bg-white-10 sys-border sys-border-white-20 active' : 'hover:sys-bg-white-5 sys-border sys-border-transparent'}`}
              >
                <span className="sys-text-sm sys-font-medium sys-text-white sys-truncate sys-mr-2">{page.title}</span>
                <Badge variant={page.isPublished !== false ? 'success' : 'default'}>
                  {page.isPublished !== false ? 'Pub' : 'Draft'}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sys-editor-main sys-flex-1 sys-card sys-glass sys-rounded-lg sys-border sys-border-white-10 sys-flex sys-flex-col">
        {editorData ? (
          <div className="sys-p-6 sys-flex sys-flex-col sys-h-full sys-space-y-4">
            <div className="sys-flex sys-justify-between sys-items-center sys-mb-2">
              <h2 className="sys-text-xl sys-font-bold sys-text-white">Edit Page</h2>
              <div className="sys-flex sys-gap-2 sys-items-center">
                <span className="sys-text-sm sys-text-muted sys-mr-2">Published:</span>
                <Toggle checked={editorData.isPublished} onChange={val => setEditorData({...editorData, isPublished: val})} />
              </div>
            </div>

            <div className="sys-grid sys-grid-cols-2 sys-gap-4">
              <div className="sys-form-group">
                <label className="sys-text-sm sys-text-muted sys-mb-1 sys-block">Page Title</label>
                <input 
                  type="text" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white"
                  value={editorData.title} onChange={e => setEditorData({...editorData, title: e.target.value})}
                />
              </div>
              <div className="sys-form-group">
                <label className="sys-text-sm sys-text-muted sys-mb-1 sys-block">URL Slug</label>
                <input 
                  type="text" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white"
                  value={editorData.slug} onChange={e => setEditorData({...editorData, slug: e.target.value})}
                />
              </div>
            </div>

            <div className="sys-form-group sys-flex-1 sys-flex sys-flex-col">
              <label className="sys-text-sm sys-text-muted sys-mb-1 sys-block">Content (HTML/Text)</label>
              <textarea 
                className="sys-input sys-w-full sys-flex-1 sys-p-3 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white sys-font-mono sys-text-sm"
                value={editorData.content} onChange={e => setEditorData({...editorData, content: e.target.value})}
                rows="10"
              />
            </div>

            <div className="sys-grid sys-grid-cols-2 sys-gap-4">
              <div className="sys-form-group">
                <div className="sys-flex sys-justify-between sys-mb-1">
                  <label className="sys-text-sm sys-text-muted">Meta Description</label>
                  <span className="sys-text-xs sys-text-muted">{editorData.metaDescription.length}/160</span>
                </div>
                <input 
                  type="text" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white"
                  value={editorData.metaDescription} onChange={e => setEditorData({...editorData, metaDescription: e.target.value})}
                  maxLength={160}
                />
              </div>
              <div className="sys-form-group">
                <label className="sys-text-sm sys-text-muted sys-mb-1 sys-block">Meta Keywords</label>
                <input 
                  type="text" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white"
                  value={editorData.metaKeywords} onChange={e => setEditorData({...editorData, metaKeywords: e.target.value})}
                  placeholder="comma, separated, tags"
                />
              </div>
            </div>

            <div className="sys-flex sys-justify-between sys-items-center sys-mt-4 sys-pt-4 sys-border-t sys-border-white-10">
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="sys-btn sys-btn-outline sys-text-error sys-border-error-20 hover:sys-bg-error-10 sys-px-4 sys-py-2 sys-rounded"
              >
                Delete Page
              </button>
              <button 
                onClick={handleSaveEditor} disabled={saving}
                className="sys-btn sys-btn-primary sys-bg-accent sys-text-base sys-px-6 sys-py-2 sys-rounded hover:sys-bg-accent-hover disabled:sys-opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="sys-flex sys-items-center sys-justify-center sys-h-full sys-text-muted">
            Select a page from the sidebar to edit or create a new one.
          </div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Page">
        <form onSubmit={handleCreateSubmit} className="sys-space-y-4">
          <div className="sys-form-group">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Page Title</label>
            <input 
              type="text" required
              className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white"
              value={createForm.title} 
              onChange={e => setCreateForm({...createForm, title: e.target.value, slug: generateSlug(e.target.value)})}
            />
          </div>
          <div className="sys-form-group">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">URL Slug</label>
            <input 
              type="text" required
              className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white"
              value={createForm.slug} onChange={e => setCreateForm({...createForm, slug: e.target.value})}
            />
          </div>
          <div className="sys-form-group">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Initial Content</label>
            <textarea 
              className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white"
              value={createForm.content} onChange={e => setCreateForm({...createForm, content: e.target.value})}
              rows="4"
            />
          </div>
          <div className="sys-flex sys-justify-end sys-gap-2 sys-mt-6">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="sys-btn sys-btn-ghost sys-px-4 sys-py-2 sys-rounded sys-text-white hover:sys-bg-white-10">Cancel</button>
            <button type="submit" disabled={saving} className="sys-btn sys-btn-primary sys-bg-accent sys-text-base sys-px-4 sys-py-2 sys-rounded hover:sys-bg-accent-hover disabled:sys-opacity-50">
              {saving ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" variant="danger">
        <div className="sys-text-white sys-mb-4">
          <p>Are you sure you want to delete this page?</p>
          <p className="sys-text-error sys-text-sm sys-mt-2">This action cannot be undone.</p>
        </div>
        <div className="sys-flex sys-justify-end sys-gap-2 sys-mt-6">
          <button onClick={() => setIsDeleteModalOpen(false)} className="sys-btn sys-btn-ghost sys-px-4 sys-py-2 sys-rounded sys-text-white hover:sys-bg-white-10">Cancel</button>
          <button onClick={handleDelete} className="sys-btn sys-btn-danger sys-bg-error sys-text-white sys-px-4 sys-py-2 sys-rounded hover:sys-bg-error-hover">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
