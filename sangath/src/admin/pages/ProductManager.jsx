import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Toggle from '../components/Toggle';
import EmptyState from '../components/EmptyState';

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '', description: '', price: 0, categoryId: '', imageUrl: '',
    isFeatured: false, isActive: true, displayOrder: 0, specifications: '[]', details: '[]'
  };
  const [formData, setFormData] = useState(initialForm);

  const toast = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/products');
      setProducts(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiClient.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        categoryId: product.categoryId || '',
        imageUrl: product.imageUrl || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        displayOrder: product.displayOrder || 0,
        specifications: JSON.stringify(product.specifications || [], null, 2),
        details: JSON.stringify(product.details || [], null, 2)
      });
    } else {
      setCurrentProduct(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let parsedSpecs = [];
      let parsedDetails = [];
      try { parsedSpecs = JSON.parse(formData.specifications); } catch(e) { throw new Error('Invalid JSON in Specifications'); }
      try { parsedDetails = JSON.parse(formData.details); } catch(e) { throw new Error('Invalid JSON in Details'); }

      const payload = {
        ...formData,
        price: Number(formData.price),
        displayOrder: Number(formData.displayOrder),
        specifications: parsedSpecs,
        details: parsedDetails
      };

      if (currentProduct) {
        await apiClient.put(`/admin/products/${currentProduct.id}`, payload);
        toast.success('Product updated');
      } else {
        await apiClient.post('/admin/products', payload);
        toast.success('Product created');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeature = async (id, currentVal) => {
    try {
      await apiClient.patch(`/admin/products/${id}/feature`, { isFeatured: !currentVal });
      toast.success('Featured status updated');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleToggleStatus = async (id, currentVal) => {
    try {
      await apiClient.patch(`/admin/products/${id}/toggle`, { isActive: !currentVal });
      toast.success('Active status updated');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/admin/products/${currentProduct.id}`);
      toast.success('Product deleted');
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Error deleting product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter ? p.categoryId === categoryFilter : true;
    const matchStatus = statusFilter === 'active' ? p.isActive !== false : statusFilter === 'inactive' ? p.isActive === false : true;
    return matchName && matchCat && matchStatus;
  });

  const columns = [
    { 
      key: 'imageUrl', 
      label: 'Image', 
      render: (val) => val ? <img src={val} alt="thumb" className="sys-w-10 sys-h-10 sys-object-cover sys-rounded sys-border sys-border-white-10" /> : <div className="sys-w-10 sys-h-10 sys-bg-white-10 sys-rounded" />
    },
    { key: 'name', label: 'Name' },
    { key: 'categoryName', label: 'Category', render: (_, row) => categories.find(c => c.id === row.categoryId)?.name || 'Unknown' },
    { key: 'price', label: 'Price', render: (val) => `$${Number(val).toFixed(2)}` },
    { 
      key: 'isFeatured', 
      label: 'Featured', 
      render: (val, row) => (
        <div onClick={() => handleToggleFeature(row.id, val)} className="sys-cursor-pointer">
          <Badge variant={val ? 'success' : 'default'}>{val ? 'Featured' : 'Standard'}</Badge>
        </div>
      ) 
    },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (val, row) => (
        <div onClick={() => handleToggleStatus(row.id, val !== false)} className="sys-cursor-pointer">
          <Badge variant={val !== false ? 'success' : 'error'}>{val !== false ? 'Active' : 'Inactive'}</Badge>
        </div>
      ) 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_, row) => (
        <div className="sys-flex sys-gap-2 sys-items-center">
          <button onClick={() => handleOpenModal(row)} className="sys-btn-icon sys-text-accent hover:sys-text-white sys-p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onClick={() => { setCurrentProduct(row); setIsDeleteModalOpen(true); }} className="sys-btn-icon sys-text-error hover:sys-text-white sys-p-1">
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
          <h1 className="sys-text-2xl sys-font-bold sys-text-white">Products</h1>
          <p className="sys-text-muted sys-text-sm">Manage inventory and product details</p>
        </div>
        <button onClick={() => handleOpenModal()} className="sys-btn sys-btn-primary sys-bg-accent sys-text-base sys-px-4 sys-py-2 sys-rounded sys-font-medium hover:sys-bg-accent-hover">
          Add Product
        </button>
      </div>

      <div className="sys-filter-bar sys-flex sys-gap-4 sys-mb-6 sys-bg-surface sys-p-4 sys-rounded-lg sys-border sys-border-white-10">
        <input 
          type="text" placeholder="Search products..." 
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="sys-input sys-flex-1 sys-p-2 sys-rounded sys-bg-base sys-border sys-border-white-20 sys-text-white focus:sys-border-accent"
        />
        <select 
          value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="sys-input sys-p-2 sys-rounded sys-bg-base sys-border sys-border-white-20 sys-text-white focus:sys-border-accent"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select 
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="sys-input sys-p-2 sys-rounded sys-bg-base sys-border sys-border-white-20 sys-text-white focus:sys-border-accent"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="sys-card sys-glass sys-p-4 sys-rounded-lg sys-border sys-border-white-10">
        {loading ? (
          <div className="sys-p-8 sys-text-center sys-text-muted">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your filters or create a new product." />
        ) : (
          <DataTable columns={columns} data={filteredProducts} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="sys-space-y-4 sys-max-h-[70vh] sys-overflow-y-auto sys-pr-2">
          <div className="sys-grid sys-grid-cols-2 sys-gap-4">
            <div className="sys-form-group sys-col-span-2">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Name *</label>
              <input type="text" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="sys-form-group sys-col-span-2">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Description</label>
              <textarea className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="6" />
            </div>
            <div className="sys-form-group">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Price</label>
              <input type="number" step="0.01" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="sys-form-group">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Category</label>
              <select className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sys-form-group sys-col-span-2">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Image URL</label>
              <input type="text" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="sys-mt-2 sys-h-24 sys-object-contain sys-bg-white-10 sys-rounded sys-p-1" />}
            </div>
            <div className="sys-form-group">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Featured</label>
              <Toggle checked={formData.isFeatured} onChange={val => setFormData({...formData, isFeatured: val})} />
            </div>
            <div className="sys-form-group">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Active</label>
              <Toggle checked={formData.isActive} onChange={val => setFormData({...formData, isActive: val})} />
            </div>
            <div className="sys-form-group">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Display Order</label>
              <input type="number" className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: e.target.value})} />
            </div>
            <div className="sys-form-group sys-col-span-2">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Specifications (JSON Array)</label>
              <textarea className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white sys-font-mono sys-text-sm" value={formData.specifications} onChange={e => setFormData({...formData, specifications: e.target.value})} rows="4" placeholder="[{&quot;key&quot;:&quot;Color&quot;,&quot;value&quot;:&quot;Red&quot;}]" />
            </div>
            <div className="sys-form-group sys-col-span-2">
              <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Details (JSON Array)</label>
              <textarea className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white sys-font-mono sys-text-sm" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} rows="4" placeholder="[&quot;Detail 1&quot;, &quot;Detail 2&quot;]" />
            </div>
          </div>
          <div className="sys-flex sys-justify-end sys-gap-2 sys-mt-6 sys-pt-4 sys-border-t sys-border-white-10">
            <button type="button" onClick={() => setIsModalOpen(false)} className="sys-btn sys-btn-ghost sys-px-4 sys-py-2 sys-rounded sys-text-white hover:sys-bg-white-10">Cancel</button>
            <button type="submit" disabled={submitting} className="sys-btn sys-btn-primary sys-bg-accent sys-text-base sys-px-4 sys-py-2 sys-rounded hover:sys-bg-accent-hover disabled:sys-opacity-50">
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" variant="danger">
        <div className="sys-text-white sys-mb-4">
          <p>Are you sure you want to delete the product <strong>{currentProduct?.name}</strong>?</p>
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
