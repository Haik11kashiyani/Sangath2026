import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

export function SocialMediaManager() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    try {
      const data = await apiClient.get('/admin/social-media');
      setSocialLinks(data);
    } catch (error) {
      console.error('Error fetching social media:', error);
      alert('Failed to load social media links');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (link) => {
    try {
      await apiClient.put(`/admin/social-media/${link.id}`, link);
      alert('Social media link updated');
      fetchSocialMedia();
    } catch (error) {
      alert('Error updating social media: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading social media...</div>;

  return (
    <div className="social-media-manager">
      <h2> Social Media Manager</h2>
      <div className="social-links">
        {socialLinks.map((link) => (
          <div key={link.id} className="social-form">
            <div className="form-group">
              <label>Platform</label>
              <input
                type="text"
                value={link.platform}
                onChange={(e) => setSocialLinks(socialLinks.map(l => l.id === link.id ? { ...l, platform: e.target.value } : l))}
                placeholder="Platform (e.g., Facebook, Instagram)"
              />
            </div>
            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                value={link.url}
                onChange={(e) => setSocialLinks(socialLinks.map(l => l.id === link.id ? { ...l, url: e.target.value } : l))}
                placeholder="https://..."
              />
            </div>
            <button className="btn btn-primary" onClick={() => handleSave(link)}>
               Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
