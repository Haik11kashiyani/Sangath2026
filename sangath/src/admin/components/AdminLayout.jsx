import React, { useState, useEffect } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { ProductManager } from '../pages/ProductManager';
import { CategoryManager } from '../pages/CategoryManager';
import { PageEditor } from '../pages/PageEditor';
import { SiteSettings } from '../pages/SiteSettings';
import { SocialMediaManager } from '../pages/SocialMediaManager';
import { UserManager } from '../pages/UserManager';
import { ContactManager } from '../pages/ContactManager';
import { AuditLog } from '../pages/AuditLog';
import Badge from './Badge';
import { useToast } from './Toast';
import { apiClient } from '../utils/apiClient';

// Basic inline AdminDashboard component
function AdminDashboard({ admin }) {
  const [stats, setStats] = useState({ products: 0, categories: 0, pages: 0, users: 0, contacts: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.get('/admin/dashboard/stats');
        if (data) {
          setStats({
            products: data.products || 0,
            categories: data.categories || 0,
            pages: data.pages || 0,
            users: data.users || 0,
            contacts: data.submissions?.total || 0,
            recentActivity: data.recentActivity || []
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="sys-dashboard">
      <div className="sys-page-header">
        <h1 className="sys-page-title">Dashboard</h1>
        <p className="sys-page-subtitle">Welcome back, {admin?.email}</p>
      </div>

      <div className="sys-stats-grid">
        <div className="sys-stat-card">
          <div className="sys-stat-label">Products</div>
          <div className="sys-stat-value">{loading ? '-' : stats.products}</div>
        </div>
        <div className="sys-stat-card">
          <div className="sys-stat-label">Categories</div>
          <div className="sys-stat-value">{loading ? '-' : stats.categories}</div>
        </div>
        <div className="sys-stat-card">
          <div className="sys-stat-label">Pages</div>
          <div className="sys-stat-value">{loading ? '-' : stats.pages}</div>
        </div>
        <div className="sys-stat-card">
          <div className="sys-stat-label">Users</div>
          <div className="sys-stat-value">{loading ? '-' : stats.users}</div>
        </div>
        <div className="sys-stat-card">
          <div className="sys-stat-label">Contacts</div>
          <div className="sys-stat-value">{loading ? '-' : stats.contacts}</div>
        </div>
      </div>

      <div className="sys-dashboard-activity">
        <h2 className="sys-section-title">Recent Activity</h2>
        {loading ? (
          <div className="sys-loading-text">Loading...</div>
        ) : (
          <div className="sys-activity-list">
            {stats.recentActivity?.length > 0 ? (
              stats.recentActivity.map((log, i) => (
                <div key={i} className="sys-activity-item">
                  <span className="sys-activity-action">{log.action}</span>
                  <span className="sys-activity-user">{log.admin_email}</span>
                  <span className="sys-activity-time">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="sys-empty-text">No recent activity</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminLayout({ admin, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    // Fetch unread contact submissions
    const fetchContactCount = async () => {
      try {
        const res = await apiClient.get('/admin/contact-submissions');
        const data = res;
        if (Array.isArray(data)) {
          setContactCount(data.filter(c => c.status === 'new').length);
        }
      } catch (err) {
        console.error('Failed to fetch contact count', err);
      }
    };
    
    // Only fetch if token exists
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchContactCount();
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard admin={admin} />;
      case 'products':
        return <ProductManager />;
      case 'categories':
        return <CategoryManager />;
      case 'pages':
        return <PageEditor />;
      case 'settings':
        return <SiteSettings />;
      case 'social-media':
        return <SocialMediaManager />;
      case 'users':
        return <UserManager />;
      case 'contacts':
        return <ContactManager />;
      case 'audit-logs':
        return <AuditLog />;
      default:
        return <AdminDashboard admin={admin} />;
    }
  };

  const getPageTitle = (page) => {
    const titles = {
      'dashboard': 'Dashboard',
      'products': 'Products',
      'categories': 'Categories',
      'pages': 'Pages',
      'settings': 'Site Settings',
      'social-media': 'Social Media',
      'users': 'Users',
      'contacts': 'Contacts',
      'audit-logs': 'Audit Log'
    };
    return titles[page] || 'Dashboard';
  };

  const getInitials = (email) => {
    if (!email) return 'A';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="sys-root">
      <AdminNavigation
        currentPage={currentPage}
        onSelect={setCurrentPage}
        onLogout={onLogout}
        admin={admin}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        contactCount={contactCount}
      />
      
      <main className="sys-viewport">
        <header className="sys-header-bar">
          <div className="sys-header-left">
            <div className="sys-breadcrumb">
              {getPageTitle(currentPage)}
            </div>
          </div>
          <div className="sys-header-right">
            {admin && (
              <div className="sys-admin-profile">
                <Badge variant="primary" className="sys-role-badge">{admin.role || 'Admin'}</Badge>
                <div className="sys-admin-avatar">{getInitials(admin.email)}</div>
              </div>
            )}
          </div>
        </header>
        
        <div className="sys-content-area">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}