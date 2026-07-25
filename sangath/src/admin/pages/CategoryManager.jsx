import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';

export function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', displayOrder: 0 });
  const [submitting, setSubmitting] = useState(false);
  
  const toast = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({ name: category.name, description: category.description || '', displayOrder: category.displayOrder || 0 });
    } else {
      setCurrentCategory(null);
      setFormData({ name: '', description: '', displayOrder: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (currentCategory) {
        await apiClient.put(`/admin/categories/${currentCategory.id}`, formData);
        toast.success('Category updated');
      } else {
        await apiClient.post('/admin/categories', formData);
        toast.success('Category created');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    if (category.productsCount > 0) {
      toast.error(`Cannot delete category "${category.name}" as it has ${category.productsCount} products.`);
      return;
    }
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/admin/categories/${currentCategory.id}`);
      toast.success('Category deleted');
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Error deleting category');
    }
  };

  const generateSlugPreview = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'description', label: 'Description', render: (val) => <span className="sys-truncate sys-max-w-xs sys-inline-block">{val}</span> },
    { key: 'productsCount', label: 'Products' },
    { key: 'displayOrder', label: 'Display Order' },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_, row) => (
        <div className="sys-flex sys-gap-2 sys-items-center">
          <button onClick={() => handleOpenModal(row)} className="sys-btn-icon sys-text-accent hover:sys-text-white sys-p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onClick={() => handleDeleteClick(row)} className="sys-btn-icon sys-text-error hover:sys-text-white sys-p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      ) 
    }
  ];

  return (
    <div className="sys-page-container sys-p-6">
      <div className="sys-page-header sys-flex sys-justify-between sys-items-center sys-mb-6">
        <div>
          <h1 className="sys-text-2xl sys-font-bold sys-text-white">Categories</h1>
          <p className="sys-text-muted sys-text-sm">Manage product categories</p>
        </div>
        <button onClick={() => handleOpenModal()} className="sys-btn sys-btn-primary sys-bg-accent sys-text-base sys-px-4 sys-py-2 sys-rounded sys-font-medium hover:sys-bg-accent-hover">
          Add Category
        </button>
      </div>

      <div className="sys-card sys-glass sys-p-4 sys-rounded-lg sys-border sys-border-white-10">
        {loading ? (
          <div className="sys-p-8 sys-text-center sys-text-muted">Loading categories...</div>
        ) : categories.length === 0 ? (
          <EmptyState title="No categories found" description="Create your first category to get started." />
        ) : (
          <DataTable columns={columns} data={categories} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentCategory ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="sys-space-y-4">
          <div className="sys-form-group sys-mb-4">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Name</label>
            <input 
              type="text" 
              className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white focus:sys-border-accent focus:sys-outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {formData.name && (
              <div className="sys-text-xs sys-text-muted sys-mt-1 sys-font-mono">Slug: {generateSlugPreview(formData.name)}</div>
            )}
          </div>
          <div className="sys-form-group sys-mb-4">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Description</label>
            <textarea 
              className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white focus:sys-border-accent focus:sys-outline-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows="4"
            />
          </div>
          <div className="sys-form-group sys-mb-4">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Display Order</label>
            <input 
              type="number" 
              className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white focus:sys-border-accent focus:sys-outline-none"
              value={formData.displayOrder}
              onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="sys-flex sys-justify-end sys-gap-2 sys-mt-6">
            <button type="button" onClick={handleCloseModal} className="sys-btn sys-btn-ghost sys-px-4 sys-py-2 sys-rounded sys-text-white hover:sys-bg-white-10">Cancel</button>
            <button type="submit" disabled={submitting} className="sys-btn sys-btn-primary sys-bg-accent sys-text-base sys-px-4 sys-py-2 sys-rounded hover:sys-bg-accent-hover disabled:sys-opacity-50">
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" variant="danger">
        <div className="sys-text-white sys-mb-4">
          <p>Are you sure you want to delete the category <strong>{currentCategory?.name}</strong>?</p>
          <p className="sys-text-error sys-text-sm sys-mt-2">This action cannot be undone.</p>
        </div>
        <div className="sys-flex sys-justify-end sys-gap-2 sys-mt-6">
          <button onClick={() => setIsDeleteModalOpen(false)} className="sys-btn sys-btn-ghost sys-px-4 sys-py-2 sys-rounded sys-text-white hover:sys-bg-white-10">Cancel</button>
          <button onClick={confirmDelete} className="sys-btn sys-btn-danger sys-bg-error sys-text-white sys-px-4 sys-py-2 sys-rounded hover:sys-bg-error-hover">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
