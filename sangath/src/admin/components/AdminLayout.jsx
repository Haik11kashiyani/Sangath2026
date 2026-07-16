import React, { useState } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { PageEditor } from '../pages/PageEditor';
import { ProductManager } from '../pages/ProductManager';
import { SocialMediaManager } from '../pages/SocialMediaManager';
import { SiteSettings } from '../pages/SiteSettings';

function AdminDashboard({ admin }) {
  return (
    <div className="dashboard">
      <h1>Welcome, {admin?.email}</h1>
      <p className="role-badge">Role: <strong>{admin?.role}</strong></p>
      <div className="dashboard-cards">
        <div className="card">
          <h3>📦 Products</h3>
          <p>Manage your product catalog</p>
        </div>
        <div className="card">
          <h3>📄 Pages</h3>
          <p>Edit website pages and content</p>
        </div>
        <div className="card">
          <h3>🔗 Social Media</h3>
          <p>Update social media links</p>
        </div>
        <div className="card">
          <h3>⚙️ Settings</h3>
          <p>Configure site settings</p>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout({ admin, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'pages':
        return <PageEditor />;
      case 'products':
        return <ProductManager />;
      case 'social-media':
        return <SocialMediaManager />;
      case 'settings':
        return <SiteSettings />;
      default:
        return <AdminDashboard admin={admin} />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminNavigation currentPage={currentPage} onSelect={setCurrentPage} onLogout={onLogout} />
      <main className="admin-content">
        {renderPage()}
      </main>
    </div>
  );
}
