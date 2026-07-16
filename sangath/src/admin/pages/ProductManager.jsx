import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image_url: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get('/admin/products');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Product name is required');
      return;
    }

    try {
      if (editingProduct?.id) {
        await apiClient.put(`/admin/products/${editingProduct.id}`, formData);
      } else {
        await apiClient.post('/admin/products', formData);
      }
      alert(editingProduct?.id ? 'Product updated' : 'Product created');
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', image_url: '' });
      fetchProducts();
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await apiClient.delete(`/admin/products/${id}`);
        alert('Product deleted');
        fetchProducts();
      } catch (error) {
        alert('Error deleting product: ' + error.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="product-manager">
      <h2>📦 Product Manager</h2>
      
      <button 
        className="btn btn-primary btn-add"
        onClick={() => {
          setEditingProduct({});
          setFormData({ name: '', description: '', price: '', image_url: '' });
        }}
      >
        ➕ Add New Product
      </button>
      
      {editingProduct !== null && (
        <div className="modal-overlay">
          <div className="modal-content product-form">
            <h3>{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product Name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Price"
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {product.image_url && <img src={product.image_url} alt={product.name} className="product-image" />}
            <h3>{product.name}</h3>
            <p className="product-description">{product.description?.substring(0, 100)}...</p>
            <p className="product-price">${product.price}</p>
            <div className="product-actions">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingProduct(product);
                  setFormData(product);
                }}
              >
                ✏️ Edit
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(product.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
