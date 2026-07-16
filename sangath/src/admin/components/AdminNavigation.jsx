import React from 'react';

export function AdminNavigation({ currentPage, onSelect, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'pages', label: '📄 Pages' },
    { id: 'products', label: '📦 Products' },
    { id: 'social-media', label: '🔗 Social Media' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <nav className="admin-nav">
      <div className="nav-header">
        <h2>Sangath</h2>
        <p className="nav-subtitle">Admin Panel</p>
      </div>
      <ul className="nav-menu">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <button className="logout-btn" onClick={onLogout}>
        🚪 Logout
      </button>
    </nav>
  );
}
