import React, { useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../components/Toast';

export function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      toast.success('Login successful');
      if (onLogin) onLogin(response.token, response.admin);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sys-login-wrapper sys-flex sys-items-center sys-justify-center sys-min-h-screen sys-bg-base sys-text-muted">
      <div className="sys-login-container sys-card sys-glass sys-max-w-md sys-w-full sys-p-8 sys-rounded-xl sys-shadow-lg sys-border sys-border-white-10">
        <div className="sys-login-header sys-text-center sys-mb-8">
          <h1 className="sys-text-3xl sys-font-bold sys-text-white sys-tracking-wider sys-mb-2">SANGATH</h1>
          <p className="sys-text-sm sys-font-mono sys-text-accent">Admin Console</p>
        </div>
        
        {error && (
          <div className="sys-alert sys-alert-error sys-mb-6 sys-p-3 sys-rounded sys-bg-error-10 sys-text-error sys-border sys-border-error-20">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="sys-space-y-4">
          <div className="sys-form-group">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Email</label>
            <input 
              type="email" 
              className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white focus:sys-border-accent focus:sys-outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="sys-form-group">
            <label className="sys-form-label sys-block sys-mb-1 sys-text-sm">Password</label>
            <div className="sys-relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="sys-input sys-w-full sys-p-2 sys-rounded sys-bg-surface sys-border sys-border-white-20 sys-text-white focus:sys-border-accent focus:sys-outline-none sys-pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="sys-absolute sys-right-2 sys-top-1/2 sys-transform sys--translate-y-1/2 sys-text-muted hover:sys-text-white"
                onClick={() => setShowPassword(!showPassword)}
                style={{ top: '50%', transform: 'translateY(-50%)', right: '0.5rem', position: 'absolute' }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="sys-btn sys-btn-primary sys-w-full sys-p-2 sys-rounded sys-bg-accent sys-text-base sys-font-bold hover:sys-bg-accent-hover sys-transition-colors disabled:sys-opacity-50 sys-mt-6"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}