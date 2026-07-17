import React, { useState } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { PageEditor } from '../pages/PageEditor';
import { ProductManager } from '../pages/ProductManager';
import { SocialMediaManager } from '../pages/SocialMediaManager';
import { SiteSettings } from '../pages/SiteSettings';
import { UserManager } from '../pages/UserManager';

export function AdminDashboard({ admin }) {
  return (
    <div className="sys-dashboard">
      <header className="sys-header">
        <div className="sys-header-meta">
          <span className="sys-status-dot"></span>
          SYS_STATUS // ADMIN_ACTIVE // LEVEL: {admin?.role}
        </div>
        <h1 className="sys-title">System Overview</h1>
        <p className="sys-subtitle">Session active under {admin?.email}</p>
      </header>
      
      <div className="sys-bento">
        <div className="sys-card">
          <div className="sys-card-top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <span className="sys-card-id">IDX // 001</span>
          </div>
          <div className="sys-card-bottom">
            <h3>Inventory</h3>
            <p>Manage product catalog structural parameters.</p>
          </div>
        </div>

        <div className="sys-card">
          <div className="sys-card-top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className="sys-card-id">IDX // 002</span>
          </div>
          <div className="sys-card-bottom">
            <h3>Content</h3>
            <p>Control structural text layers and pages.</p>
          </div>
        </div>

        <div className="sys-card">
          <div className="sys-card-top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span className="sys-card-id">IDX // 003</span>
          </div>
          <div className="sys-card-bottom">
            <h3>Network</h3>
            <p>Map external hyper-routing connections.</p>
          </div>
        </div>

        <div className="sys-card">
          <div className="sys-card-top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span className="sys-card-id">IDX // 004</span>
          </div>
          <div className="sys-card-bottom">
            <h3>System</h3>
            <p>Configure internal platform constants.</p>
          </div>
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
      case 'users':
        return <UserManager />;
      case 'social-media':
        return <SocialMediaManager />;
      case 'settings':
        return <SiteSettings />;
      default:
        return <AdminDashboard admin={admin} />;
    }
  };

  return (
    <div className="sys-root">
      <AdminNavigation currentPage={currentPage} onSelect={setCurrentPage} onLogout={onLogout} />
      <main className="sys-viewport">
        {renderPage()}
      </main>
    </div>
  );
}