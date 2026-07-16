import React, { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import './styles/admin.css';

export function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem('admin') || 'null'));

  const handleLogin = (newToken, adminData) => {
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setToken(newToken);
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
  };

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminLayout admin={admin} onLogout={handleLogout} />;
}

export default AdminApp;
