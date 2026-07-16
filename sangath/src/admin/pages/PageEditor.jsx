import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

export function PageEditor() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '', meta_description: '' });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await apiClient.get('/admin/pages');
      setPages(data);
      if (data.length > 0) {
        setSelectedPage(data[0]);
        setFormData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      alert('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    
    try {
      await apiClient.put(`/admin/pages/${selectedPage.slug}`, formData);
      alert('Page updated successfully');
      fetchPages();
    } catch (error) {
      alert('Error updating page: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading pages...</div>;

  return (
    <div className="page-editor">
      <h2>📄 Page Editor</h2>
      <div className="editor-container">
        <div className="pages-list">
          {pages.map((page) => (
            <button
              key={page.id}
              className={`page-item ${selectedPage?.id === page.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedPage(page);
                setFormData(page);
              }}
            >
              {page.title}
            </button>
          ))}
        </div>
        {selectedPage && (
          <div className="page-form">
            <h3>Edit: {selectedPage.title}</h3>
            <div className="form-group">
              <label>Page Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Page Title"
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Page Content"
                rows="10"
              />
            </div>
            <div className="form-group">
              <label>Meta Description (SEO)</label>
              <input
                type="text"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="Meta Description"
                maxLength="160"
              />
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
