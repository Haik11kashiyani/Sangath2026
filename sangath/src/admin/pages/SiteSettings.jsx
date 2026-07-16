import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

export function SiteSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiClient.get('/admin/settings');
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value) => {
    try {
      await apiClient.put(`/admin/settings/${key}`, { value });
      alert('Setting updated');
    } catch (error) {
      alert('Error updating setting: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="site-settings">
      <h2>⚙️ Site Settings</h2>
      <div className="settings-form">
        <div className="setting">
          <label>Site Name</label>
          <input
            type="text"
            value={settings.site_name || ''}
            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            onBlur={() => handleSave('site_name', settings.site_name)}
            placeholder="Your Company Name"
          />
        </div>
        <div className="setting">
          <label>Business Niche / Description</label>
          <textarea
            value={settings.niche_description || ''}
            onChange={(e) => setSettings({ ...settings, niche_description: e.target.value })}
            onBlur={() => handleSave('niche_description', settings.niche_description)}
            placeholder="Describe your business..."
            rows="4"
          />
        </div>
        <div className="setting">
          <label>Logo URL</label>
          <input
            type="url"
            value={settings.logo_url || ''}
            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            onBlur={() => handleSave('logo_url', settings.logo_url)}
            placeholder="https://..."
          />
        </div>
        <div className="setting">
          <label>Favicon URL</label>
          <input
            type="url"
            value={settings.favicon_url || ''}
            onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
            onBlur={() => handleSave('favicon_url', settings.favicon_url)}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}
