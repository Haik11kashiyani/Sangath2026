import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toggle from '../components/Toggle';
import EmptyState from '../components/EmptyState';

const TABS = [
  { id: 'branding', label: 'Branding' },
  { id: 'contact', label: 'Contact Info' },
  { id: 'social', label: 'Social Media' },
  { id: 'seo', label: 'SEO & Meta' },
  { id: 'about', label: 'About & Legal' },
  { id: 'footer', label: 'Footer & Display' },
];

export function SiteSettings() {
  const [activeTab, setActiveTab] = useState('branding');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/settings');
      // Assume API returns object with key-value pairs or array of setting objects
      // Format to simple key: value object if it's an array: 
      // const settingsObj = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      setSettings(data || {});
    } catch (err) {
      toast.error('Failed to fetch settings.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (keysToSave) => {
    setSaving(true);
    try {
      const payload = {};
      keysToSave.forEach((key) => {
        payload[key] = settings[key];
      });
      await apiClient.put('/admin/settings', payload);
      toast.success('Settings saved successfully.');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="sys-page-layout">
        <div className="sys-page-header">
          <div className="sys-page-title-group">
            <h1 className="sys-page-title">Site Settings</h1>
            <p className="sys-page-subtitle">Complete control over your business</p>
          </div>
        </div>
        <div className="sys-skeleton sys-card" style={{ height: '400px' }}></div>
      </div>
    );
  }

  const renderBranding = () => (
    <div className="sys-card">
      <h2 className="sys-card-title">Branding</h2>
      <div className="sys-form-group">
        <label className="sys-label">Platform Name</label>
        <input className="sys-input" type="text" value={settings.platform_name || ''} onChange={(e) => handleChange('platform_name', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Platform Tagline</label>
        <input className="sys-input" type="text" value={settings.platform_tagline || ''} onChange={(e) => handleChange('platform_tagline', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Logo URL</label>
        <input className="sys-input" type="text" value={settings.logo_url || ''} onChange={(e) => handleChange('logo_url', e.target.value)} />
        {settings.logo_url && <img src={settings.logo_url} alt="Logo preview" className="sys-mt-2" style={{ maxHeight: '60px' }} />}
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Favicon URL</label>
        <input className="sys-input" type="text" value={settings.favicon_url || ''} onChange={(e) => handleChange('favicon_url', e.target.value)} />
      </div>
      <button className="sys-btn sys-btn-primary" onClick={() => handleSave(['platform_name', 'platform_tagline', 'logo_url', 'favicon_url'])} disabled={saving}>
        Save Branding
      </button>
    </div>
  );

  const renderContact = () => (
    <div className="sys-card">
      <h2 className="sys-card-title">Contact Information</h2>
      <div className="sys-form-group">
        <label className="sys-label">Contact Email</label>
        <input className="sys-input" type="email" value={settings.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Contact Phone</label>
        <input className="sys-input" type="text" value={settings.contact_phone || ''} onChange={(e) => handleChange('contact_phone', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Address</label>
        <textarea className="sys-input" rows="3" value={settings.address || ''} onChange={(e) => handleChange('address', e.target.value)}></textarea>
      </div>
      <div className="sys-form-group">
        <label className="sys-label">WhatsApp Number</label>
        <input className="sys-input" type="text" value={settings.whatsapp_number || ''} onChange={(e) => handleChange('whatsapp_number', e.target.value)} />
      </div>
      <button className="sys-btn sys-btn-primary" onClick={() => handleSave(['contact_email', 'contact_phone', 'address', 'whatsapp_number'])} disabled={saving}>
        Save Contact Info
      </button>
    </div>
  );

  const renderSocial = () => (
    <div className="sys-card">
      <h2 className="sys-card-title">Social Media</h2>
      <div className="sys-form-group">
        <label className="sys-label">Facebook URL</label>
        <input className="sys-input" type="text" value={settings.social_facebook || ''} onChange={(e) => handleChange('social_facebook', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Instagram URL</label>
        <input className="sys-input" type="text" value={settings.social_instagram || ''} onChange={(e) => handleChange('social_instagram', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">LinkedIn URL</label>
        <input className="sys-input" type="text" value={settings.social_linkedin || ''} onChange={(e) => handleChange('social_linkedin', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Twitter/X URL</label>
        <input className="sys-input" type="text" value={settings.social_twitter || ''} onChange={(e) => handleChange('social_twitter', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">YouTube URL</label>
        <input className="sys-input" type="text" value={settings.social_youtube || ''} onChange={(e) => handleChange('social_youtube', e.target.value)} />
      </div>
      <button className="sys-btn sys-btn-primary" onClick={() => handleSave(['social_facebook', 'social_instagram', 'social_linkedin', 'social_twitter', 'social_youtube'])} disabled={saving}>
        Save Social Media
      </button>
    </div>
  );

  const renderSeo = () => (
    <div className="sys-card">
      <h2 className="sys-card-title">SEO & Meta</h2>
      <div className="sys-form-group">
        <label className="sys-label">Default Meta Description</label>
        <textarea className="sys-input" rows="3" value={settings.meta_description || ''} onChange={(e) => handleChange('meta_description', e.target.value)}></textarea>
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Default Meta Keywords</label>
        <input className="sys-input" type="text" value={settings.meta_keywords || ''} onChange={(e) => handleChange('meta_keywords', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">OG Image URL</label>
        <input className="sys-input" type="text" value={settings.og_image_url || ''} onChange={(e) => handleChange('og_image_url', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Google Analytics ID</label>
        <input className="sys-input" type="text" value={settings.google_analytics_id || ''} onChange={(e) => handleChange('google_analytics_id', e.target.value)} />
      </div>
      <button className="sys-btn sys-btn-primary" onClick={() => handleSave(['meta_description', 'meta_keywords', 'og_image_url', 'google_analytics_id'])} disabled={saving}>
        Save SEO
      </button>
    </div>
  );

  const renderAbout = () => (
    <div className="sys-card">
      <h2 className="sys-card-title">About & Legal</h2>
      <div className="sys-form-group">
        <label className="sys-label">About Us</label>
        <textarea className="sys-input" rows="6" value={settings.about_us || ''} onChange={(e) => handleChange('about_us', e.target.value)}></textarea>
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Mission Statement</label>
        <textarea className="sys-input" rows="3" value={settings.mission_statement || ''} onChange={(e) => handleChange('mission_statement', e.target.value)}></textarea>
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Vision Statement</label>
        <textarea className="sys-input" rows="3" value={settings.vision_statement || ''} onChange={(e) => handleChange('vision_statement', e.target.value)}></textarea>
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Privacy Policy</label>
        <textarea className="sys-input" rows="8" value={settings.privacy_policy || ''} onChange={(e) => handleChange('privacy_policy', e.target.value)}></textarea>
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Terms & Conditions</label>
        <textarea className="sys-input" rows="8" value={settings.terms_conditions || ''} onChange={(e) => handleChange('terms_conditions', e.target.value)}></textarea>
      </div>
      <button className="sys-btn sys-btn-primary" onClick={() => handleSave(['about_us', 'mission_statement', 'vision_statement', 'privacy_policy', 'terms_conditions'])} disabled={saving}>
        Save About & Legal
      </button>
    </div>
  );

  const renderFooter = () => (
    <div className="sys-card">
      <h2 className="sys-card-title">Footer & Display</h2>
      <div className="sys-form-group">
        <label className="sys-label">Footer Text</label>
        <input className="sys-input" type="text" value={settings.footer_text || ''} onChange={(e) => handleChange('footer_text', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Copyright Text</label>
        <input className="sys-input" type="text" value={settings.copyright_text || ''} onChange={(e) => handleChange('copyright_text', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Homepage Hero Title</label>
        <input className="sys-input" type="text" value={settings.hero_title || ''} onChange={(e) => handleChange('hero_title', e.target.value)} />
      </div>
      <div className="sys-form-group">
        <label className="sys-label">Homepage Hero Subtitle</label>
        <input className="sys-input" type="text" value={settings.hero_subtitle || ''} onChange={(e) => handleChange('hero_subtitle', e.target.value)} />
      </div>
      <button className="sys-btn sys-btn-primary" onClick={() => handleSave(['footer_text', 'copyright_text', 'hero_title', 'hero_subtitle'])} disabled={saving}>
        Save Footer
      </button>
    </div>
  );

  return (
    <div className="sys-page-layout">
      <div className="sys-page-header">
        <div className="sys-page-title-group">
          <h1 className="sys-page-title">Site Settings</h1>
          <p className="sys-page-subtitle">Complete control over your business</p>
        </div>
      </div>
      
      <div className="sys-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--sys-color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sys-nav-item ${activeTab === tab.id ? 'sys-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none', border: 'none', color: activeTab === tab.id ? 'var(--sys-color-primary)' : 'var(--sys-color-text-muted)',
              cursor: 'pointer', padding: '0.5rem 1rem', fontWeight: activeTab === tab.id ? '600' : '400',
              borderBottom: activeTab === tab.id ? '2px solid var(--sys-color-primary)' : '2px solid transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sys-tab-content">
        {activeTab === 'branding' && renderBranding()}
        {activeTab === 'contact' && renderContact()}
        {activeTab === 'social' && renderSocial()}
        {activeTab === 'seo' && renderSeo()}
        {activeTab === 'about' && renderAbout()}
        {activeTab === 'footer' && renderFooter()}
      </div>
    </div>
  );
}